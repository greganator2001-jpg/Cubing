// ---- Cross trainer (Drill tab, 3x3): scramble, optional 15 s planning, time only the cross, then see the best cross ----
// The app holds the cube yellow on top, green in front, so the white cross is solved on the bottom (sticker colour 'D').
const CX={tbl:null,slots:null,slotIx:null,mt:null,moves:[]};
function cxBuild(){if(CX.tbl)return;
  // the 24 edge-sticker places (position + facing); the white edge state = where its 4 white stickers are
  const sl=[];for(const s of solvedCube()){if(s.p.filter(v=>v!==0).length===2)sl.push(s.p.join()+'|'+s.n.join());}
  CX.slots=sl;CX.slotIx={};sl.forEach((k,i)=>CX.slotIx[k]=i);
  for(const f of 'UDRLFB')for(const n of [1,2,-1])CX.moves.push([f,n]);
  CX.mt=CX.moves.map(([f,n])=>{const[ax,q,pred]=MOVES[f];return sl.map(k=>{const[p,nn]=k.split('|').map(x=>x.split(',').map(Number));
    return pred(p)?CX.slotIx[rot(p,ax,q*n).join()+'|'+rot(nn,ax,q*n).join()]:CX.slotIx[k];});});
  const dist=new Uint8Array(24**4).fill(255),home=cxHome();const enc=a=>((a[0]*24+a[1])*24+a[2])*24+a[3];
  let fr=[home];dist[enc(home)]=0;
  for(let d=0;fr.length;d++){const nx=[];for(const s of fr)for(const t of CX.mt){const a=[t[s[0]],t[s[1]],t[s[2]],t[s[3]]],e=enc(a);if(dist[e]===255){dist[e]=d+1;nx.push(a);}}fr=nx;}
  CX.tbl=dist;CX.enc=enc;}
// where the white stickers of the 4 white edges sit (fixed order: by home position)
function cxHome(){return solvedCube().filter(s=>s.c==='D'&&s.p.filter(v=>v!==0).length===2).sort((a,b)=>a.h<b.h?-1:1).map(s=>CX.slotIx[s.p.join()+'|'+s.n.join()]);}
function cxOf(state){return state.filter(s=>s.c==='D'&&s.h.split(',').filter(v=>v!=='0').length===2).sort((a,b)=>a.h<b.h?-1:1).map(s=>CX.slotIx[s.p.join()+'|'+s.n.join()]);}
const cxDist=a=>CX.tbl[CX.enc(a)];
const cxStep=(a,m)=>{const t=CX.mt[m];return[t[a[0]],t[a[1]],t[a[2]],t[a[3]]];};
const cxTok=m=>{const[f,n]=CX.moves[m];return f+(n===2?'2':n<0?"'":'');};
// every shortest cross, best-feeling first (fewer B/D turns and regrips)
function cxSolve(a,limit=60){const out=[],path=[];const d0=cxDist(a);
  (function go(s,d,last){if(out.length>=limit)return;if(d===0){out.push(path.slice());return;}
    for(let m=0;m<18;m++){const f=CX.moves[m][0];if(f===last)continue;const b=cxStep(s,m);if(cxDist(b)===d-1){path.push(m);go(b,d-1,f);path.pop();}}})(a,d0,'');
  const cost={R:0,U:0,L:.4,F:.6,D:.8,B:1.6};
  return out.map(p=>({moves:p.map(cxTok).join(' '),score:p.reduce((s,m)=>s+cost[CX.moves[m][0]]+(Math.abs(CX.moves[m][1])===2?.2:0),0)})).sort((x,y)=>x.score-y.score).map(x=>x.moves);}
// random-move scramble; with a length chosen, keep trying until the cross needs exactly that many moves
function cxScramble(len){cxBuild();const F='UDRLFB',ax={U:0,D:0,R:1,L:1,F:2,B:2},sfx=['',"'",'2'];
  for(let tries=0;tries<40000;tries++){const mv=[];let a=cxHome(),p1='',p2='';
    while(mv.length<22){const f=F[Math.floor(Math.random()*6)];if(f===p1||(ax[f]===ax[p1]&&ax[p1]===ax[p2]&&f===p2)||(ax[f]===ax[p1]&&f===p2))continue;
      const k=sfx[Math.floor(Math.random()*3)];mv.push(f+k);a=cxStep(a,CX.moves.findIndex(([g,n])=>g===f&&(k===''?n===1:k==='2'?n===2:n===-1)));p2=p1;p1=f;}
    if(!len||cxDist(a)===len)return mv.join(' ');}
  return null;}
