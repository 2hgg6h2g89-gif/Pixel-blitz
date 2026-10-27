'use strict';
const C=document.getElementById('c'),X=C.getContext('2d');const DPR=Math.min(3,window.devicePixelRatio||1);C.width=390*DPR;C.height=844*DPR;X.imageSmoothingEnabled=false;
const W=390,H=844,PPY=7.3; // px per yard
// Canvas HUD ignores CSS. When the home indicator is present, lift only the
// bottom controls a hair (12–24 canvas px). Top inset stays in CSS (pb-v57).
let _sb=null;
function safeBottom(){
 if(_sb!=null)return _sb;
 const rh=C.getBoundingClientRect().height;
 if(!(rh>1))return 0;
 let css=0;
 try{const d=document.createElement('div');d.style.cssText='position:fixed;bottom:0;width:0;height:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none';document.body.appendChild(d);css=d.getBoundingClientRect().height||0;d.remove()}catch(e){}
 _sb=css>0?Math.round(Math.min(24,Math.max(12,css*(H/rh)))):0;
 return _sb}
const FIELDW=53.3;
const TEAMS=[
 {n:'NEON COYOTES',a:'NCY',c1:'#e8344e',c2:'#ffd23f',h:'#ffd23f',p:'#f4f0e6'},
 {n:'IRON HERONS',a:'IHR',c1:'#1f6fd6',c2:'#ffffff',h:'#d9e3ef',p:'#1a2b4a'},
 {n:'DUSK RAPTORS',a:'DSK',c1:'#ff8a1f',c2:'#2a1450',h:'#2a1450',p:'#ff8a1f'},
 {n:'GLACIER YETIS',a:'GLY',c1:'#e9f6ff',c2:'#16a07a',h:'#16a07a',p:'#e9f6ff'},
];
const QLEN=180;
const DIFFS=[{n:'ROOKIE',td:.18,fg:.14,clk:[75,105],def:.84,shed:1.65,int:.3,cov:2.8,sep:.9,pk:4.2},{n:'PRO',td:.28,fg:.2,clk:[60,90],def:.97,shed:1.25,int:.5,cov:2.0,sep:.6,pk:3.8},{n:'ALL-PRO',td:.38,fg:.22,clk:[50,78],def:1.06,shed:.85,int:.7,cov:1.1,sep:.25,pk:3.3},{n:'LEGEND',td:.5,fg:.22,clk:[40,65],def:1.14,shed:.7,int:.85,cov:.7,sep:0,pk:3.0}];
const LS={get(){try{return JSON.parse(localStorage.getItem('pb_ladder')||'{}')}catch(e){return{}}},set(o){try{localStorage.setItem('pb_ladder',JSON.stringify(o))}catch(e){}}};
const MAXLVL=9;function unlocked(){return Math.max(1,LS.get()['d'+G.diff]||1)}
function lvlOpp(l){const o=[0,1,2,3].filter(i=>i!==G.home);return o[(l-1)%3]}
function lvlStr(l){return Math.floor((l-1)/3)*0.05+(l-1)%3*0.015}window.TEAMS=TEAMS;
const PLAYS=[
 {n:'SLANT FLOOD',t:'pass',r:[['slant',-1],['out',1],['flat',-1]]},
 {n:'FOUR VERTS',t:'pass',r:[['go',-1],['post',1],['curl',-1]]},
 {n:'CURL & DRAG',t:'pass',r:[['curl',-1],['drag',1],['corner',1]]},
 {n:'HB BLAST',t:'run',r:[['block',-1],['block',1],['block',-1]]},
 {n:'QB KEEPER',t:'keep',r:[['go',-1],['go',1],['block',-1]]},
 {n:'SWEEP LEFT',t:'sweep',r:[['block',-1],['block',1],['block',-1]]},
];
let G={diff:1,lvl:1,clock:QLEN,aud:4,paused:false,st:'modesel',t:0,home:0,away:1,sh:0,sa:0,q:1,drive:0,maxDrives:8,los:25,down:1,togo:10,msg:'',msgT:0,sel:0,players:[],ball:null,carrier:null,stats:{py:0,ry:0,td:0,int:0,sack:0},log:[],juke:0,jcd:0,cam:0,snapT:0,shake:0,parts:[]};
window.G=G;G.bulletPref=localStorage.getItem('pb_bullet')!=='0';G.adv=false;
try{const d=parseInt(localStorage.getItem('pb_diff'),10);if(d>=0&&d<DIFFS.length)G.diff=d}catch(e){}
function setDiff(i){i=Math.max(0,Math.min(DIFFS.length-1,i|0));G.diff=i;try{localStorage.setItem('pb_diff',String(i))}catch(e){}
 try{const S=window.__season&&__season.get&&__season.get();if(S){S.diff=i;if(__season.save)__season.save()}}catch(e){}
 try{const C=window.__career&&__career.get&&__career.get();if(C){C.diff=i;if(__career.save)__career.save()}}catch(e){}
 if(G.lvl>unlocked())G.lvl=unlocked()}
function diffRowGeom(x,y,w,h){const g=4,bw=(w-(DIFFS.length-1)*g)/DIFFS.length;return DIFFS.map((d,i)=>({i,n:d.n,x:x+i*(bw+g),y,w:bw,h}))}
function drawDiffRow(x,y,w,h){diffRowGeom(x,y,w,h).forEach(b=>{const on=G.diff===b.i;box(b.x,b.y,b.w,b.h,on?'#e8344e':'#120a24',on?'#ffd23f':'#5a4a8a');txt(b.n,b.x+b.w/2,b.y+h/2+(b.n.length>6?1:0),b.n.length>6?9:11,'#fff')})}
function hitDiffRow(t,x,y,w,h){if(!t)return false;for(const b of diffRowGeom(x,y,w,h))if(t[0]>=b.x&&t[0]<=b.x+b.w&&t[1]>=b.y&&t[1]<=b.y+b.h){setDiff(b.i);return true}return false}
function midCareer(){const S=window.__season&&__season.get&&__season.get();return !!(G.career||(S&&S.career))}
function midKey(c){return c?'pb_mid_career':'pb_mid_arcade'}
function saveMid(){const S=window.__season&&__season.get&&__season.get();const c=midCareer();
 const snap={v:1,mode:c?'career':'arcade',home:G.home,away:G.away,atHome:!!G.atHome,sh:G.sh|0,sa:G.sa|0,q:G.q||1,clock:G.clock,down:G.down||1,togo:G.togo||10,los:G.los,drive:G.drive|0,diff:G.diff|0,lvl:G.lvl||1,aud:G.aud|0,stats:Object.assign({py:0,ry:0,td:0,int:0,sack:0},G.stats||{}),log:(G.log||[]).slice(0,12),two:!!G.two,season:!!G.season,kick:G.st==='patpick'?'patpick':(G.st==='fg'&&G.fg?(G.fg.pat?'pat':'fg'):'down'),week:S?S.week:null,phase:S?S.phase:null,team:S?S.team:G.home};
 try{localStorage.setItem(midKey(c),JSON.stringify(snap));G.midNote='SAVED'}catch(e){G.midNote='NO SAVE'}}
function loadMid(c){try{return JSON.parse(localStorage.getItem(midKey(!!c))||'null')}catch(e){return null}}
function clearMid(c){try{localStorage.removeItem(midKey(!!c))}catch(e){}}
function midForHub(c){const snap=loadMid(!!c);if(!snap||snap.v!==1)return null;const S=window.__season&&__season.get&&__season.get();if(!S||!!S.career!==!!c)return null;if(Number(snap.team)!==Number(S.team))return null;if(snap.week!==S.week||snap.phase!==S.phase)return null;return snap}
function resumeMid(snap){if(!snap)return false;G.season=!!snap.season;G.career=snap.mode==='career';G.home=snap.home|0;G.away=snap.away|0;G.atHome=!!snap.atHome;setDiff(snap.diff|0);G.lvl=snap.lvl||1;
 Object.assign(G,{sh:snap.sh|0,sa:snap.sa|0,q:snap.q||1,clock:snap.clock,down:snap.down||1,togo:snap.togo||10,los:+snap.los||25,drive:snap.drive|0,aud:snap.aud!=null?snap.aud:4,log:snap.log||[],stats:Object.assign({py:0,ry:0,td:0,int:0,sack:0},snap.stats||{}),two:!!snap.two,fgDone:false,paused:false,fg:null,fgBall:null,ball:null,carrier:null,players:[],msg:'',msgT:0,banner:null,midNote:'',read:0,_rk:null});
 if(snap.kick==='pat'){startFG(true);return true}if(snap.kick==='fg'){startFG(false);return true}if(snap.kick==='patpick'){G.st='patpick';return true}autoPick();return true}
function pauseGeom(){const x=32,w=W-64;return{diff:{x:28,y:206,w:W-56,h:36},resume:{x,y:258,w,h:48},save:{x,y:316,w,h:48},quit:{x,y:374,w,h:48}}}
function hitBox(t,b){return t&&b&&t[0]>=b.x&&t[0]<=b.x+b.w&&t[1]>=b.y&&t[1]<=b.y+b.h}
window.setDiff=setDiff;window.drawDiffRow=drawDiffRow;window.hitDiffRow=hitDiffRow;window.saveMid=saveMid;window.clearMid=clearMid;window.midForHub=midForHub;window.resumeMid=resumeMid;
// ---------- input ----------
const IN={jx:0,jy:0,taps:[],keyp:[],flick:0,truck:false,sprint:false,aimP:null,slide:0,truckTap:0};
function pos(e){const r=C.getBoundingClientRect();const p=e.touches?e.touches[0]||e.changedTouches[0]:e;return[(p.clientX-r.left)*W/r.width,(p.clientY-r.top)*H/r.height]}
// DIVE and JUKE stay on the plates from the reference HUD (r=36). v51's shared
// 44px grid moved and enlarged all three, then the corner button drew smaller
// once you tucked. One radius for every action so tuck/slide/truck cannot resize.
const ACT_R=36;
const JB={x:W-150,get y(){return H-130-safeBottom()}},DB={x:W-62,get y(){return H-200-safeBottom()}},TB={x:W-46,get y(){return H-86-safeBottom()}},BB={x:116,y:H-262};const PT=new Map(),STK={x:W-84,y:H-170,r:56},LJ={x:84,y:H-170,r:56};
function hudZones(){const z=[];const live=G.st==='live'&&!G.paused;
 if(G.st==='presnap'&&!G.audOpen){z.push({x:W-64,y:H-84-safeBottom(),r:52});z.push({x:60,y:H-84-safeBottom(),r:42})}
 const cm=cornerBtn(),carOn=live&&(G.tuck||!passerPhase()||cm==='slide'||cm==='truck')&&!G.pend&&(!G.ball||G.ball.caught)&&G.carrier&&G.carrier.team===0&&!(G.carrier.fallen>0);
 if(cm||carOn)z.push({x:LJ.x,y:LJ.y,r:LJ.r+36});
 if(cm)z.push({x:TB.x,y:TB.y,r:ACT_R+28});
 if(carOn){z.push({x:JB.x,y:JB.y,r:ACT_R+28});z.push({x:DB.x,y:DB.y,r:ACT_R+28})}
 return z}
function hudPush(sx,sy){let x=sx,y=sy;const zones=hudZones();
 for(let n=0;n<5;n++)for(const z of zones){let dx=x-z.x,dy=y-z.y,d=Math.hypot(dx,dy);if(d>=z.r)continue;if(d<0.01){dx=0;dy=-1;d=1}const push=z.r-d+1.5;x+=dx/d*push;y+=dy/d*push;if(y>z.y-4){const span=Math.sqrt(Math.max(0,z.r*z.r-(x-z.x)*(x-z.x)));y=Math.min(y,z.y-span-1)}}
 return{x,y,dx:x-sx,dy:y-sy}}
window.hudPush=hudPush;
function holdOffHud(p){if(!p||p.team||G.st!=='live'||!window.PROJ||!hudZones().length)return;
 const q=scr(p.x,p.y,0.2),o=hudPush(q[0],q[1]),m=Math.hypot(o.dx,o.dy);if(m<3)return;
 const qx=scr(p.x+0.5,p.y,0.2),qy=scr(p.x,p.y+0.5,0.2);
 const jxx=(qx[0]-q[0])/0.5,jxy=(qy[0]-q[0])/0.5,jyx=(qx[1]-q[1])/0.5,jyy=(qy[1]-q[1])/0.5,det=jxx*jyy-jxy*jyx;
 if(Math.abs(det)<0.8)return;let wx=(o.dx*jyy-o.dy*jxy)/det,wy=(jxx*o.dy-jyx*o.dx)/det;const um=Math.hypot(wx,wy)||1,ux=wx/um,uy=wy/um;
 const ix=G._ix||0,iy=-(G._iy||0),sm=Math.hypot(ix,iy);
 if(sm>0.25&&-(ix*ux+iy*uy)/sm>0.35)return;
 const step=Math.min(um,0.35);p.x=cl(p.x+ux*step,0.6,FIELDW-0.6);p.y+=uy*step;
 const vn=p.vx*ux+p.vy*uy;if(vn<0){p.vx-=vn*ux;p.vy-=vn*uy}}
function pocketSpot(){const y=G.dropY!=null?G.dropY:(G.los-5),x0=G.qb?G.qb.x:FIELDW/2;
 if(!window.PROJ||!window.hudPush)return{x:x0,y};
 let best=null,bd=1e9,prevCost=1e9;
 for(const dx of [0,-1.5,1.5,-2.8,2.8])for(const dy of [0,-0.7,0.45]){
  const x=cl(x0+dx,1.5,FIELDW-1.5),yy=y+dy,s=scr(x,yy,1.15),o=hudPush(s[0],s[1]);
  const cost=Math.hypot(o.dx,o.dy)*5+Math.abs(dx)*0.35+Math.abs(dy)*0.25;
  const prev=G._pocket&&Math.abs(dx-G._pocket.dx)<0.05&&Math.abs(dy-G._pocket.dy)<0.05;
  if(prev)prevCost=cost;
  if(cost<bd){bd=cost;best={x,y:yy,dx,dy,cost}}}
 if(G._pocket&&prevCost<bd+7){best={x:cl(x0+G._pocket.dx,1.5,FIELDW-1.5),y:y+G._pocket.dy,dx:G._pocket.dx,dy:G._pocket.dy}}
 G._pocket={dx:best.dx,dy:best.dy};
 return best}
function stickLimit(baseR,knob){return Math.max(10,baseR-knob-3)}
const LMAX=stickLimit(LJ.r-2,20),JMAX=stickLimit(50,22);
function ptsOf(e){const r=C.getBoundingClientRect();const L=e.changedTouches?[...e.changedTouches]:[e];return L.map(p=>({id:e.changedTouches?p.identifier:'m',x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}))}
// QB and WR give themselves up. TE and RB lower a shoulder.
function runAct(p){return p&&(p.role==='RB'||p.role==='TE'||p.pos==='TE')?'truck':'slide'}
// One corner button. QB behind the LOS keeps TUCK. Past the LOS that same slot becomes SLIDE. TE/RB get TRUCK there. Never both.
function cornerBtn(){const c=G.carrier;if(!c||c.team||G.st!=='live'||G.paused||G.pend||(G.ball&&!G.ball.caught)||c.fallen>0||c.slide>0)return null;
 if(c.role==='QB'&&G.play&&G.play.t==='pass'&&!G.thrown)return c.y>G.los+0.15?'slide':'tuck';
 if(runAct(c)==='truck')return'truck';if(c.role==='WR')return'slide';return null}
function actAt(x,y){
 if(Math.hypot(x-DB.x,y-DB.y)<ACT_R+14)return'diveb';
 if(Math.hypot(x-JB.x,y-JB.y)<ACT_R+14)return'jukeb';
 return null}
function kindFor(x,y){if(G.st!=='live'||G.paused)return'tap';if(x<52&&y<50)return'tap';
 if(G.play&&G.play.t==='ko'&&G.ko&&x<120&&y>H-140)return'tap';
 {const cm=cornerBtn();if(cm&&Math.hypot(x-TB.x,y-TB.y)<ACT_R+14)return cm==='tuck'?'tuckb':cm==='slide'?'slideb':'truckb'}
 if(passerPhase()){
  if(canHand()){const g=handoffGeom();if(handoffHit(x,y,g))return'handb'}
  // Tucked = runner: no throw/aim; juke/dive/slide/move OK. Buttons beat the stick.
  if(G.tuck){const a=actAt(x,y);if(a)return a;if(x<W*0.45||Math.hypot(x-LJ.x,y-LJ.y)<100)return'ljoy';return'tap'}
  for(const p of PT.values())if(p.kind==='aim')return'none';if(x<W*0.4||Math.hypot(x-LJ.x,y-LJ.y)<100)return'ljoy';return'aim'}
 // Runner HUD (RB/WR/TE, or QB past the line). Check it BEFORE the throw-stick
 // disc, which covers the dive button and used to swallow the tap.
 if(G.carrier&&G.carrier.team===0&&!G.pend&&(!G.ball||G.ball.caught)&&!(G.carrier.fallen>0)){const a=actAt(x,y);if(a)return a}
 if(Math.hypot(x-LJ.x,y-LJ.y)<95)return'ljoy';
 const a2=actAt(x,y);if(a2)return a2;
 if(Math.hypot(x-STK.x,y-STK.y)<95)return'rthr';
 return x<W/2?'ljoy':'tap'}
let PT_W=null;
function pd(e){e.preventDefault();for(const q of ptsOf(e)){IN.press={x:q.x,y:q.y,t:performance.now(),down:true};if(q.id==='m'&&e.button>0)continue;PT.set(q.id,{...q,sx:q.x,sy:q.y,t0:performance.now(),kind:kindFor(q.x,q.y),moved:0,w:PT_W});PT_W=null;const k=PT.get(q.id);if(k&&k.kind==='tog'){G.bullet=!G.bullet;say(G.bullet?'BULLET':'LOB',0.6)}if(k&&k.kind==='jukeb')IN.jk=1;if(k&&k.kind==='diveb')IN.dv=1;if(k&&k.kind==='tuckb')IN.tuck=true;if(k&&k.kind==='slideb')IN.slide=1;if(k&&k.kind==='truckb')IN.truckTap=1;if(k&&k.kind==='bulb'){G.bulletPref=!G.bulletPref;G.bullet=G.bulletPref;localStorage.setItem('pb_bullet',G.bulletPref?'1':'0')}}}
function pm(e){e.preventDefault();for(const q of ptsOf(e)){const p=PT.get(q.id);if(!p)continue;p.moved=Math.max(p.moved,Math.hypot(q.x-p.sx,q.y-p.sy));p.x=q.x;p.y=q.y;
 if(p.kind==='rthr'&&!p.tm&&Math.hypot(p.x-STK.x,p.y-STK.y)>14)p.tm=performance.now();
 if(p.kind==='joy'){let dx=p.x-p.sx,dy=p.y-p.sy,d=Math.hypot(dx,dy);if(d>JMAX){p.sx=p.x-dx/d*JMAX;p.sy=p.y-dy/d*JMAX}}}}
function pu(e){e.preventDefault();if(IN.press){IN.press.down=false;IN.press.t=performance.now()}for(const q of ptsOf(e)){const p=PT.get(q.id);if(!p)continue;PT.delete(q.id);const dt=performance.now()-p.t0;
 if(p.kind==='thr'){IN.thr={w:p.w,ht:dt/1000};continue}
 if(p.kind==='rthr'){const r=stickRead(p);if(r.tuck){IN.tuck=true}else if(r.w){IN.thr={w:r.w,ht:Math.max(0,(performance.now()-(p.tm||p.t0))/1000)}}continue}
 if(p.kind==='handb'){if(dt<300&&p.moved<16)IN.hand=1;continue}
 if(p.kind==='aim'){if(G.aim&&p.moved>22)G.relAim=true;else if(p.moved>=14)continue}
 if(p.kind==='act'&&dt<260&&p.moved>22){IN.flick=Math.sign(q.x-p.sx)||1;continue}
 if(dt<300&&p.moved<14)IN.taps.push([q.x,q.y])}}
C.addEventListener('touchstart',pd,{passive:false});C.addEventListener('touchmove',pm,{passive:false});C.addEventListener('touchend',pu,{passive:false});C.addEventListener('touchcancel',pu,{passive:false});
C.addEventListener('mousedown',pd);addEventListener('mousemove',pm);addEventListener('mouseup',pu);
const KEYS={};addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(!KEYS[k])IN.keyp.push(k);KEYS[k]=1;if(k===' ')e.preventDefault()});addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;KEYS[k]=0});
function readSticks(){let jx=0,jy=0,truck=false,aimP=null,sprintStick=false;const now=performance.now();
 for(const p of PT.values()){
  if(p.kind==='ljoy'){let dx=p.x-LJ.x,dy=p.y-LJ.y,d=Math.hypot(dx,dy);if(d>LMAX){dx=dx/d*LMAX;dy=dy/d*LMAX;d=LMAX}const on=d>(p._on?6:11);p._on=on;if(on){jx=dx/LMAX;jy=dy/LMAX}}
  else if(p.kind==='rthr'){const r=stickRead(p);p.w=r.w;p.tuckZ=r.tuck}
  else if(p.kind==='joy'){let dx=p.x-p.sx,dy=p.y-p.sy,d=Math.hypot(dx,dy);if(d>JMAX){dx=dx/d*JMAX;dy=dy/d*JMAX;d=JMAX}const on=d>(p._on?4:8);p._on=on;if(on){jx=dx/JMAX;jy=dy/JMAX}}
  else if(p.kind==='stick'){let dx=p.x-STK.x,dy=p.y-STK.y,d=Math.hypot(dx,dy);if(d>STK.r){dx=dx/d*STK.r;dy=dy/d*STK.r;d=STK.r}if(d>8){jx=dx/STK.r;jy=dy/STK.r;if(d>STK.r*0.92)sprintStick=true}}
  else if(p.kind==='truck')truck=true;
  else if(p.kind==='act'&&now-p.t0>250&&p.moved<22)truck=true;
  else if(p.kind==='aim')aimP=p}
 if(KEYS.ArrowLeft||KEYS.a)jx=-1;if(KEYS.ArrowRight||KEYS.d)jx=1;if(KEYS.ArrowUp||KEYS.w)jy=-1;if(KEYS.ArrowDown||KEYS.s)jy=1;
 if(KEYS.t)truck=true;IN.jx=jx;IN.jy=jy;IN.truck=truck;IN.sprint=sprintStick||!!KEYS.Shift;IN.aimP=aimP}
