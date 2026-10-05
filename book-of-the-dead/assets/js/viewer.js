
(function(){
  const G=window.ANI_GEOM, P=window.ANI_PLATES, S=window.ANI_STAGES, B=window.ANI_BUDGE, TX=window.ANI_TEXT||{}, SP=window.ANI_SPELLS||{}, MAP=window.ANI_MAP;
  const $=id=>document.getElementById(id);
  const initialFragment=location.hash;
  let restoringFragment=false, applyingFragment=false;
  // The toolbar can wrap on narrow screens. Overlay offsets must use its actual height.
  const header=document.querySelector('header.top');
  function syncHeaderHeight(){
    const height=Math.ceil(header.getBoundingClientRect().height);
    const value=height+'px';
    if(document.documentElement.style.getPropertyValue('--topH')!==value){
      document.documentElement.style.setProperty('--topH',value);
    }
  }
  syncHeaderHeight();
  if(typeof ResizeObserver!=='undefined'){
    const headerObserver=new ResizeObserver(()=>{ syncHeaderHeight(); if(built) sizeEnglish(); });
    headerObserver.observe(header);
  }
  const wall=$('wall'), track=$('track'), art=$('art'), english=$('english'), mm=$('minimap'), mmImg=$('mmImg'), mmView=$('mmView'), mmStages=$('mmStages');
  const STAGE_COLORS=['#d9b45a','#b9533a','#7b9a6b','#6f8fb3','#b07aa8','#c88a4a','#5aa8a0','#a3a35a','#b86a6a','#7a9a9a','#c4a26a','#8a7ab8','#6aa36a','#a86a8a'];
  const stageOf={}; S.forEach((s,i)=>{s.color=STAGE_COLORS[i%STAGE_COLORS.length]; s.plates.forEach(n=>stageOf[n]=s);});
  const byN={}; P.forEach(p=>byN[p.n]=p);
  const tiles=G.tiles; const BAND=G.bandH;
  let cx=0; tiles.forEach(t=>{t.x=cx; cx+=t.w;});
  const TOTAL=G.totalW;
  const tileUrl=n=> window.ANI_TILE_URL? window.ANI_TILE_URL(n) : 'assets/scans/ani-'+String(n).padStart(2,'0')+'.webp';
  const lowUrl=()=> window.ANI_LOW_URL || 'assets/scans/ani-lowres.jpg';
  const budgeGroups=Object.keys(B).map(k=>({key:k, plates:B[k].plates, paras:B[k].paras}));
  const groupsFor=n=>budgeGroups.filter(g=>g.plates.includes(n));
  const blocksOf=n=>(TX[n]&&TX[n].blocks)||[];
  const blockById={}; Object.keys(TX).forEach(n=>blocksOf(+n).forEach(b=>{ b.n=+n; blockById[b.id]=b; }));

  let k=0.3, cur=1, journey=false, drawerOpen=false, built=false, mode='look', selBlock=null, selCol=-1, showBlocks=true, sideOpen=true;
  const isNarrow=()=>window.innerWidth<=760;
  const ENG_MIN=()=>{ const h=wall.clientHeight||600; return isNarrow()? Math.round(h*0.46) : Math.max(240, Math.min(380, Math.round(h*0.36))); };

  // ---- spell helpers
  const ROM={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  function romanToId(r){ if(!r) return null; const m=/^([IVXLCDM]+)([AB]?)$/.exec(r); if(!m) return null; let n=0; const s=m[1]; for(let i=0;i<s.length;i++){ const v=ROM[s[i]], nx=ROM[s[i+1]]||0; n+= v<nx? -v : v; } return String(n)+m[2]; }
  function spellOf(b){ if(b.spell&&SP[b.spell]) return b.spell; const id=romanToId(b.chap); if(id&&SP[id]) return id; if(b.spell) return b.spell; return id; }
  function nodeOf(b){ if(b.map) return b.map; const sp=spellOf(b); if(sp&&SP[sp]&&SP[sp].where) return SP[sp].where; return (TX[b.n]&&TX[b.n].map)||'duat'; }

  function initialScale(){
    const avail=wall.clientHeight||(window.innerHeight-116);
    const artH=Math.max(160, avail-ENG_MIN());
    return Math.max(0.12, Math.min(1, artH/G.wallH));
  }
  function sizeEnglish(){
    const artH=Math.round(G.wallH*k); const jb=journey? $('journey').offsetHeight : 0;
    const h=Math.max(140, wall.clientHeight-artH-1-jb);
    english.style.height=h+'px'; track.style.paddingBottom=jb+'px';
  }

  function panelHTML(n){
    const p=byN[n], st=stageOf[n]||{name:'',color:'#888'};
    const tabs='<div class="tabs"><button data-m="look"'+(mode==='look'?' class="on"':'')+'>Seeing</button><button data-m="says"'+(mode==='says'?' class="on"':'')+'>Text</button><button data-m="why"'+(mode==='why'?' class="on"':'')+'>Why</button><button data-m="all"'+(mode==='all'?' class="on"':'')+'>All</button></div>';
    const spells=(p.spells||[]).map(s=>'<span class="chip sp" data-n="'+n+'" title="Open the full text">'+(/^\d/.test(s)?'Spell '+s:s)+'</span>').join('');
    const figs=(p.hotspots||[]).map((hs,j)=>'<span class="chip fig" data-n="'+n+'" data-j="'+j+'">'+esc(hs.name)+'</span>').join('');
    const tbs=blocksOf(n).map(b=>'<span class="chip tb" data-b="'+b.id+'" title="Read this passage">'+esc(b.title)+'</span>').join('');
    return '<div class="ph"><span class="no">Sheet '+n+' of 37</span><span class="stage" style="border-color:'+st.color+';color:'+st.color+'">'+esc(st.name)+'</span>'+tabs+'</div>'+
      '<h2>'+esc(p.title)+'</h2>'+
      '<div class="meta">'+spells+'<span style="color:var(--ink3)">British Museum EA 10470, sheet '+n+'</span></div>'+
      '<div class="body"><p class="look"><b>What you are seeing</b>'+esc(p.look)+'</p><p class="says"><b>What the text says</b>'+esc(p.says)+'</p><p class="why"><b>Why it is here</b>'+esc(p.why)+'</p></div>'+
      (tbs?'<div class="figs"><span>Texts on this sheet:</span>'+tbs+'</div>':'')+
      (figs?'<div class="figs"><span>Figures:</span>'+figs+'</div>':'')+
      '<div class="ft"><button class="fulltext" data-n="'+n+'">Read the full 1895 translation of this sheet</button></div>';
  }
  let tileObserver=null;
  function build(){
    tileObserver?.disconnect();
    art.innerHTML=''; english.innerHTML='';
    const W=Math.round(TOTAL*k), H=Math.round(G.wallH*k);
    track.style.width=W+'px'; art.style.height=H+'px'; art.style.width=W+'px';
    art.classList.toggle('noblocks',!showBlocks);
    const low=G.low; const ls=(BAND*k)/low.bandH;
    const li=document.createElement('img'); li.className='lowres'; li.src=lowUrl(); li.alt='';
    li.style.left='0px'; li.style.top=Math.round(G.wallTop*k-low.top*ls)+'px'; li.style.width=Math.round(low.w*ls)+'px'; li.style.height=Math.round(low.h*ls)+'px';
    art.appendChild(li);
    const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const im=e.target; if(!im.src){im.onload=()=>im.classList.add('loaded'); im.src=im.dataset.src;} io.unobserve(im);}})},{root:wall, rootMargin:'0px 1200px 0px 1200px'});
    tileObserver=io;
    tiles.forEach((t,i)=>{
      const left=Math.round(t.x*k), top=Math.round((G.wallTop-t.top)*k), w=Math.round(t.w*k), h=Math.round(t.h*k);
      const im=document.createElement('img'); im.className='tile'; im.dataset.src=tileUrl(t.n); im.alt='Papyrus of Ani, sheet '+t.n;
      im.style.left=left+'px'; im.style.top=top+'px'; im.style.width=w+'px'; im.style.height=h+'px'; im.draggable=false;
      art.appendChild(im); io.observe(im);
      if(i>0){const sm=document.createElement('div'); sm.className='seam'; sm.style.left=left+'px'; art.appendChild(sm);}
      const no=document.createElement('div'); no.className='sheetno'; no.style.left=(left+8)+'px'; no.textContent='SHEET '+t.n; art.appendChild(no);
      const bandTop=Math.round((G.wallTop)*k);
      const place=(d,r)=>{ d.style.left=Math.round(left+r[0]*w)+'px'; d.style.width=Math.max(2,Math.round((r[1]-r[0])*w))+'px'; d.style.top=Math.round(bandTop+r[2]*BAND*k)+'px'; d.style.height=Math.max(2,Math.round((r[3]-r[2])*BAND*k))+'px'; };
      // text blocks
      blocksOf(t.n).forEach(b=>{
        b.rects.forEach((r,ri)=>{ const d=document.createElement('div'); d.className='blk'; d.dataset.b=b.id; place(d,r); if(ri===0) d.innerHTML='<span class="tag">'+esc(b.title)+'</span>'; art.appendChild(d); });
        if(b.cols){ b.cols.forEach((c,ci)=>{ const d=document.createElement('div'); d.className='col'; d.dataset.b=b.id; d.dataset.c=ci; place(d,c); d.title=b.title+(b.nums?' · column '+b.nums[ci]:''); d.setAttribute('role','button'); d.setAttribute('aria-label',b.title+' · annotated column '+(ci+1)); art.appendChild(d); }); }
        else { b.rects.forEach(r=>{ const d=document.createElement('div'); d.className='rect'; d.dataset.b=b.id; d.dataset.c=-1; place(d,r); d.title=b.title; art.appendChild(d); }); }
      });
      // hotspots
      const p=byN[t.n];
      (p&&p.hotspots||[]).forEach((hs,j)=>{
        const d=document.createElement('div'); d.className='hot';
        d.style.left=Math.round(left+hs.x[0]*w)+'px'; d.style.width=Math.round((hs.x[1]-hs.x[0])*w)+'px';
        d.style.top=Math.round(bandTop+hs.y[0]*BAND*k)+'px'; d.style.height=Math.round((hs.y[1]-hs.y[0])*BAND*k)+'px';
        d.dataset.n=t.n; d.dataset.j=j; d.innerHTML='<span class="tag">'+esc(hs.name)+'</span>';
        d.addEventListener('click',ev=>{ev.stopPropagation(); openPop(d, hs);});
        art.appendChild(d);
      });
      if(!isNarrow()){
        const sec=document.createElement('section'); sec.className='panel'; sec.id='panel-'+t.n; sec.dataset.n=t.n;
        sec.style.left=left+'px'; sec.style.width=w+'px';
        sec.innerHTML=panelHTML(t.n);
        english.appendChild(sec);
      }
    });
    if(isNarrow()){
      const sec=document.createElement('section'); sec.className='panel mobile'; sec.id='panel-mobile';
      sec.style.position='sticky'; sec.style.left='0'; sec.style.width=wall.clientWidth+'px'; sec.style.borderRight='0';
      sec.innerHTML=panelHTML(cur); english.appendChild(sec);
    }
    english.dataset.mode=mode; sizeEnglish();
    buildMinimap(); built=true; markCurrent(cur,true);
    if(selBlock) paintSel();
  }
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  // block hover: light up the whole block
  art.addEventListener('mouseover',e=>{ const c=e.target.closest('.col,.rect'); if(!c) return; art.querySelectorAll('.blk.hov').forEach(d=>d.classList.remove('hov')); art.querySelectorAll('.blk[data-b="'+c.dataset.b+'"]').forEach(d=>d.classList.add('hov')); });
  art.addEventListener('mouseout',e=>{ const c=e.target.closest('.col,.rect'); if(!c) return; art.querySelectorAll('.blk.hov').forEach(d=>d.classList.remove('hov')); });
  art.addEventListener('click',e=>{ const c=e.target.closest('.col,.rect'); if(!c) return; e.stopPropagation(); openReader(c.dataset.b, +c.dataset.c); });

  function buildMinimap(){
    mmImg.src=lowUrl();
    mmStages.innerHTML='';
    S.forEach(s=>{
      const first=tiles.find(t=>t.n===s.plates[0]), last=tiles.find(t=>t.n===s.plates[s.plates.length-1]);
      const l=first.x/TOTAL*100, r=(last.x+last.w)/TOTAL*100;
      const d=document.createElement('div'); d.className='mm-stage'; d.style.left=l+'%'; d.style.width=(r-l-0.15)+'%'; d.style.background=s.color; d.title=s.name;
      d.innerHTML='<span>'+esc(s.name)+'</span>'; mmStages.appendChild(d);
    });
  }
  function updateMinimap(){
    const f=wall.scrollLeft/track.offsetWidth, fw=wall.clientWidth/track.offsetWidth;
    mmView.style.left=(f*100)+'%'; mmView.style.width=Math.max(0.4,fw*100)+'%';
  }
  mm.addEventListener('click',e=>{
    const r=mm.getBoundingClientRect(); const f=(e.clientX-r.left)/r.width;
    wall.scrollLeft=f*track.offsetWidth-wall.clientWidth/2;
  });

  function plateAt(scrollX){
    const px=(scrollX+wall.clientWidth*0.35)/k;
    let t=tiles[0]; for(const u of tiles){ if(u.x<=px) t=u; } return t.n;
  }
  function markCurrent(n,force){
    if(n===cur&&!force) return; cur=n;
    english.querySelectorAll('.panel.cur').forEach(s=>s.classList.remove('cur'));
    const sec=$('panel-'+n); if(sec) sec.classList.add('cur');
    const mp=$('panel-mobile'); if(mp){ mp.innerHTML=panelHTML(n); mp.scrollTop=0; }
    const st=stageOf[n], p=byN[n];
    $('where').innerHTML='<span style="color:'+st.color+'">●</span> <b>'+esc(st.name)+'</b> · Sheet '+n+' · '+esc(p.title);
    if(drawerOpen) fillDrawer(n);
    if(journey) fillJourney(n);
    // An open passage owns map focus; intermediate sheet-scroll events must not overwrite it.
    if(!selBlock||!reader.classList.contains('on')){ const node=(TX[n]&&TX[n].map)||'duat'; if(MAP) MAP.focus(node,{label:'Sheet '+n+' · Passage context',note:(MAP.byId[node]&&MAP.byId[node].what)||''}); }
    if(!selBlock && !restoringFragment) writeFragment('#sheet-'+n,false);
  }
  let raf=false;
  wall.addEventListener('scroll',()=>{ if(raf) return; raf=true; requestAnimationFrame(()=>{raf=false; updateMinimap(); markCurrent(plateAt(wall.scrollLeft));}); });

  wall.addEventListener('wheel',e=>{
    if(e.ctrlKey) return;
    if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ wall.scrollLeft+=e.deltaY; e.preventDefault(); }
  },{passive:false});
  let drag=null;
  art.addEventListener('pointerdown',e=>{ if(e.button!==0) return; drag={x:e.clientX,sl:wall.scrollLeft,moved:false}; wall.classList.add('dragging'); });
  window.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.x; if(Math.abs(dx)>3) drag.moved=true; wall.scrollLeft=drag.sl-dx; });
  window.addEventListener('pointerup',()=>{ if(drag){ drag=null; wall.classList.remove('dragging'); } });
  window.addEventListener('keydown',e=>{
    if(document.querySelector('dialog[open]') || e.target?.isContentEditable || (e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return;
    if(e.key==='ArrowRight'){ goTo(Math.min(37,cur+1)); e.preventDefault(); }
    else if(e.key==='ArrowLeft'){ goTo(Math.max(1,cur-1)); e.preventDefault(); }
    else if(e.key==='Escape'){ if(journey) stopJourney(); closePop(); if(drawerOpen) toggleDrawer(false); closeReader(); }
    else if(e.key==='Home'){ goTo(1);} else if(e.key==='End'){ goTo(37);}
  });
  function goTo(n){
    const t=tiles.find(u=>u.n===n); if(!t) return;
    const tw=t.w*k, vw=wall.clientWidth;
    let x=t.x*k - (tw<vw? (vw-tw)/2 : 24);
    wall.scrollLeft=Math.max(0,x);
    setTimeout(()=>markCurrent(n,true),50);
  }
  function scrollToBlock(b){ const t=tiles.find(u=>u.n===b.n); if(!t) return; const r=b.rects[0]; const xc=(t.x+r[0]*t.w+(r[1]-r[0])*t.w/2)*k; wall.scrollLeft=Math.max(0,xc-wall.clientWidth/2); setTimeout(()=>markCurrent(b.n,true),50); }

  // ---- popover (figures)
  const pop=$('pop');
  function openPop(el, hs){
    art.querySelectorAll('.hot.on').forEach(d=>d.classList.remove('on')); el.classList.add('on');
    $('popT').textContent=hs.name; $('popB').textContent=hs.note;
    // link to the text/vignette block under this figure, if the text layer has one
    const pm=$('popMore'); pm.innerHTML='';
    try{ const hr=el.getBoundingClientRect(); const cx=hr.left+hr.width/2, cy=hr.top+hr.height/2; let hit=null;
      art.querySelectorAll('.rect[data-b="'+el.dataset.n+'-"], .rect[data-b^="'+el.dataset.n+'-"], .col[data-b^="'+el.dataset.n+'-"]').forEach(q=>{ if(hit) return; const r=q.getBoundingClientRect(); if(cx>=r.left&&cx<=r.right&&cy>=r.top&&cy<=r.bottom) hit=q; });
      if(hit&&blockById[hit.dataset.b]){ const b=blockById[hit.dataset.b]; const a=document.createElement('a'); a.href='#'; a.className='popLink'; a.textContent='Read: '+(b.title||'this passage')+' ›'; a.addEventListener('click',ev=>{ ev.preventDefault(); closePop(); openReader(b.id,-1); }); pm.appendChild(a); }
    }catch(_){}
    pop.style.display='block';
    const r=el.getBoundingClientRect(); let x=r.left, y=r.bottom+8;
    const pw=pop.offsetWidth, ph=pop.offsetHeight;
    if(x+pw>window.innerWidth-10) x=window.innerWidth-pw-10; if(x<10) x=10;
    if(y+ph>window.innerHeight-10) y=Math.max(10,r.top-ph-8);
    pop.style.left=x+'px'; pop.style.top=y+'px';
  }
  function closePop(){ pop.style.display='none'; art.querySelectorAll('.hot.on').forEach(d=>d.classList.remove('on')); }
  $('popX').addEventListener('click',closePop);
  document.addEventListener('click',e=>{ if(!pop.contains(e.target)&&!e.target.closest('.hot')&&!e.target.closest('.fig')) closePop(); });
  wall.addEventListener('scroll',closePop);
  english.addEventListener('mouseover',e=>{const c=e.target.closest('.fig'); if(!c) return; const d=art.querySelector('.hot[data-n="'+c.dataset.n+'"][data-j="'+c.dataset.j+'"]'); if(d) d.classList.add('on');});
  english.addEventListener('mouseout',e=>{const c=e.target.closest('.fig'); if(!c) return; if(pop.style.display==='block') return; art.querySelectorAll('.hot.on').forEach(d=>d.classList.remove('on'));});
  english.addEventListener('click',e=>{
    const tb=e.target.closest('.tabs button'); if(tb){ mode=tb.dataset.m; english.dataset.mode=mode; english.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode)); return; }
    const c=e.target.closest('.fig'); if(c){ const n=+c.dataset.n, j=+c.dataset.j; const d=art.querySelector('.hot[data-n="'+n+'"][data-j="'+j+'"]'); if(d){ openPop(d, byN[n].hotspots[j]); } return; }
    const tbk=e.target.closest('.tb'); if(tbk){ openReader(tbk.dataset.b,-1); const b=blockById[tbk.dataset.b]; if(b) scrollToBlock(b); return; }
    const sp=e.target.closest('.sp'); if(sp){ fillDrawer(+sp.dataset.n); toggleDrawer(true); return; }
    const ft=e.target.closest('.fulltext'); if(ft){ fillDrawer(+ft.dataset.n); toggleDrawer(true); return; }
  });

  // ---- side panel: map + reader
  const side=$('side'), reader=$('reader'), legendHost=$('legendHost'), nodeList=$('nodeList');
  function showTab(which){ $('tabLegend').classList.toggle('on',which==='legend'); $('tabReader').classList.toggle('on',which==='reader'); legendHost.style.display=which==='legend'?'':'none'; nodeList.style.display='none'; reader.classList.toggle('on',which==='reader'); }
  $('tabLegend').addEventListener('click',()=>showTab('legend'));
  $('tabReader').addEventListener('click',()=>{showTab('reader');if(selBlock&&MAP)MAP.focus(nodeOf(selBlock));});
  function openSide(){ sideOpen=true; side.classList.remove('hidden'); $('btnMap').classList.add('active'); }
  $('btnMap').addEventListener('click',()=>{ sideOpen=!sideOpen; side.classList.toggle('hidden',!sideOpen); $('btnMap').classList.toggle('active',sideOpen); if(!isNarrow()) setTimeout(()=>window.dispatchEvent(new Event('resize')),10); });
  $('btnBlocks').addEventListener('click',()=>{ showBlocks=!showBlocks; art.classList.toggle('noblocks',!showBlocks); $('btnBlocks').classList.toggle('active',showBlocks); });
  if(MAP){
    MAP.init($('mapHost'),{onSelect:id=>listNode(id)});
    // move the legend list under the tabs
    const lst=$('mapHost').querySelector('.mapList'); if(lst){ legendHost.appendChild(lst); }
  }
  function listNode(id){
    if(MAP)MAP.focus(id);
    const node=MAP.byId[id]; const items=[]; Object.keys(TX).forEach(n=>blocksOf(+n).forEach(b=>{ if(nodeOf(b)===id) items.push(b); }));
    items.sort((a,b)=>a.n-b.n);
    let html='<h4>'+esc(node.name)+'</h4><p>'+esc(node.what)+'</p>'+(items.length?'<p style="color:var(--ink3)">Passages linked here in the current editorial mapping (review pending):</p>':'<p style="color:var(--ink3)">No passage is assigned to this place in the current dataset. This is not evidence that it is absent from the manuscript.</p>');
    items.forEach(b=>{ const sp=spellOf(b); html+='<div class="it" data-b="'+b.id+'">'+esc(b.title)+'<small>Sheet '+b.n+(sp&&SP[sp]?' · '+esc(SP[sp].name):'')+'</small></div>'; });
    nodeList.innerHTML=html; $('tabLegend').classList.remove('on'); $('tabReader').classList.remove('on'); legendHost.style.display='none'; reader.classList.remove('on'); nodeList.style.display='block';
    nodeList.scrollTop=0; if(isNarrow()) openSide();
  }
  nodeList.addEventListener('click',e=>{ const it=e.target.closest('.it'); if(!it) return; const b=blockById[it.dataset.b]; if(!b) return; scrollToBlock(b); openReader(b.id,-1); });

  function paintSel(){ art.querySelectorAll('.col.sel,.rect.sel,.blk.sel').forEach(d=>d.classList.remove('sel')); if(!selBlock) return; art.querySelectorAll('.blk[data-b="'+selBlock.id+'"]').forEach(d=>d.classList.add('sel')); if(selCol>=0){ const c=art.querySelector('.col[data-b="'+selBlock.id+'"][data-c="'+selCol+'"]'); if(c) c.classList.add('sel'); } else { art.querySelectorAll('.rect[data-b="'+selBlock.id+'"]').forEach(d=>d.classList.add('sel')); } }
  function openReader(id, ci){
    const b=blockById[id]; if(!b) return; selBlock=b; selCol=(Number.isInteger(ci)&&ci>=0&&b.cols&&ci<b.cols.length)?ci:-1; paintSel(); closePop();
    const sp=spellOf(b); const spd=sp&&SP[sp]; const node=nodeOf(b); const nd=MAP&&MAP.byId[node];
    const numHere=(selCol>=0&&b.nums)? b.nums[selCol] : null;
    let html='<div class="rno"><span>Sheet '+b.n+(b.cols?' · '+(selCol>=0?'column '+(selCol+1)+' of '+b.cols.length:b.cols.length+' columns'):'')+'</span><button id="rX" title="Close">×</button></div>';
    html+='<h3>'+esc(b.title)+'</h3><div class="readerTools"><button id="rCopy" type="button">Copy passage link</button><span id="rCopyStatus" role="status"></span></div>';
    html+='<div class="rmeta">'+(spd?'<span class="chip">'+esc(spd.name)+'</span>':(b.chap?'<span class="chip">Chapter '+esc(b.chap)+'</span>':''))+(nd?'<span class="chip map" data-node="'+node+'">Map: '+esc(nd.short)+'</span>':'')+'</div>';
    if(b.cols&&b.cols.length>1){ html+='<div class="cols">'+b.cols.map((c,i)=>'<span data-c="'+i+'"'+(i===selCol?' class="on"':'')+' title="Column '+(i+1)+(b.nums?' · Budge line '+b.nums[i]:'')+'">'+(b.nums?b.nums[i]:(i+1))+'</span>').join('')+'</div>'; }
    if(b.vigText&&(b.vig||!b.segs.length)) html+='<p class="vig">'+esc(b.vigText)+'</p>';
    // text with segments
    let txt='', curP=-1;
    b.segs.forEach((s,i)=>{ if(s.p!==curP){ if(curP>=0) txt+='</p>'; txt+='<p>'; curP=s.p; } const hi=(numHere!=null&&s.n===numHere); txt+='<span class="seg'+(hi?' hi':'')+'" data-n="'+(s.n==null?'':s.n)+'">'+(s.n!=null?'<span class="n">'+s.n+'</span>':'')+esc(s.t)+' </span>'; });
    if(curP>=0) txt+='</p>';
    if(!b.segs.length&&b.vigText&&!b.vig) txt='<p>'+esc(b.vigText)+'</p>';
    html+='<div class="txt">'+txt+'</div>';
    if(spd) html+='<div class="anal"><b>What this is</b>'+esc(spd.why)+'</div>';
    if(nd) html+='<div class="anal"><b>Interpretive map association</b>'+esc(nd.name)+'. '+esc(nd.what)+'</div>';
    html+='<div class="nav"><button id="rPrev">← Previous passage</button><button id="rNext">Next passage →</button></div>';
    html+='<p class="here" style="color:var(--ink3);font-size:11px">Translation: E. A. Wallis Budge, 1895 (public domain); his column numbers are shown in blue. The outline on the painting is approximate; numbered text highlights may also be approximate. The spatial association is editorial and awaits source review. <a href="assets/research.html" target="_blank" rel="noopener">Sources &amp; method</a>.</p>';
    reader.innerHTML=html; showTab('reader'); $('sideBody').scrollTop=0;
    const hiEl=reader.querySelector('.seg.hi'); if(hiEl){ hiEl.scrollIntoView({block:'nearest'}); }
    if(MAP){ MAP.focus(node,{label:'Sheet '+b.n+' · Passage context',note:nd?nd.what:''}); }
    openSide();
    if(!restoringFragment) writeFragment(passageFragment(),true);
    document.dispatchEvent(new CustomEvent('ani:selection',{detail:{id:b.id,column:selCol+1}}));
  }
  function closeReader(){ selBlock=null; selCol=-1; paintSel(); reader.classList.remove('on'); showTab('legend'); markCurrent(cur,true); }
  reader.addEventListener('click',e=>{
    if(e.target.id==='rX'){ closeReader(); return; }
    const cs=e.target.closest('.cols span'); if(cs&&selBlock){ openReader(selBlock.id,+cs.dataset.c); return; }
    const mp=e.target.closest('.chip.map'); if(mp){ listNode(mp.dataset.node); return; }
    if(e.target.id==='rPrev'||e.target.id==='rNext'){ const all=[]; Object.keys(TX).map(Number).sort((a,b)=>a-b).forEach(n=>blocksOf(n).forEach(b=>all.push(b))); const i=all.indexOf(selBlock); const j=e.target.id==='rPrev'?i-1:i+1; if(j>=0&&j<all.length){ scrollToBlock(all[j]); openReader(all[j].id,-1); } }
  });

  // ---- drawer
  const drawer=$('drawer');
  function toggleDrawer(open){ drawerOpen=open; drawer.classList.toggle('open',open); $('btnText').classList.toggle('active',open); if(open) fillDrawer(cur); }
  $('btnText').addEventListener('click',()=>toggleDrawer(!drawerOpen));
  $('dClose').addEventListener('click',()=>toggleDrawer(false));
  let drawerN=0;
  $('dPrev').addEventListener('click',()=>{ if(drawerN>1) goTo(drawerN-1); });
  $('dNext').addEventListener('click',()=>{ if(drawerN<37) goTo(drawerN+1); });
  function fillDrawer(n){
    if(drawerN===n) return; drawerN=n;
    const p=byN[n]; $('dTitle').textContent='Sheet '+n+' · '+p.title;
    const gs=groupsFor(n); let html='<div class="note">Budge\'s running translation of the hieroglyphic text on this sheet, with his descriptions of the pictures (“Vignette”). His 1895 spellings are kept: Tmu = Atum, Seb = Geb, Thuthu = Tutu, Annu = Heliopolis, Tattu = Busiris, Abtu = Abydos, Amenta = the West, Sekhet-hetepu / Sekhet-Aaru = Field of Offerings / Field of Reeds, Khepera = Khepri, Apep = Apophis, Sut = Seth, Neter-khert = realm of the dead. Chapter numbers in brackets are the spell numbers. Words in square brackets are Budge\'s restorations.</div>';
    gs.forEach(g=>{
      const lab=g.plates.length>1?('Budge\'s text for sheets '+g.plates[0]+'–'+g.plates[g.plates.length-1]+' (one section)'):'Budge\'s text for sheet '+g.plates[0];
      html+='<h4>'+esc(lab)+'</h4>';
      g.paras.forEach((para,i)=>{
        if(i===0&&/^PLATES?\b/.test(para)) return;
        let cls=''; if(/^(Vignette|Vignettes)\b/.test(para)) cls='vig';
        if(/^(PLATE|Text:?$|Vignette:?$|Vignettes:?$)/.test(para.trim())&&para.trim().length<30) cls='head';
        html+='<p class="'+cls+'">'+esc(para)+'</p>';
      });
    });
    $('dBody').innerHTML=html; $('dBody').scrollTop=0;
  }

  // ---- journey
  const stops=tiles.map(t=>t.n);
  function startJourney(){ closeReader(); journey=true; $('journey').classList.add('on'); sizeEnglish(); $('btnJourney').textContent='Journey: on'; $('btnJourney').classList.add('active'); goTo(cur||1); fillJourney(cur||1); $('hint').classList.add('gone'); }
  function stopJourney(){ journey=false; $('journey').classList.remove('on'); sizeEnglish(); $('btnJourney').textContent='Begin the journey'; $('btnJourney').classList.remove('active'); }
  function fillJourney(n){
    const st=stageOf[n], p=byN[n]; const i=stops.indexOf(n);
    $('jStage').textContent=st.name+' · stage '+(S.indexOf(st)+1)+' of '+S.length;
    $('jTitle').textContent='Sheet '+n+': '+p.title;
    $('jBlurb').textContent=(st.plates[0]===n? st.blurb : p.why);
    $('jCount').textContent=(i+1)+' / '+stops.length;
    $('jBar').style.width=((i+1)/stops.length*100)+'%';
    $('jPrev').disabled=i===0; $('jNext').textContent=i===stops.length-1?'Finish':'Next →';
  }
  $('btnJourney').addEventListener('click',()=>{ if(journey) stopJourney(); else startJourney(); });
  $('jPrev').addEventListener('click',()=>goTo(Math.max(1,cur-1)));
  $('jNext').addEventListener('click',()=>{ if(cur>=37) stopJourney(); else goTo(cur+1); });
  $('jExit').addEventListener('click',stopJourney);

  // ---- zoom
  function rescale(nk){
    const kmax=Math.min(1,(wall.clientHeight-150)/G.wallH);
    nk=Math.max(0.12,Math.min(kmax,nk)); if(nk===k) return;
    const f=(wall.scrollLeft+wall.clientWidth/2)/track.offsetWidth;
    k=nk; build(); updateMinimap();
    wall.style.scrollBehavior='auto'; wall.scrollLeft=f*track.offsetWidth-wall.clientWidth/2; wall.style.scrollBehavior='';
  }
  $('zoomIn').addEventListener('click',()=>rescale(k*1.25));
  $('zoomOut').addEventListener('click',()=>rescale(k/1.25));
  $('btnFull').addEventListener('click',()=>{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(()=>{}); });
  $('btnAbout').addEventListener('click',()=>$('about').classList.add('open'));
  $('aboutClose').addEventListener('click',()=>$('about').classList.remove('open'));
  $('about').addEventListener('click',e=>{ if(e.target===$('about')) $('about').classList.remove('open'); });

  let rt; window.addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{ const f=(wall.scrollLeft+wall.clientWidth/2)/track.offsetWidth; k=Math.min(k, initialScale()>k?k:initialScale()); build(); wall.style.scrollBehavior='auto'; wall.scrollLeft=f*track.offsetWidth-wall.clientWidth/2; wall.style.scrollBehavior=''; updateMinimap(); },150); });

  // ---- init
  if(isNarrow()){ sideOpen=false; side.classList.add('hidden'); $('btnMap').classList.remove('active'); }
  // Stable links use a one-based annotated column index, NOT Budge's printed number.
  function passageFragment(){return selBlock?'#b='+encodeURIComponent(selBlock.id)+(selCol>=0?'&c='+(selCol+1):''):'#sheet-'+cur;}
  function writeFragment(hash,push){
    if(restoringFragment || location.hash===hash)return;
    try{history[push?'pushState':'replaceState'](null,'',hash);}catch(e){/* Embedded QA contexts may disallow history writes. */}
  }
  function applyFragment(fragment){
    if(applyingFragment)return;
    applyingFragment=true; restoringFragment=true;
    const oldBehavior=wall.style.scrollBehavior;wall.style.scrollBehavior='auto';
    try{
      const sheet=/^#sheet-(\d+)$/.exec(fragment||'');
      const params=new URLSearchParams((fragment||'').replace(/^#/,''));
      const id=params.get('b'), b=blockById[id];
      if(b){
        const n=Number(params.get('c'));const ci=Number.isInteger(n)&&n>0&&b.cols&&n<=b.cols.length?n-1:-1;
        scrollToBlock(b);openReader(b.id,ci);markCurrent(b.n,true);
      }else{
        selBlock=null;selCol=-1;paintSel();reader.classList.remove('on');showTab('legend');
        const n=sheet?Math.max(1,Math.min(37,Number(sheet[1]))):1;goTo(n);markCurrent(n,true);
      }
    }finally{restoringFragment=false;applyingFragment=false;wall.style.scrollBehavior=oldBehavior;}
  }
  k=initialScale(); build();
  window.ANI_VIEWER={
    version:'2.5.0',
    open(id,column=0){const b=blockById[id];if(!b)return false;scrollToBlock(b);openReader(id,column>0?column-1:-1);return true;},
    selection(){return {id:selBlock?.id||null,column:selCol+1,sheet:cur};},
    fragment:passageFragment,
    link(){return location.href.split('#')[0]+passageFragment();},
    blocks(){return Object.values(blockById).map(b=>({id:b.id,sheet:b.n,title:b.title,spell:spellOf(b),text:(b.paras||[]).join(' '),guide:SP[spellOf(b)]?.why||''}));}
  };
  window.addEventListener('hashchange',()=>applyFragment(location.hash));
  window.addEventListener('popstate',()=>applyFragment(location.hash));
  setTimeout(()=>{updateMinimap();applyFragment(initialFragment);document.dispatchEvent(new Event('ani:ready'));},30);
  setTimeout(()=>$('hint').classList.add('gone'),9000);
  wall.addEventListener('scroll',()=>$('hint').classList.add('gone'),{once:true});
})();
