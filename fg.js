// PIXEL BLITZ v14: 4th-down choice, PAT / 2-pt, three-tap field goal meter
(function(){
const FGMAX=55;
function fgYds(){return Math.round(117-G.los)}
function canFG(){return fgYds()<=FGMAX}
function k4Btns(){const y=160,g=6,ws=canFG()?[(W-24-2*g)/3,(W-24-2*g)/3,(W-24-2*g)/3]:[(W-24-g)/2,0,(W-24-g)/2];const out=[];let x=12;
 out.push({k:'go',x,y,w:ws[0],h:34,l:'GO FOR IT'});x+=ws[0]+g;if(canFG()){out.push({k:'fg',x,y,w:ws[1],h:34,l:'FIELD GOAL '+fgYds()});x+=ws[1]+g}out.push({k:'punt',x,y,w:ws[2],h:34,l:'PUNT'});return out}
function hit(b,t){return t&&t[0]>=b.x&&t[0]<=b.x+b.w&&t[1]>=b.y&&t[1]<=b.y+b.h}
function patBtns(){const w=(W-36)/2,y=H-150;return[{k:'pat',x:12,y,w,h:64,l:'PAT KICK',s:'+1'},{k:'two',x:24+w,y,w,h:64,l:'GO FOR 2',s:'+2  FROM THE 2'}]}
const AIMB={l:{x:16,y:H-96,w:60,h:60},r:{x:86,y:H-96,w:60,h:60}};
const MC={x:W-92,y:H-176,r:64};const KB={x:W-170,y:H-92,w:156,h:60};
function windFor(){const ranges=[[0,5],[0,9],[3,13],[5,18]][G.diff];const s=Math.round(rnd(ranges[0],ranges[1]));const a=Math.random()*Math.PI*2;return{s,a,x:Math.cos(a)*s,y:Math.sin(a)*s}}
function startFG(pat){const cx=FIELDW/2;if(pat)G.los=98;const L=G.los,P=[];
 for(let i=-3;i<=3;i++)P.push(mk(0,'OL',cx+i*2.2,L-1,[60,72,65,61,66,77,88][i+3]));
 const hold=mk(0,'QB',cx-0.6,L-7,4);P.push(hold);const kk=mk(0,'RB',cx-2.6,L-9.8,8);kk.role='K';P.push(kk);
 [-5,-2.6,-0.8,0.8,2.6,5].forEach((o,i)=>P.push(mk(1,'DL',cx+o,L+1.4,[90,94,97,92,99,95][i])));P.push(mk(1,'LB',cx-4,L+4,50));P.push(mk(1,'LB',cx+4,L+4,54));
 G.players=P;G.qb=hold;G.rb=kk;G.carrier=null;G.ball=null;G.routes=[];G.routeVer=(G.routeVer||0)+1;G.play={t:'fg',n:'FIELD GOAL'};G.cam=L;G.ovT=0;G.audOpen=false;
 G.fg={pat,ph:'ready',n:0,pow:0,acc:null,aim:0,wind:windFor(),t:0,kk,x0:cx,y0:L-7,kx0:kk.x,ky0:kk.y,res:null};G.fgBall={x:cx,y:L-7,z:0.2};G.st='fg';G.celeb=false;
 hint('fg','TAP KICK TO START THE METER|TAP AGAIN TO SET POWER|TAP AT THE GREEN LINE FOR ACCURACY');}
window.startFG=startFG;
function spd(){return 95*[0.8,1,1.2,1.4][G.diff]}
function range(pow){return 32+0.3*Math.min(pow,100)+0.45*Math.max(0,pow-100)}
function pathAt(f,s,pow,e,wind){const R=range(pow)+(wind?wind.y*0.4:0);const a=(f.aim+e*0.35)*Math.PI/180;const al=R*s;
 let x=f.x0+Math.sin(a)*al+e*0.012*al*s*(1+Math.max(0,pow-100)/15)+(wind?wind.x*0.00016*al*al:0);const y=f.y0+Math.cos(a)*al;const z=0.2+R*0.42*4*s*(1-s);return{x,y,z,R}}
function kick(){const f=G.fg;f.ph='fly';f.t=0;const e=f.acc*(1+Math.max(0,f.pow-100)/15);f.e=e;f.kk.throwT=0.3;f.kk.throwDur=0.3;
 const pure=Math.abs(f.acc)<1.2;f.pure=pure;f.pct=Math.max(0,Math.round(100-Math.abs(f.acc)*6));if(pure){say('PURE!  '+f.pct+'%',1.4);G.flash={x:f.x0,y:f.y0,t:0}}else say((f.acc>0?'EARLY - HOOKS RIGHT':'LATE - HOOKS LEFT')+'  '+f.pct+'%',1.4);
 f.T=1.3+range(f.pow)/40;G.shake=0.15}
function judge(){const f=G.fg;const cx=FIELDW/2;let s=0,lo=0,hi=1;const p0=pathAt(f,1,f.pow,f.e,f.wind);
 if(p0.y<110){return{good:false,why:'SHORT'}}
 for(let i=0;i<40;i++){s=(lo+hi)/2;const p=pathAt(f,s,f.pow,f.e,f.wind);if(p.y<110)lo=s;else hi=s}
 const p=pathAt(f,s,f.pow,f.e,f.wind);if(p.z<5)return{good:false,why:'SHORT'};if(Math.abs(p.x-cx)>3)return{good:false,why:p.x<cx?'WIDE LEFT':'WIDE RIGHT'};return{good:true,why:''}}
function finishFG(){const f=G.fg;const r=judge();f.res=r;f.ph='done';G.st='result';G.resT=2.0;G.next='drive';G.fgDone=true;
 if(r.good){G.sh+=f.pat?1:3;G.celeb=true;burst(FIELDW/2,110);G.shake=0.4}
 banner(r.good?'GOOD!':'NO GOOD',r.good?(f.pat?'EXTRA POINT':'FIELD GOAL  '+fgYds()+' YDS'):r.why);G.log.unshift((f.pat?'PAT ':'FG ')+(r.good?'GOOD':'NO GOOD'));if(!f.pat)G.clock=Math.max(0,G.clock-5)}
function fgUpdate(dt,taps){const f=G.fg;f.t+=dt;const kk=f.kk;
 for(const t of taps){if(!t){if(f.ph!=='fly'&&f.ph!=='done')press();continue}
  if(f.ph==='ready'||f.ph==='power'){if(hit(AIMB.l,t)&&f.ph==='ready'){f.aim=Math.max(-10,f.aim-1);continue}if(hit(AIMB.r,t)&&f.ph==='ready'){f.aim=Math.min(10,f.aim+1);continue}}
  if(f.ph!=='fly'&&f.ph!=='done')press()}
 function press(){if(f.ph==='ready'){f.ph='power';f.n=0}else if(f.ph==='power'){f.pow=f.n;f.ph='acc'}else if(f.ph==='acc'){f.acc=f.n;kick()}}
 if(f.ph==='power'){f.n+=spd()*dt;if(f.n>=120){f.n=120;f.pow=120;f.ph='acc'}}
 else if(f.ph==='acc'){f.n-=spd()*1.35*(1+Math.max(0,f.pow-100)/40)*dt;if(f.n<=-20){f.n=-20;f.acc=-20;kick()}}
 if(f.ph==='power'||f.ph==='acc'){const k=f.ph==='power'?f.n/120*0.7:0.7+0.3*(1-Math.max(0,f.n)/Math.max(1,f.pow));steer(kk,f.kx0+(f.x0-0.5-f.kx0)*k,f.ky0+(f.y0-0.8-f.ky0)*k,6,dt)}
 else{kk.vx*=0.8;kk.vy*=0.8}
 kk.x+=kk.vx*dt;kk.y+=kk.vy*dt;kk.anim+=Math.hypot(kk.vx,kk.vy)*dt;if(kk.throwT>0)kk.throwT-=dt;
 if(f.ph==='fly'){const s=Math.min(1.15,f.t/f.T);const p=pathAt(f,s,f.pow,f.e,f.wind);G.fgBall={x:p.x,y:p.y,z:Math.max(0.2,p.z)};
  G.players.forEach(q=>{if(q.team===1){steer(q,q.x,q.y-1,2,dt);q.x+=q.vx*dt;q.y+=q.vy*dt;q.anim+=dt}});if(p.y>=112||s>=1.15)finishFG()}}
// update wrapper
const _u=update;update=function(dt){
 if(G.st==='fg'&&!G.paused){G.t+=dt;if(G.msgT>0)G.msgT-=dt;if(G.shake>0)G.shake-=dt;if(G.flash){G.flash.t+=dt;if(G.flash.t>0.45)G.flash=null}if(G.banner)G.banner.a+=dt;if(G.hint){G.hint.t-=dt;if(G.hint.t<=0)G.hint=null}G.parts=G.parts.filter(p=>(p.l-=dt)>0);G.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt});
  const taps=IN.taps.splice(0),keys=IN.keyp.splice(0);if(keys.includes(' '))taps.push(null);if(taps.some(t=>t&&t[0]<52&&t[1]<50)){G.paused=true;return}fgUpdate(dt,taps);return}
 if(G.st==='patpick'&&!G.paused){G.t+=dt;if(G.banner)G.banner.a+=dt;const taps=IN.taps.splice(0);IN.keyp.splice(0);
  for(const t of taps){for(const b of patBtns())if(hit(b,t)){if(b.k==='pat')startFG(true);else{G.two=true;G.los=98;G.down=1;G.togo=2;autoPick();banner('GO FOR 2','ONE PLAY FROM THE 2')}return}}return}
 if(G.st==='presnap'&&G.down===4&&!G.two&&!G.paused&&!G.audOpen){const keep=[];for(const t of IN.taps){let used=false;for(const b of k4Btns())if(hit(b,t)){used=true;
   if(b.k==='fg')startFG(false);else if(b.k==='punt'){const net=Math.round(rnd(36,48));G.st='result';G.resT=1.8;G.next='drive';const spot=Math.min(100,G.los+net);banner('PUNT',(spot>=100?'TOUCHBACK':net+' YARDS'));G.log.unshift('PUNT '+net+' YDS')}else say('GOING FOR IT!',1.0)}
  if(!used)keep.push(t)}IN.taps.length=0;keep.forEach(t=>IN.taps.push(t));if(G.st!=='presnap')return}
 _u(dt)};