function passerPhase(){const c=G.carrier;return G.st==='live'&&G.play&&G.play.t==='pass'&&c===G.qb&&!G.thrown&&!G.qbRun}
function hint(k,txt){let seen={};try{seen=JSON.parse(localStorage.getItem('pb_hints')||'{}')}catch(e){}if(seen[k])return;seen[k]=1;try{localStorage.setItem('pb_hints',JSON.stringify(seen))}catch(e){}G.hint={txt,t:4}}
function banner(t,sub){G.banner={t,sub:sub||'',a:0}}
// ---------- helpers ----------
const rnd=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const sx=x=>x*PPY+ (W-FIELDW*PPY)/2, sy=y=>H*0.62-(y-G.cam)*PPY; // world y increases upfield
const wx=px=>(px-(W-FIELDW*PPY)/2)/PPY, wy=py=>(H*0.62-py)/PPY+G.cam;
function say(m,t=1.6){G.msg=m;G.msgT=t}
// ---------- play setup ----------
function mk(team,role,x,y,num){return{ovr:Math.round(rnd(72,96)),skin:Math.floor(Math.random()*5),team,role,x,y,vx:0,vy:0,num,sp:0,route:null,anim:0,down:false,tgt:null}}
function lockNums(list){const used=[new Set(),new Set()];const free=[];for(let n=1;n<=99;n++)free.push(n);
 for(const p of list||[]){const u=used[p.team?1:0];let n=p.num|0;if(n<1||n>99||u.has(n)){n=free.find(k=>!u.has(k))||1}u.add(n);p.num=n}}
window.lockNums=lockNums;
function setupPlay(p){
 G.play=p;const L=G.los,cx=FIELDW/2;const P=[];
 const qb=mk(0,'QB',cx,L-(p.t==='run'||p.t==='sweep'?4:5),7);qb.hasBall=1;P.push(qb);
 const rb=mk(0,'RB',cx+(p.t==='sweep'?-2:0),L-7.5,22);P.push(rb);
 const OLN=[72,65,60,66,77];for(let i=-2;i<=2;i++){const ol=mk(0,'OL',cx+i*1.45,L-0.75,OLN[i+2]);ol._slot=i;P.push(ol)}
 const wxs=[cx-9.5,cx+9.5,cx-5.5];
 p.r.forEach((r,i)=>{const w=mk(0,'WR',wxs[i],L-1,[11,84,3][i]);w.route=r[0];w.dir=r[1]*(i===1?-1:1)*(wxs[i]<cx?1:-1);w.rt=0;if(i===2)w.pos='TE';P.push(w)});
 const DLN=[94,97,92,99];[-3.6,-0.75,2.0,3.6].forEach((o,k)=>P.push(mk(1,'DL',cx+o,L+1.25,DLN[k])));
 P.push(mk(1,'LB',cx-5,L+6,50));P.push(mk(1,'LB',cx+5,L+6,54));
 const wr=P.filter(q=>q.role==='WR');wr.forEach((w,i)=>{const d=mk(1,'CB',w.x+(w.x<cx?-1:1)*(0.6+G.diff*0.2),L+6.5,20+i);d.man=w;P.push(d)});
 {const late=G.q>=4&&G.clock<120||G.q===2&&G.clock<120,lead=G.sa>G.sh;let pb=G.togo<=2||L>=95?0.55:(G.down>=3&&G.togo>=7)?0.15:(late&&lead)?0.08:0.3;pb+=G.diff*0.04;const lbs=P.filter(q=>q.role==='LB');let n=0;lbs.forEach(l=>{l.blitz=false;l.spy=false;if(Math.random()<pb&&(n===0||Math.random()<0.25)){l.blitz=true;n++}});const sit=lbs.filter(l=>!l.blitz);if(sit.length&&Math.random()<(G.down>=3?0.5:0.25))sit[0].spy=true;G.blitzN=n}
 P.push(mk(1,'S',cx-9,L+13,31));P.push(mk(1,'S',cx+9,L+13,33));
 {const ols=P.filter(q=>q.role==='OL'),used=new Set();P.filter(q=>q.role==='DL').forEach(d=>{let b=null,bd=1e9;ols.forEach(o=>{if(used.has(o))return;const dd=Math.abs(o.x-d.x);if(dd<bd){bd=dd;b=o}});used.add(b);d.blk=b;b.blk=d;d.shedT=(p.t==='pass'?rnd(2.4,3.6):rnd(0.9,1.8))*DIFFS[G.diff].shed})}
 G.celeb=false;G.loose=null;lockNums(P);G.players=P;G.qb=qb;G.rb=rb;G.carrier=qb;G.ball=null;G.snapT=0;G.cam=L;G.juke=0;G.jcd=0;G.thrown=false;G.passer=true;
 G.st='presnap';G.handed=false;G.audOpen=false;G.pend=null;buildRoutesG();G.routeVer=(G.routeVer||0)+1;G.ovT=1.0;G.ko=false;hint('snap','ROUTES SHOWN FROM ABOVE|TAP SNAP TO START|AUDIBLE TO CHANGE IT UP');;
}
function buildRoutesG(){G.routes=G.players.filter(q=>q.role==='WR').map((w,i)=>w.route==='block'?null:Object.assign(simRoute(w),{i})).filter(Boolean);if(G.play&&G.play.t==='pass'&&G.rb&&G.qb){const r=G.rb,q=G.qb,pts=[];const P0=[[r.x,r.y],[q.x+1.4,q.y-0.6],[q.x+1.8,G.los+1],[q.x+2.4,G.los+5]];for(let s=0;s<3;s++)for(let k=0;k<6;k++){const u=k/6,A=P0[s],B=P0[s+1];pts.push([A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u])}pts.push(P0[3]);G.routes.push({w:r,pts,i:3})}G.routeVer=(G.routeVer||0)+1}
function setDepth(i,lv){const deep=lv===0;const w=G.players.filter(q=>q.role==='WR')[i];if(!w||G.aud<=0)return;
 if(deep){w.route={flat:'corner',drag:'post',block:'go',curl:'go',slant:'post',out:'corner'}[w.route]||w.route;w.dk=1.7}
 else if(lv===1){w.route={go:'curl',post:'curl',corner:'out',block:'curl',flat:'out',drag:'slant'}[w.route]||w.route;w.dk=1.15}
 else{w.route={go:'slant',post:'slant',corner:'out',block:'flat',curl:'drag',out:'flat'}[w.route]||w.route;w.dk=0.7}
 G.aud--;buildRoutesG();G.ovT=0.8;say(['DEEP','MEDIUM','SHORT'][lv]+' - WR'+(i+1),1)}
function simRoute(w){const c={x:w.x,y:w.y,vx:0,vy:0,rt:0,route:w.route,dir:w.dir,dk:w.dk};const pts=[[c.x,c.y]];for(let i=0;i<78;i++){c.rt+=1/30;const r=routeTarget(c,c.rt);steer(c,r.x,r.y,7.2,1/30);c.x=cl(c.x+c.vx/30,FIELDW/2-13,FIELDW/2+13);c.y+=c.vy/30;if(i%3==2)pts.push([c.x,c.y])}return{w,pts}}
function scr(x,y,h=1){return window.PROJ?window.PROJ(x,y,h):[sx(x),sy(y)]}
const RX0=FIELDW/2-12.5,RX1=FIELDW/2+12.5;
function routeTarget(w,t){const r=routeTarget1(w,t);r.x=cl(r.x,RX0,RX1);return r}
function routeTarget1(w,t){const r=routeTarget0(w,t);const goal=G.los>=78&&['go','post','corner'].includes(w.route);
 if(goal&&w.y>101)return{x:cl(w.x+(w.x<FIELDW/2?-0.8:0.8),3,FIELDW-3),y:Math.min(w.y+0.6,106)};
 if(r.y>106||w.y>105.5)return{x:cl(w.x+Math.sin(t*1.6)*0.6,3,FIELDW-3),y:Math.min(r.y,105.8)};
 r.x=cl(r.x,FIELDW/2-12.5,FIELDW/2+12.5);return r}
const RTS={ // [dx(+ = toward middle), dy, plant] in yards from the snap spot; depth scaled by dk
 slant:{p:[[0,3,1],[7,9,0]],ext:1},
 out:{p:[[0,8,1],[-7,7.4,0]],ext:0},
 flat:{p:[[-2.5,1.5,0],[-6,2.5,0]],ext:0,flat:1},
 go:{p:[[-1.2,5,0],[-1.5,20,0]],ext:0,deep:1},
 post:{p:[[0,11,1],[5.5,18,0]],ext:0,deep:1},
 curl:{p:[[0,11,1],[1.5,8.8,0]],ext:0,sit:1},
 drag:{p:[[1,1.8,0],[12,4,0]],ext:1,flat:1},
 corner:{p:[[0,10,1],[-4,15.5,0]],ext:0,deep:1},
 block:{p:[[0,1.5,0]],ext:0,flat:1}};
const RDEEP=21;
function buildWP(w){const R=RTS[w.route]||RTS.block,ic=w.x<FIELDW/2?1:-1,s=R.flat?1:cl((w.dk||1.2)/1.2,0.6,1.25);
 w.wp=R.p.map(([dx,dy,pl])=>({x:cl(w.x+dx*ic*(R.flat?1:Math.min(1,s+0.15)),RX0,RX1),y:Math.min(w.y+dy*s,106,G.los+RDEEP),pl}));w.wi=0;w.wpK=w.route+'|'+w.dk+'|'+G.los+'|'+Math.round(w.x*10);w.brk=0}
function routeTarget0(w,t){if(!w.wp||w.wpK!==w.route+'|'+w.dk+'|'+G.los+'|'+Math.round((w.wpX??w.x)*10)){w.wpX=w.x;buildWP(w)}const R=RTS[w.route]||RTS.block;
 if(w.brk>0)w.brk-=1/60;
 while(w.wi<w.wp.length){const q=w.wp[w.wi];const d=Math.hypot(q.x-w.x,q.y-w.y);if(d<(q.pl?0.6:1.1)){if(q.pl)w.brk=0.35;w.wi++}else break}
 if(w.wi<w.wp.length){const q=w.wp[w.wi];const d=Math.hypot(q.x-w.x,q.y-w.y);return{x:q.x,y:q.y,k:q.pl&&d<2.4?0.68+0.32*(d/2.4):1,sh:w.brk>0?40:q.pl?16:9}}
 const L=w.wp[w.wp.length-1],P=w.wp.length>1?w.wp[w.wp.length-2]:{x:w.wpX,y:L.y-1};
 if(R.ext){const dx=L.x-P.x,dy=L.y-P.y,l=Math.hypot(dx,dy)||1;return{x:w.x+dx/l*4,y:Math.min(w.y+dy/l*4,106),k:1,sh:w.brk>0?30:9}}
 // settle: sit in the soft spot, drift away from the nearest defender
 let nd=null,bd=6;for(const q of G.players||[])if(q.team===1){const d=Math.hypot(q.x-w.x,q.y-w.y);if(d<bd){bd=d;nd=q}}
 const off=nd?cl((w.x-nd.x)*0.6,-2,2):0;return{x:cl(L.x+off,RX0,RX1),y:L.y,k:0.45,sh:w.brk>0?30:10}}
function steer(p,tx,ty,sp,dt,sh){let dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);const A=(sh||8)*2.7;let wx=0,wy=0;
 if(d>0.05){const v=Math.hypot(p.vx,p.vy);let s=sp;if(v>2){const c=(p.vx*dx+p.vy*dy)/(v*d);s*=1-0.22*(1-c)/2}wx=dx/d*s;wy=dy/d*s}
 let ex=wx-p.vx,ey=wy-p.vy;const e=Math.hypot(ex,ey),m=A*dt;if(e>m){ex*=m/e;ey*=m/e}p.vx+=ex;p.vy+=ey}
// Play-scale billboard is 2.1yd / 24px (2.8*0.75); linemen draw 1.18x.
// Body halves ~0.44 skill + ~0.67 line. 1.48 leaves daylight between sprites
// instead of the 1.16 tunnel that read as a stuck shoulder.
const OL_GAP=1.48;
function scrambling(){const c=G.carrier;if(!c||c.team||G.thrown||G.pend)return false;
 if(c===G.qb)return !!(G.tuck||G.qbRun||Math.abs(c.vx)>0.85||c.vy>0.85||Math.abs(G._ix||0)>0.22||Math.abs(G._iy||0)>0.22);
 return c.vy>0.45||(G._iy||0)<-0.25}
function inLane(ol,car){const dx=ol.x-car.x,dy=ol.y-car.y;return dy>-0.45&&dy<3.2&&Math.abs(dx)<2.4&&Math.hypot(dx,dy)<3.8}
function flankSign(w,ref){if(!ref)return Math.sign(w._slot||1)||1;const s=Math.sign(w.x-ref.x);if(s)return s;if(w._slot)return Math.sign(w._slot);return 1}
// Held stick picks the lane. Residual vx must not override it — that flip
// dragged blockers back across the ball and froze the lateral cut.
function driveDir(car){const ix=G._ix||0;if(Math.abs(ix)>0.22)return Math.sign(ix);const v=car.vx||0;if(Math.abs(v)>1.1)return Math.sign(v);return 0}
function peelSide(car,line){const dx=line.x-car.x;
 if(Math.abs(dx)>0.62){line._peel=Math.sign(dx);return line._peel}
 const dir=driveDir(car);
 if(dir){line._peel=-dir;return line._peel}
 if(line._peel)return line._peel;
 line._peel=line._slot?Math.sign(line._slot):(dx?Math.sign(dx):1);return line._peel}
function washRusher(ol,side){const d=ol.blk;if(!d||d.team!==1||d.shed||d.fallen>0)return;
 d.x+=side*0.22;d.vx+=side*3.2;if(d.vy>1.5)d.vy=1.5}
// Own OL never write the carrier. A blocker already off to one side stays
// there. Overlap slides him out over a few frames — no teleport, no reverse.
function ownGap(){const car=G.carrier;if(!car||car.team)return;
 if(scrambling()){
  const placed=[];
  for(const line of G.players){if(line.team||line.role!=='OL'||line.fallen>0)continue;
   const dx=line.x-car.x,dy=line.y-car.y,ad=Math.hypot(dx,dy);
   const near=ad<OL_GAP+0.2||(dy>-0.4&&dy<2.5&&Math.abs(dx)<1.85);
   if(!near){if(ad>OL_GAP+1.6)line._peel=0;continue}
   let side=peelSide(car,line);
   let goal=car.x+side*(OL_GAP+0.28);
   for(const q of placed)if(Math.abs(q-goal)<0.95)goal+=side*0.95;
   if(goal<0.8||goal>FIELDW-0.8){side=-side;line._peel=side;goal=car.x+side*(OL_GAP+0.28)}
   const maxStep=ad<OL_GAP?0.4:0.18;
   let step=goal-line.x;if(Math.abs(step)>maxStep)step=Math.sign(step)*maxStep;
   const nx0=line.x-car.x;
   if(nx0*side<0&&Math.abs(nx0)<OL_GAP&&Math.abs(step)>Math.abs(nx0)+0.05)step=side*Math.min(maxStep,Math.abs(nx0)+0.06);
   line.x=cl(line.x+step,0.55,FIELDW-0.55);
   if(dy<0.02)line.y=Math.min(car.y+0.22,line.y+0.14);
   const rx=line.x-car.x,ry=line.y-car.y,rd=Math.hypot(rx,ry)||1;
   const rel=((line.vx-car.vx)*rx+(line.vy-car.vy)*ry)/rd;
   if(rel<0){line.vx-=rel*rx/rd;line.vy-=rel*ry/rd}
   line.vx+=(side*2.2-line.vx)*0.28;
   washRusher(line,side);placed.push(line.x)}
  return}
 for(const line of G.players){if(line.team||line.role!=='OL'||line.fallen>0)continue;
  const dx=line.x-car.x,dy=line.y-car.y,ad=Math.hypot(dx,dy);if(ad>=OL_GAP)continue;
  let ax=dx,ay=dy;if(ad<0.02){ax=0;ay=1}const nd=Math.hypot(ax,ay)||1,nx=ax/nd,ny=ay/nd,pen=OL_GAP-ad;
  line.x+=nx*pen;line.y+=ny*pen;
  const rel=(line.vx-car.vx)*nx+(line.vy-car.vy)*ny;
  if(rel<0){line.vx-=rel*nx;line.vy-=rel*ny}}}
// Contact may clip a frame of speed. A stick that is still held gets that
// speed back, and only while an own lineman is actually in the way.
function preserveStick(car){if(!car||car.team||car.fallen>0||car.slide>0||car.dive>0||G.pend)return;
 const ix=G._ix||0,iy=-(G._iy||0),m=Math.hypot(ix,iy);if(m<0.2)return;
 let hit=false;for(const line of G.players){if(line.team||line.role!=='OL'||line.fallen>0)continue;if(Math.hypot(line.x-car.x,line.y-car.y)<OL_GAP+0.35){hit=true;break}}
 if(!hit)return;
 const ux=ix/m,uy=iy/m,along=car.vx*ux+car.vy*uy;
 const burst=car.role==='QB'&&!G.thrown&&!!G.tuck,pocket=car.role==='QB'&&passerPhase()&&!G.tuck&&!G.thrown;
 const floor=(pocket?4.4:burst?10.8:8.2)*Math.min(1,m)*0.72;
 if(along<floor){const add=floor-along;car.vx+=ux*add;car.vy+=uy*add}}
function passLive(){return !!(G.play&&G.play.t==='pass'&&G.thrown&&(G.pend||(G.ball&&!G.ball.caught)))}
function qbIgnored(){return passLive()&&G.carrier===G.qb}
// ---------- live update ----------
function endPlay(kind,y){
 if(G.st!=='live')return;
 if(G.play&&G.play.t==='pass'&&G.thrown&&(G.pend||(G.ball&&!G.ball.caught))&&kind!=='inc'&&kind!=='int')return;
 if(kind==='inc')makeLoose();if(kind==='inc'&&G.play.t==='ko')G.ko=false;G.aim=null;G.pend=null;G.read=0;G._rk=null;
 if(G.play.t==='ko'&&kind==='inc'){G.st='result';G.resT=1.9;G.ko=false;const y2=cl(Math.round((G.loose?G.loose.y:G.ball?G.ball.y:G.carrier.y)||25),1,99);G.los=y2;G.down=1;G.togo=10;G.next='down';G.rbd={t:4,n:'DROP',s:'BALL ON THE '+y2,c:'#8a93b8'};banner('DROPPED KICK','BALL ON THE '+y2);return}
 if(G.play.t==='ko'&&kind!=='td'&&(y??G.carrier.y)<0){touchback();return}
 if(G.play.t==='ko'&&kind!=='td'){G.st='result';G.resT=1.6;G.ko=false;const y2=cl(Math.round(y??G.carrier.y),1,99);G.rbd={t:4,n:'KR',s:'RETURN TO THE '+(y2<=50?'OWN '+y2:'OPP '+(100-y2)),c:'#4fa3ff'};G.los=y2;G.down=1;G.togo=10;G.next='down';banner('RETURN TO THE '+(y2<=50?y2:100-y2),y2<=50?'OWN TERRITORY':'OPPONENT TERRITORY');return}G.st='result';G.resT=kind==='inc'?2.05:1.55;const gain=Math.round((y??G.carrier.y)-G.los);let m='';
 if(kind==='td'){G.celeb=true;G.sh+=6;G.stats.td++;m='TOUCHDOWN!';G.shake=0.6;burst(G.carrier.x,G.carrier.y);G.next='pat'}
 else if(kind==='int'){G.stats.int++;m='INTERCEPTED!';G.next='drive'}
 else if(kind==='inc'){m='INCOMPLETE';G.down++;G.next='down'}
 else{ if(kind==='sack'){G.stats.sack++;m='SACKED! '+gain+' YDS'}else m=(gain>=0?'+':'')+gain+' YARDS';
  if(G.passer===false||kind==='tackle'){ if(G.play.t==='pass'&&G.thrown)G.stats.py+=Math.max(gain,0);else G.stats.ry+=gain}
  G.los=cl(G.los+gain,1,99);G.togo-=gain;if(G.togo<=0){G.down=1;G.togo=Math.min(10,100-G.los);m+='  FIRST DOWN'}else G.down++;G.next='down'}
 if(G.next==='down'&&G.down>4){m+='  TURNOVER ON DOWNS';G.next='drive'}
 if(kind!=='inc'&&kind!=='td'&&kind!=='int')G.clock=Math.max(0,G.clock-12);
 if(G.two){G.two=false;G.next='kickoff';if(kind==='td'){G.sh-=4;G.stats.td--;m='2-PT GOOD!'}else m='2-PT NO GOOD'}
 const gn=typeof gain==='number'?gain:0;G.rbd={t:4,n:kind==='td'?'TD':kind==='int'?'INT':kind==='inc'?'INC':kind==='sack'?String(gn):(gn>0?'+':'')+gn,s:kind==='td'?'TOUCHDOWN':kind==='int'?'INTERCEPTED':kind==='inc'?'INCOMPLETE PASS':kind==='sack'?'SACK':gn>0?'GAIN OF '+gn+' YARD'+(gn===1?'':'S'):gn<0?'LOSS OF '+(-gn)+' YARD'+(gn===-1?'':'S'):'NO GAIN',c:kind==='sack'||kind==='int'||gn<0&&kind!=='inc'?'#e8344e':kind==='inc'?'#8a93b8':'#2fd35f'};G.log.unshift(m);const mm=m.split('  ');banner(mm[0],mm.slice(1).join(' '));
 const word=kind==='td'?'TOUCHDOWN!':kind==='int'?'INTERCEPTED!':kind==='inc'?'INCOMPLETE':kind==='sack'?'SACKED!':null;
 if(word){const px=G.carrier?G.carrier.x:(G.loose?G.loose.x:FIELDW/2),py=G.carrier?G.carrier.y:(G.loose?G.loose.y:G.los);G.pop={x:px,y:py,t:0,s:word,life:1.7}}
 const hold=kind==='inc'||kind==='int'||kind==='td'||kind==='sack'||!!(G.thrown&&G.play&&G.play.t==='pass');
 if(hold){G.read=1.25;G._rk=kind;G._rg=gn}else maybeReplay(kind,gn);
}
function makeLoose(){const b=G.ball;if(!b||b.caught)return;const k=Math.min(1,b.t/b.T);const h=(b.h0||1.6)*(1-k)+1.6*k+b.z*0.9;let dx=b.tx-b.x0,dy=b.ty-b.y0;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const v=b.tt==='bullet'?9:b.tt==='bomb'?6:7;
 G.loose={x:b.x,y:b.y,z:h,vx:dx*v+rnd(-1,1),vy:dy*v,vz:-1.5,t:0,rx:0,ry:Math.atan2(-dx,dy),rz:0,wx:rnd(10,18)*(Math.random()<.5?-1:1),n:0,_px:b.x,_py:b.y};G.ball=null;
 let w=null,bd=4;for(const q of G.players)if(q.team===0&&q!==G.qb&&!(q.fallen>0)){const dd=Math.hypot(q.x-G.loose.x,q.y-G.loose.y);if(dd<bd){bd=dd;w=q}}if(w){w.react=0.75;w.reach=0}}
