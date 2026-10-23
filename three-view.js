import * as THREE from './vendor/three.module.min.js';
const G=window.G,W=390,H=844,FW=53.3,HX=FW/2;
const wrap=document.getElementById('wrap');
const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});window.__ren=ren;
ren.setPixelRatio(Math.min(devicePixelRatio||1,2));ren.domElement.id='c3';wrap.insertBefore(ren.domElement,wrap.firstChild);
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(84,W/H,2,700);
function resize(){const r=wrap.getBoundingClientRect();ren.setSize(r.width,r.height,false);}
addEventListener('resize',resize);resize();
// sky
const sk=document.createElement('canvas');sk.width=2;sk.height=256;const sg=sk.getContext('2d');const gr=sg.createLinearGradient(0,0,0,256);
gr.addColorStop(0,'#03040f');gr.addColorStop(.45,'#0b1030');gr.addColorStop(.75,'#231a4a');gr.addColorStop(1,'#4a2a5a');sg.fillStyle=gr;sg.fillRect(0,0,2,256);
const skyNight=new THREE.CanvasTexture(sk);skyNight.colorSpace=THREE.SRGBColorSpace;scene.background=skyNight;
const skyDay=(()=>{const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#2f7fd8');gr.addColorStop(.6,'#7db8f0');gr.addColorStop(1,'#d8ecff');g.fillStyle=gr;g.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
scene.fog=new THREE.Fog(0x1a1438,220,520);
const HEMI=new THREE.HemisphereLight(0xf4f2ff,0x3a5a3a,1.5);scene.add(HEMI);
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(-30,60,30);scene.add(sun);
const Z=y=>-y, Xw=x=>x-HX;
const lam=c=>new THREE.MeshLambertMaterial({color:c});
// field texture
const PX=16,fc=document.createElement('canvas');fc.width=Math.round(FW*PX);fc.height=120*PX;const f=fc.getContext('2d');
const T=window.TEAMS,home=()=>T[G.home],away=()=>T[G.away];
function paintField(){const W2=fc.width;
 // Real gridiron: alternating mowing stripes every 5 yards + subtle grain
 for(let yd=0;yd<100;yd+=5){f.fillStyle=(yd/5)%2?'#2f8f3c':'#247a32';f.fillRect(0,(110-yd-5)*PX,W2,5*PX)}
 {let s=1234567;const R=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<18000;i++){const x=R()*W2|0,y=(10+R()*100)*PX|0,v=R();f.fillStyle=v<.5?'#1c6230':v<.85?'#3aa84a':'#55b85e';f.fillRect(x,y,1,v<.5?2:1)}
  // soft mowing sheen every 10 yards
  for(let yd=0;yd<100;yd+=10){const y=(110-yd-10)*PX;const g=f.createLinearGradient(0,y,0,y+10*PX);g.addColorStop(0,'rgba(255,255,255,.05)');g.addColorStop(.5,'rgba(0,0,0,.04)');g.addColorStop(1,'rgba(255,255,255,.05)');f.fillStyle=g;f.fillRect(0,y,W2,10*PX)}}
 // lengthwise mow bands
 for(let x=0;x<FW;x+=FW/10){f.fillStyle='rgba(255,255,255,.03)';if(Math.round(x/(FW/10))%2)f.fillRect(x*PX,10*PX,FW/10*PX,100*PX)}
 const ez=(tm,y0,flip,ti)=>{f.fillStyle=tm.c1;f.fillRect(0,y0,W2,10*PX);
  f.save();f.beginPath();f.rect(0,y0,W2,10*PX);f.clip();
  // pixel stripe pattern
  const band=HELM.mix(tm.c1,.78);for(let x=0;x<W2;x+=PX*2){f.fillStyle=(Math.floor(x/(PX*2))%2)?band:HELM.mix(tm.c1,.92);f.fillRect(x,y0,PX*2,10*PX)}
  // chevron hash accents
  f.strokeStyle=HELM.mix(tm.c1,.55);f.lineWidth=Math.max(2,PX*.35);for(let x=-W2;x<W2*2;x+=PX*5){f.beginPath();f.moveTo(x,y0+PX);f.lineTo(x+8*PX,y0+9*PX);f.stroke()}
  f.restore();
  f.save();f.translate(W2/2,y0+5*PX);if(flip)f.rotate(Math.PI);
  const nm=(tm.nick||tm.n.split(' ')[1]||'').toUpperCase();
  const fill=tm.c2===tm.c1?'#fff':(Math.abs(parseInt(String(tm.c2).replace('#','').slice(0,6),16)-parseInt(String(tm.c1).replace('#','').slice(0,6),16))>0x303030?tm.c2:'#fff');
  const sc=Math.max(3,Math.round(PX*0.55));
  if(window.pxText){pxText(f,nm,0,0,sc,fill,{al:'center',out:HELM.mix(tm.c1,.35),sk:0.12})}
  else{f.font=`900 ${5.2*PX}px "Arial Black", Arial`;f.textAlign='center';f.textBaseline='middle';f.lineWidth=PX*.7;f.strokeStyle=HELM.mix(tm.c1,.4);f.strokeText(nm,0,PX*.3);f.fillStyle=fill;f.fillText(nm,0,PX*.3)}
  // v29: no coin/medallion logos in end zones — wordmark only
  f.restore()};
 ez(away(),0,false,G.away);ez(home(),110*PX,false,G.home);
 // Goal lines + 5-yard lines (crisp white)
 f.fillStyle='#f7faf6';
 for(let yd=0;yd<=100;yd+=5){const y=(110-yd)*PX;const thick=(yd===0||yd===100)?7:(yd%10===0?5:3);f.fillRect(0,y-thick/2,W2,thick)}
 f.fillRect(0,0,W2,5);f.fillRect(0,120*PX-5,W2,5);
 // Hash marks every yard
 for(let yd=1;yd<100;yd++){if(yd%5===0)continue;const y=(110-yd)*PX;
  for(const hx of[1.2,23.5,29.8,FW-2.4]){f.fillRect(Math.round(hx*PX),y-2,Math.round(1.4*PX),4)}}
 // Yard numbers — larger, outlined for readability
 f.font=`900 ${3.2*PX}px "Arial Black", Arial`;f.textAlign='center';f.textBaseline='middle';
 for(let yd=10;yd<100;yd+=10){const n=yd<=50?yd:100-yd,y=(110-yd)*PX;
  for(const [hx,r] of [[8.5,Math.PI/2],[FW-8.5,-Math.PI/2]]){
   f.save();f.translate(hx*PX,y);f.rotate(r);
   f.lineWidth=Math.max(2,PX*0.35);f.strokeStyle='rgba(10,40,18,.55)';f.strokeText(String(n),0,0);
   f.fillStyle='#f7faf6';f.fillText(String(n),0,0);f.restore()}}
 // midfield mark — light emblem only (no coin disc)
 f.save();f.translate(W2/2,60*PX);f.globalAlpha=.55;f.rotate(Math.PI);if(HELM.drawLogo)HELM.drawLogo(f,0,0,PX*4.2,G.home,home().c1,HELM.mix(home().c1,.35));f.restore();
 f.fillStyle='#f4f8f2';f.fillRect(0,0,6,fc.height);f.fillRect(W2-6,0,6,fc.height);quantField();buildMips()}
let _ftexReady=false;function buildMips(){if(!_ftexReady)return;const L=[fc];let c=fc;while(c.width>1||c.height>1){const n=document.createElement('canvas');n.width=Math.max(1,c.width>>1);n.height=Math.max(1,c.height>>1);const g=n.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(c,0,0,n.width,n.height);L.push(n);c=n}ftex.mipmaps=L;ftex.generateMipmaps=false;ftex.needsUpdate=true}
function quantField(){const id=f.getImageData(0,0,fc.width,fc.height),d=id.data;const pal=[[0x1a,0x5a,0x26],[0x1f,0x67,0x2b],[0x2a,0x82,0x37],[0x3a,0x9a,0x44],[0x4f,0xae,0x52],[0xf4,0xf8,0xf2],[0x12,0x16,0x30]];
 for(const tm of [home(),away()])for(const c of [tm.c1,tm.c2,HELM.mix(tm.c1,.82),HELM.mix(tm.c1,.4)]){const n=parseInt(String(c).replace('#','').slice(0,6),16);if(!isNaN(n))pal.push([n>>16&255,n>>8&255,n&255])}
 const cache=new Map();for(let i=0;i<d.length;i+=4){const k=(d[i]>>2)<<12|(d[i+1]>>2)<<6|(d[i+2]>>2);let c=cache.get(k);if(!c){let bd=1e9;for(const p of pal){const e=(p[0]-d[i])**2*0.3+(p[1]-d[i+1])**2*0.59+(p[2]-d[i+2])**2*0.11;if(e<bd){bd=e;c=p}}cache.set(k,c)}d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255}f.putImageData(id,0,0)}

let IS_DAY=false;function setDay(d){IS_DAY=d;scene.background=d?skyDay:skyNight;scene.fog.color.set(d?0xbcd8f5:0x1a1438);HEMI.intensity=d?2.1:1.5;GLOWS.forEach(g=>g.visible=!d);if(STARS)STARS.visible=!d;pool.visible=!d;sun.intensity=d?2.4:1.6}window.__setDay=setDay;
let fieldKey=G.home+'-'+G.away;paintField();
const ftex=new THREE.CanvasTexture(fc);ftex.colorSpace=THREE.SRGBColorSpace;ftex.anisotropy=8;ftex.magFilter=THREE.NearestFilter;ftex.minFilter=THREE.LinearMipmapLinearFilter;ftex.anisotropy=16;_ftexReady=true;buildMips();
const field=new THREE.Mesh(new THREE.PlaneGeometry(FW,120),new THREE.MeshLambertMaterial({map:ftex}));field.renderOrder=-2;field.rotation.x=-Math.PI/2;field.position.set(0,0,Z(50));scene.add(field);
const apron=new THREE.Mesh(new THREE.PlaneGeometry(90,160),lam(0x2e8a36));apron.rotation.x=-Math.PI/2;apron.position.set(0,-0.3,Z(50));apron.material.polygonOffset=true;apron.material.polygonOffsetFactor=6;apron.material.polygonOffsetUnits=6;apron.renderOrder=-4;scene.add(apron);
const border=new THREE.Group();{const bm=lam(0xf4f8f2);bm.polygonOffset=true;bm.polygonOffsetFactor=2;bm.polygonOffsetUnits=2;for(const [w,h,x,z] of [[1.5,123,-FW/2-0.75,0],[1.5,123,FW/2+0.75,0],[FW,1.5,0,-60.75],[FW,1.5,0,60.75]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),bm);m.rotation.x=-Math.PI/2;m.position.set(x,-0.02,z);border.add(m)}}border.position.set(0,0,Z(50));border.renderOrder=-3;scene.add(border);
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
const crowdPos=[],crowdRot=[],crowdSec=[];
function deck(d0,h0,rows,dr,dh,deckId){const pos=[],col=[];const push=(p,c)=>{pos.push(...p);col.push(c.r,c.g,c.b)};
 for(let i=0;i<NS;i++)for(let r=0;r<rows;r++){const dA=d0+r*dr,dB=dA+dr,h=h0+r*dh;const a0=RP(i,dA),a1=RP(i+1,dA),b0=RP(i,dB),b1=RP(i+1,dB);
  let c=secColor(i,deckId);if(isVom(i,r,deckId))c=new THREE.Color(0x0a0a12);const cr=c.clone().multiplyScalar(.7);
  // tread
  push([a0[0],h,a0[1]],c);push([b0[0],h,b0[1]],c);push([a1[0],h,a1[1]],c);push([a1[0],h,a1[1]],c);push([b0[0],h,b0[1]],c);push([b1[0],h,b1[1]],c);
  // riser
  push([b0[0],h,b0[1]],cr);push([b0[0],h+dh,b0[1]],cr);push([b1[0],h,b1[1]],cr);push([b1[0],h,b1[1]],cr);push([b0[0],h+dh,b0[1]],cr);push([b1[0],h+dh,b1[1]],cr);
  if(!crowdOff&&i%SEC!==0&&!isVom(i,r,deckId)&&(i*7+r*13)%10<9){for(const u of[0.25,0.75]){const m0=RP(i,dA+dr*.55),m1=RP(i+1,dA+dr*.55),m=[m0[0]+(m1[0]-m0[0])*u,m0[1]+(m1[1]-m0[1])*u];crowdPos.push([m[0],h+0.55,m[1]]);crowdRot.push(Math.atan2(-ringN[i][0],-ringN[i][1]));crowdSec.push(Math.floor(i/SEC)%2)}}}
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
 g.font='900 30px "Arial Black",Arial';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('PIXEL BLITZ',w*.3,h/2+2);g.fillText(home().nick||home().n.split(' ')[1],w*.78,h/2+2);g.fillStyle='#fff';g.fillRect(0,0,w,3)});
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
const crowdMat=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});const cU={value:0},cCheer={value:0};crowdMat.onBeforeCompile=sh=>{sh.uniforms.uTime=cU;sh.uniforms.uCheer=cCheer;sh.vertexShader='uniform float uTime;uniform float uCheer;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n float fi=float(gl_InstanceID);float hop=step(0.6-uCheer*0.55,fract(fi*0.1373))*max(0.,sin(uTime*(6.0+uCheer*4.0)+fi*1.71));transformed.y+=hop*(0.28+uCheer*0.5);transformed.x+=uCheer*sin(uTime*9.0+fi)*0.12*step(0.5,uv.y);transformed.x+=sin(uTime*1.3+fi)*0.04;')};
const cgeo=new THREE.PlaneGeometry(0.75,1.0);
const crowd=new THREE.InstancedMesh(cgeo,crowdMat,crowdPos.length);
const m4=new THREE.Matrix4(),col=new THREE.Color(),qq=new THREE.Quaternion(),yv=new THREE.Vector3(0,1,0),one1=new THREE.Vector3(1,1,1),pv0=new THREE.Vector3();
const shirt=(i)=>{const t=(i===undefined||crowdSec[i]===1||Math.random()<.25)?home():away();const r=Math.random();return r<.55?t.c1:r<.72?t.c2:r<.8?'#ffffff':['#f2f2f2','#2a2a3a','#5a6a8a','#c8a27a'][Math.floor(Math.random()*4)]};
crowdPos.forEach((p,i)=>{qq.setFromAxisAngle(yv,crowdRot[i]);m4.compose(pv0.set(p[0],p[1],p[2]),qq,one1);crowd.setMatrixAt(i,m4);crowd.setColorAt(i,col.set(shirt(i)))});
scene.add(crowd);
function restyleStadium(){DECKS.forEach(m=>{scene.remove(m);m.geometry.dispose()});DECKS.length=0;crowdOff=true;D1();D2();
 for(let i=0;i<crowdPos.length;i++)crowd.setColorAt(i,col.set(shirt(i)));crowd.instanceColor.needsUpdate=true;
 paintWall();wallMat.map=wallTex;wallMat.needsUpdate=true;ledMat.map=ledTex;ledMat.needsUpdate=true}
