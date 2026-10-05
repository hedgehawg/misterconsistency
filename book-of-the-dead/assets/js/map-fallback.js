/* v2.3 PREVIEW: a three-dimensional interpretive map for the Papyrus of Ani.
   Rendered in plain SVG with a tiny projection engine (no libraries).
   Layout is an interpretation: the Book of the Dead never draws one map; this one stacks
   the places the spells name into floors, from the land of the living down to the night river. */
(function(){
  const NODES=[
    {id:'thebes',  floor:0, name:'Thebes, the land of the living', short:'Thebes', p:[5.2,0,1.2],
      what:'Ani\'s house, the temple of Amun where Tutu sang, the granaries he kept accounts for. The roll was written here, for a man who was still alive.'},
    {id:'cities',  floor:0, name:'The holy cities: Heliopolis, Busiris, Abydos', short:'Holy cities', p:[8.6,0,-1.6],
      what:'The cult centres whose councils of gods judged Osiris\'s own case. Spell 18 asks Thoth to win Ani\'s case before each of them in turn.'},
    {id:'west',    floor:0, name:'The Western horizon (Manu)', short:'West horizon', p:[-11,0.6,0],
      what:'Where the sun sets and the dead go in. Hathor as a cow steps out of the Theban cliff to receive them; the evening boat of Ra passes through the mountain into the Duat.'},
    {id:'east',    floor:0, name:'The Eastern horizon (Bakhu)', short:'East horizon', p:[11.6,0.6,0],
      what:'Where Ra is reborn each morning and where the justified dead "come forth by day", free to leave the tomb and return to the world of light.'},
    {id:'sky',     floor:0, name:'The sky of Nut and the stars', short:'The sky', p:[0,8.2,0],
      what:'The body of the sky goddess. The blessed may ride here in the boat of the sun, become imperishable stars, or fly as a falcon, a swallow or a phoenix.'},
    {id:'tomb',    floor:1, name:'The tomb in the Western cliffs', short:'The tomb', p:[-7.2,-3,0],
      what:'The burial chamber: the mummy, the four sons of Horus at the corners, the amulets at the throat and heart. The spells for keeping the heart, breathing, and letting the soul out all start here.'},
    {id:'sycamore',floor:1, name:'The sycamore of Nut', short:'Sycamore', p:[-1,-3,2.2],
      what:'A pool of cool water under a tree, where the goddess in the sycamore gives the dead water to drink and air to breathe (Spell 59).'},
    {id:'rosetau', floor:1, name:'Rosetau, the passages', short:'Rosetau', p:[-3.6,-3.6,-1.2],
      what:'"The mouth of the passages": the tunnels of the necropolis of Sokar through which the dead descend. Spell 17 and the gate spells both name it.'},
    {id:'arits',   floor:2, name:'The Seven Arits (gates)', short:'Seven gates', p:[-1.6,-6,0],
      what:'Seven gateways, each held by a doorkeeper, a watcher and a herald with names like "He who lives on snakes". The password is their names (Spell 147).'},
    {id:'pylons',  floor:2, name:'The Ten Pylons of the House of Osiris', short:'Ten pylons', p:[3.2,-6,0],
      what:'Ten towered gates, each a goddess with a terrible name and a knife-bearing guardian, between the gates and the hall of judgment (Spell 146).'},
    {id:'hall',    floor:3, name:'The Hall of Two Truths', short:'Hall of Two Truths', p:[7.4,-9,0],
      what:'The judgment hall. Anubis weighs the heart against the feather of Maat, Thoth records, Ammit the Devourer waits, and forty-two assessors hear the Negative Confession (Spells 30B, 125, 42).'},
    {id:'throne',  floor:3, name:'The throne of Osiris', short:'Throne of Osiris', p:[10.6,-9,0],
      what:'Osiris enthroned in his shrine with Isis and Nephthys behind him and the four sons of Horus on a lotus. Horus leads the justified Ani here; the hymns to Osiris are sung to this seat.'},
    {id:'lake',    floor:3, name:'The Lake of Fire', short:'Lake of Fire', p:[4,-9,2.6],
      what:'A square lake of flame guarded by four baboons. Refreshment for the justified, destruction for the condemned; the water spells promise the dead will not be scalded (Spells 63, 126).'},
    {id:'fields',  floor:3, name:'Sekhet-hetepet, the Field of Reeds', short:'Field of Reeds', p:[7.4,-8,-6],
      what:'Paradise as an ideal Egypt: islands and canals, barley seven cubits high, boats, the gods of the field. Ani ploughs, reaps and rests here (Spell 110).'},
    {id:'boat',    floor:4, name:'The night boat of Ra', short:'Boat of Ra', p:[0,-12,0],
      what:'The sun god crosses the Duat by night on an underground river. The dead ask for a seat in the boat, steer with its rudders and help spear the serpent Apep (Spell 15, 133, 134).'},
    {id:'duat',    floor:2, name:'The Duat as a whole', short:'The Duat', p:[0,-7.6,-2.4], region:true,
      what:'The hidden land under the earth, through which Ra travels by night and the dead must pass. Spell 17 and the transformation spells roam through all of it.'}
  ];
  const FLOORS=[
    {n:0, name:'The land of the living', y:0},
    {n:1, name:'The threshold', y:-3},
    {n:2, name:'The gauntlet', y:-6},
    {n:3, name:'The court and the reward', y:-9},
    {n:4, name:'The night river', y:-12}
  ];
  // Editorial navigation route, not a canonical sequence or measured ancient floor plan.
  const PATH=['thebes','tomb','rosetau','arits','pylons','hall','throne','fields','boat','east'];
  const byId={}; NODES.forEach(n=>byId[n.id]=n);

  // ---------- scene geometry ----------
  // Each shape: {pts:[[x,y,z],...], fill, stroke, w, depthBias}
  const shapes=[];
  function quad(a,b,c,d,fill,stroke,extra){ shapes.push(Object.assign({pts:[a,b,c,d],fill,stroke:stroke||null},extra||{})); }
  function slab(x0,x1,z0,z1,y,fill,stroke,extra){ quad([x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],fill,stroke,extra); }
  function box(x0,x1,y0,y1,z0,z1,top,side,stroke){ // top + 4 sides
    slab(x0,x1,z0,z1,y1,top,stroke);
    quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],side,stroke); // front
    quad([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],side,stroke); // back
    quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],side,stroke); // left
    quad([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],side,stroke); // right
  }
  const C={ground:'#6d5a3a',ground2:'#5a4a30',cliff:'#4e4232',nile:'#2f6f8a',rock:'#3a3128',rock2:'#2e271f',floor1:'#4a3f33',floor2:'#3f3630',floor3:'#352e29',river:'#1d4d6b',field:'#4f7a46',field2:'#3d6336',water:'#2a6a86',fire:'#b9533a',gold:'#d9b45a',stone:'#7a6a55',stone2:'#5e5143',line:'#1a1612'};
  // Floor 0: land
  slab(-12,12,-3.2,3.2,0,C.ground,C.line);
  slab(2.0,3.4,-3.2,3.2,0.02,C.nile,null,{depthBias:0.05});           // the Nile
  // cliffs of the west, mountains of the horizons
  quad([-12,0,-3.2],[-9,0,-3.2],[-10.5,2.6,-2.2],[-12,2.6,-2.2],C.cliff,C.line); // west cliff back
  quad([-12,0,3.2],[-9,0,3.2],[-10.5,2.6,2.2],[-12,2.6,2.2],C.cliff,C.line);   // west cliff front
  quad([-12,2.6,-2.2],[-10.5,2.6,-2.2],[-10.5,2.6,2.2],[-12,2.6,2.2],C.rock,C.line);
  quad([9.6,0,-3.2],[12,0,-3.2],[12,2.2,-2.2],[10.6,2.2,-2.2],C.cliff,C.line);
  quad([9.6,0,3.2],[12,0,3.2],[12,2.2,2.2],[10.6,2.2,2.2],C.cliff,C.line);
  quad([10.6,2.2,-2.2],[12,2.2,-2.2],[12,2.2,2.2],[10.6,2.2,2.2],C.rock,C.line);
  // tomb entrance (dark door in the west cliff) and the temple of Thebes
  quad([-9.3,0,-0.5],[-8.6,0,-0.5],[-8.6,1.1,-0.5],[-9.3,1.1,-0.5],'#120f0b',C.line,{depthBias:0.1});
  box(4.6,5.8,0,0.9,0.7,1.7,C.stone,C.stone2,C.line);
  box(4.4,6.0,0.9,1.05,0.5,1.9,C.stone,C.stone2,C.line);
  // holy cities: three small shrines
  [[7.8,-1.1],[8.7,-2.2],[9.5,-1.3]].forEach(([x,z])=>box(x-0.3,x+0.3,0,0.6,z-0.3,z+0.3,C.stone,C.stone2,C.line));
  // Floor 1: threshold shelf (under the west), tomb chamber, sycamore pool, passage mouth
  slab(-10.5,0.8,-2.6,3.0,-3,C.floor1,C.line);
  box(-8.4,-6.0,-3,-2.1,-0.9,0.9,C.stone2,C.rock2,C.line);                       // burial chamber
  quad([-7.7,-2.09,-0.5],[-6.7,-2.09,-0.5],[-6.7,-2.09,0.5],[-7.7,-2.09,0.5],C.gold,C.line,{depthBias:0.1}); // the coffin
  slab(-1.9,0.1,1.3,3.0,-2.98,C.water,C.line,{depthBias:0.05});                   // pool under the sycamore
  quad([-3.9,-3,-2.6],[-3.1,-3,-2.6],[-3.1,-2.2,-2.6],[-3.9,-2.2,-2.6],'#0e0b08',C.line,{depthBias:0.1}); // Rosetau mouth
  // ramp from floor 1 to floor 2
  quad([-3.5,-3,-2.6],[-2.3,-3,-2.6],[-2.3,-6,-5.2],[-3.5,-6,-5.2],C.rock,C.line);
  // Floor 2: the gauntlet corridor
  slab(-4.2,5.6,-2.2,2.2,-6,C.floor2,C.line);
  for(let i=0;i<7;i++){ const x=-3.6+i*0.62; box(x-0.16,x+0.16,-6,-5.0,-0.9,-0.75,C.stone,C.stone2,C.line); box(x-0.16,x+0.16,-6,-5.0,0.75,0.9,C.stone,C.stone2,C.line); quad([x-0.2,-5.0,-0.9],[x+0.2,-5.0,-0.9],[x+0.2,-5.0,0.9],[x-0.2,-5.0,0.9],C.stone2,C.line); }
  for(let i=0;i<10;i++){ const x=1.2+i*0.44; box(x-0.12,x+0.12,-6,-5.3-(i%2)*0.15,-1.1,-0.7,C.stone,C.stone2,C.line); box(x-0.12,x+0.12,-6,-5.3-(i%2)*0.15,0.7,1.1,C.stone,C.stone2,C.line); }
  // ramp 2->3
  quad([5.2,-6,-2.2],[6.2,-6,-2.2],[6.2,-9,-3.4],[5.2,-9,-3.4],C.rock,C.line);
  // Floor 3: the court
  slab(2.6,12,-3.4,3.6,-9,C.floor3,C.line);
  // hall walls (low, open to the viewer)
  box(5.6,9.4,-9,-7.4,-3.2,-2.9,C.stone2,C.rock2,C.line);
  box(5.6,5.9,-9,-7.4,-3.2,2.4,C.stone2,C.rock2,C.line);
  box(9.1,9.4,-9,-7.4,-3.2,2.4,C.stone2,C.rock2,C.line);
  // throne shrine
  box(9.9,11.4,-9,-7.0,-1.0,1.0,C.gold,C.stone2,C.line);
  // lake of fire
  slab(3.0,5.0,1.6,3.5,-8.98,C.fire,C.line,{depthBias:0.05});
  // the Field of Reeds: an island behind the court
  slab(3.6,11.6,-10.2,-4.2,-8,C.field,C.line);
  slab(4.0,11.2,-9.8,-4.6,-7.98,C.field2,null,{depthBias:0.02});
  slab(3.6,11.6,-7.4,-7.0,-7.96,C.water,null,{depthBias:0.04});
  slab(7.4,7.8,-10.2,-4.2,-7.96,C.water,null,{depthBias:0.04});
  // Floor 4: the night river
  slab(-12,12,-1.6,1.6,-12,C.river,C.line);
  slab(-12,12,-3.2,-1.6,-11.9,C.rock2,C.line);
  slab(-12,12,1.6,3.2,-11.9,C.rock2,C.line);
  // rising channel at the east end up to the horizon
  quad([11.2,-12,-1.0],[12.4,-12,-1.0],[12.4,0,-1.0],[11.2,0,-1.0],C.river,C.line);
  // descending channel at the west end from the horizon
  quad([-12.4,0,-1.0],[-11.2,0,-1.0],[-11.2,-12,-1.0],[-12.4,-12,-1.0],C.river,C.line);

  // v2.3 preview: Scott's Blade (1998), ~24:00 reference has not yet been visually verified.
  // Geometry remains an editorial interpretation, never archaeological measurements.
  const detail=[];
  function line(a,b){detail.push([a,b]);}
  function ring(cx,y,cz,r,segments=48){for(let i=0;i<segments;i++){let a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments;line([cx+Math.cos(a)*r,y,cz+Math.sin(a)*r],[cx+Math.cos(b)*r,y,cz+Math.sin(b)*r]);}}
  for(const z of [-2.55,2.05])for(let x=6.1;x<9;x+=.65){for(const dx of [-.09,.09])line([x+dx,-9,z],[x+dx,-7.4,z]);line([x-.17,-7.38,z],[x+.17,-7.38,z]);}
  ring(0,6.9,0,7.6);ring(0,6.9,0,7.85);
  for(let i=0;i<24;i++){let a=i*Math.PI/12;line([7.5*Math.cos(a),6.9,7.5*Math.sin(a)],[8*Math.cos(a),6.9,8*Math.sin(a)]);}
  for(let z=-1.3;z<=1.3;z+=.65)line([-11.8,-11.98,z],[11.8,-11.98,z]);
  const hull=[[-1.5,-11.45,0],[-.9,-11.95,-.4],[.9,-11.95,-.4],[1.5,-11.45,0],[.9,-11.95,.4],[-.9,-11.95,.4]];
  hull.forEach((p,i)=>line(p,hull[(i+1)%hull.length]));line([0,-11.9,0],[0,-10.95,0]);ring(0,-10.85,0,.3,16);
  for(let x=4.2;x<11.3;x+=.8){line([x,-7.95,-9.6],[x,-7.95,-7.7]);line([x,-7.95,-6.7],[x,-7.95,-4.8]);}
  const NS='http://www.w3.org/2000/svg';
  const E=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
  const css=`
  #mapHost{min-width:0}
  #mapHost .mapTop{display:block;padding:10px 12px 8px;background:#0d1112;border-bottom:1px solid #34403e}
  #mapHost .mapEyebrow{display:flex;justify-content:space-between;align-items:center;font:9px var(--sans);letter-spacing:.17em;color:#9aafab;text-transform:uppercase;margin-bottom:6px}
  #mapHost .mapWhere{font-size:12px;line-height:1.4;font-weight:400;min-height:33px;color:#e8ece8}
  #mapHost .mapWhere .k{font-size:9px;color:#d9bf7d;letter-spacing:.12em}
  #mapHost .mapBtns{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px}
  #mapHost .mapBtns button{padding:4px 7px;border-radius:3px;min-height:28px;font-size:11px;color:#b5c6c1;border-color:#3b4744;background:transparent}
  #mapHost .mapBtns button[aria-pressed=true]{border-color:#b5a16c;color:#f3d697;background:#24241c}
  #mapHost .mapBtns button:hover,#mapHost .mapBtns button:focus-visible{color:#fff;border-color:#d5c598}
  #mapHost .mapView{height:290px;touch-action:none;background:radial-gradient(ellipse at 45% 38%,#152021,#070b0d 78%);outline:none}
  #mapHost .mapView:focus-visible{box-shadow:inset 0 0 0 2px #d9bf7d}
  #mapHost .mapView::before{content:'';position:absolute;inset:13px;border:1px solid #91aca51a;pointer-events:none}
  #mapHost .mapView svg{overflow:visible}
  #mapHost .mapLabels .ml{transform:none;font-size:10px;border-radius:0;border-left:1px solid #8b9f99;padding:2px 5px;color:#c0d0ca;background:#080d0ee8;line-height:1.4}
  #mapHost .mapLabels .ml.cur{border-left:2px solid #ffdb8a;color:#ffdb8a;font-weight:600}
  #mapHost .mapLabels .ml.sec{border-color:#a7dfe6;color:#a7dfe6}
  #mapHost .mn .dot{fill:#b2c9c0;stroke:#0b1011;stroke-width:1}
  #mapHost .mn.cur .dot{fill:#ffe1a0;stroke:#ffe1a0}
  #mapHost .mn.sec .dot{fill:#a7dfe6}
  #mapHost .mn .pulse{animation:none;fill:none;stroke:#f9cf77;stroke-width:1;opacity:.7}
  #mapHost .mn:focus{outline:none}#mapHost .mn:focus .dot{stroke:white;stroke-width:3}
  #mapHost .mapCaption{display:flex;justify-content:space-between;gap:8px;background:#080d0e;color:#9caea7;padding:7px 12px;border-bottom:1px solid #34403e;font-size:10px;line-height:1.4}
  #mapHost .mapCaption span:last-child{color:#cfbc89;white-space:nowrap}
  #mapHost .mapNote{max-height:78px;font-size:12px;background:#101414;padding:9px 12px}
  .mapList .mi{display:block;width:100%;text-align:left;border:0;border-radius:0;background:transparent;font:13px var(--sans);padding:6px 12px 6px 34px}
  .mapList .mi:focus-visible{outline:1px solid #d9bf7d;outline-offset:-2px}
  aside.side.mapExpanded{position:fixed;inset:12px;z-index:45;width:auto;display:grid!important;grid-template-columns:minmax(0,1fr) 310px;grid-template-rows:39px minmax(0,1fr);border:1px solid #59665b;box-shadow:0 0 0 30px #000a;max-width:none}
  aside.side.mapExpanded #mapHost{grid-column:1;grid-row:1/-1;display:flex;flex-direction:column;min-height:0;border-right:1px solid #34403e}
  aside.side.mapExpanded .sideTabs{grid-column:2;grid-row:1}aside.side.mapExpanded .sideBody{grid-column:2;grid-row:2}
  aside.side.mapExpanded .mapView{height:auto!important;flex:1 1 auto;min-height:0}
  aside.side.mapExpanded .mapWhere{min-height:0}aside.side.mapExpanded .mapEyebrow{font-size:11px}
  aside.side.mapExpanded .mapLabels .ml{font-size:12px}aside.side.mapExpanded .mapNote{max-height:85px}
  @media(max-height:750px){#mapHost .mapView{height:220px}#mapHost .mapWhere{min-height:0}#mapHost .mapNote{max-height:56px}}
  @media(max-width:760px){#mapHost .mapView{height:215px}#mapHost .mapWhere{min-height:0}#mapHost .mapTop{padding:7px 10px}#mapHost .mapNote{max-height:57px}
    aside.side.mapExpanded{inset:6px;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(270px,58%) 38px minmax(0,1fr)}
    aside.side.mapExpanded #mapHost{grid-column:1;grid-row:1;border-right:0}aside.side.mapExpanded .sideTabs{grid-column:1;grid-row:2}aside.side.mapExpanded .sideBody{grid-column:1;grid-row:3}
    aside.side.mapExpanded .mapNote{display:none}aside.side.mapExpanded .mapLabels .ml{font-size:10px}}
  @media(prefers-reduced-motion:reduce){#mapHost *{animation:none!important;transition:none!important}}
  `;
  let host,view,svg,meshG,lineG,routeG,nodeG,labelsEl,listEl,titleEl,noteEl,side,onSelect;
  let cur=null,secondary=[],az=-.62,el=.55,zoom=1,W=320,H=290;
  let wire=true,spin=true,hover=false,visible=true,drag=null,raf=0,last=0,lastDraw=0,expanded=false,returnFocus=null,suppressClick=false;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const shapeEls=[],detailEls=[],nodeEls=new Map(),labelEls=new Map();
  let scale=8,ox=160,oy=150;
  function raw(p){const x=p[0],y=p[1]+2.5,z=p[2]+.5,ca=Math.cos(az),sa=Math.sin(az),ce=Math.cos(el),se=Math.sin(el);const a=x*ca+z*sa,b=-x*sa+z*ca;return{x:a,y:-y*ce+b*se,d:b*ce+y*se};}
  function project(p){const q=raw(p);return{x:ox+q.x*scale,y:oy+q.y*scale,d:q.d};}
  function fit(){scale=zoom*Math.min((W-48)/33.2,(H-50)/29);ox=W/2;oy=H/2;}
  function points(ps){return ps.map(p=>{const q=project(p);return q.x.toFixed(2)+','+q.y.toFixed(2)}).join(' ');}
  function floorFor(s){const y=s.pts.reduce((a,p)=>a+p[1],0)/s.pts.length;return Math.min(4,Math.max(0,Math.round(-y/3)));}
  function stateText(){if(!host)return;const b=host.querySelector('[data-act=spin]');b.textContent=spin?'Pause spin':'Spin';b.setAttribute('aria-pressed',String(spin));b.title=spin?'Pause automatic rotation':'Start automatic rotation';host.querySelector('[data-act=style]').textContent=wire?'Solid':'Wireframe';host.querySelector('[data-act=style]').setAttribute('aria-pressed',String(!wire));host.querySelector('[data-act=expand]').textContent=expanded?'Collapse':'Expand';host.querySelector('[data-act=expand]').setAttribute('aria-expanded',String(expanded));host.querySelector('#mapMotion').textContent=!spin?'Rotation paused':hover?'Paused while inspecting':'Slow rotation';}
  function draw(){if(!svg)return;fit();const active=cur&&byId[cur];
    for(let i=0;i<shapes.length;i++){const s=shapes[i],p=shapeEls[i],f=floorFor(s),hi=active&&(active.region?f>0:f===active.floor);p.setAttribute('points',points(s.pts));p.setAttribute('fill',wire?(hi?'#d8bd7410':'#9ab4b408'):s.fill);p.setAttribute('stroke',wire?(hi?'#c9b784':'#6f9290'):(s.stroke||'none'));p.setAttribute('stroke-opacity',wire?(hi?'.85':'.53'):'1');p.setAttribute('stroke-width',wire?'.75':'.8');}
    if(!wire){shapes.map((s,i)=>({i,d:s.pts.reduce((a,p)=>a+raw(p).d,0)/s.pts.length+(s.depthBias||0)})).sort((a,b)=>a.d-b.d).forEach(({i})=>meshG.appendChild(shapeEls[i]));}
    for(let i=0;i<detail.length;i++){const a=project(detail[i][0]),b=project(detail[i][1]),e=detailEls[i];e.setAttribute('x1',a.x);e.setAttribute('y1',a.y);e.setAttribute('x2',b.x);e.setAttribute('y2',b.y);}
    routeG.setAttribute('points',points(PATH.map(id=>byId[id].p)));
    const occupied=[],priority=[...NODES].sort((a,b)=>(b.id===cur?10:secondary.includes(b.id)?5:0)-(a.id===cur?10:secondary.includes(a.id)?5:0)),leaders=[];
    for(const n of priority){const q=project(n.p),isCur=cur===n.id,isSec=secondary.includes(n.id),g=nodeEls.get(n.id),label=labelEls.get(n.id);g.setAttribute('transform',`translate(${q.x},${q.y})`);g.setAttribute('class','mn'+(isCur?' cur':isSec?' sec':''));g.setAttribute('aria-pressed',String(isCur));g.querySelector('.pulse').style.display=isCur?'':'none';g.querySelector('.dot').setAttribute('r',isCur?4.5:2.7);label.className='ml'+(isCur?' cur':isSec?' sec':'');label.textContent=(isCur?'ANI · ':'')+n.short;
      const show=isCur||isSec||expanded||['sky','west','east','tomb','hall','boat','fields'].includes(n.id);
      if(!show||q.x<8||q.x>W-8||q.y<8||q.y>H-8){label.style.display='none';continue;}
      const lw=Math.min(W-24,label.textContent.length*(expanded&&W>550?6.7:5.4)+12),lh=expanded&&W>550?23:20;
      let found=null;for(const[dx,dy]of[[9,-9],[-lw-9,-9],[9,-31],[-lw-9,16],[9,17],[-lw/2,-43]]){const r={x:Math.max(15,Math.min(W-lw-15,q.x+dx)),y:Math.max(16,Math.min(H-lh-15,q.y+dy)),w:lw,h:lh};if(!occupied.some(b=>r.x<b.x+b.w+3&&r.x+r.w+3>b.x&&r.y<b.y+b.h+3&&r.y+r.h+3>b.y)){found=r;break;}}
      if(!found){label.style.display='none';continue;}occupied.push(found);label.style.display='';label.style.left=found.x+'px';label.style.top=found.y+'px';label.style.maxWidth=lw+'px';leaders.push(`M${q.x},${q.y}L${found.x>q.x?found.x:found.x+lw},${found.y+lh/2}`);
    }host.querySelector('#mapLeaders').setAttribute('d',leaders.join(' '));
  }
  function canAnimate(){return spin&&!hover&&!drag&&visible&&!document.hidden;}
  function tick(t){raf=0;if(!canAnimate()){last=0;return;}if(last)az+=Math.min(t-last,75)/1000*.105;last=t;if(t-lastDraw>40){draw();lastDraw=t;}raf=requestAnimationFrame(tick);}
  function animate(){if(canAnimate()&&!raf){last=0;raf=requestAnimationFrame(tick);}else if(!canAnimate()&&raf){cancelAnimationFrame(raf);raf=0;last=0;}stateText();}
  function pause(){spin=false;animate();}
  function resize(){W=view.clientWidth||320;H=view.clientHeight||290;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);draw();}
  function expand(value){expanded=value;side=host.closest('aside.side');if(!side)return;if(value)returnFocus=document.activeElement;side.classList.toggle('mapExpanded',value);stateText();resize();if(value)host.querySelector('[data-act=expand]').focus();else if(returnFocus&&returnFocus.isConnected)returnFocus.focus();}
  function pick(e){if(suppressClick){suppressClick=false;if(view.contains(e.target))return;}const t=e.target.closest('[data-id]');if(!t)return;const id=t.dataset.id;if(!byId[id])return;pause();API.focus(id,{note:byId[id].what});if(onSelect)onSelect(id);}
  const API={nodes:NODES,floors:FLOORS,byId,
    init(container,opts={}){host=container;onSelect=opts.onSelect||null;
      if(!document.getElementById('ani-map-archive-css')){const s=document.createElement('style');s.id='ani-map-archive-css';s.textContent=css;document.head.appendChild(s);}
      host.innerHTML=`<div class="mapTop"><div class="mapEyebrow"><span>Duat / Spatial archive</span><span>16 places</span></div><div class="mapWhere" id="mapWhere"></div><div class="mapBtns"><button data-act="spin" aria-pressed="true">Pause spin</button><button data-act="reset" title="Restore the initial camera and zoom">Reset</button><button data-act="z" aria-label="Zoom map in">＋</button><button data-act="x" aria-label="Zoom map out">−</button><button data-act="style" aria-pressed="false" title="Toggle wireframe and solid geometry">Solid</button><button data-act="expand" aria-expanded="false">Expand</button></div></div><div class="mapView" id="mapView" tabindex="0" aria-label="Three-dimensional interpretive map. Drag or use arrow keys to rotate. Plus and minus zoom. Space pauses rotation."><svg id="mapSvg" role="group" aria-label="Places linked to passages in the Papyrus of Ani"></svg><div class="mapLabels" id="mapLabels" aria-hidden="true"></div></div><div class="mapCaption"><span>Interpretive layout · not an ancient floor plan</span><span id="mapMotion"></span></div><div class="mapNote" id="mapNote"></div><div class="mapList" id="mapList"></div>`;
      view=host.querySelector('#mapView');svg=host.querySelector('#mapSvg');labelsEl=host.querySelector('#mapLabels');listEl=host.querySelector('#mapList');titleEl=host.querySelector('#mapWhere');noteEl=host.querySelector('#mapNote');meshG=E('g',{'aria-hidden':'true','stroke-linejoin':'round'});svg.appendChild(meshG);
      shapes.forEach(s=>{const p=E('polygon');meshG.appendChild(p);shapeEls.push(p);});lineG=E('g',{stroke:'#86a4a0','stroke-opacity':'.65','stroke-width':'.6','aria-hidden':'true'});svg.appendChild(lineG);detail.forEach(()=>{const l=E('line');lineG.appendChild(l);detailEls.push(l);});routeG=E('polyline',{fill:'none',stroke:'#d8ba76','stroke-width':'1','stroke-opacity':'.47','stroke-dasharray':'2 5','aria-hidden':'true'});svg.appendChild(routeG);svg.appendChild(E('path',{id:'mapLeaders',stroke:'#96aba1','stroke-opacity':'.45','stroke-width':'.6',fill:'none','aria-hidden':'true'}));nodeG=E('g');svg.appendChild(nodeG);
      NODES.forEach(n=>{const g=E('g',{'data-id':n.id,role:'button',tabindex:'0','aria-label':n.name,'aria-pressed':'false'});g.appendChild(E('circle',{r:10,class:'pulse'}));g.appendChild(E('circle',{r:3,class:'dot'}));g.appendChild(E('circle',{r:12,fill:'transparent'}));const t=E('title');t.textContent=n.name;g.appendChild(t);nodeG.appendChild(g);nodeEls.set(n.id,g);const l=document.createElement('div');l.className='ml';l.dataset.id=n.id;labelsEl.appendChild(l);labelEls.set(n.id,l);});
      for(const f of FLOORS){const h=document.createElement('div');h.className='mf';h.textContent=`${f.n} · ${f.name}`;listEl.appendChild(h);for(const n of NODES.filter(n=>n.floor===f.n)){const b=document.createElement('button');b.type='button';b.className='mi';b.dataset.id=n.id;b.innerHTML='<span class="dot"></span>';b.appendChild(document.createTextNode(n.name));listEl.appendChild(b);}}
      listEl.addEventListener('click',pick);svg.addEventListener('click',pick);labelsEl.addEventListener('click',pick);svg.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-id]')){e.preventDefault();e.stopPropagation();pick(e);}});
      view.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;animate();}});view.addEventListener('pointerleave',()=>{hover=false;animate();});view.addEventListener('pointerdown',e=>{if(e.button!==0)return;pause();suppressClick=false;drag={x:e.clientX,y:e.clientY,az,el,moved:false};});
      view.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)>5){drag.moved=true;view.setPointerCapture(e.pointerId);}if(drag.moved){az=drag.az+dx*.009;el=Math.max(-.08,Math.min(1.12,drag.el+dy*.005));draw();}});
      const end=e=>{if(drag){suppressClick=drag.moved;drag=null;}if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);};view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);view.addEventListener('lostpointercapture',()=>{drag=null;});window.addEventListener('pointerup',()=>{if(drag){suppressClick=drag.moved;drag=null;}});
      view.addEventListener('wheel',e=>{e.preventDefault();pause();zoom=Math.max(.65,Math.min(2.8,zoom*(e.deltaY<0?1.1:.91)));draw();},{passive:false});
      view.addEventListener('keydown',e=>{if(e.defaultPrevented)return;const k=e.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-',' ','Home'].includes(k))return;e.preventDefault();e.stopPropagation();if(k===' '){spin=!spin;animate();return;}pause();if(k==='ArrowLeft')az-=.16;if(k==='ArrowRight')az+=.16;if(k==='ArrowUp')el=Math.min(1.12,el+.1);if(k==='ArrowDown')el=Math.max(-.08,el-.1);if(k==='+'||k==='=')zoom=Math.min(2.8,zoom*1.1);if(k==='-')zoom=Math.max(.65,zoom/1.1);if(k==='Home'){az=-.62;el=.55;zoom=1;}draw();});
      host.querySelector('.mapBtns').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.act;if(a==='spin'){spin=!spin;animate();}else if(a==='expand')expand(!expanded);else if(a==='style'){wire=!wire;stateText();draw();}else{pause();if(a==='reset'){az=-.62;el=.55;zoom=1;}if(a==='z')zoom=Math.min(2.8,zoom*1.2);if(a==='x')zoom=Math.max(.65,zoom/1.2);draw();}});
      window.addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded&&!document.querySelector('dialog[open]')){e.preventDefault();e.stopImmediatePropagation();expand(false);}},{capture:true});document.addEventListener('visibilitychange',animate);if(window.IntersectionObserver)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;animate();}).observe(view);new ResizeObserver(resize).observe(view);reduced.addEventListener('change',e=>{if(e.matches)pause();});spin=!reduced.matches;resize();stateText();animate();
    },
    focus(id,opts={}){if(!byId[id])return;cur=id;secondary=(opts.secondary||[]).filter(s=>s!==id&&byId[s]);if(titleEl){titleEl.replaceChildren();const k=document.createElement('span');k.className='k';k.textContent=opts.label||'Ani is at';titleEl.append(k,document.createTextNode(byId[id].name));noteEl.textContent=opts.note||byId[id].what;listEl.querySelectorAll('.mi').forEach(e=>{e.classList.toggle('cur',e.dataset.id===id);e.classList.toggle('sec',secondary.includes(e.dataset.id));e.setAttribute('aria-pressed',String(e.dataset.id===id));});}draw();},
    current(){return cur;},camera(){return{az,el,zoom,spin,expanded,wire,visible,reducedMotion:reduced.matches};},setSpin(value){spin=Boolean(value);animate();},reset(){az=-.62;el=.55;zoom=1;draw();}
  };window.ANI_MAP_FALLBACK=API;
})();
