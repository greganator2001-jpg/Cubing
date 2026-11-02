// ---- Speed methods (Learn tab → "Speed method") ----
// drill:[N,section] adds a "Practice in Drill" button that switches to that cube and turns the set on.
const SP_YAU_TIP='Look ahead: while you finish one piece, find the next one so you never stop turning.';
// ---- flat pictures for the big-cube speed guide (drawn from the same cube engine as the 3D demos) ----
const SP_DARK='#2A2E37',SP_W=COLORS.D,SP_Y=COLORS.U;
// one face as a grid; fn(r,c) gives the colour of each cell
function spFace(N,fn,sz=74){const c=sz/N;let o=`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" aria-hidden="true">`;
  for(let r=0;r<N;r++)for(let k=0;k<N;k++)o+=`<rect x="${k*c+1}" y="${r*c+1}" width="${c-2}" height="${c-2}" rx="${Math.max(1.5,c*.18)}" fill="${fn(r,k)||SP_DARK}"/>`;return o+'</svg>';}
// front view: top row of U above the front face, with the touching column of L and R on the sides.
// Only the pieces at the given positions are coloured; the rest are dark.
function spFront(N,alg,keep,sz=96){const m=N-1;const st=nxApply(nxSolved(N),alg?nxInvert(nxParse(alg,N)):[],N);const at={},home={};for(const s of st){at[s.p.join()+'|'+s.n.join()]=s.c;home[s.p.join()]=s.h.split(',').map(Number);}
  const c=sz/(N+2),W=sz,H=c*(N+1)+c*.4;let o=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  const cell=(x,y,w,h,p,n)=>{const show=keep(p,home[p.join()]);const col=show?COLORS[at[p.join()+'|'+n.join()]]:SP_DARK;o+=`<rect x="${x+1}" y="${y+1}" width="${w-2}" height="${h-2}" rx="${Math.max(1.5,c*.16)}" fill="${col}"/>`;};
  for(let k=0;k<N;k++)cell(c+k*c,0,c,c*.7,[-m+2*k,m,m],[0,1,0]);                 // U, front row (squashed = seen from the front)
  for(let r=0;r<N;r++){const y=c*.7+c*.4+r*c,yy=m-2*r;
    cell(c*.3,y,c*.7,c,[-m,yy,m],[-1,0,0]);                                        // L, column next to the front
    for(let k=0;k<N;k++)cell(c+k*c,y,c,c,[-m+2*k,yy,m],[0,0,1]);
    cell(c+N*c,y,c*.7,c,[m,yy,m],[1,0,0]);}                                         // R, column next to the front
  return o+'</svg>';}