let sbKey='';function paintSB(){const bt=G.banner&&G.banner.a<4?G.banner.t:'';const k=G.sh+'-'+G.sa+'-'+G.q+'-'+Math.ceil(G.clock)+'-'+G.home+G.away+bt;if(k===sbKey)return;sbKey=k;const c=sbc.getContext('2d');const w=sbc.width,h=sbc.height;
 const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#141a3a');bg.addColorStop(1,'#070912');c.fillStyle=bg;c.fillRect(0,0,w,h);
 c.fillStyle=home().c1;c.fillRect(0,0,w/2,8);c.fillStyle=away().c1;c.fillRect(w/2,0,w/2,8);
 HELM.drawHelmet(c,70,100,110,home(),false,G.home);HELM.drawHelmet(c,w-70,100,110,away(),true,G.away);
 c.textAlign='center';c.textBaseline='middle';c.font='900 30px Arial';c.fillStyle='#fff';c.fillText(home().a,170,50);c.fillText(away().a,w-170,50);
 c.font='900 72px Arial';c.fillStyle='#ffd23f';c.fillText(String(G.sh),170,120);c.fillText(String(G.sa),w-170,120);
 c.fillStyle='#24305e';c.fillRect(w/2-46,30,92,40);c.font='900 28px Arial';c.fillStyle='#fff';c.fillText('Q'+G.q,w/2,51);
 const cs=Math.max(0,Math.ceil(G.clock));c.font='900 40px Arial';c.fillStyle='#ff5a5a';c.fillText(Math.floor(cs/60)+':'+String(cs%60).padStart(2,'0'),w/2,115);
 if(bt){c.fillStyle='rgba(8,6,20,.85)';c.fillRect(0,h-44,w,44);c.fillStyle=home().c1;c.fillRect(0,h-44,w,4);c.font='italic 900 30px Arial';c.fillStyle='#ffd23f';c.fillText('REPLAY  '+bt,w/2,h-20)}
 c.fillStyle='rgba(255,255,255,.06)';for(let y=0;y<h;y+=4)c.fillRect(0,y,w,1);sbt.needsUpdate=true}