// ---- the trainer itself ----
var cx={on:store.get('crossMode',false),scr:'',st:null,best:[],d:0,insp:false,armed:false,insp0:0,raf:0,pen:'',last:null,times:store.get('cross',[])};
function crossMode(){return !!(cx&&cx.on)&&cubeN===3;}
function crossLayout(){const on=crossMode();$('view-drill').classList.toggle('cross',on);
  document.querySelectorAll('[data-dmode]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.dmode==='cross')===on));$('dModes').hidden=cubeN!==3;
  $('btnSkip').textContent=on?'New scramble':'Next case';$('sessLabel').textContent=on?'Cross times':'This session';$('logLabel').textContent=on?'Recent crosses':'Recent solves';
  $('dSolLabel').textContent=on?'Best cross':'Solution';$('secChips').hidden=on||view()==='timer'||view()==='learn';if(typeof dnfSync==='function')dnfSync();}
function crossNew(){if(!crossMode())return;cx.scr=cxScramble(+$('cxLen').value)||cxScramble(0);cx.st=applyAlg(solvedCube(),cx.scr);
  cx.d=cxDist(cxOf(cx.st));cx.best=cxSolve(cxOf(cx.st));cx.peek=false;
  $('cxScr').textContent=cx.scr;$('cxLenNow').textContent='';$('cxPeek').hidden=false;
  dp.load(cloneSt(cx.st),'full',parseAlg(cx.best[0]||''),'Hidden until you\'ve solved it (or press Show best cross).',E3);
  $('dHint3d').textContent='Your scramble';$('timerHint').textContent=$('cxInsp').checked?'Press space to start 15 s of planning.':'Hold space (or press here), release to start. Stop when the cross is done.';}
function crossCur(){if(!cx.scr){crossNew();return;}dp.load(cloneSt(cx.st),'full',parseAlg(cx.best[0]||''),'Hidden until you\'ve solved it (or press Show best cross).',E3);if(cx.peek)dp.reveal();$('dHint3d').textContent='Your scramble';}
function crossShowBest(st,best,label){const fs=new Set(st.filter(s=>(s.c==='D'&&s.h.split(',').filter(v=>v!=='0').length===2)||s.h.split(',').filter(v=>v!=='0').length===1).map(s=>s.h));
  dp.load(cloneSt(st),'full',parseAlg(best[0]||''),'',E3,fs);dp.reveal();$('dHint3d').textContent=label;
  $('cxSols').innerHTML=best.length>1?'<span class="label">Other ways, same length</span>'+best.slice(1,4).map((m,i)=>`<button class="linkbtn mono" data-cxalt="${i+1}">${m}</button>`).join(''):'';}
function crossRecord(ms){cx.insp=false;cancelAnimationFrame(cx.raf);
  const s={t:ms,pen:cx.pen||'',mv:cx.d,at:Date.now(),scr:cx.scr};if(s.pen&&cx.penWhy){s.why=cx.penWhy.why;s.secs=cx.penWhy.secs;}cx.pen='';cx.penWhy=null;cx.times.push(s);if(cx.times.length>2000)cx.times.splice(0,cx.times.length-2000);store.set('cross',cx.times);
  dlog.push({k:'cross',t:ms,at:s.at});store.set('dlog',dlog);renderStreak();
  cx.last={st:cx.st,best:cx.best,d:cx.d,scr:cx.scr,t:ms,pen:s.pen};
  $('cxResult').hidden=false;$('cxResTxt').innerHTML=`<b>${s.pen==='DNF'?'DNF':fmt(ms+(s.pen==='+2'?2000:0))+(s.pen==='+2'?'+':'')}</b>${s.pen?' <span class="pw'+(s.pen==='DNF'?' dnf':'')+'" style="display:inline">'+penLong(s)+'</span>':''} · the best cross was <b>${cx.d} move${cx.d===1?'':'s'}</b>${cx.peek?' (you peeked)':''}. Press Play to watch it.`;
  crossShowBest(cx.st,cx.best,'Last scramble · best cross');
  // next scramble is ready in the box; the cube keeps showing the one you just did
  cx.scr=cxScramble(+$('cxLen').value)||cxScramble(0);cx.st=applyAlg(solvedCube(),cx.scr);cx.d=cxDist(cxOf(cx.st));cx.best=cxSolve(cxOf(cx.st));cx.peek=false;
  $('cxScr').textContent=cx.scr;$('cxScrLabel').textContent='Next scramble · yellow top, green front';
  $('timerHint').textContent=`Cross in ${fmt(ms)}. Next scramble is up.`;crossRender();}
function crossRender(){setTimeout(dnfSync,0);const L=cx.times,val=x=>x.pen==='DNF'?Infinity:x.t+(x.pen==='+2'?2000:0),ts=L.map(val);
  const ao=n=>{if(ts.length<n)return null;const a=ts.slice(-n).sort((x,y)=>x-y).slice(1,-1);return a.some(v=>v===Infinity)?Infinity:a.reduce((x,y)=>x+y,0)/a.length;};
  const f=v=>v==null?'—':v===Infinity?'DNF':fmt(v);
  $('sCount').textContent=L.length;$('sAo5').textContent=f(ao(5));$('sAo12').textContent=f(ao(12));
  $('log').innerHTML=L.length?L.slice().reverse().slice(0,40).map((s,i)=>`<li><span>${s.mv} move${s.mv===1?'':'s'}</span><span><span class="t">${s.pen==='DNF'?'DNF':fmt(val(s))+(s.pen==='+2'?'+':'')}</span>${s.pen?`<span class="pw${s.pen==='DNF'?' dnf':''}">${penLabel(s)}</span>`:''}<button data-cxdel="${L.length-1-i}" aria-label="Delete">✕</button></span></li>`).join(''):'<li class="empty">No crosses yet. Scramble your cube, solve just the white cross on the bottom, stop the timer.</li>';
  const fin=L.filter(x=>x.pen!=='DNF');$('cxBest').textContent=fin.length?fmt(Math.min(...fin.map(val))):'—';
  const r=L.slice(-12);$('cxAvgMv').textContent=r.length?(r.reduce((a,b)=>a+b.mv,0)/r.length).toFixed(1):'—';}
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
$('dModes').addEventListener('click',e=>{const b=e.target.closest('[data-dmode]');if(!b)return;b.blur();if(tState!=='idle'&&tState!=='stopped')return;crossSet(b.dataset.dmode==='cross');});
$('cxLen').value=String(store.get('crossLen',0));$('cxLen').onchange=e=>{e.target.blur();store.set('crossLen',+e.target.value);crossNew();};
$('cxInsp').checked=store.get('crossInsp',false);$('cxInsp').onchange=e=>{e.target.blur();store.set('crossInsp',e.target.checked);cx.insp=false;cancelAnimationFrame(cx.raf);crossNew();};
$('cxPeek').onclick=e=>{e.currentTarget.blur();cx.peek=true;crossShowBest(cx.st,cx.best,'This scramble · best cross');$('cxPeek').hidden=true;};
$('cxSols').addEventListener('click',e=>{const b=e.target.closest('[data-cxalt]');if(!b)return;b.blur();const L=$('dHint3d').textContent.startsWith('Last')&&cx.last?cx.last:{st:cx.st,best:cx.best};
  dp.load(cloneSt(L.st),'full',parseAlg(L.best[+b.dataset.cxalt]),'',E3,dp.cube&&dp.cube.focus);dp.reveal();dp.run(0);});
$('log').addEventListener('click',e=>{const b=e.target.closest('[data-cxdel]');if(!b)return;const s=cx.times[+b.dataset.cxdel];cx.times.splice(+b.dataset.cxdel,1);store.set('cross',cx.times);
  if(s){const j=dlog.findIndex(x=>x.k==='cross'&&x.at===s.at);if(j>=0){dlog.splice(j,1);store.set('dlog',dlog);}}crossRender();});

crossLayout();if(crossMode()){crossNew();crossRender();}
