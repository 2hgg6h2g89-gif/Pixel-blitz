'use strict';
const C=document.getElementById('c'),X=C.getContext('2d');X.imageSmoothingEnabled=false;
const W=390,H=844,PPY=7.3; // px per yard
const FIELDW=53.3;
const TEAMS=[
 {n:'NEON COYOTES',a:'NCY',c1:'#ff4fa3',c2:'#ffe14f'},
 {n:'IRON HERONS',a:'IHR',c1:'#3fd0ff',c2:'#ffffff'},
 {n:'DUSK RAPTORS',a:'DSK',c1:'#ff8a1f',c2:'#2a1450'},
 {n:'GLACIER YETIS',a:'GLY',c1:'#bfe8ff',c2:'#1a4fa0'},
];
const PLAYS=[
 {n:'SLANT FLOOD',t:'pass',r:[['slant',-1],['out',1],['flat',-1]]},
 {n:'FOUR VERTS',t:'pass',r:[['go',-1],['post',1],['curl',-1]]},
 {n:'CURL & DRAG',t:'pass',r:[['curl',-1],['drag',1],['corner',1]]},
 {n:'HB BLAST',t:'run',r:[['block',-1],['block',1],['block',-1]]},
 {n:'QB KEEPER',t:'keep',r:[['go',-1],['go',1],['block',-1]]},
 {n:'SWEEP LEFT',t:'sweep',r:[['block',-1],['block',1],['block',-1]]},
];
let G={st:'title',t:0,home:0,away:1,sh:0,sa:0,q:1,drive:0,maxDrives:8,los:25,down:1,togo:10,msg:'',msgT:0,sel:0,players:[],ball:null,carrier:null,stats:{py:0,ry:0,td:0,int:0,sack:0},log:[],juke:0,jcd:0,cam:0,snapT:0,shake:0,parts:[]};
window.G=G;
// ---------- input ----------
const IN={down:false,sx:0,sy:0,x:0,y:0,t0:0,jx:0,jy:0,taps:[]};
function pos(e){const r=C.getBoundingClientRect();const p=e.touches?e.touches[0]||e.changedTouches[0]:e;return[(p.clientX-r.left)*W/r.width,(p.clientY-r.top)*H/r.height]}
function pd(e){e.preventDefault();const[x,y]=pos(e);IN.down=true;IN.sx=IN.x=x;IN.sy=IN.y=y;IN.t0=performance.now()}
function pm(e){e.preventDefault();if(!IN.down)return;const[x,y]=pos(e);IN.x=x;IN.y=y;let dx=x-IN.sx,dy=y-IN.sy,d=Math.hypot(dx,dy);const R=50;if(d>R){IN.sx=x-dx/d*R;IN.sy=y-dy/d*R;dx=x-IN.sx;dy=y-IN.sy;d=R}IN.jx=d>6?dx/R:0;IN.jy=d>6?dy/R:0}
function pu(e){e.preventDefault();if(!IN.down)return;IN.down=false;const dt=performance.now()-IN.t0,d=Math.hypot(IN.x-IN.sx,IN.y-IN.sy);if(dt<260&&d<14)IN.taps.push([IN.x,IN.y]);IN.jx=IN.jy=0}
C.addEventListener('touchstart',pd,{passive:false});C.addEventListener('touchmove',pm,{passive:false});C.addEventListener('touchend',pu,{passive:false});
C.addEventListener('mousedown',pd);addEventListener('mousemove',pm);addEventListener('mouseup',pu);
const KEYS={};addEventListener('keydown',e=>{KEYS[e.key]=1;if(e.key===' ')IN.taps.push(null)});addEventListener('keyup',e=>KEYS[e.key]=0);
// ---------- helpers ----------
const rnd=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const sx=x=>x*PPY+ (W-FIELDW*PPY)/2, sy=y=>H*0.62-(y-G.cam)*PPY; // world y increases upfield
const wx=px=>(px-(W-FIELDW*PPY)/2)/PPY, wy=py=>(H*0.62-py)/PPY+G.cam;
function say(m,t=1.6){G.msg=m;G.msgT=t}
// ---------- play setup ----------
function mk(team,role,x,y,num){return{team,role,x,y,vx:0,vy:0,num,sp:0,route:null,anim:0,down:false,tgt:null}}
function setupPlay(p){
 G.play=p;const L=G.los,cx=FIELDW/2;const P=[];
 const qb=mk(0,'QB',cx,L-(p.t==='run'||p.t==='sweep'?4:5),7);P.push(qb);
 const rb=mk(0,'RB',cx+(p.t==='sweep'?-2:0),L-7.5,22);P.push(rb);
 for(let i=-2;i<=2;i++)P.push(mk(0,'OL',cx+i*1.6,L-1,60+i+2));
 const wxs=[cx-19,cx+19,cx-11];
 p.r.forEach((r,i)=>{const w=mk(0,'WR',wxs[i],L-1,[11,84,3][i]);w.route=r[0];w.dir=r[1]*(i===1?-1:1)*(wxs[i]<cx?1:-1);w.rt=0;P.push(w)});
 for(let i=-1;i<=1;i++)P.push(mk(1,'DL',cx+i*2.6,L+1.2,90+i));
 P.push(mk(1,'LB',cx-4,L+5,50));P.push(mk(1,'LB',cx+4,L+5,54));
 const wr=P.filter(q=>q.role==='WR');wr.forEach((w,i)=>{const d=mk(1,'CB',w.x,L+6,20+i);d.man=w;P.push(d)});
 P.push(mk(1,'S',cx,L+15,31));
 G.players=P;G.qb=qb;G.rb=rb;G.carrier=qb;G.ball=null;G.snapT=0;G.cam=L;G.juke=0;G.jcd=0;G.thrown=false;G.passer=true;
 G.st='live';G.handed=false;say(p.t==='pass'?'HIKE!  DRAG TO SCRAMBLE, TAP A RECEIVER':'HIKE!');
}
function routeTarget(w,t){const L=G.los,d=w.dir;
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
function steer(p,tx,ty,sp,dt){let dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);if(d<0.05){p.vx*=0.8;p.vy*=0.8}else{const k=Math.min(1,dt*8);p.vx+=(dx/d*sp-p.vx)*k;p.vy+=(dy/d*sp-p.vy)*k}}
// ---------- live update ----------
function endPlay(kind,y){
 if(G.st!=='live')return;G.st='result';G.resT=1.6;const gain=Math.round((y??G.carrier.y)-G.los);let m='';
 if(kind==='td'){G.sh+=7;G.stats.td++;m='TOUCHDOWN!';G.shake=0.6;burst(G.carrier.x,G.carrier.y);G.next='drive'}
 else if(kind==='int'){G.stats.int++;m='INTERCEPTED!';G.next='drive'}
 else if(kind==='inc'){m='INCOMPLETE';G.down++;G.next='down'}
 else{ if(kind==='sack'){G.stats.sack++;m='SACKED! '+gain+' YDS'}else m=(gain>=0?'+':'')+gain+' YARDS';
  if(G.passer===false||kind==='tackle'){ if(G.play.t==='pass'&&G.thrown)G.stats.py+=Math.max(gain,0);else G.stats.ry+=gain}
  G.los=cl(G.los+gain,1,99);G.togo-=gain;if(G.togo<=0){G.down=1;G.togo=Math.min(10,100-G.los);m+='  FIRST DOWN'}else G.down++;G.next='down'}
 if(G.next==='down'&&G.down>4){m+='  TURNOVER ON DOWNS';G.next='drive'}
 G.log.unshift(m);say(m,1.8);
}
function burst(x,y){for(let i=0;i<40;i++)G.parts.push({x,y,vx:rnd(-8,8),vy:rnd(-8,8),l:rnd(.5,1.2),c:['#ff4fa3','#ffe14f','#3fd0ff'][i%3]})}
function nextAfter(){
 if(G.next==='drive'){ G.drive++;
  // CPU possession sim
  const r=Math.random(),pts=r<0.35?7:r<0.55?3:0;G.sa+=pts;G.log.unshift(TEAMS[G.away].a+(pts?' SCORE +'+pts:' PUNT'));
  G.q=Math.min(4,1+Math.floor(G.drive/2));
  if(G.drive>=G.maxDrives){G.st='final';return}
  G.los=25;G.down=1;G.togo=10;G.st='drivecard';G.cardT=2;return}
 G.st='select';
}
function update(dt){
 G.t+=dt;if(G.msgT>0)G.msgT-=dt;if(G.shake>0)G.shake-=dt;
 G.parts=G.parts.filter(p=>(p.l-=dt)>0);G.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt});
 const taps=IN.taps.splice(0);
 if(G.st==='title'){if(taps.length)G.st='team';return}
 if(G.st==='team'){for(const t of taps){if(!t)continue;const i=Math.floor((t[1]-300)/90);if(t[1]>720){G.st='drivecard';G.cardT=1.5}else if(i>=0&&i<4){G.home=i;G.away=(i+1)%4}}return}
 if(G.st==='drivecard'){G.cardT-=dt;if(G.cardT<=0||taps.length)G.st='select';return}
 if(G.st==='select'){for(const t of taps){if(!t)continue;const i=Math.floor((t[1]-250)/62)*2+(t[0]>W/2?1:0);if(t[1]>250&&i>=0&&i<6)setupPlay(PLAYS[i])}return}
 if(G.st==='result'){G.resT-=dt;if(G.resT<=0)nextAfter();return}
 if(G.st==='final'){if(taps.length){Object.assign(G,{sh:0,sa:0,drive:0,q:1,los:25,down:1,togo:10,log:[],stats:{py:0,ry:0,td:0,int:0,sack:0}});G.st='title'}return}
 if(G.st!=='live')return;
 G.snapT+=dt;const c=G.carrier,P=G.players,p=G.play;
 // auto handoff
 if(!G.handed&&(p.t==='run'||p.t==='sweep')&&G.snapT>0.45){G.carrier=G.rb;G.handed=true;G.passer=false;say('HANDOFF - JUKE WITH A TAP',1)}
 if(!G.handed&&p.t==='keep'){G.handed=true}
 // player control
 let jx=IN.jx,jy=IN.jy;if(KEYS.ArrowLeft)jx=-1;if(KEYS.ArrowRight)jx=1;if(KEYS.ArrowUp)jy=-1;if(KEYS.ArrowDown)jy=1;
 const cur=G.carrier;let sp=cur.role==='QB'?6.2:7.6;if(G.juke>0)sp*=1.5;
 if(!G.ball||G.ball.caught){
  if(jx||jy)steer(cur,cur.x+jx*5,cur.y-jy*5,sp,dt);
  else if(cur.role==='RB'||cur.role==='WR'||(cur.role==='QB'&&p.t==='keep'))steer(cur,cur.x,cur.y+5,sp*0.85,dt);
  else steer(cur,cur.x,cur.y,0,dt);}
 G.juke-=dt;G.jcd-=dt;
 // taps: throw or juke
 for(const t of taps){
  if(cur.role==='QB'&&p.t!=='keep'&&!G.thrown&&p.t==='pass'){
   let best=null,bd=1e9;for(const w of P)if(w.role==='WR'||w.role==='RB'){const d=t?Math.hypot(sx(w.x)-t[0],sy(w.y)-t[1]):w.y;const dd=t?d:-d;if(dd<bd){bd=dd;best=w}}
   if(best&&(!t||bd<70))throwTo(best);else jukeIt();
  }else jukeIt();}
 // receivers
 for(const w of P){if(w===G.carrier)continue;
  if(w.team===0){
   if(w.role==='WR'){w.rt+=dt;if(G.ball&&!G.ball.caught&&G.ball.tgt===w)steer(w,G.ball.tx,G.ball.ty,7.4,dt);else if(G.passer===false)steer(w,w.x,w.y+1,4,dt);else{const r=routeTarget(w,w.rt);steer(w,r.x,r.y,w.route==='block'?3:7.2,dt)}}
   else if(w.role==='OL'){const near=nearest(w,1,['DL','LB']);if(near)steer(w,(near.x+G.carrier.x)/2,(near.y+G.carrier.y)/2,4.4,dt)}
   else if(w.role==='RB'&&!G.handed){steer(w,w.x+(p.t==='pass'?3:0),w.y+(p.t==='pass'?1:3),5,dt)}
   else if(w.role==='RB'){steer(w,w.x+2,w.y+1.5,5,dt)}
   else if(w.role==='QB'){steer(w,w.x,w.y-0.2,2,dt)}
  }else defend(w,dt);}
 for(const q of P){q.x+=q.vx*dt;q.y+=q.vy*dt;q.x=cl(q.x,0.5,FIELDW-0.5);q.anim+=Math.hypot(q.vx,q.vy)*dt}
 // OL vs DL separation
 const hold=(G.play.t!=='pass')||G.snapT<2.8?1:Math.max(0.15,1-(G.snapT-2.8)*0.6);for(const a of P)for(const b of P){if(a===b||a.team!==0||b.team!==1||a===G.carrier||a.role==='QB')continue;const d=dist(a,b);if(d<1.1&&d>0){const k=(1.1-d)/2*(a.role==='OL'?hold:0.5);const ux=(a.x-b.x)/d,uy=(a.y-b.y)/d;a.x+=ux*k;a.y+=uy*k;b.x-=ux*k;b.y-=uy*k}}
 // ball flight
 if(G.ball&&!G.ball.caught){const b=G.ball;b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.x0+(b.tx-b.x0)*k;b.y=b.y0+(b.ty-b.y0)*k;b.z=Math.sin(k*Math.PI)*b.h;
  if(k>=1){const w=b.tgt;const dd=P.filter(q=>q.team===1).reduce((m,q)=>Math.min(m,Math.hypot(q.x-b.x,q.y-b.y)),99);const wd=Math.hypot(w.x-b.x,w.y-b.y);
   if(dd<1.1&&dd<wd&&Math.random()<0.6){endPlay('int');return}
   if(wd<1.8&&!(dd<0.9&&Math.random()<0.5)){b.caught=true;G.carrier=w;G.passer=false;say('CATCH!',0.8)}else{endPlay('inc');return}}}
 // tackles
 const cc=G.carrier;if(!(G.ball&&!G.ball.caught)){
  for(const d of P){if(d.team!==1)continue;if(dist(d,cc)<1.15){
   if(G.juke>0){d.stun=0.8;continue}
   if(d.stun>0)continue;
   const behind=cc.role==='QB'&&cc.y<G.los&&G.play.t!=='keep';endPlay(behind&&!G.thrown?'sack':'tackle',cc.y);return}}}
 for(const d of P)if(d.stun>0)d.stun-=dt;
 if(cc.y>=100){endPlay('td',100);return}
 if(cc.x<=0.6||cc.x>=FIELDW-0.6){if(G.snapT>0.5){say('OUT OF BOUNDS');endPlay('tackle',cc.y);return}}
 G.cam+=((G.ball&&!G.ball.caught?G.ball.y:cc.y)+4-G.cam)*Math.min(1,dt*4);
}
function nearest(p,team,roles){let b=null,bd=1e9;for(const q of G.players)if(q.team===team&&roles.includes(q.role)){const d=dist(p,q);if(d<bd){bd=d;b=q}}return b}
function defend(d,dt){if(d.stun>0){d.vx*=0.9;d.vy*=0.9;return}
 const c=G.carrier,inAir=G.ball&&!G.ball.caught;const rushBoost=G.snapT>3.2?1.35:1;let sp={DL:5.4*rushBoost,LB:6.2,CB:7,S:6.8}[d.role];
 if(G.snapT<0.25)return;if(G.play.t!=='pass'&&G.snapT<1.3)sp*=d.role==='DL'?0.45:0.6;
 // pursuit
 const pursue=!G.passer||c.role!=='QB'||d.role==='DL'||(d.role==='LB'&&G.snapT>2.2)||(c.y>G.los-0.5);
 if(inAir){const b=G.ball;if(Math.hypot(d.x-b.tx,d.y-b.ty)<8)return steer(d,b.tx,b.ty,sp*1.05,dt)}
 if(d.role==='CB'&&!pursue&&d.man){return steer(d,d.man.x+(d.man.vx*0.3),d.man.y+1.2+d.man.vy*0.2,sp*0.97,dt)}
 if(d.role==='S'&&!pursue){const wrs=G.players.filter(q=>q.role==='WR');let deep=wrs.reduce((a,b)=>a.y>b.y?a:b);return steer(d,(deep.x+FIELDW/2)/2,Math.max(deep.y+4,G.los+12),sp*0.8,dt)}
 if(d.role==='LB'&&!pursue){return steer(d,c.x+(d.x<FIELDW/2?-3:3),G.los+5,sp*0.6,dt)}
 // lead the carrier
 const lead=Math.min(1.2,dist(d,c)/sp);steer(d,c.x+c.vx*lead*0.8,c.y+c.vy*lead*0.8,sp,dt)}
