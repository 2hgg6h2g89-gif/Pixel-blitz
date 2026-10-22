// Original 16-bit style football sprites, drawn pixel-by-pixel in code.
(function(){
const CELL=24,DIRS=5,POSES=10,SKIN=['#5a3a26','#8a5a3c','#c08a5e','#e0b48c','#f1cfb0'];
const P={idle:0,run1:1,run2:2,throw:3,catch:4,dive:5,fall:6,celeb:7,block:8,stance:9};
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.min(255,Math.round(r*f));g=Math.min(255,Math.round(g*f));b=Math.min(255,Math.round(b*f));return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function fig(g,t,skin,line,dir,pose){
 const r=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
 const side=dir===2,back=dir>=3,diag=dir===1||dir===3;
 const bw=line?11:8,cx=12;
 const crouch=pose===9?3:pose===8?1:0,jump=pose===7?2:0;
 const y0=1+crouch-jump,ty=y0+8,py=ty+6,ly=py+2,fy=22-jump;
 const J=t.c1,J2=shade(t.c1,.72),H=t.h,H2=shade(t.h,.7),T=t.c2,PN=t.p,PN2=shade(t.p,.75),SK=skin,MK='#cfd3da',SH='#1a1a1a';
 const run1=pose===1,run2=pose===2;
 // legs
 if(side){const a=run1?3:run2?-2:0,b=run1?-2:run2?3:0;
  r(cx-2+b,ly,3,fy-ly,PN2);r(cx-2+b,fy-2,3,1,T);r(cx-2+b,fy,4,1,SH);
  r(cx-1+a,ly,3,fy-ly-(run2?1:0),PN);r(cx-1+a,fy-2-(run2?1:0),3,1,T);r(cx-1+a,fy-(run2?1:0),4,1,SH);
 }else{const sp=line?1:0,l1=run1?1:0,l2=run2?1:0;
  r(cx-bw/2+1-sp,ly,3,fy-ly-l1,PN);r(cx-bw/2+1-sp,fy-2-l1,3,1,T);r(cx-bw/2+1-sp,fy-l1,3,1,SH);
  r(cx+bw/2-4+sp,ly,3,fy-ly-l2,PN);r(cx+bw/2-4+sp,fy-2-l2,3,1,T);r(cx+bw/2-4+sp,fy-l2,3,1,SH);}
 // pants + torso
 const tw=side?(line?8:6):bw,tx=Math.round(cx-tw/2);
 r(tx,py,tw,2,PN);r(tx,py,tw,1,PN2);
 r(tx,ty,tw,6,J);r(tx-(side?0:1),ty,tw+(side?1:2),2,J);r(tx,ty+5,tw,1,J2);
 if(!side){ if(back){r(cx-2,ty+2,1,3,T);r(cx+1,ty+2,1,3,T);r(cx-1,ty+2,2,1,T);} else {r(cx-1,ty+2,2,3,T)} }
 else r(tx,ty+2,tw,1,T);
 // arms
 const arm=(x,y,h)=>{r(x,y,2,2,J);r(x,y,2,1,T);r(x,y+2,2,h-2,SK)};
 const up=(x)=>{r(x,y0+2,2,6,SK);r(x,ty,2,2,J)};
 if(side){
  if(pose===3){r(cx-4,y0+2,2,6,SK);r(cx-5,y0,3,2,'#7a3f17')}
  else if(pose===4||pose===5){r(cx+2,ty+1,6,2,SK);r(cx+1,ty,2,2,J)}
  else if(pose===7)up(cx);
  else if(pose===8||pose===9){r(cx+2,ty+2,5,2,SK);r(cx+1,ty+1,2,2,J)}
  else{const s=run1?2:run2?-2:0;arm(cx-1+s,ty+1,5)}
 }else{
  const L=tx-3,R=tx+tw+1;
  if(pose===3){arm(L,ty+1,5);up(R);r(R,y0,3,2,'#7a3f17')}
  else if(pose===4||pose===7||pose===5){up(L);up(R)}
  else if(pose===8||pose===9){r(L+1,ty+2,2,3,SK);r(R-1,ty+2,2,3,SK);r(cx-3,ty+4,2,2,SK);r(cx+1,ty+4,2,2,SK)}
  else{arm(L,ty+1+(run1?1:0),5);arm(R,ty+1+(run2?1:0),5)}
 }
 // helmet (big)
 if(side){r(cx-4,y0,10,8,H);r(cx-4,y0+7,10,1,H2);r(cx-3,y0,6,1,T);r(cx-1,y0+3,2,2,H2);r(cx+3,y0+3,3,3,SK);r(cx+6,y0+3,1,4,MK);r(cx+3,y0+5,4,1,MK)}
 else if(back){r(cx-5,y0,10,8,H);r(cx-5,y0+7,10,1,H2);r(cx-1,y0,2,7,T);}
 else{const o=diag?2:0;r(cx-5,y0,10,8,H);r(cx-5,y0+7,10,1,H2);r(cx-1+o,y0,2,2,T);r(cx-3+o,y0+3,6-(diag?1:0),3,SK);r(cx-3+o,y0+4,6-(diag?1:0),1,MK);r(cx-3+o,y0+6,6-(diag?1:0),1,MK);r(cx+o,y0+3,1,4,MK)}
 if(diag&&back){r(cx+3,y0+3,2,3,SK);r(cx+4,y0+3,1,4,MK)}
}
function outline(c){const g=c.getContext('2d'),d=g.getImageData(0,0,CELL,CELL),a=d.data,o=new Uint8ClampedArray(a);
 for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++){const i=(y*CELL+x)*4;if(a[i+3])continue;
  let n=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<CELL&&Y<CELL&&a[(Y*CELL+X)*4+3])n=true}
  if(n){o[i]=20;o[i+1]=16;o[i+2]=32;o[i+3]=255}}
 g.putImageData(new ImageData(o,CELL,CELL),0,0)}
function buildAtlas(t){const at=document.createElement('canvas');at.width=CELL*DIRS*POSES;at.height=CELL*10;const ag=at.getContext('2d');ag.imageSmoothingEnabled=false;
 const A=document.createElement('canvas');A.width=A.height=CELL;const B=document.createElement('canvas');B.width=B.height=CELL;
 const ga=A.getContext('2d'),gb=B.getContext('2d',{willReadFrequently:true});ga.imageSmoothingEnabled=gb.imageSmoothingEnabled=false;
 for(let s=0;s<5;s++)for(let line=0;line<2;line++)for(let dir=0;dir<DIRS;dir++)for(let pose=0;pose<POSES;pose++){
  ga.clearRect(0,0,CELL,CELL);gb.clearRect(0,0,CELL,CELL);
  if(pose===5||pose===6){fig(ga,t,SKIN[s],line,2,pose===5?4:0);gb.save();gb.translate(12,17);gb.rotate(pose===5?Math.PI/2:-Math.PI/2);gb.drawImage(A,-12,-12);gb.restore()}
  else fig(gb,t,SKIN[s],line,dir,pose);
  outline(B);ag.drawImage(B,(dir*POSES+pose)*CELL,(s*2+line)*CELL)}
 return at}
window.SPR={CELL,DIRS,POSES,P,buildAtlas};
})();
