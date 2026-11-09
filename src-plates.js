// ---- PB plate designer: ready-made styles + a custom builder, live 3D preview, STL / 3MF export ----
// Everything is built from flat 2D shapes (mm) that get extruded. Every piece has a color role:
//   base = the plate · trim = borders, rings, pads, tiles · text = the time · text2 = the small lines and icons
// Pieces that share a color are exported as one body, so a 3MF opens in the slicer as one object with one part per color.
// Raised = decorations stick up; engraved = they're cut into the top (and the color parts become flush inlays).
const PL={font:null};
const plFontGet=()=>PL.font||(PL.font=new THREE.Font(JSON.parse($('plFontSrc').textContent)));
// shapes ---------------------------------------------------------------------------------------------
const plV=(x,y)=>new THREE.Vector2(x,y);
function plRR(x,y,w,h,r){r=Math.max(.01,Math.min(r,w/2,h/2));const s=new THREE.Path();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s.getPoints(10);}
const plPoly=pts=>new THREE.Shape(pts.map(p=>plV(p.x,p.y)));
const plRing=(outer,inner)=>{const s=plPoly(outer);s.holes=[new THREE.Path(inner.map(p=>plV(p.x,p.y)))];return s;};
const plEll=(cx,cy,rx,ry,n=56)=>{const a=[];for(let i=0;i<n;i++){const t=i/n*Math.PI*2;a.push(plV(cx+Math.cos(t)*rx,cy+Math.sin(t)*ry));}return a;};
const plCircle=(cx,cy,r,n=40)=>plEll(cx,cy,r,r,n);
const plStar=(cx,cy,r)=>{const a=[];for(let i=0;i<10;i++){const t=Math.PI/2+i*Math.PI/5,q=i%2?r*.42:r;a.push(plV(cx+Math.cos(t)*q,cy+Math.sin(t)*q));}return a;};
const plNgon=(cx,cy,r,n,rot=Math.PI/2)=>{const a=[];for(let i=0;i<n;i++){const t=rot+i*2*Math.PI/n;a.push(plV(cx+Math.cos(t)*r,cy+Math.sin(t)*r));}return a;};
// round every corner of a polygon (so pointy ends print smooth)
function plRound(pts,r,seg=6){const n=pts.length,out=[];for(let i=0;i<n;i++){const p=pts[i],a=pts[(i+n-1)%n],b=pts[(i+1)%n];
    const v1=plV(a.x-p.x,a.y-p.y),v2=plV(b.x-p.x,b.y-p.y),l1=v1.length(),l2=v2.length();const ang=Math.acos(Math.max(-1,Math.min(1,(v1.x*v2.x+v1.y*v2.y)/(l1*l2))));
    if(ang>Math.PI*.97||l1<1e-6||l2<1e-6){out.push(p);continue;}const d=Math.min(r/Math.tan(ang/2),l1*.45,l2*.45);const p1=plV(p.x+v1.x/l1*d,p.y+v1.y/l1*d),p2=plV(p.x+v2.x/l2*d,p.y+v2.y/l2*d);
    for(let k=0;k<=seg;k++){const t=k/seg,u=1-t;out.push(plV(u*u*p1.x+2*u*t*p.x+t*t*p2.x,u*u*p1.y+2*u*t*p.y+t*t*p2.y));}}
  return out;}
function plOutline(sp,W,H){const r=sp.shape==='rect'?Math.min(1.2,H*.06):H*.18;
  if(sp.shape==='pill')return plRR(0,0,W,H,H/2);
  if(sp.shape==='oval')return plEll(W/2,H/2,W/2,H/2,96);
  if(sp.shape==='banner'){const n=H*.24;return plRound([plV(0,0),plV(W,0),plV(W-n,H/2),plV(W,H),plV(0,H),plV(n,H/2)],H*.05);}
  if(sp.shape==='chevron'){const n=H*.3;return plRound([plV(n,0),plV(W,0),plV(W-n,H/2),plV(W,H),plV(n,H),plV(0,H/2)],H*.05);}
  if(sp.shape==='timer'){const r=H/2,bh=H*.4,pts=[];const a0=Math.asin(bh/r);   // round pad lobes at both ends, slimmer middle
    for(let i=0;i<=28;i++){const t=a0+i*(2*Math.PI-2*a0)/28;pts.push(plV(r+Math.cos(t)*r,r+Math.sin(t)*r));}
    for(let i=0;i<=28;i++){const t=Math.PI+a0+i*(2*Math.PI-2*a0)/28;pts.push(plV(W-r+Math.cos(t)*r,r+Math.sin(t)*r));}
    return plRound(pts,H*.06);}
  return plRR(0,0,W,H,r);}
const plEnd=(sp,H)=>sp.shape==='timer'?H*.07:sp.shape==='pill'?H*.34:sp.shape==='banner'?H*.3:sp.shape==='chevron'?H*.34:sp.shape==='oval'?H*.4:H*.06;
// text: shapes positioned so the text box is centred on (x,yc) / left / right; shrinks to fit maxW
function plText(str,size,x,yc,align,maxW){if(!str||!(size>.3)||(maxW!==undefined&&!(maxW>1)))return{shapes:[],w:0};const f=plFontGet();const sh=f.generateShapes(str,size);const g=new THREE.ShapeGeometry(sh);g.computeBoundingBox();const bb=g.boundingBox;
  const tw=bb.max.x-bb.min.x;if(maxW&&tw>maxW)return plText(str,size*maxW/tw*.999,x,yc,align);
  const th=bb.max.y-bb.min.y,dx=(align==='left'?x:align==='center'?x-tw/2:x-tw)-bb.min.x,dy=yc-th/2-bb.min.y;
  return{w:tw,shapes:sh.map(s=>{const o=new THREE.Shape(s.getPoints(6).map(p=>plV(p.x+dx,p.y+dy)));o.holes=s.holes.map(h=>new THREE.Path(h.getPoints(6).map(p=>plV(p.x+dx,p.y+dy))));return o;})};}
