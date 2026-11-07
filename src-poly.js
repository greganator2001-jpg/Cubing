// ---- 3D models for non-cube puzzles (Pyraminx, Skewb, Megaminx, Kilominx, Dino) ----
// Each face polygon is cut by every turning plane of the puzzle; the pieces left over are the stickers.
// A move rotates every sticker on the far side of one plane. Same geometry and move definitions as tools/sims.
const PolyDefs=(()=>{
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  function splitPoly(poly,n,c){const A=[],B=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=p.dot(n)-c,dq=q.dot(n)-c;
      if(dp>=-1e-9)A.push(p);if(dp<=1e-9)B.push(p);if((dp>1e-9&&dq<-1e-9)||(dp<-1e-9&&dq>1e-9)){const t=dp/(dp-dq);const r=p.clone().lerp(q,t);A.push(r);B.push(r.clone());}}
    return [A,B].filter(x=>x.length>=3&&area(x)>1e-6);}
  function area(poly){let s=V(0,0,0);for(let i=0;i<poly.length;i++)s.add(poly[i].clone().cross(poly[(i+1)%poly.length]));return s.length()/2;}
  function cutAll(faces,planes){let out=[];for(const f of faces){let ps=[f.poly];for(const [n,c] of planes){const nx=[];for(const p of ps)nx.push(...splitPoly(p,n,c));ps=nx;}for(const p of ps)out.push({poly:p,color:f.color});}return out;}
  const cubeFaces=cols=>{const F=[['U',V(0,1,0)],['D',V(0,-1,0)],['R',V(1,0,0)],['L',V(-1,0,0)],['F',V(0,0,1)],['B',V(0,0,-1)]];
    return F.map(([k,n])=>{const u=Math.abs(n.y)>.5?V(1,0,0):V(0,1,0),w=n.clone().cross(u);const poly=[[1,1],[-1,1],[-1,-1],[1,-1]].map(([a,b])=>n.clone().add(u.clone().multiplyScalar(a)).add(w.clone().multiplyScalar(b)));
      return{poly:orient(poly,n),color:cols[k]};});};
  function orient(poly,n){const c=poly.reduce((a,p)=>a.add(p),V(0,0,0)).multiplyScalar(1/poly.length);const t=poly[1].clone().sub(poly[0]).cross(poly[2].clone().sub(poly[1]));return t.dot(n)<0?poly.slice().reverse():poly;}
  const CUBECOL={U:0xffd500,D:0xf4f4f4,R:0xff7a1a,L:0xd0213b,F:0x11a35a,B:0x1e5fd6};
  const corner={UFR:V(1,1,1),UFL:V(-1,1,1),UBR:V(1,1,-1),UBL:V(-1,1,-1),DFR:V(1,-1,1),DFL:V(-1,-1,1),DBR:V(1,-1,-1),DBL:V(-1,-1,-1)};
  function skewb(){const planes=[corner.UFR,corner.UFL,corner.UBR,corner.UBL].map(a=>[a.clone().normalize(),0]);
    const moves={R:[corner.DBR,0],L:[corner.DFL,0],U:[corner.UBL,0],B:[corner.DBL,0]};
    return{stickers:cutAll(cubeFaces(CUBECOL),planes),moves:mk(moves,3),scale:1.15};}
  function dino(){const planes=Object.values(corner).map(a=>[a.clone().normalize(),1/Math.sqrt(3)]);
    const moves={};for(const k in corner)moves[k]=[corner[k],1/Math.sqrt(3)+1e-6];
    const cols={U:0xffd500,D:0xf4f4f4,R:0xff7a1a,L:0xd0213b,F:0x11a35a,B:0x1e5fd6};
    // match the guide's notation: R = top-front-right corner, B = top-back-right corner
    return{stickers:cutAll(cubeFaces(cols),planes),moves:Object.assign(mk(moves,3),mk({R:[corner.UFR,1/Math.sqrt(3)+1e-6],B:[corner.UBR,1/Math.sqrt(3)+1e-6]},3)),scale:1.15};}
  function mk(defs,order){const m={};for(const k in defs){const[a,c]=defs[k];m[k]={axis:a.clone().normalize(),cut:c,ang:-2*Math.PI/order};}return m;}
  function pyraminx(layers=3){ // U on top, one face toward the viewer
    const r=Math.sqrt(8)/3,h=-1/3,vs={U:V(0,1,0),B:V(0,h,-r),L:V(-r*Math.sin(Math.PI/3)*1,h,r/2),R:V(r*Math.sin(Math.PI/3),h,r/2)};
    const faces=[['F',['U','L','R'],0x11a35a],['Lf',['U','B','L'],0xd0213b],['Rf',['U','R','B'],0x1e5fd6],['D',['L','B','R'],0xffd500]].map(([k,ids,col])=>{const poly=ids.map(i=>vs[i].clone());const n=poly[0].clone().add(poly[1]).add(poly[2]);return{poly:orient(poly,n),color:col};});
    const planes=[],moves={};const top=1,bot=-1/3,step=(top-bot)/layers;
    // 3 layers: u = tip, U = tip + middle. Master (4 layers): u = tip, U = 2 layers, Uw = 3 layers (all but the bottom row)
    for(const k in vs){const a=vs[k].clone().normalize();for(let d=1;d<layers;d++)planes.push([a,top-d*step]);
      moves[k.toLowerCase()]={axis:a,cut:top-step+1e-6,ang:-2*Math.PI/3};moves[k]={axis:a,cut:top-2*step+1e-6,ang:-2*Math.PI/3};if(layers>3)moves[k+'w']={axis:a,cut:top-3*step+1e-6,ang:-2*Math.PI/3};}
    return{stickers:cutAll(faces,planes),moves,scale:2.1};}
  function megaminx(kilo){const phi=(1+Math.sqrt(5))/2;let N=[];for(const a of[-1,1])for(const b of[-1,1])N.push(V(0,a*phi,b),V(a*phi,b,0),V(b,0,a*phi));N=N.map(n=>n.normalize());
    // turn it so one face points straight up and a neighbour faces the viewer
    const up=N[0].clone();const q=new THREE.Quaternion().setFromUnitVectors(up,V(0,1,0));N=N.map(n=>n.applyQuaternion(q));
    const adj0=N.filter(n=>Math.abs(n.y-1)>1e-6&&n.y>.3);const f=adj0.reduce((a,b)=>Math.atan2(b.x,b.z)**2<Math.atan2(a.x,a.z)**2?b:a);const yaw=-Math.atan2(f.x,f.z);const qy=new THREE.Quaternion().setFromAxisAngle(V(0,1,0),yaw);N=N.map(n=>n.applyQuaternion(qy));
    const verts=[];for(const s of[[1,1,1]])0;const vv=[];for(const x of[-1,1])for(const y of[-1,1])for(const z of[-1,1])vv.push(V(x,y,z));for(const a of[-1,1])for(const b of[-1,1])vv.push(V(0,a/phi,b*phi),V(a/phi,b*phi,0),V(b*phi,0,a/phi));
    const VV=vv.map(v=>v.applyQuaternion(q).applyQuaternion(qy));const rin=Math.max(...VV.map(v=>v.dot(N[0])));
    const COL=[0xf4f4f4,0xffd500,0x11a35a,0xd0213b,0x1e5fd6,0xff7a1a,0x7fd36b,0xff8fc2,0xb24ad8,0x7ec8ff,0xf2c48d,0x9a9a9a];
    const faces=N.map((n,i)=>{const fv=VV.filter(v=>Math.abs(v.dot(n)-rin)<1e-6);const c=n.clone().multiplyScalar(rin);const u=fv[0].clone().sub(c).normalize(),w=n.clone().cross(u);
      fv.sort((a,b)=>Math.atan2(a.clone().sub(c).dot(w),a.clone().sub(c).dot(u))-Math.atan2(b.clone().sub(c).dot(w),b.clone().sub(c).dot(u)));return{poly:orient(fv,n),color:COL[i]};});
    const cut=rin*(kilo?.4472:.72);const planes=N.map(n=>[n,cut]);const named=nameMega(N);
    const moves={};for(const k in named)moves[k]={axis:N[named[k]],cut:cut+1e-6,ang:-2*Math.PI/5};
    let st=kilo?faces.flatMap(f=>{const P=f.poly,c=P.reduce((a,p)=>a.add(p),V(0,0,0)).multiplyScalar(1/P.length);return P.map((v,i)=>({poly:[v.clone(),v.clone().lerp(P[(i+1)%5],.5),c.clone(),v.clone().lerp(P[(i+4)%5],.5)],color:f.color}));}):cutAll(faces,planes);
    return{stickers:st,moves,scale:1.0};}
  function nameMega(N){const up=V(0,1,0);const U=N.reduce((b,n,i)=>n.dot(up)>N[b].dot(up)?i:b,0);const adj=N.map((n,i)=>i).filter(i=>i!==U&&N[i].dot(N[U])>.3);
    const F=adj.reduce((b,i)=>N[i].z>N[b].z?i:b,adj[0]);const rl=adj.filter(i=>N[i].dot(N[F])>.3);const R=rl.reduce((b,i)=>N[i].x>N[b].x?i:b,rl[0]),L=rl.reduce((b,i)=>N[i].x<N[b].x?i:b,rl[0]);
    const D=N.reduce((b,n,i)=>n.dot(up)<N[b].dot(up)?i:b,0);const low=N.map((n,i)=>i).filter(i=>i!==U&&i!==D&&!adj.includes(i));
    const DR=low.find(i=>N[i].dot(N[F])>.3&&N[i].dot(N[R])>.3),DL=low.find(i=>N[i].dot(N[F])>.3&&N[i].dot(N[L])>.3);
    const br=adj.filter(i=>![F,R,L].includes(i));const BR=br.reduce((b,i)=>N[i].x>N[b].x?i:b,br[0]),BL=br.reduce((b,i)=>N[i].x<N[b].x?i:b,br[0]);
    return{U,F,R,L,BR,BL,D,DR,DL};}
  return{pyra:()=>pyraminx(3),mpyra:()=>pyraminx(4),skewb,mega:()=>megaminx(false),kilo:()=>megaminx(true),dino,redi:dino};
})();

