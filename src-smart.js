// ---- Smart cube (GAN Gen2/3/4, MoYu AI 2023) over Web Bluetooth ----
// The cube reports moves in its own frame (white top, green front). The app's frame is yellow top,
// green front, which is the cube's frame turned over (z2): U<->D and R<->L swap, F and B stay.
const SMART_MAP={U:'D',D:'U',R:'L',L:'R',F:'F',B:'B'};
const smartMove=m=>{const f=SMART_MAP[m[0]];return f?f+m.slice(1):null;};
// Kociemba facelet string (cube frame) -> sticker state in the app's frame
const KOC_ORDER='URFDLB';
function kocPos(face,r,c){switch(face){
  case 'U':return[[c-1,1,r-1],[0,1,0]];case 'R':return[[1,1-r,1-c],[1,0,0]];case 'F':return[[c-1,1-r,1],[0,0,1]];
  case 'D':return[[c-1,-1,1-r],[0,-1,0]];case 'L':return[[-1,1-r,c-1],[-1,0,0]];case 'B':return[[1-c,1-r,-1],[0,0,-1]];}}
function stateFromFacelets(str){const st=solvedCube();const at={};for(const s of st)at[s.p.join()+'|'+s.n.join()]=s;
  for(let f=0;f<6;f++)for(let i=0;i<9;i++){const [p,n]=kocPos(KOC_ORDER[f],Math.floor(i/3),i%3);
    const P=[-p[0],-p[1],p[2]],N=[-n[0],-n[1],n[2]];const s=at[P.join()+'|'+N.join()];if(s)s.c=SMART_MAP[str[f*9+i]]||s.c;}
  return st;}
function faceletsFromState(st){const at={};for(const s of st)at[s.p.join()+'|'+s.n.join()]=s.c;const inv={};for(const k in SMART_MAP)inv[SMART_MAP[k]]=k;let out='';
  for(let f=0;f<6;f++)for(let i=0;i<9;i++){const [p,n]=kocPos(KOC_ORDER[f],Math.floor(i/3),i%3);out+=inv[at[[-p[0],-p[1],p[2]].join()+'|'+[-n[0],-n[1],n[2]].join()]];}
  return out;}
// colour of every sticker slot, so states can be compared regardless of how they were built
const stKey=st=>{const at={};for(const s of st)at[s.p.join()+'|'+s.n.join()]=s.c;return Object.keys(at).sort().map(k=>at[k]).join('');};
const solvedKey=stKey(solvedCube());
function isSolvedState(st){const by={};for(const s of st){const k=s.n.join();if(!by[k])by[k]=s.c;else if(by[k]!==s.c)return false;}return true;}
// CFOP checkpoints on the bottom (white) face for auto splits
function cfopStage(st){const at={};for(const s of st)at[s.p.join()+'|'+s.n.join()]=s.c;const col=(p,n)=>at[p.join()+'|'+n.join()];
  const D=col([0,-1,0],[0,-1,0]);const cross=[[0,-1,1],[0,-1,-1],[1,-1,0],[-1,-1,0]].every(p=>col(p,[0,-1,0])===D&&(()=>{const side=[p[0],0,p[2]];return col(p,side)===col(side,side);})());
  if(!cross)return 0;
  let f2l=true;for(const s of st){if(s.p[1]===1)continue;const ctr=s.n.map(v=>v);if(col(ctr,ctr)!==s.c){f2l=false;break;}}
  if(!f2l)return 1;
  const U=col([0,1,0],[0,1,0]);if(!st.filter(s=>s.n[1]===1).every(s=>s.c===U))return 2;
  return isSolvedState(st)?4:3;}
const smart={conn:null,name:'',state:null,phase:'off',target:null,moves:[],t0:0,battery:null};
function smartStatus(msg){$('smStatus').textContent=msg;}
function smartRender(){const on=!!smart.conn;$('smConnect').textContent=on?'Disconnect':'🔗 Smart cube';$('smChip').hidden=!on;
  if(on)$('smChip').textContent=`${smart.name}${smart.battery!=null?' · '+smart.battery+'%':''} · ${({scramble:'scramble to match',ready:'ready: first turn starts',solving:'timing',done:'solved'})[smart.phase]||''}`;}