// roof canopy ring + truss + light banks
const roofD=sDepth+13;ringFlat(roofD-6,roofD+10,34,lam(0x1a1e2c));
const trussTex=cvs(64,32,(g,w,h)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,w,h);g.strokeStyle='#5a6274';g.lineWidth=3;g.strokeRect(1,1,w-2,h-2);g.beginPath();g.moveTo(0,h);g.lineTo(w/2,0);g.lineTo(w,h);g.stroke()});
ringWall(roofD-6,31,34,new THREE.MeshBasicMaterial({map:trussTex,transparent:true,alphaTest:.3}),90);
const gcv=document.createElement('canvas');gcv.width=gcv.height=128;{const g=gcv.getContext('2d');const gr=g.createRadialGradient(64,64,2,64,64,64);gr.addColorStop(0,'rgba(255,250,230,1)');gr.addColorStop(.2,'rgba(255,240,200,.6)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}
const flareTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.strokeStyle='rgba(180,220,255,.5)';g.lineWidth=3;g.beginPath();g.arc(64,64,40,0,7);g.stroke();const gr=g.createLinearGradient(0,64,128,64);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,250,230,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,61,128,6);return new THREE.CanvasTexture(c)})();
const flareMat=new THREE.SpriteMaterial({map:flareTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55});
const GLOWS=[];const glowMat=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gcv),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
const lbGeo=new THREE.BoxGeometry(5,1.4,0.6),lbMat=new THREE.MeshBasicMaterial({color:0xfffbe8});
for(let k=0;k<NS;k+=19){const p=RP(k,roofD-6.2);const b=new THREE.Mesh(lbGeo,lbMat);b.position.set(p[0],32.6,p[1]);b.lookAt(0,0,SCZ);scene.add(b);const gl=new THREE.Sprite(glowMat);gl.position.set(p[0],32.6,p[1]);gl.scale.set(16,16,1);scene.add(gl);GLOWS.push(gl);const fl=new THREE.Sprite(flareMat);fl.position.set(p[0],32.6,p[1]);fl.scale.set(30,30,1);scene.add(fl);GLOWS.push(fl)}
// field light pool
const poolTex=cvs(256,256,(g,w,h)=>{const gr=g.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'rgba(255,250,235,.22)');gr.addColorStop(1,'rgba(255,250,235,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)});
const pool=new THREE.Mesh(new THREE.PlaneGeometry(110,190),new THREE.MeshBasicMaterial({map:poolTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));pool.rotation.x=-Math.PI/2;pool.position.set(0,.02,SCZ);scene.add(pool);
// night sky stars
let STARS=null;
{const sp=[];for(let i=0;i<500;i++){const a=Math.random()*Math.PI*2,e=0.25+Math.random()*1.2,r=380;sp.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,SCZ+Math.sin(a)*Math.cos(e)*r)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));STARS=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.2,sizeAttenuation:false,fog:false}));scene.add(STARS)}
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
// ===== v16 sidelines: benches, team, coaches, cameramen (instanced) =====
const SL={};{const bodyG=new THREE.CapsuleGeometry(0.33,0.84,2,6),headG=new THREE.SphereGeometry(0.29,8,6),benchG=new THREE.BoxGeometry(8,0.5,0.9),camG=new THREE.BoxGeometry(0.5,0.4,0.9),triG=new THREE.CylinderGeometry(0.05,0.05,1.5,4);
 const N=120;SL.body=new THREE.InstancedMesh(bodyG,new THREE.MeshLambertMaterial(),N);SL.head=new THREE.InstancedMesh(headG,new THREE.MeshLambertMaterial(),N);SL.bench=new THREE.InstancedMesh(benchG,new THREE.MeshLambertMaterial(),12);SL.cam=new THREE.InstancedMesh(camG,new THREE.MeshLambertMaterial({color:0x15161c}),8);SL.tri=new THREE.InstancedMesh(triG,new THREE.MeshLambertMaterial({color:0x2a2c34}),8);
 [SL.body,SL.head,SL.bench,SL.cam,SL.tri].forEach(m=>scene.add(m));SL.ppl=[];
 const sx=FW/2+5.5;let nb=0,np=0,nc=0;const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),S1=new THREE.Vector3(1,1,1);
 for(const side of[-1,1]){for(let k=0;k<5;k++){M.compose(V.set(side*(sx+3.2),0.25,Z(34+k*8)),Q.identity(),S1);SL.bench.setMatrixAt(nb,M);SL.bench.setColorAt(nb++,col.set(0x8a8f9a))}
  for(let k=0;k<44;k++){const y=32+Math.random()*36,x=side*(sx+(k<14?3.2:rnd(0,2.4))),sit=k<14;SL.ppl.push({x,y,side,sit,coach:k>=40,ph:Math.random()*6})}
  for(let k=0;k<3;k++){const y=k===0?20:k===1?50:80,x=side*(sx-1.2);SL.ppl.push({x,y,side,cam:true,ph:0});M.compose(V.set(x,1.65,Z(y)),Q.setFromAxisAngle(new THREE.Vector3(0,1,0),side>0?Math.PI/2:-Math.PI/2),S1);SL.cam.setMatrixAt(nc,M);M.compose(V.set(x,0.75,Z(y)),Q.identity(),S1);SL.tri.setMatrixAt(nc++,M)}}
 SL.bench.count=nb;SL.cam.count=nc;SL.tri.count=nc;SL.np=SL.ppl.length}

function paintSideline(){SL.ppl.forEach((p,i)=>{const t=p.side>0?home():away();SL.body.setColorAt(i,col.set(p.cam?'#2a2c34':p.coach?'#20232c':t.c1));SL.head.setColorAt(i,col.set(p.cam||p.coach?'#c8a27a':t.h))});SL.body.instanceColor.needsUpdate=true;SL.head.instanceColor.needsUpdate=true}paintSideline();
{const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),S1=new THREE.Vector3(1,1,1);SL.update=(tt,cheer)=>{SL.ppl.forEach((p,i)=>{const h=p.sit?0.55:0.75,bob=(p.sit?0:Math.max(0,Math.sin(tt*(4+cheer*6)+p.ph))*(0.05+cheer*0.45));const sc=p.sit?0.7:1;
 M.compose(V.set(p.x,h*sc+bob,Z(p.y)),Q.identity(),S1.set(1,sc,1));SL.body.setMatrixAt(i,M);M.compose(V.set(p.x,h*sc*2+0.28+bob,Z(p.y)),Q.identity(),S1.set(1,1,1));SL.head.setMatrixAt(i,M)});SL.body.count=SL.np;SL.head.count=SL.np;SL.body.instanceMatrix.needsUpdate=true;SL.head.instanceMatrix.needsUpdate=true}}
