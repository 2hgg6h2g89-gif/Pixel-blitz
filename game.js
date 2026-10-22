'use strict';
const C=document.getElementById('c'),X=C.getContext('2d');const DPR=Math.min(3,window.devicePixelRatio||1);C.width=390*DPR;C.height=844*DPR;X.imageSmoothingEnabled=false;
const W=390,H=844,PPY=7.3; // px per yard
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
let G={diff:1,lvl:1,clock:QLEN,aud:4,paused:false,st:'title',t:0,home:0,away:1,sh:0,sa:0,q:1,drive:0,maxDrives:8,los:25,down:1,togo:10,msg:'',msgT:0,sel:0,players:[],ball:null,carrier:null,stats:{py:0,ry:0,td:0,int:0,sack:0},log:[],juke:0,jcd:0,cam:0,snapT:0,shake:0,parts:[]};
window.G=G;G.bulletPref=localStorage.getItem('pb_bullet')!=='0';G.adv=false;
// ---------- input ----------
const IN={jx:0,jy:0,taps:[],keyp:[],flick:0,truck:false,sprint:false,aimP:null};
function pos(e){const r=C.getBoundingClientRect();const p=e.touches?e.touches[0]||e.changedTouches[0]:e;return[(p.clientX-r.left)*W/r.width,(p.clientY-r.top)*H/r.height]}
const JB={x:W-150,y:H-130},DB={x:W-62,y:H-200},TB={x:56,y:H-262},BB={x:116,y:H-262};const PT=new Map(),STK={x:W-84,y:H-170,r:56},LJ={x:84,y:H-170,r:56};
function ptsOf(e){const r=C.getBoundingClientRect();const L=e.changedTouches?[...e.changedTouches]:[e];return L.map(p=>({id:e.changedTouches?p.identifier:'m',x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}))}
function kindFor(x,y){if(G.st!=='live'||G.paused)return'tap';if(x<52&&y<50)return'tap';
 if(G.play&&G.play.t==='ko'&&G.ko&&x<120&&y>H-140)return'tap';
 if(passerPhase()){if(Math.hypot(x-TB.x,y-TB.y)<28)return'tuckb';if(Math.hypot(x-BB.x,y-BB.y)<28)return'bulb';for(const p of PT.values())if(p.kind==='aim')return'tog';if(x<W*0.4||Math.hypot(x-LJ.x,y-LJ.y)<100)return'ljoy';return'aim';if(Math.hypot(x-LJ.x,y-LJ.y)<95)return'ljoy';if(Math.hypot(x-STK.x,y-STK.y)<95)return'rthr';return'tap'}
 if(Math.hypot(x-JB.x,y-JB.y)<44)return'jukeb';if(Math.hypot(x-DB.x,y-DB.y)<44)return'diveb';return x<W/2?'ljoy':'tap'}
let PT_W=null;
function pd(e){e.preventDefault();for(const q of ptsOf(e)){IN.press={x:q.x,y:q.y,t:performance.now(),down:true};if(q.id==='m'&&e.button>0)continue;PT.set(q.id,{...q,sx:q.x,sy:q.y,t0:performance.now(),kind:kindFor(q.x,q.y),moved:0,w:PT_W});PT_W=null;const k=PT.get(q.id);if(k&&k.kind==='tog'){G.bullet=!G.bullet;say(G.bullet?'BULLET':'LOB',0.6)}if(k&&k.kind==='jukeb')IN.jk=1;if(k&&k.kind==='diveb')IN.dv=1;if(k&&k.kind==='bulb'){G.bulletPref=!G.bulletPref;G.bullet=G.bulletPref;localStorage.setItem('pb_bullet',G.bulletPref?'1':'0')}if(k&&k.kind==='tuckb'){G.tuck=!G.tuck;say(G.tuck?'TUCKED':'READY TO THROW',0.7)}}}
function pm(e){e.preventDefault();for(const q of ptsOf(e)){const p=PT.get(q.id);if(!p)continue;p.moved=Math.max(p.moved,Math.hypot(q.x-p.sx,q.y-p.sy));p.x=q.x;p.y=q.y;
 if(p.kind==='rthr'&&!p.tm&&Math.hypot(p.x-STK.x,p.y-STK.y)>14)p.tm=performance.now();
 if(p.kind==='joy'){let dx=p.x-p.sx,dy=p.y-p.sy,d=Math.hypot(dx,dy);if(d>50){p.sx=p.x-dx/d*50;p.sy=p.y-dy/d*50}}}}
function pu(e){e.preventDefault();if(IN.press){IN.press.down=false;IN.press.t=performance.now()}for(const q of ptsOf(e)){const p=PT.get(q.id);if(!p)continue;PT.delete(q.id);const dt=performance.now()-p.t0;
 if(p.kind==='thr'){IN.thr={w:p.w,ht:dt/1000};continue}
 if(p.kind==='rthr'){const r=stickRead(p);if(r.tuck){IN.tuck=true}else if(r.w){IN.thr={w:r.w,ht:Math.max(0,(performance.now()-(p.tm||p.t0))/1000)}}continue}
 if(p.kind==='aim'){if(G.aim&&p.moved>22)G.relAim=true;else if(p.moved>=14)continue}
 if(p.kind==='act'&&dt<260&&p.moved>22){IN.flick=Math.sign(q.x-p.sx)||1;continue}
 if(dt<300&&p.moved<14)IN.taps.push([q.x,q.y])}}
