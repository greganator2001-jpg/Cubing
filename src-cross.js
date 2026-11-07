// ---- Cross trainer (Drill tab, 3x3): scramble, optional 15 s planning, time only the cross (or X-cross), then see the best one ----
// The app holds the cube yellow on top, green in front. A cross colour is "held on the bottom" by a whole-cube rotation first
// (white needs none), and every solution is written for the cube held that way.
const CX={tbl:null,slots:null,slotIx:null,mt:null,moves:[]};
function cxBuild(){if(CX.tbl)return;
  // the 24 edge-sticker places (position + facing); a cross = where its 4 bottom-colour stickers are
  const sl=[];for(const s of solvedCube()){if(s.p.filter(v=>v!==0).length===2)sl.push(s.p.join()+'|'+s.n.join());}
  CX.slots=sl;CX.slotIx={};sl.forEach((k,i)=>CX.slotIx[k]=i);
  for(const f of 'UDRLFB')for(const n of [1,2,-1])CX.moves.push([f,n]);
  CX.mt=CX.moves.map(([f,n])=>{const[ax,q,pred]=MOVES[f];return sl.map(k=>{const[p,nn]=k.split('|').map(x=>x.split(',').map(Number));
    return pred(p)?CX.slotIx[rot(p,ax,q*n).join()+'|'+rot(nn,ax,q*n).join()]:CX.slotIx[k];});});
  const dist=new Uint8Array(24**4).fill(255),home=cxOf(solvedCube());const enc=a=>((a[0]*24+a[1])*24+a[2])*24+a[3];
  let fr=[home];dist[enc(home)]=0;
  for(let d=0;fr.length;d++){const nx=[];for(const s of fr)for(const t of CX.mt){const a=[t[s[0]],t[s[1]],t[s[2]],t[s[3]]],e=enc(a);if(dist[e]===255){dist[e]=d+1;nx.push(a);}}fr=nx;}
  CX.tbl=dist;CX.enc=enc;}
// where the 4 bottom-colour edge stickers are (fixed order: by home position). Works on a "framed" state too.
function cxOf(state){return state.filter(s=>s.n0==='0,-1,0'&&s.h.split(',').filter(v=>v!=='0').length===2).sort((a,b)=>a.h<b.h?-1:1).map(s=>CX.slotIx[s.p.join()+'|'+s.n.join()]);}
const cxDist=a=>CX.tbl[CX.enc(a)];
const cxStep=(a,m)=>{const t=CX.mt[m];return[t[a[0]],t[a[1]],t[a[2]],t[a[3]]];};
const cxTok=m=>{const[f,n]=CX.moves[m];return f+(n===2?'2':n<0?"'":'');};
const CX_COST={R:0,U:0,L:.4,F:.6,D:.8,B:1.6};
const cxScore=mv=>mv.split(' ').filter(Boolean).reduce((s,t)=>s+CX_COST[t[0]]+(t[1]==='2'?.2:0),0);
// every shortest cross, best-feeling first (fewer B/D turns and regrips)
function cxSolve(a,limit=60){const out=[],path=[];const d0=cxDist(a);
  (function go(s,d,last){if(out.length>=limit)return;if(d===0){out.push(path.slice());return;}
    for(let m=0;m<18;m++){const f=CX.moves[m][0];if(f===last)continue;const b=cxStep(s,m);if(cxDist(b)===d-1){path.push(m);go(b,d-1,f);path.pop();}}})(a,d0,'');
  return out.map(p=>p.map(cxTok).join(' ')).sort((x,y)=>cxScore(x)-cxScore(y));}
