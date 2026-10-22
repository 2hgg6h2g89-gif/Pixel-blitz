import * as THREE from './vendor/three.module.min.js';
const G=window.G,W=390,H=844,FW=53.3,HX=FW/2;
const wrap=document.getElementById('wrap');
const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
ren.setPixelRatio(Math.min(devicePixelRatio||1,2));ren.domElement.id='c3';wrap.insertBefore(ren.domElement,wrap.firstChild);
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(84,W/H,0.5,600);
function resize(){const r=wrap.getBoundingClientRect();ren.setSize(r.width,r.height,false);}
addEventListener('resize',resize);resize();
// sky
const sk=document.createElement('canvas');sk.width=2;sk.height=256;const sg=sk.getContext('2d');const gr=sg.createLinearGradient(0,0,0,256);
gr.addColorStop(0,'#03040f');gr.addColorStop(.45,'#0b1030');gr.addColorStop(.75,'#231a4a');gr.addColorStop(1,'#4a2a5a');sg.fillStyle=gr;sg.fillRect(0,0,2,256);
scene.background=new THREE.CanvasTexture(sk);scene.background.colorSpace=THREE.SRGBColorSpace;
scene.fog=new THREE.Fog(0x1a1438,220,520);
scene.add(new THREE.HemisphereLight(0xf4f2ff,0x3a5a3a,1.5));
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(-30,60,30);scene.add(sun);
const Z=y=>-y, Xw=x=>x-HX;
const lam=c=>new THREE.MeshLambertMaterial({color:c});
// field texture
const PX=20,fc=document.createElement('canvas');fc.width=Math.round(FW*PX);fc.height=120*PX;const f=fc.getContext('2d');
const T=window.TEAMS,home=()=>T[G.home],away=()=>T[G.away];
function paintField(){const W2=fc.width;
 for(let yd=0;yd<100;yd+=5){f.fillStyle=(yd/5)%2?'#3fb548':'#37a540';f.fillRect(0,(110-yd-5)*PX,W2,5*PX)}
 for(let x=0;x<FW;x+=FW/8){f.fillStyle='rgba(255,255,255,.035)';if(Math.round(x/(FW/8))%2)f.fillRect(x*PX,10*PX,FW/8*PX,100*PX)}
 const ez=(tm,y0,flip)=>{f.fillStyle=tm.c1;f.fillRect(0,y0,W2,10*PX);f.save();f.beginPath();f.rect(0,y0,W2,10*PX);f.clip();f.strokeStyle=HELM.mix(tm.c1,.82);f.lineWidth=PX*1.2;for(let x=-W2;x<W2*2;x+=PX*4){f.beginPath();f.moveTo(x,y0);f.lineTo(x+10*PX,y0+10*PX);f.stroke()}f.restore();
  f.save();f.translate(W2/2,y0+5*PX);if(flip)f.rotate(Math.PI);f.font=`900 ${5.2*PX}px "Arial Black", Arial`;f.textAlign='center';f.textBaseline='middle';f.lineWidth=PX*.7;f.strokeStyle=HELM.mix(tm.c1,.4);const nm=tm.n.split(' ')[1];f.strokeText(nm,0,PX*.3);f.fillStyle=tm.c2===tm.c1?'#fff':(Math.abs(parseInt(tm.c2.slice(1),16)-parseInt(tm.c1.slice(1),16))>0x303030?tm.c2:'#fff');f.fillText(nm,0,PX*.3);f.restore()};
 ez(away(),0,true);ez(home(),110*PX,false);
 f.fillStyle='#f4f8f2';
 for(let yd=0;yd<=100;yd+=5){const y=(110-yd)*PX;f.fillRect(0,y-2,W2,yd%50?4:6)}
 for(let yd=1;yd<100;yd++){if(yd%5==0)continue;const y=(110-yd)*PX;for(const hx of[1,22.9,29.4,FW-2.6])f.fillRect(hx*PX,y-1.5,1.4*PX,3)}
 f.font=`700 ${2.6*PX}px "Arial Black", Arial`;f.textAlign='center';f.textBaseline='middle';
 for(let yd=10;yd<100;yd+=10){const n=yd<=50?yd:100-yd,y=(110-yd)*PX;
  for(const [hx,r] of [[9,Math.PI/2],[FW-9,-Math.PI/2]]){f.save();f.translate(hx*PX,y);f.rotate(r);f.fillText(String(n),0,0);f.restore()}}
 // midfield logo: home emblem in a ring
 f.save();f.translate(W2/2,60*PX);f.beginPath();f.arc(0,0,4.2*PX,0,7);f.fillStyle='rgba(16,20,48,.88)';f.fill();f.lineWidth=PX*.5;f.strokeStyle=home().c1;f.stroke();f.lineWidth=PX*.18;f.strokeStyle='#fff';f.beginPath();f.arc(0,0,3.6*PX,0,7);f.stroke();
 f.rotate(Math.PI);f.scale(PX*.15,PX*.15);HELM.emblem(f,HELM.EMB[G.home],home().c1,'#0c0f20');f.restore();
 f.fillStyle='#fff';f.fillRect(0,0,PX*.5,fc.height);f.fillRect(W2-PX*.5,0,PX*.5,fc.height);
}

