import * as THREE from './vendor/three.module.min.js';
const G=window.G,W=390,H=844,FW=53.3,HX=FW/2;
const wrap=document.getElementById('wrap');
const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
ren.setPixelRatio(Math.min(devicePixelRatio||1,2));ren.domElement.id='c3';wrap.insertBefore(ren.domElement,wrap.firstChild);
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(80,W/H,0.5,600);
function resize(){const r=wrap.getBoundingClientRect();ren.setSize(r.width,r.height,false);}
addEventListener('resize',resize);resize();
// sky
const sk=document.createElement('canvas');sk.width=2;sk.height=256;const sg=sk.getContext('2d');const gr=sg.createLinearGradient(0,0,0,256);
gr.addColorStop(0,'#1b1546');gr.addColorStop(.55,'#5a2d7a');gr.addColorStop(.8,'#e4637a');gr.addColorStop(1,'#ffb36b');sg.fillStyle=gr;sg.fillRect(0,0,2,256);
scene.background=new THREE.CanvasTexture(sk);scene.background.colorSpace=THREE.SRGBColorSpace;
scene.fog=new THREE.Fog(0x6a3a7a,140,420);
scene.add(new THREE.HemisphereLight(0xfff4e8,0x4a6a3a,1.6));
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(-30,60,30);scene.add(sun);
const Z=y=>-y, Xw=x=>x-HX;
const lam=c=>new THREE.MeshLambertMaterial({color:c});
// field texture
const PX=20,fc=document.createElement('canvas');fc.width=Math.round(FW*PX);fc.height=120*PX;const f=fc.getContext('2d');
const T=window.TEAMS,home=()=>T[G.home],away=()=>T[G.away];
function paintField(){
 for(let yd=0;yd<100;yd+=5){f.fillStyle=(yd/5)%2?'#3cb043':'#36a33d';f.fillRect(0,(110-yd-5)*PX,fc.width,5*PX)}
 f.fillStyle=home().c1;f.fillRect(0,0,fc.width,10*PX);f.fillStyle=away().c1;f.fillRect(0,110*PX,fc.width,10*PX);
 f.fillStyle='#fff';f.font=`bold ${5*PX}px Arial Black, Arial`;f.textAlign='center';f.textBaseline='middle';
 f.save();f.translate(fc.width/2,5*PX);f.rotate(Math.PI);f.globalAlpha=.9;f.fillText(away().n.split(' ')[1],0,0);f.restore();
 f.fillText(home().n.split(' ')[1],fc.width/2,115*PX);
 f.fillStyle='#fff';
 for(let yd=0;yd<=100;yd+=5){const y=(110-yd)*PX;f.fillRect(0,y-3,fc.width,yd%50?5:7)}
 for(let yd=1;yd<100;yd++){if(yd%5==0)continue;const y=(110-yd)*PX;for(const hx of[1,22.9,29.4,FW-2.6])f.fillRect(hx*PX,y-2,1.6*PX,4)}
 f.font=`bold ${2.6*PX}px Arial`;
 for(let yd=10;yd<100;yd+=10){const n=yd<=50?yd:100-yd,y=(110-yd)*PX;
  for(const [hx,r] of [[9,Math.PI/2],[FW-9,-Math.PI/2]]){f.save();f.translate(hx*PX,y);f.rotate(r);f.fillText(String(n),0,0);f.restore()}}
 // midfield emblem (original)
 f.save();f.translate(fc.width/2,60*PX);f.rotate(Math.PI/4);f.fillStyle='rgba(20,26,58,.85)';f.fillRect(-3*PX,-3*PX,6*PX,6*PX);f.restore();
 f.fillStyle='#ffd23f';f.font=`bold ${2.4*PX}px Arial Black, Arial`;f.fillText('PB',fc.width/2,60*PX);
 f.fillStyle='#fff';f.fillRect(0,0,8,fc.height);f.fillRect(fc.width-8,0,8,fc.height);
}
let fieldKey=G.home+'-'+G.away;paintField();
const ftex=new THREE.CanvasTexture(fc);ftex.colorSpace=THREE.SRGBColorSpace;ftex.anisotropy=8;
const field=new THREE.Mesh(new THREE.PlaneGeometry(FW,120),new THREE.MeshLambertMaterial({map:ftex}));field.rotation.x=-Math.PI/2;field.position.set(0,0,Z(50));scene.add(field);
const apron=new THREE.Mesh(new THREE.PlaneGeometry(FW+28,140),lam(0x2f8f37));apron.rotation.x=-Math.PI/2;apron.position.set(0,-0.02,Z(50));scene.add(apron);
const border=new THREE.Mesh(new THREE.PlaneGeometry(FW+3,123),lam(0xffffff));border.rotation.x=-Math.PI/2;border.position.set(0,-0.01,Z(50));scene.add(border);
// walls
const wallM=lam(0xc8324a);
for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(1,2,140),wallM);w.position.set(s*(HX+14),1,Z(50));scene.add(w)}
for(const zz of[-21,121]){const w=new THREE.Mesh(new THREE.BoxGeometry(FW+29,2,1),wallM);w.position.set(0,1,Z(zz));scene.add(w)}
// stands + crowd (instanced)
const standM=lam(0x5a5f73);const crowdPos=[];
function stand(cx,cz,len,alongX,face){ // face: direction toward field (+1/-1 along perpendicular)
 for(let r=0;r<14;r++){const h=2+r*1.3,off=r*1.6;const g=new THREE.Mesh(new THREE.BoxGeometry(alongX?len:1.6,1.3,alongX?1.6:len),standM);
  if(alongX)g.position.set(cx,h-0.65,cz-face*off);else g.position.set(cx-face*off,h-0.65,cz);scene.add(g);
  for(let i=0;i<len;i+=0.9){if(Math.random()<0.1)continue;const p=alongX?[cx-len/2+i,h+0.45,cz-face*off]:[cx-face*off,h+0.45,cz-len/2+i];crowdPos.push(p)}}}