C.addEventListener('touchstart',pd,{passive:false});C.addEventListener('touchmove',pm,{passive:false});C.addEventListener('touchend',pu,{passive:false});C.addEventListener('touchcancel',pu,{passive:false});
C.addEventListener('mousedown',pd);addEventListener('mousemove',pm);addEventListener('mouseup',pu);
const KEYS={};addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(!KEYS[k])IN.keyp.push(k);KEYS[k]=1;if(k===' ')e.preventDefault()});addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;KEYS[k]=0});
function readSticks(){let jx=0,jy=0,truck=false,aimP=null,sprintStick=false;const now=performance.now();
 for(const p of PT.values()){
  if(p.kind==='ljoy'){let dx=p.x-LJ.x,dy=p.y-LJ.y,d=Math.hypot(dx,dy);if(d>LJ.r){dx=dx/d*LJ.r;dy=dy/d*LJ.r;d=LJ.r}if(d>8){jx=dx/LJ.r;jy=dy/LJ.r}}
  else if(p.kind==='rthr'){const r=stickRead(p);p.w=r.w;p.tuckZ=r.tuck}
  else if(p.kind==='joy'){const dx=p.x-p.sx,dy=p.y-p.sy,d=Math.hypot(dx,dy);if(d>6){jx=dx/50;jy=dy/50}}
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
function setupPlay(p){
 G.play=p;const L=G.los,cx=FIELDW/2;const P=[];
 const qb=mk(0,'QB',cx,L-(p.t==='run'||p.t==='sweep'?4:5),7);qb.hasBall=1;P.push(qb);
 const rb=mk(0,'RB',cx+(p.t==='sweep'?-2:0),L-7.5,22);P.push(rb);
 const OLN=[72,65,60,66,77];for(let i=-2;i<=2;i++)P.push(mk(0,'OL',cx+i*3.0,L-1.0,OLN[i+2]));
 const wxs=[cx-12.5,cx+12.5,cx-8];
 p.r.forEach((r,i)=>{const w=mk(0,'WR',wxs[i],L-1,[11,84,3][i]);w.route=r[0];w.dir=r[1]*(i===1?-1:1)*(wxs[i]<cx?1:-1);w.rt=0;P.push(w)});
 const DLN=[94,97,92,99];[-4.5,-1.5,1.5,4.5].forEach((o,k)=>P.push(mk(1,'DL',cx+o,L+1.6,DLN[k])));
 P.push(mk(1,'LB',cx-5,L+6,50));P.push(mk(1,'LB',cx+5,L+6,54));
 const wr=P.filter(q=>q.role==='WR');wr.forEach((w,i)=>{const d=mk(1,'CB',w.x+(w.x<cx?-1:1)*(0.6+G.diff*0.2),L+6.5,20+i);d.man=w;P.push(d)});
 {const late=G.q>=4&&G.clock<120||G.q===2&&G.clock<120,lead=G.sa>G.sh;let pb=G.togo<=2||L>=95?0.55:(G.down>=3&&G.togo>=7)?0.15:(late&&lead)?0.08:0.3;pb+=G.diff*0.04;const lbs=P.filter(q=>q.role==='LB');let n=0;lbs.forEach(l=>{l.blitz=false;l.spy=false;if(Math.random()<pb&&(n===0||Math.random()<0.25)){l.blitz=true;n++}});const sit=lbs.filter(l=>!l.blitz);if(sit.length&&Math.random()<(G.down>=3?0.5:0.25))sit[0].spy=true;G.blitzN=n}
 P.push(mk(1,'S',cx-9,L+13,31));P.push(mk(1,'S',cx+9,L+13,33));
 {const ols=P.filter(q=>q.role==='OL'),used=new Set();P.filter(q=>q.role==='DL').forEach(d=>{let b=null,bd=1e9;ols.forEach(o=>{if(used.has(o))return;const dd=Math.abs(o.x-d.x);if(dd<bd){bd=dd;b=o}});used.add(b);d.blk=b;b.blk=d;d.shedT=(p.t==='pass'?rnd(2.4,3.6):rnd(0.9,1.8))*DIFFS[G.diff].shed})}
 G.celeb=false;G.players=P;G.qb=qb;G.rb=rb;G.carrier=qb;G.ball=null;G.snapT=0;G.cam=L;G.juke=0;G.jcd=0;G.thrown=false;G.passer=true;
 G.st='presnap';G.handed=false;G.audOpen=false;G.pend=null;buildRoutesG();G.routeVer=(G.routeVer||0)+1;G.ovT=1.0;G.ko=false;hint('snap','ROUTES SHOWN FROM ABOVE|TAP SNAP TO START|AUDIBLE TO CHANGE IT UP');;
}
function buildRoutesG(){G.routes=G.players.filter(q=>q.role==='WR').map((w,i)=>w.route==='block'?null:Object.assign(simRoute(w),{i})).filter(Boolean);if(G.play&&G.play.t==='pass'&&G.rb&&G.qb){const r=G.rb,q=G.qb,pts=[];const P0=[[r.x,r.y],[q.x+1.4,q.y-0.6],[q.x+1.8,G.los+1],[q.x+2.4,G.los+5]];for(let s=0;s<3;s++)for(let k=0;k<6;k++){const u=k/6,A=P0[s],B=P0[s+1];pts.push([A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u])}pts.push(P0[3]);G.routes.push({w:r,pts,i:3})}G.routeVer=(G.routeVer||0)+1}
function setDepth(i,lv){const deep=lv===0;const w=G.players.filter(q=>q.role==='WR')[i];if(!w||G.aud<=0)return;
 if(deep){w.route={flat:'corner',drag:'post',block:'go',curl:'go',slant:'post',out:'corner'}[w.route]||w.route;w.dk=1.7}
 else if(lv===1){w.route={go:'curl',post:'curl',corner:'out',block:'curl',flat:'out',drag:'slant'}[w.route]||w.route;w.dk=1.15}
 else{w.route={go:'slant',post:'slant',corner:'out',block:'flat',curl:'drag',out:'flat'}[w.route]||w.route;w.dk=0.7}
 G.aud--;buildRoutesG();G.ovT=0.8;say(['DEEP','MEDIUM','SHORT'][lv]+' - WR'+(i+1),1)}
function simRoute(w){const c={x:w.x,y:w.y,vx:0,vy:0,rt:0,route:w.route,dir:w.dir,dk:w.dk};const pts=[[c.x,c.y]];for(let i=0;i<78;i++){c.rt+=1/30;const r=routeTarget(c,c.rt);steer(c,r.x,r.y,7.2,1/30);c.x=cl(c.x+c.vx/30,1,FIELDW-1);c.y+=c.vy/30;if(i%3==2)pts.push([c.x,c.y])}return{w,pts}}
function scr(x,y,h=1){return window.PROJ?window.PROJ(x,y,h):[sx(x),sy(y)]}
function routeTarget(w,t){const r=routeTarget0(w,t);const goal=G.los>=78&&['go','post','corner'].includes(w.route);
 if(goal&&w.y>101)return{x:cl(w.x+(w.x<FIELDW/2?-0.8:0.8),3,FIELDW-3),y:Math.min(w.y+0.6,106)};
 if(r.y>106||w.y>105.5)return{x:cl(w.x+Math.sin(t*1.6)*0.6,3,FIELDW-3),y:Math.min(r.y,105.8)};
 r.x=cl(r.x,2,FIELDW-2);return r}
function routeTarget0(w,t){const L=G.los,d=w.dir;t=t/(w.dk||1.2);
 switch(w.route){
 case 'slant':return t<0.6?{x:w.x,y:w.y+1}:{x:w.x+d*2,y:w.y+1.4};
 case 'out':return t<1.4?{x:w.x,y:w.y+1}:{x:w.x-d*3*(w.x<FIELDW/2?1:-1)*0+(w.x<FIELDW/2?-1:1),y:w.y+0.1};
 case 'flat':return{x:w.x+d*1,y:Math.min(w.y+0.6,L+3)};
 case 'go':return{x:w.x,y:w.y+2};
 case 'post':return t<1.6?{x:w.x,y:w.y+1}:{x:w.x+(FIELDW/2-w.x)*0.2,y:w.y+1.5};
 case 'curl':return t<1.7?{x:w.x,y:w.y+1}:{x:w.x,y:Math.max(w.y-0.2,L+7)};
 case 'drag':return{x:w.x+(FIELDW/2>w.x?1:-1),y:Math.min(w.y+0.5,L+4)};
 case 'corner':return t<1.4?{x:w.x,y:w.y+1}:{x:w.x+(w.x<FIELDW/2?-1:1),y:w.y+1.2};
 case 'block':return{x:w.x,y:Math.min(w.y+0.5,L+2)};}
 return{x:w.x,y:w.y};}
function steer(p,tx,ty,sp,dt,sh){let dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);if(d<0.05){p.vx*=0.8;p.vy*=0.8}else{const k=Math.min(1,dt*(sh||8));p.vx+=(dx/d*sp-p.vx)*k;p.vy+=(dy/d*sp-p.vy)*k}}
// ---------- live update ----------
function endPlay(kind,y){
 if(G.st!=='live')return;G.aim=null;G.pend=null;
 if(G.play.t==='ko'&&kind!=='td'){G.st='result';G.resT=1.6;G.ko=false;const y2=cl(Math.round(y??G.carrier.y),1,99);G.los=y2;G.down=1;G.togo=10;G.next='down';banner('RETURN TO THE '+(y2<=50?y2:100-y2),y2<=50?'OWN TERRITORY':'OPPONENT TERRITORY');return}G.st='result';G.resT=1.15;const gain=Math.round((y??G.carrier.y)-G.los);let m='';
 if(kind==='td'){G.celeb=true;G.sh+=7;G.stats.td++;m='TOUCHDOWN!';G.shake=0.6;burst(G.carrier.x,G.carrier.y);G.next='drive'}
 else if(kind==='int'){G.stats.int++;m='INTERCEPTED!';G.next='drive'}
 else if(kind==='inc'){m='INCOMPLETE';G.down++;G.next='down'}
 else{ if(kind==='sack'){G.stats.sack++;m='SACKED! '+gain+' YDS'}else m=(gain>=0?'+':'')+gain+' YARDS';
  if(G.passer===false||kind==='tackle'){ if(G.play.t==='pass'&&G.thrown)G.stats.py+=Math.max(gain,0);else G.stats.ry+=gain}
  G.los=cl(G.los+gain,1,99);G.togo-=gain;if(G.togo<=0){G.down=1;G.togo=Math.min(10,100-G.los);m+='  FIRST DOWN'}else G.down++;G.next='down'}
 if(G.next==='down'&&G.down>4){m+='  TURNOVER ON DOWNS';G.next='drive'}
 if(kind!=='inc'&&kind!=='td'&&kind!=='int')G.clock=Math.max(0,G.clock-12);
 G.log.unshift(m);const mm=m.split('  ');banner(mm[0],mm.slice(1).join(' '));
}
function dust(x,y,n){for(let i=0;i<n;i++)G.parts.push({x:x+rnd(-.5,.5),y:y+rnd(-.5,.5),vx:rnd(-3,3),vy:rnd(-3,3),l:rnd(.3,.7),c:['#e6d8b0','#c9b98f','#fff4d6'][i%3],dust:1})}
function burst(x,y){for(let i=0;i<40;i++)G.parts.push({x,y,vx:rnd(-8,8),vy:rnd(-8,8),l:rnd(.5,1.2),c:['#ff4fa3','#ffe14f','#3fd0ff'][i%3]})}
function finish(){if(G.sh>G.sa){const o=LS.get(),k='d'+G.diff;o[k]=Math.max(o[k]||1,Math.min(MAXLVL,G.lvl+1));LS.set(o);G.unlockMsg=G.lvl<MAXLVL?'LEVEL '+(G.lvl+1)+' UNLOCKED':'LADDER CLEARED'}else G.unlockMsg='WIN TO UNLOCK THE NEXT LEVEL'}
function autoPick(change){const L=G.los,dn=G.down,tg=G.togo;let w=[1,1,1,0,0,0];
 if(tg<=2){w=[2,.4,1.6,0,0,0]}else if(tg>=8||dn>=3){w=[1.6,2.2,1.8,0,0,0]}else w=[1.6,1,1.5,0,0,0];
 if(L>=88){w[1]*=.4;w[0]*=1.6;w[2]*=1.4}
 const cur=G.play?PLAYS.indexOf(G.play):-1;if(cur>=0)w[cur]*=change?0:.35;
 let s=w.reduce((a,b)=>a+b),r=Math.random()*s,i=0;for(;i<2;i++){r-=w[i];if(r<=0)break}setupPlay(PLAYS[i])}
function nextAfter(){
 if(G.next==='drive'){ G.drive++;
  // CPU possession sim
  const D=DIFFS[G.diff],bonus=lvlStr(G.lvl),r=Math.random(),pts=r<D.td+bonus?7:r<D.td+bonus+D.fg?3:0;G.sa+=pts;
  const ab=TEAMS[G.away].a;G.oppMsg=pts===7?ab+' SCORED A TD':pts===3?ab+' KICKED A FG':ab+' PUNTED';G.log.unshift(G.oppMsg);
  G.clock-=rnd(D.clk[0],D.clk[1])*(1-bonus);G.oppT=2.4;G.afterOpp=true;
  G.los=25;G.down=1;G.togo=10;if(G.clock<=0&&G.q>=4){G.st='final';finish();return}if(G.clock<=0){G.q++;G.clock=QLEN;if(G.q===3){startKickoff();banner(G.oppMsg,'HALFTIME KICKOFF');return}}autoPick();banner(G.oppMsg,'YOUR BALL  '+TEAMS[G.home].a+' '+G.sh+' - '+G.sa+' '+TEAMS[G.away].a);return}
 if(G.clock<=0){if(G.q>=4){G.st='final';finish();return}G.q++;G.clock=QLEN;G.log.unshift('END OF QUARTER '+(G.q-1));if(G.q===3){startKickoff();return}}
 autoPick();
}
function snap(){G.cdive=false;G.cslide=false;G.tuck=false;G.bullet=G.bulletPref;G.st='live';G.snapT=0;G.stam=1;G.qbRun=false;G.aim=null;G.runHinted=false;say('HIKE!',0.8);if(G.play.t==='pass')G.dropY=G.qb.y-(G.diff<2?3.5:3);hint(G.adv?'passadv':'pass3',G.adv?'LEFT THUMB: MOVE THE QB|RIGHT THUMB: PULL BACK TO AIM|RELEASE TO THROW':'RIGHT SIDE: DRAG BACK TO AIM, RELEASE TO THROW|LEFT STICK: MOVE THE QB|BULLET/LOB BUTTON: THROW TYPE  TUCK: RUN IT|TAP HANDOFF ON THE RB');}
function startKickoff(){const cx=FIELDW/2,P=[];const ret=mk(0,'RB',cx+rnd(-6,6),4,22);P.push(ret);
 for(let i=0;i<7;i++)P.push(mk(0,'OL',cx-15+i*5,22+(i%2)*4,[72,65,60,66,77,51,58][i]));
 for(let i=0;i<10;i++){const d=mk(1,'LB',3+i*5.2,62,40+i);d.lane=d.x;P.push(d)}{const k=mk(1,'S',cx,68,9);k.kicker=true;P.push(k)}
 G.pend=null;G.play={n:'KICKOFF',t:'ko',r:[]};G.players=P;G.qb=ret;G.rb=ret;G.carrier=ret;G.thrown=true;G.passer=false;G.handed=true;G.snapT=0;G.juke=0;G.jcd=0;G.stam=1;G.ko=true;G.celeb=false;G.runHinted=false;G.routes=[];G.routeVer=(G.routeVer||0)+1;
 G.los=25;G.down=1;G.togo=10;G.cam=30;const kx=cl(ret.x+rnd(-3,3),6,FIELDW-6),ky=rnd(1,9);G.ball={x0:cx,y0:65,x:cx,y:65,tx:kx,ty:ky,t:0,T:rnd(2.4,3.1),h:rnd(13,19),tt:'lob',fz:2,tgt:ret,caught:false,z:0};G.st='live';banner('KICKOFF',TEAMS[G.away].a+' KICKS TO '+TEAMS[G.home].a);
 hint('ko','CATCH IT AND RETURN IT|OR TAP TOUCHBACK FOR THE 25')}
function update(dt){
 G.t+=dt;if(G.msgT>0)G.msgT-=dt;if(G.shake>0)G.shake-=dt;
 if(G.flash){G.flash.t+=dt;if(G.flash.t>0.45)G.flash=null}
 G.parts=G.parts.filter(p=>(p.l-=dt)>0);G.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt});
 const taps=IN.taps.splice(0),keys=IN.keyp.splice(0);if(keys.includes(' '))taps.push(null);readSticks();if(G.hint){G.hint.t-=dt;if(G.hint.t<=0)G.hint=null}if(G.banner)G.banner.a+=dt;
 if(G.paused){for(const t of taps){if(!t)continue;if(t[1]>560&&t[1]<620){G.bulletPref=!G.bulletPref;localStorage.setItem('pb_bullet',G.bulletPref?'1':'0')}else if(t[1]>380&&t[1]<440)G.paused=false;else if(t[1]>460&&t[1]<520){G.paused=false;Object.assign(G,{sh:0,sa:0,drive:0,q:1,clock:QLEN,aud:4,los:25,down:1,togo:10,log:[],stats:{py:0,ry:0,td:0,int:0,sack:0}});G.st='title'}}return}
 if(G.st!=='title'&&G.st!=='team'&&taps.some(t=>t&&t[0]<52&&t[1]<50)){G.paused=true;return}
 if(G.st==='title'){if(taps.length)G.st='team';return}
 if(G.st==='presnap'){if(G.ovT>0)G.ovT-=dt;if(keys.includes('u')&&!G.audOpen){G.audOpen=true}G.cam+=(G.los+4-G.cam)*Math.min(1,dt*10);for(const t of taps){if(G.audOpen&&t){if(t[1]<H-AP_H){G.audOpen=false;return}const b=audBtn(t[0],t[1]);if(!b)return;
   if(b.c===3){if(b.r===0){autoPick(true);G.audOpen=true;say('NEW PLAY: '+G.play.n,1.2)}else if(b.r===1)G.audOpen=false}else setDepth(b.c,b.r);return}
  if(t&&Math.hypot(t[0]-60,t[1]-(H-84))<44){G.audOpen=true;return}
  if(!t||Math.hypot(t[0]-(W-64),t[1]-(H-84))<48)return snap();}return}
 if(G.st==='team'){for(const t of taps){if(!t)continue;const[x,y]=t;
  if(y>740&&y<800){G.away=lvlOpp(G.lvl);startKickoff()}
  else if(y>=170&&y<450){const i=Math.floor((y-170)/70);if(i>=0&&i<4)G.home=i}
  else if(y>=490&&y<540){const i=Math.floor((x-16)/((W-32)/4));if(i>=0&&i<4){G.diff=i;G.lvl=Math.min(G.lvl,unlocked())}}
  else if(y>=590&&y<660){if(x<110)G.lvl=Math.max(1,G.lvl-1);else if(x>280)G.lvl=Math.min(unlocked(),G.lvl+1)}}
  G.away=lvlOpp(G.lvl);return}
 if(G.st==='oppcard'){G.oppT-=dt;if(G.oppT<=0||taps.length){if(G.clock<=0){if(G.q>=4){G.st='final';finish();return}G.q++;G.clock=QLEN;if(G.q===3){startKickoff();return}}G.st='drivecard';G.cardT=1.6}return}
 if(G.st==='drivecard'){G.cardT-=dt;if(G.cardT<=0||taps.length)autoPick();return}
 if(G.st==='select'){for(const t of taps){if(!t)continue;const i=Math.floor((t[1]-208)/100)*2+(t[0]>W/2?1:0);if(t[1]>208&&t[1]<508&&i>=0&&i<6)setupPlay(PLAYS[i])}return}
 if(G.st==='result'){G.resT-=dt;if(G.resT<=0)nextAfter();return}
 if(G.st==='final'){if(taps.length){Object.assign(G,{clock:QLEN,aud:4,sh:0,sa:0,drive:0,q:1,los:25,down:1,togo:10,log:[],stats:{py:0,ry:0,td:0,int:0,sack:0}});G.st='title'}return}
 if(G.st!=='live')return;
 G.snapT+=dt;G.clock=Math.max(0,G.clock-dt);const c=G.carrier,P=G.players,p=G.play;
 // auto handoff
 if(!G.handed&&(p.t==='run'||p.t==='sweep')&&G.snapT>0.45){G.carrier=G.rb;G.handed=true;G.passer=false;say('HANDOFF!',0.8)}
 if(!G.handed&&p.t==='keep'){G.handed=true}
 // player control
 let jx=IN.jx,jy=IN.jy;if(KEYS.ArrowLeft)jx=-1;if(KEYS.ArrowRight)jx=1;if(KEYS.ArrowUp)jy=-1;if(KEYS.ArrowDown)jy=1;
 if(jx||jy){const a=Math.round(Math.atan2(jy,jx)/(Math.PI/4))*(Math.PI/4),m=Math.min(1,Math.hypot(jx,jy));jx=Math.cos(a)*m;jy=Math.sin(a)*m}
 const cur=G.carrier;if(G.slow>0){G.slow-=dt}
 if(cur===G.qb&&p.t==='pass'&&!G.thrown&&cur.y>G.los+0.5&&!G.qbRun){G.qbRun=true;say('QB RUN!',0.8)}
 const runner=!passerPhase()&&!G.pend&&(!G.ball||G.ball.caught);let runMul=1;G.truck=false;
 if(runner){if(!G.runHinted){G.runHinted=true;hint('run','RIGHT STICK: RUN (FULL PUSH = SPRINT)|FLICK LEFT SIDE: JUKE|HOLD 2ND FINGER: TRUCK')}
  const m=Math.hypot(jx,jy);if(IN.truck&&G.stam>0.05){G.truck=true;runMul=0.9;G.stam-=dt*0.45}else if((IN.sprint||m>0.92)&&G.stam>0.02&&m>0.5){runMul=1.25;G.stam-=dt*0.28}else G.stam=Math.min(1,G.stam+dt*0.12);G.stam=Math.max(0,G.stam)}
 if(IN.flick&&runner){jukeIt(IN.flick)}IN.flick=0;
 if(IN.jk){IN.jk=0;if(runner)jukeIt(jx>0.2?1:jx<-0.2?-1:0)}
 if(IN.dv){IN.dv=0;if(runner&&!(cur.dive>0)&&!(cur.fallen>0)){cur.dive=0.5;cur.vx=cur.vx*0.15+jx*1.2;cur.vy=Math.max(10.5,Math.abs(cur.vy)+3);G.cdive=true;dust(cur.x,cur.y,8);say('DIVE!',0.6)}}
 if(IN.tuck){IN.tuck=false;if(passerPhase()&&!G.tuck){G.tuck=true;say('TUCKED',0.7)}}
 if(IN.thr){const{w,ht}=IN.thr;IN.thr=null;if(G.tuck&&passerPhase()){G.tuck=false;}if(passerPhase()){if(w===G.rb&&canHand())handoff();else throwTo(w,true,holdType(ht))}}
 G.aim=null;if(passerPhase()&&IN.aimP&&IN.aimP.moved>4){const a=IN.aimP,fw=cl((a.y-a.sy)*0.3,2,60),lat=-(a.x-a.sx)*0.24;let tx=cl(cur.x+lat,1,FIELDW-1),ty=cur.y+fw;let lock=null,ld=0;
  for(const w of P)if((w.role==='WR'||w.role==='RB')&&w!==cur){const d=Math.hypot(w.x-tx,w.y-ty);if(d<ld){ld=d;lock=w}}
  if(lock){const T=0.22+Math.hypot(lock.x-cur.x,lock.y-cur.y)/40;tx=cl(lock.x+lock.vx*T,1,FIELDW-1);ty=lock.y+lock.vy*T}{let bw=null,bd=4.5;const T0=flightT(Math.hypot(tx-cur.x,ty-cur.y),G.bullet?'bullet':'lob')+0.3;for(const w of targets()){if(w===G.rb)continue;const f=simAhead(w,T0);const d=Math.hypot(f[0]-tx,f[1]-ty);if(d<bd){bd=d;bw=f}}if(bw){const k=0.45*(1-bd/4.5);tx+=(bw[0]-tx)*k;ty+=(bw[1]-ty)*k}}
  {const S=G.aimS;if(S&&G.aimSid===a.t0){tx=S.x+(tx-S.x)*0.4;ty=S.y+(ty-S.y)*0.4}G.aimS={x:tx,y:ty};G.aimSid=a.t0;tx=cl(tx,1.5,FIELDW-1.5);ty=Math.min(ty,108.5)}
  const pl=Math.hypot(a.x-a.sx,a.y-a.sy);const d0=Math.hypot(tx-cur.x,ty-cur.y),ty2=d0>(G.bullet?42:32)?'bomb':G.bullet?'bullet':'lob';let ok=false;if(ty<=110&&tx>0.5&&tx<FIELDW-0.5)for(const w of targets()){if(w===G.rb&&!G.handed&&G.snapT<1.2)continue;const f=simAhead(w,flightT(d0,ty2)+0.3);if(Math.hypot(f[0]-tx,f[1]-ty)<4.8){ok=true;break}}G.aim={tx,ty,lock,ty2,ok}}
 if(G.relAim){G.relAim=false;if(G.lastAim&&passerPhase()){G.tuck=false;}if(G.lastAim&&passerPhase())throwSpot(G.lastAim.tx,G.lastAim.ty,G.lastAim.lock,G.lastAim.ty2)}G.lastAim=G.aim;
 for(const k of keys){if('123'.includes(k)&&passerPhase()){const w=P.filter(q=>q.role==='WR')[+k-1];if(w)throwTo(w)}if(k==='b'&&G.ko)return touchback()}
 for(const t of taps)if(t&&G.ko&&t[0]<120&&t[1]>H-140)return touchback();let sp=(cur.role==='QB'&&!runner?(G.tuck?7.8:6.6):8.2)*(G.slow>0?0.7:1);if(G.juke>0)sp*=1.5;
 if((!G.ball||G.ball.caught)&&!(cur.dive>0)&&!(cur.fallen>0)&&!(G.juke>0)){
  if(jx||jy)steer(cur,cur.x+jx*5,cur.y-jy*5,sp*runMul,dt,16);
  else if(cur.role==='RB'||cur.role==='WR'||(cur.role==='QB'&&p.t==='keep'))steer(cur,cur.x,cur.y+5,sp*0.85,dt);
  else if(passerPhase()&&!G.tuck&&cur.y>G.dropY+0.15)steer(cur,G.qb.x,G.dropY,5.2,dt);else steer(cur,cur.x,cur.y,0,dt);}
 if(G.juke>0&&!G.jukeCut&&G.juke<0.24){G.jukeCut=true;cur.vx=G.jukeS*10;cur.vy=Math.max(cur.vy,3);dust(cur.x,cur.y,10)}
 G.juke-=dt;G.jcd-=dt;
 // taps: throw or juke
 for(const t of taps){
  if(passerPhase()){
   let best=null,bd=1e9;const tg=targets();for(const w of tg){let d;if(!t)d=-openness(w)*10-w.y*.01;else{const b=bubblePos(w),i=tg.indexOf(w),ic=iconPos(i),s2=scr(w.x,w.y,1);d=Math.min(Math.hypot(b[0]-t[0],b[1]-t[1]),Math.hypot(ic[0]-t[0],ic[1]-t[1]),Math.hypot(s2[0]-t[0],s2[1]-t[1]))}if(d<bd){bd=d;best=w}}
   if(best&&best===G.rb&&canHand()&&(!t||bd<70)){handoff()}
  }else jukeIt();}
 // receivers
 for(const w of P){if(w===G.carrier)continue;
  if(w.team===0){
   if(G.ball&&!G.ball.caught&&(w.role==='WR'||w.role==='RB')&&Math.hypot(w.x-G.ball.tx,w.y-G.ball.ty)<9){steer(w,G.ball.tx,G.ball.ty,7.6,dt);continue}
   if(w.role==='WR'){w.rt+=dt;if(G.ball&&!G.ball.caught&&G.ball.tgt===w)steer(w,G.ball.tx,G.ball.ty,7.4,dt);else if(G.passer===false)steer(w,w.x,w.y+1,4,dt);else{const r=routeTarget(w,w.rt);w.spd=7.2+DIFFS[G.diff].sep;steer(w,r.x,r.y,w.route==='block'?3:w.spd,dt)}}
   else if(w.role==='OL'){let d=w.blk;if(!d||d.shed||d.fallen>0){d=null;let bd=6;for(const q of P)if(q.team===1&&(q.role==='DL'||q.role==='LB')&&!(q.fallen>0)){const dd=dist(w,q);if(dd<bd){bd=dd;d=q}}}
    if(d){const ref=G.carrier,dx=ref.x-d.x,dy=ref.y-d.y,l=Math.hypot(dx,dy)||1;steer(w,d.x+dx/l*2.3,d.y+dy/l*2.3,p.t==='pass'?5:6,dt);w.eng=dist(w,d)<2.9}else{w.eng=false;steer(w,G.carrier.x+(w.x-G.carrier.x)*.9,G.carrier.y+2,3,dt)}}
   else if(w.role==='RB'&&!G.handed){if(p.t==='pass'&&G.snapT<1.2)steer(w,G.qb.x+1.4,G.qb.y-0.4,5,dt);else steer(w,w.x+(p.t==='pass'?3:0),w.y+(p.t==='pass'?1:3),5,dt)}
   else if(w.role==='RB'){steer(w,w.x+2,w.y+1.5,5,dt)}
   else if(w.role==='QB'){steer(w,w.x,w.y-0.2,2,dt)}
  }else defend(w,dt);}
 if(G.pend){G.qb.vx*=0.88;G.qb.vy*=0.88;G.pend.t-=dt;if(G.pend.t<=0){releaseBall();if(G.st!=='live')return}}
 for(const q of P){if(q.throwT>0)q.throwT-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.x=cl(q.x,0.5,FIELDW-0.5);if(q!==G.carrier||G.play.t==='ko')q.y=Math.min(q.y,109.4);q.anim+=Math.hypot(q.vx,q.vy)*dt}
 // OL vs DL separation
 const ballAir=G.ball&&!G.ball.caught;for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(a.fallen>0||b.fallen>0)continue;
  if((a===G.carrier||b===G.carrier)&&a.team!==b.team)continue;const ra=(a.role==='OL'||a.role==='DL')?1.15:0.7,rb=(b.role==='OL'||b.role==='DL')?1.15:0.7;
  const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy),m=ra+rb;if(d<m&&d>0.001){const k=(m-d)/2,ux=dx/d,uy=dy/d;const wa=a===G.carrier?0.2:1,wb=b===G.carrier?0.2:1;a.x+=ux*k*wa;a.y+=uy*k*wa;b.x-=ux*k*wb;b.y-=uy*k*wb}}
 // ball flight
 if(G.ball&&!G.ball.caught){const b=G.ball;b.t+=dt;(G.trail=G.trail||[]).push([b.x,b.y,b.z,b.t,b.T,b.h0||1.6]);if(G.trail.length>16)G.trail.shift();if(G.assist&&b.tgt===G.assist&&b.t>b.T*0.35&&Math.hypot(b.tgt.x-b.tx,b.tgt.y-b.ty)<4){const w=b.tgt,a=Math.min(1,dt*(b.tt==='bullet'?2.5:1.6));b.tx+=(cl(w.x,1.5,FIELDW-1.5)-b.tx)*a;b.ty+=(Math.min(w.y,108.5)-b.ty)*a}{const k0=b.t/b.T;if(k0>0.8&&!b.dv){for(const q of P)if(q.team===0&&(q.role==='WR'||q.role==='RB')&&!(q.fallen>0)){const d=Math.hypot(q.x-b.tx,q.y-b.ty);if(d>2.4&&d<4.8){b.dv=q;q.dive=0.45;const u=1/d;q.vx=(b.tx-q.x)*u*12;q.vy=(b.ty-q.y)*u*12;dust(q.x,q.y,8);break}}}}const k=Math.min(1,b.t/b.T);b.x=b.x0+(b.tx-b.x0)*k;b.y=b.y0+(b.ty-b.y0)*k;b.z=Math.sin(k*Math.PI)*b.h;
  if(k>=1){let w=b.tgt;{let bd=w?Math.hypot(w.x-b.x,w.y-b.y):99;for(const q of P)if(q.team===0&&(q.role==='WR'||q.role==='RB')&&q!==G.qb){const d=Math.hypot(q.x-b.x,q.y-b.y);if(d<bd){bd=d;w=q}}}if(!w){endPlay('inc');return}const dd=P.filter(q=>q.team===1).reduce((m,q)=>Math.min(m,Math.hypot(q.x-b.x,q.y-b.y)),99);const wd=Math.hypot(w.x-b.x,w.y-b.y);
   if(G.play.t==='ko'&&w){w.x=b.x;w.y=b.y;b.caught=true;G.carrier=w;w.catchT=0.45;G.trail=[];G.ko=false;G.passer=false;say('RETURN IT!',0.8);return}
   if(dd<1.1&&dd<wd-0.3&&Math.random()<DIFFS[G.diff].int*0.4){endPlay('int');return}
   if(w.y>110||w.x<0.5||w.x>FIELDW-0.5){say('OUT OF BOUNDS',0.8);endPlay('inc');return}const dw=P.filter(q=>q.team===1&&!(q.fallen>0)).reduce((m,q)=>Math.min(m,dist(q,w)),99);const tm=b.tt==='bullet'?(b.T<0.8?0.6:1.3):b.tt==='bomb'?1.15:0.8;if(dw<1.6&&Math.random()<([.22,.36,.5,.62][G.diff]*(1.6-dw)/1.2+0.08*G.diff)*tm){const dv=P.filter(q=>q.team===1&&!(q.fallen>0)).sort((a,c)=>dist(a,w)-dist(c,w))[0];if(dv){dv.dive=0.45;dv.vx=(b.x-dv.x)*4;dv.vy=(b.y-dv.y)*4;dust(dv.x,dv.y,8)}if(Math.random()<DIFFS[G.diff].int*0.35){banner('INTERCEPTED!','DIVING PICK');endPlay('int');return}if(Math.random()<0.35){say('TIPPED!',0.8)}else say('BROKEN UP!',0.8);endPlay('inc');return}
   if(wd>=2.9&&wd<4.6&&w.role!=='QB'){w.dive=0.45;w.vx=(b.x-w.x)*4;w.vy=(b.y-w.y)*4;dust(w.x,w.y,10);if(Math.random()<0.62-G.diff*0.06){b.caught=true;G.carrier=w;w.catchT=0.45;G.trail=[];G.flash={x:b.x,y:b.y,t:0};burst(b.x,b.y);G.passer=false;G.shake=0.15;G.dcatch=true;banner('DIVING CATCH!');return}say('JUST OUT OF REACH',0.8);endPlay('inc');return}
   if(wd<2.2&&Math.random()<0.035+G.diff*0.01){say('DROPPED!',0.8);endPlay('inc');return}
   if(wd<2.9&&!(dd<0.9&&Math.random()<(G.assist?0.35:0.5))){if(b.dv===w){G.dcatch=true;w.dive=Math.max(w.dive,0.4);banner('DIVING CATCH!');G.shake=0.15}b.caught=true;G.carrier=w;w.catchT=0.45;G.trail=[];G.flash={x:w.x,y:w.y,t:0};burst(w.x,w.y);G.passer=false;if(G.play.t!=='ko')say('CATCH!',0.8);else G.ko=false}else{endPlay('inc');return}}}
 // tackles
 const cc=G.carrier;if(!(G.ball&&!G.ball.caught)){
  for(const d of P){if(d.team!==1||d.fallen>0)continue;const dd=dist(d,cc);
   if(!d.dive&&dd<2.2&&dd>1.2&&G.snapT>0.6&&Math.random()<dt*(1.6-[0.45,0.65,0.85,1][G.diff]*0.6)){d.dive=0.4;const u=1/dd;d.vx=(cc.x+cc.vx*.25-d.x)*u*11;d.vy=(cc.y+cc.vy*.25-d.y)*u*11}
   if(G.juke>0&&G.jukeCut&&dd<2.6){d.dive=0.3;d.vx=-(G.jukeS||1)*7;d.vy=(cc.y-d.y)*2;d.brkTried=true;d.stun=1.2;say('WHIFF!',0.6);dust(d.x,d.y,8);continue}
   if(dd<(d.dive?1.4:1.15)){
   if(d.stun>0)continue;
   const brk=(cc.role!=='QB'||G.qbRun)&&!d.brkTried&&Math.random()<(G.truck?0.7:0.22)+(cc.ovr-d.ovr)*0.01;d.brkTried=true;
   if(brk){d.fallen=1.4;d.dive=0;const u=1/(dd||1);d.vx=(d.x-cc.x)*u*6;d.vy=(d.y-cc.y)*u*6;G.slow=0.35;G.shake=0.2;dust(d.x,d.y,14);say(G.truck?'TRUCKED!':'BROKEN TACKLE!',0.9);G.brk=(G.brk||0)+1;continue}
   dust(cc.x,cc.y,20);G.shake=0.22;d.fallen=2;cc.fallen=2;
   const behind=cc.role==='QB'&&cc.y<G.los&&G.play.t==='pass';endPlay(behind&&(!G.thrown||G.pend)?'sack':'tackle',cc.y);return}}}
 for(const d of P){if(d.catchT>0)d.catchT-=dt;if(d.stun>0)d.stun-=dt;if(d.dive>0){d.dive-=dt;if(d.dive<=0){d.dive=0;d.fallen=0.9;dust(d.x,d.y,6)}}if(d.fallen>0){d.fallen-=dt;d.vx*=0.92;d.vy*=0.92}}
 if(G.cdive&&cc.dive>0){cc.vy=Math.max(cc.vy,7)}if(G.cdive&&!(cc.dive>0)){G.cdive=false;G.cslide=true;cc.fallen=0.4;cc.vx*=0.5;cc.vy*=0.55;dust(cc.x,cc.y,16);G.shake=0.12}
 if(G.cslide){if(cc.y>=100){G.cslide=false;endPlay('td',100);return}if(!(cc.fallen>0.05)){G.cslide=false;cc.fallen=0.8;endPlay('tackle',cc.y);return}}
 if(G.dcatch&&cc.dive<=0){G.dcatch=false;if(cc.y<100){cc.fallen=1;endPlay('tackle',cc.y);return}}if(G.dcatch&&cc.dive>0){/*diving*/}
 if(cc.y>=100){endPlay('td',100);return}
 if(cc.x<=0.6||cc.x>=FIELDW-0.6){if(G.snapT>0.5){say('OUT OF BOUNDS');endPlay('tackle',cc.y);return}}
 G.cam+=((G.ball&&!G.ball.caught?G.ball.y+(G.ball.tt==='bomb'?6:0):G.aim?Math.max(cc.y,(cc.y+G.aim.ty)/2-3):cc.y+cl(cc.vy*0.4,-2,4))+4-G.cam)*Math.min(1,dt*(G.ball&&!G.ball.caught?7:4));
}
function nearest(p,team,roles){let b=null,bd=1e9;for(const q of G.players)if(q.team===team&&roles.includes(q.role)){const d=dist(p,q);if(d<bd){bd=d;b=q}}return b}
function defend(d,dt){if(d.dive>0)return;
 if(d.role==='DL'&&d.blk&&!d.shed&&!(d.fallen>0)){if(G.snapT>d.shedT||(G.carrier!==G.qb&&G.snapT>d.shedT*0.7)){d.shed=true;d.eng=false;d.vx+=(d.x<d.blk.x?-1:1)*5}else{d.eng=dist(d,d.blk)<2.9;const c=G.carrier;steer(d,c.x,c.y,G.play.t==='pass'?1.8:1.0,dt);return}}if(d.fallen>0||d.stun>0){d.vx*=0.9;d.vy*=0.9;return}
 const c=G.carrier,inAir=G.ball&&!G.ball.caught;
 if(G.play.t==='ko'){if(d.fallen>0||d.stun>0)return;const DFk=DIFFS[G.diff],spk=6.4*(DFk.def+lvlStr(G.lvl));const fx=inAir?G.ball.tx:c.x,fy=inAir?G.ball.ty:c.y;
  if(d.kicker){const dd=Math.hypot(d.x-fx,d.y-fy);if(dd>9&&!inAir)return steer(d,cl(fx,4,FIELDW-4),Math.max(fy+10,d.y-0.01),spk*0.75,dt);if(inAir)return steer(d,cl(fx,4,FIELDW-4),fy+28,spk*0.6,dt)}
  else{const dd=Math.hypot(d.x-fx,d.y-fy),k=cl(1-(dd-6)/18,0,1);const s=fx<FIELDW/2?-1:1;const out=(d.lane-fx)*s>0;const tx=d.lane+(fx+(out?s*2:0)-d.lane)*k;const ty=inAir?Math.max(fy+6,d.y-spk*dt):fy+(c.vy||0)*0.4*k;
   return steer(d,cl(tx,1,FIELDW-1),ty,spk*(dd<4?0.85:dd>14?0.9:1),dt)}}const rushBoost=G.snapT>DIFFS[G.diff].pk?1.3:1;const DF=DIFFS[G.diff];let sp={DL:5.4*rushBoost,LB:6.2,CB:7,S:6.8}[d.role]*(DF.def+lvlStr(G.lvl));
 if(G.snapT<0.25)return;if(G.play.t!=='pass'&&G.snapT<1.3)sp*=d.role==='DL'?0.45:0.6;
 // pursuit
 const pursue=!G.passer||c.role!=='QB'||d.role==='DL'||(d.role==='LB'&&d.blitz)||(c.y>G.los-0.5);
 if(inAir){const b=G.ball;if(Math.hypot(d.x-b.tx,d.y-b.ty)<8)return steer(d,b.tx,b.ty,sp*1.05,dt)}
 if(d.role==='CB'&&!pursue&&d.man){return steer(d,d.man.x+(d.man.vx*0.3),d.man.y+DIFFS[G.diff].cov+d.man.vy*0.2,sp*0.97,dt)}
 if(d.role==='S'&&!pursue){const wrs=G.players.filter(q=>q.role==='WR');let deep=wrs.reduce((a,b)=>a.y>b.y?a:b);return steer(d,cl((deep.x+FIELDW/2)/2+(d.x<FIELDW/2?-3:3),6,FIELDW-6),Math.max(deep.y+5,G.los+Math.max(13,G.togo+5)),sp*0.8,dt)}
 if(d.role==='LB'&&!pursue&&d.spy){return steer(d,cl(c.x,4,FIELDW-4),G.los+3.5,sp*0.7,dt)}
 if(d.role==='LB'&&!pursue){return steer(d,cl(c.x+(d.x<FIELDW/2?-5:5),4,FIELDW-4),G.los+Math.min(G.togo,8)+1,sp*0.6,dt)}
 // lead the carrier
 const disc=[0.45,0.65,0.85,1][G.diff],sticks=G.los+G.togo,dd=dist(d,c),lead=Math.min(1.2,dd/sp);
 if(c.role==='QB'&&!G.qbRun&&G.passer){return steer(d,c.x+c.vx*lead*0.8,c.y+c.vy*lead*0.8,sp,dt)}
 const s=c.x<FIELDW/2?-1:1;const outside=(d.x-c.x)*s>0;let tx=c.x+c.vx*lead*0.8,ty=c.y+c.vy*lead*0.8;
 if(dd>2.2){tx+=s*disc*(outside?1.8:0.9);if(d.y>c.y)ty=Math.max(c.y+1.2*disc,Math.min(ty,sticks+1));else ty=c.y+c.vy*lead}
 if(c.y>sticks-4||c.y>95)sp*=1+0.08*disc;if(dd<3.5)sp*=0.9;
 steer(d,cl(tx,0.8,FIELDW-0.8),ty,sp,dt)}