// ---- holding another colour on the bottom: rotate the whole state (positions AND home labels) ----
const CX_ROT={D:'',U:'x2',F:"x'",B:'x',R:'z',L:"z'"},CX_NAME={D:'white',U:'yellow',F:'green',B:'blue',R:'orange',L:'red'};
const cxRotFn=alg=>{const toks=alg?parseAlg(alg):[];return v=>{for(const[f,n]of toks){const[ax,q]=MOVES[f];v=rot(v,ax,q*n);}return v;};};
function cxFrame(st,alg){const R=cxRotFn(alg);return st.map(s=>({p:R(s.p),n:R(s.n),c:s.c,h:R(s.h.split(',').map(Number)).join(),n0:R(s.n0.split(',').map(Number)).join(),oh:s.oh||s.h}));}
const cxFaceOf=n=>({'0,1,0':'U','0,-1,0':'D','1,0,0':'R','-1,0,0':'L','0,0,1':'F','0,0,-1':'B'})[n.join()];
// moves found with the cube turned by y^k, written back for the cube held normally
function cxUnY(mv,k){if(!k)return mv;const map={};for(const f of 'UDRLFB')map[f]=cxFaceOf(rot(FACE_N[f],'y',k));return mv.split(' ').filter(Boolean).map(t=>map[t[0]]+t.slice(1)).join(' ');}
const cxSlotName=k=>{const p=rot([1,0,1],'y',k);return (p[2]>0?'front':'back')+'-'+(p[0]>0?'right':'left');};
// ---- X-cross solver (cross + the front-right pair), run in a worker so the 3-second table build doesn't freeze the app ----
function xcCore(scope){
  const FN={U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1]};
  const MV={R:['x',-1,p=>p[0]===1],L:['x',1,p=>p[0]===-1],U:['y',-1,p=>p[1]===1],D:['y',1,p=>p[1]===-1],F:['z',-1,p=>p[2]===1],B:['z',1,p=>p[2]===-1]};
  const r1=(v,ax)=>{const[x,y,z]=v;return ax==='x'?[x,-z,y]:ax==='y'?[z,y,-x]:[-y,x,z];};
  const rt=(v,ax,q)=>{q=((q%4)+4)%4;for(let i=0;i<q;i++)v=r1(v,ax);return v;};
  const solved=[];for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){const p=[x,y,z];for(const f in FN){const n=FN[f],i=n.findIndex(c=>c!==0);if(p[i]===n[i])solved.push({p,n,h:p.join(),n0:n.join()});}}
  const mk=nz=>{const sl=solved.filter(s=>s.p.filter(v=>v).length===nz).map(s=>s.p.join()+'|'+s.n.join());const SI={};sl.forEach((k,i)=>SI[k]=i);return SI;};
  const ES=mk(2),CS=mk(3);const moves=[];for(const f of 'UDRLFB')for(const n of [1,2,-1])moves.push([f,n]);
  const tab=SI=>moves.map(([f,n])=>{const[ax,q,pred]=MV[f];const t=new Uint8Array(24);for(const k in SI){const[p,nn]=k.split('|').map(x=>x.split(',').map(Number));t[SI[k]]=pred(p)?SI[rt(p,ax,q*n).join()+'|'+rt(nn,ax,q*n).join()]:SI[k];}return t;});
  const me=tab(ES),mc=tab(CS);
  const crossH=solved.filter(s=>s.n0==='0,-1,0'&&s.p.filter(v=>v).length===2).sort((a,b)=>a.h<b.h?-1:1).map(s=>s.h+'#'+s.n0);
  const keyOf=(st)=>{const at={};for(const s of st){const nz=s.p.filter(v=>v).length;if(nz===2)at[s.h+'#'+s.n0]=ES[s.p.join()+'|'+s.n.join()];else if(nz===3)at[s.h+'#'+s.n0]=CS[s.p.join()+'|'+s.n.join()];}
    return[...crossH.map(k=>at[k]),at['1,0,1#0,0,1'],at['1,-1,1#0,-1,0']];};
  let Tce=null,Tcc=null;
  function bfs(start,tabs){const k=start.length,d=new Uint8Array(24**k).fill(255);const enc=a=>a.reduce((x,v)=>x*24+v,0);let fr=[enc(start)];d[fr[0]]=0;const a=new Array(k);
    for(let depth=0;fr.length;depth++){const nx=[];for(const e of fr){let x=e;for(let i=k-1;i>=0;i--){a[i]=x%24;x=(x-a[i])/24;}
      for(let m=0;m<18;m++){let y=0;for(let i=0;i<k;i++)y=y*24+tabs[i][m][a[i]];if(d[y]===255){d[y]=depth+1;nx.push(y);}}}fr=nx;}return d;}
  function build(){if(Tce)return;const h=keyOf(solved);Tce=bfs(h.slice(0,5),[me,me,me,me,me]);Tcc=bfs([...h.slice(0,4),h[5]],[me,me,me,me,mc]);}
  const tok=m=>moves[m][0]+(moves[m][1]===2?'2':moves[m][1]<0?"'":'');
  function solve(st){build();const a0=keyOf(st);const H=a=>{const b=(((a[0]*24+a[1])*24+a[2])*24+a[3])*24;return Math.max(Tce[b+a[4]],Tcc[b+a[5]]);};
    const path=[];let found=null;
    function dfs(a,g,bd,last){const h=H(a);if(g+h>bd)return false;if(h===0){found=path.slice();return true;}
      for(let m=0;m<18;m++){const f=moves[m][0];if(f===last)continue;const te=me[m],tc=mc[m];path.push(m);if(dfs([te[a[0]],te[a[1]],te[a[2]],te[a[3]],te[a[4]],tc[a[5]]],g+1,bd,f))return true;path.pop();}return false;}
    for(let bd=H(a0);bd<17;bd++){if(dfs(a0,0,bd,''))return{len:bd,moves:found.map(tok).join(' ')};}return null;}
  if(scope&&typeof scope.postMessage==='function'&&typeof scope.document==='undefined')scope.onmessage=e=>{const{id,jobs}=e.data;scope.postMessage({id,out:jobs.map(solve)});};
  return{solve,build};}