function throwTo(w){const q=G.carrier;const d0=dist(q,w);const T=0.35+d0/26;const tx=cl(w.x+w.vx*T,1,FIELDW-1),ty=w.y+w.vy*T;
 G.ball={x0:q.x,y0:q.y,x:q.x,y:q.y,tx,ty,t:0,T,h:1.5+d0*0.15,tgt:w,caught:false,z:0};G.thrown=true;if(q.y>G.los+0.5){endPlay('inc');say('ILLEGAL FORWARD PASS');}}
function jukeIt(){if(G.jcd>0)return;G.juke=0.35;G.jcd=1.1;const c=G.carrier;const s=(IN.jx||Math.sign(Math.random()-.5));c.vx+=s*6;say('JUKE!',0.5)}
// ---------- rendering ----------
const PAL={bg:'#120a24',grass1:'#2f8a3c',grass2:'#2a7f36',line:'#e9f5e1',txt:'#fff4d6',pink:'#ff4fa3',yel:'#ffe14f',cy:'#3fd0ff'};
function rect(x,y,w,h,c){X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),w,h)}
const FONT={};
function txt(s,x,y,sz=16,c=PAL.txt,al='center',sh=true){X.font=`bold ${sz}px "Courier New",monospace`;X.textAlign=al;X.textBaseline='middle';if(sh){X.fillStyle='#000';X.fillText(s,x+2,y+2)}X.fillStyle=c;X.fillText(s,x,y)}
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
function drawJoy(){if(!IN.down||G.st!=='live')return;X.globalAlpha=.5;X.strokeStyle=PAL.cy;X.lineWidth=3;X.beginPath();X.arc(IN.sx,IN.sy,50,0,7);X.stroke();X.fillStyle=PAL.cy;X.beginPath();X.arc(IN.sx+IN.jx*50,IN.sy+IN.jy*50,18,0,7);X.fill();X.globalAlpha=1}
function stars(){for(let i=0;i<60;i++){const x=(i*97)%W,y=(i*53+G.t*10*(1+i%3))%H;rect(x,y,2,2,i%5?'#3a2a6a':PAL.cy)}}
function sun(cy){for(let i=0;i<14;i++){const y=cy-70+i*10;const w=Math.sqrt(Math.max(0,70*70-(y-cy)*(y-cy)))*2;if(i>7&&i%2)continue;rect(W/2-w/2,y,w,8,i<5?PAL.yel:i<9?'#ff8a1f':PAL.pink)}}
function render(){
 X.save();if(G.shake>0)X.translate(rnd(-4,4),rnd(-4,4));
 rect(0,0,W,H,PAL.bg);
 if(G.st==='title'){stars();sun(390);for(let i=0;i<10;i++){const y=460+i*i*4;rect(0,y,W,2,PAL.pink)}for(let i=-8;i<=8;i++){X.strokeStyle=PAL.pink;X.beginPath();X.moveTo(W/2+i*10,460);X.lineTo(W/2+i*80,H);X.stroke()}
  box(30,140,W-60,110,'#120a24',PAL.cy);txt('PIXEL',W/2,175,44,PAL.yel);txt('BLITZ',W/2,222,44,PAL.pink);
  txt('ARCADE GRIDIRON',W/2,280,14,PAL.cy);if(Math.floor(G.t*2)%2)txt('TAP TO START',W/2,700,22,PAL.txt);txt('(C) 2026 LOCK IN LABS',W/2,800,10,'#8a7ab0');X.restore();return}
 if(G.st==='team'){stars();txt('PICK YOUR TEAM',W/2,200,24,PAL.yel);TEAMS.forEach((t,i)=>{const y=300+i*90;box(30,y,W-60,74,G.home===i?'#2a1450':'#120a24',G.home===i?PAL.yel:'#5a4a8a');rect(48,y+18,38,38,t.c1);rect(56,y+26,22,22,t.c2);txt(t.n,110,y+30,17,PAL.txt,'left');txt(['OFF 82  DEF 74','OFF 76  DEF 85','OFF 88  DEF 68','OFF 79  DEF 80'][i],110,y+52,12,PAL.cy,'left')});
  box(60,740,W-120,56,PAL.pink,PAL.yel);txt('KICK OFF',W/2,768,22,PAL.txt);txt('VS '+TEAMS[G.away].n,W/2,712,14,PAL.cy);X.restore();return}
 drawField();
 if(G.st==='live'||G.st==='result'){const ps=[...G.players].sort((a,b)=>b.y-a.y);ps.forEach(drawPlayer);drawBall()}
 G.parts.forEach(p=>rect(sx(p.x),sy(p.y),4,4,p.c));
 drawScoreboard();
 if(G.st==='select'){rect(0,90,W,H,'rgba(10,5,25,.82)');txt('CALL A PLAY',W/2,200,26,PAL.yel);
  PLAYS.forEach((p,i)=>{const x=i%2?W/2+6:20,y=250+Math.floor(i/2)*62;box(x,y,W/2-26,52,'#120a24',p.t==='pass'?PAL.cy:PAL.pink);txt(p.n,x+(W/2-26)/2,y+20,14,PAL.txt);txt(p.t.toUpperCase(),x+(W/2-26)/2,y+38,10,p.t==='pass'?PAL.cy:PAL.pink)});
  box(20,470,W-40,150,'#120a24','#5a4a8a');txt('LAST PLAYS',W/2,490,12,PAL.cy);G.log.slice(0,5).forEach((l,i)=>txt(l,W/2,514+i*21,12,PAL.txt));
  box(20,640,W-40,110,'#120a24','#5a4a8a');txt('STATS',W/2,660,12,PAL.cy);const s=G.stats;txt('PASS '+s.py+'  RUSH '+s.ry+'  TD '+s.td,W/2,690,14,PAL.txt);txt('INT '+s.int+'  SACKED '+s.sack,W/2,716,14,PAL.txt)}
 if(G.st==='drivecard'){box(30,330,W-60,150,'#120a24',PAL.pink);txt('YOUR BALL',W/2,375,30,PAL.yel);txt('DRIVE '+(G.drive+1)+' OF '+G.maxDrives,W/2,415,16,PAL.cy);txt(G.log[0]||'KICKOFF RETURN TO THE 25',W/2,448,13,PAL.txt)}
 if(G.st==='final'){rect(0,90,W,H,'rgba(10,5,25,.88)');box(30,220,W-60,360,'#120a24',PAL.yel);txt('FINAL',W/2,260,34,PAL.pink);
  txt(TEAMS[G.home].a+' '+G.sh+'  -  '+G.sa+' '+TEAMS[G.away].a,W/2,320,24,PAL.yel);txt(G.sh>G.sa?'VICTORY':G.sh<G.sa?'DEFEAT':'TIE GAME',W/2,370,26,G.sh>=G.sa?PAL.cy:PAL.pink);
  const s=G.stats;txt('PASS YDS  '+s.py,W/2,430,16);txt('RUSH YDS  '+s.ry,W/2,458,16);txt('TOUCHDOWNS  '+s.td,W/2,486,16);txt('INT '+s.int+'   SACKED '+s.sack,W/2,514,16);txt('TAP FOR NEW GAME',W/2,556,14,PAL.cy)}
 if(G.msgT>0&&(G.st==='live'||G.st==='result')){box(20,H-110,W-40,46,'#120a24',PAL.pink);txt(G.msg,W/2,H-87,G.msg.length>26?12:20,PAL.yel)}
 if(G.st==='live'&&G.carrier.role!=='QB'||G.st==='live'&&G.play.t==='keep')txt(G.jcd>0?'JUKE RECHARGING':'TAP = JUKE',W/2,H-30,12,G.jcd>0?'#8a7ab0':PAL.cy);
 if(G.st==='live'&&G.carrier.role==='QB'&&G.play.t==='pass'&&!G.thrown){const pr=Math.min(1,G.snapT/4.5);box(20,H-40,W-40,16,'#120a24','#5a4a8a');rect(23,H-37,(W-46)*pr,10,pr>.7?PAL.pink:PAL.cy);txt('POCKET',W/2,H-56,10,PAL.txt)}
 drawJoy();X.restore();
}
let last=performance.now();function loop(n){const dt=Math.min(0.05,(n-last)/1000);last=n;update(dt);render();requestAnimationFrame(loop)}requestAnimationFrame(loop);
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__step=(s,n=1)=>{for(let i=0;i<n;i++)update(s);render()};