let fieldKey=G.home+'-'+G.away;paintField();
const ftex=new THREE.CanvasTexture(fc);ftex.colorSpace=THREE.SRGBColorSpace;ftex.anisotropy=8;
const field=new THREE.Mesh(new THREE.PlaneGeometry(FW,120),new THREE.MeshLambertMaterial({map:ftex}));field.rotation.x=-Math.PI/2;field.position.set(0,0,Z(50));scene.add(field);
const apron=new THREE.Mesh(new THREE.PlaneGeometry(90,160),lam(0x2e8a36));apron.rotation.x=-Math.PI/2;apron.position.set(0,-0.02,Z(50));scene.add(apron);
const border=new THREE.Mesh(new THREE.PlaneGeometry(FW+3,123),lam(0xffffff));border.rotation.x=-Math.PI/2;border.position.set(0,-0.01,Z(50));scene.add(border);
// ===== stadium: enclosed bowl (original design) =====
function rnd(a,b){return a+Math.random()*(b-a)}
const DECKS=[];let crowdOff=false;
const SA=40,SB=76,SCZ=Z(50),NS=380;
const ringP=[],ringN=[];
for(let i=0;i<NS;i++){const th=i/NS*Math.PI*2,c=Math.cos(th),s=Math.sin(th),n=5;
 ringP.push([SA*Math.sign(c)*Math.pow(Math.abs(c),2/n),SCZ+SB*Math.sign(s)*Math.pow(Math.abs(s),2/n)])}
for(let i=0;i<NS;i++){const a=ringP[(i-1+NS)%NS],b=ringP[(i+1)%NS];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;ringN.push([dz/l,-dx/l])}
// make sure normals point outward
{const p=ringP[0],n=ringN[0];if((p[0]*n[0]+(p[1]-SCZ)*n[1])<0)ringN.forEach(n=>{n[0]*=-1;n[1]*=-1})}
const RP=(i,d)=>{i=(i%NS+NS)%NS;return[ringP[i][0]+ringN[i][0]*d,ringP[i][1]+ringN[i][1]*d]};
const SEC=19;
function secColor(i,deck){const s=Math.floor(i/SEC);if(i%SEC===0)return new THREE.Color(0x4a4f60);const t=s%2?home():away();return new THREE.Color(deck?HELM.mix(t.c1,.62):HELM.mix(t.c1,.78))}
const isVom=(i,r,deck)=>!deck&&r>=3&&r<=6&&Math.floor(i/SEC)%3===0&&(i%SEC)>=7&&(i%SEC)<=11;
const crowdPos=[],crowdRot=[];
function deck(d0,h0,rows,dr,dh,deckId){const pos=[],col=[];const push=(p,c)=>{pos.push(...p);col.push(c.r,c.g,c.b)};
 for(let i=0;i<NS;i++)for(let r=0;r<rows;r++){const dA=d0+r*dr,dB=dA+dr,h=h0+r*dh;const a0=RP(i,dA),a1=RP(i+1,dA),b0=RP(i,dB),b1=RP(i+1,dB);
  let c=secColor(i,deckId);if(isVom(i,r,deckId))c=new THREE.Color(0x0a0a12);const cr=c.clone().multiplyScalar(.7);
  // tread
  push([a0[0],h,a0[1]],c);push([b0[0],h,b0[1]],c);push([a1[0],h,a1[1]],c);push([a1[0],h,a1[1]],c);push([b0[0],h,b0[1]],c);push([b1[0],h,b1[1]],c);
  // riser
  push([b0[0],h,b0[1]],cr);push([b0[0],h+dh,b0[1]],cr);push([b1[0],h,b1[1]],cr);push([b1[0],h,b1[1]],cr);push([b0[0],h+dh,b0[1]],cr);push([b1[0],h+dh,b1[1]],cr);
  if(!crowdOff&&i%SEC!==0&&!isVom(i,r,deckId)&&(i*7+r*13)%10<9){const m0=RP(i,dA+dr*.55),m1=RP(i+1,dA+dr*.55),m=[(m0[0]+m1[0])/2,(m0[1]+m1[1])/2];crowdPos.push([m[0],h+0.55,m[1]]);crowdRot.push(Math.atan2(-ringN[i][0],-ringN[i][1]))}}
 // back wall
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));scene.add(m);DECKS.push(m)}
function ringWall(d,h0,h1,mat,rep,inward){const pos=[],uv=[];for(let i=0;i<=NS;i++){const p=RP(i,d);pos.push(p[0],h0,p[1],p[0],h1,p[1]);uv.push(i/NS*rep,0,i/NS*rep,1)}
 const idx=[];for(let i=0;i<NS;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat);mat.side=THREE.DoubleSide;scene.add(m);return m}