let xcW=null,xcLocal=null,xcSeq=0;const xcWait={};
function xcRun(jobs){return new Promise(res=>{
  const local=()=>{xcLocal=xcLocal||xcCore(null);res(jobs.map(j=>xcLocal.solve(j)));};
  if(xcW===false)return setTimeout(local,30);
  try{if(!xcW){xcW=new Worker(URL.createObjectURL(new Blob(['('+xcCore.toString()+')(self);'],{type:'text/javascript'})));
      xcW.onmessage=e=>{const f=xcWait[e.data.id];delete xcWait[e.data.id];f&&f(e.data.out);};
      xcW.onerror=()=>{xcW=false;for(const k in xcWait){const f=xcWait[k];delete xcWait[k];f(null);}};}
    const id=++xcSeq;xcWait[id]=out=>out?res(out):local();xcW.postMessage({id,jobs:jobs.map(st=>st.map(s=>({p:s.p,n:s.n,h:s.h,n0:s.n0})))});}
  catch(e){xcW=false;local();}});}
// ---- options for one scramble: which colour, which slot, best moves ----
function cxColors(){return $('cxCN').checked?['D','U','F','B','R','L']:['D'];}
function cxCrossOpts(st){const out=[];for(const c of cxColors()){const fs=cxFrame(st,CX_ROT[c]);const a=cxOf(fs);const sols=cxSolve(a);
    const focus=new Set(fs.filter(s=>(s.n0==='0,-1,0'&&s.h.split(',').filter(v=>v!=='0').length===2)||s.h.split(',').filter(v=>v!=='0').length===1).map(s=>s.oh));
    out.push({col:c,rot:CX_ROT[c],len:cxDist(a),moves:sols[0]||'',alts:sols.slice(1,4),focus});}
  return out.sort((x,y)=>x.len-y.len||(x.col==='D'?-1:y.col==='D'?1:0)||cxScore(x.moves)-cxScore(y.moves));}