function pickTarget(x,y){let best=null,bd=70;const tg=targets();for(const w of tg){const b=bubblePos(w),ic=iconPos(tg.indexOf(w)),s2=scr(w.x,w.y,1);const d=Math.min(Math.hypot(b[0]-x,b[1]-y),Math.hypot(ic[0]-x,ic[1]-y),Math.hypot(s2[0]-x,s2[1]-y));if(d<bd){bd=d;best=w}}return best}
function slotAngles(){const ws=targets().filter(w=>w!==G.rb).map(w=>[w,tgtAngle0(w)]).sort((a,b)=>a[1]-b[1]);const n=ws.length,m=new Map();ws.forEach(([w],i)=>m.set(w,-Math.PI*(n>1?0.85-0.7*i/(n-1):0.5)));return m}
function tgtAngle(w){return slotAngles().get(w)??-Math.PI/2}
function tgtAngle0(w){const q=scr(G.qb.x,G.qb.y,1),s=scr(w.x,w.y,1);return Math.atan2(s[1]-q[1],s[0]-q[0])}
function stickRead(p){const dx=p.x-STK.x,dy=p.y-STK.y,d=Math.hypot(dx,dy);if(d<16||!G.qb)return{};if(dy>d*0.7)return{tuck:true};const a=Math.atan2(dy,dx);let best=null,bd=0.9;for(const w of targets()){if(w===G.rb)continue;let da=Math.abs(((tgtAngle(w)-a)+Math.PI*3)%(Math.PI*2)-Math.PI);if(da<bd){bd=da;best=w}}return{w:best}}
function holdType(ht){return ht<0.28?'bullet':ht<0.75?'lob':'bomb'}
function flightT(d,ty){return ty==='bullet'?0.12+d/60:ty==='bomb'?0.45+d/28:0.26+d/36}
function arcH(d,ty){return ty==='bullet'?0.35+d*0.025:ty==='bomb'?3.5+d*0.22:1.6+d*0.13}
function canHand(){return passerPhase()&&!G.tuck&&!G.pend&&!G.handed&&G.snapT<2.6&&G.qb.y<G.los&&dist(G.qb,G.rb)<6}
function handoff(){G.carrier=G.rb;G.rb.hasBall=1;G.qb.hasBall=0;G.handed=true;G.passer=false;G.thrown=false;G.runHinted=false;G.players.forEach(d=>{if(d.role==='DL'&&!d.shed)d.shedT=G.snapT/0.7+rnd(0.9,1.5)*DIFFS[G.diff].shed});say('HANDOFF!',0.8);dust(G.rb.x,G.rb.y,6)}
function targets(){return G.players.filter(q=>q.team===0&&(q.role==='WR'||q.role==='RB')&&q!==G.qb)}
function openness(w){const d=G.players.filter(q=>q.team===1&&!(q.fallen>0)).reduce((m,q)=>Math.min(m,dist(q,w)),99);return d}
function openCol(w){const d=openness(w);return d>3.2?'#3fd07a':d>1.7?'#ffd23f':'#ff4d5e'}
function bubblePos(w){const s=scr(w.x,w.y,4.2);return[s[0],s[1]-22]}
function iconPos(i){return[-999,-999]}
function throwTo(w,assist,ty){const q=G.carrier;let px=w.x,py=w.y,T=0;if(!ty){const d=dist(q,w);ty=d<14?'bullet':d<30?'lob':'bomb'}G.ttype=ty;for(let i=0;i<3;i++){T=flightT(Math.hypot(px-q.x,py-q.y),ty)+0.3;const f=simAhead(w,T);px=f[0];py=f[1]}throwSpot(cl(px,1.5,FIELDW-1.5),Math.min(py,108.5),w,ty);if(assist)G.assist=w}
function simAhead(w,T){if(w.role!=='WR')return[w.x+w.vx*T,w.y+w.vy*T];const c={x:w.x,y:w.y,vx:w.vx,vy:w.vy,route:w.route,dir:w.dir,dk:w.dk};let rt=w.rt;for(let s=0;s<T;s+=1/30){rt+=1/30;const r=routeTarget(c,rt);steer(c,r.x,r.y,w.spd||7.2,1/30);c.x+=c.vx/30;c.y+=c.vy/30}return[c.x,c.y]}
function touchback(){G.ko=false;G.los=25;G.down=1;G.togo=10;G.st='result';G.resT=1.3;G.next='down';banner('TOUCHBACK','BALL ON THE 25')}
function throwSpot(tx,ty,w,tt){const q=G.carrier;if(G.pend)return;if(q.y>G.los+0.3){say('CROSSED THE LINE',0.8);return}G.assist=null;tx=cl(tx,1.5,FIELDW-1.5);ty=Math.min(ty,108.5);const tt0=tt||G.ttype||'lob',dur=tt0==='bullet'?0.3:tt0==='bomb'?0.46:0.4;q.throwT=dur;q.throwDur=dur;q.throwDir={x:tx-q.x,y:ty-q.y};G.thrown=true;G.pend={tx,ty,w,t:dur*0.55,tt:tt0};G.ttype=null}
function releaseBall(){const q=G.qb;let{tx,ty,w,tt}=G.pend;G.pend=null;const d0=Math.hypot(tx-q.x,ty-q.y);const T=flightT(d0,tt);q.hasBall=0;
 const pres=G.players.some(d=>d.team===1&&!(d.fallen>0)&&dist(d,q)<3)?0.9:0,mov=Math.hypot(q.vx,q.vy)*0.12;const sg=(0.25+(95-q.ovr)*0.025+pres+mov+d0*0.012)*(tt==='bomb'?1.4:tt==='bullet'?0.7:1);const ga=()=>(Math.random()+Math.random()+Math.random()-1.5)*1.4;tx=cl(tx+ga()*sg,1.5,FIELDW-1.5);ty=Math.min(ty+ga()*sg,108.5);
 {const l=Math.hypot(tx-q.x,ty-q.y)||1;q.hx=q.x+(tx-q.x)/l*0.35;q.hy=q.y+(ty-q.y)/l*0.35}G.ball={x0:q.hx,y0:q.hy,x:q.hx,y:q.hy,tx,ty,t:0,T,h:arcH(d0,tt),tt,fz:1.5+sg*1.4,tgt:w,caught:false,z:0,h0:3.1};G.thrown=true;if(q.y>G.los+0.5){endPlay('inc');say('ILLEGAL FORWARD PASS');}}