// 7-segment digits like a timer display (slightly slanted when italic)
function plSeg(str,x,y,dh,slant=0){const out=[];if(!(dh>.5))return{shapes:out,w:0};const dw=dh*.55,t=dh*.13,gap=dh*.2;let cx=x;
  const S={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abcdfg','-':'g'};
  const sk=p=>plV(p.x+(p.y-y)*slant,p.y);
  const hex=(a,b,w,h,horiz)=>{const m=Math.min(w,h)/2;const pts=horiz?[plV(a,b+h/2),plV(a+m,b),plV(a+w-m,b),plV(a+w,b+h/2),plV(a+w-m,b+h),plV(a+m,b+h)]:[plV(a+w/2,b),plV(a+w,b+m),plV(a+w,b+h-m),plV(a+w/2,b+h),plV(a,b+h-m),plV(a,b+m)];return plPoly(pts.map(sk));};
  for(const ch of str){if(ch==='.'||ch===':'){out.push(plPoly(plCircle(cx+t*.6,y+t*.6,t*.62,16).map(sk)));if(ch===':')out.push(plPoly(plCircle(cx+t*.6,y+dh*.62,t*.62,16).map(sk)));cx+=t*1.9;continue;}
    const m=t*.15;const seg={a:[cx+t*.5+m,y+dh-t,dw-t-2*m,t,1],g:[cx+t*.5+m,y+dh/2-t/2,dw-t-2*m,t,1],d:[cx+t*.5+m,y,dw-t-2*m,t,1],
      f:[cx,y+dh/2+t*.5+m,t,dh/2-t-2*m,0],b:[cx+dw-t,y+dh/2+t*.5+m,t,dh/2-t-2*m,0],e:[cx,y+t*.5+m,t,dh/2-t-2*m,0],c:[cx+dw-t,y+t*.5+m,t,dh/2-t-2*m,0]};
    for(const k of (S[ch]||''))out.push(hex(...seg[k]));cx+=dw+gap;}
  return{shapes:out,w:cx-x-gap};}
const plSegWidth=(str,dh)=>{let w=0;for(const ch of str)w+=(ch==='.'||ch===':')?dh*.13*1.9:dh*.55+dh*.2;return w-dh*.2;};
// icons (all fit a square of size s, bottom-left at x,y) ----------------------------------------------------
function plIcon(kind,x,y,s,pz){const out=[];const cx=x+s/2,cy=y+s/2;
  const grid=N=>{const c=s/N,g=c*.12;for(let i=0;i<N;i++)for(let j=0;j<N;j++)out.push(plPoly(plRR(x+i*c+g/2,y+j*c+g/2,c-g,c-g,c*.2)));};
  if(kind==='cube'){if(!isNaN(+pz))grid(Math.max(2,Math.min(5,+pz)));else if(pz==='pyra')out.push(plRing(plNgon(cx,cy-s*.08,s*.6,3),plNgon(cx,cy-s*.08,s*.26,3,-Math.PI/2)));
    else if(pz==='mega')out.push(plRing(plNgon(cx,cy,s*.52,5),plNgon(cx,cy,s*.26,5)));else if(pz==='skewb')out.push(plRing(plNgon(cx,cy,s*.5,4,0),plNgon(cx,cy,s*.24,4,Math.PI/4)));else grid(3);}
  if(kind==='star')out.push(plPoly(plStar(cx,cy,s*.52)));
  if(kind==='trophy'){const bw=s*.62,top=y+s*.95;const cup=[];for(let i=0;i<=16;i++){const t=Math.PI*i/16;cup.push(plV(cx-Math.cos(t)*bw/2,top-s*.06-Math.sin(t)*s*.4));}cup.push(plV(cx+bw/2,top),plV(cx-bw/2,top));out.push(plPoly(cup.reverse()));
    out.push(plPoly([plV(cx-s*.06,y+s*.16),plV(cx+s*.06,y+s*.16),plV(cx+s*.06,top-s*.5),plV(cx-s*.06,top-s*.5)]));out.push(plPoly(plRR(cx-s*.26,y,s*.52,s*.13,s*.04)));
    for(const sd of[-1,1]){const hx=cx+sd*(bw/2+s*.1),hy=top-s*.2;out.push(plRing(plCircle(hx,hy,s*.12,24),plCircle(hx,hy,s*.06,24)));}}
  if(kind==='medal'){out.push(plRing(plCircle(cx,cy,s*.5),plCircle(cx,cy,s*.41)));for(const q of plText('PB',s*.36,cx,cy,'center').shapes)out.push(q);}
  return out;}
// presets -------------------------------------------------------------------------------------------------
const PL_PRESETS={
  classic:{label:'Classic',shape:'rect',border:'none',orn:'none',icon:'none',layout:'side',text:'raised',base:'#D4A537',trim:'#1D1D1F',textC:'#1D1D1F',text2:'#1D1D1F'},
  display:{label:'Comp display',dims:[3,1.3],shape:'oval',border:'ring',orn:'streaks',icon:'none',layout:'display',text:'raised',base:'#15161A',trim:'#2167E8',textC:'#FF3B30',text2:'#E9EDF2'},
  comp:{label:'Comp timer',shape:'timer',border:'none',orn:'pads',icon:'none',layout:'lcd',text:'raised',base:'#23262C',trim:'#3A7BFF',textC:'#9FF3C8',text2:'#E9EDF2'},
  laurel:{label:'Laurel trophy',shape:'rounded',border:'frame',orn:'laurel',icon:'none',layout:'center',text:'raised',base:'#D4A537',trim:'#1D1D1F',textC:'#1D1D1F',text2:'#1D1D1F'},
  tiles:{label:'Cube-tile border',shape:'rounded',border:'tiles',orn:'none',icon:'none',layout:'center',text:'raised',base:'#D4A537',trim:'#1D1D1F',textC:'#1D1D1F',text2:'#1D1D1F',rainbow:true},
  stackmat:{label:'Stackmat LCD',shape:'rounded',border:'none',orn:'none',icon:'none',layout:'lcd',text:'raised',base:'#1E2024',trim:'#7CF5B0',textC:'#7CF5B0',text2:'#7CF5B0'},
  banner:{label:'PB ribbon banner',shape:'banner',border:'frame',orn:'none',icon:'medal',layout:'left',text:'raised',base:'#D4A537',trim:'#1D1D1F',textC:'#1D1D1F',text2:'#1D1D1F'},
  badge:{label:'Cube badge',shape:'pill',border:'none',orn:'none',icon:'cube',layout:'left',text:'raised',base:'#2F6BFF',trim:'#FFFFFF',textC:'#FFFFFF',text2:'#FFFFFF'},
  framed:{label:'Clean frame',shape:'rounded',border:'frame',orn:'none',icon:'none',layout:'center',text:'raised',base:'#D4A537',trim:'#1D1D1F',textC:'#1D1D1F',text2:'#1D1D1F'},
  trophy:{label:'Trophy',shape:'rounded',border:'double',orn:'none',icon:'trophy',layout:'left',text:'raised',base:'#C9CED6',trim:'#1D1D1F',textC:'#1D1D1F',text2:'#1D1D1F'},
  checker:{label:'Checkered finish',shape:'rect',border:'none',orn:'checker',icon:'none',layout:'center',text:'raised',base:'#F4F4F4',trim:'#111111',textC:'#111111',text2:'#111111'},
  speed:{label:'Speed chevrons',shape:'chevron',border:'none',orn:'speed',icon:'none',layout:'left',text:'raised',base:'#E8483C',trim:'#FFFFFF',textC:'#FFFFFF',text2:'#FFFFFF'},
  engraved:{label:'Engraved',shape:'rounded',border:'frame',orn:'stars',icon:'none',layout:'side',text:'engraved',base:'#7A8696',trim:'#F2F4F7',textC:'#F2F4F7',text2:'#F2F4F7'}};
// the design: outline + decor pieces {s:Shape, role} --------------------------------------------------------
function plDesign(sp,D,txt){const MM=25.4,W=D.W*MM,H=D.H*MM;const decor=[];const add=(a,role,rb)=>{for(const s of a)decor.push({s,role,rb:!!rb});};
  const end=plEnd(sp,H);let x0=end,x1=W-end,y0=H*.08,y1=H*.92;const round=sp.shape==='rect'||sp.shape==='rounded';
  // borders (trim)
  if(sp.border==='frame'||sp.border==='double'){const ins=H*.07,fw=H*.035;const ring=(i,w)=>{
      if(round){const r0=sp.shape==='rect'?.8:H*.18-i;add([plRing(plRR(i,i,W-2*i,H-2*i,r0),plRR(i+w,i+w,W-2*i-2*w,H-2*i-2*w,Math.max(.4,r0-w)))],'trim');return;}
      if(sp.shape==='oval'){add([plRing(plEll(W/2,H/2,W/2-i,H/2-i,96),plEll(W/2,H/2,W/2-i-w,H/2-i-w,96))],'trim');return;}
      const bx=end*.95+i*.3;add([plRing(plRR(bx,i,W-2*bx,H-2*i,H*.12),plRR(bx+w,i+w,W-2*bx-2*w,H-2*i-2*w,H*.09))],'trim');};
    ring(ins,fw);if(sp.border==='double')ring(ins+fw*2.2,fw*.6);const pad=sp.border==='double'?ins+fw*3.6:ins+fw*1.8;
    x0=Math.max(x0,pad+H*.05);x1=Math.min(x1,W-pad-H*.05);y0=pad+H*.04;y1=H-pad-H*.04;}
  // a thick colored rim right at the edge (the blue ring around a comp display)
  if(sp.border==='ring'){const w=H*.075;const o=plOutline(sp,W,H);let inner;
    if(sp.shape==='oval')inner=plEll(W/2,H/2,W/2-w,H/2-w,96);else if(round)inner=plRR(w,w,W-2*w,H-2*w,Math.max(.4,(sp.shape==='rect'?1.2:H*.18)-w));else inner=null;
    if(inner){add([plRing(o,inner)],'trim');y0=w+H*.05;y1=H-w-H*.05;x0=Math.max(x0,w+H*.08);x1=Math.min(x1,W-w-H*.08);}}
  if(sp.border==='tiles'){const ts=H*.11,gp=H*.026,m=H*.05;const nx=Math.max(2,Math.floor((W-2*m-2*end*.6+gp)/(ts+gp))),sx=(W-(nx*(ts+gp)-gp))/2;
    const t=(x,y)=>add([plPoly(plRR(x,y,ts,ts,ts*.22))],'trim',true);
    for(let i=0;i<nx;i++){t(sx+i*(ts+gp),m);t(sx+i*(ts+gp),H-m-ts);}
    const inner=H-2*m-2*ts-2*gp,ny=Math.max(0,Math.floor((inner+gp)/(ts+gp)));for(let j=0;j<ny;j++){const y=m+ts+gp+j*(ts+gp)+(inner-(ny*(ts+gp)-gp))/2;t(sx,y);t(sx+(nx-1)*(ts+gp),y);}
    x0=sx+ts+H*.08;x1=W-sx-ts-H*.08;y0=m+ts+H*.05;y1=H-m-ts-H*.05;}
  // extras
  if(sp.orn==='checker'){const c=H*.16,cols=3,rows=Math.floor((y1-y0)/c);const yy=(H-rows*c)/2;for(const side of[0,1])for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)if((i+j)%2===0){
      const x=side?W-end-(i+1)*c:end+i*c;add([plPoly(plRR(x+c*.05,yy+j*c+c*.05,c*.9,c*.9,c*.08))],'trim');}x0+=cols*c+H*.06;x1-=cols*c+H*.06;}
  if(sp.orn==='speed'){const n=3,cw=H*.16,ch=H*.5,th=H*.07;for(let i=0;i<n;i++){const x=x1-(n-i)*cw*1.25,yc=H/2;
      add([plPoly(plRound([plV(x,yc+ch/2),plV(x+th,yc+ch/2),plV(x+th+cw*.8,yc),plV(x+th,yc-ch/2),plV(x,yc-ch/2),plV(x+cw*.8,yc)],th*.25,3))],'trim');}x1-=n*cw*1.25+H*.06;}
  if(sp.orn==='stars'){for(const x of[x0+H*.09,x1-H*.09])add([plPoly(plStar(x,H/2,H*.085))],'trim');x0+=H*.3;x1-=H*.3;}
  if(sp.orn==='laurel'){for(const sd of[-1,1]){const cx=W/2+sd*(x1-x0)*.36,cy=H*.52,R=H*.24;const n=5;
      for(let i=0;i<n;i++){const a=(sd<0?Math.PI:0)+sd*(-.85+i*1.7/(n-1)),px=cx+Math.cos(a)*R,py=cy+Math.sin(a)*R;const tang=a+sd*Math.PI/2;
        for(const [off,len,rot] of [[.3,1,.62],[-.22,.82,-.62]]){const L=H*.17*len,Wd=L*.4,ox=px+Math.cos(a)*off*H*.16,oy=py+Math.sin(a)*off*H*.16;const pts=[];
          for(let k=0;k<14;k++){const t=k/14*Math.PI*2,lx=Math.cos(t)*L/2,ly=Math.sin(t)*Wd/2,ang=tang+sd*rot;pts.push(plV(ox+lx*Math.cos(ang)-ly*Math.sin(ang),oy+lx*Math.sin(ang)+ly*Math.cos(ang)));}add([plPoly(pts)],'trim');}}}
    x0=W/2-(x1-x0)*.22;x1=W-x0;}
  // competition timer: a hand pad at each end, like the ones you touch to start and stop
  if(sp.orn==='pads'){const pr=sp.shape==='timer'?H*.42:H*.36,yc=H/2;
    for(const side of[0,1]){const cx=sp.shape==='timer'?(side?W-H/2:H/2):(side?x1-pr:x0+pr);const sg=side?1:-1;
      add([plRing(plCircle(cx,yc,pr,56),plCircle(cx,yc,pr-H*.04,56))],'trim');
      // a flat hand, fingers up, thumb toward the middle (each part separate with a small gap)
      const u=pr*.78,inward=side?-1:1,P=(x,y)=>plV(cx+x*inward,yc+y);const fix=a=>(inward>0?a:a.reverse());
      const cap=(bx,by,w,h,ang)=>{const a=[],r=w/2,ca=Math.cos(ang),sa=Math.sin(ang);const pt=(x,y)=>P(bx+x*ca-y*sa,by+x*sa+y*ca);
        for(let k=0;k<=10;k++){const t=Math.PI*k/10;a.push(pt(Math.cos(t)*r,h-r+Math.sin(t)*r));}for(let k=0;k<=10;k++){const t=Math.PI+Math.PI*k/10;a.push(pt(Math.cos(t)*r,r+Math.sin(t)*r));}return fix(a);};
      const palm=[];for(let k=0;k<40;k++){const t=k/40*Math.PI*2;palm.push(P(Math.cos(t)*u*.36,-u*.3+Math.sin(t)*u*.38));}add([plPoly(fix(palm))],'text2');
      [[-.27,.08,.5,.16],[-.09,.12,.6,.05],[.09,.12,.56,-.05],[.25,.07,.45,-.16]].forEach(([fx,fy,fh,a])=>add([plPoly(cap(fx*u,fy*u,u*.15,fh*u,a))],'text2'));
      add([plPoly(cap(u*.4,-u*.3,u*.16,u*.4,-.95))],'text2');}
    const used=sp.shape==='timer'?H:pr*2;x0=Math.max(x0,used+H*.06);x1=Math.min(x1,W-used-H*.06);}
  if(x1-x0<H*.8){const c=(x0+x1)/2;x0=c-H*.4;x1=c+H*.4;}
  // icon
  const isz=Math.min(y1-y0,H*.62);
  if(sp.icon!=='none'&&sp.layout!=='lcd'&&sp.layout!=='display'){add(plIcon(sp.icon,x0,(H-isz)/2,isz,txt.pz),'text2');x0+=isz+H*.14;}
  // text
  const midY=(y0+y1)/2,hh=y1-y0,big=txt.time,l2=txt.label,l3=txt.sub,w=x1-x0,lab=[l2,l3].filter(Boolean).join('  -  ');
  if(sp.layout==='display'){   // like the big display at competitions: large slanted red digits, a name line with speed streaks under them
    const dh=H*.42;let d=dh;const sw=plSegWidth(big,d);const maxw=(x1-x0)*.92;if(sw>maxw)d*=maxw/sw;const dw=plSegWidth(big,d);
    add(plSeg(big,W/2-dw/2+H*.04,H*.44,d,.12).shapes,'text');
    const so=sp.orn==='streaks'?H*.18:0,ly=H*.3,t=plText(l2||lab,H*.1,W/2+so,ly,'center',W*.5);add(t.shapes,'text2');const sx=W/2+so-t.w/2-H*.08;
    if(sp.orn==='streaks')for(let i=0;i<3;i++){const yy=ly+H*.045-i*H*.045,len=H*(.42-i*.08);add([plPoly(plRound([plV(sx-len,yy),plV(sx,yy),plV(sx-H*.02,yy-H*.025),plV(sx-len-H*.02,yy-H*.025)],H*.008,2))],'text2');}
    if(l3&&l2)add(plText(l3,H*.06,W/2,H*.17,'center',W*.36).shapes,'text2');}
  else if(sp.layout==='lcd'&&sp.orn==='pads'){const wx=x0,ww=x1-x0,wy=H*.33,wh=H*.55;add([plRing(plRR(wx,wy,ww,wh,H*.08),plRR(wx+H*.035,wy+H*.035,ww-H*.07,wh-H*.07,H*.055))],'trim');
    let dh=wh*.6;const sw=plSegWidth(big,dh);if(sw>ww*.86)dh*=ww*.86/sw;add(plSeg(big,wx+(ww-plSegWidth(big,dh))/2,wy+(wh-dh)/2,dh).shapes,'text');
    const by=H*.19,br=H*.055;for(const bx of[wx+br*1.6,wx+ww-br*1.6])add([plRing(plCircle(bx,by,br,28),plCircle(bx,by,br*.55,28))],'trim');
    add(plText(lab,H*.1,W/2,by,'center',ww-br*7).shapes,'text2');}
  else if(sp.layout==='lcd'){const wx=Math.max(x0,H*.12),wy=H*.15,ww=(x1-x0)*.64,wh=H*.7;add([plRing(plRR(wx,wy,ww,wh,H*.1),plRR(wx+H*.035,wy+H*.035,ww-H*.07,wh-H*.07,H*.07))],'trim');
    let dh=wh*.58;const sw=plSegWidth(big,dh);if(sw>ww*.86)dh*=ww*.86/sw;add(plSeg(big,wx+(ww-plSegWidth(big,dh))/2,wy+(wh-dh)/2,dh).shapes,'text');
    const rx=wx+ww+(x1-wx-ww)/2,rw=(x1-wx-ww)*.9;const parts=(l2||'').split(' ');add(plText(parts[0],H*.2,rx,H*.62,'center',rw).shapes,'text2');add(plText(parts.slice(1).join(' '),H*.12,rx,H*.38,'center',rw).shapes,'text2');
    if(l3)add(plText(l3,H*.09,rx,H*.22,'center',rw).shapes,'text2');}
  else if(sp.layout==='side'){const tt=plText(big,hh*.62,x0,midY,'left',w*.55);add(tt.shapes,'text');const rx=x1,rw=w-tt.w-H*.15;
    add(plText(l2,hh*.2,rx,l3?midY+hh*.15:midY,'right',rw).shapes,'text2');if(l3)add(plText(l3,hh*.15,rx,midY-hh*.18,'right',rw).shapes,'text2');}
  else if(sp.layout==='center'){const cx=(x0+x1)/2;add(plText(big,hh*(lab?.56:.7),cx,lab?midY+hh*.12:midY,'center',w).shapes,'text');if(lab)add(plText(lab,hh*.15,cx,y0+hh*.13,'center',w).shapes,'text2');}
  else{add(plText(big,hh*(lab?.56:.7),x0,lab?midY+hh*.12:midY,'left',w).shapes,'text');if(lab)add(plText(lab,hh*.15,x0,y0+hh*.13,'left',w).shapes,'text2');}
  return{outline:plOutline(sp,W,H),decor,W,H};}