function looseStep(dt){const L=G.loose;L.t+=dt;L._px=L.x;L._py=L.y;if(L.t>2.6)return;L.vz-=32*dt;L.x+=L.vx*dt;L.y+=L.vy*dt;L.z+=L.vz*dt;L.rx+=L.wx*dt;
 if(L.z<=0.18){L.z=0.18;if(L.vz<-1.2){L.vz=-L.vz*0.42;L.vx*=0.62;L.vy*=0.62;L.wx=-L.wx*0.7+rnd(-4,4);if(L.n<4)dust(L.x,L.y,L.n?5:10);L.n++}else{L.vz=0;const f=Math.max(0,1-dt*2.6);L.vx*=f;L.vy*=f;L.wx*=f}}
 L.x=cl(L.x,0.3,FIELDW-0.3);L.y=cl(L.y,-9.5,109.5)}
function dust(x,y,n){for(let i=0;i<n;i++)G.parts.push({x:x+rnd(-.5,.5),y:y+rnd(-.5,.5),vx:rnd(-3,3),vy:rnd(-3,3),l:rnd(.3,.7),c:['#e6d8b0','#c9b98f','#fff4d6'][i%3],dust:1})}
function ring(x,y,c,s){(G.rings=G.rings||[]).push({x,y,t:0,c:c||'#fff',s:(s||1)*0.55})}
function burst(x,y){for(let i=0;i<16;i++)G.parts.push({x,y,vx:rnd(-5,5),vy:rnd(-5,5),l:rnd(.25,.7),c:['#ff4fa3','#ffe14f','#3fd0ff'][i%3]})}
function finish(){clearMid(midCareer());if(G.sh>G.sa){const o=LS.get(),k='d'+G.diff;o[k]=Math.max(o[k]||1,Math.min(MAXLVL,G.lvl+1));LS.set(o);G.unlockMsg=G.lvl<MAXLVL?'LEVEL '+(G.lvl+1)+' UNLOCKED':'LADDER CLEARED'}else G.unlockMsg='WIN TO UNLOCK THE NEXT LEVEL'}
function autoPick(change){const L=G.los,dn=G.down,tg=G.togo;let w=[1,1,1,0,0,0];
 if(tg<=2){w=[2,.4,1.6,0,0,0]}else if(tg>=8||dn>=3){w=[1.6,2.2,1.8,0,0,0]}else w=[1.6,1,1.5,0,0,0];
 if(L>=88){w[1]*=.4;w[0]*=1.6;w[2]*=1.4}
 const cur=G.play?PLAYS.indexOf(G.play):-1;if(cur>=0)w[cur]*=change?0:.35;
 let s=w.reduce((a,b)=>a+b),r=Math.random()*s,i=0;for(;i<2;i++){r-=w[i];if(r<=0)break}setupPlay(PLAYS[i])}
function maybeReplay(kind,gain){
 if(G.play&&G.play.t==='ko'&&kind!=='td'){if(G._rec)G._rec.length=0;return}
 const sub=(G.banner&&(G.banner.t+' '+(G.banner.sub||'')))||'';
 const first=/FIRST DOWN/.test(sub),turn=/TURNOVER|INTERCEPT/.test(sub)||kind==='int';
 const big=kind==='td'||turn||first||(kind!=='inc'&&kind!=='sack'&&gain>=8)||kind==='sack';
 const frames=G._rec||[];
 if(!big||frames.length<12){frames.length=0;return}
 const secs=frames.length/60;
 G.shake=0;
 // ~0.40x. Long enough to watch, capped so a long return still ends.
 G.replay={frames:frames.slice(),t:0,dur:Math.max(5.2,Math.min(26,secs/0.4))};
 frames.length=0;G.st='replay';
}
function lerp(a,b,k){return a+(b-a)*k}
function applyReplay(A,B,k){
 const P=G.players;if(!P||!A||!B)return;const n=Math.min(P.length,A.pl.length,B.pl.length);
 for(let i=0;i<n;i++){const a=A.pl[i],b=B.pl[i],p=P[i];
  p.x=lerp(a.x,b.x,k);p.y=lerp(a.y,b.y,k);p.vx=lerp(a.vx,b.vx,k);p.vy=lerp(a.vy,b.vy,k);
  p.dive=lerp(a.dive,b.dive,k);p.slide=lerp(a.slide,b.slide,k);p.fallen=lerp(a.fallen,b.fallen,k);p.anim=lerp(a.anim,b.anim,k);
  p._cdive=(k<0.5?a.cd:b.cd)?1:0;p._fly=(k<0.5?a.fly:b.fly)?1:0;
  p.catchT=lerp(a.catchT||0,b.catchT||0,k);p.reach=lerp(a.reach||0,b.reach||0,k);
  p.throwT=lerp(a.throwT||0,b.throwT||0,k);p.throwDur=lerp(a.throwDur||0.3,b.throwDur||0.3,k);
  if((a.tdx||b.tdx||a.tdy||b.tdy))p.throwDir={x:lerp(a.tdx||0,b.tdx||0,k),y:lerp(a.tdy||0,b.tdy||0,k)};
  p.eng=!!(k<0.5?a.eng:b.eng);p.stun=lerp(a.stun||0,b.stun||0,k);p.stiffT=lerp(a.stiff||0,b.stiff||0,k);
  p.tackler=!!(k<0.5?a.tack:b.tack)}
 const ci=k<0.5?A.ci:B.ci;if(P[ci])G.carrier=P[ci];
 const ba=A.b,bb=B.b;
 if(ba&&bb){G.ball=G.ball||{};G.ball.caught=false;
  G.ball.x=lerp(ba.x,bb.x,k);G.ball.y=lerp(ba.y,bb.y,k);G.ball.z=lerp(ba.z,bb.z,k);
  G.ball.t=lerp(ba.t,bb.t,k);G.ball.T=bb.T||ba.T;G.ball.h=bb.h||ba.h;G.ball.h0=lerp(ba.h0,bb.h0,k);
  G.ball.x0=lerp(ba.x0,bb.x0,k);G.ball.y0=lerp(ba.y0,bb.y0,k);G.ball.tx=lerp(ba.tx,bb.tx,k);G.ball.ty=lerp(ba.ty,bb.ty,k);
  G.ball.tt=k<0.5?ba.tt:bb.tt;G.ball.spin=lerp(ba.spin||0,bb.spin||0,k);
  const ti=k<0.5?ba.ti:bb.ti;G.ball.tgt=ti>=0?P[ti]:null}
 else if(ba||bb){const s=k<0.55?ba:bb;if(!s){if(G.ball)G.ball.caught=true}
  else{G.ball=G.ball||{};Object.assign(G.ball,{caught:false,x:s.x,y:s.y,z:s.z,t:s.t,T:s.T,h:s.h,h0:s.h0,x0:s.x0,y0:s.y0,tx:s.tx,ty:s.ty,tt:s.tt,spin:s.spin||0});
   const who=P[k<0.5?A.ci:B.ci];if(who&&((ba&&!bb)||(!ba&&bb))){const u=ba&&!bb?k:(1-k);G.ball.x=lerp(s.x,who.x,u*0.85);G.ball.y=lerp(s.y,who.y,u*0.85);G.ball.z=lerp(s.z,1.1,u*0.85)}
   G.ball.tgt=s.ti>=0?P[s.ti]:null;G.ball.caught=false}}
 else if(G.ball)G.ball.caught=true;
 if(A.loose&&B.loose){const L=G.loose||(G.loose={});L.x=lerp(A.loose.x,B.loose.x,k);L.y=lerp(A.loose.y,B.loose.y,k);L.z=lerp(A.loose.z,B.loose.z,k);L.vx=lerp(A.loose.vx,B.loose.vx,k);L.vy=lerp(A.loose.vy,B.loose.vy,k);L.vz=lerp(A.loose.vz,B.loose.vz,k);L.rx=lerp(A.loose.rx,B.loose.rx,k);L.ry=lerp(A.loose.ry,B.loose.ry,k);L.wx=lerp(A.loose.wx,B.loose.wx,k)}
 else if(A.loose||B.loose){G.loose=Object.assign(G.loose||{},(k<0.5?A.loose:B.loose)||A.loose||B.loose)}else G.loose=null;
 G.cam=lerp(A.cam,B.cam,k);G.snapT=lerp(A.snapT||0,B.snapT||0,k);
 G.thrown=!!(k<0.5?A.thrown:B.thrown);G.tuck=!!(k<0.5?A.tuck:B.tuck);G.qbRun=!!(k<0.5?A.qbRun:B.qbRun);
 G.juke=lerp(A.juke||0,B.juke||0,k);G.dcatch=!!(k<0.5?A.dc:B.dc);
 if(A.passer!=null||B.passer!=null)G.passer=!!(k<0.5?A.passer:B.passer);
 const ho=k<0.5?A.hoT:B.hoT;G.hoT=ho==null?undefined:ho}
function finishReplay(){const R=G.replay;if(R&&R.frames&&R.frames.length){const f=R.frames[R.frames.length-1];applyReplay(f,f,0)}G.replay=null;G.st='result';G.resT=Math.max(1.25,G.resT||0);if(G.banner)G.banner.a=Math.min(G.banner.a||0,1.4)}
function skipReplayGeom(){const w=236,h=52;return{x:Math.round(W/2-w/2),y:H-84-safeBottom(),w,h}}
function pointingSkip(t){if(!t)return false;const g=skipReplayGeom();return t[0]>=g.x-10&&t[0]<=g.x+g.w+10&&t[1]>=g.y-12&&t[1]<=g.y+g.h+14}
function replayStep(dt){
 const R=G.replay;if(!R){G.st='result';return}
 const taps=IN.taps.splice(0),keys=IN.keyp.splice(0);
 if(taps.some(pointingSkip)||keys.includes('Escape')||keys.includes(' ')){finishReplay();return}
 R.t+=dt;G.t+=dt;if(G.shake>0)G.shake=0;
 const fr=R.frames;if(!fr.length){finishReplay();return}
 const u=Math.min(1,R.t/Math.max(0.2,R.dur));
 const fpos=u*(fr.length-1);
 const i=Math.max(0,Math.min(fr.length-2,Math.floor(fpos))),k=fr.length<2?0:Math.min(1,fpos-i);
 applyReplay(fr[i],fr[Math.min(fr.length-1,i+1)],k);
 if(R.t>=R.dur+0.4)finishReplay()}
function packBall(){const b=G.ball;if(!b||b.caught)return null;let ti=-1;if(b.tgt&&G.players)ti=G.players.indexOf(b.tgt);return{x:b.x,y:b.y,z:b.z||0,t:b.t||0,T:b.T||1,h:b.h||1,h0:b.h0||1.6,x0:b.x0,y0:b.y0,tx:b.tx,ty:b.ty,tt:b.tt||'lob',spin:b.spin||0,ti}}
function recFrame(){
 if(G.st!=='live'||!G.players||(G.play&&G.play.t==='fg'))return;
 const buf=G._rec||(G._rec=[]);
 const pl=G.players.map(p=>({x:p.x,y:p.y,vx:p.vx||0,vy:p.vy||0,dive:p.dive||0,slide:p.slide||0,fallen:p.fallen||0,anim:p.anim||0,cd:p._cdive||0,fly:p._fly||0,catchT:p.catchT||0,reach:p.reach||0,throwT:p.throwT||0,throwDur:p.throwDur||0,tdx:p.throwDir?p.throwDir.x:0,tdy:p.throwDir?p.throwDir.y:0,eng:p.eng?1:0,stun:p.stun||0,stiff:p.stiffT||0,tack:p.tackler?1:0}));
 const L=G.loose;
 buf.push({pl,b:packBall(),loose:L?{x:L.x,y:L.y,z:L.z,vx:L.vx,vy:L.vy,vz:L.vz,rx:L.rx||0,ry:L.ry||0,wx:L.wx||0}:null,ci:Math.max(0,G.players.indexOf(G.carrier)),cam:G.cam||0,snapT:G.snapT||0,thrown:G.thrown?1:0,hoT:G.hoT,juke:G.juke||0,tuck:G.tuck?1:0,qbRun:G.qbRun?1:0,passer:G.passer?1:0,dc:G.dcatch?1:0});
 if(buf.length>840)buf.shift()}
function nextAfter(){G.fgDone=false;
 if(G.next==='kickoff'||(G.next==='drive'&&G.fg&&G.fg.res&&G.fg.res.good)){G.fg=null;G.fgBall=null;G.next='down';
  if(G.clock<=0){if(G.q>=4){G.st='final';finish();return}G.q++;G.clock=QLEN;G.log.unshift('END OF QUARTER '+(G.q-1))}
  startKickoff();return}
 if(G.next==='pat'){G.st='patpick';G.celeb=false;return}
 if(G.next==='drive'){ G.drive++;
  // CPU possession sim
  const D=DIFFS[G.diff],bonus=lvlStr(G.lvl),r=Math.random(),pts=r<D.td+bonus?7:r<D.td+bonus+D.fg?3:0;G.sa+=pts;
  const ab=TEAMS[G.away].a;G.oppMsg=pts===7?ab+' SCORED A TD':pts===3?ab+' KICKED A FG':ab+' PUNTED';G.log.unshift(G.oppMsg);
  G.clock-=rnd(D.clk[0],D.clk[1])*(1-bonus);G.oppT=2.4;G.afterOpp=true;
  G.los=25;G.down=1;G.togo=10;if(G.clock<=0&&G.q>=4){G.st='final';finish();return}if(G.clock<=0){G.q++;G.clock=QLEN;if(G.q===3){startKickoff();banner(G.oppMsg,'HALFTIME KICKOFF');return}}autoPick();banner(G.oppMsg,'YOUR BALL  '+TEAMS[G.home].a+' '+G.sh+' - '+G.sa+' '+TEAMS[G.away].a);return}
 if(G.clock<=0){if(G.q>=4){G.st='final';finish();return}G.q++;G.clock=QLEN;G.log.unshift('END OF QUARTER '+(G.q-1));if(G.q===3){startKickoff();return}}
 autoPick();
}
function snap(){G.cdive=false;G.cslide=false;G.cdown=false;G.tuck=false;G.truckT=0;G.bullet=G.bulletPref;G.st='live';G.snapT=0;G.hoT=undefined;G.rbd=null;G.stam=1;G.qbRun=false;G.aim=null;G.runHinted=false;G.msg='';G.msgT=0;G._rec=[];G._recN=0;G.replay=null;if(G.play.t==='pass')G.dropY=G.qb.y-(G.diff<2?3.5:3);hint(G.adv?'passadv':'pass3',G.adv?'LEFT THUMB: MOVE THE QB|RIGHT THUMB: PULL BACK TO AIM|RELEASE TO THROW':'RIGHT SIDE: DRAG BACK TO AIM, RELEASE TO THROW|LEFT STICK: MOVE THE QB|SHORT DRAG BULLET, LONG DRAG LOB  TUCK: RUN|TAP HANDOFF ON THE RB');recFrame()}
function startKickoff(){const cx=FIELDW/2,P=[];const ret=mk(0,'RB',cx+rnd(-6,6),4,22);P.push(ret);
 for(let i=0;i<7;i++)P.push(mk(0,'OL',cx-15+i*5,22+(i%2)*4,[72,65,60,66,77,51,58][i]));
 for(let i=0;i<10;i++){const d=mk(1,'LB',3+i*5.2,62,40+i);d.lane=d.x;P.push(d)}{const k=mk(1,'S',cx,68,9);k.kicker=true;P.push(k)}
 G.pend=null;G.play={n:'KICKOFF',t:'ko',r:[]};lockNums(P);G.players=P;G.qb=ret;G.rb=ret;G.carrier=ret;G.thrown=true;G.passer=false;G.handed=true;G.snapT=0;G.juke=0;G.jcd=0;G.stam=1;G.ko=true;G.celeb=false;G.runHinted=false;G.routes=[];G.routeVer=(G.routeVer||0)+1;
 G.los=25;G.down=1;G.togo=10;G.cam=30;const kx=cl(cx+rnd(-8,8),8,FIELDW-8),ky=rnd(KO.dMin,KO.dMax);ret.x=kx;ret.y=ky;ret.vx=0;ret.vy=0;G.ball={x0:cx,y0:65,x:cx,y:65,tx:kx,ty:ky,t:0,T:rnd(KO.tMin,KO.tMax),h:rnd(17,22),tt:'lob',fz:2,tgt:ret,caught:false,z:0};G.st='live';banner('KICKOFF',TEAMS[G.away].a+' KICKS TO '+TEAMS[G.home].a);
 hint('ko','CATCH IT AND RETURN IT|OR TAP TOUCHBACK FOR THE 25')}