// draw
function arcBtn(b,label,sub,fill,stroke,on){const pr=pressed(b.x,b.y,b.w,b.h);const o=pr?2:0;pill(b.x,b.y+3,b.w,b.h,'rgba(0,0,0,.45)');pill(b.x,b.y+o,b.w,b.h,fill,stroke);txt(label,b.x+b.w/2,b.y+o+(sub?b.h/2-8:b.h/2),label.length>11?12:15,'#fff','center',false);if(sub)txt(sub,b.x+b.w/2,b.y+o+b.h/2+12,10,'#ffe9a8','center',false)}
function v2a(v){return Math.PI+(v+20)/140*Math.PI}
function drawMeter(){const f=G.fg,c=MC;X.save();
 X.beginPath();X.arc(c.x,c.y,c.r+10,Math.PI,2*Math.PI);X.closePath();X.fillStyle='rgba(10,14,36,.88)';X.fill();X.lineWidth=3;X.strokeStyle='#4fa3ff';X.stroke();
 const band=(a,b,col,w)=>{X.beginPath();X.arc(c.x,c.y,c.r-4,v2a(a),v2a(b));X.lineWidth=w||12;X.strokeStyle=col;X.stroke()};
 band(-20,100,'#1d2a5e');band(0,100,'rgba(80,140,255,.55)');band(100,120,'#e8344e');band(-3,3,'#2fd35f',14);
 for(let v=0;v<=100;v+=25){const a=v2a(v);X.beginPath();X.moveTo(c.x+Math.cos(a)*(c.r-14),c.y+Math.sin(a)*(c.r-14));X.lineTo(c.x+Math.cos(a)*(c.r+4),c.y+Math.sin(a)*(c.r+4));X.lineWidth=2;X.strokeStyle='rgba(255,255,255,.6)';X.stroke()}
 {const a=v2a(0);X.beginPath();X.moveTo(c.x+Math.cos(a)*(c.r-16),c.y+Math.sin(a)*(c.r-16));X.lineTo(c.x+Math.cos(a)*(c.r+6),c.y+Math.sin(a)*(c.r+6));X.lineWidth=2;X.strokeStyle='#fff';X.stroke()}
 if(f.ph!=='ready'&&f.pow){const a=v2a(f.pow);X.fillStyle='#ffd23f';X.beginPath();X.arc(c.x+Math.cos(a)*(c.r+6),c.y+Math.sin(a)*(c.r+6),5,0,7);X.fill()}
 {const v=f.ph==='ready'?-20:f.ph==='fly'||f.ph==='done'?f.acc:f.n;const a=v2a(v);X.beginPath();X.moveTo(c.x,c.y);X.lineTo(c.x+Math.cos(a)*(c.r+2),c.y+Math.sin(a)*(c.r+2));X.lineWidth=4;X.strokeStyle='#fff';X.lineCap='round';X.stroke();X.beginPath();X.arc(c.x,c.y,6,0,7);X.fillStyle='#ffd23f';X.fill()}
 txt(f.ph==='power'?'POWER':f.ph==='acc'?'ACCURACY':f.ph==='ready'?'KICK METER':Math.round(f.pow)+'% PWR',c.x,c.y-c.r-20,10,'#bcd0ff','center',false);
 if(f.pow>100&&f.ph!=='ready')txt('OVERSWING',c.x,c.y+14,10,'#ff6a7a','center',false);X.restore()}