function jukeIt(dir){if(G.jcd>0)return;G.juke=0.32;G.jcd=0.75;const c=G.carrier;const s=(dir||(IN.jx?Math.sign(IN.jx):0)||Math.sign(Math.random()-.5));G.jukeS=s;G.jukeCut=false;c.vx=-s*2.5;c.vy*=0.5;dust(c.x,c.y,6);say('JUKE!',0.5)}
// ---------- rendering ----------
const PAL={bg:'#120a24',grass1:'#2f8a3c',grass2:'#2a7f36',line:'#e9f5e1',txt:'#fff4d6',pink:'#ff4fa3',yel:'#ffe14f',cy:'#3fd0ff'};
function rect(x,y,w,h,c){X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),w,h)}
const FONT={};
function txt(s,x,y,sz=16,c=PAL.txt,al='center',sh=true){X.font=`800 ${sz}px "Trebuchet MS","Segoe UI",Arial,sans-serif`;X.textAlign=al;X.textBaseline='middle';if(sh){X.fillStyle='#000';X.fillText(s,x+2,y+2)}X.fillStyle=c;X.fillText(s,x,y)}
function box(x,y,w,h,c='#1d1238',b=PAL.yel){rect(x-3,y-3,w+6,h+6,'#000');rect(x,y,w,h,b);rect(x+3,y+3,w-6,h-6,c)}
function drawField(){
 const ox=(W-FIELDW*PPY)/2;
 for(let y=-10;y<110;y+=5){const top=sy(y+5),bot=sy(y);if(bot<-20||top>H+20)continue;rect(0,top,W,bot-top+1,(Math.floor(y/5)%2)?PAL.grass1:PAL.grass2)}
 // end zones
 const tc=TEAMS[G.home],ac=TEAMS[G.away];
 rect(0,sy(110),W,sy(100)-sy(110),'#7a1e5a');rect(0,sy(0),W,sy(-10)-sy(0),'#1e3c7a');
 X.save();txt(tc.n.split(' ')[1],W/2,(sy(110)+sy(100))/2,30,PAL.yel);X.restore();
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
 if(window.PROJ){X.clearRect(0,0,W,H);if(G.st==='live'||G.st==='result'||G.st==='presnap')drawBadges();drawTrail();drawFlash();G.parts.forEach(p=>{const q=scr(p.x,p.y,1+p.l*3);X.globalAlpha=Math.min(1,p.l*2);rect(q[0]-2,q[1]-2,p.dust?6:4,p.dust?6:4,p.c);X.globalAlpha=1});drawHUD2()}
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
 if(G.msgT>0&&(G.st==='live'||G.st==='presnap')){pill(40,158,W-80,34,'rgba(14,20,48,.88)','#4fa3ff');txt(G.msg,W/2,175,G.msg.length>26?12:18,PAL.yel)}
 {const aa=ease('aud',G.st==='presnap'&&!G.audOpen),ap=ease('aud_p',G.st==='presnap'&&pressed(24,H-120,72,72));if(aa>0){const e=1-Math.pow(1-aa,3),s=(0.75+0.25*e)*(1-0.08*ap);X.save();X.globalAlpha=e;X.translate(60,H-84+2*ap);X.scale(s,s);X.translate(-60,-(H-84));drawAudible();X.restore()}};if(G.st==='presnap'&&G.audOpen)drawAudPanel();
 if(G.paused){rect(0,0,W,H,'rgba(8,10,30,.8)');pill(60,300,W-120,340,'#141a3a','#4fa3ff');txt('PAUSED',W/2,340,28,PAL.yel);pill(90,380,W-180,56,'#1f6fd6','#fff');txt('RESUME',W/2,408,20);pill(90,462,W-180,56,'#e8344e','#fff');txt('QUIT TO TITLE',W/2,490,16);txt('SETTINGS',W/2,545,12,'#9fb3ff');pill(90,562,W-180,56,G.bulletPref?'#9a7400':'#1f6fd6','#fff');txt('DEFAULT THROW: '+(G.bulletPref?'BULLET':'LOB'),W/2,584,15);txt('ALSO ON THE BUTTON ABOVE THE LEFT STICK',W/2,604,10,'#cfd3da');}
 if(!window.PROJ){ if(G.st==='live'&&G.carrier.role!=='QB'||G.st==='live'&&G.play.t==='keep')txt(G.jcd>0?'JUKE RECHARGING':'TAP = JUKE',W/2,H-30,12,G.jcd>0?'#8a7ab0':PAL.cy);
 if(G.st==='live'&&G.carrier.role==='QB'&&G.play.t==='pass'&&!G.thrown){const pr=Math.min(1,G.snapT/4.5);box(20,H-40,W-40,16,'#120a24','#5a4a8a');rect(23,H-37,(W-46)*pr,10,pr>.7?PAL.pink:PAL.cy);txt('POCKET',W/2,H-56,10,PAL.txt)}}
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
 // center stripe
 X.beginPath();X.moveTo(-11,-1);X.bezierCurveTo(-11,-9,-5,-13,2,-13);X.lineWidth=3;X.strokeStyle=t.c1===t.h?t.c2:t.c1;X.stroke();
 // ear hole
 X.beginPath();X.arc(-2,1,2.2,0,7);X.fillStyle='rgba(0,0,0,.6)';X.fill();
 // team mark (initial)
 X.fillStyle=t.c1===t.h?t.c2:t.c1;X.font='900 7px Arial';X.textAlign='center';X.textBaseline='middle';X.fillText(t.a[0],-6,-5);
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
 
 if(G.st==='live'&&G.carrier.role==='QB'&&G.play.t==='pass'&&!G.thrown){const pr=Math.min(1,G.snapT/4.5);pill(20,H-44,W-140,16,'rgba(16,20,44,.9)');rect(23,H-41,(W-146)*pr,10,pr>.7?'#ff4d5e':'#4fa3ff');txt('POCKET',20+(W-140)/2,H-58,11,'#fff')}
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
function drawAudible(){const x=60,y=H-84;X.beginPath();X.arc(x,y,36,0,7);X.fillStyle='#16224e';X.fill();X.lineWidth=4;X.strokeStyle='#4fa3ff';X.stroke();
 X.fillStyle='#fff';X.beginPath();X.moveTo(x-14,y-10);X.lineTo(x+6,y-20);X.lineTo(x+6,y+4);X.lineTo(x-14,y-4);X.closePath();X.fill();X.fillRect(x-18,y-10,5,6);
 txt('AUDIBLE',x,y+18,10,'#fff','center',false);X.beginPath();X.arc(x+26,y-30,12,0,7);X.fillStyle='#ffd23f';X.fill();txt(String(G.aud),x+26,y-30,13,'#141a36','center',false)}
function drawBadges(){X.textBaseline='middle';X.textAlign='center';for(const p of G.players){if(p.team!==0||p.role==='OL')continue;const f=scr(p.x,p.y,-0.8);if(f[1]<150||f[1]>H)continue;
 pill(f[0]-13,f[1]+1,26,11,'rgba(14,18,40,.85)');X.fillStyle='#ffd23f';X.font='bold 7px Arial';X.fillText('\u2605',f[0]-7,f[1]+6.5);X.fillStyle='#fff';X.font='bold 8px Arial';X.fillText(String(p.ovr),f[0]+4,f[1]+6.5)}}
 X.textAlign='center';
function ease(k,on){const a=G.ua||(G.ua={});const v=a[k]??0,tg=on?1:0;let nv=v+(tg-v)*0.2;if(Math.abs(nv-tg)<0.02)nv=tg;a[k]=nv;return nv}
function rbtn(k,on,x,y,r,fill,stroke,label,icon){const a=ease(k,on);if(a<=0)return;const pr=on&&pressed(x-r,y-r,2*r,2*r);const ps=ease(k+'_p',pr);const e=1-Math.pow(1-a,3);const s=(0.7+0.3*e)*(1-0.08*ps);X.save();X.globalAlpha=e;X.translate(x,y);X.beginPath();X.arc(0,4,r,0,7);X.fillStyle='rgba(0,0,0,.35)';X.fill();X.translate(0,2*ps);X.scale(s,s);
 const g=X.createLinearGradient(0,-r,0,r);g.addColorStop(0,fill);g.addColorStop(1,HELM.mix(fill,0.72));X.beginPath();X.arc(0,0,r,0,7);X.fillStyle=g;X.fill();X.lineWidth=3;X.strokeStyle=stroke;X.stroke();X.globalAlpha=e*0.25;X.beginPath();X.ellipse(0,-r*0.45,r*0.6,r*0.25,0,0,7);X.fillStyle='#fff';X.fill();X.globalAlpha=e;
 txt(label,0,icon?-4:1,r>30?13:10,'#fff','center',false);if(icon)icon();X.restore()}
function drawActionButtons(){const live=G.st==='live'&&!G.paused;const qbB=live&&passerPhase()&&G.carrier===G.qb&&!G.pend&&!G.ball;
 rbtn('tuck',qbB,TB.x,TB.y,26,G.tuck?'#ff8a1f':'#1a2350','#ffb36b','TUCK');
 rbtn('bul',qbB,BB.x,BB.y,26,G.bullet?'#d9a400':'#1f6fd6','#fff',G.bullet?'BULLET':'LOB',()=>{X.strokeStyle='#fff';X.lineWidth=2;X.beginPath();if(G.bullet){X.moveTo(-12,10);X.lineTo(12,8)}else{X.moveTo(-12,13);X.quadraticCurveTo(0,-2,12,13)}X.stroke()});
 const carB=live&&!passerPhase()&&!G.pend&&(!G.ball||G.ball.caught)&&G.carrier&&G.carrier.team===0&&!(G.carrier.fallen>0);
 const jr=Math.max(0,G.jcd||0)/0.75;rbtn('juke',carB,JB.x,JB.y,36,jr>0?'#4a3a7a':'#7a3cff','#e2d4ff','JUKE');
 if(carB&&jr>0){X.save();X.globalAlpha=ease('juke',true);X.lineWidth=4;X.strokeStyle='#e2d4ff';X.beginPath();X.arc(JB.x,JB.y,40,-Math.PI/2,-Math.PI/2+(1-jr)*Math.PI*2);X.stroke();X.restore()}
 rbtn('dive',carB&&!G.cdive,DB.x,DB.y,36,'#e8344e','#ffd0d6','DIVE')}
function drawControls(){drawActionButtons();if(!window.PROJ)return;const live=G.st==='live';
 {const sa=ease('snap',G.st==='presnap'&&!G.audOpen);if(sa>0){X.save();X.globalAlpha=1-Math.pow(1-sa,3);const x=W-64,y=H-84;X.translate(x,y);X.scale(0.75+0.25*X.globalAlpha,0.75+0.25*X.globalAlpha);X.translate(-x,-y);const pr=pressed(x-44,y-44,88,88);X.beginPath();X.arc(x,y+5,44,0,7);X.fillStyle='rgba(0,0,0,.4)';X.fill();const yy=y+(pr?3:0);const gg=X.createLinearGradient(0,yy-44,0,yy+44);gg.addColorStop(0,'#3ddc6f');gg.addColorStop(1,'#11853a');X.beginPath();X.arc(x,yy,44,0,7);X.fillStyle=gg;X.fill();X.lineWidth=4;X.strokeStyle='#d6ffe0';X.stroke();txt('SNAP',x,yy+1,20,'#fff');if(G.ovT>0&&G.st==='presnap')txt('ROUTE VIEW',W/2,H-150,12,'#fff');X.restore()}}
 if(live&&G.ball&&!G.ball.caught){const b=G.ball,k=Math.min(1,b.t/b.T);const sh=scr(b.x,b.y,0.02);X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(sh[0],sh[1],7+b.z*0.6,3.5+b.z*0.3,0,0,7);X.fill();
  const fz=b.fz*(1-k)+0.7,wb=Math.sin(G.t*9)*0.5*(1-k),wc=Math.cos(G.t*7)*0.5*(1-k);X.beginPath();for(let i=0;i<=24;i++){const an=i/24*Math.PI*2,q=scr(b.tx+wb+Math.cos(an)*fz,b.ty+wc+Math.sin(an)*fz,0.05);i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])}X.fillStyle='rgba(255,255,255,'+(0.12+k*0.18)+')';X.fill();X.setLineDash([5,5]);X.strokeStyle='rgba(255,255,255,'+(0.4+k*0.5)+')';X.lineWidth=2;X.stroke();X.setLineDash([]);
  if(b.tt&&b.t<0.6)txt(b.tt.toUpperCase()+'!',W/2,H*0.3,18,b.tt==='bomb'?'#ff4d5e':b.tt==='lob'?'#3fd0ff':'#ffd23f')}
 if(live&&passerPhase()&&!G.adv)for(const p of PT.values())if(p.kind==='thr'&&p.w){const ht=(performance.now()-p.t0)/1000,ty=holdType(ht),[bx,by]=bubblePos(p.w),f=Math.min(1,ht/1.1);X.lineWidth=7;X.strokeStyle='rgba(0,0,0,.5)';X.beginPath();X.arc(bx,by,31,-Math.PI/2,Math.PI*1.5);X.stroke();X.strokeStyle=ty==='bomb'?'#ff4d5e':ty==='lob'?'#3fd0ff':'#ffd23f';X.beginPath();X.arc(bx,by,31,-Math.PI/2,-Math.PI/2+f*Math.PI*2);X.stroke();txt(ty.toUpperCase(),bx,by-46,13,X.strokeStyle)}
 if(live&&!G.adv&&G.play&&G.play.t==='pass'&&G.carrier===G.qb&&!G.pend&&!G.ball&&G.st==='live'&&passerPhase()){const pp=passerPhase();
  let lk=[0,0],rk=[0,0],rp=null;for(const p of PT.values()){if(p.kind==='ljoy'){let dx=p.x-LJ.x,dy=p.y-LJ.y,d=Math.hypot(dx,dy);if(d>LJ.r){dx*=LJ.r/d;dy*=LJ.r/d}lk=[dx,dy]}if(p.kind==='rthr'){let dx=p.x-STK.x,dy=p.y-STK.y,d=Math.hypot(dx,dy);if(d>STK.r){dx*=STK.r/d;dy*=STK.r/d}rk=[dx,dy];rp=p}}
  if(!lk[0]&&!lk[1]&&(IN.jx||IN.jy))lk=[IN.jx*LJ.r,IN.jy*LJ.r];
  const stick=(c,k,col,lab)=>{X.beginPath();X.arc(c.x,c.y,c.r,0,7);X.fillStyle='rgba(10,14,36,.55)';X.fill();X.lineWidth=4;X.strokeStyle=col;X.stroke();X.beginPath();X.arc(c.x+k[0],c.y+k[1],24,0,7);X.fillStyle=col;X.fill();X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.5)';X.stroke();txt(lab,c.x,c.y+c.r+16,11,'#fff','center',false)};
  stick(LJ,lk,'#ffffff',G.tuck?'RUN':'MOVE');
  if(0)stick(STK,rk,G.tuck?'#ff8a1f':'#3fd0ff',G.tuck?'TUCKED - PUSH TO THROW':'THROW');
  if(0){const wrs=G.players.filter(q=>q.role==='WR');const RC=['#ff2a2a','#ff8a1f','#ffd400'];const sel=rp&&rp.w;
   for(const w of targets()){if(w===G.rb)continue;const a=tgtAngle(w),i=wrs.indexOf(w),ix=STK.x+Math.cos(a)*(STK.r+20),iy=STK.y+Math.sin(a)*(STK.r+20);X.beginPath();X.arc(ix,iy,sel===w?15:12,0,7);X.fillStyle=RC[i]||'#fff';X.fill();X.lineWidth=sel===w?4:2;X.strokeStyle=sel===w?'#fff':openCol(w);X.stroke();txt(String(i+1),ix,iy+1,11,'#0a0e24','center',false)}
   txt('TUCK',STK.x,STK.y+STK.r-12,10,'#ffb36b','center',false);
   if(sel){const s=scr(sel.x,sel.y,0.05);X.lineWidth=4;X.strokeStyle='#fff';X.beginPath();X.ellipse(s[0],s[1],22,9,0,0,7);X.stroke();const ht=rp.tm?(performance.now()-rp.tm)/1000:0,ty=holdType(ht);txt(ty.toUpperCase(),STK.x,STK.y+STK.r+34,14,ty==='bomb'?'#ff4d5e':ty==='lob'?'#3fd0ff':'#ffd23f');X.lineWidth=6;X.strokeStyle=ty==='bomb'?'#ff4d5e':ty==='lob'?'#3fd0ff':'#ffd23f';X.beginPath();X.arc(STK.x,STK.y,STK.r+4,-Math.PI/2,-Math.PI/2+Math.min(1,ht/1.1)*Math.PI*2);X.stroke()}
   if(rp&&rp.tuckZ)txt('RELEASE TO TUCK',STK.x,STK.y+STK.r+34,11,'#ffb36b')}
  if(pp){if(!G.aim)txt(G.tuck?'TUCKED: DRAG RIGHT SIDE TO THROW':'DRAG BACK ON RIGHT SIDE TO AIM',W*0.72,H-150,10,'rgba(255,255,255,.75)','center',false)}
  X.globalAlpha=1}
 if(live&&passerPhase()&&!G.adv&&!G.pend){const tg=targets();tg.forEach((w,i)=>{const c=openCol(w),[bx,by]=bubblePos(w),pr=pressed(bx-24,by-24,48,48);
  
  if(w===G.rb){G.hoA=canHand()?1:Math.max(0,(G.hoA||0)-0.2);if(G.hoA>0){X.globalAlpha=G.hoA;pill(bx-38,by-14,76,28,'#ff8a1f','#fff');txt('HANDOFF',bx,by+1,12,'#fff','center',false);X.globalAlpha=1}}else{const f=scr(w.x,w.y,0.05);X.globalAlpha=.7;X.beginPath();X.ellipse(f[0],f[1],13,5,0,0,7);X.lineWidth=2;X.strokeStyle=c;X.stroke();X.globalAlpha=1}
  const[ix,iy]=iconPos(i),ip=pressed(ix-22,iy-22,44,44);X.beginPath();X.arc(ix,iy+(ip?2:0),21,0,7);X.fillStyle=c;X.fill();X.lineWidth=3;X.strokeStyle='#0a0e24';X.stroke();txt(w.role==='RB'?'RB':'WR'+(G.players.filter(q=>q.role==='WR').indexOf(w)+1),ix,iy-3+(ip?2:0),10,'#0a0e24','center',false);txt(String(w.num),ix,iy+9+(ip?2:0),11,'#0a0e24','center',false)});
  
  let jd=false;for(const p of PT.values())if(p.kind==='joy'){jd=true;const dx=p.x-p.sx,dy=p.y-p.sy;X.beginPath();X.arc(p.sx,p.sy,50,0,7);X.fillStyle='rgba(255,255,255,.12)';X.fill();X.lineWidth=3;X.strokeStyle='#fff';X.stroke();X.beginPath();X.arc(p.sx+dx,p.sy+dy,22,0,7);X.fillStyle='#fff';X.fill()}
  if(!jd&&G.adv){X.globalAlpha=.35;X.setLineDash([6,6]);X.beginPath();X.arc(80,H-150,46,0,7);X.lineWidth=3;X.strokeStyle='#fff';X.stroke();X.setLineDash([]);X.globalAlpha=1;txt('MOVE',80,H-150,11,'rgba(255,255,255,.7)','center',false)}}
 if(live){for(const p of PT.values())if(p.kind==='joy'){X.globalAlpha=.14;X.strokeStyle='#fff';X.lineWidth=3;X.beginPath();X.arc(p.sx,p.sy,50,0,7);X.stroke();X.globalAlpha=1}
  if(G.aim){const c=G.carrier,a=G.aim,d0=Math.hypot(a.tx-c.x,a.ty-c.y),h=arcH(d0,a.ty2)*0.45;X.strokeStyle=(a.ok?'#3f9bff':'#ff4d5e');X.lineWidth=4;X.beginPath();
   for(let i=0;i<=20;i++){const k=i/20;const q=scr(c.x+(a.tx-c.x)*k,c.y+(a.ty-c.y)*k,1.6+Math.sin(k*Math.PI)*h*2.2);i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])}X.stroke();
   const ring=(x,y,r)=>{X.beginPath();for(let i=0;i<=24;i++){const an=i/24*Math.PI*2,q=scr(x+Math.cos(an)*r,y+Math.sin(an)*r,0.05);i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])}};
   {const q=scr(a.tx,a.ty,0.05);txt(a.ty2.toUpperCase(),q[0],q[1]+24,13,a.ty2==='bullet'?'#ffd23f':a.ty2==='bomb'?'#ff4d5e':'#9fd0ff')}ring(a.tx,a.ty,1.6);X.fillStyle=(a.ok?'rgba(63,155,255,.3)':'rgba(255,77,94,.3)');X.fill();X.strokeStyle=(a.ok?'#3f9bff':'#ff4d5e');X.lineWidth=3;X.stroke();
   if(0&&a.lock){ring(a.lock.x,a.lock.y,2.4);X.setLineDash([6,5]);X.strokeStyle='#ffd23f';X.lineWidth=3;X.stroke();X.setLineDash([]);const q=scr(a.lock.x,a.lock.y,5.4);txt('LOCK',q[0],q[1],11,'#ffd23f')}}
  const runner=!passerPhase()&&!G.pend&&(!G.ball||G.ball.caught)&&G.carrier;
  if(runner&&G.carrier.team===0&&G.play.t!=='ko_'){let kx=IN.jx*LJ.r,ky=IN.jy*LJ.r;const ua=ease('rstk',true);X.save();X.globalAlpha=ua;
   X.beginPath();X.arc(LJ.x,LJ.y,LJ.r,0,7);X.fillStyle='rgba(10,14,36,.55)';X.fill();X.lineWidth=4;X.strokeStyle='#ffffff';X.stroke();
   X.beginPath();X.arc(LJ.x+kx,LJ.y+ky,24,0,7);X.fillStyle='#fff';X.fill();X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.5)';X.stroke();X.restore();
   const bx=20,by=H-46,bw=170;pill(bx,by,bw,18,'rgba(16,20,44,.9)','#ffd23f');rect(bx+3,by+3,(bw-6)*G.stam,12,G.truck?'#ff4d5e':G.stam<.25?'#ff8a1f':'#3fd07a');
   txt('STAMINA',bx+bw/2,by+28,10,'#cfd3da')}else ease('rstk',false)}
 if(G.ko&&G.st==='live')btn(16,H-112,104,52,'TOUCHBACK','#e8344e','#ffd0d6',13);
 if(G.st==='presnap'&&!G.audOpen&&G.play){pill(W/2-90,156,180,26,'rgba(10,14,36,.8)','#ffd23f');txt(G.play.n,W/2,169,13,'#ffd23f','center',false)}if(G.banner&&(G.st==='result'||G.st==='live'||G.st==='presnap')&&G.banner.a<2.2){const k=Math.min(1,G.banner.a/0.32),c1=1.70158,c3=c1+1,eb=1+c3*Math.pow(k-1,3)+c1*Math.pow(k-1,2),y=-90+(G.banner.a>1.8?212-(G.banner.a-1.8)*500:212*eb);pill(24,y,W-48,G.banner.sub?78:58,'#141a3a','#ffd23f');rect(30,y+2,W-60,5,'#e8344e');txt(G.banner.t,W/2,y+30,G.banner.t.length>16?20:26,'#ffd23f');if(G.banner.sub)txt(G.banner.sub,W/2,y+58,13,'#fff')}
 if(G.hint&&!G.paused){const L=G.hint.txt.split('|');const y=H*0.36;pill(28,y,W-56,26+L.length*20,'rgba(10,14,36,.92)','#3fd0ff');txt('TIP',W/2,y+12,10,'#3fd0ff','center',false);L.forEach((l,i)=>txt(l,W/2,y+30+i*20,12,'#fff','center',false))}}

let last=performance.now();function loop(n){const dt=Math.min(0.05,(n-last)/1000);last=n;if(!window.__hold)update(dt);if(window.R3D)window.R3D();render();requestAnimationFrame(loop)}requestAnimationFrame(loop);
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__step=(s,n=1)=>{for(let i=0;i<n;i++)update(s);if(window.R3D)window.R3D();render()};
