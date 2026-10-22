// PIXEL BLITZ v16: original 90s arcade-fighter style UI (HUD, buttons, callouts, title, VS)
(function(){
const F=(s,it)=>`${it===false?'':'italic '}900 ${s}px "Arial Black", Impact, "Trebuchet MS", sans-serif`;
// big outlined arcade lettering with vertical gradient fill
function arcTxt(s,x,y,size,cols,o){o=o||{};X.save();X.font=F(size,o.it);X.textAlign=o.al||'center';X.textBaseline='middle';X.lineJoin='round';
 if(o.sk){X.translate(x,y);X.transform(1,0,-o.sk,1,0,0);x=0;y=0}
 X.lineWidth=size*0.32;X.strokeStyle='rgba(0,0,0,.55)';X.strokeText(s,x+size*0.06,y+size*0.1);
 X.lineWidth=size*0.26;X.strokeStyle=o.out||'#12081e';X.strokeText(s,x,y);
 if(o.rim!==false){X.lineWidth=size*0.1;X.strokeStyle=o.rim||'#ffffff';X.strokeText(s,x,y)}
 const g=X.createLinearGradient(0,y-size*0.5,0,y+size*0.5);cols.forEach((c,i)=>g.addColorStop(i/(cols.length-1),c));X.fillStyle=g;X.fillText(s,x,y);
 if(o.shine!==false){X.save();X.beginPath();X.rect(-2000,y-size*0.55,4000,size*0.42);X.clip();X.fillStyle='rgba(255,255,255,.28)';X.fillText(s,x,y);X.restore()}
 X.restore()}
window.arcTxt=arcTxt;
const CHROME=['#ffffff','#cfe3ff','#6f86b8','#f4f8ff','#9fb0d0'],FIRE=['#fff6a0','#ffd23f','#ff8a1f','#e8344e','#8a1030'],GOLD=['#fffbe0','#ffe14f','#e8a10a','#fff3a0','#b8730a'];
window.ARC={CHROME,FIRE,GOLD};
// angular beveled panel path
function bev(x,y,w,h,c){c=Math.min(c,h/2);X.beginPath();X.moveTo(x+c,y);X.lineTo(x+w-c,y);X.lineTo(x+w,y+c);X.lineTo(x+w,y+h-c);X.lineTo(x+w-c,y+h);X.lineTo(x+c,y+h);X.lineTo(x,y+h-c);X.lineTo(x,y+c);X.closePath()}
function bevPanel(x,y,w,h,fill,o){o=o||{};const c=o.c??Math.min(12,h*0.3);
 X.save();bev(x-3,y-3+(o.drop??4),w+6,h+6,c+1);X.fillStyle='rgba(0,0,0,.5)';X.fill();
 bev(x-3,y-3,w+6,h+6,c+1);X.fillStyle=o.out||'#0b0614';X.fill();
 bev(x,y,w,h,c);const g=X.createLinearGradient(0,y,0,y+h);g.addColorStop(0,HELM.mix(fill,1.45));g.addColorStop(.48,fill);g.addColorStop(.52,HELM.mix(fill,.82));g.addColorStop(1,HELM.mix(fill,.5));X.fillStyle=g;X.fill();
 X.save();bev(x,y,w,h,c);X.clip();X.fillStyle='rgba(255,255,255,.35)';X.fillRect(x,y,w,2.5);X.fillStyle='rgba(0,0,0,.35)';X.fillRect(x,y+h-3,w,3);
 const gl=X.createLinearGradient(0,y,0,y+h*0.5);gl.addColorStop(0,'rgba(255,255,255,.38)');gl.addColorStop(1,'rgba(255,255,255,0)');X.fillStyle=gl;X.beginPath();X.moveTo(x,y);X.lineTo(x+w,y);X.lineTo(x+w,y+h*0.32);X.quadraticCurveTo(x+w/2,y+h*0.52,x,y+h*0.32);X.fill();
 if(o.flash){X.fillStyle='rgba(255,255,255,'+o.flash+')';X.fillRect(x,y,w,h)}X.restore();
 if(o.edge){bev(x,y,w,h,c);X.lineWidth=2;X.strokeStyle=o.edge;X.stroke()}X.restore()}
window.bevPanel=bevPanel;
// rectangular arcade button
const flashT={};function pf(k,pr){const n=performance.now();if(pr&&!flashT[k])flashT[k]=n;if(!pr&&flashT[k]&&n-flashT[k]>160)flashT[k]=0;return flashT[k]?Math.max(0,1-(n-flashT[k])/160)*0.5:0}
btn=function(x,y,w,h,label,fill,stroke,sz,sub){const pr=pressed(x,y,w,h);const o=pr?3:0;const k='b'+x+'_'+y;
 bevPanel(x,y+o,w,h,fill,{drop:pr?1:5,edge:stroke,flash:pf(k,pr)});
 arcTxt(label,x+w/2,y+o+h/2-(sub?7:0)+1,Math.min(sz||16,(w-10)/Math.max(4,label.length)*1.7),['#ffffff','#ffffff','#dfe8ff'],{out:'#0b0614',rim:false,sk:0.12});
 if(sub)txt(sub,x+w/2,y+o+h/2+12,10,'rgba(255,255,255,.85)','center',false)};
// round arcade push-button with metal bezel
function arcRound(x,y,r,fill,pr,label,sz,icon,sub){const k='r'+x+'_'+y;const fl=pf(k,pr);X.save();
 X.beginPath();X.arc(x,y+5,r+6,0,7);X.fillStyle='rgba(0,0,0,.45)';X.fill();
 X.beginPath();X.arc(x,y,r+6,0,7);X.fillStyle='#0b0614';X.fill();
 const bz=X.createLinearGradient(0,y-r-5,0,y+r+5);bz.addColorStop(0,'#f4f6fb');bz.addColorStop(.5,'#8a93a8');bz.addColorStop(1,'#3a4052');X.beginPath();X.arc(x,y,r+4,0,7);X.fillStyle=bz;X.fill();
 X.beginPath();X.arc(x,y,r,0,7);X.fillStyle='#0b0614';X.fill();
 const d=pr?3:0;const dm=X.createRadialGradient(x-r*0.3,y-r*0.4+d,r*0.1,x,y+d,r*1.05);dm.addColorStop(0,HELM.mix(fill,1.5));dm.addColorStop(.55,fill);dm.addColorStop(1,HELM.mix(fill,.45));X.beginPath();X.arc(x,y+d*0.5,r-3,0,7);X.fillStyle=dm;X.fill();
 X.beginPath();X.ellipse(x-r*0.12,y-r*0.42+d,r*0.58,r*0.26,-0.2,0,7);X.fillStyle='rgba(255,255,255,.5)';X.fill();
 if(fl){X.beginPath();X.arc(x,y,r+4,0,7);X.fillStyle='rgba(255,255,255,'+fl+')';X.fill()}
 if(label)arcTxt(label,x,y+d+(icon?-6:1),sz||Math.min(16,r*0.5),['#ffffff','#ffffff','#e6ecff'],{out:'#0b0614',rim:false,shine:false});
 if(icon){X.translate(x,y+d);icon()}X.restore()}
window.arcRound=arcRound;
rbtn=function(k,on,x,y,r,fill,stroke,label,icon){const a=ease(k,on);if(a<=0)return;const pr=on&&pressed(x-r,y-r,2*r,2*r);const e=1-Math.pow(1-a,3);
 X.save();X.globalAlpha=e;X.translate(x,y);const s=0.7+0.3*e;X.scale(s,s);X.translate(-x,-y);arcRound(x,y,r-4,fill,pr,label,r>30?15:11,icon?()=>{X.translate(0,4);icon()}:null);X.restore()};
drawAudible=function(){const x=60,y=H-84;arcRound(x,y,32,'#2a56d6',pressed(24,H-120,72,72),'',0,()=>{X.fillStyle='#fff';X.strokeStyle='#0b0614';X.lineWidth=2;X.beginPath();X.moveTo(-13,-10);X.lineTo(7,-20);X.lineTo(7,4);X.lineTo(-13,-4);X.closePath();X.stroke();X.fill();X.fillRect(-17,-10,5,6)});
 arcTxt('AUDIBLE',x,y+15,10,['#fff','#dfe8ff'],{rim:false,shine:false});X.save();bevPanel(x+14,y-44,26,22,'#ffd23f',{c:5,drop:2});X.restore();txt(String(G.aud),x+27,y-33,13,'#141a36','center',false)};
// ---------- fighter HUD ----------
let mom=0,lastB=null;
function momentum(){const b=G.banner;if(b&&b!==lastB){lastB=b;const s=(b.t+' '+b.sub).toUpperCase();
  if(/TOUCHDOWN|2-PT GOOD|GOOD!/.test(s))mom+=0.5;else if(/FIRST DOWN/.test(s))mom+=0.18;else if(/INTERCEPT|TURNOVER|NO GOOD|SAFETY/.test(s))mom-=0.45;else if(/SACK/.test(s))mom-=0.2;else if(/INCOMPLETE/.test(s))mom-=0.06;else if(/SCORED|KICKED A FG/.test(s))mom-=0.35;else{const m=s.match(/([+-]?\d+) YARDS/);if(m)mom+=Math.max(-0.1,Math.min(0.15,+m[1]*0.012))}}
 mom*=0.9995;mom=Math.max(-1,Math.min(1,mom));return mom}
window.__mom=()=>mom;
let dispL=0.5,dispR=0.5,dmgL=0.5,dmgR=0.5;
drawHUD2=function(){const h=TEAMS[G.home],a=TEAMS[G.away];X.fillStyle='#000';X.fillRect(0,0,W,112);X.fillStyle='#ffd23f';X.fillRect(0,112,W,2);gear(26,28);const m=momentum();
 const y0=44,bh=42,cw=86,cx=W/2;
 // banners (parallelograms) left/right
 const side=(t,left,score)=>{X.save();const x0=left?6:cx+cw/2-6,x1=left?cx-cw/2+6:W-6;X.beginPath();if(left){X.moveTo(x0,y0);X.lineTo(x1,y0);X.lineTo(x1-12,y0+bh);X.lineTo(x0,y0+bh)}else{X.moveTo(x0,y0);X.lineTo(x1,y0);X.lineTo(x1,y0+bh);X.lineTo(x0+12,y0+bh)}X.closePath();
  X.save();X.translate(0,4);X.fillStyle='rgba(0,0,0,.5)';X.fill();X.restore();X.lineWidth=6;X.strokeStyle='#0b0614';X.stroke();
  const g=X.createLinearGradient(0,y0,0,y0+bh);g.addColorStop(0,HELM.mix(t.c1,1.5));g.addColorStop(.45,t.c1);g.addColorStop(.55,HELM.mix(t.c1,.75));g.addColorStop(1,HELM.mix(t.c1,.45));X.fillStyle=g;X.fill();
  X.save();X.clip();X.fillStyle='rgba(255,255,255,.18)';for(let i=-2;i<14;i++){X.beginPath();X.moveTo(x0+i*18,y0);X.lineTo(x0+i*18+8,y0);X.lineTo(x0+i*18-6,y0+bh);X.lineTo(x0+i*18-14,y0+bh);X.fill()}X.fillStyle='rgba(255,255,255,.4)';X.fillRect(x0,y0,x1-x0,2);X.restore();X.lineWidth=2;X.strokeStyle='rgba(255,255,255,.55)';X.stroke();
  HELM.drawHelmet(X,left?x0+30:x1-30,y0+bh/2+2,48,t,!left,left?G.home:G.away);
  arcTxt(t.a,left?x0+62:x1-62,y0+bh/2,17,['#ffffff','#ffffff','#cfd8f0'],{al:left?'left':'right',sk:0.18,rim:false});
  arcTxt(String(score),left?x1-26:x0+26,y0+bh/2+1,26,GOLD,{sk:0.12});X.restore()};
 side(h,true,G.sh);side(a,false,G.sa);
 // momentum "health" bars
 const bw=cx-cw/2-10,by=y0+bh+8;dispL+=((0.5+m/2)-dispL)*0.08;dispR+=((0.5-m/2)-dispR)*0.08;dmgL+=(dispL-dmgL)*0.02;dmgR+=(dispR-dmgR)*0.02;
 const bar=(x,w,v,dv,left)=>{X.save();bev(x-2,by-2,w+4,14,4);X.fillStyle='#0b0614';X.fill();X.fillStyle='#2a1030';X.fillRect(x,by,w,10);
  const fw=w*Math.max(0,Math.min(1,v)),dw=w*Math.max(0,Math.min(1,dv));X.fillStyle='#ff4d5e';left?X.fillRect(x+w-Math.max(fw,dw),by,Math.max(fw,dw),10):X.fillRect(x,by,Math.max(fw,dw),10);
  const g=X.createLinearGradient(0,by,0,by+10);g.addColorStop(0,'#fff9a8');g.addColorStop(.5,'#ffd23f');g.addColorStop(1,'#d08a00');X.fillStyle=g;left?X.fillRect(x+w-fw,by,fw,10):X.fillRect(x,by,fw,10);
  X.fillStyle='rgba(255,255,255,.45)';left?X.fillRect(x+w-fw,by,fw,2):X.fillRect(x,by,fw,2);X.restore()};
 bar(8,bw,dispL,dmgL,true);bar(cx+cw/2+2,bw,dispR,dmgR,false);
 // center clock box
 X.save();const bx=cx-cw/2,byy=y0-10;bevPanel(bx,byy,cw,bh+16,'#2a2f4a',{c:14,edge:'#ffd23f'});
 txt('Q'+G.q,cx,byy+12,11,'#ffd23f','center',false);arcTxt(fmtClock(G.clock),cx,byy+36,22,G.clock<30?['#fff','#ff8a8a','#e8344e']:CHROME,{sk:0.1,it:true});X.restore();
 // down & distance plate
 const ord=['1ST','2ND','3RD','4TH'][Math.min(G.down,4)-1]||'4TH';const tg=G.los+G.togo>=100?'GOAL':Math.max(1,Math.round(G.togo));
 if(G.st!=='fg'&&G.st!=='patpick'){bevPanel(cx-62,by+18,124,24,'#141a3a',{c:7,drop:3,edge:'#4fa3ff'});X.save();bevPanel(cx-60,by+20,50,20,'#ffd23f',{c:6,drop:0});X.restore();txt(ord,cx-35,by+30,12,'#141a36','center',false);arcTxt('& '+tg,cx+26,by+30,13,['#fff','#dfe8ff'],{rim:false,shine:false});{const L=Math.round(G.los),bo=L>50?'OPP '+(100-L):L===50?'MID 50':'OWN '+L;bevPanel(cx+66,by+20,62,20,'#141a3a',{c:6,drop:2,edge:'#2b3a7a'});txt(bo,cx+97,by+30,10,'#dfe8ff','center',false)}}
 if(G.rbd&&(G.st==='result'||G.st==='presnap'||G.st==='live')){const r=G.rbd,al=Math.min(1,r.t*2,(4-r.t)*6);X.save();X.globalAlpha=al;X.font='bold 12px sans-serif';const tw=Math.max(110,X.measureText(r.s).width+20),bw=tw+46,bx=cx-bw/2,y=by+50;bevPanel(bx,y,bw,24,'#141a3a',{c:12,drop:3,edge:r.c});bevPanel(bx+3,y+3,40,18,r.c,{c:9,drop:0});txt(r.n,bx+23,y+12,11,'#0e1430','center',false);txt(r.s,bx+46+tw/2-4,y+12,12,'#fff','center',false);X.restore()}
 if(G.st==='live'&&G.carrier&&G.carrier.role==='QB'&&G.play.t==='pass'&&!G.thrown){const pr=Math.min(1,G.snapT/4.5);bevPanel(20,H-44,W-140,14,'#141a3a',{c:4,drop:2});const g=X.createLinearGradient(0,H-42,0,H-32);g.addColorStop(0,pr>.7?'#ff8a8a':'#8fd0ff');g.addColorStop(1,pr>.7?'#c8102e':'#1f6fd6');X.fillStyle=g;X.fillRect(23,H-42,(W-146)*pr,10);txt('POCKET',20+(W-140)/2,H-58,11,'#fff')}
};
// ---------- slam-in callouts ----------
let calloutFor=null,calloutShake=0;
window.drawCallout=function(){const b=G.banner;let t=b.t,sub=b.sub||'';const up=(t+' '+sub).toUpperCase();
 if(/FIRST DOWN/.test(sub)&&!/TOUCHDOWN/.test(t)){sub=t;t='FIRST DOWN!'}
 if(/^SACKED!/.test(t)){sub=t.replace('SACKED! ','');t='SACK!'}
 const big=/TOUCHDOWN|INTERCEPT|SACK|FIRST DOWN|GOOD|PURE|2-PT|TURNOVER|FUMBLE/.test(t.toUpperCase());
 const cols=/TOUCHDOWN|GOOD!|2-PT GOOD/.test(t)?FIRE:/INTERCEPT|NO GOOD|SACK|TURNOVER|NO GOOD/.test(t)?['#ffffff','#ff9aa6','#e8344e','#ff6a7a','#7a0a1a']:/FIRST DOWN/.test(t)?GOLD:CHROME;
 const a=b.a;if(calloutFor!==b){calloutFor=b;if(big){G.shake=Math.max(G.shake||0,0.35)}}
 const k=Math.min(1,a/0.16);const sc=a<0.16?2.8-1.8*k*k:a<0.26?1-0.08*Math.sin((a-0.16)/0.1*Math.PI):1;const out=a>1.85?Math.min(1,(a-1.85)/0.3):0;
 const y=300;const sz=Math.min(big?50:38,(W-30)/Math.max(5,t.length)*1.75);
 // impact flash
 if(big&&a<0.3){X.save();X.fillStyle='rgba(255,255,255,'+(0.55*(1-a/0.3))+')';X.fillRect(0,0,W,H);X.restore()}
 X.save();X.globalAlpha=1-out;
 // speed band behind text
 const bw=W*(Math.min(1,a/0.12));X.save();X.translate(W/2,y);X.transform(1,0,-0.25,1,0,0);const g=X.createLinearGradient(-bw/2,0,bw/2,0);g.addColorStop(0,'rgba(10,6,24,0)');g.addColorStop(.2,'rgba(10,6,24,.82)');g.addColorStop(.8,'rgba(10,6,24,.82)');g.addColorStop(1,'rgba(10,6,24,0)');X.fillStyle=g;X.fillRect(-bw/2,-sz*0.75,bw,sz*1.5+(sub?26:0));
 X.fillStyle=cols[2];X.fillRect(-bw/2,-sz*0.75,bw,3);X.fillRect(-bw/2,sz*0.75+(sub?26:0)-3,bw,3);X.restore();
 X.translate(W/2+out*W*0.6,y);X.scale(sc,sc);X.rotate(-0.05);arcTxt(t,0,0,sz,cols,{sk:0.16});X.restore();
 if(sub&&a>0.18){X.save();X.globalAlpha=(1-out)*Math.min(1,(a-0.18)/0.12);arcTxt(sub,W/2-out*W*0.6,y+sz*0.62+8,15,['#ffffff','#dfe8ff'],{rim:false,shine:false,sk:0.14});X.restore()}};
// ---------- title ----------
let titleTeams=null;
function drawTitle(){const t=G.t;const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,'#05030f');g.addColorStop(.5,'#1a0b3a');g.addColorStop(1,'#05030f');X.fillStyle=g;X.fillRect(0,0,W,H);
 // radial burst
 X.save();X.translate(W/2,300);X.rotate(t*0.08);for(let i=0;i<24;i++){X.rotate(Math.PI/12);X.fillStyle=i%2?'rgba(255,90,60,.10)':'rgba(255,210,63,.07)';X.beginPath();X.moveTo(0,0);X.lineTo(-40,-700);X.lineTo(40,-700);X.fill()}X.restore();
 // stadium light beams
 for(let i=0;i<4;i++){X.save();X.translate(i<2?-10:W+10,40);X.rotate((i<2?1:-1)*(0.45+i%2*0.25)+Math.sin(t*0.6+i)*0.06);const lg=X.createLinearGradient(0,0,0,760);lg.addColorStop(0,'rgba(255,245,210,.28)');lg.addColorStop(1,'rgba(255,245,210,0)');X.fillStyle=lg;X.beginPath();X.moveTo(-8,0);X.lineTo(8,0);X.lineTo(90,760);X.lineTo(-90,760);X.fill();X.restore()}
 // perspective grid floor
 X.save();X.strokeStyle='rgba(255,79,163,.45)';X.lineWidth=1.5;for(let i=0;i<12;i++){const yy=560+Math.pow(i/12,2)*290+((t*40)%24)*(i/12);X.beginPath();X.moveTo(0,yy);X.lineTo(W,yy);X.stroke()}for(let i=-10;i<=10;i++){X.beginPath();X.moveTo(W/2+i*10,560);X.lineTo(W/2+i*80,H);X.stroke()}X.restore();
 if(!titleTeams){const a=Math.floor(Math.random()*32);let b=(a+1+Math.floor(Math.random()*31))%32;titleTeams=[a,b]}
 const bob=Math.sin(t*2.2)*4;HELM.drawHelmet(X,92,470+bob,170,TEAMS[titleTeams[0]],false,titleTeams[0]);HELM.drawHelmet(X,W-92,470-bob,170,TEAMS[titleTeams[1]],true,titleTeams[1]);
 // spark between helmets
 X.save();X.translate(W/2,466);const sp=1+Math.sin(t*10)*0.15;X.scale(sp,sp);X.fillStyle='rgba(255,240,180,.9)';X.beginPath();for(let i=0;i<16;i++){const r=i%2?6:26,an=i*Math.PI/8+t;X.lineTo(Math.cos(an)*r,Math.sin(an)*r)}X.fill();X.restore();
 // logo
 const s=Math.min(1,t/0.4);const sc=t<0.4?2.2-1.2*s*s:1;X.save();X.translate(W/2,200);X.scale(sc,sc);X.rotate(-0.06);
 arcTxt('PIXEL',0,-44,78,CHROME,{sk:0.18,out:'#0b0614',rim:'#3fd0ff'});arcTxt('BLITZ',4,34,90,FIRE,{sk:0.18,out:'#0b0614',rim:'#fff6a0'});
 // shine sweep
 const sx=((t*0.6)%2.2-0.6)*W;X.globalCompositeOperation='lighter';const sg=X.createLinearGradient(sx-40,0,sx+40,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.25)');sg.addColorStop(1,'rgba(255,255,255,0)');X.fillStyle=sg;X.fillRect(-W,-110,2*W,200);X.restore();
 X.save();bevPanel(W/2-104,290,208,28,'#c8102e',{c:8,drop:3,edge:'#ffd23f'});X.restore();arcTxt('GRIDIRON FIGHT NIGHT',W/2,304,13,['#fff','#ffe9a8'],{rim:false,shine:false,sk:0.12});
 if(Math.floor(t*2.4)%2===0||t<1){arcTxt('TAP TO START',W/2,712,30,GOLD,{sk:0.14})}
 txt('(C) 2026 LOCK IN LABS  -  ORIGINAL GAME, NOT AFFILIATED WITH ANY LEAGUE',W/2,812,8,'#8a7ab0','center',false)}
// ---------- VS ----------
function recOf(i){const S=window.__season&&__season.get();if(!S)return'';const r=S.rec[i];return r.w+'-'+r.l+(r.t?'-'+r.t:'')}
function drawVS(){const t=TEAMS[G.home],o=TEAMS[G.away];const a=G.vsT||0;const k=Math.min(1,a/0.3),e=1-Math.pow(1-k,3);
 X.fillStyle='#05030f';X.fillRect(0,0,W,H);
 const panel=(tm,left)=>{X.save();X.beginPath();if(left){X.moveTo(-W*(1-e),0);X.lineTo(W*0.78-W*(1-e),0);X.lineTo(W*0.22-W*(1-e),H);X.lineTo(-W*(1-e),H)}else{X.moveTo(W+W*(1-e),0);X.lineTo(W*0.78+W*(1-e),0);X.lineTo(W*0.22+W*(1-e),H);X.lineTo(W+W*(1-e),H)}X.closePath();
  const g=X.createLinearGradient(0,left?0:H,0,left?H:0);g.addColorStop(0,HELM.mix(tm.c1,1.35));g.addColorStop(.6,tm.c1);g.addColorStop(1,HELM.mix(tm.c1,.35));X.fillStyle=g;X.fill();X.clip();
  X.fillStyle='rgba(255,255,255,.08)';for(let i=-20;i<40;i++){X.fillRect(i*24+((a*80)%24)*(left?1:-1),0,10,H)}
  X.globalAlpha=0.16;X.translate(left?W*0.3:W*0.7,left?H*0.3:H*0.7);X.scale(4.5,4.5);HELM.emblem(X,HELM.EMB[left?G.home:G.away],tm.c2,'rgba(0,0,0,.6)');X.restore()};
 panel(t,true);panel(o,false);
 // lightning crack on the diagonal
 if(a>0.3){X.save();X.strokeStyle='#fff';X.lineWidth=5;X.shadowColor='#9fe3ff';X.shadowBlur=18;X.beginPath();X.moveTo(W*0.78,0);for(let i=1;i<=12;i++){const f=i/12;X.lineTo(W*0.78+(W*0.22-W*0.78)*f+(i<12?Math.sin(i*7.3+a*30)*8:0),H*f)}X.stroke();X.restore()}
 const ha=Math.min(1,Math.max(0,(a-0.15)/0.3)),he=1-Math.pow(1-ha,3);
 HELM.drawHelmet(X,110-(1-he)*260,190,170,t,false,G.home);HELM.drawHelmet(X,W-110+(1-he)*260,660,170,o,true,G.away);
 const plate=(tm,x,y,rec,al)=>{arcTxt(tm.city,x,y,14,['#fff','#e8eeff'],{rim:false,shine:false,al,sk:0.15});arcTxt(tm.nick,x,y+28,Math.min(30,260/Math.max(5,tm.nick.length)*1.7),CHROME,{al,sk:0.18});if(rec)arcTxt(rec,x,y+58,15,GOLD,{rim:false,al,sk:0.15})};
 if(a>0.35){plate(t,22,290,recOf(G.home),'left');plate(o,W-22,486,recOf(G.away),'right')}
 // VS slam
 if(a>0.45){const b=a-0.45,s=b<0.14?3.2-2.2*(b/0.14):1+0.06*Math.max(0,Math.sin((b-0.14)*12))*Math.exp(-(b-0.14)*6);if(b<0.25){X.fillStyle='rgba(255,255,255,'+(0.7*(1-b/0.25))+')';X.fillRect(0,0,W,H)}X.save();X.translate(W/2+(b<0.4?(Math.random()-.5)*10:0),H/2-6+(b<0.4?(Math.random()-.5)*10:0));X.scale(s,s);X.rotate(-0.08);arcTxt('VS',0,0,96,FIRE,{sk:0.2,rim:'#fff6a0'});X.restore()}
 const S=window.__season&&__season.get();const lab=S?(S.phase==='po'?['WILD CARD','DIVISIONAL','CONFERENCE','PIXEL BOWL'][S.po.round]:'WEEK '+(S.week+1)):'';
 if(a>0.6){bevPanel(W/2-90,H-86,180,34,'#141a3a',{c:9,edge:'#ffd23f'});arcTxt(lab,W/2,H-69,17,GOLD,{rim:false,sk:0.12})}}
// turf kick-up on cuts and dives
let pj=0,pd=false;const _u=update;update=function(dt){_u(dt);const c=G.carrier;if(G.st!=='live'||!c)return;const j=G.juke>0,d=c.dive>0;
 if((j&&!pj)||(d&&!pd)){for(let i=0;i<14;i++)G.parts.push({x:c.x+rnd(-.4,.4),y:c.y+rnd(-.4,.4),vx:rnd(-3,3),vy:rnd(-3,3),l:rnd(.25,.6),dust:true,c:['#2f8f3a','#4fb94a','#7a5a3a','#9fdc7a'][i%4]})}pj=j;pd=d};
// render wrapper (outermost)
const _r=render;render=function(){if(G.st==='title'&&!G.paused){X.setTransform(DPR,0,0,DPR,0,0);X.save();drawTitle();X.restore();return}
 if(G.st==='vs'){X.setTransform(DPR,0,0,DPR,0,0);X.save();drawVS();X.restore();return}
 _r();if(G.st==='live'||G.st==='presnap'||G.st==='result'){X.setTransform(DPR,0,0,DPR,0,0);X.save();bottomStrip();drawPop();X.restore()}};
function bottomStrip(){const c=(G.st==='live'&&G.carrier)||G.qb;if(!c)return;const y=H-20;X.fillStyle='rgba(0,0,0,.82)';X.fillRect(0,y,W,20);X.fillStyle='#ffd23f';X.fillRect(0,y,W,1);
 const nm=(c.nm?(c.nm.split(' ').slice(-1)[0]):(c.role==='QB'?'QUARTERBACK':'PLAYER')).toUpperCase();X.font='900 12px "Courier New", monospace';X.textBaseline='middle';X.textAlign='left';X.fillStyle='#fff';X.fillText(nm,12,y+11);const w=X.measureText(nm).width;X.fillStyle='#ffd23f';X.fillText(c.role+'  #'+(c.num|0),20+w,y+11);
 X.textAlign='right';X.fillStyle='#9fb3ff';X.fillText(c.team===0?TEAMS[G.home].nick||'':'',W-12,y+11)}
function drawPop(){const p=G.pop;if(!p||p.t>0.9)return;const q=scr(p.x,p.y,4.2);const k=p.t/0.9,s=p.t<0.12?0.5+p.t/0.12*0.7:1.2-Math.min(0.2,(p.t-0.12)*0.6);X.save();X.globalAlpha=k>0.7?(1-k)/0.3:1;X.translate(q[0],q[1]-k*26);X.scale(s,s);arcTxt(p.s,0,0,22,GOLD,{sk:0.15,rim:'#fff'});X.restore()}
const _u18=update;update=function(dt){_u18(dt);if(G.pop)G.pop.t+=dt;if(G.st==='presnap')G.pop=null};
})();