// ===== fireworks (single Points draw call) =====
const FWN=900;const fwPos=new Float32Array(FWN*3),fwCol=new Float32Array(FWN*3),fwV=new Float32Array(FWN*3),fwL=new Float32Array(FWN);
const fwG=new THREE.BufferGeometry();fwG.setAttribute('position',new THREE.BufferAttribute(fwPos,3));fwG.setAttribute('color',new THREE.BufferAttribute(fwCol,3));
const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');const gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})();
const fwPts=new THREE.Points(fwG,new THREE.PointsMaterial({size:1.1,map:dotTex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));fwPts.frustumCulled=false;scene.add(fwPts);let fwNext=0,fwQueue=[];
function fwBurst(x,y,z,c){const C=new THREE.Color(c);for(let k=0;k<110;k++){const i=fwNext;fwNext=(fwNext+1)%FWN;const a=Math.random()*Math.PI*2,e=Math.acos(2*Math.random()-1),s=rnd(9,15);fwPos.set([x,y,z],i*3);fwV.set([Math.sin(e)*Math.cos(a)*s,Math.cos(e)*s,Math.sin(e)*Math.sin(a)*s],i*3);fwL[i]=rnd(1.2,1.9);const cc=Math.random()<.2?new THREE.Color(0xffffff):C;fwCol.set([cc.r,cc.g,cc.b],i*3)}}
window.__fireworks=()=>{const t=home();const cs=[t.c1,t.c2,'#ffd23f',t.c1];for(let k=0;k<7;k++)fwQueue.push({at:performance.now()+k*260,x:rnd(-30,30),y:rnd(38,58),z:Z(rnd(95,125)),c:cs[k%cs.length]})};
function fwStep(dt){const n=performance.now();fwQueue=fwQueue.filter(q=>{if(q.at<=n){fwBurst(q.x,q.y,q.z,q.c);return false}return true});let any=false;
 for(let i=0;i<FWN;i++){if(fwL[i]<=0){fwPos[i*3+1]=-999;continue}any=true;fwL[i]-=dt;fwV[i*3+1]-=9.8*dt*0.5;const d=Math.pow(0.985,dt*60);fwV[i*3]*=d;fwV[i*3+1]*=d;fwV[i*3+2]*=d;fwPos[i*3]+=fwV[i*3]*dt;fwPos[i*3+1]+=fwV[i*3+1]*dt;fwPos[i*3+2]+=fwV[i*3+2]*dt;const f=Math.min(1,fwL[i]/0.6);fwCol[i*3]*=0.995+0.005*f;}
 fwG.attributes.position.needsUpdate=true;fwG.attributes.color.needsUpdate=true;fwPts.visible=any}
// ===== lens flare ghosts on the light banks =====
// ===== soft player shadows =====
const softTex=(()=>{const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=(x+.5-8)/8,dy=(y+.5-8)/5.2,r=dx*dx+dy*dy;if(r<1){const a=r<0.45?0.5:((x+y)%2?0.32:0.12);g.fillStyle='rgba(8,14,10,'+a+')';g.fillRect(x,y,1,1)}}const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t})();
// players: pixel-art billboards (instanced, nearest filtering)
const N=14,S=window.SPR;
const shadow=new THREE.InstancedMesh(new THREE.PlaneGeometry(1.7,1.7),new THREE.MeshBasicMaterial({map:softTex,transparent:true,opacity:.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),N*2);scene.add(shadow);
const ring=new THREE.Mesh(new THREE.RingGeometry(1.4,1.85,24),new THREE.MeshBasicMaterial({color:0x8a5cff,transparent:true,opacity:.85}));ring.rotation.x=-Math.PI/2;ring.position.y=.04;scene.add(ring);const sh=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.32:.75,a=i/10*Math.PI*2-Math.PI/2;i?sh.lineTo(Math.cos(a)*r,Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,Math.sin(a)*r)}const star=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0xffd23f,side:THREE.DoubleSide}));star.rotation.x=-Math.PI/2;star.position.y=.05;scene.add(star);
const ball=new THREE.Mesh(new THREE.SphereGeometry(.28,10,6),lam(0x9a5424));ball.scale.set(1.8,1.8,2.8);scene.add(ball);{const ol=new THREE.Mesh(new THREE.SphereGeometry(.28,10,6),new THREE.MeshBasicMaterial({color:0x140a04,side:THREE.BackSide}));ol.scale.setScalar(1.28);ball.add(ol);const ln=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.6,0.05),new THREE.MeshBasicMaterial({color:0xffffff}));ln.position.set(0,0,0.26);ball.add(ln)}
const VB={spk:1.4,x:0.93,top:0.68,bot:0.92,cap:4,capKo:4.5};let SPK=1;window.VB=VB;const _cv=new THREE.Vector3();
function inView(x,y){for(const h of[0.05,2.9]){_cv.set(Xw(x),h,Z(y)).project(cam);if(_cv.z>=1||Math.abs(_cv.x)>VB.x||_cv.y>VB.top||_cv.y<-VB.bot)return false}return true}
function clampView(){cam.updateMatrixWorld();const lx=clook.x+HX,ly=-clook.z;for(const q of G.players){if(inView(q.x,q.y))continue;let lo=0,hi=1;for(let i=0;i<14;i++){const m=(lo+hi)/2;if(inView(lx+(q.x-lx)*m,ly+(q.y-ly)*m))lo=m;else hi=m}const nx=lx+(q.x-lx)*lo,ny=ly+(q.y-ly)*lo;const dx=nx-q.x,dy=ny-q.y,l=Math.hypot(dx,dy)||1;const vn=(q.vx*dx+q.vy*dy)/l;if(vn<0){q.vx-=vn*dx/l;q.vy-=vn*dy/l}q.x=nx;q.y=ny;q._clamped=(q._clamped||0)+1}}
window.__inView=inView;
const camR=new THREE.Vector3(),v3b=new THREE.Vector3(),v3c=new THREE.Vector3();const ballSh=new THREE.Mesh(new THREE.CircleGeometry(.5,14),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.45,depthWrite:false}));ballSh.rotation.x=-Math.PI/2;ballSh.renderOrder=2;scene.add(ballSh);
{const pg=new THREE.BoxGeometry(.55,1.05,.55),og=new THREE.BoxGeometry(.7,1.2,.7),py=new THREE.InstancedMesh(pg,new THREE.MeshBasicMaterial({color:0xff5a1a}),8),po=new THREE.InstancedMesh(og,new THREE.MeshBasicMaterial({color:0x2a0c06,side:THREE.BackSide}),8);let i=0;const M=new THREE.Matrix4();for(const y of[-10,0,100,110])for(const x of[0,FW]){M.makeTranslation(Xw(x)+(x?0.3:-0.3),.53,Z(y));py.setMatrixAt(i,M);po.setMatrixAt(i++,M)}scene.add(po);scene.add(py)}
const tgtMk=new THREE.Mesh(new THREE.RingGeometry(.6,.85,16),new THREE.MeshBasicMaterial({color:0xffe23f}));tgtMk.rotation.x=-Math.PI/2;tgtMk.position.y=.05;scene.add(tgtMk);
const bgeo=new THREE.PlaneGeometry(1,1);bgeo.translate(0,.5,0);
const CU=1/S.POSES,CV=1/(10*S.DIRS);
function mkTeamMesh(){const tex=new THREE.CanvasTexture(document.createElement('canvas'));
 const mat=new THREE.MeshBasicMaterial({map:tex,alphaTest:.5,side:THREE.DoubleSide});
 mat.onBeforeCompile=sh=>{sh.vertexShader='attribute vec2 uvOff;\n'+sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vMapUv = vMapUv*vec2('+CU.toFixed(8)+','+CV.toFixed(8)+') + uvOff;')};
 const m=new THREE.InstancedMesh(bgeo,mat,N);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);const uo=new THREE.InstancedBufferAttribute(new Float32Array(N*2),2);uo.setUsage(THREE.DynamicDrawUsage);m.geometry=bgeo.clone();m.geometry.setAttribute('uvOff',uo);m.frustumCulled=false;scene.add(m);return{m,mat,uo}}