function ringFlat(d0,d1,h,mat){const pos=[];for(let i=0;i<=NS;i++){const a=RP(i,d0),b=RP(i,d1);pos.push(a[0],h,a[1],b[0],h,b[1])}const idx=[];for(let i=0;i<NS;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();mat.side=THREE.DoubleSide;const m=new THREE.Mesh(g,mat);scene.add(m);return m}
const cvs=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=4;return t};
// field-level wall with generic graphics
let wallTex,ledTex;
function paintWall(){wallTex=cvs(512,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,home().c1);gr.addColorStop(1,HELM.mix(home().c1,.55));g.fillStyle=gr;g.fillRect(0,0,w,h);
 g.fillStyle='rgba(255,255,255,.12)';for(let x=0;x<w;x+=32){g.beginPath();g.moveTo(x,h);g.lineTo(x+16,0);g.lineTo(x+24,0);g.lineTo(x+8,h);g.fill()}
 g.font='900 30px "Arial Black",Arial';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('PIXEL BLITZ',w*.3,h/2+2);g.fillText(home().n.split(' ')[1],w*.78,h/2+2);g.fillStyle='#fff';g.fillRect(0,0,w,3)});
 ledTex=cvs(1024,32,(g,w,h)=>{const segs=[[home().c1,'GO '+home().a],['#0c0f20','BLITZ NIGHT'],[away().c1,away().n],['#ffd23f','MAKE SOME NOISE'],[home().c2,'PIXEL BLITZ']];const sw=w/segs.length;
  segs.forEach((s,i)=>{g.fillStyle=s[0];g.fillRect(i*sw,0,sw,h);g.font='900 20px Arial';g.textAlign='center';g.textBaseline='middle';const lum=parseInt(s[0].slice(1,3),16)*.3+parseInt(s[0].slice(3,5),16)*.59+parseInt(s[0].slice(5,7),16)*.11;g.fillStyle=lum>150?'#141a3a':'#fff';g.fillText(s[1],i*sw+sw/2,h/2+1)});
  g.fillStyle='rgba(0,0,0,.25)';for(let x=0;x<w;x+=3)g.fillRect(x,0,1,h)})}