async function cxXOpts(st){const jobs=[],meta=[];
  for(const c of cxColors()){const fs=cxFrame(st,CX_ROT[c]);for(let k=0;k<4;k++){const f2=cxFrame(fs,'y '.repeat(k).trim());jobs.push(f2);meta.push({c,k,fs,f2});}}
  const res=await xcRun(jobs);const out=[];
  res.forEach((r,i)=>{if(!r)return;const{c,k,fs,f2}=meta[i];
    const pair=new Set(f2.filter(s=>s.h==='1,0,1'||s.h==='1,-1,1').map(s=>s.oh));
    const focus=new Set(fs.filter(s=>(s.n0==='0,-1,0'&&s.h.split(',').filter(v=>v!=='0').length===2)||s.h.split(',').filter(v=>v!=='0').length===1).map(s=>s.oh));pair.forEach(h=>focus.add(h));
    out.push({col:c,rot:CX_ROT[c],len:r.len,moves:cxUnY(r.moves,k),slot:cxSlotName(k),alts:[],focus});});
  out.sort((x,y)=>x.len-y.len||(x.col==='D'?-1:y.col==='D'?1:0)||cxScore(x.moves)-cxScore(y.moves));
  // other slots / colours of the same best length become the "other ways"
  if(out.length)out[0].alts=out.slice(1).filter(o=>o.len===out[0].len).slice(0,3).map(o=>o);return out;}
const cxIsX=()=>$('cxKind').value==='xcross';
const cxOptLabel=o=>(cxColors().length>1||o.col!=='D'?CX_NAME[o.col]+' cross'+(o.rot?' (turn the cube '+o.rot+' first)':''):'')+(o.slot?(cxColors().length>1||o.col!=='D'?', ':'')+o.slot+' pair':'');
const cxAlg=o=>(o.rot?o.rot+' ':'')+o.moves;
// random-move scramble; with a length chosen, keep trying until the (best) cross needs exactly that many moves
function cxScramble(len){cxBuild();const F='UDRLFB',ax={U:0,D:0,R:1,L:1,F:2,B:2},sfx=['',"'",'2'];
  // per colour: the cross state in that colour's frame, and how each face turn reads in that frame
  const fr=cxColors().map(c=>{const R=cxRotFn(CX_ROT[c]);const map={};for(const f of F)map[f]=cxFaceOf(R(FACE_N[f]));return{a0:cxOf(cxFrame(solvedCube(),CX_ROT[c])),map};});
  const mIx=(f,k)=>CX.moves.findIndex(([g,n])=>g===f&&(k===''?n===1:k==='2'?n===2:n===-1));
  for(let tries=0;tries<40000;tries++){const mv=[];let as=fr.map(x=>x.a0.slice()),p1='',p2='';
    while(mv.length<22){const f=F[Math.floor(Math.random()*6)];if(f===p1||(ax[f]===ax[p1]&&ax[p1]===ax[p2]&&f===p2)||(ax[f]===ax[p1]&&f===p2))continue;
      const k=sfx[Math.floor(Math.random()*3)];mv.push(f+k);if(len&&!cxIsX())as=as.map((a,i)=>cxStep(a,mIx(fr[i].map[f],k)));p2=p1;p1=f;}
    if(!len||cxIsX()||Math.min(...as.map(cxDist))===len)return mv.join(' ');}
  return null;}