function update(dt){
 if(G.st==='replay'){replayStep(dt);return}
 G.t+=dt;if(G.hoT!==undefined)G.hoT+=dt;if(G.qb){if(G.aim)G.qb._cockT=0.15;else if(G.qb._cockT>0)G.qb._cockT-=dt}if(G.msgT>0)G.msgT-=dt;if(G.rbd&&(G.rbd.t-=dt)<=0)G.rbd=null;if(G.shake>0)G.shake-=dt;
 if(G.flash){G.flash.t+=dt;if(G.flash.t>0.45)G.flash=null}
 if(G.rings)G.rings=G.rings.filter(r=>(r.t+=dt)<0.35);if(G.fl)G.fl=G.fl.filter(f=>(f.l-=dt)>0);G.parts=G.parts.filter(p=>(p.l-=dt)>0);G.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt});if(G.loose)looseStep(dt);
 const taps=IN.taps.splice(0),keys=IN.keyp.splice(0);if(keys.includes(' '))taps.push(null);readSticks();if(G.hint){G.hint.t-=dt;if(G.hint.t<=0)G.hint=null}if(G.banner)G.banner.a+=dt;
 if(G.paused){const pg=pauseGeom();for(const t of taps){if(!t)continue;if(hitDiffRow(t,pg.diff.x,pg.diff.y,pg.diff.w,pg.diff.h))continue;if(hitBox(t,pg.resume))G.paused=false;else if(hitBox(t,pg.save))saveMid();else if(hitBox(t,pg.quit)){G.paused=false;Object.assign(G,{sh:0,sa:0,drive:0,q:1,clock:QLEN,aud:4,los:25,down:1,togo:10,log:[],stats:{py:0,ry:0,td:0,int:0,sack:0}});G.st='modesel'}}return}
 if(G.st!=='title'&&G.st!=='team'&&taps.some(t=>t&&t[0]<52&&t[1]<50)){G.paused=true;return}
 if(G.st==='title'){if(taps.length)G.st='team';return}
 if(G.st==='presnap'){if(G.ovT>0)G.ovT-=dt;if(keys.includes('u')&&!G.audOpen){G.audOpen=true}G.cam+=(G.los+4-G.cam)*Math.min(1,dt*10);for(const t of taps){if(G.audOpen&&t){if(t[1]<H-AP_H){G.audOpen=false;return}const b=audBtn(t[0],t[1]);if(!b)return;
   if(b.c===3){if(b.r===0){autoPick(true);G.audOpen=true;say('NEW PLAY: '+G.play.n,1.2)}else if(b.r===1)G.audOpen=false}else setDepth(b.c,b.r);return}
  if(t&&Math.hypot(t[0]-60,t[1]-(H-84-safeBottom()))<44){G.audOpen=true;return}
  if(!t||Math.hypot(t[0]-(W-64),t[1]-(H-84-safeBottom()))<48)return snap();}return}
 if(G.st==='team'){for(const t of taps){if(!t)continue;const[x,y]=t;
  if(y>740&&y<800){G.away=lvlOpp(G.lvl);startKickoff()}
  else if(y>=170&&y<450){const i=Math.floor((y-170)/70);if(i>=0&&i<4)G.home=i}
  else if(y>=490&&y<540){const i=Math.floor((x-16)/((W-32)/4));if(i>=0&&i<4){G.diff=i;G.lvl=Math.min(G.lvl,unlocked())}}
  else if(y>=590&&y<660){if(x<110)G.lvl=Math.max(1,G.lvl-1);else if(x>280)G.lvl=Math.min(unlocked(),G.lvl+1)}}
  G.away=lvlOpp(G.lvl);return}
 if(G.st==='oppcard'){G.oppT-=dt;if(G.oppT<=0||taps.length){if(G.clock<=0){if(G.q>=4){G.st='final';finish();return}G.q++;G.clock=QLEN;if(G.q===3){startKickoff();return}}G.st='drivecard';G.cardT=1.6}return}
 if(G.st==='drivecard'){G.cardT-=dt;if(G.cardT<=0||taps.length)autoPick();return}
 if(G.st==='select'){for(const t of taps){if(!t)continue;const i=Math.floor((t[1]-208)/100)*2+(t[0]>W/2?1:0);if(t[1]>208&&t[1]<508&&i>=0&&i<6)setupPlay(PLAYS[i])}return}
 if(G.st==='result'){if(G.read>0){G.read-=dt;return}if(G._rk!=null){const k=G._rk,g=G._rg;G._rk=null;G._rg=null;maybeReplay(k,g);if(G.st!=='result')return}G.resT-=dt;if(G.resT<=0)nextAfter();return}
 if(G.st==='final'){if(taps.length){Object.assign(G,{clock:QLEN,aud:4,sh:0,sa:0,drive:0,q:1,los:25,down:1,togo:10,log:[],stats:{py:0,ry:0,td:0,int:0,sack:0}});G.st='modesel'}return}
 if(G.st!=='live')return;
 G.snapT+=dt;G.clock=Math.max(0,G.clock-dt);recFrame();const c=G.carrier,P=G.players,p=G.play;
 // auto handoff
 if(!G.handed&&(p.t==='run'||p.t==='sweep')&&G.snapT>0.45){G.carrier=G.rb;G.handed=true;G.passer=false;say('HANDOFF!',0.8)}
 if(!G.handed&&p.t==='keep'){G.handed=true}
 // player control
 let jx=IN.jx,jy=IN.jy;if(KEYS.ArrowLeft)jx=-1;if(KEYS.ArrowRight)jx=1;if(KEYS.ArrowUp)jy=-1;if(KEYS.ArrowDown)jy=1;
 if(jx||jy){const m=Math.min(1,Math.hypot(jx,jy));if(m<0.14){jx=jy=0;G._sa=null}else{let a=Math.atan2(jy,jx);const step=Math.PI/4;if(G._sa!=null){let d=a-G._sa;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;if(Math.abs(d)<step*0.62)a=G._sa;else a=Math.round(a/step)*step}else a=Math.round(a/step)*step;while(a>Math.PI)a-=Math.PI*2;while(a<=-Math.PI)a+=Math.PI*2;G._sa=a;jx=Math.cos(a)*m;jy=Math.sin(a)*m}}else G._sa=null;
 G._ix=jx;G._iy=jy;
 const cur=G.carrier;if(G.slow>0){G.slow-=dt}
 if(cur===G.qb&&p.t==='pass'&&!G.thrown&&cur.y>G.los+0.5&&!G.qbRun){G.qbRun=true;say('QB RUN!',0.8)}
 if(IN.truckTap){IN.truckTap=0;if(cornerBtn()==='truck'&&!(cur.dive>0)&&!(cur.slide>0)&&!(cur.fallen>0)){G.truckT=1.05;cur.stiffT=0.75;cur.catchT=0;cur.reach=0;cur.vy=Math.max(10.6,Math.abs(cur.vy)+1.6);cur.vx*=0.5;say('TRUCK!',0.7);dust(cur.x,cur.y,12)}}
 const runner=(G.tuck||!passerPhase()||cornerBtn()==='slide'||cornerBtn()==='truck')&&!G.pend&&(!G.ball||G.ball.caught)&&!(cur.slide>0);let runMul=1;G.truck=false;
 if(G.truckT>0)G.truckT-=dt;
 const qbBurst=cur.role==='QB'&&!G.thrown&&!!G.tuck;
 if(runner){if(!G.runHinted){G.runHinted=true;hint('run','RIGHT STICK: RUN (FULL PUSH = SPRINT)|FLICK LEFT SIDE: JUKE|TRUCK LOWERS A SHOULDER')}
  const m=Math.hypot(jx,jy);const truckOk=runAct(cur)==='truck'&&G.stam>0.05&&(IN.truck||G.truckT>0);
  if(truckOk){G.truck=true;runMul=1.28;G.stam-=dt*0.45}else if(!qbBurst&&(IN.sprint||m>0.92)&&G.stam>0.02&&m>0.5){runMul=1.25;G.stam-=dt*0.28}else G.stam=Math.min(1,G.stam+dt*0.12);G.stam=Math.max(0,G.stam)}
 if(IN.flick&&runner){jukeIt(IN.flick)}IN.flick=0;
 if(IN.jk){IN.jk=0;if(runner)jukeIt(jx>0.2?1:jx<-0.2?-1:0)}
 if(IN.dv){IN.dv=0;if(runner&&!(cur.dive>0)&&!(cur.slide>0)&&!(cur.fallen>0)&&(G.play.t!=='ko'||(G.ball&&G.ball.caught))){cur.catchT=0;cur.reach=0;cur._fly=0;cur._cdive=1;cur._diveY0=cur.y;cur.dive=0.46;cur.vx=cur.vx*0.2+jx*2.2;cur.vy=Math.max(5.4,Math.min(7.2,Math.abs(cur.vy)*0.2+5.8));G.cdive=true;G.cdown=false;dust(cur.x,cur.y,8);say('DIVE!',0.55)}}
 if(IN.slide){IN.slide=0;if(cornerBtn()==='slide'&&!(cur.dive>0)&&!(cur.fallen>0)){cur.slide=0.9;cur.catchT=0;cur.reach=0;cur.stiffT=0;G.truckT=0;cur.vx*=0.12;cur.vy=Math.max(2.5,Math.min(4.4,Math.abs(cur.vy)*0.2+1.5));say('SLIDE!',0.9);dust(cur.x,cur.y,16)}}
 if(IN.tuck){IN.tuck=false;if(passerPhase()){G.tuck=!G.tuck;G.aim=null;G.relAim=false;G.lastAim=null;say(G.tuck?'TUCKED':'READY TO THROW',0.7)}}
 if(IN.hand){IN.hand=0;if(canHand())handoff()}
 if(IN.thr){const{w,ht}=IN.thr;IN.thr=null;if(passerPhase()&&!G.tuck){if(w===G.rb&&canHand())handoff();else throwTo(w,true,holdType(ht))}}
 G.aim=null;if(passerPhase()&&!G.tuck&&IN.aimP&&IN.aimP.moved>4){const a=IN.aimP,fw=cl((a.y-a.sy)*0.3,2,60),lat=-(a.x-a.sx)*0.24;let tx=cl(cur.x+lat,1,FIELDW-1),ty=cur.y+fw;let lock=null,ld=0;
  for(const w of P)if((w.role==='WR'||w.role==='RB')&&w!==cur){const d=Math.hypot(w.x-tx,w.y-ty);if(d<ld){ld=d;lock=w}}
  if(lock){const T=0.22+Math.hypot(lock.x-cur.x,lock.y-cur.y)/40;tx=cl(lock.x+lock.vx*T,1,FIELDW-1);ty=lock.y+lock.vy*T}
  {const S=G.aimS;if(S&&G.aimSid===a.t0){tx=S.x+(tx-S.x)*0.4;ty=S.y+(ty-S.y)*0.4}G.aimS={x:tx,y:ty};G.aimSid=a.t0;tx=cl(tx,1.5,FIELDW-1.5);ty=Math.min(ty,108.5)}
  const pl=Math.hypot(a.x-a.sx,a.y-a.sy);const d0=Math.hypot(tx-cur.x,ty-cur.y),ty2=gType(d0);let ok=false;if(ty<=110&&tx>0.5&&tx<FIELDW-0.5)for(const w of targets()){if(w===G.rb&&!G.handed&&G.snapT<1.2)continue;const FT=flightT(d0,ty2),f=simAhead(w,FT+0.15),cd=Math.hypot(w.x-tx,w.y-ty);if(Math.hypot(f[0]-tx,f[1]-ty)<4.8||(cd<(ty2==='bomb'?24:ty2==='lob'?13:9)&&cd/FT<9.4)){ok=true;break}}G.aim={tx,ty,lock,ty2,ok}}
 if(G.relAim){G.relAim=false;if(G.lastAim&&passerPhase()&&!G.tuck)throwSpot(G.lastAim.tx,G.lastAim.ty,G.lastAim.lock,G.lastAim.ty2)}G.lastAim=G.aim;
 for(const k of keys){if('123'.includes(k)&&passerPhase()&&!G.tuck){const w=P.filter(q=>q.role==='WR')[+k-1];if(w)throwTo(w)}if(k==='b'&&G.ko)return touchback()}
 for(const t of taps)if(t&&G.ko&&t[0]<120&&t[1]>H-140)return touchback();
 // Untucked pocket is a jog. Tuck is the RB-carry sprint. Ratio stays obvious behind the LOS.
 const SPD_POCKET=4.4,SPD_TUCK=10.8,SPD_RUN=8.2;
 const qbPocket=cur.role==='QB'&&passerPhase()&&!G.tuck&&!G.thrown;
 let sp=(qbPocket?SPD_POCKET:qbBurst?SPD_TUCK:SPD_RUN)*(G.slow>0?0.7:1);if(G.juke>PUR.jukeT)sp*=PUR.juke;if(G.play.t==='ko'&&cur.catchT>0)sp*=0.62;
 const thrownQ=G.thrown&&cur===G.qb&&!(G.ball&&G.ball.caught);
 if(cur.slide>0){cur.slide-=dt;cur.vx*=0.88;cur.vy=Math.max(2.05,Math.abs(cur.vy)*0.955);if(((G.snapT*60)|0)%3===0)dust(cur.x,cur.y,2);if(cur.slide<=0){cur.fallen=0.35;cur.vx*=0.2;cur.slide=0;if(qbIgnored()){}else if(cur.y>=100){endPlay('td',100);return}else{endPlay('tackle',cur.y);return}}}
 else if(thrownQ){cur.vx*=0.8;cur.vy*=0.8}
 else if(G.play.t==='ko'&&G.ball&&!G.ball.caught&&!(cur.dive>0)&&!(cur.fallen>0)){const b=G.ball,k=Math.min(1,b.t/b.T);const nx=b.tx+(jx||0)*0.9,ny=b.ty-(jy||0)*0.9;const dd=Math.hypot(cur.x-nx,cur.y-ny);if(dd<0.35){cur.x=nx;cur.y=ny;cur.vx*=0.4;cur.vy*=0.4}else steer(cur,nx,ny,dd>3?(k<0.5?8:10):5.5,dt,20);if(k>0.58)cur.reach=Math.max(cur.reach||0,0.6);}
 else if((!G.ball||G.ball.caught)&&!(cur.dive>0)&&!(cur.fallen>0)&&!(G.juke>0)){
  if(jx||jy){const vm=Math.hypot(cur.vx,cur.vy),jm=Math.hypot(jx,jy);if(vm>2){const co=(cur.vx*jx-cur.vy*jy)/(vm*jm);sp*=1-PUR.cut*(1-co)/2}steer(cur,cur.x+jx*5,cur.y-jy*5,sp*runMul,dt,16);}
  else if(cur.role==='RB'||cur.role==='WR'||(cur.role==='QB'&&p.t==='keep'))steer(cur,cur.x,cur.y+5,sp*0.85,dt);
  else if(passerPhase()&&!G.tuck){const a=pocketSpot();if(Math.hypot(cur.x-a.x,cur.y-a.y)>0.15)steer(cur,a.x,a.y,3.6,dt,5);else{cur.vx*=0.82;cur.vy*=0.82}}
  else steer(cur,cur.x,cur.y,0,dt);}
 if(G.juke>0&&!G.jukeCut&&G.juke<0.2){G.jukeCut=true;cur.vx=G.jukeS*10;cur.vy=Math.max(cur.vy,3);dust(cur.x,cur.y,10)}
 G.juke-=dt;G.jcd-=dt;
 // taps: throw or juke
 for(const t of taps){
  if(passerPhase()){
   let best=null,bd=1e9;const tg=targets();for(const w of tg){let d;if(!t)d=-openness(w)*10-w.y*.01;else{const b=bubblePos(w),i=tg.indexOf(w),ic=iconPos(i),s2=scr(w.x,w.y,1);d=Math.min(Math.hypot(b[0]-t[0],b[1]-t[1]),Math.hypot(ic[0]-t[0],ic[1]-t[1]),Math.hypot(s2[0]-t[0],s2[1]-t[1]))}if(d<bd){bd=d;best=w}}
   if(best&&best===G.rb&&canHand()&&(!t||bd<70)){handoff()}
  }else jukeIt();}
 // receivers
 if(G.ball&&!G.ball.caught){let bd=1e9;G.trkW=null;for(const q of P)if(q.team===0&&(q.role==='WR'||q.role==='RB')&&q!==G.carrier){const d=Math.hypot(q.x-G.ball.tx,q.y-G.ball.ty);if(d<bd){bd=d;G.trkW=q}}}
 for(const w of P){if(w===G.carrier)continue;
  if(w.team===0){
   if(G.ball&&!G.ball.caught&&G.play.t!=='ko'&&(w.role==='WR'||w.role==='RB')){const b=G.ball,dd=Math.hypot(w.x-b.tx,w.y-b.ty),R=b.tt==='bomb'?24:b.tt==='lob'?13:9;if(dd>1.0&&(dd<R&&(w===b.tgt||w===G.trkW||dd<9))){const rem=Math.max(0.05,b.T-b.t),need=dd/rem;steer(w,b.tx,b.ty,cl(need+0.8,4.5,need<9.6?9.4:7.6),dt,12);continue}}
   if(w.role==='WR'){w.rt+=dt;if(G.passer===false)steer(w,w.x,w.y+1,4,dt);else{const r=routeTarget(w,w.rt);w.spd=7.2+DIFFS[G.diff].sep;steer(w,r.x,r.y,w.route==='block'?3:w.spd*(r.k||1),dt,r.sh||11)}}
   else if(w.role==='OL'&&p.t==='ko')koBlock(w,dt);
   else if(w.role==='OL'){const ref=G.carrier;
    if(ref&&ref.team===0&&scrambling()&&inLane(w,ref)){const side=peelSide(ref,w);const ax=ref.x,ay=ref.y+Math.max(0,(ref.vy||0))*0.06;steer(w,cl(ax+side*(OL_GAP+0.42),1,FIELDW-1),Math.max(w.y,ay+0.55),5.2,dt,12);w.eng=false;washRusher(w,side)}
    else{w._peel=0;let d=w.blk;if(!d||d.shed||d.fallen>0){d=null;let bd=6;for(const q of P)if(q.team===1&&(q.role==='DL'||q.role==='LB')&&!(q.fallen>0)){const dd=dist(w,q);if(dd<bd){bd=dd;d=q}}}
     if(d){const dx=ref.x-d.x,dy=ref.y-d.y,l=Math.hypot(dx,dy)||1;let tx=d.x+dx/l*2.3,ty=d.y+dy/l*2.3;
      if(ref.team===0&&Math.hypot(w.x-ref.x,w.y-ref.y)<2.4){const s=flankSign(w,ref);tx=ref.x+s*1.85;ty=Math.max(ref.y+0.8,Math.min(ty,ref.y+1.6))}
      steer(w,tx,ty,p.t==='pass'?5:6,dt);w.eng=dist(w,d)<2.9}
     else{w.eng=false;const s=flankSign(w,ref),near=Math.hypot(w.x-ref.x,w.y-ref.y)<2.4;
      steer(w,near?ref.x+s*1.85:ref.x+(w.x-ref.x)*.9,near?ref.y+1.5:ref.y+2,near?4.5:3,dt)}}}
   else if(w.role==='RB'&&!G.handed){if(p.t==='pass'&&G.snapT<1.2)steer(w,G.qb.x+1.4,G.qb.y-0.4,5,dt);else steer(w,w.x+(p.t==='pass'?3:0),w.y+(p.t==='pass'?1:3),5,dt)}
   else if(w.role==='RB'){steer(w,w.x+2,w.y+1.5,5,dt)}
   else if(w.role==='QB'){steer(w,w.x,w.y-0.2,2,dt)}
  }else defend(w,dt);}
 if(G.pend){G.qb.vx*=0.88;G.qb.vy*=0.88;G.pend.t-=dt;if(G.pend.t<=0){releaseBall();if(G.st!=='live')return}}
 if(G.ball&&!G.ball.caught&&G.play.t!=='ko'&&G.ball.tip){const b=G.ball,rem=Math.max(0.12,b.T-b.t);for(const q of P)if(q.team===(b.tip?q.team:0)&&(q.role==='WR'||q.role==='RB'||(b.tip&&q.team===1&&q.role!=='DL'))&&!(q.fallen>0)&&!(q.dive>0)&&q!==G.qb){const d=Math.hypot(q.x-b.tx,q.y-b.ty);if(d<8.5&&d>0.3&&!(q.stun>0))steer(q,b.tx,b.ty,Math.min(9,d/rem+1.5),dt,12)}}
 for(const q of P){if(q.throwT>0)q.throwT-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.team===0&&(q.role==='WR'||q.role==='RB'||q.role==='TE')&&q!==G.carrier&&G.play.t!=='ko'){if(!G.ball&&!G.pend&&G.carrier===G.qb)q.x=cl(q.x,RX0-0.6,RX1+0.6);else q.x=cl(q.x,1.5,FIELDW-1.5)}q.x=cl(q.x,0.5,FIELDW-0.5);if(q!==G.carrier||G.play.t==='ko')q.y=Math.min(q.y,109.4); {const sp=Math.hypot(q.vx,q.vy);q.anim+=(sp>0.35?sp:0)*dt}}
 if(G.qb)holdOffHud(G.qb);if(G.rb&&G.rb!==G.qb)holdOffHud(G.rb);if(G.carrier&&G.carrier!==G.qb&&G.carrier!==G.rb)holdOffHud(G.carrier);
 // OL vs DL separation. Own linemen keep a sprite-width gap (no 0.35yd tunnel, no jersey-side peel).
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(a.fallen>0||b.fallen>0)continue;
  if((a===G.carrier||b===G.carrier)&&a.team!==b.team)continue;const aL=a.role==='OL'||a.role==='DL',bL=b.role==='OL'||b.role==='DL';
  const own=a.team===b.team&&((a===G.carrier&&bL)||(b===G.carrier&&aL));
  const ra=aL?0.68:0.45,rb=bL?0.68:0.45;
  const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy),m=own?OL_GAP:ra+rb;if(!(d<m&&d>0.001)){if(own&&d>OL_GAP+1.35)(a===G.carrier?b:a)._peel=0;continue}
  if(own)continue;
  const ux=dx/d,uy=dy/d,wa=a===G.carrier?0.35:1,wb=b===G.carrier?0.35:1,s=wa+wb;a.x+=ux*(m-d)*(wa/s);a.y+=uy*(m-d)*(wa/s);b.x-=ux*(m-d)*(wb/s);b.y-=uy*(m-d)*(wb/s);
  const rel=(a.vx-b.vx)*ux+(a.vy-b.vy)*uy;if(rel<0){const c=-rel*0.5;a.vx+=ux*c*(wa/s);a.vy+=uy*c*(wa/s);b.vx-=ux*c*(wb/s);b.vy-=uy*c*(wb/s)}}
 ownGap();krHold();if(!G.play||G.play.t!=='ko')preserveStick(G.carrier);
 // ball flight
 if(G.ball&&!G.ball.caught){const b=G.ball;b.t+=dt;(G.trail=G.trail||[]).push([b.x,b.y,b.z,b.t,b.T,b.h0||1.6]);if(G.trail.length>16)G.trail.shift();if(G.assist&&b.tgt===G.assist&&b.t>b.T*0.35&&Math.hypot(b.tgt.x-b.tx,b.tgt.y-b.ty)<4){const w=b.tgt,a=Math.min(1,dt*(b.tt==='bullet'?2.5:1.6));b.tx+=(cl(w.x,1.5,FIELDW-1.5)-b.tx)*a;b.ty+=(Math.min(w.y,108.5)-b.ty)*a}{const k0=b.t/b.T;if(k0>0.8&&!b.dv&&G.play.t!=='ko'){for(const q of P)if(q.team===0&&(q.role==='WR'||q.role==='RB')&&!(q.fallen>0)&&(!b.tgt||q===b.tgt)){const d=Math.hypot(q.x-b.tx,q.y-b.ty);if(d>2.4&&d<4.8){b.dv=q;q.dive=0.45;const u=1/d;q.vx=(b.tx-q.x)*u*12;q.vy=(b.ty-q.y)*u*12;dust(q.x,q.y,8);break}}}}const k=Math.min(1,b.t/b.T);b.x=b.x0+(b.tx-b.x0)*k;b.y=b.y0+(b.ty-b.y0)*k;b.z=Math.sin(k*Math.PI)*b.h;
  if(G.play.t==='ko'&&k>0.7&&G.carrier&&Math.hypot(G.carrier.x-b.tx,G.carrier.y-b.ty)<3.5)G.carrier.reach=Math.max(G.carrier.reach||0,0.55);
  if(k>0.8&&!b.cst&&G.play.t!=='ko'){const nr=P.filter(q=>!(q.fallen>0)&&q!==G.qb&&q.role!=='OL'&&q.role!=='DL'&&Math.hypot(q.x-b.tx,q.y-b.ty)<2.6);if(nr.length){b.cst=true;nr.forEach(q=>{q.reach=0.45});if(nr.some(q=>q.team===0)&&nr.some(q=>q.team===1)){G.tsT=0.35;say('CONTESTED!',0.6)}}}
  if(k>=1&&b.tip){const near=P.filter(q=>!(q.fallen>0)&&q!==G.qb&&q.role!=='K'&&Math.hypot(q.x-b.x,q.y-b.y)<1.7);const o=near.filter(q=>q.team===0),d=near.filter(q=>q.team===1);const r=Math.random();let who=null;
   if(o.length&&d.length)who=r<TIP.offBoth?o[0]:r<TIP.offBoth+TIP.defBoth?d[0]:null;else if(o.length)who=r<TIP.offAlone?o[0]:null;else if(d.length)who=r<TIP.defAlone?d[0]:null;
   G.tipStat.res=(G.tipStat.res||'')+(who?(who.team?'I':'C'):'x');if(!who){say('INCOMPLETE',0.8);endPlay('inc');return}if(who.team===1){who.catchT=0.7;who.reach=0.4;banner('INTERCEPTED!','OFF THE TIP');endPlay('int');return}b.caught=true;G.carrier=who;who.catchT=0.85;G.trail=[];burst(who.x,who.y);G.passer=false;caughtPop(who);return}
  if(k>=1&&!b.tip&&G.play.t!=='ko'&&!b.noTip){b.noTip=true;const dd0=P.filter(q=>q.team===1&&!(q.fallen>0)).reduce((m,q)=>Math.min(m,Math.hypot(q.x-b.x,q.y-b.y)),99);const pT=dd0<1.6?TIP.contested:dd0<3.2?TIP.near:0;G.tipStat=G.tipStat||{n:0,c:0,o:0,tips:0};G.tipStat.n++;if(dd0<1.6)G.tipStat.c++;else G.tipStat.o++;if(Math.random()<pT){G.tipStat.tips++;b.tip=true;const tp=P.filter(q=>q.team===1&&!(q.fallen>0)).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];const ia=Math.atan2(b.ty-b.y0,b.tx-b.x0)+(Math.random()<.5?-1:1)*rnd(0.5,1.3),dl=rnd(3.2,6);if(tp){tp.stun=0.5;tp.reach=0.35}b.x0=b.x;b.y0=b.y;b.h0=2.4;b.tx=cl(b.x+Math.cos(ia)*dl,1.5,FIELDW-1.5);b.ty=Math.min(108.5,b.y+Math.sin(ia)*dl);b.spin=rnd(14,24)*(Math.random()<.5?-1:1);b.t=0;b.T=TIP.hang;b.h=TIP.h;b.tgt=null;b.tt='lob';G.assist=null;G.shake=0.1;burst(b.x,b.y);banner('TIPPED!','');return}}
  if(k>=1){let w=b.tgt;{let bd=w?Math.hypot(w.x-b.x,w.y-b.y):99;for(const q of P)if(q.team===0&&(q.role==='WR'||q.role==='RB')&&q!==G.qb){const d=Math.hypot(q.x-b.x,q.y-b.y);if(d<bd){bd=d;w=q}}}if(!w){endPlay('inc');return}const dd=P.filter(q=>q.team===1).reduce((m,q)=>Math.min(m,Math.hypot(q.x-b.x,q.y-b.y)),99);const wd=Math.hypot(w.x-b.x,w.y-b.y);
   if(G.play.t==='ko'&&w){const wd0=Math.hypot(w.x-b.x,w.y-b.y);if(wd0<2.8){b.caught=true;G.carrier=w;w.catchT=0.62;w.reach=Math.max(w.reach||0,0.25);G.trail=[];G.ko=false;G.passer=false;burst(w.x,w.y);say('RETURN IT!',0.8);return}say('DROPPED!',0.8);endPlay('inc');return}
   if(dd<1.1&&dd<wd-0.3&&Math.random()<DIFFS[G.diff].int*0.4){intReact(b);endPlay('int');return}
   if(w.y>110||w.x<0.5||w.x>FIELDW-0.5){say('OUT OF BOUNDS',0.8);endPlay('inc');return}const dw=P.filter(q=>q.team===1&&!(q.fallen>0)).reduce((m,q)=>Math.min(m,dist(q,w)),99);const tm=b.tt==='bullet'?(b.T<0.8?0.6:1.3):b.tt==='bomb'?1.15:0.8;if(dw<1.3&&Math.random()<([.12,.2,.3,.42][G.diff]*(1.3-dw)/1.0+0.05*G.diff)*tm){const dv=P.filter(q=>q.team===1&&!(q.fallen>0)).sort((a,c)=>dist(a,w)-dist(c,w))[0];if(dv){dv.dive=0.45;dv.vx=(b.x-dv.x)*4;dv.vy=(b.y-dv.y)*4;dust(dv.x,dv.y,8)}if(Math.random()<DIFFS[G.diff].int*0.35){intReact(b);banner('INTERCEPTED!','DIVING PICK');endPlay('int');return}say('BROKEN UP!',0.8);endPlay('inc');return}
   if(wd>=2.9&&wd<4.6&&w.role!=='QB'){w.dive=0.45;w.vx=(b.x-w.x)*4;w.vy=(b.y-w.y)*4;dust(w.x,w.y,10);if(Math.random()<0.62-G.diff*0.06){b.caught=true;G.carrier=w;w.catchT=0.85;G.trail=[];G.flash={x:b.x,y:b.y,t:0};burst(b.x,b.y);G.passer=false;G.shake=0.15;G.dcatch=true;banner('DIVING CATCH!');return}say('JUST OUT OF REACH',0.8);endPlay('inc');return}
   if(wd<2.2&&Math.random()<0.035+G.diff*0.01){say('DROPPED!',0.8);endPlay('inc');return}
   if(wd<2.9&&!(dd<0.9&&Math.random()<(G.assist?0.35:0.5))){if(b.dv===w){G.dcatch=true;w.dive=Math.max(w.dive,0.4);banner('DIVING CATCH!');G.shake=0.15}b.caught=true;G.carrier=w;w.catchT=0.85;G.trail=[];G.flash={x:w.x,y:w.y,t:0};burst(w.x,w.y);G.passer=false;if(G.play.t!=='ko')caughtPop(w);else G.ko=false}else{endPlay('inc');return}}}
 // Once the ball is out, the quarterback is scenery. Catch, tip, and incompletion come from the ball.
 const cc=G.carrier;
 if(!qbIgnored()&&!(G.ball&&!G.ball.caught)&&!(cc.slide>0)){
  for(const d of P){if(d.team!==1||d.fallen>0)continue;const dd=dist(d,cc);
   if(!d.dive&&dd<2.2&&dd>1.2&&G.snapT>0.6&&Math.random()<dt*(1.6-[0.45,0.65,0.85,1][G.diff]*0.6)){d.dive=0.4;const u=1/dd;d.vx=(cc.x+cc.vx*.25-d.x)*u*11;d.vy=(cc.y+cc.vy*.25-d.y)*u*11}
   if(G.juke>0&&G.jukeCut&&dd<2.6){d.dive=0.3;d.vx=-(G.jukeS||1)*7;d.vy=(cc.y-d.y)*2;d.brkTried=true;d.stun=PUR.whiff;say('WHIFF!',0.6);dust(d.x,d.y,8);continue}
   if(cc.catchT>0.27&&G.play.t!=='ko')continue;
   if(dd<(d.dive?1.4:1.15)+((d.y<cc.y-0.3&&cc.vy>2)?PUR.behind:0)){
   if(d.stun>0)continue;
   const gang=G.players.some(q=>q.team!==cc.team&&q!==d&&!q.fallen&&dist(q,cc)<PUR.gang);
   let brk=false;if(!d.brkTried||(G.truck&&!d._tr)){if(G.truck)brk=!gang;else if(!d.brkTried)brk=(cc.role!=='QB'||G.qbRun)&&!gang&&Math.random()<PUR.brkP+(cc.ovr-d.ovr)*0.01}d.brkTried=true;if(brk&&G.truck)d._tr=1;if(!brk&&gang)G.gang=1;
   if(brk){d.fallen=PUR.brk;d.dive=0;const u=1/(dd||1);d.vx=(d.x-cc.x)*u*6;d.vy=(d.y-cc.y)*u*6;G.slow=G.truck?0.08:0.35;G.shake=G.truck?0.34:0.2;dust(d.x,d.y,G.truck?22:14);if(G.truck){cc.stiffT=0.7;cc.vy=Math.max(cc.vy,9.2);cc.vx*=0.4}say(G.truck?'TRUCKED!':'BROKEN TACKLE!',0.9);G.brk=(G.brk||0)+1;continue}
   dust(cc.x,cc.y,20);ring(cc.x,cc.y,'#fff',1);G.shake=0.22;d.fallen=2;cc.fallen=2;d.tackler=true;{const u=1/(dd||1),ox=(d.x-cc.x)*u||0,oy=(d.y-cc.y)*u||1,r=Math.max(dd,0.95);d.x=cc.x+ox*r;d.y=cc.y+oy*r;const mx=cc.vx*0.45+d.vx*0.15,my=cc.vy*0.45+d.vy*0.15;cc.vx=mx;cc.vy=my;d.vx=mx;d.vy=my}
   if(G.gang){G.gang=0;G.gangN=(G.gangN||0)+1;for(const q of P)if(q.team!==cc.team&&q!==d&&!q.fallen&&dist(q,cc)<PUR.gang){q.fallen=1.6;q.vx=(cc.x-q.x)*2;q.vy=(cc.y-q.y)*2;dust(q.x,q.y,10)}say('GANG TACKLE!',0.9);G.shake=0.3;ring(cc.x,cc.y,'#ff9a2f',1.8)}
   const behind=cc.role==='QB'&&cc.y<G.los&&G.play.t==='pass';endPlay(behind&&(!G.thrown||G.pend)?'sack':'tackle',cc.y);return}}}
 for(const d of P){if(d.catchT>0)d.catchT-=dt;if(d.reach>0)d.reach-=dt;if(d.stun>0)d.stun-=dt;if(d.dive>0){d.dive-=dt;if(d.dive<=0){d.dive=0;d.fallen=0.9;dust(d.x,d.y,6)}}if(d.fallen>0){d.fallen-=dt;d.vx*=0.92;d.vy*=0.92}}
 if(!qbIgnored()&&!(cc.slide>0)){if(G.cdive&&cc.dive>0){if(cc._cdive){const y0=cc._diveY0!=null?cc._diveY0:cc.y;let cap=y0+2.7;const marks=[G.los+G.togo,100];for(const m of marks)if(m>y0&&m<=y0+3.4)cap=Math.max(cap,Math.min(y0+3.4,m+0.05));cap=Math.min(cap,y0+3.4,109.2);if(cc.y>cap){cc.y=cap;cc.vy=0;cc.vx*=0.4}else cc.vy=Math.max(cap>y0+2.75?8.4:3.2,cc.vy*0.992)}else cc.vy=Math.max(cc.vy,cc._fly?13.2:7)}if(G.cdive&&!(cc.dive>0)){G.cdive=false;if(cc._cdive){cc._cdive=0;cc.vy=0;cc.vx*=0.15;cc.fallen=0.16;dust(cc.x,cc.y,10);G.shake=0.1;G.cdown=true}else if(cc._fly){cc._fly=0;cc.fallen=0.3;cc.vx*=0.28;cc.vy*=0.22;dust(cc.x,cc.y,18);G.shake=0.16;G.cdown=true}else{G.cslide=true;cc.fallen=0.4;cc.vx*=0.5;cc.vy*=0.55;dust(cc.x,cc.y,16);G.shake=0.12}}
 if(G.cdown){if(cc.y>=100){G.cdown=false;endPlay('td',100);return}if(!(cc.fallen>0.05)){G.cdown=false;endPlay('tackle',cc.y);return}}
 if(G.cslide){if(cc.y>=100){G.cslide=false;endPlay('td',100);return}if(!(cc.fallen>0.05)){G.cslide=false;cc.fallen=0.8;endPlay('tackle',cc.y);return}}
 if(G.dcatch&&cc.dive<=0){G.dcatch=false;if(cc.y<100){cc.fallen=1;endPlay('tackle',cc.y);return}}if(G.dcatch&&cc.dive>0){/*diving*/}
 if(cc.y>=100){endPlay('td',100);return}
 if(cc.x<=0.6||cc.x>=FIELDW-0.6){if(G.snapT>0.5){say('OUT OF BOUNDS');endPlay('tackle',cc.y);return}}}
 G.cam+=((G.ball&&!G.ball.caught?G.ball.y+(G.ball.tt==='bomb'?6:0):G.aim?Math.max(cc.y,(cc.y+G.aim.ty)/2-3):cc.y+cl(cc.vy*0.4,-2,4))+4-G.cam)*Math.min(1,dt*(G.ball&&!G.ball.caught?7:4));
}
function koBlock(w,dt){const c=G.carrier,b=G.ball,air=b&&!b.caught;const fx=air?b.tx:c.x,fy=air?b.ty:c.y;const spk=6.4*(DIFFS[G.diff].def+lvlStr(G.lvl))*KO.blkSpd;
 const OL=G.players.filter(q=>q.role==='OL'),i=OL.indexOf(w);
 if(w.hold>0){w.hold-=dt;const d=w.blkK;if(d&&!(d.fallen>0)&&dist(w,d)<2.9){w.eng=true;w.blk=d;steer(w,d.x+(fx-d.x)*0.05,d.y-0.9,spk*0.5,dt);d.blockT=0.12;return}w.hold=0}
 if(w.hcd>0)w.hcd-=dt;w.eng=false;
 let tg=null,bd=1e9;if(!air||b.t>b.T*KO.engageAt){for(const d of G.players)if(d.team===1&&!(d.fallen>0)&&!d.kicker&&!(d.blockT>0)){if(OL.some(o=>o!==w&&o.blkK===d))continue;const dd=dist(w,d)+Math.max(0,d.y-fy)*0.25;if(dd<bd&&dd<KO.reach){bd=dd;tg=d}}}
 if(tg&&!(w.hcd>0)){w.blkK=tg;const ux=fx-tg.x,uy=fy-tg.y,l=Math.hypot(ux,uy)||1;steer(w,tg.x+ux/l*1.1,tg.y+uy/l*1.1,spk,dt,10);if(dist(w,tg)<2.3){w.hold=rnd(KO.holdMin,KO.holdMax);w.hcd=0.6;dust(tg.x,tg.y,6)}return}
 w.blkK=null;const k=i-(OL.length-1)/2;steer(w,cl(fx+k*2.4,2,FIELDW-2),fy+7-Math.abs(k)*1.1,Math.max(spk,7.6),dt,10)}