paintWall();
const wallMat=new THREE.MeshBasicMaterial({map:wallTex});ringWall(-0.3,0,2.2,wallMat,24);
const D1=()=>deck(0,2.2,12,1.25,0.62,0);D1();
// suites / press box ring
const suiteTex=cvs(128,64,(g,w,h)=>{g.fillStyle='#1c2133';g.fillRect(0,0,w,h);for(let x=4;x<w;x+=16){const lit=Math.random()<.8;const gr=g.createLinearGradient(0,10,0,50);gr.addColorStop(0,lit?'#ffe9b8':'#2a3048');gr.addColorStop(1,lit?'#c8935a':'#1a1e30');g.fillStyle=gr;g.fillRect(x,12,12,36)}g.fillStyle='#3a4058';g.fillRect(0,0,w,8);g.fillRect(0,h-8,w,8)});
const sDepth=12*1.25+0.6;ringWall(sDepth,9.6,15.5,new THREE.MeshBasicMaterial({map:suiteTex,color:0xdddddd}),60);
ringFlat(sDepth-1.5,sDepth+2,15.5,lam(0x2a2f44));
// LED ribbon on upper deck fascia
const ledMat=new THREE.MeshBasicMaterial({map:ledTex});ringWall(sDepth-1.4,15.6,17.2,ledMat,6);
const D2=()=>deck(sDepth+0.2,17.2,12,1.3,0.85,1);D2();
// crowd: instanced camera-agnostic quads facing the field with color variety + subtle motion
const crowdMat=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});const cU={value:0};crowdMat.onBeforeCompile=sh=>{sh.uniforms.uTime=cU;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n float fi=float(gl_InstanceID);float hop=step(0.6,fract(fi*0.1373))*max(0.,sin(uTime*6.0+fi*1.71));transformed.y+=hop*0.28;transformed.x+=sin(uTime*1.3+fi)*0.04;')};
const cgeo=new THREE.PlaneGeometry(0.75,1.0);
const crowd=new THREE.InstancedMesh(cgeo,crowdMat,crowdPos.length);
const m4=new THREE.Matrix4(),col=new THREE.Color(),qq=new THREE.Quaternion(),yv=new THREE.Vector3(0,1,0),one1=new THREE.Vector3(1,1,1),pv0=new THREE.Vector3();
const shirt=()=>{const r=Math.random();return r<.38?home().c1:r<.5?home().c2:r<.62?away().c1:['#f2f2f2','#2a2a3a','#5a6a8a','#c8a27a','#8a3a3a','#3a6a4a'][Math.floor(Math.random()*6)]};
crowdPos.forEach((p,i)=>{qq.setFromAxisAngle(yv,crowdRot[i]);m4.compose(pv0.set(p[0],p[1],p[2]),qq,one1);crowd.setMatrixAt(i,m4);crowd.setColorAt(i,col.set(shirt()))});
scene.add(crowd);
function restyleStadium(){DECKS.forEach(m=>{scene.remove(m);m.geometry.dispose()});DECKS.length=0;crowdOff=true;D1();D2();
 for(let i=0;i<crowdPos.length;i++)crowd.setColorAt(i,col.set(shirt()));crowd.instanceColor.needsUpdate=true;
 paintWall();wallMat.map=wallTex;wallMat.needsUpdate=true;ledMat.map=ledTex;ledMat.needsUpdate=true}
let sbKey='';function paintSB(){const k=G.sh+'-'+G.sa+'-'+G.q+'-'+Math.ceil(G.clock)+'-'+G.home+G.away;if(k===sbKey)return;sbKey=k;const c=sbc.getContext('2d');const w=sbc.width,h=sbc.height;
 const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#141a3a');bg.addColorStop(1,'#070912');c.fillStyle=bg;c.fillRect(0,0,w,h);
 c.fillStyle=home().c1;c.fillRect(0,0,w/2,8);c.fillStyle=away().c1;c.fillRect(w/2,0,w/2,8);
 HELM.drawHelmet(c,70,100,110,home(),false,G.home);HELM.drawHelmet(c,w-70,100,110,away(),true,G.away);
 c.textAlign='center';c.textBaseline='middle';c.font='900 30px Arial';c.fillStyle='#fff';c.fillText(home().a,170,50);c.fillText(away().a,w-170,50);
 c.font='900 72px Arial';c.fillStyle='#ffd23f';c.fillText(String(G.sh),170,120);c.fillText(String(G.sa),w-170,120);
 c.fillStyle='#24305e';c.fillRect(w/2-46,30,92,40);c.font='900 28px Arial';c.fillStyle='#fff';c.fillText('Q'+G.q,w/2,51);
 const cs=Math.max(0,Math.ceil(G.clock));c.font='900 40px Arial';c.fillStyle='#ff5a5a';c.fillText(Math.floor(cs/60)+':'+String(cs%60).padStart(2,'0'),w/2,115);
 c.fillStyle='rgba(255,255,255,.06)';for(let y=0;y<h;y+=4)c.fillRect(0,y,w,1);sbt.needsUpdate=true}
// roof canopy ring + truss + light banks
const roofD=sDepth+13;ringFlat(roofD-6,roofD+10,34,lam(0x1a1e2c));
const trussTex=cvs(64,32,(g,w,h)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,w,h);g.strokeStyle='#5a6274';g.lineWidth=3;g.strokeRect(1,1,w-2,h-2);g.beginPath();g.moveTo(0,h);g.lineTo(w/2,0);g.lineTo(w,h);g.stroke()});
ringWall(roofD-6,31,34,new THREE.MeshBasicMaterial({map:trussTex,transparent:true,alphaTest:.3}),90);
const gcv=document.createElement('canvas');gcv.width=gcv.height=128;{const g=gcv.getContext('2d');const gr=g.createRadialGradient(64,64,2,64,64,64);gr.addColorStop(0,'rgba(255,250,230,1)');gr.addColorStop(.2,'rgba(255,240,200,.6)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}
const glowMat=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gcv),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
const lbGeo=new THREE.BoxGeometry(5,1.4,0.6),lbMat=new THREE.MeshBasicMaterial({color:0xfffbe8});
for(let k=0;k<NS;k+=19){const p=RP(k,roofD-6.2);const b=new THREE.Mesh(lbGeo,lbMat);b.position.set(p[0],32.6,p[1]);b.lookAt(0,0,SCZ);scene.add(b);const gl=new THREE.Sprite(glowMat);gl.position.set(p[0],32.6,p[1]);gl.scale.set(16,16,1);scene.add(gl)}
// field light pool
const poolTex=cvs(256,256,(g,w,h)=>{const gr=g.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'rgba(255,250,235,.22)');gr.addColorStop(1,'rgba(255,250,235,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)});
const pool=new THREE.Mesh(new THREE.PlaneGeometry(110,190),new THREE.MeshBasicMaterial({map:poolTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));pool.rotation.x=-Math.PI/2;pool.position.set(0,.02,SCZ);scene.add(pool);
// night sky stars
{const sp=[];for(let i=0;i<500;i++){const a=Math.random()*Math.PI*2,e=0.25+Math.random()*1.2,r=380;sp.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,SCZ+Math.sin(a)*Math.cos(e)*r)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.2,sizeAttenuation:false,fog:false})))}
// goalposts + nets
const gm=lam(0xffd23f);
const netTex=cvs(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(240,240,250,.85)';g.lineWidth=1;for(let x=0;x<=w;x+=8){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=0;y<=h;y+=8){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}});netTex.wrapT=THREE.RepeatWrapping;netTex.repeat.set(4,3);
for(const [yy,s] of [[110,1],[-10,-1]]){const g=new THREE.Group();const post=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,5,8),gm);post.position.y=2.5;g.add(post);
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,6.2,8),gm);bar.rotation.z=Math.PI/2;bar.position.y=5;g.add(bar);
 for(const sx of[-3,3]){const u=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,9,8),gm);u.position.set(sx,9.5,0);g.add(u)}
 const net=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshBasicMaterial({map:netTex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));net.position.set(0,11,-s*1.2);g.add(net);
 g.position.set(0,0,Z(yy+s*1));scene.add(g)}