async function smartConnect(){if(smart.conn){try{smart.conn.disconnect();}catch(e){}smart.conn=null;smart.phase='off';smartRender();return;}
  if(!navigator.bluetooth){toast('Bluetooth is not available on this device.');return;}
  if(typeof GanBT==='undefined'){toast('Smart cube support did not load.');return;}
  $('smPick').hidden=false;$('smList').innerHTML='<li class="note">Looking for cubes… turn yours to wake it up.</li>';
  try{const conn=await GanBT.connectGanCube(async(device,fallback)=>{const saved=store.get('mac:'+device.id,null);if(saved&&!fallback)return saved;if(!fallback)return null;
      const m=await askMac(device.name);if(m)store.set('mac:'+device.id,m);return m;});
    $('smPick').hidden=true;smart.conn=conn;smart.name=conn.deviceName||'Smart cube';
    conn.events$.subscribe(smartEvent);await conn.sendCubeCommand({type:'REQUEST_FACELETS'});try{await conn.sendCubeCommand({type:'REQUEST_BATTERY'});}catch(e){}
    smartArm();toast('Connected to '+smart.name);}
  catch(err){$('smPick').hidden=true;toast('Could not connect: '+String(err&&err.message||err).slice(0,90));}
  smartRender();}
function askMac(name){return new Promise(res=>{const box=$('smMac');box.hidden=false;$('smMacName').textContent=name||'your cube';$('smMacIn').value='';$('smMacIn').focus();
  $('smMacOk').onclick=()=>{const v=$('smMacIn').value.trim().toUpperCase();box.hidden=true;res(/^([0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/.test(v)?v.replace(/-/g,':'):null);};
  $('smMacNo').onclick=()=>{box.hidden=true;res(null);};});}
function smartEvent(ev){
  if(ev.type==='DISCONNECT'){smart.conn=null;smart.phase='off';smartRender();toast('Smart cube disconnected');return;}
  if(ev.type==='BATTERY'){smart.battery=ev.batteryLevel;smartRender();return;}
  if(ev.type==='FACELETS'){smart.state=stateFromFacelets(ev.facelets);smartShow();smartCheck(null);return;}
  if(ev.type==='MOVE'){const mv=smartMove(ev.move);if(!mv||!smart.state)return;applyAlg(smart.state,mv);
    if(tmCube&&!tmPz&&cubeN===3)try{tmCube.play(parseAlg(mv),null,null);}catch(e){}
    smartCheck({move:mv,t:performance.now(),ct:ev.cubeTimestamp});}}
function smartShow(){if(tmCube&&smart.state&&!tmPz&&cubeN===3){tmCube.stop();tmCube.build(cloneSt(smart.state),'full',E3);}}
function smartArm(){if(!smart.conn)return;smart.target=stKey(applyAlg(solvedCube(),tmScr));smart.phase='scramble';smart.moves=[];smartRender();
  $('tmHint').textContent='Smart cube: do the scramble above (yellow top, green front). The timer starts on your first turn after it matches.';}
function smartCheck(m){if(!smart.conn||!smart.state||tmPz||cubeN!==3)return;const key=stKey(smart.state);
  if(smart.phase==='scramble'){if(key===smart.target){smart.phase='ready';smartRender();
      if($('tmInsp').checked&&tm.state!=='insp'){tmPress();tm.armed=true;}
      $('tmHint').textContent='Scrambled! First turn starts the timer.';}return;}
  if(smart.phase==='ready'&&m){smart.phase='solving';smart.moves=[];smart.stage=0;
    const el=tm.inspecting?performance.now()-tm.insp0:0;const pa=penAuto(el);tm.pen=pa.pen;tm.penWhy=pa;tm.inspecting=false;tm.splits=[];
    tm.t0=performance.now();tmSet('running');cancelAnimationFrame(tm.raf);tmLoop();smartRender();}
  if(smart.phase==='solving'&&m){smart.moves.push([m.move,Math.round(m.t-tm.t0)]);
    if($('tmSplits').value==='cfop'){const stg=cfopStage(smart.state);while(tm.splits.length<Math.min(stg,3)&&tm.state==='running'){tm.splits.push(m.t-tm.t0);}}
    if(isSolvedState(smart.state)){smart.phase='done';tmPress();const L=tmList();const s=L[L.length-1];if(s){s.moves=smart.moves.slice();s.smart=1;store.set('solves',solves);tmRender();}
      setTimeout(()=>{smartArm();},300);}
    smartRender();}}
// replay a solve that has recorded moves
function replaySolve(s){if(!tmCube||!s.moves)return;tmCube.stop();tmCube.build(applyAlg(solvedCube(),s.scr),'full',E3);
  const toks=s.moves.map(m=>parseAlg(m[0])[0]);let i=0;const t0=performance.now();
  (function step(){if(i>=toks.length)return;const due=s.moves[i][1];if(performance.now()-t0>=due){tmCube.ms=90;tmCube.play([toks[i]],null,null);i++;}requestAnimationFrame(step);})();}