function krHold(){if(!G.play||G.play.t!=='ko'||!G.ball||!G.ball.caught)return;const cc=G.carrier;if(!cc||cc.team)return;
 const ols=G.players.filter(q=>!q.team&&q.role==='OL'&&!(q.fallen>0));if(!ols.length)return;
 let lead=-1e9,vy=0,met=false;for(const o of ols){if(o.y>lead)lead=o.y;vy+=o.vy||0;if(o.hold>0||o.eng)met=true}
 if(!met){for(const o of ols){if(met)break;for(const d of G.players)if(d.team===1&&!(d.fallen>0)&&!d.kicker&&Math.hypot(o.x-d.x,o.y-d.y)<2.8){met=true;break}}}
 if(met)return;const capY=lead-0.55,capV=Math.max(0.35,vy/ols.length+0.3);
 if(cc.y>capY-1.5&&cc.vy>capV)cc.vy=capV;if(cc.y>capY){cc.y=capY;if(cc.vy>capV)cc.vy=capV}}
const KO={reach:34,blkSpd:0.9,engageAt:0.55,holdMin:1.0,holdMax:1.9,dMin:-4,dMax:6,tMin:3.6,tMax:4.2};window.KO=KO;
const PUR={DL:6.8,LB:7.6,CB:8.15,S:8.25,gang:2.3,brkP:0.16,cut:0.2,maxT:2.2,juke:1.4,jukeT:0.14,behind:0.2,whiff:0.55,brk:0.8};window.PUR=PUR;
function nearest(p,team,roles){let b=null,bd=1e9;for(const q of G.players)if(q.team===team&&roles.includes(q.role)){const d=dist(p,q);if(d<bd){bd=d;b=q}}return b}
function defend(d,dt){if(d.dive>0)return;
 if(d.role==='DL'&&d.blk&&!d.shed&&!(d.fallen>0)){if(G.snapT>d.shedT||(G.carrier!==G.qb&&G.snapT>d.shedT*0.7)){d.shed=true;d.eng=false;d.vx+=(d.x<d.blk.x?-1:1)*5}else{d.eng=dist(d,d.blk)<2.9;const c=G.carrier;steer(d,c.x,c.y,G.play.t==='pass'?1.8:1.0,dt);return}}if(d.fallen>0||d.stun>0){d.vx*=0.9;d.vy*=0.9;return}
 const c=G.carrier,inAir=G.ball&&!G.ball.caught;
 if(G.play.t==='ko'){if(d.fallen>0||d.stun>0)return;if(d.blockT>0){d.blockT-=dt;d.eng=true;d.vx*=0.82;d.vy*=0.82;return}d.eng=false;const DFk=DIFFS[G.diff],spk=6.4*(DFk.def+lvlStr(G.lvl));const fx=inAir?G.ball.tx:c.x,fy=inAir?G.ball.ty:c.y;
  if(d.kicker){const dd=Math.hypot(d.x-fx,d.y-fy);if(dd>9&&!inAir)return steer(d,cl(fx,4,FIELDW-4),Math.max(fy+10,d.y-0.01),spk*0.75,dt);if(inAir)return steer(d,cl(fx,4,FIELDW-4),fy+28,spk*0.6,dt)}
  else{const dd=Math.hypot(d.x-fx,d.y-fy),k=cl(1-(dd-6)/18,0,1);const s=fx<FIELDW/2?-1:1;const out=(d.lane-fx)*s>0;const tx=d.lane+(fx+(out?s*2:0)-d.lane)*k;const ty=inAir?Math.max(fy+6,d.y-spk*dt):fy+(c.vy||0)*0.4*k;
   return steer(d,cl(tx,1,FIELDW-1),ty,spk*(dd<4?0.85:dd>14?0.9:1),dt)}}const rushBoost=G.snapT>DIFFS[G.diff].pk?1.3:1;const DF=DIFFS[G.diff];let sp={DL:5.4*rushBoost,LB:6.2,CB:7,S:6.8}[d.role]*(DF.def+lvlStr(G.lvl));
 if(G.snapT<0.25)return;if(G.play.t!=='pass'&&G.snapT<1.3)sp*=d.role==='DL'?0.45:0.6;
 // pursuit
 const pursue=!G.passer||c.role!=='QB'||d.role==='DL'||(d.role==='LB'&&d.blitz)||(c.y>G.los-0.5);
 if(inAir){const b=G.ball;if(b.t>Math.max(0.3+(3-G.diff)*0.12,b.T*(0.62-G.diff*0.06))&&Math.hypot(d.x-b.tx,d.y-b.ty)<(b.tt==='bullet'?6:8.5))return steer(d,b.tx,b.ty,sp*(b.tt==='bullet'?0.82:0.92)+sp*G.diff*0.06,dt)}
 if(d.role==='CB'&&!pursue&&d.man){return steer(d,d.man.x+(d.man.x<FIELDW/2?-1:1)*(1.2+DIFFS[G.diff].cov*0.3)+d.man.vx*0.2,d.man.y+DIFFS[G.diff].cov*0.45+(d.man.y>G.los+12?d.man.vy*0.4+1.5:0),sp*(d.man.y>G.los+12?1.05:0.95),dt)}
 if(d.role==='S'&&!pursue){const wrs=G.players.filter(q=>q.role==='WR');let deep=wrs.reduce((a,b)=>a.y>b.y?a:b);return steer(d,cl((deep.x+FIELDW/2)/2+(d.x<FIELDW/2?-3:3),6,FIELDW-6),Math.max(deep.y+5,G.los+Math.max(13,G.togo+5)),sp*0.8,dt)}
 if(d.role==='LB'&&!pursue&&d.spy){return steer(d,cl(c.x,4,FIELDW-4),G.los+3.5,sp*0.7,dt)}
 if(d.role==='LB'&&!pursue){return steer(d,cl(c.x+(d.x<FIELDW/2?-5:5),4,FIELDW-4),G.los+Math.min(G.togo,8)+1,sp*0.6,dt)}
 // lead the carrier
 const runner=!(c.role==='QB'&&!G.qbRun&&G.passer);if(runner)sp=Math.max(sp,PUR[d.role]*(DF.def+lvlStr(G.lvl)));const disc=[0.45,0.65,0.85,1][G.diff],sticks=G.los+G.togo,dd=dist(d,c);let lead=Math.min(1.2,dd/sp);
 if(runner){let tI=0;for(let it=0;it<6;it++){const px=c.x+c.vx*tI,py=c.y+c.vy*tI;tI=Math.min(PUR.maxT,Math.hypot(px-d.x,py-d.y)/sp)}lead=tI/0.8}
 if(c.role==='QB'&&!G.qbRun&&G.passer){return steer(d,c.x+c.vx*lead*0.8,c.y+c.vy*lead*0.8,sp,dt)}
 const s=c.x<FIELDW/2?-1:1;const outside=(d.x-c.x)*s>0;let tx=c.x+c.vx*lead*0.8,ty=c.y+c.vy*lead*0.8;
 if(dd>2.2){tx+=s*disc*(outside?1.8:0.9)*Math.min(1,dd/9);if(d.y>c.y)ty=Math.max(c.y+1.2*disc,Math.min(ty,sticks+1));else ty=c.y+c.vy*lead}
 if(d.role==='S'&&runner&&d.y>c.y+3){ty=Math.max(ty,c.y+c.vy*lead+3);tx=c.x+c.vx*lead*0.9}
 if(c.y>sticks-4||c.y>95)sp*=1+0.08*disc;if(dd<3.5&&!runner)sp*=0.9;
 steer(d,cl(tx,0.8,FIELDW-0.8),ty,sp,dt)}