// ---- the trainer itself ----
var cx={on:store.get('crossMode',false),scr:'',st:null,cur:null,curP:null,insp:false,armed:false,insp0:0,raf:0,pen:'',last:null,times:store.get('cross',[])};
function crossMode(){return !!(cx&&cx.on)&&cubeN===3;}
function crossLayout(){const on=crossMode();$('view-drill').classList.toggle('cross',on);
  document.querySelectorAll('[data-dmode]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.dmode==='cross')===on));$('dModes').hidden=cubeN!==3;
  $('btnSkip').textContent=on?'New scramble':'Next case';$('sessLabel').textContent=on?'Cross times':'This session';$('logLabel').textContent=on?'Recent crosses':'Recent solves';
  $('dSolLabel').textContent=on?(cxIsX()?'Best X-cross':'Best cross'):'Solution';$('secChips').hidden=on||view()==='timer'||view()==='learn';
  const X=cxIsX(),CN=$('cxCN').checked;$('cxTitle').textContent=X?(CN?'Solve the cross and one pair, any color':'Solve the white cross and one pair'):(CN?'Solve a cross, any color':'Solve only the white cross');
  $('cxSub').textContent='Cross trainer · '+(X?'X-cross':'cross')+(CN?' · color neutral':' · white on the bottom');$('cxLenWrap').hidden=X;$('cxPeek').textContent=X?'Show best X-cross':'Show best cross';
  if(typeof dnfSync==='function')dnfSync();}
// work out the answers for a scramble (cross: instant; X-cross: in the worker)
function cxPrepare(scr){const st=applyAlg(solvedCube(),scr);const kind=cxIsX()?'xcross':'cross',cn=$('cxCN').checked;
  const p=kind==='xcross'?cxXOpts(st):Promise.resolve(cxCrossOpts(st));
  return p.then(opts=>({scr,st,opts,best:opts[0],kind,cn}));}
const CX_HIDDEN='Hidden until you\'ve solved it (or press Show best).';
function crossNew(){if(!crossMode())return;cx.scr=cxScramble(+$('cxLen').value)||cxScramble(0);cx.st=applyAlg(solvedCube(),cx.scr);cx.peek=false;cx.cur=null;
  $('cxScr').textContent=cx.scr;$('cxPeek').hidden=false;dp.load(cloneSt(cx.st),'full',[],CX_HIDDEN,E3);$('dHint3d').textContent='Your scramble';
  $('timerHint').textContent=$('cxInsp').checked?'Press space to start 15 s of planning.':'Hold space (or press here), release to start. Stop when the '+(cxIsX()?'cross and pair are':'cross is')+' done.';
  const scr=cx.scr;$('cxLenNow').textContent=cxIsX()?(xcLocal||xcW?'Working out the best X-cross…':'Getting the X-cross solver ready (first time takes a few seconds)…'):'';
  cx.curP=cxPrepare(scr).then(inf=>{if(cx.scr!==scr)return inf;cx.cur=inf;$('cxLenNow').textContent='';
    if(!$('dHint3d').textContent.startsWith('Last')){dp.load(cloneSt(inf.st),'full',parseAlg(cxAlg(inf.best)),CX_HIDDEN,E3);if(cx.peek)crossShowBest(inf,'This scramble · best '+(inf.kind==='xcross'?'X-cross':'cross'));}return inf;});}
function crossCur(){if(!cx.scr){crossNew();return;}if(cx.cur){dp.load(cloneSt(cx.st),'full',parseAlg(cxAlg(cx.cur.best)),CX_HIDDEN,E3);if(cx.peek)dp.reveal();}else dp.load(cloneSt(cx.st),'full',[],CX_HIDDEN,E3);$('dHint3d').textContent='Your scramble';}
function crossShowBest(inf,label){const o=inf.best;dp.load(cloneSt(inf.st),'full',parseAlg(cxAlg(o)),'',E3,o.focus);dp.reveal();$('dHint3d').textContent=label;
  const lab=cxOptLabel(o);$('cxBestFor').textContent=lab?'For: '+lab:'';
  const alts=o.alts.map(a=>typeof a==='string'?{...o,moves:a,alts:[]}:a);cx.altList={inf,alts};
  $('cxSols').innerHTML=alts.length?'<span class="label">Other ways, same length</span>'+alts.map((a,i)=>`<button class="linkbtn mono" data-cxalt="${i}">${cxAlg(a)}${a.col!==o.col||a.slot!==o.slot?' <span class="note">· '+cxOptLabel(a)+'</span>':''}</button>`).join(''):'';
  // colour-neutral: how every colour compares
  const cmp=inf.opts.length>1?inf.opts.reduce((m,x)=>{const k=x.col;if(!(k in m)||x.len<m[k])m[k]=x.len;return m;},{}):null;
  $('cxCmp').innerHTML=cmp&&inf.cn?'<span class="label">Every color</span> '+Object.entries(cmp).sort((a,b)=>a[1]-b[1]).map(([c,l])=>`<span class="cxc"><i style="background:${COLORS[c]}"></i>${CX_NAME[c]} ${l}</span>`).join(''):'';}
function crossRecord(ms){cx.insp=false;cancelAnimationFrame(cx.raf);const scr=cx.scr,peek=cx.peek,X=cxIsX();
  const s={t:ms,pen:cx.pen||'',mv:0,at:Date.now(),scr,kind:X?'xcross':'cross',cn:$('cxCN').checked||undefined};if(s.pen&&cx.penWhy){s.why=cx.penWhy.why;s.secs=cx.penWhy.secs;}cx.pen='';cx.penWhy=null;
  cx.times.push(s);if(cx.times.length>2000)cx.times.splice(0,cx.times.length-2000);
  dlog.push({k:'cross',t:ms,at:s.at});store.set('dlog',dlog);renderStreak();
  const p=cx.curP;$('cxResult').hidden=false;$('cxResTxt').textContent='Working out the best one…';
  p.then(inf=>{s.mv=inf.best?inf.best.len:0;if(inf.best&&inf.cn)s.col=inf.best.col;store.set('cross',cx.times);crossRender();cx.last=inf;
    $('cxResTxt').innerHTML=`<b>${s.pen==='DNF'?'DNF':fmt(ms+(s.pen==='+2'?2000:0))+(s.pen==='+2'?'+':'')}</b>${s.pen?' <span class="pw'+(s.pen==='DNF'?' dnf':'')+'" style="display:inline">'+penLong(s)+'</span>':''} · the best ${X?'X-cross':'cross'} was <b>${s.mv} move${s.mv===1?'':'s'}</b>${peek?' (you peeked)':''}. Press Play to watch it.`;
    crossShowBest(inf,'Last scramble · best '+(X?'X-cross':'cross'));});
  store.set('cross',cx.times);crossRender();
  // next scramble is ready in the box; the cube keeps showing the one you just did
  $('dHint3d').textContent='Last scramble';crossNewQuiet();$('cxScrLabel').textContent='Next scramble · yellow top, green front';
  $('timerHint').textContent=`${X?'X-cross':'Cross'} in ${fmt(ms)}. Next scramble is up.`;}
function crossNewQuiet(){cx.scr=cxScramble(+$('cxLen').value)||cxScramble(0);cx.st=applyAlg(solvedCube(),cx.scr);cx.peek=false;cx.cur=null;$('cxScr').textContent=cx.scr;$('cxPeek').hidden=false;
  const scr=cx.scr;cx.curP=cxPrepare(scr).then(inf=>{if(cx.scr===scr)cx.cur=inf;return inf;});}
function crossRender(){setTimeout(dnfSync,0);const L=cx.times,val=x=>x.pen==='DNF'?Infinity:x.t+(x.pen==='+2'?2000:0),ts=L.map(val);
  const ao=n=>{if(ts.length<n)return null;const a=ts.slice(-n).sort((x,y)=>x-y).slice(1,-1);return a.some(v=>v===Infinity)?Infinity:a.reduce((x,y)=>x+y,0)/a.length;};
  const f=v=>v==null?'—':v===Infinity?'DNF':fmt(v);
  $('sCount').textContent=L.length;$('sAo5').textContent=f(ao(5));$('sAo12').textContent=f(ao(12));
  const tag=s=>(s.kind==='xcross'?'X · ':'')+(s.mv?s.mv+' move'+(s.mv===1?'':'s'):'…')+(s.col&&s.col!=='D'?' · '+CX_NAME[s.col]:'');
  $('log').innerHTML=L.length?L.slice().reverse().slice(0,40).map((s,i)=>`<li><span>${tag(s)}</span><span><span class="t">${s.pen==='DNF'?'DNF':fmt(val(s))+(s.pen==='+2'?'+':'')}</span>${s.pen?`<span class="pw${s.pen==='DNF'?' dnf':''}">${penLabel(s)}</span>`:''}<button data-cxdel="${L.length-1-i}" aria-label="Delete">✕</button></span></li>`).join(''):'<li class="empty">No crosses yet. Scramble your cube, solve just the cross on the bottom, stop the timer.</li>';
  const fin=L.filter(x=>x.pen!=='DNF');$('cxBest').textContent=fin.length?fmt(Math.min(...fin.map(val))):'—';
  const r=L.slice(-12).filter(x=>x.mv);$('cxAvgMv').textContent=r.length?(r.reduce((a,b)=>a+b.mv,0)/r.length).toFixed(1):'—';}
// planning (inspection): first press starts 15 s, then hold and release to start the timer like normal
function crossPress(){if(!$('cxInsp').checked)return false;
  if(!cx.insp){cx.insp=true;cx.armed=false;cx.insp0=performance.now();$('timerHint').textContent='Planning… hold space when ready, release to start.';
    const loop=()=>{if(!cx.insp)return;const el=(performance.now()-cx.insp0)/1000;if(tState!=='running'&&tState!=='hold'&&tState!=='ready')timeEl.textContent=el<15?String(Math.ceil(15-el)):el<17?'+2':'DNF';
      timerEl.classList.toggle('insp',el<8&&tState==='idle'||el<8&&tState==='stopped');timerEl.classList.toggle('warn',el>=8&&(tState==='idle'||tState==='stopped'));cx.raf=requestAnimationFrame(loop);};
    setT('idle');loop();return true;}
  return !cx.armed;}
function crossRelease(){if(cx.insp&&!cx.armed&&tState!=='hold'&&tState!=='ready'){cx.armed=true;return true;}
  if(cx.insp&&tState==='ready'){const el=performance.now()-cx.insp0;const pa=penAuto(el);cx.pen=pa.pen;cx.penWhy=pa;cx.insp=false;cancelAnimationFrame(cx.raf);timerEl.classList.remove('insp','warn');}
  return false;}
function crossSet(on){cx.on=on;store.set('crossMode',on);crossLayout();if(crossMode()){crossNew();crossRender();$('cxResult').hidden=true;$('cxScrLabel').textContent='Scramble · yellow top, green front';}else{renderSession();loadCase();}}
function crossRestart(){crossLayout();$('cxResult').hidden=true;$('cxScrLabel').textContent='Scramble · yellow top, green front';crossNew();}
$('dModes').addEventListener('click',e=>{const b=e.target.closest('[data-dmode]');if(!b)return;b.blur();if(tState!=='idle'&&tState!=='stopped')return;crossSet(b.dataset.dmode==='cross');});
$('cxLen').value=String(store.get('crossLen',0));$('cxLen').onchange=e=>{e.target.blur();store.set('crossLen',+e.target.value);crossNew();};
$('cxKind').value=store.get('crossKind','cross');$('cxKind').onchange=e=>{e.target.blur();store.set('crossKind',e.target.value);crossRestart();};
$('cxCN').checked=store.get('crossCN',false);$('cxCN').onchange=e=>{e.target.blur();store.set('crossCN',e.target.checked);crossRestart();};
$('cxInsp').checked=store.get('crossInsp',false);$('cxInsp').onchange=e=>{e.target.blur();store.set('crossInsp',e.target.checked);cx.insp=false;cancelAnimationFrame(cx.raf);crossNew();};
$('cxPeek').onclick=e=>{e.currentTarget.blur();cx.peek=true;$('cxPeek').hidden=true;cx.curP.then(inf=>{if(cx.scr===inf.scr)crossShowBest(inf,'This scramble · best '+(inf.kind==='xcross'?'X-cross':'cross'));});};
$('cxSols').addEventListener('click',e=>{const b=e.target.closest('[data-cxalt]');if(!b||!cx.altList)return;b.blur();const a=cx.altList.alts[+b.dataset.cxalt];
  dp.load(cloneSt(cx.altList.inf.st),'full',parseAlg(cxAlg(a)),'',E3,a.focus);dp.reveal();dp.run(0);});
$('log').addEventListener('click',e=>{const b=e.target.closest('[data-cxdel]');if(!b)return;const s=cx.times[+b.dataset.cxdel];cx.times.splice(+b.dataset.cxdel,1);store.set('cross',cx.times);
  if(s){const j=dlog.findIndex(x=>x.k==='cross'&&x.at===s.at);if(j>=0){dlog.splice(j,1);store.set('dlog',dlog);}}crossRender();});

crossLayout();if(crossMode()){crossNew();crossRender();}
