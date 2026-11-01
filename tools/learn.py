# Inserts the Learn tab (puzzle library + beginner guides) into src-body.html. Run after redesign.py.
import json
P = 'src-body.html'
s = open(P).read()


def rep(a, b):
    global s
    assert a in s, 'missing: ' + a[:80]
    s = s.replace(a, b, 1)


css = r'''
/* Learn */
.ln-head{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px 16px}
.ln-title{margin:2px 0 0;font:italic 700 clamp(1.8rem,3.6vw,2.6rem)/1 var(--f-display)}
.ln-kicker{font:700 .72rem var(--f-body);letter-spacing:.14em;color:var(--accent-soft)}
.ln-search{display:flex;align-items:center;gap:8px;background:#15171C;border:1px solid #2A2E37;border-radius:10px;padding:8px 12px;min-width:min(260px,100%);margin-left:auto;color:#6E7580}
.ln-search input{all:unset;flex:1;min-width:0;color:var(--fg);font:500 .95rem var(--f-body)}
.ln-filters{display:flex;flex-wrap:wrap;gap:8px}
.ln-filters button{font:700 .82rem var(--f-body);border:1px solid #2E323A;background:none;color:#7F8794;padding:6px 12px;border-radius:999px;cursor:pointer}
.ln-filters button[aria-pressed="true"]{border-color:var(--accent);background:rgba(47,107,255,.18);color:var(--accent-soft)}
.ln-sec h2{margin:0;font:700 1.1rem var(--f-display);display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.ln-sec h2 small{font:400 .85rem var(--f-body);color:#6E7580}
.ln-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:10px}
.ln-card{position:relative;text-align:left;font:inherit;color:inherit;cursor:pointer;background:var(--surface);border:1px solid #23262E;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:7px;min-width:0}
.ln-card:hover{border-color:#3A3F49;background:#171A20}
.ln-card.started{border-color:var(--accent);box-shadow:0 10px 26px -16px var(--accent)}
.ln-card svg.pz{width:48px;height:51px}
.ln-card .nm{font-weight:700;font-size:1rem}
.ln-card .meta{font-size:.78rem;color:#6E7580}
.ln-card .tag{position:absolute;top:10px;right:10px;font:700 .6rem var(--f-body);letter-spacing:.08em;color:#9AA1AD;background:#1F232B;padding:2px 6px;border-radius:4px}
.ln-card .tag.soon{color:var(--warn);background:rgba(255,176,32,.1)}
.ln-card .done{font-size:.78rem;font-weight:700;color:var(--good)}
.dots{display:flex;gap:4px}.dots i{width:7px;height:7px;border-radius:50%;background:#2E323A}.dots i.on{background:var(--warn)}
.ln-prog{display:flex;align-items:center;gap:8px;font-size:.78rem;font-weight:700;color:var(--accent-soft)}
.ln-prog span{flex:1;height:5px;border-radius:3px;background:#262A32;overflow:hidden}.ln-prog b{display:block;height:100%;background:var(--accent)}
.ln-empty{color:var(--muted);padding:10px 2px}
.gd{display:grid;grid-template-columns:minmax(220px,290px) minmax(0,1fr);gap:18px;align-items:start}
@media (max-width:860px){.gd{grid-template-columns:minmax(0,1fr)}}
.gd-steps{background:var(--surface);border:1px solid #23262E;border-radius:16px;padding:14px 10px;display:flex;flex-direction:column;gap:4px}
.gd-steps ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.gd-steps button{all:unset;box-sizing:border-box;width:100%;cursor:pointer;display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:10px;border:1px solid transparent}
.gd-steps button:hover{background:#171A20}
.gd-steps button[aria-current="step"]{background:#1A1E27;border-color:var(--accent)}
.gd-steps .dot{flex:none;width:30px;height:30px;border-radius:50%;border:2px solid #343842;color:#6E7580;display:grid;place-items:center;font:700 .95rem var(--f-display)}
.gd-steps .ok .dot{background:#11A35A;border-color:#11A35A;color:#0B0C0F}
.gd-steps [aria-current="step"] .dot{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 0 16px -2px var(--accent)}
.gd-steps .t{display:flex;flex-direction:column;min-width:0}.gd-steps .t b{font-size:.95rem;color:#C8CDD5}.gd-steps [aria-current="step"] .t b{color:#fff}
.gd-steps .t small{font:500 .74rem var(--f-mono);color:#6E7580;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gd-tip{margin-top:8px;padding:12px;border-radius:12px;background:rgba(17,163,90,.1);border:1px solid rgba(17,163,90,.35);font-size:.85rem;color:#9FE6C1;line-height:1.45}
.gd-main{display:flex;flex-direction:column;gap:16px;min-width:0}
.gd-hero{position:relative;overflow:hidden;border-radius:18px;border:1px solid #23262E;background:radial-gradient(ellipse 55% 70% at 85% 30%,rgba(47,107,255,.2),rgba(47,107,255,0) 70%),var(--stage);padding:20px 22px;display:flex;flex-direction:column;gap:14px}
.gd-num{position:absolute;right:18px;top:-18px;font:italic 700 9rem/1 var(--f-display);color:transparent;-webkit-text-stroke:1.5px #2A2F3A;pointer-events:none}
.gd-hero h2{position:relative;margin:4px 0 0;font:italic 700 clamp(1.8rem,3.4vw,2.7rem)/1.02 var(--f-display)}
.gd-hero p{position:relative;margin:0;max-width:640px;color:#AEB4BE;font-size:1rem;line-height:1.55}
.gd-pats{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.gd-pat{display:flex;flex-direction:column;align-items:center;gap:6px;background:#0F1116;border:1px solid #262A32;border-radius:12px;padding:10px}
.gd-pat.goal{border-color:rgba(17,163,90,.6)}
.gd-pat span{font-size:.75rem;font-weight:700;color:#9AA1AD}
.gd-arrow{color:#5F6670}
.gd-row{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:16px}
@media (max-width:980px){.gd-row{grid-template-columns:minmax(0,1fr)}}
.gd-row .viewer .cube3d{height:270px}
.gd-moves{display:flex;flex-direction:column;gap:12px}
.gd-algpick{display:flex;flex-wrap:wrap;gap:6px}
.gd-algpick button{font:700 .78rem var(--f-body);border:1px solid #2E323A;background:none;color:#9AA1AD;padding:5px 10px;border-radius:7px;cursor:pointer}
.gd-algpick button[aria-pressed="true"]{border-color:var(--accent);color:#fff;background:rgba(47,107,255,.18)}
.gd-big .alg-line{font-size:1.35rem}
.gd-how{margin:0;color:#AEB4BE;font-size:.95rem;line-height:1.5}
.gd-how b{color:#fff}
.gd-legend{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:.88rem;color:#AEB4BE;align-items:baseline}
.gd-legend b{font:700 1.05rem var(--f-display);color:#fff}
.gd-nav{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.btn.go{border-color:#11A35A;background:rgba(17,163,90,.14);color:#6BE3A6;font-weight:700}
.gd-soon{background:var(--surface);border:1px solid #23262E;border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
'''
rep('</style>', css + '</style>')