class PolyView{
  constructor(el,kind){this.el=el;this.kind=kind;const d=PolyDefs[kind]();this.moves=d.moves;
    this.r=new THREE.WebGLRenderer({antialias:true,alpha:true});this.r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));el.appendChild(this.r.domElement);
    this.scene=new THREE.Scene();this.cam=new THREE.PerspectiveCamera(27,1,.1,100);this.cam.position.set(0,0,9.5);
    this.scene.add(new THREE.AmbientLight(0xffffff,.8));const L=new THREE.DirectionalLight(0xffffff,.35);L.position.set(2,6,9);this.scene.add(L);
    this.root=new THREE.Group();this.root.scale.setScalar(d.scale);this.scene.add(this.root);const V0={pyra:[-1.0,.32],mpyra:[-1.0,.32],mega:[-.35,.42],kilo:[-.35,.42]}[kind]||[-.5,.45];this.yaw=V0[0];this.pitch=V0[1];this.view();
    // black body = convex hull of the sticker polygons, stickers slightly inset on top
    const body=new THREE.MeshLambertMaterial({color:0x101010});this.stickers=[];
    for(const s of d.stickers){const c=s.poly.reduce((a,p)=>a.add(p),new THREE.Vector3()).multiplyScalar(1/s.poly.length);const n=s.poly[1].clone().sub(s.poly[0]).cross(s.poly[2].clone().sub(s.poly[1])).normalize();
      const out=s.poly.map(p=>p.clone().lerp(c,.12).add(n.clone().multiplyScalar(.004)));const g=new THREE.BufferGeometry();const pos=[];for(let i=1;i<out.length-1;i++)pos.push(...out[0].toArray(),...out[i].toArray(),...out[i+1].toArray());
      g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:s.color,side:THREE.DoubleSide}));
      const bg=new THREE.BufferGeometry();const bp=[];for(let i=1;i<s.poly.length-1;i++)bp.push(...s.poly[0].toArray(),...s.poly[i].toArray(),...s.poly[i+1].toArray());bg.setAttribute('position',new THREE.Float32BufferAttribute(bp,3));bg.computeVertexNormals();
      const holder=new THREE.Group();holder.add(new THREE.Mesh(bg,body),m);holder.userData.c=c.clone();this.root.add(holder);this.stickers.push(holder);}
    this.base=this.stickers.map(h=>h.matrix.clone());this.queue=[];this.anim=null;this.ms=420;this.dirty=true;
    let drag=null;el.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch};el.setPointerCapture(e.pointerId);});
    el.addEventListener('pointermove',e=>{if(!drag)return;this.yaw=drag.yaw+(e.clientX-drag.x)*.01;this.pitch=Math.max(-1.4,Math.min(1.4,drag.pitch+(e.clientY-drag.y)*.01));this.view();});
    const end=()=>drag=null;el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
    const fit=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix();this.dirty=true;};
    try{new ResizeObserver(fit).observe(el)}catch(e){}fit();const loop=t=>{if(!this.dead){this.tick(t);requestAnimationFrame(loop);}};requestAnimationFrame(loop);}
  view(){this.root.rotation.set(this.pitch,this.yaw,0,'XYZ');this.dirty=true;}
  center(h){return h.userData.c.clone().applyMatrix4(h.matrix);}
  parse(alg){return alg.replace(/[()]/g,' ').trim().split(/\s+/).filter(Boolean).map(t=>{const m=/^([A-Za-z]+)(\d*)('?)$/.exec(t);if(!m||!this.moves[m[1]])return null;let k=m[2]?+m[2]:1;if(m[3])k=-k;return[m[1],k];}).filter(Boolean);}
  // dim every sticker that is already home, so the ones the demo moves stand out
  setFocus(on){const any=this.stickers.some(h=>this.center(h).distanceTo(h.userData.c)>1e-3);
    for(const h of this.stickers){const m=h.children[1].material;if(!h.userData.col)h.userData.col=m.color.clone();
      const moved=this.center(h).distanceTo(h.userData.c)>1e-3;m.color.copy(h.userData.col);if(on&&any&&!moved){const o=m.color.clone(),l=o.r*.3+o.g*.59+o.b*.11;m.color.setRGB(l,l,l).lerp(o,.22).multiplyScalar(.3);}}this.dirty=true;}
  reset(){this.stop();this.stickers.forEach((h,i)=>{h.matrix.identity();h.matrix.decompose(h.position,h.quaternion,h.scale);});this.dirty=true;}
  applyNow(toks){for(const t of toks)this.turn(t,1);this.dirty=true;}
  turn([name,k],frac){const mv=this.moves[name];const sel=this.stickers.filter(h=>this.center(h).dot(mv.axis)>mv.cut);const q=new THREE.Quaternion().setFromAxisAngle(mv.axis,mv.ang*k*frac);
    for(const h of sel){h.applyQuaternion(q);h.position.applyQuaternion(q);h.updateMatrix();}return sel;}
  play(toks,onStep,onDone){this.queue=toks.slice();this.onStep=onStep;this.onDone=onDone;if(!this.anim)this.next();}
  next(){if(!this.queue.length){this.anim=null;const d=this.onDone;this.onDone=null;d&&d();return;}const tk=this.queue.shift();const mv=this.moves[tk[0]];
    const sel=this.stickers.filter(h=>this.center(h).dot(mv.axis)>mv.cut);this.anim={tk,sel,start:sel.map(h=>[h.position.clone(),h.quaternion.clone()]),t0:performance.now(),ms:this.ms*(Math.abs(tk[1])>1?1.35:1)};}
  stop(){this.queue=[];if(this.anim){const a=this.anim;this.finish(1);this.anim=null;}}
  finish(t){const a=this.anim,mv=this.moves[a.tk[0]];const q=new THREE.Quaternion().setFromAxisAngle(mv.axis,mv.ang*a.tk[1]*t);
    a.sel.forEach((h,i)=>{h.position.copy(a.start[i][0]).applyQuaternion(q);h.quaternion.copy(q).multiply(a.start[i][1]);h.updateMatrix();});this.dirty=true;}
  tick(now){const a=this.anim;if(a){const t=Math.min(1,(now-a.t0)/a.ms),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;this.finish(e);if(t>=1){this.anim=null;this.onStep&&this.onStep(a.tk);this.next();}}
    if(this.dirty){this.r.render(this.scene,this.cam);this.dirty=false;}}
}