stand(-(HX+17),Z(50),136,false,-1);stand(HX+17,Z(50),136,false,1);stand(0,Z(124),FW+30,true,-1);
const crowd=new THREE.InstancedMesh(new THREE.BoxGeometry(0.55,0.9,0.5),new THREE.MeshLambertMaterial(),crowdPos.length);
const m4=new THREE.Matrix4(),col=new THREE.Color();
const cc=[home().c1,home().c2,away().c1,'#ffffff','#2a2a3a','#e8344e','#e8344e'];
crowdPos.forEach((p,i)=>{m4.makeTranslation(p[0],p[1],p[2]);crowd.setMatrixAt(i,m4);crowd.setColorAt(i,col.set(cc[i%7===0?3:Math.floor(Math.random()*cc.length)]))});
scene.add(crowd);
// skyline
const wc=document.createElement('canvas');wc.width=64;wc.height=64;const w2=wc.getContext('2d');w2.fillStyle='#2a2440';w2.fillRect(0,0,64,64);
for(let y=4;y<64;y+=12)for(let x=4;x<64;x+=12){w2.fillStyle=Math.random()<.55?'#ffd98a':'#3d3560';w2.fillRect(x,y,6,7)}
const wtex=new THREE.CanvasTexture(wc);wtex.wrapS=wtex.wrapT=THREE.RepeatWrapping;wtex.colorSpace=THREE.SRGBColorSpace;
for(let i=0;i<34;i++){const w=rnd(10,22),h=rnd(25,85),d=rnd(10,18);const t=wtex.clone();t.repeat.set(w/6,h/6);t.needsUpdate=true;
 const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({map:t,color:0xd8c8e8}));
 const ang=-Math.PI*0.9+i/33*Math.PI*0.8;b.position.set(Math.cos(ang)*rnd(110,150),h/2,Z(60)+Math.sin(ang)*rnd(130,160));scene.add(b)}
function rnd(a,b){return a+Math.random()*(b-a)}
// goalposts
const gm=lam(0xffd23f);
for(const [yy,s] of [[110,1],[-10,-1]]){const g=new THREE.Group();const post=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,5,8),gm);post.position.y=2.5;g.add(post);
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,6.2,8),gm);bar.rotation.z=Math.PI/2;bar.position.y=5;g.add(bar);
 for(const sx of[-3,3]){const u=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,9,8),gm);u.position.set(sx,9.5,0);g.add(u)}
 g.position.set(0,0,Z(yy+s*1));scene.add(g)}