markup = '''
  <!-- LEARN -->
  <section id="view-learn" hidden>
    <div id="lnLib" style="display:flex;flex-direction:column;gap:18px">
      <div class="ln-head">
        <div><div class="ln-kicker">LEARN</div><h2 class="ln-title">Learn to solve anything</h2></div>
        <label class="ln-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="lnSearch" placeholder="Search puzzles" aria-label="Search puzzles" autocomplete="off"></label>
      </div>
      <div class="ln-filters" id="lnFilters" role="group" aria-label="Filter puzzles"></div>
      <div id="lnSections" style="display:flex;flex-direction:column;gap:22px"></div>
    </div>
    <div id="lnGuide" hidden style="display:flex;flex-direction:column;gap:16px">
      <div class="top-row"><button class="btn" id="lnBack">← All puzzles</button><span class="ln-prog" id="lnTopProg" style="min-width:180px"></span></div>
      <div class="gd">
        <nav class="gd-steps" aria-label="Steps"><span class="label" id="lnStepsTitle" style="padding:0 10px 6px">Steps</span><ol id="lnSteps"></ol><div class="gd-tip" id="lnTip"></div></nav>
        <div class="gd-main">
          <div class="gd-hero"><span class="gd-num" id="lnNum" aria-hidden="true"></span>
            <span class="ln-kicker" id="lnKicker"></span>
            <h2 id="lnStepTitle"></h2>
            <p id="lnText"></p>
            <div class="gd-pats" id="lnPats"></div>
          </div>
          <div class="gd-row">
            <div class="card2 gd-moves">
              <span class="label" id="lnMovesLabel">The moves</span>
              <div class="gd-algpick" id="lnAlgPick" role="group" aria-label="Which case"></div>
              <div class="gd-big"><div class="alg-line" id="lnAlg"></div></div>
              <p class="gd-how" id="lnHow"></p>
              <div class="gd-legend" id="lnLegend"><b>R</b><span>Turn the right side away from you</span><b>U</b><span>Turn the top to the left</span><b>F</b><span>Turn the front clockwise</span><b>'</b><span>Same face, the other way · 2 means twice</span></div>
            </div>
            <div class="viewer"><div class="cube3d" id="ln3d"></div><span class="drag-hint">Watch it</span>
              <div class="viewer-bar"><button class="btn" id="lnReset">Reset</button><button class="btn" id="lnStep">Step</button><button class="btn primary" id="lnPlay">▶ Show me</button>
                <label class="speed" for="lnSpeed" hidden>Speed <input type="range" id="lnSpeed" min="120" max="900" value="520" style="direction:rtl"></label></div></div>
          </div>
          <div class="gd-nav"><button class="btn" id="lnPrev"></button><button class="btn go" id="lnNext"></button></div>
        </div>
      </div>
    </div>
    <div id="lnSoon" class="gd-soon" hidden></div>
  </section>

  <!-- DRILL -->'''