// solid pieces ---------------------------------------------------------------------------------------------
// fillet: the plate's top and bottom edges get a small rounded bevel so nothing is sharp
const plExt=(shape,depth,z,fillet=0)=>{let g;
  if(fillet>0&&depth>fillet*2.2){g=new THREE.ExtrudeGeometry(shape,{depth:depth-2*fillet,bevelEnabled:true,bevelThickness:fillet,bevelSize:fillet,bevelOffset:-fillet,bevelSegments:3,curveSegments:8});g.translate(0,0,z+fillet);}
  else{g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:8});g.translate(0,0,z);}return g;};
function plPointIn(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x))c=!c;}return c;}
// even-odd regions from nested, non-overlapping contours (for cutting decorations into the plate)
function plRegions(contours){const C=contours.map(pts=>({pts,kids:[],parent:null}));
  for(const a of C){let best=null;for(const b of C){if(a===b)continue;if(plPointIn(a.pts[0],b.pts)&&(!best||plPointIn(b.pts[0],best.pts)))best=b;}a.parent=best;}
  for(const a of C){let d=0,p=a.parent;while(p){d++;p=p.parent;}a.depth=d;if(a.parent)a.parent.kids.push(a);}
  return C.filter(c=>c.depth%2===0).map(c=>{const s=new THREE.Shape(c.pts);s.holes=c.kids.map(k=>new THREE.Path(k.pts));return s;});}