// end-zone video boards (live score)
const sbc=document.createElement('canvas');sbc.width=512;sbc.height=192;
const sbt=new THREE.CanvasTexture(sbc);sbt.colorSpace=THREE.SRGBColorSpace;
for(const [zz,ry] of [[SCZ-SB-sDepth-2,0],[SCZ+SB+sDepth+2,Math.PI]]){const fr=new THREE.Mesh(new THREE.BoxGeometry(38,15,1.5),lam(0x15182a));fr.position.set(0,26,zz);fr.rotation.y=ry;scene.add(fr);
 const sc2=new THREE.Mesh(new THREE.PlaneGeometry(36,13.5),new THREE.MeshBasicMaterial({map:sbt}));sc2.position.set(0,13.5,zz+(ry?-0.8:0.8));sc2.rotation.y=ry;scene.add(sc2)}
// sideline benches, team and staff (low-poly instanced)
const benchMat=lam(0x3a4058);for(const s of[-1,1]){const bn=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.9,34),benchMat);bn.position.set(s*(HX+8),0.45,Z(50));scene.add(bn)}
const SLN=70;const slBody=new THREE.InstancedMesh(new THREE.BoxGeometry(0.9,1.5,0.55),lam(0xffffff),SLN),slHead=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.42,0),lam(0xffffff),SLN);
for(let i=0;i<SLN;i++){const s=i%2?1:-1,staff=i%7===0,tm=s<0?home():away();const x=s*(HX+rnd(5,10)),z=Z(rnd(28,72));
 m4.makeTranslation(x,0.75,z);slBody.setMatrixAt(i,m4);slBody.setColorAt(i,col.set(staff?'#20232e':tm.c1));m4.makeTranslation(x,1.85,z);slHead.setMatrixAt(i,m4);slHead.setColorAt(i,col.set(staff?'#e0b48c':tm.h))}
