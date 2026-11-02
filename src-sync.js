// ---- Sync between the PC app and the phone version through one JSON file ----
// PC: the file lives in a folder you pick (OneDrive, Google Drive…) and is kept up to date automatically.
// Phone: open that file from the same cloud folder, and save it back after practicing.
const SYNC_FILE='LastLayerLab-sync.json';
function syncDump(){const data={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('lll:')&&!/^lll:(syncDir|syncAt|tmRun|mac:)/.test(k))data[k.slice(4)]=JSON.parse(localStorage.getItem(k));}}catch(e){}
  return{app:'last-layer-lab',kind:'sync',version:1,savedAt:Date.now(),device:window.desktop?'pc':'phone',data};}
function syncMerge(L,R){const out=Object.assign({},R,L);   // settings: this device wins, missing keys come from the other
  const uni=(a,b,key)=>{const m=new Map();for(const x of (b||[]))m.set(key(x),x);for(const x of (a||[]))m.set(key(x),x);return[...m.values()];};
  // timer solves: every solve from both sides
  const S={};for(const k of new Set([...Object.keys(L.solves||{}),...Object.keys(R.solves||{})]))S[k]=uni((L.solves||{})[k],(R.solves||{})[k],x=>(x.at||0)+'|'+Math.round(x.t)).sort((a,b)=>(a.at||0)-(b.at||0));
  out.solves=S;
  const TS={};for(const k of new Set([...Object.keys(L.tmSessions||{}),...Object.keys(R.tmSessions||{})])){const a=(L.tmSessions||{})[k],b=(R.tmSessions||{})[k];
    if(!a||!b){TS[k]=a||b;continue;}const list=uni(a.list,b.list,x=>x.id).sort((x,y)=>x.id-y.id);TS[k]={list,cur:a.cur,next:Math.max(a.next||0,b.next||0,...list.map(x=>x.id+1))};}
  out.tmSessions=TS;
  // drill reps: union of the rep log; case averages rebuilt from it
  out.dlog=uni(L.dlog,R.dlog,x=>x.k+'|'+x.at+'|'+x.t).sort((a,b)=>a.at-b.at).slice(-6000);
  const st=Object.assign({},R.stats||{},L.stats||{});const byK={};for(const r of out.dlog)(byK[r.k]=byK[r.k]||[]).push(r.t);
  for(const k in byK)if(byK[k].length>=((st[k]||[]).length))st[k]=byK[k].slice(-50);out.stats=st;
  // spaced repetition: keep whichever side reviewed the case more recently
  const srs=Object.assign({},R.srs||{});for(const k in (L.srs||{})){const a=L.srs[k],b=srs[k];if(!b||((a.last||a.due||0)>=(b.last||b.due||0)))srs[k]=a;}out.srs=srs;
  const learn=Object.assign({},R.learn||{});for(const k in (L.learn||{}))learn[k]=[...new Set([...(learn[k]||[]),...L.learn[k]])];out.learn=learn;
  const comps={};for(const k of new Set([...Object.keys(L.comps||{}),...Object.keys(R.comps||{})]))comps[k]=uni((L.comps||{})[k],(R.comps||{})[k],x=>x.at).sort((a,b)=>a.at-b.at);out.comps=comps;
  out.notes=Object.assign({},R.notes||{},L.notes||{});out.alts=Object.assign({},R.alts||{},L.alts||{});
  out.custom=uni(L.custom,R.custom,x=>x.name);
  return out;}
const canon=v=>Array.isArray(v)?'['+v.map(canon).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}':JSON.stringify(v);
function syncApply(remote){if(!remote||remote.app!=='last-layer-lab'||!remote.data)return false;const local=syncDump().data;const merged=syncMerge(local,remote.data);
  let changed=false;
  try{for(const k in merged){if(merged[k]===undefined)continue;if(canon(merged[k])!==canon(local[k])){localStorage.setItem('lll:'+k,JSON.stringify(merged[k]));changed=true;}}}catch(e){return false;}
  return changed;}
// PC side
let syncDir=store.get('syncDir',null),syncT=null,syncBusy=false;
function syncStatus(t){const el=$('syncMsg');if(el)el.textContent=t;}
async function syncWriteNow(){if(!syncDir||!window.desktop||!window.desktop.syncWrite)return;syncBusy=true;const ok=await window.desktop.syncWrite(syncDir,JSON.stringify(syncDump()));
  setTimeout(()=>syncBusy=false,2500);store.set('syncAt',Date.now());syncStatus(ok?'Synced '+new Date().toLocaleTimeString():'Could not write the sync file.');}
async function syncPull(reloadIfChanged){if(!syncDir||!window.desktop||!window.desktop.syncRead)return;const txt=await window.desktop.syncRead(syncDir);if(!txt){syncWriteNow();return;}
  let remote=null;try{remote=JSON.parse(txt);}catch(e){return;}
  if(remote.device==='pc'&&remote.savedAt<=(store.get('syncAt',0)+5000)){return;}   // our own write
  if(syncApply(remote)){if(reloadIfChanged&&!(tm.state==='running'||tState==='running')){try{sessionStorage.setItem('lll-synced','1');}catch(e){}location.reload();return;}}
  syncWriteNow();}
const _set=store.set;store.set=(k,v)=>{_set(k,v);if(syncDir&&k!=='syncAt'&&k!=='tmRun'){clearTimeout(syncT);syncT=setTimeout(syncWriteNow,4000);}};
function syncRender(){const pc=!!(window.desktop&&window.desktop.syncPick);$('syncPc').hidden=!pc;$('syncWeb').hidden=pc;
  if(pc)$('syncDir').textContent=syncDir?syncDir:'No folder chosen yet';}
if(window.desktop&&window.desktop.syncPick){
  $('syncChoose').onclick=async()=>{const d=await window.desktop.syncPick();if(!d)return;syncDir=d;store.set('syncDir',d);syncRender();await window.desktop.syncWatch(d);await syncPull(true);};
  $('syncNow').onclick=()=>syncPull(true);
  $('syncOff').onclick=()=>{syncDir=null;store.set('syncDir',null);window.desktop.syncWatch(null);syncRender();syncStatus('Sync is off.');};
  window.desktop.onSyncChanged(()=>{if(!syncBusy)syncPull(true);});
  if(syncDir){window.desktop.syncWatch(syncDir);setTimeout(()=>syncPull(true),1500);}
}
// phone / web side: open the file from the cloud folder, save it back
$('syncOpen').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{let o=null;try{o=JSON.parse(r.result);}catch(err){toast('That is not a Last Layer Lab sync file.');return;}
    if(syncApply(o)){try{sessionStorage.setItem('lll-synced','1');}catch(err){}location.reload();}else toast('Already up to date.');};r.readAsText(f);e.target.value='';});
$('syncSave').onclick=()=>{const blob=new Blob([JSON.stringify(syncDump())],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=SYNC_FILE;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);};
syncRender();try{if(sessionStorage.getItem('lll-synced')){sessionStorage.removeItem('lll-synced');setTimeout(()=>toast('Synced with your other device'),800);}}catch(e){}