const plContours=s=>[s.getPoints(8),...s.holes.map(h=>h.getPoints(8))];
// do two outlines cross? (cutting needs pieces that don't overlap; any that do stay raised instead)
const plBox=pts=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const p of pts){if(p.x<a)a=p.x;if(p.y<b)b=p.y;if(p.x>c)c=p.x;if(p.y>d)d=p.y;}return[a,b,c,d];};
function plCross(A,B){const ba=plBox(A),bb=plBox(B);if(ba[2]<bb[0]||bb[2]<ba[0]||ba[3]<bb[1]||bb[3]<ba[1])return false;
  const ccw=(a,b,c)=>(c.y-a.y)*(b.x-a.x)-(b.y-a.y)*(c.x-a.x);
  for(let i=0;i<A.length;i++){const p1=A[i],p2=A[(i+1)%A.length];if(Math.max(p1.x,p2.x)<bb[0]||Math.min(p1.x,p2.x)>bb[2]||Math.max(p1.y,p2.y)<bb[1]||Math.min(p1.y,p2.y)>bb[3])continue;
    for(let j=0;j<B.length;j++){const q1=B[j],q2=B[(j+1)%B.length];const d1=ccw(p1,p2,q1),d2=ccw(p1,p2,q2),d3=ccw(q1,q2,p1),d4=ccw(q1,q2,p2);if(((d1>0)!==(d2>0))&&((d3>0)!==(d4>0)))return true;}}
  return false;}