function drawWind(){const w=G.fg.wind,x=W-48,y=184;pill(x-38,y-30,76,62,'rgba(10,14,36,.85)','#4fa3ff');txt('WIND',x,y-18,9,'#9fb3ff','center',false);
 // screen-space arrow: world +x is screen right, world +y is screen up
 const a=Math.atan2(-w.y,w.x);X.save();X.translate(x,y+2);X.rotate(a);X.fillStyle='#ffd23f';X.beginPath();X.moveTo(14,0);X.lineTo(2,-8);X.lineTo(2,-3);X.lineTo(-12,-3);X.lineTo(-12,3);X.lineTo(2,3);X.lineTo(2,8);X.closePath();X.fill();X.restore();txt(w.s+' MPH',x,y+22,11,'#fff','center',false)}
function drawPreview(){const f=G.fg;if(f.ph==='fly'||f.ph==='done')return;let tgt=null;for(let i=1;i<=30;i++){const s=i/30;const p=pathAt(f,s,100,0,null);if(p.y>110){break}const q=scr(p.x,p.y,p.z);X.fillStyle='rgba(255,255,255,'+(0.35+0.5*s)+')';X.fillRect(q[0]-2,q[1]-2,4,4);tgt=p}
 let lo=0,hi=1;for(let i=0;i<30;i++){const s=(lo+hi)/2;if(pathAt(f,s,100,0,null).y<110)lo=s;else hi=s}const p=pathAt(f,lo,100,0,null);if(p.y>=109){const q=scr(p.x,111,Math.min(12,Math.max(6,p.z)));X.beginPath();X.arc(q[0],q[1],6,0,7);X.fillStyle='#ff4fa3';X.fill();X.lineWidth=2;X.strokeStyle='#fff';X.stroke()}}
