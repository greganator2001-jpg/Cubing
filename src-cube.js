// ---- Cube model: sticker list with 3D position + normal ----
const FACE_N = {U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1]};
const MOVES = {
  R:['x',-1,p=>p[0]===1], L:['x',1,p=>p[0]===-1], M:['x',1,p=>p[0]===0],
  U:['y',-1,p=>p[1]===1], D:['y',1,p=>p[1]===-1], E:['y',1,p=>p[1]===0],
  F:['z',-1,p=>p[2]===1], B:['z',1,p=>p[2]===-1], S:['z',-1,p=>p[2]===0],
  r:['x',-1,p=>p[0]>=0], l:['x',1,p=>p[0]<=0], u:['y',-1,p=>p[1]>=0],
  d:['y',1,p=>p[1]<=0], f:['z',-1,p=>p[2]>=0], b:['z',1,p=>p[2]<=0],
  x:['x',-1,()=>true], y:['y',-1,()=>true], z:['z',-1,()=>true]
};
function rot1(v,ax){const[x,y,z]=v;
  if(ax==='x')return[x,-z,y]; if(ax==='y')return[z,y,-x]; return[-y,x,z];}
function rot(v,ax,q){q=((q%4)+4)%4;for(let i=0;i<q;i++)v=rot1(v,ax);return v;}
function solvedCube(){const s=[];
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){const p=[x,y,z];
    for(const f in FACE_N){const n=FACE_N[f];const i=n.findIndex(c=>c!==0);
      if(p[i]===n[i])s.push({p:p.slice(),n:n.slice(),c:f,h:p.join(','),n0:n.join(',')});}}
  return s;}
function parseAlg(str){
  const clean=str.replace(/[()\[\]]/g,' ').replace(/’/g,"'");
  const toks=[];const re=/([RLUDFBMESxyzrludfb])(w?)(\d*)('?)/g;let m,last=0;
  const stripped=clean.replace(/\s+/g,'');
  // validate: everything must be consumed
  let consumed='';
  while((m=re.exec(stripped))){
    let face=m[1];if(m[2])face=face.toLowerCase();
    let n=m[3]===''?1:parseInt(m[3],10);if(m[4])n=-n;
    toks.push([face,n]);consumed+=m[0];}
  if(consumed!==stripped)throw new Error('Unrecognized move near "'+stripped.slice(consumed.length,consumed.length+4)+'"');
  return toks;}
function applyAlg(state,str){const toks=typeof str==='string'?parseAlg(str):str;
  for(const[f,n]of toks){const[ax,q,pred]=MOVES[f];
    for(const s of state)if(pred(s.p)){s.p=rot(s.p,ax,q*n);s.n=rot(s.n,ax,q*n);}}
  return state;}
function tokStr([f,n]){const a=Math.abs(n)%4;const nn=((n%4)+4)%4;
  if(nn===0)return'';if(nn===1)return f;if(nn===2)return f+'2';return f+"'";}
function invertAlg(str){return parseAlg(str).reverse().map(([f,n])=>tokStr([f,-n])).filter(Boolean).join(' ');}
function simplify(toks){const out=[];for(const t of toks){const l=out[out.length-1];
  if(l&&l[0]===t[0]){l[1]+=t[1];if(((l[1]%4)+4)%4===0)out.pop();}else out.push([t[0],t[1]]);}
  return out.map(tokStr).filter(Boolean).join(' ');}
const key=(p,n)=>p.join(',')+'|'+n.join(',');
function centerMap(state){const m={};for(const s of state){if(s.p.filter(c=>c!==0).length===1)m[s.n.join(',')]=s.c;}return m;}
function stickerAt(state){const m={};for(const s of state)m[key(s.p,s.n)]=s.c;return m;}
// Analyse an alg: does it keep F2L solved, is the LL oriented afterwards?
function analyse(str){const st=applyAlg(solvedCube(),str);const cm=centerMap(st);
  let f2l=true,oriented=true;
  for(const s of st){const want=cm[s.n.join(',')];
    if(s.p[1]<=0&&s.c!==want)f2l=false;
    if(s.n[1]===1&&s.c!==want)oriented=false;}
  return{f2l,oriented,upright:cm['0,1,0']==='U'};}
// Rewrite a sequence without x/y/z rotations (same result up to a whole-cube turn), so setups keep green in front.
function noRot(str){const toks=typeof str==='string'?parseAlg(str):str;
  const dir={};for(const f in FACE_N)dir[f]=FACE_N[f].slice();
  const faceAt=v=>Object.keys(dir).find(f=>dir[f].join()===v.join());
  const SL={L:['M',1],R:['M',-1],D:['E',1],U:['E',-1],F:['S',1],B:['S',-1]};
  const out=[];
  for(const[f,n]of toks){
    if('xyz'.includes(f)){const[ax,q]=MOVES[f];for(const k in dir)dir[k]=rot(dir[k],ax,q*n);continue;}
    if('MES'.includes(f)){const o=faceAt(FACE_N[{M:'L',E:'D',S:'F'}[f]]);out.push([SL[o][0],n*SL[o][1]]);continue;}
    const up=f.toUpperCase(),o=faceAt(FACE_N[up]);out.push([f===up?o:o.toLowerCase(),n]);}
  return out;}
// Expand wide and slice moves into face turns + rotations, so scrambles use plain face turns only.
function faceOnly(str){const toks=typeof str==='string'?parseAlg(str):str;const X={
  r:[['L',1],['x',1]],l:[['R',1],['x',-1]],u:[['D',1],['y',1]],d:[['U',1],['y',-1]],f:[['B',1],['z',1]],b:[['F',1],['z',-1]],
  M:[['R',1],['L',-1],['x',-1]],E:[['U',1],['D',-1],['y',-1]],S:[['F',-1],['B',1],['z',1]]};
  const out=[];for(const[f,n]of toks){if(X[f])for(const[g,m]of X[f])out.push([g,m*n]);else out.push([f,n]);}return out;}
if(typeof module!=='undefined')module.exports={faceOnly,solvedCube,applyAlg,parseAlg,invertAlg,simplify,analyse,stickerAt,centerMap,key,noRot,MOVES};