function pickTarget(x,y){let best=null,bd=70;const tg=targets();for(const w of tg){const b=bubblePos(w),ic=iconPos(tg.indexOf(w)),s2=scr(w.x,w.y,1);const d=Math.min(Math.hypot(b[0]-x,b[1]-y),Math.hypot(ic[0]-x,ic[1]-y),Math.hypot(s2[0]-x,s2[1]-y));if(d<bd){bd=d;best=w}}return best}
function slotAngles(){const ws=targets().filter(w=>w!==G.rb).map(w=>[w,tgtAngle0(w)]).sort((a,b)=>a[1]-b[1]);const n=ws.length,m=new Map();ws.forEach(([w],i)=>m.set(w,-Math.PI*(n>1?0.85-0.7*i/(n-1):0.5)));return m}
function tgtAngle(w){return slotAngles().get(w)??-Math.PI/2}
function tgtAngle0(w){const q=scr(G.qb.x,G.qb.y,1),s=scr(w.x,w.y,1);return Math.atan2(s[1]-q[1],s[0]-q[0])}
function stickRead(p){const dx=p.x-STK.x,dy=p.y-STK.y,d=Math.hypot(dx,dy);if(d<16||!G.qb)return{};if(dy>d*0.7)return{tuck:true};const a=Math.atan2(dy,dx);let best=null,bd=0.9;for(const w of targets()){if(w===G.rb)continue;let da=Math.abs(((tgtAngle(w)-a)+Math.PI*3)%(Math.PI*2)-Math.PI);if(da<bd){bd=da;best=w}}return{w:best}}
function holdType(ht){return ht<0.28?'bullet':ht<0.75?'lob':'bomb'}
const TIP={contested:0.2,near:0.04,hang:0.85,h:3.2,offBoth:0.45,defBoth:0.15,offAlone:0.7,defAlone:0.3};window.TIP=TIP;
function intReact(b){const d=G.players.filter(q=>q.team===1&&!(q.fallen>0)).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];if(d){d.catchT=0.45;d.reach=0.4;d.x+=(b.x-d.x)*0.5;d.y+=(b.y-d.y)*0.5}G.pop={x:b.x,y:b.y,t:0,s:'PICKED!'}}
function drawRings(){for(const r of (G.rings||[])){const q=scr(r.x,r.y,0),q2=scr(r.x+1,r.y,0),u=Math.abs(q2[0]-q[0])||8,k=r.t/0.35;X.save();X.globalAlpha=(1-k)*0.55;X.strokeStyle=r.c;X.lineWidth=2*(1-k)+0.5;X.beginPath();X.ellipse(q[0],q[1],u*r.s*(0.5+1.4*k),u*r.s*(0.25+0.7*k),0,0,7);X.stroke();X.restore()}
 if(G.st==='live'&&G.carrier&&G.carrier.team===0&&G.carrier.y>G.los+15&&Math.random()<0.5){(G.fl=G.fl||[]).push({x:Math.random()<.5?rnd(4,40):rnd(W-40,W-4),y:rnd(150,H-200),l:0.12})}if(G.fl)for(const f of G.fl){X.save();X.globalAlpha=f.l/0.12;X.fillStyle='#fff';X.beginPath();X.arc(f.x,f.y,1.5+3*(f.l/0.12),0,7);X.fill();X.restore()}}
function caughtPop(w){ring(w.x,w.y,'#ffe14f',1.2);G.pop={x:w.x,y:w.y,t:0,s:'CAUGHT!'}}
function gType(d){return d<16?'bullet':d<30?'lob':'bomb'}
function flightT(d,ty){return ty==='bullet'?0.14+d/34:ty==='bomb'?0.88+d/26:0.34+d/22}
function arcH(d,ty){return ty==='bullet'?0.35+d*0.018:ty==='bomb'?4.6+d*0.26:1.5+d*0.11}
function canHand(){return passerPhase()&&!G.tuck&&!G.pend&&!G.handed&&G.snapT<2.6&&G.qb.y<G.los&&dist(G.qb,G.rb)<6}
function handoffMetrics(){const h=16,sc=2;const tw=window.pxMeasure?pxMeasure('HANDOFF',sc):84;const r=h/2,pad=6,w=Math.ceil(r+pad+tw+pad+r);return{w,h,tw,sc}}
function handoffGeom(){const {w,h}=handoffMetrics(),rb=G.rb;
 let cx,cy;if(rb&&rb._hx!=null){cx=rb._hx;cy=rb._hy+Math.round(h*0.85)}else{const s=scr(rb.x,rb.y,2.5);cx=s[0];cy=s[1]}
 const o=hudPush(cx,cy);
 let x=Math.round(o.x-w/2),y=Math.round(o.y-h/2);x=cl(x,6,W-6-w);y=cl(y,124,H-28-h);return{x,y,w,h}}
function handoffHit(px,py,g){const s=3;return px>=g.x-s&&px<=g.x+g.w+s&&py>=g.y-s&&py<=g.y+g.h+s}
function drawHandoffPill(x,y,w,h){const cap=(px,py,pw,ph)=>{const rr=ph/2;X.beginPath();X.moveTo(px+rr,py);X.lineTo(px+pw-rr,py);X.arc(px+pw-rr,py+rr,rr,-Math.PI/2,Math.PI/2);X.lineTo(px+rr,py+ph);X.arc(px+rr,py+rr,rr,Math.PI/2,Math.PI*1.5);X.closePath()};
 cap(x-2,y-2,w+4,h+4);X.fillStyle='#0b0614';X.fill();cap(x,y,w,h);
 const grd=X.createLinearGradient(0,y,0,y+h);grd.addColorStop(0,'#ffe7b8');grd.addColorStop(.45,'#ff8a1f');grd.addColorStop(1,'#c2410c');X.fillStyle=grd;X.fill();
 X.save();cap(x,y,w,h);X.clip();X.fillStyle='rgba(255,255,255,.5)';X.fillRect(x,y,w,2);X.fillStyle='rgba(255,255,255,.14)';X.fillRect(x,y+2,w,3);X.restore();
 if(window.pxText)pxText(X,'HANDOFF',x+w/2,y+h/2+1,2,'#2a1206',{al:'center',sk:0,it:false});}
function handoff(){G.hoT=0;G.carrier=G.rb;G.rb.hasBall=1;G.qb.hasBall=0;G.handed=true;G.passer=false;G.thrown=false;G.runHinted=false;G.players.forEach(d=>{if(d.role==='DL'&&!d.shed)d.shedT=G.snapT/0.7+rnd(0.9,1.5)*DIFFS[G.diff].shed});say('HANDOFF!',0.8);dust(G.rb.x,G.rb.y,6)}
function targets(){return G.players.filter(q=>q.team===0&&(q.role==='WR'||q.role==='RB')&&q!==G.qb)}
function openness(w){const d=G.players.filter(q=>q.team===1&&!(q.fallen>0)).reduce((m,q)=>Math.min(m,dist(q,w)),99);return d}
function openCol(w){const d=openness(w);return d>3.2?'#3fd07a':d>1.7?'#ffd23f':'#ff4d5e'}
function bubblePos(w){const s=scr(w.x,w.y,4.2);return[s[0],s[1]-22]}
function iconPos(i){return[-999,-999]}
function throwTo(w,assist,ty){const q=G.carrier;let px=w.x,py=w.y,T=0;if(!ty){const d=dist(q,w);ty=d<14?'bullet':d<30?'lob':'bomb'}G.ttype=ty;for(let i=0;i<3;i++){T=flightT(Math.hypot(px-q.x,py-q.y),ty)+0.15;const f=simAhead(w,T);px=f[0];py=f[1]}throwSpot(cl(px,1.5,FIELDW-1.5),Math.min(py,108.5),w,ty);if(assist)G.assist=w}
function simAhead(w,T){if(w.role!=='WR')return[w.x+w.vx*T,w.y+w.vy*T];const c={x:w.x,y:w.y,vx:w.vx,vy:w.vy,route:w.route,dir:w.dir,dk:w.dk};let rt=w.rt;for(let s=0;s<T;s+=1/30){rt+=1/30;const r=routeTarget(c,rt);steer(c,r.x,r.y,w.spd||7.2,1/30);c.x+=c.vx/30;c.y+=c.vy/30}return[c.x,c.y]}
function touchback(){G.ko=false;G.los=25;G.down=1;G.togo=10;G.st='result';G.resT=1.3;G.next='down';banner('TOUCHBACK','BALL ON THE 25')}
function throwSpot(tx,ty,w,tt){const q=G.carrier;if(G.pend||G.tuck)return;if(q.y>G.los+0.3){say('CROSSED THE LINE',0.8);return}G.assist=null;tx=cl(tx,1.5,FIELDW-1.5);ty=Math.min(ty,108.5);const tt0=tt||G.ttype||'lob',dur=tt0==='bullet'?0.2:tt0==='bomb'?0.4:0.3,cock=!!G.aim||(q._cockT||0)>0;q.throwDur=dur;q.throwT=cock?dur*0.72:dur;q.throwDir={x:tx-q.x,y:ty-q.y};G.thrown=true;G.pend={tx,ty,w,t:cock?0:dur*0.42,tt:tt0};ring(q.x,q.y,'#8fd0ff',0.7);G.shake=Math.max(G.shake||0,tt0==='bomb'?0.08:0.04);G.ttype=null}
function releaseBall(){const q=G.qb;let{tx,ty,w,tt}=G.pend;G.pend=null;const d0=Math.hypot(tx-q.x,ty-q.y);const T=flightT(d0,tt);q.hasBall=0;
 const pres=G.players.some(d=>d.team===1&&!(d.fallen>0)&&dist(d,q)<3)?0.9:0,mov=Math.hypot(q.vx,q.vy)*0.12;const sg=(0.25+(95-q.ovr)*0.025+pres+mov+d0*0.012)*(tt==='bomb'?1.4:tt==='bullet'?0.7:1);const ga=()=>(Math.random()+Math.random()+Math.random()-1.5)*1.4;tx=cl(tx+ga()*sg,1.5,FIELDW-1.5);ty=Math.min(ty+ga()*sg,108.5);
 {const l=Math.hypot(tx-q.x,ty-q.y)||1;q.hx=q.x+(tx-q.x)/l*0.35;q.hy=q.y+(ty-q.y)/l*0.35}G.ball={x0:q.hx,y0:q.hy,x:q.hx,y:q.hy,tx,ty,t:0,T,h:arcH(d0,tt),tt,fz:1.5+sg*1.4,tgt:w,caught:false,z:0,h0:2.9*(window.__SPK||1)*0.86+(tt==='bomb'?0.45:tt==='lob'?0.25:0)};G.thrown=true}
function jukeIt(dir){if(G.jcd>0)return;G.juke=0.28;G.jcd=0.55;const c=G.carrier;const s=(dir||(IN.jx?Math.sign(IN.jx):0)||Math.sign(Math.random()-.5));G.jukeS=s;G.jukeCut=false;c.vx=-s*4.2;c.vy=Math.max(c.vy*0.55,2.2);dust(c.x,c.y,10);say('JUKE!',0.45)}
// ---------- rendering ----------
const PAL={bg:'#120a24',grass1:'#2f8a3c',grass2:'#2a7f36',line:'#e9f5e1',txt:'#fff4d6',pink:'#ff4fa3',yel:'#ffe14f',cy:'#3fd0ff'};
function rect(x,y,w,h,c){X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),w,h)}
const FONT={};
function txt(s,x,y,sz=16,c=PAL.txt,al='center',sh=true){s=String(s);if(window.pxText){pxText(X,s,x,y,Math.max(1,Math.round(sz/6.2)),c,{al,out:sh?'#0a0818':null,sk:0.1});return}X.font=`800 ${sz}px monospace`;X.textAlign=al;X.textBaseline='middle';if(sh){X.fillStyle='#000';X.fillText(s,x+2,y+2)}X.fillStyle=c;X.fillText(s,x,y)}
function uiTxt(s,x,y,sz=14,c=PAL.txt,al='center',sh=true){txt(s,x,y,sz,c,al,sh)}
window.uiTxt=uiTxt;
function box(x,y,w,h,c='#1d1238',b=PAL.yel){rect(x-3,y-3,w+6,h+6,'#000');rect(x,y,w,h,b);rect(x+3,y+3,w-6,h-6,c)}
function drawField(){
 const ox=(W-FIELDW*PPY)/2;
 for(let y=-10;y<110;y+=5){const top=sy(y+5),bot=sy(y);if(bot<-20||top>H+20)continue;rect(0,top,W,bot-top+1,(Math.floor(y/5)%2)?PAL.grass1:PAL.grass2)}
 // both end zones wear the home club; the midfield mark uses that same color
 const tc=TEAMS[G.home];
 rect(0,sy(110),W,sy(100)-sy(110),tc.c1);rect(0,sy(0),W,sy(-10)-sy(0),tc.c1);
 const ezName=(yy,flip)=>{X.save();X.translate(W/2,yy);if(flip)X.rotate(Math.PI);txt(tc.nick||tc.a,0,0,22,'#fff');X.restore()};
 ezName((sy(110)+sy(100))/2,false);ezName((sy(0)+sy(-10))/2,true);
 if(window.HELM&&HELM.drawMark)HELM.drawMark(X,W/2,sy(50),34,tc.c1);
 for(let y=0;y<=100;y+=5){const py=sy(y);if(py<-10||py>H+10)continue;rect(ox,py,FIELDW*PPY,y%10?1:2,PAL.line);
  for(const hx of [ox+18*PPY,ox+35*PPY])rect(hx-3,py,6,1,PAL.line);
  if(y%10===0&&y>0&&y<100){const n=y<=50?y:100-y;txt(String(n),ox+8*PPY,py-10,16,'rgba(233,245,225,.75)','center',false);txt(String(n),ox+45*PPY,py-10,16,'rgba(233,245,225,.75)','center',false)}}
 rect(0,0,ox,H,'#1a5a24');rect(ox+FIELDW*PPY,0,ox,H,'#1a5a24');rect(ox-2,0,2,H,PAL.line);rect(ox+FIELDW*PPY,0,2,H,PAL.line);
 if(G.st==='live'||G.st==='result'){rect(ox,sy(G.los)-1,FIELDW*PPY,3,PAL.cy);const fd=G.los+G.togo;if(fd<100)rect(ox,sy(fd)-1,FIELDW*PPY,3,PAL.yel)}
}
function drawPlayer(p){const x=Math.round(sx(p.x)),y=Math.round(sy(p.y));const tm=p.team===0?TEAMS[G.home]:TEAMS[G.away];
 const leg=Math.floor(p.anim*2)%2;
 rect(x-5,y+6,11,3,'rgba(0,0,0,.35)');
 rect(x-4,y+2,3,5+(leg?1:0),'#222');rect(x+1,y+2,3,5+(leg?0:1),'#222'); // legs
 rect(x-5,y-6,10,9,tm.c1);rect(x-6,y-5,2,6,tm.c1);rect(x+4,y-5,2,6,tm.c1); // body/arms
 rect(x-2,y-4,4,4,tm.c2); // number block
 rect(x-4,y-12,8,7,tm.c2);rect(x-3,y-11,6,3,tm.c1);rect(x-3,y-8,6,1,'#111'); // helmet+facemask
 if(p===G.carrier&&G.st==='live'){rect(x-1,y-22,3,4,PAL.yel);rect(x-3,y-24,7,2,PAL.yel);if(G.juke>0){X.strokeStyle=PAL.cy;X.lineWidth=2;X.strokeRect(x-9,y-15,18,24)}}
 if(p.stun>0)txt('*',x,y-18,12,PAL.yel);
 if(p===G.carrier&&(!G.ball||G.ball.caught)){rect(x+3,y-2,4,3,'#8a4a1f')}
}
function drawBall(){const b=G.ball;if(!b||b.caught)return;const x=sx(b.x),y=sy(b.y);rect(x-2,y,5,2,'rgba(0,0,0,.4)');const zy=y-b.z*PPY;rect(x-3,zy-2,6,4,'#8a4a1f');rect(x-1,zy-1,2,1,'#fff');
 X.strokeStyle='rgba(255,225,79,.5)';X.setLineDash([3,4]);X.beginPath();X.moveTo(sx(b.x),sy(b.y));X.lineTo(sx(b.tx),sy(b.ty));X.stroke();X.setLineDash([]);rect(sx(b.tx)-3,sy(b.ty)-1,7,3,PAL.yel)}