const TM=[mkTeamMesh(),mkTeamMesh()];
const ngeo=new THREE.PlaneGeometry(1,1);
function mkNumMesh(){const mat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(document.createElement('canvas')),alphaTest:.15,depthTest:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 mat.onBeforeCompile=sh=>{sh.vertexShader='attribute vec2 uvOff;\n'+sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vMapUv = vMapUv*vec2(0.1,0.1) + uvOff;')};
 const g=ngeo.clone();const uo=new THREE.InstancedBufferAttribute(new Float32Array(N*2),2);uo.setUsage(THREE.DynamicDrawUsage);g.setAttribute('uvOff',uo);const m=new THREE.InstancedMesh(g,mat,N);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;scene.add(m);return{m,mat,uo}}
const NM=[mkNumMesh(),mkNumMesh()];NM.forEach(n=>n.m.renderOrder=3);const camUp=new THREE.Vector3(),camBk=new THREE.Vector3();window.__atlases=[];
let atlasKey='';function ensureAtlas(){const k=G.home+'-'+G.away;if(k===atlasKey)return;atlasKey=k;[home(),away()].forEach((t,i)=>{const c=S.buildAtlas(t);window.__atlases[i]=c;const tx=new THREE.CanvasTexture(c);tx.magFilter=THREE.NearestFilter;tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;tx.colorSpace=THREE.SRGBColorSpace;TM[i].mat.map=tx;TM[i].mat.needsUpdate=true;const nc=S.buildNumbers(t);const nt=new THREE.CanvasTexture(nc);nt.magFilter=nt.minFilter=THREE.NearestFilter;nt.generateMipmaps=false;nt.colorSpace=THREE.SRGBColorSpace;NM[i].mat.map=nt;NM[i].mat.needsUpdate=true})}
const pm=new THREE.Matrix4(),v3=new THREE.Vector3(),sc=new THREE.Vector3();
// ===== v17 animation state machine: pose + roll + squash + lift, eased per player =====
const N_=S.P;let animT=performance.now();const qR=new THREE.Quaternion(),qC=new THREE.Quaternion(),zAx=new THREE.Vector3(0,0,1);
const ang=(a)=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
function animOf(p,dt){p._qbUp=false;const line=p.role==='OL'||p.role==='DL';const sp=Math.hypot(p.vx,p.vy);const o={pose:N_.idle0,roll:0,sy:1,lift:0,face:null};
 const sxv=()=>{const a=PROJ(p.x+p.vx*0.1+0.001,p.y+p.vy*0.1,1),b=PROJ(p.x,p.y,1);return[a[0]-b[0],a[1]-b[1]]};
 if(sp>3){const h=Math.atan2(p.vy,p.vx);if(p._hd!==undefined){const d=ang(h-p._hd);if(Math.abs(d)>0.12){p._cut=0.22;p._cutd=Math.sign(d)}}p._hd=h}else p._hd=undefined;if(p._cut>0)p._cut-=dt;
 if(p.dive>0){p._dm=Math.max(p._dm||0,p.dive);const k=1-p.dive/p._dm;
  if(k<0.18){o.pose=N_.dive0;return o}
  const v=sxv(),horiz=Math.abs(v[0])>Math.abs(v[1])*0.8;o.pose=(p===G.carrier&&G.dcatch)||(G.ball&&!G.ball.caught&&G.ball.tgt===p)?N_.dcatch:N_.dive1;
  const kk=Math.min(1,(k-0.18)/0.82);o.lift=Math.sin(kk*Math.PI)*1.15;if(horiz){o.roll=-(v[0]>0?1:-1)*Math.PI/2*Math.min(1,kk*3)}else{o.sy=1-0.4*Math.min(1,kk*3)}return o}
 p._dm=0;
 if(p.fallen>0){if(!(p._fm>0)||p.fallen>p._fm+0.01){p._fm=p.fallen;const v=sxv();p._rd=(v[0]>=0?1:-1)}const e=p._fm-p.fallen,rd=p._rd||1;
  if(p.tackler&&e<0.2){o.pose=N_.wrap;o.roll=-rd*0.5*(e/0.2);return o}
  if(p.fallen<0.42&&p._fm>0.6){o.pose=p.fallen>0.2?N_.getup0:N_.getup1;o.roll=-rd*Math.PI/2*Math.max(0,(p.fallen-0.25)/0.17);return o}
  if(e<0.2){o.pose=N_.fall0;const k=e/0.2;o.roll=-rd*Math.PI/2*k*k;return o}
  o.pose=N_.down;o.roll=-rd*Math.PI/2;if(e<0.45)o.lift=Math.max(0,Math.sin((e-0.2)/0.25*Math.PI))*0.25;return o}
 p._fm=0;if(!(p.fallen>0))p.tackler=false;
 const ph=(p.num||0)*0.37;
 if(G.st==='presnap'||(G.st==='fg'&&!(p.throwT>0)&&p.role!=='K')){if(line)o.pose=N_.stance;else if(p.role==='QB')o.pose=G.st==='fg'?N_.getup0:N_.hold;else if(p.role==='WR'||p.role==='CB'||p.role==='LB'||p.role==='S')o.pose=N_.ready;else o.pose=(Math.floor(G.t*1.3+ph)%2)?N_.idle1:N_.idle0;return o}
 if(G.celeb&&p.team===0&&G.st==='result'){const t=((G.t*4+ph)%4)|0;if(p===G.carrier){const e=1.15-(G.resT||0);o.pose=e<0.2?N_.cel0:e<0.55?N_.cel3:[N_.cel1,N_.cel2][(G.t*3|0)%2]}else o.pose=[N_.cel0,N_.cel1,N_.cel1,N_.cel0][t];if(o.pose===N_.cel1)o.lift=0.3;return o}
 if(p.react>0){p.react-=dt;o.pose=p.react>0.35?N_.react0:N_.react1;return o}
 if(p.reach>0&&!(p.fallen>0)&&!(p===G.carrier&&p.catchT>0)){const b=G.ball;if(b&&!b.caught&&b.T){const k=b.t/b.T;const bx=b.tx-b.x0,by=b.ty-b.y0;const away=(p.vx*bx+p.vy*by)>0.6*Math.hypot(bx,by)*Math.max(sp,0.01)&&sp>4;o.pose=away&&k>0.82?N_.oshld:k>0.9?N_.reach1:N_.reach0;if(!away)o.face=[b.x-p.x,b.y-p.y];o.lift=k>0.9?0.25:0;return o}o.pose=p.reach>0.15?N_.reach1:N_.react1;o.lift=Math.sin(Math.min(1,(0.45-p.reach)/0.45)*Math.PI)*0.5;return o}
 if(G.hoT!==undefined&&G.hoT<0.24&&G.st==='live'){if(p===G.qb&&G.hoT<0.1){o.pose=N_.hold;return o}if(p===G.rb&&G.hoT<0.24){o.pose=sp>0.35?N_.run0+Math.floor(p.anim/0.42)%6:N_.ready;return o}}
 if(p.throwT>0){const k=1-p.throwT/(p.throwDur||0.5);if(p.role==='K'){o.pose=N_.kick0+Math.min(2,Math.floor(k*3));return o}o.pose=N_.thr0+Math.max(p===G.qb&&G.ball&&!G.ball.caught?3:0,Math.min(5,Math.floor(k*6)));return o}
 if(p.catchT>0){o.pose=p.catchT>0.4?N_.catchUp:p.catchT>0.24?N_.secure:N_.catchTuck;return o}
 if(p.eng){o.pose=N_.blk0+(sp>1.2?Math.floor(p.anim/0.5)%3:(Math.floor(G.t*3+ph)%2)+1);return o}
 const car=p===G.carrier&&(!G.ball||G.ball.caught)&&!G.pend;
 if(car&&G.juke>0){const e=0.28-G.juke;o.pose=e<0.07?N_.jplant:e<0.16?N_.jfake:N_.jcut;o.roll=(G.jukeS||1)*(e<0.07?0:e<0.16?0.16:-0.22);o.lift=e<0.16?0.15:0;return o}
 if(car&&p===G.qb&&passerPhase()&&!G.tuck){p._qbUp=false;
  if(G.aim){o.pose=N_.thr1;if(G.aim.tx!==undefined)o.face=[G.aim.tx-p.x,G.aim.ty-p.y];return o}if(sp<0.35){o.pose=N_.hold;return o}const fw=p.team===0?1:-1;if(p.vy*fw<-0.5*sp){o.face=[0,fw];o.pose=N_.drop0+Math.floor(p.anim/0.38)%4;return o}{const n=Math.hypot(p.vx*0.35,fw);o.face=[p.vx*0.35/n,fw/n]}o.pose=N_.qrun0+Math.floor(p.anim/0.3)%6;return o}
 if(sp<0.35){o.pose=car?N_.catchTuck:(Math.floor(G.t*1.3+ph)%2?N_.idle1:N_.idle0);return o}
 const fwd=p.team===0?1:-1;const back=(p.vy*fwd<-0.6*sp&&sp>0.8&&!car)||(p.role==='QB'&&car&&!G.tuck&&p.vy*fwd<-0.5*sp);
 if(back){o.face=[0,fwd];const f=Math.floor(p.anim/0.38)%4;o.pose=(p.role==='QB'&&car?N_.drop0:N_.bp0)+f;return o}
 if(car&&sp>3){let d=99;for(const q of G.players)if(q.team!==p.team&&!(q.fallen>0)){const dd=Math.hypot(q.x-p.x,q.y-p.y);if(dd<d)d=dd}if(d<1.9){o.pose=Math.floor(p.anim/0.5)%2?N_.stiff1:N_.stiff0;return o}}
 if(p._cut>0&&sp>3){o.pose=N_.cut;o.roll=(p._cutd||1)*0.14;return o}
 if(sp>7.4){o.pose=(car?N_.scarry0:N_.sprint0)+Math.floor(p.anim/0.55)%4;return o}
 o.pose=(car?N_.carry0:N_.run0)+Math.floor(p.anim/0.33)%6;return o}
function updatePlayers(){SPK+=(SPKT-SPK)*0.25;window.__SPK=SPK;{const bs=Math.max(0.8,Math.min(SPK,1.6));ball.scale.set(1.25*bs,1.25*bs,1.95*bs)};ensureAtlas();const now=performance.now();const dt=window.__hold?1/30:Math.min(0.05,(now-animT)/1000);animT=now;const cnt=[0,0],nc=[0,0];camUp.set(0,1,0).applyQuaternion(cam.quaternion);camBk.set(0,0,1).applyQuaternion(cam.quaternion);
 G.players.forEach((p,si)=>{const sp=Math.hypot(p.vx,p.vy);let fx=p.vx,fy=p.vy;
  if(p.throwT>0&&p.throwDir){fx=p.throwDir.x;fy=p.throwDir.y}else if(p.eng&&p.blk){fx=p.blk.x-p.x;fy=p.blk.y-p.y}
  else if(sp<0.4||G.st==='presnap'){fx=0;fy=p.team===0?1:-1}
  const A=animOf(p,dt);if(A.face){fx=A.face[0];fy=A.face[1]}
  if(p.fa===undefined)p.fa=Math.atan2(0,p.team?-1:1);if(Math.hypot(fx,fy)>0.05&&(sp>0.7||G.st==='presnap'||p.throwT>0||p.eng||A.face)){const ta=Math.atan2(fx,fy);const da=ang(ta-p.fa);const mt=(p.throwT>0?22:p.dive>0?16:7)*dt;p.fa=ang(p.fa+Math.max(-mt,Math.min(mt,da)))}
  const a=p.fa,aa=Math.abs(a)*180/Math.PI;const cand=aa<22.5?4:aa<67.5?3:aa<112.5?2:aa<157.5?1:0;const mirC=a<0?-1:1;
  {let d0=p._dir;if(d0===undefined||Math.abs(aa-[180,135,90,45,0][d0])>29.5)d0=cand;p._dir=d0;if(p._mir===undefined||d0===0||d0===4)p._mir=mirC;else if(mirC!==p._mir&&aa>12&&aa<168)p._mir=mirC}
  const dir=p._dir,mir=p._mir;
  const rk=Math.min(1,dt*18);p._r=(p._r||0)+(A.roll-(p._r||0))*rk;p._sy=(p._sy??1)+(A.sy-(p._sy??1))*rk;p._lf=(p._lf||0)+(A.lift-(p._lf||0))*Math.min(1,dt*22);
  let sq=0;if(p===G.carrier&&G.juke>0)sq=G.jukeCut?0.06:0.1;const line=(p.role==='OL'||p.role==='DL')?1:0;const T=TM[p.team],i=cnt[p.team]++;const pose=A.pose;
  const s=2.8*SPK*(line?1.18:1);sc.set(s*mir*(1+sq),s*(1-sq)*p._sy,1);qR.setFromAxisAngle(zAx,p._r);qC.copy(cam.quaternion).multiply(qR);pm.compose(v3.set(Xw(p.x),0.02+p._lf,Z(p.y)),qC,sc);T.m.setMatrixAt(i,pm);
  T.uo.setXY(i,pose*CU,1-((dir*10+p.skin*2+line)+1)*CV);
  const M=S.META[dir*S.POSES+pose]||S.META[dir*S.POSES+N_.idle0]||{ty:9};p._ny=p._ny===undefined?M.ty:p._ny+(M.ty-p._ny)*Math.min(1,dt*14);
  // Numbers: same qC as body (tracks roll/anim) + camUp mid-upper (v30 proven, no turf float)
  const noNum=p.fallen>0.3||p.dive>0.2||Math.abs(p._r)>1.35||p._sy<0.4;
  if(!noNum){const Nm=NM[p.team],j=nc[p.team]++;
   const ly=0.23*s*(p._sy||1);
   v3.set(Xw(p.x),0.02+p._lf,Z(p.y));
   v3.addScaledVector(camUp,ly);
   v3.addScaledVector(camBk,0.08);
   const nw=0.42*s*(line?1.15:1),nh=0.32*s;
   pm.compose(v3,qC,sc.set(nw*Math.sign(mir||1),nh,1));Nm.m.setMatrixAt(j,pm);
   const n=Math.max(0,Math.min(99,p.num|0));Nm.uo.setXY(j,(n%10)*0.1,1-(Math.floor(n/10)+1)*0.1)}
  m4.makeRotationX(-Math.PI/2);m4.setPosition(Xw(p.x),.02,Z(p.y));shadow.setMatrixAt(si,m4)});
 TM.forEach((T,k)=>{T.m.count=cnt[k];T.m.instanceMatrix.needsUpdate=true;T.uo.needsUpdate=true});NM.forEach((T,k)=>{T.m.count=nc[k];T.m.instanceMatrix.needsUpdate=true;T.uo.needsUpdate=true});shadow.count=G.players.length;shadow.instanceMatrix.needsUpdate=true}
// route ribbons
const RCOL=[0xff2a2a,0xff8a1f,0xffd400,0x9a3cff];let routeGrp=new THREE.Group();scene.add(routeGrp);let routeVer=-1;
function buildRoutes(){routeGrp.clear();(G.routes||[]).forEach((r,ri)=>{const pts=r.pts;const pos=[];const w=.1;
 for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;const nx=-dy/l*w,ny=dx/l*w;
  pos.push(Xw(pts[i][0]+nx),.06,Z(pts[i][1]+ny),Xw(pts[i][0]-nx),.06,Z(pts[i][1]-ny))}
 const idx=[];for(let i=0;i<pts.length-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(RCOL[(r.i??ri)%4]).lerp(new THREE.Color(0xffffff),.6),side:THREE.DoubleSide,transparent:true,opacity:.95,depthWrite:false});
 const ul=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x08102a,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}));ul.scale.set(1,1,1);ul.position.set(.12,-.01,.12);routeGrp.add(ul);routeGrp.add(new THREE.Mesh(g,mat));
 {const dot=new THREE.Mesh(new THREE.CircleGeometry(.45,14),mat);dot.rotation.x=-Math.PI/2;dot.position.set(Xw(pts[0][0]),.07,Z(pts[0][1]));routeGrp.add(dot)}
 const e2=pts[pts.length-1],e1=pts[pts.length-2];const ah=new THREE.Mesh(new THREE.ConeGeometry(.5,1.2,3),mat);ah.position.set(Xw(e2[0]),.1,Z(e2[1]));ah.rotation.x=-Math.PI/2;ah.rotation.z=-Math.atan2(e2[0]-e1[0],e2[1]-e1[1]);ah.scale.z=.1;routeGrp.add(ah)})}