rep('\n  <!-- DRILL -->', markup)

js = r'''
// ---- Learn: puzzle library + beginner guides ----
const PZ_ICON=__ICONS__;
const pzSvg=(id,cls='pz')=>`<svg class="${cls}" viewBox="0 0 32 34" aria-hidden="true">${PZ_ICON[id]||''}</svg>`;
// id, name, group, difficulty 1-5, rough time to learn
const PUZ=[['3','3x3','wca',2,'an afternoon'],['2','2x2','wca',1,'about an hour'],['pyra','Pyraminx','wca',1,'about 30 min'],['skewb','Skewb','wca',2,'about an hour'],
 ['4','4x4','wca',3,'a weekend'],['5','5x5','wca',3,'a weekend'],['6','6x6','wca',4,'a week'],['7','7x7','wca',4,'a week'],['mega','Megaminx','wca',3,'a weekend'],
 ['sq1','Square-1','wca',4,'a week'],['clock','Clock','wca',2,'about an hour'],['9','9x9','big',5,'a week or more'],
 ['mirror','Mirror Cube','shape',2,'3x3 plus a day'],['ghost','Ghost Cube','shape',5,'a week or more'],['axis','Axis Cube','shape',3,'a weekend'],['fisher','Fisher Cube','shape',2,'3x3 plus a day'],
 ['windmill','Windmill Cube','shape',3,'a weekend'],['morphix','Mastermorphix','shape',3,'a weekend'],['gear','Gear Cube','fun',2,'about an hour'],['ivy','Ivy Cube','fun',1,'about 20 min'],
 ['dino','Dino Cube','fun',2,'about an hour'],['redi','Redi Cube','fun',2,'about an hour'],['kilo','Kilominx','fun',3,'a day'],['mpyra','Master Pyraminx','fun',3,'a day'],
 ['floppy','Floppy 3x3x1','cuboid',1,'about 15 min'],['domino','Domino 3x3x2','cuboid',2,'about an hour'],['tower','Tower 2x2x3','cuboid',2,'about an hour']];
const PZ_GROUPS=[['wca','Official WCA puzzles','The ones you can compete with',['wca','big']],['shape','Shape mods','Change shape when scrambled, but solve like a 3x3',['shape']],
 ['fun','Twisty & fun','Different cuts, mostly beginner-friendly',['fun']],['cuboid','Cuboids','Not every side is square',['cuboid']]];
const Y='#FFD500',_='#2A2E37';
const GUIDES={
 '3':{title:'Solve a 3x3',tip:'Finish all 7 and you can solve it from any scramble. Most people get their first solve in an afternoon.',steps:[
  {t:'White cross',sub:'No moves to learn',k:'FIRST LAYER',text:'Hold the cube with yellow on top. Bring the four white edges up around the yellow center (a "daisy"), then turn each one down when its side color lines up with the center below it. Finish with white on the bottom.',
   how:'There are no moves to memorize here. Take your time and watch how each turn moves the pieces. Play the example to see one edge drop into place.',algs:[['Example edge',"F2"]]},
  {t:'White corners',sub:"R U R' U'",k:'FIRST LAYER',text:'Keep white on the bottom. Find a white corner on top and turn the top until it sits right above where it belongs, at the front-right. Repeat the moves until it drops in with white facing down.',
   how:'Hold the corner at <b>front-right, top</b>. Repeat the moves (up to 6 times) until it is solved. Do the same for the other three corners.',algs:[['Corner trick',"R U R' U'"]]},
  {t:'Middle layer edges',sub:'2 moves sets',k:'SECOND LAYER',text:'Find an edge on top without yellow on it. Turn the top until its front color matches the front center. Then check its top color: does it belong on the right or the left?',
   how:'Edge goes <b>right</b> → use "Right". Edge goes <b>left</b> → use "Left". If an edge is stuck in the middle layer the wrong way, do either one to pop it out, then insert it again.',algs:[['Right',"U R U' R' U' F' U F"],['Left',"U' L' U L U F U' F'"]]},
  {t:'Yellow cross',sub:"F R U R' U' F'",k:'LAST LAYER',text:'Yellow stays on top. Ignore the corners. You only care about the four yellow edge pieces, and one move set walks you through these shapes:',
   pats:[['Dot',[_,_,_,_,Y,_,_,_,_]],['L shape',[_,Y,_,Y,Y,_,_,_,_],1],['Line',[_,_,_,Y,Y,Y,_,_,_]],['Cross',[_,Y,_,Y,Y,Y,_,Y,_],'goal']],
   how:'Hold the <b>L</b> at the back-left, or the <b>line</b> going left to right, then do the moves. Dot? Do it once, then treat it as an L.',algs:[['Yellow cross',"F R U R' U' F'"]]},
  {t:'Yellow edges',sub:"R U R' U R U2 R' U",k:'LAST LAYER',text:'Turn the top until at least two yellow edges match the centers below them. Then swap the other two into place.',
   how:'If the two matching edges are next to each other, hold them at the <b>back and right</b> and do the moves. If they are opposite, do the moves once from anywhere and check again.',algs:[['Swap edges',"R U R' U R U2 R' U"]]},
  {t:'Place yellow corners',sub:"U R U' L' U R' U' L",k:'LAST LAYER',text:'Get each corner into its correct spot, even if it is twisted. A corner is in the right spot when it has the same three colors as the sides around it.',
   how:'Find a corner that is already in its spot and hold it at <b>front-right</b>. Do the moves until all four are in place. None in place? Do it once from anywhere first.',algs:[['Cycle corners',"U R U' L' U R' U' L"]]},
  {t:'Twist yellow corners',sub:"R' D' R D",k:'LAST LAYER',text:'The last step. Hold the cube with an unsolved corner at the front-right, top. Repeat the moves until yellow faces up on that corner.',
   how:'Do the moves <b>2 or 4 times</b> until that corner shows yellow on top. Then turn only the top (U) to bring the next unsolved corner to front-right. Never turn the whole cube. The rest looks scrambled until the last corner is done.',algs:[['Twist',"R' D' R D"]]}]},
 '2':{title:'Solve a 2x2',tip:'Already know the 3x3? Steps 2 and 3 use moves you\'ve seen. Most people get their first 2x2 solve in under an hour.',steps:[
  {t:'White layer',sub:"R U R' U'",k:'FIRST LAYER',text:'Build one full white side with the colors on the sides matching. Put one white corner on the bottom, then add the others: hold each one on top above its spot at the front-right and repeat the moves until it drops in.',
   how:'Hold the corner at <b>front-right, top</b>, above where it goes. Repeat the moves until it is in with white facing down.',algs:[['Corner trick',"R U R' U'"]]},
  {t:'Make the top yellow',sub:'Sune',k:'TOP LAYER',text:'White layer down, yellow up. Count how many yellow stickers face up, hold the cube as shown, and repeat one move set until the whole top is yellow:',
   pats:[['1 yellow up',[_,_,Y,_],1],['0 yellow up',[_,_,_,_]],['2 yellow up',[Y,Y,_,_]],['All yellow!',[Y,Y,Y,Y],'goal']],
   how:'With <b>1 up</b>, put that corner front-left. With <b>0 or 2</b>, turn the top until a yellow sticker faces left on the front-left corner. Do the moves, look again, repeat.',algs:[['Sune',"R U R' U R U2 R'"]]},
  {t:'Swap top corners',sub:'T perm',k:'TOP LAYER',text:'Look at the sides of the top layer. Two corners with the same color next to each other ("headlights") are already right relative to each other.',
   how:'Put the headlights on the <b>left</b> side and do the moves. No headlights? Do it once from anywhere, and you\'ll get some.',algs:[['T perm',"R U R' U' R' F R2 U' R' U' R U R' F'"]]},
  {t:'Line it up',sub:'U turns',k:'DONE',text:'Turn the top until every side is one color. That\'s a solved 2x2!',how:'Just turn the top layer (U) until it matches.',algs:[['Finish',"U"]]}]},
};
const ENG_FOR={'2':()=>engN(2),'3':()=>E3};
let learnSel=null,learnStep=0,learnFilter='all',lnAlgIdx=0,lp=null;
let learnDone=store.get('learn',{});
const pzInfo=id=>PUZ.find(p=>p[0]===id);
function dotsHtml(n){return '<span class="dots" aria-label="Difficulty '+n+' of 5">'+[0,1,2,3,4].map(i=>`<i class="${i<n?'on':''}"></i>`).join('')+'</span>';}
function openLearn(id){learnSel=id;learnStep=0;const b=$('tab-learn');showTab(b);}
function renderLearn(){
  const g=learnSel&&GUIDES[learnSel];
  $('lnLib').hidden=!!learnSel;$('lnGuide').hidden=!g;$('lnSoon').hidden=!(learnSel&&!g);
  if(!learnSel){renderLib();return;}
  if(!g){const p=pzInfo(learnSel)||[learnSel,learnSel];
    $('lnSoon').innerHTML=`${pzSvg(learnSel,'pz')}<h2 class="ln-title" style="font-size:2rem">${p[1]}</h2><p class="gd-how" style="max-width:560px">The step-by-step guide for the ${p[1]} is on the way. Guides are being added a few puzzles at a time, and the 2x2 and 3x3 are ready now.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-ln-back>← All puzzles</button><button class="btn primary" data-ln-open="3">Learn the 3x3</button></div>`;
    $('lnSoon').querySelector('svg').style.cssText='width:80px;height:85px';return;}
  renderGuide();}
function renderLib(){
  const counts={all:PUZ.length};for(const[k,,,gs]of PZ_GROUPS)counts[k]=PUZ.filter(p=>gs.includes(p[2])).length;
  $('lnFilters').innerHTML=[['all','All'],...PZ_GROUPS.map(g=>[g[0],g[0]==='wca'?'WCA':g[1]])].map(([k,l])=>`<button data-lnf="${k}" aria-pressed="${learnFilter===k}">${l} ${counts[k]}</button>`).join('');
  const q=$('lnSearch').value.trim().toLowerCase();
  const card=p=>{const[id,name,,diff,time]=p;const G=GUIDES[id];const done=(learnDone[id]||[]).length;
    let foot;if(!G)foot=`<span class="meta">${time}</span>`;else if(done>=G.steps.length)foot='<span class="done">✓ Solved it</span>';
    else if(done)foot=`<span class="ln-prog"><span><b style="width:${done/G.steps.length*100}%"></b></span>${done}/${G.steps.length}</span>`;else foot=`<span class="meta">${G.steps.length} steps · ${time}</span>`;
    const tag=!G?'<span class="tag soon">SOON</span>':'';
    return `<button class="ln-card${G&&done&&done<G.steps.length?' started':''}" data-ln-open="${id}">${tag}${pzSvg(id)}<span class="nm">${name}</span>${dotsHtml(diff)}${foot}</button>`;};
  let html='';
  for(const[k,title,sub,gs]of PZ_GROUPS){if(learnFilter!=='all'&&learnFilter!==k)continue;
    const items=PUZ.filter(p=>gs.includes(p[2])&&(!q||p[1].toLowerCase().includes(q)));if(!items.length)continue;
    html+=`<section class="ln-sec"><h2>${title}<small>${sub}</small></h2><div class="ln-grid">${items.map(card).join('')}</div></section>`;}
  $('lnSections').innerHTML=html||'<p class="ln-empty">No puzzles match that search.</p>';}
function patSvg(cells){const n=Math.round(Math.sqrt(cells.length)),sz=60,c=sz/n;
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" aria-hidden="true">`+cells.map((col,k)=>`<rect x="${(k%n)*c+1.5}" y="${Math.floor(k/n)*c+1.5}" width="${c-3}" height="${c-3}" rx="4" fill="${col}"/>`).join('')+'</svg>';}
function renderGuide(){const G=GUIDES[learnSel],st=G.steps[learnStep],done=learnDone[learnSel]||[],nS=G.steps.length;
  $('lnStepsTitle').textContent=G.title+' · '+nS+' steps';$('lnTip').textContent=G.tip;
  $('lnSteps').innerHTML=G.steps.map((x,i)=>`<li><button data-ln-step="${i}" class="${done.includes(i)?'ok':''}" ${i===learnStep?'aria-current="step"':''}><span class="dot">${done.includes(i)&&i!==learnStep?'✓':i+1}</span><span class="t"><b>${x.t}</b><small>${x.sub}</small></span></button></li>`).join('');
  $('lnTopProg').innerHTML=`<span><b style="width:${done.length/nS*100}%"></b></span>${done.length} of ${nS} done`;
  $('lnNum').textContent=learnStep+1;$('lnKicker').textContent=`STEP ${learnStep+1} OF ${nS} · ${st.k}`;$('lnStepTitle').textContent=st.t;$('lnText').textContent=st.text;
  $('lnPats').innerHTML=(st.pats||[]).map((p,i)=>(i?`<span class="gd-arrow" aria-hidden="true">${p[2]==='goal'?'→':(learnSel==='2'?'or':'→')}</span>`:'')+`<div class="gd-pat${p[2]==='goal'?' goal':''}"${p[2]===1?' style="border-color:var(--accent);box-shadow:0 0 18px -6px var(--accent)"':''}>${patSvg(p[1])}<span>${p[0]}</span></div>`).join('');
  $('lnHow').innerHTML=st.how;if(lnAlgIdx>=st.algs.length)lnAlgIdx=0;
  $('lnAlgPick').innerHTML=st.algs.length>1?st.algs.map((a,i)=>`<button data-ln-alg="${i}" aria-pressed="${i===lnAlgIdx}">${a[0]}</button>`).join(''):'';
  $('lnMovesLabel').textContent=st.algs.length>1?'The moves':'The moves · '+st.algs[0][0];
  $('lnPrev').textContent=learnStep?'← '+G.steps[learnStep-1].t:'← All puzzles';
  $('lnNext').textContent=learnStep<nS-1?'Got it · next: '+G.steps[learnStep+1].t+' →':'Got it · I solved it! ✓';
  loadLnAlg();}
function loadLnAlg(){const st=GUIDES[learnSel].steps[learnStep],alg=st.algs[lnAlgIdx][1],e=(ENG_FOR[learnSel]||(()=>E3))();
  if(!lp)lp=makePlayer('ln3d','lnAlg',{reset:'lnReset',step:'lnStep',play:'lnPlay',speed:'lnSpeed'});
  const toks=e.parse(alg);const start=e.apply(e.solved(),e.inv(toks));lp.load(start,'full',toks,'',e);lp.reveal();}
function markDone(){const d=learnDone[learnSel]=learnDone[learnSel]||[];if(!d.includes(learnStep))d.push(learnStep);store.set('learn',learnDone);}
$('view-learn').addEventListener('click',e=>{const t=e.target;
  const o=t.closest('[data-ln-open]');if(o){learnSel=o.dataset.lnOpen;learnStep=Math.min((learnDone[learnSel]||[]).length,GUIDES[learnSel]?GUIDES[learnSel].steps.length-1:0);lnAlgIdx=0;renderLearn();window.scrollTo(0,0);return;}
  if(t.closest('[data-ln-back]')||t.closest('#lnBack')){learnSel=null;renderLearn();return;}
  const f=t.closest('[data-lnf]');if(f){learnFilter=f.dataset.lnf;renderLib();return;}
  const s=t.closest('[data-ln-step]');if(s){learnStep=+s.dataset.lnStep;lnAlgIdx=0;renderGuide();return;}
  const a=t.closest('[data-ln-alg]');if(a){lnAlgIdx=+a.dataset.lnAlg;renderGuide();return;}
  if(t.closest('#lnPrev')){if(learnStep){learnStep--;lnAlgIdx=0;renderGuide();}else{learnSel=null;renderLearn();}return;}
  if(t.closest('#lnNext')){markDone();const n=GUIDES[learnSel].steps.length;if(learnStep<n-1){learnStep++;lnAlgIdx=0;renderGuide();}else{toast('Nice! '+GUIDES[learnSel].title.replace('Solve','You can solve')+' now.');learnSel=null;renderLearn();}return;}});
$('lnSearch').addEventListener('input',renderLib);
'''
icons = json.load(open('tools/puzzle-icons.json'))
js = js.replace('__ICONS__', json.dumps(icons))
rep("function renderStreak(){", js + "\nfunction renderStreak(){")
open(P, 'w').write(s)
print('ok')