// scoreboard tower
const sbc=document.createElement('canvas');sbc.width=256;sbc.height=96;
const sbt=new THREE.CanvasTexture(sbc);sbt.colorSpace=THREE.SRGBColorSpace;
const sb=new THREE.Mesh(new THREE.BoxGeometry(24,9,1),[lam(0x22263a),lam(0x22263a),lam(0x22263a),lam(0x22263a),new THREE.MeshBasicMaterial({map:sbt}),lam(0x22263a)]);
sb.position.set(0,26,Z(133));scene.add(sb);const sbp=new THREE.Mesh(new THREE.BoxGeometry(2,22,2),lam(0x22263a));sbp.position.set(0,11,Z(134));scene.add(sbp);
let sbKey='';function paintSB(){const k=G.sh+'-'+G.sa+'-'+G.q;if(k===sbKey)return;sbKey=k;const c=sbc.getContext('2d');c.fillStyle='#0c0f20';c.fillRect(0,0,256,96);c.fillStyle='#ffd23f';c.font='bold 30px Arial';c.textAlign='center';c.textBaseline='middle';
 c.fillText(home().a+' '+G.sh,64,40);c.fillText(G.sa+' '+away().a,192,40);c.fillStyle='#4fa3ff';c.font='bold 20px Arial';c.fillText('Q'+G.q,128,76);sbt.needsUpdate=true}
// light towers
for(const s of[-1,1])for(const yy of[10,90]){const p=new THREE.Mesh(new THREE.BoxGeometry(1,40,1),lam(0x333a4a));p.position.set(s*(HX+40),20,Z(yy));scene.add(p);
 const l=new THREE.Mesh(new THREE.BoxGeometry(8,4,1),new THREE.MeshBasicMaterial({color:0xfff6d8}));l.position.set(s*(HX+40),40,Z(yy));l.lookAt(0,0,Z(yy));scene.add(l)}
// LOS / first-down lines
const los=new THREE.Mesh(new THREE.PlaneGeometry(FW,.35),new THREE.MeshBasicMaterial({color:0x2f6bff}));los.rotation.x=-Math.PI/2;los.position.y=.03;scene.add(los);
const fd=new THREE.Mesh(new THREE.PlaneGeometry(FW,.35),new THREE.MeshBasicMaterial({color:0xffe23f}));fd.rotation.x=-Math.PI/2;fd.position.y=.03;scene.add(fd);
// players: pixel-art billboards (instanced, nearest filtering)
const N=14,S=window.SPR;
const shadow=new THREE.InstancedMesh(new THREE.CircleGeometry(0.85,16),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false}),N*2);scene.add(shadow);
const ring=new THREE.Mesh(new THREE.RingGeometry(1.4,1.85,24),new THREE.MeshBasicMaterial({color:0x8a5cff,transparent:true,opacity:.85}));ring.rotation.x=-Math.PI/2;ring.position.y=.04;scene.add(ring);const sh=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.32:.75,a=i/10*Math.PI*2-Math.PI/2;i?sh.lineTo(Math.cos(a)*r,Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,Math.sin(a)*r)}const star=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0xffd23f,side:THREE.DoubleSide}));star.rotation.x=-Math.PI/2;star.position.y=.05;scene.add(star);
const ball=new THREE.Mesh(new THREE.SphereGeometry(.28,10,6),lam(0x8a4a1f));ball.scale.set(1.8,1.8,2.8);scene.add(ball);
const tgtMk=new THREE.Mesh(new THREE.RingGeometry(.6,.85,16),new THREE.MeshBasicMaterial({color:0xffe23f}));tgtMk.rotation.x=-Math.PI/2;tgtMk.position.y=.05;scene.add(tgtMk);
const bgeo=new THREE.PlaneGeometry(1,1);bgeo.translate(0,.5,0);
const CU=1/(S.DIRS*S.POSES),CV=1/10;
function mkTeamMesh(){const tex=new THREE.CanvasTexture(document.createElement('canvas'));
 const mat=new THREE.MeshBasicMaterial({map:tex,alphaTest:.5,side:THREE.DoubleSide});
 mat.onBeforeCompile=sh=>{sh.vertexShader='attribute vec2 uvOff;\n'+sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vMapUv = vMapUv*vec2('+CU.toFixed(8)+','+CV.toFixed(8)+') + uvOff;')};
 const m=new THREE.InstancedMesh(bgeo,mat,N);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);const uo=new THREE.InstancedBufferAttribute(new Float32Array(N*2),2);uo.setUsage(THREE.DynamicDrawUsage);m.geometry=bgeo.clone();m.geometry.setAttribute('uvOff',uo);m.frustumCulled=false;scene.add(m);return{m,mat,uo}}