const plColorOf=(sp,role)=>role==='base'?sp.base:role==='trim'?sp.trim:role==='text'?sp.textC:sp.text2;
function plSolids(sp,D,txt){const MM=25.4,dz=plDesign(sp,D,txt),T=D.T*MM,R=D.R*MM,out=[];const mg=sp.magnets||{n:0};const fil=Math.min(.6,T*.18);
  const outShape=new THREE.Shape(dz.outline);let zb=0;
  if(mg.n>0){const md=Math.min(mg.depth*MM,T-.6),mr=mg.dia*MM/2;const bot=new THREE.Shape(dz.outline);
    for(let i=0;i<mg.n;i++){const cx=dz.W*(i+1)/(mg.n+1);bot.holes.push(new THREE.Path(plCircle(cx,dz.H/2,mr,36)));}out.push({geo:plExt(bot,md,0,Math.min(fil,md/2.3)),role:'base'});zb=md;}
  if(sp.text==='engraved'){const D2=Math.min(R,T-zb-.4),ft=Math.min(.25,D2/2.3);out.push({geo:zb?plExt(outShape,T-D2-zb+.3,zb-.3,.3):plExt(outShape,T-D2+fil,0,fil),role:'base'});
    const cont=[dz.outline],cut=[],keep=[];
    for(const d of dz.decor){const cs=plContours(d.s);if(cs.some(c=>plCross(c,dz.outline)||cont.slice(1).some(o=>plCross(c,o))))keep.push(d);else{cont.push(...cs);cut.push(d);}}
    for(const r of plRegions(cont))out.push({geo:plExt(r,D2,T-D2,ft),role:'base'});
    for(const d of cut)out.push({geo:plExt(d.s,D2,T-D2),role:d.role,inlay:true,rb:d.rb});
    for(const d of keep)out.push({geo:plExt(d.s,R,T),role:d.role,rb:d.rb});}
  else{out.push({geo:plExt(outShape,T-zb,zb,zb?0:fil),role:'base'});if(zb){/* keep the top edge rounded above the magnet layer */out.pop();out.push({geo:plExt(outShape,T-zb+fil,zb-fil,fil),role:'base'});}
    for(const d of dz.decor)out.push({geo:plExt(d.s,R,T),role:d.role,rb:d.rb});}
  for(const p of out)p.color=plColorOf(sp,p.role);return out;}