scene.add(slBody);scene.add(slHead);
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
const TM=[mkTeamMesh(),mkTeamMesh()];
const ngeo=new THREE.PlaneGeometry(1,1);
function mkNumMesh(){const mat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(document.createElement('canvas')),alphaTest:.5,depthTest:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 mat.onBeforeCompile=sh=>{sh.vertexShader='attribute vec2 uvOff;\n'+sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vMapUv = vMapUv*vec2(0.1,0.1) + uvOff;')};
 const g=ngeo.clone();const uo=new THREE.InstancedBufferAttribute(new Float32Array(N*2),2);uo.setUsage(THREE.DynamicDrawUsage);g.setAttribute('uvOff',uo);const m=new THREE.InstancedMesh(g,mat,N);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;scene.add(m);return{m,mat,uo}}
const NM=[mkNumMesh(),mkNumMesh()];const camUp=new THREE.Vector3(),camBk=new THREE.Vector3();window.__atlases=[];
let atlasKey='';function ensureAtlas(){const k=G.home+'-'+G.away;if(k===atlasKey)return;atlasKey=k;[home(),away()].forEach((t,i)=>{const c=S.buildAtlas(t);window.__atlases[i]=c;const tx=new THREE.CanvasTexture(c);tx.magFilter=THREE.NearestFilter;tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;tx.colorSpace=THREE.SRGBColorSpace;TM[i].mat.map=tx;TM[i].mat.needsUpdate=true;const nc=S.buildNumbers(t);const nt=new THREE.CanvasTexture(nc);nt.magFilter=nt.minFilter=THREE.NearestFilter;nt.generateMipmaps=false;nt.colorSpace=THREE.SRGBColorSpace;NM[i].mat.map=nt;NM[i].mat.needsUpdate=true})}
const pm=new THREE.Matrix4(),v3=new THREE.Vector3(),sc=new THREE.Vector3();
function poseOf(p){const P=S.P,line=p.role==='OL'||p.role==='DL';
 if(p.dive>0)return P.dive;if(p.fallen>0)return P.fall;
 if(G.st==='presnap')return line?P.stance:p.role==='QB'?P.hold:P.idle;
 if(G.celeb&&p.team===0&&G.st==='result')return P.celeb;
 if(p.throwT>0)return P.throw+Math.max(0,Math.min(4,Math.floor((1-p.throwT/(p.throwDur||0.5))*5)));if(p.catchT>0)return p.catchT>0.25?P.catch1:P.catch2;if(p.eng)return P.block;
 const hb=p===G.carrier&&(!G.ball||G.ball.caught)&&!(G.pend);const mv=Math.hypot(p.vx,p.vy)>0.6;const ph=Math.floor(p.anim/0.55)%4;
 if(hb)return mv?P.hrun+ph:P.hold;if(mv)return P.run+ph;return P.idle}
function crouchOf(pose){const P=S.P;return pose===P.stance?3:pose===P.block?1:(pose>=P.throw&&pose<P.throw+5)?[1,2,2,2,1][pose-P.throw]:pose===P.celeb?-2:0}
function updatePlayers(){ensureAtlas();const cnt=[0,0],nc=[0,0];camUp.set(0,1,0).applyQuaternion(cam.quaternion);camBk.set(0,0,1).applyQuaternion(cam.quaternion);
 G.players.forEach((p,si)=>{const sp=Math.hypot(p.vx,p.vy);let fx=p.vx,fy=p.vy;
  if(p.throwT>0&&p.throwDir){fx=p.throwDir.x;fy=p.throwDir.y}else if(p.eng&&p.blk){fx=p.blk.x-p.x;fy=p.blk.y-p.y}
  else if(sp<0.4||G.st==='presnap'){fx=0;fy=p.team===0?1:-1}
  const l=Math.hypot(fx,fy)||1;const k=p.throwT>0?1:.25;p.fdx=(p.fdx??0)*(1-k)+fx/l*k;p.fdy=(p.fdy??(p.team?-1:1))*(1-k)+fy/l*k;
  const a=Math.atan2(p.fdx,p.fdy),aa=Math.abs(a)*180/Math.PI;const dir=aa<22.5?4:aa<67.5?3:aa<112.5?2:aa<157.5?1:0;const mir=a<0?-1:1;
  const pose=poseOf(p);const line=(p.role==='OL'||p.role==='DL')?1:0;const T=TM[p.team],i=cnt[p.team]++;
  const s=3.5*(line?1.15:1);sc.set(s*mir,s,1);pm.compose(v3.set(Xw(p.x),0.02,Z(p.y)),cam.quaternion,sc);T.m.setMatrixAt(i,pm);
  T.uo.setXY(i,(dir*S.POSES+pose)*CU,1-((p.skin*2+line)+1)*CV);
  const P=S.P;const noNum=dir===2||pose===P.dive||pose===P.fall||((dir<=1)&&(pose===P.hold||(pose>=P.hrun&&pose<P.hrun+4)||pose===P.catch2||pose===P.throw));
  if(!noNum){const Nm=NM[p.team],j=nc[p.team]++;const y0=1+crouchOf(pose);const hpx=24-(y0+11.5);const u=s/24;
   v3.set(Xw(p.x),0.02,Z(p.y)).addScaledVector(camUp,hpx*u).addScaledVector(camBk,0.08);pm.compose(v3,cam.quaternion,sc.set(9*u*(line?1.05:0.95),7*u,1));Nm.m.setMatrixAt(j,pm);const n=Math.max(0,Math.min(99,p.num|0));Nm.uo.setXY(j,(n%10)*0.1,1-(Math.floor(n/10)+1)*0.1)}
  m4.makeRotationX(-Math.PI/2);m4.setPosition(Xw(p.x),.02,Z(p.y));shadow.setMatrixAt(si,m4)});
 TM.forEach((T,k)=>{T.m.count=cnt[k];T.m.instanceMatrix.needsUpdate=true;T.uo.needsUpdate=true});NM.forEach((T,k)=>{T.m.count=nc[k];T.m.instanceMatrix.needsUpdate=true;T.uo.needsUpdate=true});shadow.count=G.players.length;shadow.instanceMatrix.needsUpdate=true}
// route ribbons
const RCOL=[0xff2a2a,0xff8a1f,0xffd400,0x9a3cff];let routeGrp=new THREE.Group();scene.add(routeGrp);let routeVer=-1;
function buildRoutes(){routeGrp.clear();(G.routes||[]).forEach((r,ri)=>{const pts=r.pts;const pos=[];const w=.2;
 for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;const nx=-dy/l*w,ny=dx/l*w;
  pos.push(Xw(pts[i][0]+nx),.06,Z(pts[i][1]+ny),Xw(pts[i][0]-nx),.06,Z(pts[i][1]-ny))}
 const idx=[];for(let i=0;i<pts.length-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 const mat=new THREE.MeshBasicMaterial({color:RCOL[(r.i??ri)%4],side:THREE.DoubleSide,transparent:true,opacity:.95,depthWrite:false});
 const ul=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x08102a,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}));ul.scale.set(1,1,1);ul.position.set(.12,-.01,.12);routeGrp.add(ul);routeGrp.add(new THREE.Mesh(g,mat));
 {const dot=new THREE.Mesh(new THREE.CircleGeometry(.45,14),mat);dot.rotation.x=-Math.PI/2;dot.position.set(Xw(pts[0][0]),.07,Z(pts[0][1]));routeGrp.add(dot)}
 const e2=pts[pts.length-1],e1=pts[pts.length-2];const ah=new THREE.Mesh(new THREE.ConeGeometry(.45,1.1,3),mat);ah.position.set(Xw(e2[0]),.1,Z(e2[1]));ah.rotation.x=-Math.PI/2;ah.rotation.z=-Math.atan2(e2[0]-e1[0],e2[1]-e1[1]);ah.scale.z=.1;routeGrp.add(ah)})}