const TM=[mkTeamMesh(),mkTeamMesh()];window.__atlases=[];
let atlasKey='';function ensureAtlas(){const k=G.home+'-'+G.away;if(k===atlasKey)return;atlasKey=k;[home(),away()].forEach((t,i)=>{const c=S.buildAtlas(t);window.__atlases[i]=c;const tx=new THREE.CanvasTexture(c);tx.magFilter=THREE.NearestFilter;tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;tx.colorSpace=THREE.SRGBColorSpace;TM[i].mat.map=tx;TM[i].mat.needsUpdate=true})}
const pm=new THREE.Matrix4(),v3=new THREE.Vector3(),sc=new THREE.Vector3();
function poseOf(p){const P=S.P,line=p.role==='OL'||p.role==='DL';
 if(p.dive>0)return P.dive;if(p.fallen>0)return P.fall;
 if(G.st==='presnap')return line?P.stance:p.role==='QB'?P.hold:P.idle;
 if(G.celeb&&p.team===0&&G.st==='result')return P.celeb;
 if(p.throwT>0)return p.throwT>0.3?P.throwA:p.throwT>0.2?P.throwB:P.throwC;if(p.catchT>0)return P.catch;if(p.eng)return P.block;
 const hb=p===G.carrier&&(!G.ball||G.ball.caught)&&!(G.pend);const mv=Math.hypot(p.vx,p.vy)>0.6;if(hb)return mv?(Math.floor(p.anim/0.8)%2?P.hrun2:P.hrun1):P.hold;if(mv)return Math.floor(p.anim/0.8)%2?P.run2:P.run1;return P.idle}
function updatePlayers(){ensureAtlas();const cnt=[0,0];
 G.players.forEach((p,si)=>{const sp=Math.hypot(p.vx,p.vy);let fx=p.vx,fy=p.vy;
  if(p.throwT>0&&p.throwDir){fx=p.throwDir.x;fy=p.throwDir.y}else if(p.eng&&p.blk){fx=p.blk.x-p.x;fy=p.blk.y-p.y}
  else if(sp<0.4||G.st==='presnap'){fx=0;fy=p.team===0?1:-1}
  const l=Math.hypot(fx,fy)||1;const k=p.throwT>0?1:.25;p.fdx=(p.fdx??0)*(1-k)+fx/l*k;p.fdy=(p.fdy??(p.team?-1:1))*(1-k)+fy/l*k;
  const a=Math.atan2(p.fdx,p.fdy),aa=Math.abs(a)*180/Math.PI;const dir=aa<22.5?4:aa<67.5?3:aa<112.5?2:aa<157.5?1:0;const mir=a<0?-1:1;
  const pose=poseOf(p);const line=(p.role==='OL'||p.role==='DL')?1:0;const T=TM[p.team],i=cnt[p.team]++;
  const s=3.5*(line?1.15:1);sc.set(s*mir,s,1);pm.compose(v3.set(Xw(p.x),0.02,Z(p.y)),cam.quaternion,sc);T.m.setMatrixAt(i,pm);
  T.uo.setXY(i,(dir*S.POSES+pose)*CU,1-((p.skin*2+line)+1)*CV);
  m4.makeRotationX(-Math.PI/2);m4.setPosition(Xw(p.x),.02,Z(p.y));shadow.setMatrixAt(si,m4)});
 TM.forEach((T,k)=>{T.m.count=cnt[k];T.m.instanceMatrix.needsUpdate=true;T.uo.needsUpdate=true});shadow.count=G.players.length;shadow.instanceMatrix.needsUpdate=true}