// group pieces into bodies by color (pieces that print in the same filament become one body)
function plBodies(sp,pieces,opts={}){const RB=['#FFFFFF','#FFD400','#00A651','#0051BA','#C41E3A','#FF5800'];const g=new Map();let k=0;
  for(const p of pieces){if(p.inlay&&!opts.inlays)continue;const col=(p.rb&&sp.rainbow&&opts.rainbow)?RB[(k++*7)%6]:p.color;const key=col.toUpperCase();if(!g.has(key))g.set(key,{color:key,roles:new Set(),pieces:[]});g.get(key).roles.add(p.role);g.get(key).pieces.push(p);}
  const NAME={base:'Plate',trim:'Trim',text:'Time',text2:'Details'};
  return[...g.values()].map(b=>({...b,name:[...b.roles].map(r=>NAME[r]).join(' + ')}));}
// triangles out of pieces (in mm)
function plTris(pieces,cb){for(const pc of pieces){const g=pc.geo.index?pc.geo.toNonIndexed():pc.geo;const p=g.attributes.position.array;for(let i=0;i<p.length;i+=9)cb(p[i],p[i+1],p[i+2],p[i+3],p[i+4],p[i+5],p[i+6],p[i+7],p[i+8]);}}
function plToSTL(pieces,name){const f=n=>n.toFixed(4);const parts=[`solid ${name}`];
  plTris(pieces,(ax,ay,az,bx,by,bz,cx,cy,cz)=>{const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-12)return;nx/=l;ny/=l;nz/=l;
    parts.push(`facet normal ${f(nx)} ${f(ny)} ${f(nz)}\n outer loop\n  vertex ${f(ax)} ${f(ay)} ${f(az)}\n  vertex ${f(bx)} ${f(by)} ${f(bz)}\n  vertex ${f(cx)} ${f(cy)} ${f(cz)}\n endloop\nendfacet`);});
  parts.push(`endsolid ${name}`);return parts.join('\n')+'\n';}
// 3MF: one object per color body, all lined up, so the slicer offers to load them as one object with parts
function plTo3MF(bodies){const esc=s=>s.replace(/[<&"]/g,c=>({'<':'&lt;','&':'&amp;','"':'&quot;'}[c]));
  let mats='<basematerials id="1">'+bodies.map(b=>`<base name="${esc(b.name)}" displaycolor="${b.color}FF"/>`).join('')+'</basematerials>';let objs='',items='';
  bodies.forEach((b,i)=>{const vmap=new Map(),verts=[],tris=[];const vid=(x,y,z)=>{const k=x.toFixed(4)+','+y.toFixed(4)+','+z.toFixed(4);let id=vmap.get(k);if(id===undefined){id=verts.length;vmap.set(k,id);verts.push(k);}return id;};
    plTris(b.pieces,(ax,ay,az,bx,by,bz,cx,cy,cz)=>{const a=vid(ax,ay,az),c1=vid(bx,by,bz),c2=vid(cx,cy,cz);if(a!==c1&&c1!==c2&&a!==c2)tris.push(`<triangle v1="${a}" v2="${c1}" v3="${c2}"/>`);});
    const id=i+2;objs+=`<object id="${id}" type="model" name="${esc(b.name)}" pid="1" pindex="${i}"><mesh><vertices>`+verts.map(k=>{const[x,y,z]=k.split(',');return `<vertex x="${x}" y="${y}" z="${z}"/>`;}).join('')+`</vertices><triangles>${tris.join('')}</triangles></mesh></object>`;items+=`<item objectid="${id}"/>`;});
  const model=`<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">PB plate</metadata><resources>${mats}${objs}</resources><build>${items}</build></model>`;
  const files=[['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'],
    ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'],
    ['3D/3dmodel.model',model]];
  return plZip(files);}
// minimal zip (stored, no compression) ------------------------------------------------------------------------
const PL_CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function plZip(files){const enc=new TextEncoder(),chunks=[],central=[];let off=0;const u16=v=>[v&255,(v>>8)&255],u32=v=>[v&255,(v>>8)&255,(v>>16)&255,(v>>>24)&255];
  for(const[name,text] of files){const data=enc.encode(text),nm=enc.encode(name);let c=0xFFFFFFFF;for(let i=0;i<data.length;i++)c=PL_CRC[(c^data[i])&255]^(c>>>8);c=(c^0xFFFFFFFF)>>>0;
    const head=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0x21),...u32(c),...u32(data.length),...u32(data.length),...u16(nm.length),...u16(0)]);
    chunks.push(head,nm,data);central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0x21),...u32(c),...u32(data.length),...u32(data.length),...u16(nm.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nm);
    off+=head.length+nm.length+data.length;}
  const cdSize=central.reduce((s,a)=>s+a.length,0);const endRec=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(cdSize),...u32(off),...u16(0)]);
  const all=[...chunks,...central,endRec],len=all.reduce((s,a)=>s+a.length,0),out=new Uint8Array(len);let p=0;for(const a of all){out.set(a,p);p+=a.length;}return out;}