// projection for 2D overlay
const pv=new THREE.Vector3();
window.PROJ=(x,y,h=1)=>{pv.set(Xw(x),h,Z(y)).project(cam);return[(pv.x+1)/2*W,(1-pv.y)/2*H]};
const cpos=new THREE.Vector3(0,17,0),clook=new THREE.Vector3();let camX=0,camZ=1;const cl3=(v,a,b)=>Math.max(a,Math.min(b,v));
window.R3D=()=>{const st=G.st;if(st==='title'||st==='team'){ren.domElement.style.visibility='hidden';return}ren.domElement.style.visibility='visible';
 paintSB();const fk=G.home+'-'+G.away;if(fk!==fieldKey){fieldKey=fk;paintField();ftex.needsUpdate=true;restyleStadium()}if(ledMat.map)ledMat.map.offset.x=(performance.now()/1000*0.02)%1;
 const on=st==='live'||st==='result'||st==='presnap';
 cam.updateMatrixWorld();if(on)updatePlayers();TM.forEach(T=>T.m.visible=on);NM.forEach(T=>T.m.visible=on);cU.value=performance.now()/1000;shadow.visible=on;
 if(G.routeVer!==routeVer){routeVer=G.routeVer;buildRoutes()}
 routeGrp.visible=st==='presnap'||(st==='live'&&!G.thrown&&G.carrier&&G.carrier.role==='QB'&&G.play.t==='pass');
 los.position.z=Z(G.los);fd.position.z=Z(Math.min(G.los+G.togo,100));fd.visible=G.los+G.togo<100;
 const c=G.carrier;ring.visible=on&&!!c;star.visible=ring.visible;if(c){ring.position.set(Xw(c.x),.04,Z(c.y));star.position.set(Xw(c.x),.05,Z(c.y));star.rotation.z=G.t*2}
 const b=G.ball;ball.visible=on&&!!b&&!b.caught;tgtMk.visible=false;
 if(b&&!b.caught){{const kk=Math.min(1,b.t/b.T);ball.position.set(Xw(b.x),(b.h0||1.6)*(1-kk)+1.6*kk+b.z*0.9,Z(b.y))}ball.rotation.y=Math.atan2(-(b.tx-b.x0),(b.ty-b.y0));ball.rotation.x=-.5;ball.rotation.z=(b.t||0)*28;tgtMk.visible=true;tgtMk.position.set(Xw(b.tx),.05,Z(b.ty))}
 else if(c){const a=(c.face||0);ball.position.set(Xw(c.x)+Math.cos(a)*.55,1.25,Z(c.y)-Math.sin(a)*.55);ball.rotation.set(0,a,0)}
 let ov=G.st==='presnap'&&G.ovT>0?Math.min(1,G.ovT/0.6):0;ov=ov*ov*(3-2*ov);
 {const xs=[];const c2=G.carrier,b2=G.ball;
  if(on){if(b2&&!b2.caught){xs.push(b2.x,b2.tx)}else if(c2){xs.push(c2.x+cl3(c2.vx*0.5,-4,4))}
   if(G.aim)xs.push(G.aim.tx);if(G.carrier===G.qb&&G.qb)xs.push(G.qb.x)}
  let tX=0;if(xs.length){const mn=Math.min(...xs),mx=Math.max(...xs);tX=Xw((mn+mx)/2)*0.62}
  const pre=G.st==='presnap';camX+=(tX-camX)*(pre?0.3:0.12);
  const zT=b2&&!b2.caught&&b2.tt==='bomb'?1.12:1;camZ+=(zT-camZ)*(pre?0.3:0.05)}
 cpos.set(camX*(1-ov),(36*camZ)*(1-ov)+80*ov,(Z(G.cam)+30*camZ)*(1-ov)+(Z(G.los+10)+8)*ov);cam.position.copy(cpos);if(G.shake>0){cam.position.x+=(Math.random()-.5)*G.shake*3;cam.position.y+=(Math.random()-.5)*G.shake*3}clook.set(camX*.9*(1-ov),0,(Z(G.cam)-19)*(1-ov)+Z(G.los+10)*ov);cam.lookAt(clook);if(window.__camOv){const o=window.__camOv;cam.position.set(...o.p);cam.lookAt(...o.l)}
 ren.render(scene,cam)};