function drawScoreboard(){
 box(8,8,W-16,64,'#120a24',PAL.pink);
 const h=TEAMS[G.home],a=TEAMS[G.away];
 rect(18,18,22,20,h.c1);txt(h.a,58,28,16,PAL.txt,'left');txt(String(G.sh),150,30,28,PAL.yel);
 rect(W-40,18,22,20,a.c1);txt(a.a,W-58,28,16,PAL.txt,'right');txt(String(G.sa),W-150,30,28,PAL.yel);
 txt('Q'+G.q,W/2,24,14,PAL.cy);txt('DR '+(Math.min(G.drive+1,G.maxDrives))+'/'+G.maxDrives,W/2,40,10,PAL.txt);
 const ord=['1ST','2ND','3RD','4TH'][Math.min(G.down,4)-1]||'4TH';const ballOn=G.los<=50?'OWN '+Math.round(G.los):'OPP '+Math.round(100-G.los);
 txt(ord+' & '+(G.los+G.togo>=100?'GOAL':Math.max(1,Math.round(G.togo)))+'   BALL '+ballOn,W/2,60,13,PAL.txt);
}
function drawJoyOld(){if(!IN.down||G.st!=='live')return;X.globalAlpha=.5;X.strokeStyle=PAL.cy;X.lineWidth=3;X.beginPath();X.arc(IN.sx,IN.sy,50,0,7);X.stroke();X.fillStyle=PAL.cy;X.beginPath();X.arc(IN.sx+IN.jx*50,IN.sy+IN.jy*50,18,0,7);X.fill();X.globalAlpha=1}
function stars(){for(let i=0;i<60;i++){const x=(i*97)%W,y=(i*53+G.t*10*(1+i%3))%H;rect(x,y,2,2,i%5?'#3a2a6a':PAL.cy)}}
function sun(cy){for(let i=0;i<14;i++){const y=cy-70+i*10;const w=Math.sqrt(Math.max(0,70*70-(y-cy)*(y-cy)))*2;if(i>7&&i%2)continue;rect(W/2-w/2,y,w,8,i<5?PAL.yel:i<9?'#ff8a1f':PAL.pink)}}
function render(){
 X.setTransform(DPR,0,0,DPR,0,0);X.save();if(window.PROJ&&G.st!=='title'&&G.st!=='team'){X.clearRect(0,0,W,H)}
 if(!window.PROJ||G.st==='title'||G.st==='team')rect(0,0,W,H,PAL.bg);
 if(G.st==='title'){const sg=X.createLinearGradient(0,0,0,H);sg.addColorStop(0,'#0b0a26');sg.addColorStop(.45,'#3a1f6e');sg.addColorStop(.62,'#c2457c');sg.addColorStop(.66,'#1a0f33');sg.addColorStop(1,'#07051a');X.fillStyle=sg;X.fillRect(0,0,W,H);stars();
  for(let i=0;i<6;i++){X.save();X.translate(i<3?-20:W+20,120);X.rotate((i<3?1:-1)*(0.5+i%3*0.18));const lg=X.createLinearGradient(0,0,0,700);lg.addColorStop(0,'rgba(255,240,200,.28)');lg.addColorStop(1,'rgba(255,240,200,0)');X.fillStyle=lg;X.beginPath();X.moveTo(-6,0);X.lineTo(6,0);X.lineTo(70,700);X.lineTo(-70,700);X.fill();X.restore()}
  sun(470);for(let i=0;i<11;i++){const y=556+i*i*2.6;rect(0,y,W,2,'rgba(255,79,163,.8)')}for(let i=-9;i<=9;i++){X.strokeStyle='rgba(255,79,163,.7)';X.lineWidth=1.5;X.beginPath();X.moveTo(W/2+i*12,556);X.lineTo(W/2+i*90,H);X.stroke()}
  const bob=Math.sin(G.t*2)*3;HELM.drawHelmet(X,96,430+bob,150,TEAMS[0],false,0);HELM.drawHelmet(X,W-96,430-bob,150,TEAMS[1],true,1);
  X.save();X.translate(W/2,190);X.rotate(-0.05);X.textAlign='center';X.textBaseline='middle';X.font='900 64px "Arial Black", Arial';X.lineJoin='round';
  for(const [word,yy,c1,c2] of [['PIXEL',-36,'#ffe14f','#ff8a1f'],['BLITZ',30,'#ff7ac0','#e8344e']]){X.lineWidth=14;X.strokeStyle='#160b30';X.strokeText(word,0,yy+4);X.lineWidth=10;X.strokeStyle='#fff';X.strokeText(word,0,yy);const gg=X.createLinearGradient(0,yy-28,0,yy+28);gg.addColorStop(0,c1);gg.addColorStop(1,c2);X.fillStyle=gg;X.fillText(word,0,yy);X.fillStyle='rgba(255,255,255,.35)';X.fillRect(-150,yy-26,300,3)}
  X.restore();pill(W/2-92,262,184,24,'rgba(20,26,60,.85)','#3fd0ff');txt('ARCADE GRIDIRON',W/2,274,12,'#bfeaff','center',false);
  const pu=1+Math.sin(G.t*4)*.04;X.save();X.translate(W/2,720);X.scale(pu,pu);btn(-110,-28,220,56,'TAP TO START','#ff4f7a','#ffd0dc',20);X.restore();txt('(C) 2026 LOCK IN LABS',W/2,808,10,'#8a7ab0','center',false);X.restore();return}
 if(G.st==='team'){stars();txt('PICK YOUR TEAM',W/2,140,24,PAL.yel);TEAMS.forEach((t,i)=>{const y=170+i*70;box(30,y,W-60,58,G.home===i?'#2a1450':'#120a24',G.home===i?PAL.yel:'#5a4a8a');HELM.drawHelmet(X,72,y+30,58,t,false,i);txt(t.n,112,y+22,16,PAL.txt,'left');txt(['OFF 82  DEF 74','OFF 76  DEF 85','OFF 88  DEF 68','OFF 79  DEF 80'][i],112,y+42,11,PAL.cy,'left')});
  txt('DIFFICULTY',W/2,474,14,PAL.cy);const bw=(W-32)/4;DIFFS.forEach((d,i)=>{const x=16+i*bw;box(x+3,494,bw-6,42,G.diff===i?PAL.pink:'#120a24',G.diff===i?PAL.yel:'#5a4a8a');txt(d.n,x+bw/2,515,d.n.length>5?11:13,PAL.txt)});
  txt('LADDER  '+unlocked()+'/'+MAXLVL+' UNLOCKED',W/2,572,12,PAL.cy);box(40,594,W-80,60,'#120a24',PAL.cy);txt('<',72,624,26,G.lvl>1?PAL.yel:'#3a2a6a');txt('>',W-72,624,26,G.lvl<unlocked()?PAL.yel:'#3a2a6a');
  txt('LEVEL '+G.lvl,W/2,612,18,PAL.yel);txt('VS '+TEAMS[lvlOpp(G.lvl)].n,W/2,636,12,PAL.txt);
  const o=TEAMS[lvlOpp(G.lvl)];rect(W/2-120,680,16,16,o.c1);txt('OPP STRENGTH '+'#'.repeat(G.diff*2+1+Math.floor((G.lvl-1)/3)),W/2+8,688,12,PAL.pink);
  btn(60,744,W-120,52,'KICK OFF','#ff4f7a','#ffd0dc',22);X.restore();return}
 if(window.PROJ){X.clearRect(0,0,W,H);if(G.st==='live'||G.st==='result'||G.st==='presnap'||G.st==='replay'){if(G.st!=='replay'){drawBadges();drawTrail();drawFlash();drawRings();G.parts.forEach(p=>{const q=scr(p.x,p.y,1+p.l*3);X.globalAlpha=Math.min(1,p.l*2);rect(q[0]-2,q[1]-2,p.dust?6:4,p.dust?6:4,p.c);X.globalAlpha=1})}drawHUD2()}}
 else{drawField();
 if(G.st==='live'||G.st==='result'){const ps=[...G.players].sort((a,b)=>b.y-a.y);ps.forEach(drawPlayer);drawBall()}
 G.parts.forEach(p=>rect(sx(p.x),sy(p.y),4,4,p.c));
 drawScoreboard();}
 if(G.st==='select'){const bgg=X.createLinearGradient(0,152,0,H);bgg.addColorStop(0,'rgba(8,10,30,.72)');bgg.addColorStop(1,'rgba(8,10,30,.94)');X.fillStyle=bgg;X.fillRect(0,156,W,H);txt('CALL A PLAY',W/2,188,22,'#ffd23f');
  PLAYS.forEach((p,i)=>{const x=i%2?W/2+5:15,y=208+Math.floor(i/2)*100,w=W/2-20,hh=90;const pr=pressed(x,y,w,hh);const o=pr?2:0;pill(x,y+3,w,hh,'rgba(0,0,0,.4)');pill(x,y+o,w,hh,'#151c42',p.t==='pass'?'#3f9bff':'#ff4f7a');
   drawPlayDiagram(p,x+8,y+o+8,62,hh-16);txt(p.n,x+78+(w-86)/2,y+o+34,12,'#fff','center',false);pill(x+78+(w-86)/2-26,y+o+50,52,16,p.t==='pass'?'#1f6fd6':'#c8324a');txt(p.t==='keep'?'QB RUN':p.t.toUpperCase(),x+78+(w-86)/2,y+o+58,9,'#fff','center',false)});
  pill(15,520,W-30,118,'rgba(20,26,60,.9)','#2b3a7a');txt('LAST PLAYS',W/2,536,10,'#8fb0ff','center',false);G.log.slice(0,4).forEach((l,i)=>txt(l,W/2,558+i*20,12,'#fff','center',false));
  pill(15,648,W-30,74,'rgba(20,26,60,.9)','#2b3a7a');txt('GAME STATS',W/2,664,10,'#8fb0ff','center',false);const s=G.stats;
  [['PASS',s.py],['RUSH',s.ry],['TD',s.td],['INT',s.int],['SACKS',s.sack]].forEach((k,i)=>{const cx=40+i*((W-80)/4);txt(String(k[1]),cx,688,18,'#fff','center',false);txt(k[0],cx,707,9,'#8fb0ff','center',false)})}
 if(G.st==='oppcard'){rect(0,152,W,H,'rgba(10,8,30,.6)');box(30,300,W-60,220,'#120a24',PAL.pink);txt('OPPONENT DRIVE',W/2,336,22,PAL.pink);rect(56,362,W-112,2,'#5a4a8a');txt(G.oppMsg||'',W/2,398,18,PAL.yel);txt(TEAMS[G.home].a+' '+G.sh+'  -  '+G.sa+' '+TEAMS[G.away].a,W/2,440,24,PAL.txt);txt(DIFFS[G.diff].n+'  LVL '+G.lvl+'   Q'+G.q+' '+fmtClock(Math.max(0,G.clock)),W/2,480,12,PAL.cy)}
 if(G.st==='drivecard'){box(30,330,W-60,150,'#120a24',PAL.pink);txt('YOUR BALL',W/2,375,30,PAL.yel);txt('Q'+G.q+'  '+fmtClock(G.clock),W/2,415,16,PAL.cy);txt(G.log[0]||'KICKOFF RETURN TO THE 25',W/2,448,13,PAL.txt)}
 if(G.st==='final'){rect(0,90,W,H,'rgba(10,5,25,.88)');box(30,220,W-60,360,'#120a24',PAL.yel);txt('FINAL',W/2,260,34,PAL.pink);
  txt(TEAMS[G.home].a+' '+G.sh+'  -  '+G.sa+' '+TEAMS[G.away].a,W/2,320,24,PAL.yel);txt(G.sh>G.sa?'VICTORY':G.sh<G.sa?'DEFEAT':'TIE GAME',W/2,370,26,G.sh>=G.sa?PAL.cy:PAL.pink);
  const s=G.stats;txt('PASS YDS  '+s.py,W/2,430,16);txt('RUSH YDS  '+s.ry,W/2,458,16);txt('TOUCHDOWNS  '+s.td,W/2,486,16);txt('INT '+s.int+'   SACKED '+s.sack,W/2,514,16);txt(G.unlockMsg||'',W/2,540,13,PAL.pink);txt('TAP FOR NEW GAME',W/2,564,14,PAL.cy)}
 if(G.msgT>0&&(G.st==='live'||G.st==='presnap')&&!(G.banner&&G.banner.a<2.2)){pill(40,158,W-80,34,'rgba(14,20,48,.88)','#4fa3ff');txt(G.msg,W/2,175,G.msg.length>26?12:18,PAL.yel)}
 {const aa=ease('aud',G.st==='presnap'&&!G.audOpen),ap=ease('aud_p',G.st==='presnap'&&pressed(24,H-120-safeBottom(),72,72));if(aa>0){const e=1-Math.pow(1-aa,3),s=(0.75+0.25*e)*(1-0.08*ap);X.save();X.globalAlpha=e;const ay=H-84-safeBottom();X.translate(60,ay+2*ap);X.scale(s,s);X.translate(-60,-ay);drawAudible();X.restore()}};if(G.st==='presnap'&&G.audOpen)drawAudPanel();
 if(G.paused){const pg=pauseGeom();rect(0,0,W,H,'rgba(8,10,30,.8)');pill(20,128,W-40,470,'#141a3a','#4fa3ff');txt('PAUSED',W/2,164,26,PAL.yel);txt('DIFFICULTY',W/2,192,11,'#9fb3ff');drawDiffRow(pg.diff.x,pg.diff.y,pg.diff.w,pg.diff.h);pill(pg.resume.x,pg.resume.y,pg.resume.w,pg.resume.h,'#1f6fd6','#fff');txt('RESUME',W/2,pg.resume.y+24,18);pill(pg.save.x,pg.save.y,pg.save.w,pg.save.h,'#c9a227','#fff');txt('SAVE & PAUSE',W/2,pg.save.y+24,16);pill(pg.quit.x,pg.quit.y,pg.quit.w,pg.quit.h,'#e8344e','#fff');txt('QUIT TO TITLE',W/2,pg.quit.y+24,15);txt('THROW TYPE COMES FROM YOUR DRAG:',W/2,450,11,'#9fb3ff');txt('SHORT PULL = BULLET   LONG PULL = LOB',W/2,470,11,'#cfd3da');if(G.midNote)txt(G.midNote,W/2,512,14,'#5dff8a');}
 if(!window.PROJ){ if(G.st==='live'&&G.carrier.role!=='QB'||G.st==='live'&&G.play.t==='keep')txt(G.jcd>0?'JUKE RECHARGING':'TAP = JUKE',W/2,H-30,12,G.jcd>0?'#8a7ab0':PAL.cy);
 if(G.st==='live'&&G.carrier.role==='QB'&&G.play.t==='pass'&&!G.thrown){const pr=Math.min(1,G.snapT/4.5);box(20,H-40,W-40,16,'#120a24','#5a4a8a');rect(23,H-37,(W-46)*pr,10,pr>.7?PAL.pink:PAL.cy)}}
 drawControls();X.restore();
}
function pill(x,y,w,h,f,s){X.beginPath();X.roundRect(x,y,w,h,Math.min(14,h/2));X.fillStyle=f;X.fill();if(s){X.lineWidth=2;X.strokeStyle=s;X.stroke()}}
function helmet(x,y,t,flip){// clean side-profile helmet facing toward center (flip=false faces right)
 X.save();X.translate(x,y);if(flip)X.scale(-1,1);const s=1;X.lineJoin='round';
 // shell
 X.beginPath();X.moveTo(-12,6);X.bezierCurveTo(-15,-4,-9,-13,1,-13);X.bezierCurveTo(9,-13,13,-7,13,0);X.lineTo(13,4);X.lineTo(6,4);X.lineTo(5,9);X.lineTo(-6,10);X.closePath();
 X.fillStyle=t.h;X.fill();X.lineWidth=1.5;X.strokeStyle='rgba(0,0,0,.55)';X.stroke();
 // highlight
 X.beginPath();X.moveTo(-8,-6);X.quadraticCurveTo(-5,-11,2,-11.5);X.lineWidth=2;X.strokeStyle='rgba(255,255,255,.45)';X.stroke();
 // ear hole
 X.beginPath();X.arc(-2,1,2.2,0,7);X.fillStyle='rgba(0,0,0,.6)';X.fill();
 // facemask
 X.strokeStyle='#d7dbe2';X.lineWidth=1.8;X.lineCap='round';X.beginPath();X.moveTo(8,-2);X.lineTo(17,-2);X.moveTo(9,3);X.lineTo(17,3);X.moveTo(17,-3);X.lineTo(17,7);X.lineTo(8,8);X.moveTo(13,-2);X.lineTo(13,7);X.stroke();
 X.restore()}
function gear(x,y){X.save();X.translate(x,y);X.scale(.75,.75);pill(-22,-22,44,44,'rgba(20,26,60,.9)','#4fa3ff');X.fillStyle='#fff';for(let i=0;i<8;i++){X.rotate(Math.PI/4);X.fillRect(-3,-14,6,6)}X.beginPath();X.arc(0,0,10,0,7);X.fill();X.fillStyle='#1b2246';X.beginPath();X.arc(0,0,4,0,7);X.fill();X.restore()}
function fmtClock(c){c=Math.ceil(c);return Math.floor(c/60)+':'+String(c%60).padStart(2,'0')}
function pressed(x,y,w,h){const p=IN.press;return p&&(p.down||performance.now()-p.t<140)&&p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h}
function btn(x,y,w,h,label,fill,stroke,sz,sub){const pr=pressed(x,y,w,h);const o=pr?2:0;
 X.save();if(!pr){pill(x,y+4,w,h,'rgba(0,0,0,.45)')}pill(x,y+o,w,h,fill,stroke);const gr=X.createLinearGradient(0,y+o,0,y+o+h);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(.5,'rgba(255,255,255,0)');X.beginPath();X.roundRect(x+2,y+o+2,w-4,h/2,Math.min(12,h/2));X.fillStyle=gr;X.fill();
 txt(label,x+w/2,y+o+h/2-(sub?7:0),sz||16,'#fff','center',true);if(sub)txt(sub,x+w/2,y+o+h/2+11,10,'rgba(255,255,255,.75)','center',false);X.restore()}
function drawTrail(){const T=G.trail;if(!T||!T.length||!G.ball||G.ball.caught)return;let prev=null;T.forEach((p,i)=>{const kk=Math.min(1,p[3]/p[4]);const q=scr(p[0],p[1],p[5]*(1-kk)+1.6*kk+p[2]*0.9);if(prev){X.strokeStyle=`rgba(255,240,200,${(i/T.length)*.7})`;X.lineWidth=1+i/T.length*3;X.beginPath();X.moveTo(prev[0],prev[1]);X.lineTo(q[0],q[1]);X.stroke()}
 if(i%3===0){X.fillStyle=`rgba(255,210,63,${i/T.length})`;X.fillRect(q[0]-1+Math.sin(p[3]*40)*2,q[1]-1+Math.cos(p[3]*40)*2,2,2)}prev=q})}
function drawFlash(){const f=G.flash;if(!f)return;const q=scr(f.x,f.y,2);const k=f.t/0.45;X.save();X.globalAlpha=1-k;X.strokeStyle='#fff';X.lineWidth=4*(1-k)+1;X.beginPath();X.arc(q[0],q[1],8+k*60,0,7);X.stroke();X.strokeStyle='#ffd23f';X.beginPath();X.arc(q[0],q[1],4+k*36,0,7);X.stroke();
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;X.fillStyle='#fff';X.fillRect(q[0]+Math.cos(a)*(10+k*50)-1.5,q[1]+Math.sin(a)*(10+k*50)-1.5,3,3)}X.restore()}
const ROUTES={go:[[0,0],[0,1]],slant:[[0,0],[0,.25],[.45,.7]],out:[[0,0],[0,.55],[-.4,.55]],flat:[[0,0],[-.45,.2]],post:[[0,0],[0,.55],[.4,1]],curl:[[0,0],[0,.7],[.12,.55]],drag:[[0,0],[0,.12],[.7,.22]],corner:[[0,0],[0,.55],[-.4,.95]],block:[[0,0],[0,.1]]};
function drawPlayDiagram(p,x,y,w,h){pill(x,y,w,h,'#0e3a1c','#2a6a3a');X.strokeStyle='rgba(255,255,255,.18)';X.lineWidth=1;for(let i=1;i<4;i++){X.beginPath();X.moveTo(x+4,y+h*i/4);X.lineTo(x+w-4,y+h*i/4);X.stroke()}
 const ly=y+h*.72;X.strokeStyle='#4f8bff';X.lineWidth=2;X.beginPath();X.moveTo(x+4,ly);X.lineTo(x+w-4,ly);X.stroke();
 for(let i=-2;i<=2;i++){X.fillStyle='#dfe6f2';X.beginPath();X.arc(x+w/2+i*6,ly+4,2.4,0,7);X.fill()}
 const cols=['#ff3b3b','#ff8a1f','#ffd400'];const wx=[x+8,x+w-8,x+w*.27];
 if(p.t==='pass'||p.t==='keep'){p.r.forEach((r,i)=>{const pts=ROUTES[r[0]];const sgn=i===1?-1:1;X.strokeStyle=cols[i];X.lineWidth=2.2;X.beginPath();pts.forEach((q,k)=>{const px=wx[i]+q[0]*sgn*w*.35,py=ly-q[1]*h*.62;k?X.lineTo(px,py):X.moveTo(px,py)});X.stroke();X.fillStyle=cols[i];X.beginPath();X.arc(wx[i],ly+4,2.6,0,7);X.fill()})}
 if(p.t!=='pass'){const sx0=x+w/2,sy0=ly+16;const ex=p.t==='sweep'?x+10:x+w/2+(p.t==='keep'?6:0);X.strokeStyle='#fff';X.lineWidth=2.4;X.beginPath();X.moveTo(sx0,sy0);X.quadraticCurveTo(p.t==='sweep'?x+w*.2:sx0,ly,ex,y+h*.18);X.stroke();X.beginPath();X.arc(sx0,sy0,2.8,0,7);X.fillStyle='#fff';X.fill()}}
function drawHUD2(){const h=TEAMS[G.home],a=TEAMS[G.away];
 gear(26,28);
 {X.save();X.beginPath();X.roundRect(8,52,W-16,64,18);const bg=X.createLinearGradient(0,52,0,116);bg.addColorStop(0,'rgba(28,34,72,.97)');bg.addColorStop(1,'rgba(10,13,32,.97)');X.fillStyle=bg;X.fill();X.lineWidth=2;X.strokeStyle='rgba(120,150,255,.35)';X.stroke();
  X.beginPath();X.roundRect(8,52,W-16,64,18);X.clip();rect(8,112,W/2-8,4,h.c1);rect(W/2,112,W/2-8,4,a.c1);X.restore()}
 HELM.drawHelmet(X,52,86,66,h,false,G.home);HELM.drawHelmet(X,W-52,86,66,a,true,G.away);
 txt(h.a,112,70,12,'#c9d4ff','center',false);txt(String(G.sh),112,95,28,'#fff');
 txt(a.a,W-112,70,12,'#c9d4ff','center',false);txt(String(G.sa),W-112,95,28,'#fff');
 pill(W/2-58,30,116,22,'#1f6fd6','#8fc4ff');txt('BLITZ NIGHT',W/2,41,11,'#fff','center',false);
 pill(W/2-17,60,34,18,'#2b3a7a');txt('Q'+G.q,W/2,69,11,'#fff','center',false);
 txt(fmtClock(G.clock),W/2,97,22,G.clock<30?'#ff4d5e':'#fff','center',true);
 const ord=['1ST','2ND','3RD','4TH'][Math.min(G.down,4)-1]||'4TH';const tg=G.los+G.togo>=100?'GOAL':Math.max(1,Math.round(G.togo));
 pill(W/2-56,122,112,28,'rgba(14,18,40,.95)','#2b3a7a');pill(W/2-52,125,46,22,'#ffd23f');txt(ord,W/2-29,136,12,'#141a36','center',false);txt('& '+tg,W/2+24,136,14,'#fff','center',false);
 
 if(G.st==='live'&&G.carrier.role==='QB'&&G.play.t==='pass'&&!G.thrown){const pr=Math.min(1,G.snapT/4.5);pill(20,H-44,112,16,'rgba(16,20,44,.9)');rect(23,H-41,106*pr,10,pr>.7?'#ff4d5e':'#4fa3ff')}
}
const AP_H=228;function audGeom(c,r){const g=8,bw=(W-24-3*g)/4;return[12+c*(bw+g),H-AP_H+54+r*64,bw,54]}
function audBtn(x,y){for(let c=0;c<4;c++)for(let r=0;r<2;r++){const[a,b,w,h]=audGeom(c,r);if(x>=a&&x<=a+w&&y>=b&&y<=b+h)return{c,r}}return null}
function drawAudPanel(){X.beginPath();X.roundRect(0,H-AP_H,W,AP_H+20,22);X.fillStyle='#0f1b3d';X.fill();X.lineWidth=2;X.strokeStyle='#2b3f7a';X.stroke();
 const lc=['#ff2a2a','#ff8a1f','#ffd400'];const wrs=G.players.filter(q=>q.role==='WR');
 lc.forEach((c,i)=>{const x=22+i*86;X.beginPath();X.arc(x,H-AP_H+26,6,0,7);X.fillStyle=c;X.fill();txt('WR'+(i+1),x+12,H-AP_H+27,12,'#fff','left',false)});
 txt('AUDIBLE',W-92,H-AP_H+27,12,'#fff','right',false);txt(G.aud+' LEFT',W-16,H-AP_H+27,12,'#ffd23f','right',false);
 for(let c=0;c<4;c++)for(let r=0;r<2;r++){const[a,b,w,h]=audGeom(c,r);let lab,f='#1c2a52',fc='#fff';
  if(c<3){lab=r?'MEDIUM':'DEEP';const w0=wrs[c];const on=w0&&(r?w0.dk!==1.7:w0.dk===1.7);if(on)f='#2b4a8e';if(G.aud<=0&&!on)fc='#6a7aa0'}else{lab=r?'CLOSE':'CHANGE PLAY';if(!r)f='#1f7bff'}
  pill(a,b,w,h,f,null);txt(lab,a+w/2,b+h/2,lab.length>8?11:13,fc,'center',false)}}