// projection for 2D overlay
const pv=new THREE.Vector3();
window.PROJ=(x,y,h=1)=>{pv.set(Xw(x),h,Z(y)).project(cam);return[(pv.x+1)/2*W,(1-pv.y)/2*H]};
const cpos=new THREE.Vector3(0,17,0),clook=new THREE.Vector3();let camX=0,camZ=1,camFy,camAdj=0,SPKT=0.75,fitK=1,fgC=null;const _fv=new THREE.Vector3();window.__cam=()=>cam;const cl3=(v,a,b)=>Math.max(a,Math.min(b,v));

// ---- v23b camera helpers (no per-frame allocation) ----
const RQ=new Float64Array(4096);let RQn=0,RR=1;const _cl=(v,a,b)=>v<a?a:v>b?b:v;
function rq(x,y,h){if(RQn<4093){RQ[RQn++]=x;RQ[RQn++]=y;RQ[RQn++]=h}}
function rqP(q,la){const hh=2.9*SPKT;rq(q.x,q.y,0.05);rq(q.x,q.y,hh);if(la>0){const px=q.x+_cl(q.vx||0,-9,9)*la,py=q.y+_cl(q.vy||0,-9,9)*la;rq(px,py,0.05);rq(px,py,hh)}}
function sdamp(c,t,o,k,ST,dt){const w=2/ST,x=w*dt,e=1/(1+x+0.48*x*x+0.235*x*x*x);const ch=c-t,tmp=(o[k]+w*ch)*dt;o[k]=(o[k]-w*tmp)*e;return t+(ch+tmp)*e}
function camFits(){for(let i=0;i<RQn;i+=3){_fv.set(Xw(RQ[i]),RQ[i+2],Z(RQ[i+1])).project(cam);if(_fv.z>=1||Math.abs(_fv.x)>0.94||_fv.y>0.66||_fv.y<-0.87)return false}return true}
function camPose(CA,bb,want,zf){zf=zf||1;const w=CA.w,asp=W/H;const Tp=CA.t.p+(CA.r.p-CA.t.p)*RR,Tf=CA.t.f+(CA.r.f-CA.t.f)*RR;const p=(w.p+(Tp-w.p)*bb)*Math.PI/180,f=w.f+(Tf-w.f)*bb,fr=f*Math.PI/360,t=Math.tan(fr),yn=cam._yW+(cam._yN-cam._yW)*bb;
  if(Math.abs(cam.fov-f)>1e-6){cam.fov=f;cam.updateProjectionMatrix()}
  let yl=1e9;for(let i=0;i<RQn;i+=3)if(RQ[i+1]<yl)yl=RQ[i+1];if(yl>1e8)yl=camFy;yl-=0.5;
  const m=w.m+(CA.t.m-w.m)*bb;let h=60,cx=0;const af=p-Math.atan(yn*t);
  for(let it=0;it<4;it++){const yc=camFy-h/Math.tan(af);const dz=yl-yc;const al=Math.atan2(h,Math.max(0.5,dz));const yr=Math.tan(p-al)/t;const ang=Math.atan(yr*t);
    const hs=(HX+0.4)/m,h0w=CA.ref?CA.w.wv/2:(HX+0.4)/w.m,hr=h0w+(CA.r.wv/2-h0w)*bb;const hw=hs+(hr-hs)*RR;h=hw*Math.sin(al)/(Math.cos(ang)*t*asp)}
  if(bb>0&&RR>0)cx=_cl(Xw(camX),-HX+8,HX-8)*bb*RR;
  h*=zf;const yc=camFy-h/Math.tan(af);cam.position.set(cx,h,Z(yc));cam.lookAt(cx,0,Z(yc+h/Math.tan(p)));cam.updateMatrixWorld();cam._h=h}