const _r=render;render=function(){_r();if(!window.PROJ)return;X.save();X.setTransform(DPR,0,0,DPR,0,0);
 if(G.st==='presnap'&&G.down===4&&!G.two&&!G.audOpen&&!G.paused){for(const b of k4Btns())arcBtn(b,b.l,null,b.k==='go'?'#1f9a4a':b.k==='fg'?'#1f6fd6':'#5a4a8a','#fff')}
 if(G.st==='patpick'){X.fillStyle='rgba(8,10,30,.55)';X.fillRect(0,H-200,W,200);txt('TOUCHDOWN! CHOOSE',W/2,H-176,14,'#ffd23f','center',true);for(const b of patBtns())arcBtn(b,b.l,b.s,b.k==='pat'?'#1f6fd6':'#e8344e','#fff')}
 if(G.st==='fg'||(G.st==='result'&&G.fgDone)){const f=G.fg;if(f&&G.st==='fg'){drawPreview();drawMeter();drawWind();
   const lab=f.ph==='ready'?'KICK':f.ph==='fly'?'':'TAP';if(lab){const tap=f.ph!=='ready';arcBtn(KB,lab,null,tap?'#e8344e':'#ff8a1f','#fff')}
   if(f.ph==='ready'){arcBtn(AIMB.l,'<',null,'#2b3a7a','#8fc4ff');arcBtn(AIMB.r,'>',null,'#2b3a7a','#8fc4ff');txt('AIM '+(f.aim>0?'R ':f.aim<0?'L ':'')+Math.abs(f.aim),81,H-108,11,'#fff','center',false)}
   txt((f.pat?'PAT':'FIELD GOAL')+'  '+fgYds()+' YDS',W/2,172,15,'#fff','center',true)}}
 if(G.msgT>0&&G.st==='fg'){pill(40,200,W-80,34,'rgba(14,20,48,.88)',G.fg&&G.fg.pure?'#2fd35f':'#4fa3ff');txt(G.msg,W/2,217,G.msg.length>22?13:18,G.fg&&G.fg.pure?'#5dff8a':PAL.yel)}
 X.restore()};
})();