// UI -----------------------------------------------------------------------------------------------------
const PL_DEFAULTS={preset:'classic',magnets:{n:0,dia:.25,depth:.08},l2:'',l3:'',showDate:true,open:false};
let plSpec=Object.assign({},PL_PRESETS.classic,PL_DEFAULTS,store.get('plateSpec',{}));if(!plSpec.trim)plSpec.trim=plSpec.accent||'#1D1D1F';if(!plSpec.textC)plSpec.textC=plSpec.accent||plSpec.trim;if(!plSpec.text2)plSpec.text2=plSpec.textC;
function plData(){const k=$('plPz').value,r=k?pbEvents(isNaN(+k)?k:+k):{best:{}};const kind=$('plKind').value,v=r.best[kind];return{k,kind,v,at:r.best[kind+'@'],name:$('plName').value.trim()};}
function plTxt(d){const ev=d.k?keyLabel(isNaN(+d.k)?d.k:+d.k):'3x3';const auto2=(ev+' '+(d.kind==='Single'||!d.kind?'single':d.kind)).toUpperCase();
  const auto3=[d.name,plSpec.showDate&&d.at?new Date(d.at).toLocaleDateString():''].filter(Boolean).join('  -  ').toUpperCase();
  const clean=s=>s.replace(/[^\x20-\x7E]/g,'');return{time:d.v!=null?fmtT(d.v):'--.--',label:clean(plSpec.l2||auto2),sub:clean(plSpec.l3||auto3),pz:d.k||'3'};}
function plDims(){const n=(id,d)=>{const v=parseFloat($(id).value);return v>0?v:d;};const D={W:n('plW',3),H:n('plH',.75),T:n('plT',.08),R:n('plR',.03)};
  if(plSpec.magnets&&plSpec.magnets.n>0)D.T=Math.max(D.T,plSpec.magnets.depth+.04);return D;}
function plFill(){const keys=CUBES.concat(Object.keys(TPZ)).filter(k=>(solves[k]||[]).length);const cur=$('plPz').value;
  $('plPz').innerHTML=keys.length?keys.map(k=>`<option value="${k}">${keyLabel(k)}</option>`).join(''):'<option value="">No timer solves yet</option>';if(keys.map(String).includes(cur))$('plPz').value=cur;
  const k=$('plPz').value;const r=k?pbEvents(isNaN(+k)?k:+k):{best:{}};const kinds=PB_KINDS.map(x=>x[0]).filter(x=>r.best[x]!==undefined);const ck=$('plKind').value;
  $('plKind').innerHTML=kinds.length?kinds.map(x=>`<option>${x}</option>`).join(''):'<option value="">—</option>';if(kinds.includes(ck))$('plKind').value=ck;plSync();plPreview();}
// preview: a small three.js scene you can tilt
const plView={ren:null,scene:null,cam:null,grp:null,rx:-.5,ry:0};
function plPreview(){const box=$('plPrev3d');if(!box||!box.offsetParent)return;const w=box.clientWidth||800,h=Math.round(Math.max(170,Math.min(300,w*.34)));
  if(!plView.ren){try{plView.ren=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){box.textContent='3D preview is not available here.';return;}box.appendChild(plView.ren.domElement);
    plView.scene=new THREE.Scene();plView.scene.add(new THREE.HemisphereLight(0xffffff,0x3a3a3a,.75));const dl=new THREE.DirectionalLight(0xffffff,.85);dl.position.set(-80,140,160);plView.scene.add(dl);
    plView.cam=new THREE.PerspectiveCamera(24,2,1,4000);let drag=null;const el=plView.ren.domElement;el.style.touchAction='none';el.style.cursor='grab';
    el.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,plView.rx,plView.ry];el.setPointerCapture(e.pointerId);});
    el.addEventListener('pointermove',e=>{if(!drag)return;plView.ry=Math.max(-1.2,Math.min(1.2,drag[3]+(e.clientX-drag[0])*.008));plView.rx=Math.max(-1.4,Math.min(.4,drag[2]+(e.clientY-drag[1])*.008));plDraw();});
    el.addEventListener('pointerup',()=>drag=null);}
  plView.ren.setPixelRatio(Math.min(2,window.devicePixelRatio||1));plView.ren.setSize(w,h);plView.cam.aspect=w/h;plView.cam.updateProjectionMatrix();
  if(plView.grp){plView.scene.remove(plView.grp);plView.grp.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  const D=plDims(),pieces=plSolids(plSpec,D,plTxt(plData()));const bodies=plBodies(plSpec,pieces,{rainbow:true});const grp=new THREE.Group();
  const metal=c=>/D4A537|C9CED6|7A8696/i.test(c);
  for(const b of bodies)for(const pc of b.pieces)grp.add(new THREE.Mesh(pc.geo,new THREE.MeshStandardMaterial({color:b.color,metalness:pc.role==='base'&&metal(b.color)?.45:.05,roughness:.42})));
  const W=D.W*25.4,H=D.H*25.4;grp.children.forEach(m=>m.position.set(-W/2,-H/2,0));plView.grp=new THREE.Group();plView.grp.add(grp);plView.scene.add(plView.grp);
  const dist=Math.max(W/(2*Math.tan(12*Math.PI/180))/Math.max(1,plView.cam.aspect)*1.18,H*3.4);plView.cam.position.set(0,0,dist);plView.cam.lookAt(0,0,0);plDraw();
  const ex=plBodies(plSpec,pieces,{inlays:plSpec.text==='engraved'});
  $('plInfo').textContent=`${D.W.toFixed(2)} × ${D.H.toFixed(2)} × ${D.T.toFixed(2)} in · ${ex.length} color${ex.length>1?'s':''}: ${ex.map(b=>b.name).join(', ')}`+(plSpec.text==='engraved'?' (engraved; colors print as flush inlays)':'')+(plSpec.magnets.n?` · ${plSpec.magnets.n} magnet pocket${plSpec.magnets.n>1?'s':''} on the back`:'')+' · drag to tilt';}