const SP_ORDER='with green in front: orange on the right, blue at the back, red on the left';
const G_SPEED_BIG=(N)=>{
  const odd=N%2===1,big=N>5,m=N-1,c=N-2,inn=(r,k)=>r>0&&r<N-1&&k>0&&k<N-1;
  const nm=N===4?'Yau':N===5?'Yau5':'Yau (big cube)';
  const isEdge=p=>p.filter(v=>Math.abs(v)===m).length===2;
  const steps=[
   {t:'Know the pieces',sub:'Centers, edges, corners',k:'BEFORE YOU START',
    text:`A ${N}x${N} has the same three kinds of pieces as a 3x3, there are just more of them. The trick of every big-cube method is to group them so the cube can be solved like a 3x3.`,
    how:`<p><b>Center</b> = the ${c}x${c} block in the middle of each face. It's made of loose pieces you have to gather into one color.</p><p><b>Edge</b> = the row of ${c} pieces between two corners. They're loose too, and you join them into finished edges.</p><p><b>Corners</b> = the same 8 corners as a 3x3. Nothing new.</p>`+(odd?`<p>On a ${N}x${N} the very middle center piece never moves, so it tells you which color that face is. The middle piece of each edge works the same way: it decides which edge the others join.</p>`:`<p>An even cube has no fixed middle piece, so you choose where each center goes. Use the normal color scheme (white opposite yellow, green opposite blue, red opposite orange).</p>`)+`<p><b>The speed plan:</b> 2 centers → 3 cross edges → last 4 centers → last cross edge → the other 8 edges → solve it like a 3x3. Doing the cross early means you skip it at the end.</p>`,
    pics:[['Center',spFace(N,(r,k)=>inn(r,k)?SP_Y:null)],['Edge',spFace(N,(r,k)=>r===N-1&&k>0&&k<N-1?COLORS.F:null)],['Corners',spFace(N,(r,k)=>(r===0||r===N-1)&&(k===0||k===N-1)?COLORS.R:null)]],algs:[]},
   {t:'White center',sub:'Build it in rows',k:'CENTERS 1',
    text:`Build the white center on top. Don't place single pieces one by one: make a line of ${c} white pieces (a "bar") on a side face, then move the whole bar in at once.`,
    how:`<ol><li>Gather white pieces on the front face into one column, the one just inside the right edge.</li><li>Turn the top so the empty column of the white center is on the left.</li><li>Do <b>2R U2 2R'</b>: the bar goes up, the top spins it into the gap, and the slice comes back down.</li><li>Repeat until the center is done. The first few pieces you can put in any way you like.</li></ol>`,
    pics:[['Start',spFace(N,(r,k)=>inn(r,k)&&k===1?null:inn(r,k)?SP_W:null)],['Bar on front',spFace(N,(r,k)=>inn(r,k)&&k===N-2?SP_W:null)],['Done',spFace(N,(r,k)=>inn(r,k)?SP_W:null),'goal']],
    algs:[['Put a bar in',"2R U2 2R'"]],drill:[N,'centers']},
   {t:'Yellow center',sub:'Opposite white',k:'CENTERS 2',
    text:'Turn the cube over so white is on the bottom, and build yellow on top the same way.',
    how:`<ol><li>Make a yellow bar on the front, in the column just inside the right edge.</li><li>Turn the top so yellow's empty column is on the left.</li><li><b>2R U2 2R'</b>. The first 2R moves a column of the white center away, and the 2R' at the end brings it back, so white stays solved.</li></ol><p>The demo starts with yellow missing one column and the bar ready on the front. Watch the white center: it leaves and comes back.</p>`,
    pics:[['Top',spFace(N,(r,k)=>inn(r,k)&&k===1?null:inn(r,k)?SP_Y:null)],['Front',spFace(N,(r,k)=>inn(r,k)&&k===N-2?SP_Y:null)],['Bottom stays',spFace(N,(r,k)=>inn(r,k)?SP_W:null)],['Done',spFace(N,(r,k)=>inn(r,k)?SP_Y:null),'goal']],
    algs:[['Put a bar in',"2R U2 2R'"]],drill:[N,'centers']},
   {t:'Three cross edges',sub:nm+' trick',k:'EDGES',
    text:'Now, before the side centers, join three white edges and put them on the bottom next to the white center. The side centers are still mixed up, so you can turn freely while you join pieces.',
    how:`<ol><li>Find the pieces of one white edge, like white-green.</li><li>Set them up like the picture: ${odd?'on the front-right edge the top piece and the middle piece (the middle one flipped), and the last piece on the front-left edge, top spot':'one piece on the front-right edge (top spot) and its partner on the front-left edge (top spot)'}. Looking at the front, ${odd?'both side pieces show the same color, and the middle piece shows the other color':'both show the same color'}.</li><li>Do <b>Uw' R U R' F R' F' R Uw</b>. The edge comes out finished on the front-right.</li><li>Put it on the bottom. Place the three edges in color order (${SP_ORDER}). Leave the gap on the left.</li></ol>`,
    pics:[['Set up like this',spFront(N,"Uw' R U R' F R' F' R Uw",(p,h)=>isEdge(p)&&h[0]===m&&h[2]===m&&Math.abs(h[1])<m)],['Joined',spFront(N,'',p=>isEdge(p)&&p[2]===m&&p[0]===m&&Math.abs(p[1])<m),'goal']],
    algs:[['Join an edge',"Uw' R U R' F R' F' R Uw"]]},
   {t:'Last four centers',sub:'Without touching the cross',k:'CENTERS 3',
    text:'Turn the cube so white is on the left and the gap in the cross is at the top-left. Now build the four side centers using only U, R, Rw and inner slices like 2R and 2L. None of those turns touch your three cross edges.',
    how:`<ol><li>Build each center to match its cross edge: the green center goes next to the white-green edge, and so on.</li><li>Use bars and <b>2R U2 2R'</b> again. It never touches the left side, so the cross is safe.</li><li>For the last one or two pieces, use the swap below. It trades one top center piece with one front center piece and leaves everything else alone.</li></ol>`,
    pics:[['White side, on the left',spFace(N,(r,k)=>inn(r,k)?SP_W:(r>0&&r<N-1&&(k===0||k===N-1))||(r===N-1&&k>0&&k<N-1)?SP_W:null)],['Then these 4 centers',spFace(N,(r,k)=>inn(r,k)?COLORS.F:null)]],
    algs:[['Swap two center pieces',"2R U 2L' U' 2R' U 2L U'"]],drill:[N,'centers']},
   {t:'Last cross edge',sub:'Fill the gap',k:'EDGES',
    text:'Join the fourth white edge the same way as before and put it in the gap. You now have every center and a full white cross.',
    how:'Same setup and same moves as the three cross edges. Then turn the cube so white is on the bottom again.',
    pics:[['Set up like this',spFront(N,"Uw' R U R' F R' F' R Uw",(p,h)=>isEdge(p)&&h[0]===m&&h[2]===m&&Math.abs(h[1])<m)]],
    algs:[['Join an edge',"Uw' R U R' F R' F' R Uw"]]},
   {t:'Join the other 8 edges',sub:'Same trick, over and over',k:'EDGES',
    text:`Join the 8 edges that aren't white. You use the same moves as the cross edges; the only rule is to keep your finished edges out of the way.`,
    how:`<ol><li>Hold the cross on the bottom. Set up two matching pieces on the front-left and front-right like before.</li><li><b>Uw'</b> joins them, <b>R U R' F R' F' R</b> swaps the finished edge out of the middle, and <b>Uw</b> puts the centers back.</li><li>Keep finished edges in the top layer, where the moves don't break them.</li></ol>`+(big?'<p>Do the pieces next to the corners first. Then the next ring in, using 3Uw instead of Uw.</p>':'')+'<p>With practice you\'ll spot the next pair while finishing this one.</p>',
    pics:[['Set up like this',spFront(N,"Uw' R U R' F R' F' R Uw",(p,h)=>isEdge(p)&&h[0]===m&&h[2]===m&&Math.abs(h[1])<m)],['Joined',spFront(N,'',p=>isEdge(p)&&p[2]===m&&p[0]===m&&Math.abs(p[1])<m),'goal']],
    algs:[['Join an edge',"Uw' R U R' F R' F' R Uw"]].concat(big?[['Next ring in',"3Uw' R U R' F R' F' R 3Uw"]]:[])},
   {t:odd?'Last two edges':'Last edges',sub:'If one looks flipped',k:'EDGES',
    text:`Sometimes the very last edge ends up with ${odd?'its two outer pieces':'its two pieces'} the wrong way round, so it looks flipped. That can't be fixed by joining again. It needs one long alg.`,
    how:'Put the bad edge at the front of the top layer, like the picture, and do the alg once. Practice it in the Parity set.',
    pics:[['Bad edge on top',spFront(N,"2R2 B2 U2 2L U2 2R' U2 2R U2 F2 2R F2 2L' B2 2R2",p=>isEdge(p)&&p[1]===m&&p[2]===m)],['Fixed',spFront(N,'',p=>isEdge(p)&&p[1]===m&&p[2]===m),'goal']],
    algs:[['Fix a flipped edge',"2R2 B2 U2 2L U2 2R' U2 2R U2 F2 2R F2 2L' B2 2R2"]],drill:[N===7||N===9?5:N,'parity']},
   {t:'Finish like a 3x3',sub:'F2L, OLL, PLL',k:'3x3 STAGE',
    text:'Every center and edge is done, so the cube now works like a 3x3. Your cross is already solved: go straight into F2L, then OLL and PLL.',
    how:'Only turn the outer layers from here (R, U, F…), never the wide ones. Practice F2L, OLL and PLL in Drill.',algs:[['F2L example',"U R U' R'"]],drill:[3,'f2l']}];
  if(!odd)steps.push({t:'Parity',sub:'Only on even cubes',k:'LAST STEP',text:'An even cube can show two last-layer problems a 3x3 never has: one edge flipped at OLL, or two edges swapped at PLL. Spot them and do the fix.',
    how:'<b>OLL parity:</b> one edge flipped. <b>PLL parity:</b> two edges swapped. Both are in the Parity set.',algs:[['OLL parity',N===4?"2R2 B2 U2 2L U2 2R' U2 2R U2 F2 2R F2 2L' B2 2R2":"3R2 B2 U2 3L U2 3R' U2 3R U2 F2 3R F2 3L' B2 3R2"],['PLL parity',N===4?"2R2 U2 2R2 Uw2 2R2 Uw2":"3R2 U2 3R2 3Uw2 3R2 3Uw2"]],drill:[N,'parity']});
  return {title:nm+' method · '+N+'x'+N,demo:String(N),legend:LEG_BIG,
    tip:`The method most fast ${N}x${N} solvers use. Same idea as the beginner way (centers, edges, then 3x3), but the white cross is built early so you skip it at the end, and centers go in whole rows at a time. ${SP_YAU_TIP}`,steps};};