function drawAudible(){const x=60,y=H-84-safeBottom();X.beginPath();X.arc(x,y,36,0,7);X.fillStyle='#16224e';X.fill();X.lineWidth=4;X.strokeStyle='#4fa3ff';X.stroke();
 X.fillStyle='#fff';X.beginPath();X.moveTo(x-14,y-10);X.lineTo(x+6,y-20);X.lineTo(x+6,y+4);X.lineTo(x-14,y-4);X.closePath();X.fill();X.fillRect(x-18,y-10,5,6);
 txt('AUDIBLE',x,y+18,10,'#fff','center',false);X.beginPath();X.arc(x+26,y-30,12,0,7);X.fillStyle='#ffd23f';X.fill();txt(String(G.aud),x+26,y-30,13,'#141a36','center',false)}
function drawBadges(){/* v29: removed floating OVR pills (read as detached jersey numbers) */}

function ease(k,on){const a=G.ua||(G.ua={});const v=a[k]??0,tg=on?1:0;let nv=v+(tg-v)*0.2;if(Math.abs(nv-tg)<0.02)nv=tg;a[k]=nv;return nv}
function rbtn(k,on,x,y,r,fill,stroke,label,icon){const a=ease(k,on);if(a<=0)return;const pr=on&&pressed(x-r,y-r,2*r,2*r);const ps=ease(k+'_p',pr);const e=1-Math.pow(1-a,3);const s=(0.7+0.3*e)*(1-0.08*ps);X.save();X.globalAlpha=e;X.translate(x,y);X.scale(s,s);X.translate(-x,-y);
 // Identical plate + chunky pixel font as SNAP
 if(window.arcRound){arcRound(x,y+2*ps,Math.max(28,r),fill,pr,label,14,icon?()=>{X.translate(0,4);icon()}:null)}
 else{txt(label,x,y,12,'#fff')}X.restore()}
function drawActionButtons(){const live=G.st==='live'&&!G.paused;const cm=cornerBtn();
 // Full plate every frame. arcade rbtn scales 0.7→1 and that pop is what
 // made DIVE/JUKE/TRUCK look half-size the moment TUCK toggled.
 const plate=(on,x,y,fill,label)=>{if(!on)return;const pr=pressed(x-ACT_R,y-ACT_R,ACT_R*2,ACT_R*2);
  if(window.arcRound)arcRound(x,y,ACT_R,fill,!!pr,label,13);else txt(label,x,y,12,'#fff')};
 plate(cm==='tuck',TB.x,TB.y,G.tuck?'#ff8a1f':'#2a56d6',G.tuck?'TUCKED':'TUCK');
 plate(cm==='slide',TB.x,TB.y,'#148a45','SLIDE');
 plate(cm==='truck',TB.x,TB.y,G.truck?'#ffb03a':'#e07a12','TRUCK');
 const carB=live&&(G.tuck||!passerPhase()||cm==='slide'||cm==='truck')&&!G.pend&&(!G.ball||G.ball.caught)&&G.carrier&&G.carrier.team===0&&!(G.carrier.fallen>0)&&!(G.carrier.slide>0);
 const jr=Math.max(0,G.jcd||0)/0.75; plate(carB,JB.x,JB.y,jr>0?'#4a3a7a':'#7a3cff','JUKE');
 if(carB&&jr>0){X.save();X.lineWidth=4;X.strokeStyle='#e2d4ff';X.beginPath();X.arc(JB.x,JB.y,ACT_R+6,-Math.PI/2,-Math.PI/2+(1-jr)*Math.PI*2);X.stroke();X.restore()}
 plate(carB&&!G.cdive&&!(G.carrier&&G.carrier.dive>0),DB.x,DB.y,'#e8344e','DIVE')}
function drawControls(){drawActionButtons();if(!window.PROJ)return;const live=G.st==='live';
 {const sa=ease('snap',G.st==='presnap'&&!G.audOpen);if(sa>0){X.save();X.globalAlpha=1-Math.pow(1-sa,3);const x=W-64,y=H-84-safeBottom();X.translate(x,y);X.scale(0.75+0.25*X.globalAlpha,0.75+0.25*X.globalAlpha);X.translate(-x,-y);const pr=pressed(x-44,y-44,88,88);arcRound(x,y,44,'#22c25a',pr,'SNAP',18);if(G.ovT>0&&G.st==='presnap')txt('ROUTE VIEW',W/2,H-150,12,'#fff');X.restore()}}
 if(live&&G.ball&&!G.ball.caught){const b=G.ball,k=Math.min(1,b.t/b.T);const sh=scr(b.x,b.y,0.02);X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(sh[0],sh[1],7+b.z*0.6,3.5+b.z*0.3,0,0,7);X.fill();
  const fz=b.fz*(1-k)+0.7,wb=Math.sin(G.t*9)*0.5*(1-k),wc=Math.cos(G.t*7)*0.5*(1-k);X.beginPath();for(let i=0;i<=24;i++){const an=i/24*Math.PI*2,q=scr(b.tx+wb+Math.cos(an)*fz,b.ty+wc+Math.sin(an)*fz,0.05);i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])}X.fillStyle='rgba(255,255,255,'+(0.12+k*0.18)+')';X.fill();X.setLineDash([5,5]);X.strokeStyle='rgba(255,255,255,'+(0.4+k*0.5)+')';X.lineWidth=2;X.stroke();X.setLineDash([]);
  if(b.tt&&b.t<0.6)txt(b.tt.toUpperCase()+'!',W/2,H*0.3,18,b.tt==='bomb'?'#ff4d5e':b.tt==='lob'?'#3fd0ff':'#ffd23f')}
 if(live&&passerPhase()&&!G.adv)for(const p of PT.values())if(p.kind==='thr'&&p.w){const ht=(performance.now()-p.t0)/1000,ty=holdType(ht),[bx,by]=bubblePos(p.w),f=Math.min(1,ht/1.1);X.lineWidth=7;X.strokeStyle='rgba(0,0,0,.5)';X.beginPath();X.arc(bx,by,31,-Math.PI/2,Math.PI*1.5);X.stroke();X.strokeStyle=ty==='bomb'?'#ff4d5e':ty==='lob'?'#3fd0ff':'#ffd23f';X.beginPath();X.arc(bx,by,31,-Math.PI/2,-Math.PI/2+f*Math.PI*2);X.stroke();txt(ty.toUpperCase(),bx,by-46,13,X.strokeStyle)}
 if(live&&!G.adv&&G.play&&G.play.t==='pass'&&G.carrier===G.qb&&!G.pend&&!G.ball&&G.st==='live'&&passerPhase()){
  let lk=[0,0],rk=[0,0],rp=null;for(const p of PT.values()){if(p.kind==='ljoy'){let dx=p.x-LJ.x,dy=p.y-LJ.y,d=Math.hypot(dx,dy);if(d>LMAX){dx*=LMAX/d;dy*=LMAX/d}lk=[dx,dy]}if(p.kind==='rthr'){let dx=p.x-STK.x,dy=p.y-STK.y,d=Math.hypot(dx,dy);if(d>STK.r){dx*=STK.r/d;dy*=STK.r/d}rk=[dx,dy];rp=p}}
  if(!lk[0]&&!lk[1]&&(IN.jx||IN.jy))lk=[IN.jx*LMAX,IN.jy*LMAX];
  const stick=(c,k,col,lab)=>{
   if(window.arcRound){arcRound(c.x,c.y,c.r-2,'#1a2350',Math.hypot(k[0],k[1])>6,lab,14);
    X.beginPath();X.arc(c.x+k[0],c.y+k[1],18,0,7);X.fillStyle=col;X.fill();X.lineWidth=3;X.strokeStyle='#0b0614';X.stroke()}
   else{X.beginPath();X.arc(c.x,c.y,c.r,0,7);X.fillStyle='rgba(10,14,36,.55)';X.fill();X.lineWidth=4;X.strokeStyle=col;X.stroke();X.beginPath();X.arc(c.x+k[0],c.y+k[1],24,0,7);X.fillStyle=col;X.fill();txt(lab,c.x,c.y+c.r+16,11,'#fff','center',false)}};
  stick(LJ,lk,'#ffffff','');
  if(0)stick(STK,rk,G.tuck?'#ff8a1f':'#3fd0ff',G.tuck?'TUCKED - PUSH TO THROW':'THROW');
  if(0){const wrs=G.players.filter(q=>q.role==='WR');const RC=['#ff2a2a','#ff8a1f','#ffd400'];const sel=rp&&rp.w;
   for(const w of targets()){if(w===G.rb)continue;const a=tgtAngle(w),i=wrs.indexOf(w),ix=STK.x+Math.cos(a)*(STK.r+20),iy=STK.y+Math.sin(a)*(STK.r+20);X.beginPath();X.arc(ix,iy,sel===w?15:12,0,7);X.fillStyle=RC[i]||'#fff';X.fill();X.lineWidth=sel===w?4:2;X.strokeStyle=sel===w?'#fff':openCol(w);X.stroke();txt(String(i+1),ix,iy+1,11,'#0a0e24','center',false)}
   txt('TUCK',STK.x,STK.y+STK.r-12,10,'#ffb36b','center',false);
   if(sel){const s=scr(sel.x,sel.y,0.05);X.lineWidth=4;X.strokeStyle='#fff';X.beginPath();X.ellipse(s[0],s[1],22,9,0,0,7);X.stroke();const ht=rp.tm?(performance.now()-rp.tm)/1000:0,ty=holdType(ht);txt(ty.toUpperCase(),STK.x,STK.y+STK.r+34,14,ty==='bomb'?'#ff4d5e':ty==='lob'?'#3fd0ff':'#ffd23f');X.lineWidth=6;X.strokeStyle=ty==='bomb'?'#ff4d5e':ty==='lob'?'#3fd0ff':'#ffd23f';X.beginPath();X.arc(STK.x,STK.y,STK.r+4,-Math.PI/2,-Math.PI/2+Math.min(1,ht/1.1)*Math.PI*2);X.stroke()}
   if(rp&&rp.tuckZ)txt('RELEASE TO TUCK',STK.x,STK.y+STK.r+34,11,'#ffb36b')}
  X.globalAlpha=1}
  if(live&&passerPhase()&&!G.adv&&!G.pend){const tg=targets();tg.forEach((w,i)=>{const c=openCol(w),[bx,by]=bubblePos(w),pr=pressed(bx-24,by-24,48,48);
  
  if(w===G.rb){G.hoA=canHand()?1:Math.max(0,(G.hoA||0)-0.2);if(G.hoA>0){const g=handoffGeom(),pr=pressed(g.x,g.y,g.w,g.h);X.globalAlpha=G.hoA;drawHandoffPill(g.x,g.y+(pr?1:0),g.w,g.h);X.globalAlpha=1}}else{const f=scr(w.x,w.y,0.05);X.globalAlpha=.7;X.beginPath();X.ellipse(f[0],f[1],13,5,0,0,7);X.lineWidth=2;X.strokeStyle=c;X.stroke();X.globalAlpha=1}
  const[ix,iy]=iconPos(i),ip=pressed(ix-22,iy-22,44,44);X.beginPath();X.arc(ix,iy+(ip?2:0),21,0,7);X.fillStyle=c;X.fill();X.lineWidth=3;X.strokeStyle='#0a0e24';X.stroke();txt(w.role==='RB'?'RB':'WR'+(G.players.filter(q=>q.role==='WR').indexOf(w)+1),ix,iy-3+(ip?2:0),10,'#0a0e24','center',false);txt(String(w.num),ix,iy+9+(ip?2:0),11,'#0a0e24','center',false)});
  
  let jd=false;for(const p of PT.values())if(p.kind==='joy'){jd=true;let dx=p.x-p.sx,dy=p.y-p.sy,d=Math.hypot(dx,dy);if(d>JMAX){dx*=JMAX/d;dy*=JMAX/d}X.beginPath();X.arc(p.sx,p.sy,50,0,7);X.fillStyle='rgba(255,255,255,.12)';X.fill();X.lineWidth=3;X.strokeStyle='#fff';X.stroke();X.beginPath();X.arc(p.sx+dx,p.sy+dy,22,0,7);X.fillStyle='#fff';X.fill()}
  if(!jd&&G.adv){X.globalAlpha=.35;X.setLineDash([6,6]);X.beginPath();X.arc(80,H-150,46,0,7);X.lineWidth=3;X.strokeStyle='#fff';X.stroke();X.setLineDash([]);X.globalAlpha=1}}
 if(live){for(const p of PT.values())if(p.kind==='joy'){X.globalAlpha=.14;X.strokeStyle='#fff';X.lineWidth=3;X.beginPath();X.arc(p.sx,p.sy,50,0,7);X.stroke();X.globalAlpha=1}
  if(G.aim){const c=G.carrier,a=G.aim,d0=Math.hypot(a.tx-c.x,a.ty-c.y),h=arcH(d0,a.ty2),col=a.ok?'#5fb4ff':'#ff4d5e';const pts=[];for(let i=0;i<=40;i++){const k=i/40;pts.push(scr(c.x+(a.tx-c.x)*k,c.y+(a.ty-c.y)*k,3.1*(1-k)+1.6*k+Math.sin(k*Math.PI)*h*0.9))}
   const path=()=>{X.beginPath();pts.forEach((q,i)=>i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1]))};X.lineCap='butt';X.setLineDash([9,7]);X.lineDashOffset=-(G.t*40)%16;path();X.strokeStyle='rgba(0,0,0,.45)';X.lineWidth=5;X.stroke();path();X.strokeStyle=col;X.lineWidth=3;X.stroke();X.setLineDash([]);
   const ring=(x,y,r)=>{X.beginPath();for(let i=0;i<=24;i++){const an=i/24*Math.PI*2,q=scr(x+Math.cos(an)*r,y+Math.sin(an)*r,0.05);i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])}};
   {const q=scr(a.tx,a.ty,0.05);const lab=a.ty2==='bullet'?'BULLET':a.ty2==='bomb'?'DEEP LOB':'LOB';if(window.arcTxt)arcTxt(lab,q[0],Math.max(q[1]+22,160),14,[a.ok?'#cfe6ff':'#ffb3bb','#fff'],{out:'#0b0614',px:true,rim:false,shine:false});else txt(lab,q[0],Math.max(q[1]+22,160),11,a.ok?'#cfe6ff':'#ffb3bb')}ring(a.tx,a.ty,1.6);X.strokeStyle='rgba(0,0,0,.5)';X.lineWidth=5;X.stroke();X.strokeStyle=col;X.lineWidth=3;X.stroke();
   if(0&&a.lock){ring(a.lock.x,a.lock.y,2.4);X.setLineDash([6,5]);X.strokeStyle='#ffd23f';X.lineWidth=3;X.stroke();X.setLineDash([]);const q=scr(a.lock.x,a.lock.y,5.4);txt('LOCK',q[0],q[1],11,'#ffd23f')}}
  const runner=!passerPhase()&&!G.pend&&(!G.ball||G.ball.caught)&&G.carrier;
  if(runner&&G.carrier.team===0&&G.play.t!=='ko_'){let kx=IN.jx*LMAX,ky=IN.jy*LMAX;const ua=ease('rstk',true);X.save();X.globalAlpha=ua;
   if(window.arcRound){arcRound(LJ.x,LJ.y,LJ.r-2,'#1a2350',Math.hypot(kx,ky)>6,'',14);
    X.beginPath();X.arc(LJ.x+kx,LJ.y+ky,20,0,7);X.fillStyle='#fff';X.fill();X.lineWidth=3;X.strokeStyle='#0b0614';X.stroke()}
   else{X.beginPath();X.arc(LJ.x,LJ.y,LJ.r,0,7);X.fillStyle='rgba(10,14,36,.55)';X.fill();X.lineWidth=4;X.strokeStyle='#ffffff';X.stroke();
    X.beginPath();X.arc(LJ.x+kx,LJ.y+ky,24,0,7);X.fillStyle='#fff';X.fill();X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.5)';X.stroke()}
   X.restore();
   const bx=20,by=H-46,bw=170;pill(bx,by,bw,18,'rgba(16,20,44,.9)','#ffd23f');rect(bx+3,by+3,(bw-6)*G.stam,12,G.truck?'#ff4d5e':G.stam<.25?'#ff8a1f':'#3fd07a');
   txt('STAMINA',bx+bw/2,by+28,10,'#cfd3da')}else ease('rstk',false)}
 if(G.ko&&G.st==='live')btn(16,H-112,104,52,'TOUCHBACK','#e8344e','#ffd0d6',13);
 if(G.st==='presnap'&&!G.audOpen&&G.play){pill(W/2-90,156,180,26,'rgba(10,14,36,.8)','#ffd23f');txt(G.play.n,W/2,169,13,'#ffd23f','center',false)}if(G.st==='replay'){const g=skipReplayGeom();if(window.bevPanel)bevPanel(g.x,g.y,g.w,g.h,'#141a3a',{c:14,edge:'#ffd23f',drop:4});else pill(g.x,g.y,g.w,g.h,'#141a3a','#ffd23f');if(window.arcTxt)arcTxt('SKIP REPLAY',g.x+g.w/2,g.y+g.h/2+1,15,['#fff6c8','#ffd23f'],{px:true,rim:false,shine:false,sk:0.1});else txt('SKIP REPLAY',g.x+g.w/2,g.y+g.h/2,14,'#ffd23f')}if(G.banner&&(G.st==='result'||G.st==='live'||G.st==='presnap'||G.st==='fg'||G.st==='patpick')&&G.banner.a<2.2)drawCallout();
 if(G.hint&&!G.paused&&G.st!=='replay'){const L=G.hint.txt.split('|');const y=118;pill(16,y,W-32,22+L.length*16,'rgba(10,14,36,.94)','#3fd0ff');uiTxt('TIP',28,y+12,11,'#3fd0ff','left',false);L.forEach((l,i)=>uiTxt(l,W/2,y+14+i*16,12,'#fff','center',false))}}

let last=performance.now();let acc=0;
function snapPrev(){const P=G.players;if(P)for(let i=0;i<P.length;i++){const p=P[i];p._px=p.x;p._py=p.y}const b=G.ball;if(b){b._px=b.x;b._py=b.y;b._pz=b.z;b._pt=b.t}}
function drawLerp(al){const P=G.players;if(P)for(let i=0;i<P.length;i++){const p=P[i];p._cx=p.x;p._cy=p.y;if(p._px!==undefined&&Math.abs(p.x-p._px)+Math.abs(p.y-p._py)<4){p.x=p._px+(p.x-p._px)*al;p.y=p._py+(p.y-p._py)*al}}const b=G.ball;if(b){b._cx=b.x;b._cy=b.y;b._cz=b.z;b._ct=b.t;if(b._px!==undefined&&b._pt<=b.t){b.x=b._px+(b.x-b._px)*al;b.y=b._py+(b.y-b._py)*al;b.z=b._pz+(b.z-b._pz)*al;b.t=b._pt+(b.t-b._pt)*al}}
 const Lb=G.loose;let lx=0,ly=0;if(Lb){lx=Lb.x;ly=Lb.y;Lb.x=Lb._px+(lx-Lb._px)*al;Lb.y=Lb._py+(ly-Lb._py)*al}window.__fdt=G._fdt;if(window.R3D)window.R3D();render();if(Lb){Lb.x=lx;Lb.y=ly}
 if(P)for(let i=0;i<P.length;i++){const p=P[i];p.x=p._cx;p.y=p._cy}if(b){b.x=b._cx;b.y=b._cy;b.z=b._cz;b.t=b._ct}}
function frameStep(dt){acc+=dt;let s=0;while(acc>=1/60&&s<6){const ts=G.tsT>0?0.45:1;if(G.tsT>0)G.tsT-=1/60;snapPrev();update(ts/60);acc-=1/60;s++}if(s>=6)acc=0;G._fdt=dt;drawLerp(Math.min(1,acc*60))}
window.__frame=frameStep;
function loop(n){const dt=Math.min(0.1,(n-last)/1000);last=n;if(!window.__hold){frameStep(dt)}else{window.__fdt=undefined;if(window.R3D)window.R3D();render()}requestAnimationFrame(loop)}requestAnimationFrame(loop);
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__step=(s,n=1)=>{for(let i=0;i<n;i++)update(s);if(window.R3D)window.R3D();render()};