function plDraw(){if(!plView.ren)return;plView.grp.rotation.set(plView.rx,plView.ry,0);plView.ren.render(plView.scene,plView.cam);}
// controls
const PL_CTRL=[['shape','plShape'],['border','plBorder'],['orn','plOrn'],['icon','plIcon'],['layout','plLayout'],['text','plTextMode']];
const PL_COLS=[['base','plBase'],['trim','plTrimC'],['textC','plTextC'],['text2','plText2C']];
function plSync(){$('plStyle').value=plSpec.preset||'custom';for(const[k,id] of PL_CTRL)$(id).value=plSpec[k];for(const[k,id] of PL_COLS)$(id).value=plSpec[k];
  $('plL2').value=plSpec.l2||'';$('plL3').value=plSpec.l3||'';$('plDate').checked=!!plSpec.showDate;$('plMagN').value=String(plSpec.magnets.n);$('plMagD').value=plSpec.magnets.dia;$('plMagH').value=plSpec.magnets.depth;
  $('plCustom').hidden=!plSpec.open;$('plCustomBtn').textContent=plSpec.open?'Hide custom options':'✎ Create custom';}
function plSaveSpec(){store.set('plateSpec',plSpec);plPreview();}
$('plStyle').innerHTML=Object.entries(PL_PRESETS).map(([k,p])=>`<option value="${k}">${p.label}</option>`).join('')+'<option value="custom">Custom</option>';
$('plStyle').onchange=e=>{const k=e.target.value;if(PL_PRESETS[k]){const dm=PL_PRESETS[k].dims||[3,.75];$('plW').value=dm[0];$('plH').value=dm[1];const keep={magnets:plSpec.magnets,l2:plSpec.l2,l3:plSpec.l3,showDate:plSpec.showDate,open:plSpec.open};plSpec=Object.assign({},PL_PRESETS[k],keep,{preset:k});}else plSpec.preset='custom';plSync();plSaveSpec();};
for(const[k,id] of PL_CTRL)$(id).onchange=e=>{plSpec[k]=e.target.value;plSpec.preset='custom';plSync();plSaveSpec();};
for(const[k,id] of PL_COLS)$(id).oninput=e=>{plSpec[k]=e.target.value;if(k==='trim')plSpec.rainbow=false;plSaveSpec();};
$('plL2').oninput=e=>{plSpec.l2=e.target.value;plSaveSpec();};$('plL3').oninput=e=>{plSpec.l3=e.target.value;plSaveSpec();};$('plDate').onchange=e=>{plSpec.showDate=e.target.checked;plSaveSpec();};
$('plMagN').onchange=e=>{plSpec.magnets.n=+e.target.value;plSaveSpec();};$('plMagD').oninput=e=>{const v=parseFloat(e.target.value);if(v>0){plSpec.magnets.dia=v;plSaveSpec();}};$('plMagH').oninput=e=>{const v=parseFloat(e.target.value);if(v>0){plSpec.magnets.depth=v;plSaveSpec();}};
$('plCustomBtn').onclick=e=>{e.currentTarget.blur();plSpec.open=!plSpec.open;plSync();store.set('plateSpec',plSpec);};
['plPz','plKind'].forEach(id=>$(id).addEventListener('change',plFill));['plName','plW','plH','plT','plR'].forEach(id=>$(id).addEventListener('input',plPreview));
window.addEventListener('resize',()=>{if(plView.ren)plPreview();});
function plFileBase(){const d=plData();return `PB plate ${d.k?keyLabel(isNaN(+d.k)?d.k:+d.k):''} ${d.kind} ${d.v!=null?fmtT(d.v):''}`.replace(/[:/\\]/g,'-').replace(/\s+/g,' ').trim();}
function plReady(){const d=plData();if(d.v==null){toast('Set a PB in the Timer first.');return null;}return{d,pieces:plSolids(plSpec,plDims(),plTxt(d))};}
// binary save: desktop app (new versions) writes bytes directly; otherwise a normal download
function plSaveBin(name,bytes){if(window.desktop&&window.desktop.saveBinary){window.desktop.saveBinary(name,bytes).then(r=>{const m=r&&r.ok?'Saved to '+r.path:r&&r.canceled?'':'Could not save the file.';if(m)toast(m);});return;}
  webSave(name,new Blob([bytes],{type:'application/octet-stream'})).then(r=>{if(r==='saved')toast('Saved '+name);});}
$('plSave').onclick=e=>{e.currentTarget.blur();const r=plReady();if(!r)return;saveText(plFileBase()+'.stl',plToSTL(r.pieces.filter(p=>!p.inlay),'pbplate'));};
$('plSave3mf').onclick=e=>{e.currentTarget.blur();const r=plReady();if(!r)return;const bodies=plBodies(plSpec,r.pieces,{inlays:true});plSaveBin(plFileBase()+'.3mf',plTo3MF(bodies));};
$('plSaveParts').onclick=e=>{e.currentTarget.blur();const r=plReady();if(!r)return;const bodies=plBodies(plSpec,r.pieces,{inlays:true});const base=plFileBase();
  bodies.forEach((b,i)=>setTimeout(()=>saveText(`${base} - ${i+1} ${b.name}.stl`,plToSTL(b.pieces,'part')),i*700));};
plSync();
