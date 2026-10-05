/* Papyrus of Ani · v2.4 engineering prototype.
 * A small, dependency-free WebGL renderer. Actual triangle meshes, surface normals,
 * perspective camera, depth testing and vertex buffers; not a raster image or SVG.
 * All architectural coordinates and connecting lines are editorial, not ancient geography.
 */
(function(){
'use strict';
const TAU=Math.PI*2, D=Math.PI/180;
const V={sub:(a,b)=>a.map((v,i)=>v-b[i]),dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit:a=>{let n=Math.hypot(...a)||1;return a.map(x=>x/n);}};
function mul(a,b){const c=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)c[j*4+i]+=a[k*4+i]*b[j*4+k];return c;}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);}
function lookAt(eye,target){const z=V.unit(V.sub(eye,target)),x=V.unit(V.cross([0,1,0],z)),y=V.cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V.dot(x,eye),-V.dot(y,eye),-V.dot(z,eye),1]);}
function transform(m,p){return [0,1,2,3].map(i=>m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i]);}
const GREEN=[.30,.65,.43,1], EDGE=[.42,.93,.62,.60], DARK=[.12,.27,.21,1], BLUE=[.27,.69,1,1], GOLD=[1,.76,.30,1];
function buildScene(nodes,path){
 const solid=[],edges=[],route=[],positions={},byId={};nodes.forEach((n,i)=>byId[n.id]=i+1);
 function vertex(dst,p,n,c,tag=0,shell=0){dst.push(...p,...n,...c,tag,shell);}
 function line(a,b,c=EDGE,tag=0,shell=0){vertex(edges,a,[0,0,0],c,tag,shell);vertex(edges,b,[0,0,0],c,tag,shell);}
 function face(ps,c=GREEN,tag=0,shell=0,outline=true){const normal=V.unit(V.cross(V.sub(ps[1],ps[0]),V.sub(ps[2],ps[0])));for(let i=1;i<ps.length-1;i++)for(const p of [ps[0],ps[i],ps[i+1]])vertex(solid,p,normal,c,tag,shell);if(outline)ps.forEach((p,i)=>line(p,ps[(i+1)%ps.length],EDGE,tag,shell));}
 function box(x,y,z,w,h,d,angle=0,c=GREEN,tag=0,shell=0){const co=Math.cos(angle),si=Math.sin(angle);const ps=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>{const a=p[0]*w/2,b=p[2]*d/2;return[x+a*co+b*si,y+p[1]*h/2,z-a*si+b*co];});for(const ids of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])face(ids.map(i=>ps[i]),c,tag,shell);}
 function ring(ri,ro,y,h,start=0,end=TAU,c=GREEN,tag=0,shell=0){const count=Math.max(3,Math.ceil((end-start)*18)),p=(r,a,dy)=>[r*Math.cos(a),y+dy,r*Math.sin(a)];for(let i=0;i<count;i++){const a=start+(end-start)*i/count,b=start+(end-start)*(i+1)/count;face([p(ri,a,0),p(ro,a,0),p(ro,b,0),p(ri,b,0)],c,tag,shell,false);face([p(ro,a,-h),p(ro,b,-h),p(ro,b,0),p(ro,a,0)],c,tag,shell,false);face([p(ri,a,-h),p(ri,a,0),p(ri,b,0),p(ri,b,-h)],c,tag,shell,false);for(const r of [ri,ro]){line(p(r,a,0),p(r,b,0),EDGE,tag,shell);line(p(r,a,-h),p(r,b,-h),EDGE,tag,shell);}if(i%4===0)line(p(ri,a,0),p(ro,a,0),EDGE,tag,shell);}}
 function wireRing(r,y,c=EDGE,tag=0){for(let i=0;i<96;i++){const a=i*TAU/96,b=(i+1)*TAU/96;line([r*Math.cos(a),y,r*Math.sin(a)],[r*Math.cos(b),y,r*Math.sin(b)],c,tag);}}
 function portal(x,y,z,a,w=1.0,h=1.5,tag=0){const co=Math.cos(a),si=Math.sin(a);for(const s of [-1,1])box(x+s*w/2*co,y+h/2,z-s*w/2*si,.24,h,.38,a,GREEN,tag);box(x,y+h,z,w+.34,.25,.38,a,GREEN,tag);}
 // Open cylinder; five thematic registers inherited from the old map, NOT five attested floors.
 for(let level=0;level<5;level++){
  const y=8-level*4;ring(5.35,7.2,y,.38,0,TAU,GREEN,0,1);ring(6.83,7.38,y-.48,.16,0,TAU,DARK,0,1);
  for(let j=0;j<24;j++){
   const a=j*TAU/24,tag=0;
   box(6.83*Math.cos(a),y+1.32,6.83*Math.sin(a),.34,2.64,.60,-a,GREEN,tag,1);
   // Abstract luminous panels, deliberately blank: no invented Egyptian inscriptions.
   if(level>0){const b=a+TAU/48;box(6.78*Math.cos(b),y+1.28,6.78*Math.sin(b),.08,1.70,1.04,-b,DARK,tag,1);box(6.69*Math.cos(b),y+1.29,6.69*Math.sin(b),.03,1.32,.65,-b,BLUE,tag,1);}
  }
 }
 // Flared base and crown retain the axial / ring structure in Scott's film references.
 ring(4.9,8.05,-8.65,.3);ring(5.0,8.75,-9.13,.25);ring(5.2,9.0,-9.55,.26);
 ring(5.3,7.8,8.48,.25,0,TAU,GREEN,0,1);
 wireRing(7.75,11.5,[.36,.70,.48,.5]);wireRing(7.55,11.5,[.36,.70,.48,.4]);
 for(let j=0;j<12;j++){const a=j*TAU/12;box(7.2*Math.cos(a),10.0,7.2*Math.sin(a),.4,3,1.25,-a,GREEN,0,1);}
 // Central archive spine: no cosmological claim attaches to this structural device.
 for(let y=-8;y<=9;y+=.75)wireRing(.72,y,[.3,.8,.64,.36]);
 for(let i=0;i<8;i++){const a=i*TAU/8;line([.72*Math.cos(a),-8,.72*Math.sin(a)],[.72*Math.cos(a),9,.72*Math.sin(a)],[.30,.72,.58,.36]);}
 const layouts={
  thebes:[-3.8,8.8,3.8],cities:[3.8,8.8,-3.8],west:[-9.2,8.65,0],east:[9.2,8.65,0],sky:[0,12,0],
  tomb:[-4.5,4.8,2.7],sycamore:[4.2,4.8,2.8],rosetau:[-1.2,4.8,-4.8],
  arits:[-3.3,.9,2.8],pylons:[3.3,.9,2.8],duat:[0,1.4,0],
  hall:[-2.7,-3.1,3.9],throne:[1.8,-3.1,-3.7],lake:[-4.9,-3.1,-2.7],fields:[10.2,-3.1,0],boat:[0,-7.1,1.5]
 };
 Object.assign(positions,layouts);
 const tag=id=>byId[id];
 box(-3.8,8.35,3.8,1.8,.7,1.3,.2,GREEN,tag('thebes'));
 for(let i=0;i<3;i++)portal(3.0+i*.65,8.4,-3.8,0,.4,.75,tag('cities'));
 for(const id of ['west','east']){const [x,y,z]=layouts[id];box(x,8.1,z,3,.35,2.6,0,DARK,tag(id));portal(x,8.3,z,Math.PI/2,1.2,1.7,tag(id));}
 wireRing(2.3,12,[.5,.9,.6,.65],tag('sky'));
 box(-4.5,4.42,2.7,1.6,.8,1.25,.3,GREEN,tag('tomb'));box(-4.5,4.85,2.7,.6,.18,.88,.3,DARK,tag('tomb'));
 for(let i=0;i<5;i++)portal(-1.2,4.05,-4.8+i*.32,0,.8,.85,tag('rosetau'));
 line([4.2,4.15,2.8],[4.2,6.2,2.8],BLUE,tag('sycamore'));for(let i=0;i<8;i++){let a=i*TAU/8;line([4.2,5.4,2.8],[4.2+.75*Math.cos(a),6.1,2.8+.75*Math.sin(a)],BLUE,tag('sycamore'));}
 // Gate groups reflect the inherited data's seven and ten counts, not an attested ring plan.
 for(const [id,count,start,end] of [['arits',7,75,165],['pylons',10,15,70]])for(let i=0;i<count;i++){const a=(start+(end-start)*i/(count-1))*D,r=4.6;portal(r*Math.cos(a),.08,r*Math.sin(a),Math.PI/2-a,.50,1.45,tag(id));}
 // Court and shrine schematic.
 box(-2.7,-3.92,3.9,3,.18,2.1,0,DARK,tag('hall'));
 for(let i=0;i<7;i++){let x=-4.05+i*.44;portal(x,-3.82,3.06,0,.25,.92,tag('hall'));}
 box(1.8,-3.65,-3.7,1.6,.75,1.5,0,GREEN,tag('throne'));portal(1.8,-3.25,-3.7,0,.95,1.25,tag('throne'));
 box(-4.9,-3.96,-2.7,1.5,.12,1.4,0,[.62,.24,.10,1],tag('lake'));
 // Field annex with visible canals, attached as a study compartment, not surveyed terrain.
 box(8.35,-4.10,0,3.2,.20,.9,0,DARK,tag('fields'));box(10.7,-4.07,0,3.4,.20,5.3,0,GREEN,tag('fields'));
 for(let j=0;j<4;j++)box(10.7,-3.92,-1.8+j*1.15,3.25,.035,.09,0,BLUE,tag('fields'));
 for(let i=0;i<5;i++)box(9.35+i*.63,-3.92,0,.06,.035,5.1,0,BLUE,tag('fields'));
 // Schematic solar boat above an abstract base ring, not the invented 'Waters of Nu' from art.
 const hull=[[-2,-7.25,1.5],[-1.4,-7.9,.85],[1.4,-7.9,.85],[2,-7.25,1.5],[1.4,-7.9,2.15],[-1.4,-7.9,2.15]];
 face(hull,GREEN,tag('boat'));line([0,-7.8,1.5],[0,-6,1.5],GOLD,tag('boat'));
 for(let r=1.8;r<5.0;r+=.4)wireRing(r,-8.08,[.19,.48,.69,.23],tag('boat'));
 // Optional dashed exploration sequence. Kept off by default.
 for(let i=0;i<path.length-1;i++){
  const a=positions[path[i]],b=positions[path[i+1]];if(!a||!b)continue;
  for(let j=0;j<16;j+=2){const p=t=>a.map((v,k)=>v+(b[k]-v)*t);vertex(route,p(j/16),[0,0,0],[1,.74,.3,.65]);vertex(route,p((j+1)/16),[0,0,0],[1,.74,.3,.65]);}
 }
 return{solid:new Float32Array(solid),edges:new Float32Array(edges),route:new Float32Array(route),positions,byId};
}
const vertexShader=`
attribute vec3 aPosition;attribute vec3 aNormal;attribute vec4 aColor;attribute float aTag;attribute float aShell;
uniform mat4 uMatrix;varying vec3 vPosition;varying vec3 vNormal;varying vec4 vColor;varying float vTag;varying float vShell;
void main(){vPosition=aPosition;vNormal=aNormal;vColor=aColor;vTag=aTag;vShell=aShell;gl_Position=uMatrix*vec4(aPosition,1.0);}`;
const fragmentShader=`precision mediump float;
varying vec3 vPosition;varying vec3 vNormal;varying vec4 vColor;varying float vTag;varying float vShell;
uniform vec3 uEye;uniform float uActive;uniform float uCutaway;uniform float uLines;uniform float uSolid;
void main(){
 if(uCutaway>.5&&vShell>.5&&dot(normalize(vPosition.xz),normalize(uEye.xz))>.48)discard;
 vec3 color=vColor.rgb;float alpha=vColor.a;
 if(uActive>.5&&abs(vTag-uActive)<.1)color=mix(color,vec3(1.,.78,.35),.75);
 if(uLines<.5){
  float light=.30+.65*abs(dot(normalize(vNormal),normalize(vec3(-.5,1.,.6))));
  float blue=step(color.r*1.6,color.b);color*=mix(light,1.,blue*.65);
  alpha*=mix(.15,1.,uSolid);if(blue>.5&&uSolid<.5)alpha=.38;
 }else{alpha*=mix(.86,.64,uSolid);}
 gl_FragColor=vec4(color,alpha);
}`;
class Scene{
 constructor(canvas,nodes,path){
  this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  if(!this.gl)throw new Error('WebGL is unavailable');
  this.lossExtension=this.gl.getExtension('WEBGL_lose_context');
  this.data=buildScene(nodes,path);this.state={az:.18,el:.33,zoom:1,panX:0,panY:0,cutaway:true,solid:false,route:false,active:0};this.draws=0;this.alive=true;this.initGPU();
 }
 initGPU(){const g=this.gl;const shaders=[];for(const[type,source]of[[g.VERTEX_SHADER,vertexShader],[g.FRAGMENT_SHADER,fragmentShader]]){const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS)){const error=g.getShaderInfoLog(s);g.deleteShader(s);throw new Error(error);}shaders.push(s);}this.program=g.createProgram();shaders.forEach(s=>g.attachShader(this.program,s));g.linkProgram(this.program);shaders.forEach(s=>g.deleteShader(s));if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw new Error(g.getProgramInfoLog(this.program));
  this.attrs=['aPosition','aNormal','aColor','aTag','aShell'].map(n=>g.getAttribLocation(this.program,n));this.uniforms={};for(const n of ['uMatrix','uEye','uActive','uCutaway','uLines','uSolid'])this.uniforms[n]=g.getUniformLocation(this.program,n);
  this.buffers={};for(const key of ['solid','edges','route']){const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,this.data[key],g.STATIC_DRAW);this.buffers[key]=b;}
  g.clearColor(.008,.022,.018,1);g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.enable(g.BLEND);
 }
 setState(partial){Object.assign(this.state,partial);this.draw();}
 resize(w,h){this.width=Math.max(1,w);this.height=Math.max(1,h);const dpr=Math.min(window.devicePixelRatio||1,1.5);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.draw();}
 matrices(){const s=this.state,aspect=this.width/this.height,base=Math.max(36,29/Math.max(.55,aspect)),distance=base/s.zoom;this.eye=[distance*Math.sin(s.az)*Math.cos(s.el)+s.panX,distance*Math.sin(s.el)+1+s.panY,distance*Math.cos(s.az)*Math.cos(s.el)];this.matrix=mul(perspective(44*D,aspect,.15,180),lookAt(this.eye,[s.panX,1+s.panY,0]));}
 draw(){if(!this.alive||!this.width||this.gl.isContextLost())return;const g=this.gl,s=this.state;this.matrices();g.viewport(0,0,this.canvas.width,this.canvas.height);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(this.program);const u=this.uniforms;g.uniformMatrix4fv(u.uMatrix,false,this.matrix);g.uniform3fv(u.uEye,this.eye);g.uniform1f(u.uActive,s.active);g.uniform1f(u.uCutaway,s.cutaway?1:0);g.uniform1f(u.uSolid,s.solid?1:0);
  const draw=(key,mode)=>{g.bindBuffer(g.ARRAY_BUFFER,this.buffers[key]);const sizes=[3,3,4,1,1];let offset=0;this.attrs.forEach((a,i)=>{if(a>=0){g.enableVertexAttribArray(a);g.vertexAttribPointer(a,sizes[i],g.FLOAT,false,48,offset*4);}offset+=sizes[i];});g.drawArrays(mode,0,this.data[key].length/12);};
  g.depthMask(s.solid);g.blendFunc(g.SRC_ALPHA,s.solid?g.ONE_MINUS_SRC_ALPHA:g.ONE);g.uniform1f(u.uLines,0);g.enable(g.POLYGON_OFFSET_FILL);g.polygonOffset(1,1);draw('solid',g.TRIANGLES);g.disable(g.POLYGON_OFFSET_FILL);
  g.depthMask(false);g.blendFunc(g.SRC_ALPHA,g.ONE);g.uniform1f(u.uLines,1);draw('edges',g.LINES);
  if(s.route){g.disable(g.DEPTH_TEST);draw('route',g.LINES);g.enable(g.DEPTH_TEST);}
  g.depthMask(true);this.draws++;
 }
 project(id){const p=this.data.positions[id];if(!p||!this.matrix)return null;const q=transform(this.matrix,p);return{x:(q[0]/q[3]*.5+.5)*this.width,y:(.5-q[1]/q[3]*.5)*this.height,z:q[2]/q[3],inFront:q[3]>0};}
 statistics(){return{engine:'WebGL',triangles:this.data.solid.length/36,lineSegments:this.data.edges.length/24,draws:this.draws,contextLost:this.gl.isContextLost(),bufferBytes:this.data.solid.byteLength+this.data.edges.byteLength+this.data.route.byteLength};}
 dispose(){if(!this.alive)return;const g=this.gl;Object.values(this.buffers).forEach(b=>g.deleteBuffer(b));g.deleteProgram(this.program);this.alive=false;}
}
window.ANI_WEBGL={Scene,buildScene,math:{mul,perspective,lookAt,transform}};
})();
