// ---- NxN cube engine (4x4, 5x5…) ----
// Coordinates are doubled so every cubie sits on an integer: for size N they run -(N-1)…(N-1) in steps of 2.
// A token is [face, lo, hi, amount]: turn layers lo..hi (1 = outer layer) of that face.
const NX_FACE={R:['x',-1,1],L:['x',1,-1],U:['y',-1,1],D:['y',1,-1],F:['z',-1,1],B:['z',1,-1]};
const NX_AX={x:0,y:1,z:2};
function nxSolved(N){const s=[],m=N-1;
  for(let x=-m;x<=m;x+=2)for(let y=-m;y<=m;y+=2)for(let z=-m;z<=m;z+=2){const p=[x,y,z];
    for(const f in FACE_N){const n=FACE_N[f];const i=n.findIndex(c=>c!==0);
      if(p[i]===n[i]*m)s.push({p:p.slice(),n:n.slice(),c:f,h:p.join(',')});}}
  return s;}
function nxParse(str,N){
  const words=str.replace(/[()\[\]]/g,' ').replace(/’/g,"'").trim().split(/\s+/).filter(Boolean);
  const re=/^(\d*)([RLUDFBMESxyzrludfb])(w?)(\d*)('?)$/;const out=[];
  for(const wd of words){const m=wd.match(re);if(!m)throw new Error('Unrecognized move "'+wd+'"');
    let amt=m[4]===''?1:parseInt(m[4],10);if(m[5])amt=-amt;
    const pre=m[1]?parseInt(m[1],10):null,ch=m[2],w=!!m[3];
    if('xyz'.includes(ch)){out.push([ch,1,N,amt]);continue;}
    if('MES'.includes(ch)){if(N%2===0)throw new Error(ch+' slices need an odd-sized cube');
      const f={M:'L',E:'D',S:'F'}[ch],k=(N+1)/2;out.push([f,k,k,amt]);continue;}
    const F=ch.toUpperCase(),lower=ch!==F;
    if(lower||w){const hi=pre||2;out.push([F,1,hi,amt]);}      // r, Rw, 3Rw: outer layers
    else if(pre){out.push([F,pre,pre,amt]);}                   // 2R: that inner layer only
    else out.push([F,1,1,amt]);}
  for(const t of out)if(t[2]>N||t[1]<1)throw new Error('That layer is outside a '+N+'x'+N);
  return out;}
function nxInfo(tk,N){const[f,lo,hi,a]=tk;
  if('xyz'.includes(f))return[f,-a,()=>true];
  const[ax,dir,sgn]=NX_FACE[f],i=NX_AX[ax],m=N-1;
  const vals=[];for(let k=lo;k<=hi;k++)vals.push(sgn*(m-2*(k-1)));
  return[ax,dir*a,p=>vals.includes(p[i])];}
function nxApply(state,toks,N){if(typeof toks==='string')toks=nxParse(toks,N);
  for(const tk of toks){const[ax,q,pred]=nxInfo(tk,N);
    for(const s of state)if(pred(s.p)){s.p=rot(s.p,ax,q);s.n=rot(s.n,ax,q);}}
  return state;}
function nxTokStr(tk,N){const[f,lo,hi,a]=tk;const q=((a%4)+4)%4;if(!q)return'';
  const suf=q===1?'':q===2?'2':"'";
  if('xyz'.includes(f))return f+suf;
  if(N%2===1&&lo===hi&&lo===(N+1)/2&&'LDF'.includes(f))return{L:'M',D:'E',F:'S'}[f]+suf;
  let base;if(lo===1&&hi===1)base=f;else if(lo===1)base=(hi===2?'':hi)+f+'w';else if(lo===hi)base=lo+f;else base=lo+'-'+hi+f+'w';
  return base+suf;}
function nxInvert(toks){return toks.slice().reverse().map(([f,lo,hi,a])=>[f,lo,hi,-a]);}
function nxSimplify(toks){const out=[];for(const t of toks){const l=out[out.length-1];
  if(l&&l[0]===t[0]&&l[1]===t[1]&&l[2]===t[2]){l[3]+=t[3];if(((l[3]%4)+4)%4===0)out.pop();}else out.push(t.slice());}
  return out.filter(t=>((t[3]%4)+4)%4!==0);}
// Rewrite without x/y/z so a setup keeps the cube's orientation.
function nxNoRot(toks,N){const dir={};for(const f in FACE_N)dir[f]=FACE_N[f].slice();
  const faceAt=v=>Object.keys(dir).find(f=>dir[f].join()===v.join());const out=[];
  for(const[f,lo,hi,a]of toks){if('xyz'.includes(f)){const[ax,q]=nxInfo([f,lo,hi,a],N);for(const k in dir)dir[k]=rot(dir[k],ax,q);continue;}
    out.push([faceAt(FACE_N[f]),lo,hi,a]);}
  return out;}
// Face colours of a big cube come from its pieces, not fixed centres: use the D-L-B corner.
function nxFaceColors(st,N){const m=N-1,k=[-m,-m,-m].join(','),col={};
  for(const s of st)if(s.p.join(',')===k)col[s.n.join(',')]=s.c;
  const opp={U:'D',D:'U',R:'L',L:'R',F:'B',B:'F'};
  col['0,1,0']=opp[col['0,-1,0']];col['1,0,0']=opp[col['-1,0,0']];col['0,0,1']=opp[col['0,0,-1']];return col;}
function nxSolvedState(st,N){const col=nxFaceColors(st,N);return st.every(s=>s.c===col[s.n.join(',')]);}
if(typeof module!=='undefined')module.exports={nxSolved,nxParse,nxApply,nxTokStr,nxInvert,nxSimplify,nxNoRot,nxSolvedState,nxFaceColors,nxInfo};