let _pixDone=false;function pixelize(){_pixDone=true;scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms){const mp=m.map;if(mp&&mp.isCanvasTexture&&mp!==ftex&&mp.image&&mp.image.width>4){mp.magFilter=THREE.NearestFilter;mp.needsUpdate=true}}})}
window.R3D=()=>{if(!_pixDone)pixelize();const st=G.st;if(window.MENU_ST?window.MENU_ST(st)||st==='vs':(st==='title'||st==='team')){ren.domElement.style.visibility='hidden';return}ren.domElement.style.visibility='visible';
 paintSB();const fk=G.home+'-'+G.away;if(fk!==fieldKey){fieldKey=fk;paintField();ftex.needsUpdate=true;restyleStadium();paintSideline();setDay(window.__forceDay!==undefined?window.__forceDay:Math.random()<0.35)}
 {const now=performance.now(),dt=Math.min(0.05,(now-(window.__lt||now))/1000);window.__lt=now;const big=G.celeb||(G.banner&&G.banner.a<2&&/TOUCHDOWN|FIRST DOWN|GOOD!|INTERCEPT/.test(G.banner.t+' '+G.banner.sub));const tc=big?1:0;cCheer.value+=(tc-cCheer.value)*0.06;if(G.celeb&&!window.__fwDone){window.__fwDone=true;window.__fireworks()}if(!G.celeb)window.__fwDone=false;fwStep(window.__hold?1/30:dt);SL.update(now/1000,cCheer.value)}if(ledMat.map)ledMat.map.offset.x=(performance.now()/1000*0.02)%1;
 const on=st==='live'||st==='result'||st==='presnap'||st==='fg'||st==='patpick';const fgB=(st==='fg'||st==='result'&&G.fgDone)&&G.fgBall;
 cam.updateMatrixWorld();if(on)updatePlayers();TM.forEach(T=>T.m.visible=on);NM.forEach(T=>T.m.visible=on);cU.value=performance.now()/1000;shadow.visible=on;
 if(G.routeVer!==routeVer){routeVer=G.routeVer;buildRoutes()}
 routeGrp.visible=st==='presnap'||(st==='live'&&!G.thrown&&G.carrier&&G.carrier.role==='QB'&&G.play.t==='pass');
 los.position.z=Z(G.los);fd.position.z=Z(Math.min(G.los+G.togo,100));fd.visible=G.los+G.togo<100;
 const c=G.carrier;ring.visible=on&&!!c;star.visible=ring.visible;if(c){ring.position.set(Xw(c.x),.04,Z(c.y));star.position.set(Xw(c.x),.05,Z(c.y));star.rotation.z=G.t*2}
 const b=G.ball;ball.visible=on&&!!b&&!b.caught;tgtMk.visible=false;if(fgB){ball.visible=true;ball.position.set(Xw(fgB.x),fgB.z+0.3,Z(fgB.y));ball.rotation.x=-(G.t*14)}
 ballSh.visible=false;if(fgB){ballSh.visible=true;ballSh.position.set(Xw(fgB.x),.07,Z(fgB.y));const s=Math.max(.6,1.5-fgB.z*0.05);ballSh.scale.set(s,s*.8,1);ballSh.material.opacity=.4}if(b&&!b.caught){{const kk=Math.min(1,b.t/b.T);ball.position.set(Xw(b.x),(b.h0||1.6)*(1-kk)+1.6*kk+b.z*0.9,Z(b.y))}ball.rotation.y=Math.atan2(-(b.tx-b.x0),(b.ty-b.y0));ball.rotation.x=-.5;ball.rotation.z=(b.t||0)*28;if(b.spin){ball.rotation.x=b.t*b.spin;ball.rotation.y=b.t*b.spin*0.6}tgtMk.visible=true;tgtMk.position.set(Xw(b.tx),.05,Z(b.ty));{const hz=ball.position.y;ballSh.visible=true;ballSh.position.set(Xw(b.x),.07,Z(b.y));const s=Math.max(.35,1.1-hz*0.06);ballSh.scale.set(s,s*0.8,1);ballSh.material.opacity=Math.max(.12,.55-hz*0.035)}}
 if(G.loose&&on){const L=G.loose;ball.visible=true;ball.position.set(Xw(L.x),L.z,Z(L.y));ball.rotation.set(L.rx,L.ry,L.rx*0.35);tgtMk.visible=false;ballSh.visible=true;ballSh.position.set(Xw(L.x),.07,Z(L.y));const s=Math.max(.35,1.0-L.z*0.07);ballSh.scale.set(s,s*0.8,1);ballSh.material.opacity=Math.max(.12,.5-L.z*0.04)}
 else if(c&&on&&!fgB&&!(b&&!b.caught)){ball.visible=true;const hand=v=>{camR.set(1,0,0).applyQuaternion(cam.quaternion);v.set(Xw(c.x),0.02+(c._lf||0),Z(c.y)).addScaledVector(camUp,c.role==='OL'||c.role==='DL'?1.35:1.18).addScaledVector(camBk,0.6).addScaledVector(camR,(c._mir||1)*([0,0.15,0.32,0.18,0][c._dir??0]));return v};
   if(st==='presnap'||(st==='live'&&c===G.qb&&G.snapT<0.24&&G.play.t!=='ko')){const sp=v3b.set(Xw(G.qb.x),0.32,Z(G.los+0.2));if(st==='presnap'){ball.position.copy(sp);ball.rotation.set(0,0,Math.PI/2)}else{const k=Math.min(1,G.snapT/0.24),h=hand(v3c);ball.position.lerpVectors(sp,h,k);ball.position.y+=Math.sin(k*Math.PI)*0.5;ball.rotation.set(G.snapT*30,0,Math.PI/2)}}
   else if(G.hoT!==undefined&&G.hoT>=0.1&&G.hoT<0.24&&G.st==='live'){const k=(G.hoT-0.1)/0.14,H=2.9*SPK,q=G.qb,r=G.rb;ball.position.set(Xw(q.x+(r.x-q.x)*k),H*0.45,Z(q.y+(r.y-q.y)*k));ball.rotation.set(0,0,Math.PI/2)}else ball.visible=false}
 let ov=0;ov=ov*ov*(3-2*ov);
 {const CA=window.CAM23||(window.CAM23={ref:!/[?&]cam=fit/.test(location.search),w:{p:40,f:70,m:0.9,yN:-0.45,s:0.75,wv:36},t:{p:56,f:62,m:0.96,yN:-0.15,s:0.75},r:{p:52,f:62,wv:22,yN:-0.15,s:0.75},look:0.3});
  const now=performance.now();let dt=window.__fdt!==undefined?window.__fdt:window.__hold?1/60:(now-(cam._lt||now))/1000;cam._lt=now;dt=Math.max(1/240,Math.min(0.05,dt));
  const c3=G.carrier,b3=G.ball,P=G.players||[],live=st==='live',ko=G.play&&G.play.t==='ko',pass=G.play&&G.play.t==='pass';
  const inAir=live&&b3&&!b3.caught;const drop=live&&pass&&!G.thrown&&!G.pend&&c3===G.qb&&!G.qbRun;const LA=CA.look;
  let fy=G.los,fx=HX,yN=CA.w.yN,want=0,stF=0.3;RQn=0;
  if(!on||fgB||st==='fg'||st==='patpick'||st==='presnap'||!c3||!live&&st!=='result'){fy=G.los;want=0;for(const q of P)rqP(q,0);if(fgB||st==='fg'||st==='patpick')yN=0.02}
  else if(st==='result'){const fo=G.loose?G.loose:b3&&!b3.caught&&G.play.t!=='ko'?b3:c3;fy=fo.y;fx=fo.x;yN=CA.t.yN;want=0;stF=0.45;if(fo===c3)rqP(c3,0);else rq(fo.x,fo.y,0.3)}
  else{const after=ko||(G.thrown&&!G.pend&&b3);
   // Deep-route helpers: track deepest offensive route runner + aim lock
   const deepW=()=>{let best=null,by=-1e9;for(const w of P)if(w.team===0&&(w.role==='WR'||w.role==='TE')&&!(w.fallen>0)){const ey=(w.wp&&w.wp.length)?w.wp[w.wp.length-1].y:w.y;const dy=Math.max(w.y,ey);if(dy>by){by=dy;best=w}}return best};
   const aimT=(G.aim&&G.aim.lock)||(G.lastAim&&G.lastAim.lock)||(G.pend&&G.pend.w)||null;
   if(!after){fy=drop?G.qb.y:c3.y;fx=drop?G.qb.x:c3.x;yN=drop?-0.5:-0.12;want=1;stF=drop?0.38:0.34;
    // Pre-throw: keep EVERYONE on screen (no off-screen runners)
    for(const q of P)rqP(q,LA*1.15);
    if(pass&&c3===G.qb){const dw=aimT||deepW();
     if(dw){rqP(dw,0.55);const ey=(dw.wp&&dw.wp.length)?dw.wp[dw.wp.length-1].y:dw.y;
      // Bias focus toward mid of QB↔deep threat so deep routes stay framed without pops
      const midY=(c3.y+Math.max(dw.y,Math.min(ey,G.los+28)))*0.5;fy=fy*0.55+midY*0.45;fx=fx*0.7+dw.x*0.3;
      rq(dw.x,Math.min(Math.max(dw.y,ey),G.los+(window.RDEEP||26)),0.05)}
     for(const w of P)if(w.team===0&&w.wp&&w.wp.length&&(w.role==='WR'||w.role==='TE'||w.role==='RB')){const e=w.wp[w.wp.length-1];rq(e.x,Math.min(e.y,G.los+(window.RDEEP||26)),0.05)}}
    }
   else if(inAir){let tg=aimT;if(ko)tg=c3;else if(!tg){let bd=1e9;for(const q of P)if(q.team===0&&q!==G.qb){const d=Math.hypot(q.x-b3.tx,q.y-b3.ty);if(d<bd){bd=d;tg=q}}}
     // Follow ball along trajectory (spring-smooth, never stadium cut)
     const k=Math.min(1,b3.t/b3.T);fy=b3.y+(b3.ty-b3.y)*Math.min(1,0.15+0.75*k);fx=b3.x+(b3.tx-b3.x)*0.5;yN=-0.08;want=1;stF=0.42;
     const bz=(b3.h0||1.6)*(1-k)+1.6*k+b3.z*0.9;rq(b3.x,b3.y,0.3);rq(b3.x,b3.y,bz+0.6);
     const k2=Math.min(1,(b3.t+LA*0.9)/b3.T);rq(b3.x+(b3.tx-b3.x)*(k2-k)/Math.max(0.05,1-k),b3.y+(b3.ty-b3.y)*(k2-k)/Math.max(0.05,1-k),0.3);
     // Intended receiver stays framed but do NOT yank focus to stadium
     if(tg){rqP(tg,LA*0.85);fy=fy*0.7+tg.y*0.3;fx=fx*0.72+tg.x*0.28}if(c3&&c3!==tg)rqP(c3,0.15)}
   else{fy=c3.y;fx=c3.x;yN=-0.12;want=1;stF=0.32;rqP(c3,LA);const dw=deepW();if(pass&&dw&&dw.y>c3.y+8){rqP(dw,0.4);fy=fy*0.65+dw.y*0.35}}
   cam._Rt=after?1:0}
  if(!live&&st!=='result')cam._Rt=0;
  const V=cam._v||(cam._v={fy:0,fx:0,b:0,yN:0,R:0,sk:0,yW:0,zf:0});
  // Spring-smooth targets — avoid hard jumps except kickoff / huge state changes
  const jump=camFy===undefined||(st==='presnap'||G.st==='fg')&&Math.abs(camFy-fy)>48||ko&&live&&b3&&b3.t<0.12;
  if(cam._yW===undefined)cam._yW=CA.w.yN;if(jump&&camFy!==undefined&&!window.__hold)window.__fadeA=1;if(jump){camFy=fy;camX=fx;cam._yN=yN;cam._yW=want===0?yN:CA.w.yN;V.yW=0;V.fy=V.fx=V.yN=0;cam._R=cam._Rt||0;V.R=0;V.b=0;V.zf=0}
  else{camFy=sdamp(camFy,fy,V,'fy',stF,dt);camX=sdamp(camX,fx,V,'fx',0.42,dt);cam._yN=sdamp(cam._yN,yN,V,'yN',0.36,dt);cam._R=sdamp(cam._R,cam._Rt||0,V,'R',0.28,dt);cam._yW=sdamp(cam._yW,want===0?yN:CA.w.yN,V,'yW',0.4,dt)}
  RR=CA.ref?1:cam._R;
  // Fit zoom: NEVER pull to stadium overview mid-pass (cap zt, floor bf while live)
  let bf=want,zt=1;const zCap=(live&&(inAir||pass))?1.35:(live?1.55:3.2);
  for(let bb=want;bb>=0.35;bb-=0.04){camPose(CA,bb,want);if(camFits()){bf=bb;break}}
  if(bf<0.36){bf=live?Math.max(0.45,want*0.55):0;for(zt=1;zt<zCap;zt+=0.06){camPose(CA,bf,want,zt);if(camFits())break}}
  if(live&&inAir){bf=Math.max(bf,0.55);zt=Math.min(zt,1.28)}
  cam._zf=cam._zf||1;
  // Spring only — never hard-snap b/zf on pass (jump reserved for KO / menu)
  const passLock=live&&(inAir||(pass&&G.thrown));
  if(cam._b===undefined||(jump&&!passLock)){cam._b=bf;V.b=0}else{
    const needOut=bf>cam._b+0.02;const unfit=(!needOut&&(()=>{camPose(CA,cam._b,want,cam._zf);return !camFits()})());
    const stb=passLock?0.45:(needOut||unfit?(st==='live'?0.28:0.32):(st==='result'?0.35:0.2));
    cam._b=sdamp(cam._b,unfit&&!passLock?Math.min(1,cam._b+0.05):bf,V,'b',stb,dt)}
  if(jump&&!passLock){cam._zf=zt;V.zf=0}else{
    const needZ=zt>cam._zf+0.02;const unfitZ=(!needZ&&(()=>{camPose(CA,cam._b,want,cam._zf);return !camFits()})());
    const zst=passLock?0.5:(needZ||unfitZ?0.32:0.4);
    cam._zf=sdamp(cam._zf,unfitZ&&!passLock?Math.min(zCap,cam._zf+0.04):Math.min(zCap,zt),V,'zf',zst,dt)}
  camPose(CA,cam._b,want,cam._zf);SPKT=CA.w.s+((CA.t.s+(CA.r.s-CA.t.s)*RR)-CA.w.s)*cam._b;
  cpos.copy(cam.position);_fv.set(0,0,-1).applyQuaternion(cam.quaternion);clook.copy(cam.position).addScaledVector(_fv,10)}
 if(G.shake>0){const s=Math.min(1,G.shake*4)*G.shake;cam.position.y+=Math.sin(G.t*53)*s;cam.position.z+=Math.sin(G.t*41+1)*s}
 cam.lookAt(clook);if(false&&fgB&&G.fg){const f=G.fg;const fly=f.ph==='fly'||G.st==='result';const by=fly?Math.min(fgB.y,100):f.y0;const tgt=fly?[Xw(fgB.x)*0.6,Math.min(9,Math.max(3,fgB.z*0.5+2)),Math.min(by-16,86),Xw(fgB.x)*0.4,Math.max(4,fgB.z*0.6),110]:[Xw(f.x0)+0.5,10,f.y0-17,0,6,111];fgC=fgC&&fly?fgC.map((v,i)=>v+(tgt[i]-v)*0.12):tgt;cam.position.set(fgC[0],fgC[1],Z(fgC[2]));cam.lookAt(fgC[3],fgC[4],Z(fgC[5]))}else fgC=null;if(window.__clampOn&&on&&!ov&&!fgB&&(st==='live'||st==='result')&&G.players)clampView();if(window.__camOv){const o=window.__camOv;cam.position.set(...o.p);cam.lookAt(...o.l)}
 if(window.__fadeA>0){window.__fadeA=Math.max(0,window.__fadeA-1/60/0.38);const fe=_fadeEl||(_fadeEl=document.getElementById('fade'));if(fe){const a=window.__fadeA;fe.style.opacity=(a*a*(3-2*a)*0.9).toFixed(3)}}
 if(!window.__camOnly)ren.render(scene,cam)};let _fadeEl=null;