// route ribbons
const RCOL=[0xff2a2a,0xff8a1f,0xffd400,0x9a3cff];let routeGrp=new THREE.Group();scene.add(routeGrp);let routeVer=-1;
function buildRoutes(){routeGrp.clear();(G.routes||[]).forEach((r,ri)=>{const pts=r.pts;const pos=[];const w=.24;
 for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;const nx=-dy/l*w,ny=dx/l*w;
  pos.push(Xw(pts[i][0]+nx),.06,Z(pts[i][1]+ny),Xw(pts[i][0]-nx),.06,Z(pts[i][1]-ny))}
 const idx=[];for(let i=0;i<pts.length-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 const mat=new THREE.MeshBasicMaterial({color:RCOL[(r.i??ri)%4],side:THREE.DoubleSide,transparent:true,opacity:.85,depthWrite:false});routeGrp.add(new THREE.Mesh(g,mat));
 const e2=pts[pts.length-1],e1=pts[pts.length-2];const ah=new THREE.Mesh(new THREE.ConeGeometry(.45,1.1,3),mat);ah.position.set(Xw(e2[0]),.1,Z(e2[1]));ah.rotation.x=-Math.PI/2;ah.rotation.z=-Math.atan2(e2[0]-e1[0],e2[1]-e1[1]);ah.scale.z=.1;routeGrp.add(ah)})}
// projection for 2D overlay
const pv=new THREE.Vector3();
window.PROJ=(x,y,h=1)=>{pv.set(Xw(x),h,Z(y)).project(cam);return[(pv.x+1)/2*W,(1-pv.y)/2*H]};
const cpos=new THREE.Vector3(0,17,0),clook=new THREE.Vector3();let camX=0;
window.R3D=()=>{const st=G.st;if(st==='title'||st==='team'){ren.domElement.style.visibility='hidden';return}ren.domElement.style.visibility='visible';
 paintSB();const fk=G.home+'-'+G.away;if(fk!==fieldKey){fieldKey=fk;paintField();ftex.needsUpdate=true}
 const on=st==='live'||st==='result'||st==='presnap';
 cam.updateMatrixWorld();if(on)updatePlayers();TM.forEach(T=>T.m.visible=on);shadow.visible=on;
 if(G.routeVer!==routeVer){routeVer=G.routeVer;buildRoutes()}
 routeGrp.visible=st==='presnap'||(st==='live'&&!G.thrown&&G.carrier&&G.carrier.role==='QB'&&G.play.t==='pass');
 los.position.z=Z(G.los);fd.position.z=Z(Math.min(G.los+G.togo,100));fd.visible=G.los+G.togo<100;
 const c=G.carrier;ring.visible=on&&!!c;star.visible=ring.visible;if(c){ring.position.set(Xw(c.x),.04,Z(c.y));star.position.set(Xw(c.x),.05,Z(c.y));star.rotation.z=G.t*2}
 const b=G.ball;ball.visible=on&&!!b&&!b.caught;tgtMk.visible=false;
 if(b&&!b.caught){{const kk=Math.min(1,b.t/b.T);ball.position.set(Xw(b.x),(b.h0||1.6)*(1-kk)+1.6*kk+b.z*0.9,Z(b.y))}ball.rotation.y=Math.atan2(-(b.tx-b.x0),(b.ty-b.y0));ball.rotation.x=-.5;tgtMk.visible=true;tgtMk.position.set(Xw(b.tx),.05,Z(b.ty))}
 else if(c){const a=(c.face||0);ball.position.set(Xw(c.x)+Math.cos(a)*.55,1.25,Z(c.y)-Math.sin(a)*.55);ball.rotation.set(0,a,0)}
 const fx=on?(b&&!b.caught?Xw(b.x):c?Xw(c.x):0)*.25:0;camX+=(fx-camX)*.08;
 let ov=G.st==='presnap'&&G.ovT>0?Math.min(1,G.ovT/0.6):0;ov=ov*ov*(3-2*ov);
 cpos.set(camX*(1-ov),36+(80-36)*ov,(Z(G.cam)+30)*(1-ov)+(Z(G.los+10)+8)*ov);cam.position.copy(cpos);clook.set(camX*.6*(1-ov),0,(Z(G.cam)-19)*(1-ov)+Z(G.los+10)*ov);cam.lookAt(clook);
 ren.render(scene,cam)};
