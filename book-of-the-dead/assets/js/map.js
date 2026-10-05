/* v2.4 · Native WebGL archive controller; v2.3 SVG remains a graceful fallback.
 * Reader and corpus data retain their original identifiers. Geometry is editorial.
 */
(function(){
'use strict';
const data=window.ANI_MAP_DATA, nodes=data.nodes, floors=data.floors, byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
let host,view,canvas,scene,list,title,note,markers,onSelect,resizeObserver,intersectionObserver;
let current=null,secondary=[],expanded=false,returnFocus=null,spin=!matchMedia('(prefers-reduced-motion: reduce)').matches,visible=false,hover=false,raf=0,last=0,lastDraw=0,engine='initializing',disposed=false;
const motion=matchMedia('(prefers-reduced-motion: reduce)'),abort=new AbortController(),pointer=new Map();
let drag=null,pinch=null,az=.18,el=.33,zoom=1,panX=0,panY=0,cutaway=true,solid=false,route=false,projected={};
function listen(el,event,fn,options={}){el.addEventListener(event,fn,{...options,signal:abort.signal});}
function add(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;}
function activeTag(){return scene?scene.data.byId[current]||0:0;}
function render(){if(!scene||disposed)return;scene.setState({az,el,zoom,panX,panY,cutaway,solid,route,active:activeTag()});placeLabels();}
function placeLabels(){if(!markers||!scene)return;const w=view.clientWidth,h=view.clientHeight,used=[];projected={};
 const ordered=[...nodes].sort((a,b)=>(b.id===current?10:secondary.includes(b.id)?5:0)-(a.id===current?10:secondary.includes(a.id)?5:0));
 for(const n of ordered){const p=scene.project(n.id),b=markers[n.id];projected[n.id]=p;b.className='mapMarker'+(n.id===current?' cur':secondary.includes(n.id)?' sec':'');b.setAttribute('aria-pressed',String(n.id===current));if(!p||!p.inFront||p.z>1||p.x<14||p.x>w-14||p.y<14||p.y>h-30){b.style.display='none';continue;}b.style.display='';b.style.left=p.x+'px';b.style.top=p.y+'px';const text=b.firstChild;text.textContent=n.short;
  const width=Math.min(w-25,n.short.length*6+14),box={x:p.x+10,y:p.y-10,w:width,h:24};
  if(box.x+width>w-20){text.style.left='auto';text.style.right='24px';box.x=p.x-width-13;}else{text.style.left='24px';text.style.right='auto';}
  const wanted=n.id===current||secondary.includes(n.id)||(expanded&&w>600&&['sky','west','east','arits','pylons','boat','fields','tomb'].includes(n.id));
  if(wanted&&!used.some(r=>box.x<r.x+r.w&&box.x+box.w>r.x&&box.y<r.y+r.h&&box.y+box.h>r.y)){b.classList.add('named');used.push(box);}
 }
}
function stateText(){if(!host||engine!=='webgl')return;const q=act=>host.querySelector('[data-act="'+act+'"]');q('spin').textContent=spin?'Pause spin':'Spin';q('spin').setAttribute('aria-pressed',String(spin));q('expand').textContent=expanded?'Collapse':'Expand';q('expand').setAttribute('aria-expanded',String(expanded));q('cut').textContent=cutaway?'Show exterior':'Cutaway';q('cut').setAttribute('aria-pressed',String(cutaway));q('style').textContent=solid?'Archive view':'Surface view';q('style').setAttribute('aria-pressed',String(solid));q('route').setAttribute('aria-pressed',String(route));host.querySelector('#mapMotion').textContent=spin?(hover?'Paused for inspection':'Slow rotation'):'Rotation paused';}
function canAnimate(){return spin&&visible&&!hover&&!pointer.size&&!document.hidden&&!disposed&&engine==='webgl';}
function frame(t){raf=0;if(!canAnimate()){last=0;return;}if(!lastDraw||t-lastDraw>32){const dt=lastDraw?Math.min(t-lastDraw,80):0;az+=dt*.000065;lastDraw=t;render();}raf=requestAnimationFrame(frame);}
function animate(){if(canAnimate()&&!raf){lastDraw=0;raf=requestAnimationFrame(frame);}else if(!canAnimate()&&raf){cancelAnimationFrame(raf);raf=0;lastDraw=0;}stateText();}
function pause(){spin=false;animate();}
function resize(){if(!scene)return;scene.resize(view.clientWidth||340,view.clientHeight||230);placeLabels();}
function expand(value){const side=host.closest('aside.side');if(!side)return;expanded=Boolean(value);if(expanded)returnFocus=document.activeElement;side.classList.toggle('mapExpanded',expanded);stateText();resize();if(expanded)host.querySelector('[data-act=expand]').focus();else if(returnFocus?.isConnected)returnFocus.focus();}
function pick(id){if(!byId[id])return;pause();API.focus(id);onSelect?.(id);}
function updateFocus(){if(!title||!current)return;title.replaceChildren(add('span','k','SELECTED CONTEXT'),document.createTextNode(byId[current].name));note.textContent=byId[current].what;
 list.querySelectorAll('.mi').forEach(b=>{const id=b.dataset.id;b.classList.toggle('cur',id===current);b.classList.toggle('sec',secondary.includes(id));b.setAttribute('aria-pressed',String(id===current));});render();}
function resetCamera(){az=.18;el=.33;zoom=1;panX=panY=0;render();}
function installInput(){
 const pair=()=>{const[a,b]=[...pointer.values()];return a&&b?{distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),x:(a.x+b.x)/2,y:(a.y+b.y)/2}:null;};
 listen(view,'pointerdown',e=>{if(e.target.closest('button'))return;if(e.button!==0&&e.button!==2)return;pause();view.focus({preventScroll:true});pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});view.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,az,el,panX,panY,moved:false,pan:e.button===2||e.shiftKey};if(pointer.size===2)pinch={...pair(),zoom,panX,panY};});
 listen(view,'pointermove',e=>{if(!pointer.has(e.pointerId))return;pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointer.size===2&&pinch){const p=pair();zoom=Math.max(.65,Math.min(3,pinch.zoom*p.distance/pinch.distance));panX=pinch.panX-(p.x-pinch.x)*.025/zoom;panY=pinch.panY+(p.y-pinch.y)*.025/zoom;if(drag)drag.moved=true;render();return;}if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>4)drag.moved=true;if(drag.pan){panX=drag.panX-dx*.027/zoom;panY=drag.panY+dy*.027/zoom;}else{az=drag.az-dx*.008;el=Math.max(-.45,Math.min(1.35,drag.el+dy*.005));}render();});
 const end=e=>{if(!pointer.has(e.pointerId))return;pointer.delete(e.pointerId);if(view.hasPointerCapture(e.pointerId))view.releasePointerCapture(e.pointerId);if(pointer.size===0){drag=null;pinch=null;}else{const p=[...pointer.values()][0];drag={x:p.x,y:p.y,az,el,panX,panY,moved:true,pan:false};pinch=null;}};
 listen(view,'pointerup',end);listen(view,'pointercancel',end);listen(view,'lostpointercapture',e=>{pointer.delete(e.pointerId);if(!pointer.size){drag=null;pinch=null;}});
 listen(view,'contextmenu',e=>e.preventDefault());
 listen(view,'pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;animate();}});listen(view,'pointerleave',()=>{hover=false;animate();});
 listen(view,'wheel',e=>{e.preventDefault();pause();zoom=Math.max(.65,Math.min(3,zoom*Math.exp(-Math.max(-120,Math.min(120,e.deltaY))*.0016)));render();},{passive:false});
 listen(view,'keydown',e=>{if(e.target.closest('button'))return;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home',' '].includes(e.key))return;e.preventDefault();e.stopPropagation();if(e.key===' '){spin=!spin;animate();return;}pause();if(e.key==='ArrowLeft')az-=.12;if(e.key==='ArrowRight')az+=.12;if(e.key==='ArrowUp')el=Math.min(1.35,el+.1);if(e.key==='ArrowDown')el=Math.max(-.45,el-.1);if(e.key==='+'||e.key==='=')zoom=Math.min(3,zoom*1.15);if(e.key==='-')zoom=Math.max(.65,zoom/1.15);if(e.key==='Home')resetCamera();render();});
 listen(window,'keydown',e=>{if(e.key==='Escape'&&expanded&&!document.querySelector('dialog[open]')){e.preventDefault();e.stopImmediatePropagation();expand(false);}},{capture:true});
 listen(host.querySelector('.mapBtns'),'click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.act;if(a==='spin'){spin=!spin;animate();}else if(a==='expand')expand(!expanded);else if(a==='legend')document.getElementById('tabLegend')?.click();else{pause();if(a==='reset')resetCamera();if(a==='z')zoom=Math.min(3,zoom*1.2);if(a==='x')zoom=Math.max(.65,zoom/1.2);if(a==='cut')cutaway=!cutaway;if(a==='style')solid=!solid;if(a==='route')route=!route;render();stateText();}});
 listen(document,'visibilitychange',animate);listen(motion,'change',e=>{if(e.matches)pause();});
 listen(canvas,'webglcontextlost',e=>{e.preventDefault();pause();engine='context-lost';host.querySelector('.buildTag').textContent='Graphics paused';host.querySelector('#mapMotion').textContent='Graphics interrupted; text and place list remain usable';});
 listen(canvas,'webglcontextrestored',()=>{try{scene.initGPU();engine='webgl';host.querySelector('.buildTag').textContent='WebGL · prototype';resize();stateText();}catch(err){host.querySelector('#mapMotion').textContent='Reload to restore graphics. The reader remains usable.';}});
}
const API={nodes,floors,byId,
 init(container,opts={}){
  host=container;onSelect=opts.onSelect||null;canvas=document.createElement('canvas');canvas.id='mapCanvas';canvas.setAttribute('aria-hidden','true');
  try{if(window.ANI_FORCE_FALLBACK)throw new Error('Fallback requested');scene=new window.ANI_WEBGL.Scene(canvas,nodes,data.path);engine='webgl';}catch(error){engine='svg-fallback';window.ANI_MAP_FALLBACK.init(container,opts);Object.assign(API,{nodes:window.ANI_MAP_FALLBACK.nodes,floors:window.ANI_MAP_FALLBACK.floors,byId:window.ANI_MAP_FALLBACK.byId});const e=container.querySelector('.mapEyebrow');if(e)e.firstChild.textContent='Duat / vector fallback';const note=container.querySelector('.mapCaption span');if(note)note.textContent='3D graphics unavailable · vector map retains passage links';return;}
  host.innerHTML='<div class="mapTop"><div class="mapEyebrow"><span>ANI / UNDERWORLD ATLAS</span><span class="buildTag">WebGL · prototype</span></div><div class="mapWhere" id="mapWhere" aria-live="polite"></div><div class="mapBtns"><button data-act="spin">Pause spin</button><button data-act="reset">Reset</button><button data-act="z" aria-label="Zoom map in">＋</button><button data-act="x" aria-label="Zoom map out">−</button><button data-act="cut">Show exterior</button><button data-act="style">Surface view</button><button data-act="route" aria-pressed="false" title="Editorial exploration order, not a prescribed ancient itinerary">Study route</button><button data-act="legend">Places</button><button data-act="expand" aria-expanded="false">Expand</button></div></div><div class="mapView" id="mapView" tabindex="0" aria-label="Interactive 3D underworld atlas. Drag or arrow keys to orbit. Scroll or plus and minus to zoom. Shift drag to pan. Space toggles rotation."><div class="mapLabels" id="mapLabels"></div><div class="mapMotionHint">DRAG TO ORBIT · SCROLL TO ZOOM · SELECT A PLACE</div></div><div class="mapKey"><span class="gold">● Selected</span><span class="cyan">● Related</span><span>Markers remain visible through the model</span></div><div class="mapCaption"><span>Invented architecture · not an ancient floor plan</span><span id="mapMotion"></span></div><div class="mapReview">Inherited passage associations · source review pending · <a href="assets/research.html" target="_blank" rel="noopener">Sources &amp; method</a></div><div class="mapNote" id="mapNote"></div><div class="mapList" id="mapList"></div>';
  view=host.querySelector('#mapView');view.prepend(canvas);title=host.querySelector('#mapWhere');note=host.querySelector('#mapNote');list=host.querySelector('#mapList');markers={};const layer=host.querySelector('#mapLabels');
  for(const n of nodes){const b=add('button','mapMarker');b.type='button';b.dataset.id=n.id;b.setAttribute('aria-label',n.name);b.title=n.name;b.appendChild(add('span','placeName',n.short));layer.appendChild(b);markers[n.id]=b;listen(b,'click',()=>pick(n.id));}
  for(const f of floors){list.appendChild(add('div','mf','THEMATIC GROUP '+(f.n+1)+' · '+f.name));for(const n of nodes.filter(n=>n.floor===f.n)){const b=add('button','mi');b.type='button';b.dataset.id=n.id;b.append(add('span','dot'),document.createTextNode(n.name));list.appendChild(b);listen(b,'click',()=>pick(n.id));}}
  installInput();resizeObserver=new ResizeObserver(resize);resizeObserver.observe(view);intersectionObserver=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)resize();animate();});intersectionObserver.observe(view);resize();stateText();
 },
 focus(id,opts={}){if(engine==='svg-fallback')return window.ANI_MAP_FALLBACK.focus(id,opts);if(!byId[id])return;current=id;secondary=(opts.secondary||[]).filter(id=>byId[id]&&id!==current);updateFocus();},
 current(){return engine==='svg-fallback'?window.ANI_MAP_FALLBACK.current():current;},
 camera(){return engine==='svg-fallback'?{...window.ANI_MAP_FALLBACK.camera(),engine}: {az,el,zoom,panX,panY,spin,expanded,wire:!solid,cutaway,route,visible,engine,reducedMotion:motion.matches};},
 setSpin(value){if(engine==='svg-fallback')return window.ANI_MAP_FALLBACK.setSpin(value);spin=Boolean(value);animate();},
 reset(){if(engine==='svg-fallback')return window.ANI_MAP_FALLBACK.reset();resetCamera();},
 statistics(){return scene?scene.statistics():{engine:'SVG fallback'};},
 projected(){return projected;},
 // Diagnostic hook used only by automated resilience tests.
 testContextLoss(){scene?.lossExtension?.loseContext();},
 testContextRestore(){scene?.lossExtension?.restoreContext();},
 dispose(){disposed=true;spin=false;animate();abort.abort();resizeObserver?.disconnect();intersectionObserver?.disconnect();scene?.dispose();}
};window.ANI_MAP=API;
})();