const GUIDES_SPEED={
 '2':{title:'CLL method · 2x2',demo:'2',legend:LEG_CUBE,tip:'Solve one face, then finish the whole cube with one CLL algorithm. Two looks and done: most good 2x2 solvers use CLL or something like it.',steps:[
  {t:'First face, planned',sub:'In inspection',k:'FIRST LAYER',text:'During the 15 seconds of inspection, plan the whole first face (4-6 moves) so you can do it without stopping.',how:'Pick the side that is easiest, not always white. The sides of the layer must match each other.',algs:[['Corner trick',"R U R' U'"]]},
  {t:'Recognize the CLL',sub:'Top shape + side colors',k:'LAST LAYER',text:'Look at the top: which of the 7 yellow shapes it is (like OLL), then the side colors to tell the 6 cases of that shape apart.',how:'There are 42 CLL cases. Learn them shape by shape, starting with Sune and Anti-Sune.',algs:[['Sune 1',"R' U2 R U R' U R"]],drill:[2,'cll']},
  {t:'One alg to finish',sub:'Then AUF',k:'LAST STEP',text:'Do the CLL and the cube is solved, apart from maybe one last U turn.',how:'Drill the CLL set until recognition takes under a second.',algs:[['Oriented 1',"R2 F2 R' U' R F2 R' U R'"]],drill:[2,'cll']}]},
 '3':{title:'CFOP · 3x3',demo:'3',legend:LEG_CUBE,tip:'CFOP (Fridrich) is what almost every fast 3x3 solver uses: Cross, F2L, OLL, PLL. Learn it in this order, and use the 2-look versions first.',steps:[
  {t:'Cross on the bottom',sub:'Plan it in inspection',k:'CROSS',text:'Solve the white cross with white on the bottom, planned during inspection. Aim for 8 moves or fewer.',how:'Practice planning the full cross before you turn. Solving it on the bottom saves a cube rotation and lets you see F2L pieces.',algs:[['Example',"F2"]]},
  {t:'F2L',sub:'41 cases',k:'F2L',text:'Solve the first two layers together: pair a corner with its edge in the top layer, then insert the pair into its slot in one go.',how:'Start intuitively, then learn the 41 cases. The basic inserts below show the idea.',algs:[['Basic insert',"U R U' R'"],['Right pair',"R U R'"],['F2L 1',"R U2 R' U' R U R'"]],drill:[3,'f2l']},
  {t:'2-look OLL',sub:'Then full OLL',k:'OLL',text:'Make the top yellow in two steps: orient the edges (yellow cross), then orient the corners. Later, learn all 57 OLLs to do it in one step.',how:'Edges: F R U R\' U\' F\' and its wide version. Corners: the 7 OCLL cases like Sune.',algs:[['Edges',"F R U R' U' F'"],['Sune',"R U R' U R U2 R'"]],drill:[3,'oll']},
  {t:'PLL',sub:'21 cases',k:'PLL',text:'Move the last layer pieces into place with one algorithm. Start with 2-look PLL (corners, then edges), then learn all 21.',how:'T perm is a great first PLL: it swaps two corners and two edges.',algs:[['T perm',"R U R' U' R' F R2 U' R' U' R U R' F'"]],drill:[3,'pll']},
  {t:'Speed habits',sub:'Look ahead + finger tricks',k:'GETTING FASTER',text:'Turn slower and stop pausing. While you insert one F2L pair, find the next one. Use your fingers (index flicks for U) instead of regripping.',how:'Use the Timer with the Splits option to see which step is slowest, and the Drill to drill only the cases you\'re slow on.',algs:[['Finger trick drill',"R U R' U'"]]}]},
 'pyra':{title:'Top-first / L4E · Pyraminx',demo:'pyra',legend:LEG_PYRA,tip:'Fast Pyraminx solvers plan most of the solve in inspection: tips, centers and a few edges, then finish with one algorithm.',steps:[
  {t:'Plan in inspection',sub:'Tips + centers + edges',k:'INSPECTION',text:'Use the 15 seconds to plan the tips, the centers of one corner, and two or three edges. Tips are free moves, so do them first or last without thinking.',how:'Aim to see the whole first block before you start.',algs:[['Tip',"u"]]},
  {t:'Build a V or a layer',sub:'Intuitive',k:'FIRST BLOCK',text:'Solve two edges around one center (a "V") or a full bottom layer. Top-first methods solve three edges around the top center instead.',how:'Keep turns short and avoid regrips; most V\'s are 3 to 6 moves.',algs:[]},
  {t:'Last 4 edges (L4E)',sub:'One algorithm',k:'LAST STEP',text:'Finish the last edges and the last center in one go. Start with the three Pyraminx moves you know, then learn the full L4E set (about 20 cases) case by case.',how:'Recognize by which edges are flipped or need cycling.',algs:[['Clockwise',"R U R' U R U R'"],['Counter',"R' U' R U' R' U' R"],['Flip two',"R' L R L' U L' U' L"]]}]},
 'skewb':{title:'Intermediate · Skewb',demo:'skewb',legend:LEG_SKEWB,tip:'Most fast Skewb solves are a planned first layer and one last-layer algorithm. Inspection planning matters more than turning speed.',steps:[
  {t:'First layer in inspection',sub:'Plan all of it',k:'INSPECTION',text:'Plan the whole first layer (center + 4 corners), usually 4 to 6 moves. Pick the color with the easiest layer, not always white.',how:'Practice planning without turning, then execute without pausing.',algs:[]},
  {t:'Corners in one look',sub:'Recognize the twists',k:'LAST LAYER',text:'Recognize the bottom corner twists right away and twist the diagonal pairs.',how:'Twisted corners come in diagonal pairs; each pair is one move set.',algs:[['Twist a pair',"R B R B' U' L U"]]},
  {t:'Centers',sub:'Two algorithms',k:'LAST STEP',text:'Finish with the bottom-center move and the side-center cycle.',how:'With practice you see which one is needed before the corners finish.',algs:[['Bring it down',"R L' U' R U' L R U'"],['Cycle three',"R L' B' U B U' R' U"]]}]},
 'mega':{title:'Speed method · Megaminx',demo:'mega',legend:LEG_MEGA,tip:'Fast Megaminx solves use a star, F2L-style pairs for the first layers, and a 4-look last layer.',steps:[
  {t:'Star and first face',sub:'Plan the star',k:'FIRST LAYER',text:'Plan the white star in inspection and insert the five corners with corner + edge pairs where you can.',how:'Pairing a corner with its edge before inserting saves a lot of moves.',algs:[]},
  {t:'F2L for the next layers',sub:'Pairs, not pieces',k:'F2L',text:'Solve the next layers with F2L-style pairs: a corner and its edge together into each slot.',how:'Use the top face to set up pairs and keep your eyes on the next pair.',algs:[['Basic insert',"U R U' R'"]]},
  {t:'Last layer, 4 looks',sub:'EO, EP, CP, CO',k:'LAST LAYER',text:'Edges up (star), edges in place, corners in place, corners twisted. Later, combine steps with full OLL/PLL-style sets.',how:'These are the same moves as the beginner last layer, done without pausing.',algs:[['Star',"F R U R' U' F'"],['Cycle edges',"R U R' U R U2' R'"],['Cycle corners',"R U2' L' U2 R' U2' L U2"],['Twist',"R' DR' R DR"]]}]},
 '4':G_SPEED_BIG(4),'5':G_SPEED_BIG(5),'6':G_SPEED_BIG(6),'7':G_SPEED_BIG(7),'9':G_SPEED_BIG(9)};
