// Original 16-bit style football sprites, drawn pixel-by-pixel in code.
(function(){
const CELL=24,DIRS=5,POSES=22,SKIN=['#5a3a26','#8a5a3c','#c08a5e','#e0b48c','#f1cfb0'];
const P={idle:0,run:1,hrun:5,throw:9,catch1:14,catch2:15,dive:16,fall:17,celeb:18,block:19,stance:20,hold:21};
const BALL='#7a3f17',LACE='#f4efe4',OUT=[22,18,34];
function hx(h){const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function shade(hex,f){let[r,g,b]=hx(hex);const m=v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)));return'#'+((1<<24)|(m(r)<<16)|(m(g)<<8)|m(b)).toString(16).slice(1)}
function lum(h){const[r,g,b]=hx(h);return .3*r+.59*g+.11*b}
function fig(g,t,skin,line,dir,pose){
 const r=(x,y,w,h,c)=>{if(w>0&&h>0){g.fillStyle=c;g.fillRect(x,y,w,h)}};
 const side=dir===2,back=dir>=3,diag=dir===1||dir===3;
 const bw=line?11:8,cx=12;
 const rp=pose>=1&&pose<=4?pose-1:pose>=5&&pose<=8?pose-5:-1, carry=(pose>=5&&pose<=8)||pose===21||pose===15;
 const ts=pose>=9&&pose<=13?pose-9:-1;
 const crouch=pose===20?3:pose===19?1:ts>=0?[1,2,2,2,1][ts]:0, jump=pose===18?2:0, bob=(rp===0||rp===2)?1:0;
 const y0=1+crouch-jump-bob,ty=y0+8,py=ty+6,ly=py+2,fy=22-jump-bob;
 const J=t.c1,J2=shade(t.c1,.7),JL=shade(t.c1,1.2),H=t.h,HL=shade(t.h,1.45),H2=shade(t.h,.68),ST=lum(t.c1)-lum(t.h)>-40&&Math.abs(lum(t.c1)-lum(t.h))>40?t.c1:t.c2,
  PN=t.p,PN2=shade(t.p,.75),SK=skin,SK2=shade(skin,.8),MK='#d4d8e0',MK2='#8a909c',SH='#1a1a1a',SO=t.c2;
 // ---- legs
 if(side){let a=0,b=0,la=0,lb=0;
  if(rp>=0){[a,b,la,lb]=[[3,-3,0,0],[1,0,0,2],[-3,3,0,0],[0,1,2,0]][rp]}
  else if(ts>=0){[a,b,la,lb]=[[2,-2,0,0],[2,-2,0,0],[4,-3,0,0],[4,-2,0,0],[3,0,0,2]][ts]}
  else if(pose===18){a=1;b=-1}
  r(cx-2+b,ly,3,fy-ly-lb,PN2);r(cx-2+b,fy-2-lb,3,1,SO);r(cx-2+b,fy-lb,4,1,SH);
  r(cx-1+a,ly,3,fy-ly-la,PN);r(cx-1+a,ly,1,fy-ly-la-2,shade(PN,1.15));r(cx-1+a,fy-2-la,3,1,SO);r(cx-1+a,fy-la,4,1,SH);
 }else{const sp=(line?1:0)+(ts===0||ts===1?1:0);let l1=0,l2=0;if(rp>=0)[l1,l2]=[[2,0],[0,0],[0,2],[0,0]][rp];if(ts===4)l1=2;
  r(cx-bw/2+1-sp,ly,3,fy-ly-l1,PN);r(cx-bw/2+1-sp,fy-2-l1,3,1,SO);r(cx-bw/2+1-sp,fy-l1,3,1,SH);
  r(cx+bw/2-4+sp,ly,3,fy-ly-l2,PN2);r(cx+bw/2-4+sp,fy-2-l2,3,1,SO);r(cx+bw/2-4+sp,fy-l2,3,1,SH);}
 // ---- pants + torso (number drawn by overlay)
 const tw=side?(line?8:6):bw,tx=Math.round(cx-tw/2);
 r(tx,py,tw,2,PN);r(tx,py+1,tw,1,PN2);r(tx,py,tw,1,shade(PN,1.1));
 r(tx,ty,tw,6,J);r(tx-(side?0:1),ty,tw+(side?1:2),2,J);r(tx,ty,tw,1,JL);r(tx+tw-1,ty+2,1,4,J2);r(tx,ty+5,tw,1,J2);
 if(side)r(tx+1,ty+1,1,4,SO);
 const ball=(x,y)=>{r(x,y,3,2,BALL);r(x+1,y,1,1,LACE)};
 const arm=(x,y,h)=>{r(x,y,2,2,J);r(x,y+1,2,1,SO);r(x,y+2,2,h-2,SK)};
 const L=tx-3,R=tx+tw+1,after=[];
 if(side){
  if(ts===0){r(cx,ty+1,3,2,SK);ball(cx+1,ty-1)}
  else if(ts===1){r(cx-3,y0+3,2,6,SK);r(cx-3,ty,2,2,J);ball(cx-5,y0+2);r(cx+2,ty+1,4,2,SK)}
  else if(ts===2){r(cx-5,y0+4,3,2,SK);r(cx-4,y0+5,2,4,SK);r(cx-3,ty,2,2,J);ball(cx-7,y0+3);r(cx+2,ty,5,2,SK)}
  else if(ts===3){after.push(()=>{r(cx+1,y0-2,2,7,SK);ball(cx+1,y0-3)});r(cx-3,ty+2,2,4,SK2)}
  else if(ts===4){r(cx+1,ty,2,2,J);r(cx+3,ty+1,3,2,SK);r(cx+5,ty+3,3,2,SK);r(cx-3,ty+2,2,4,SK2)}
  else if(carry){r(cx+1,ty+1,3,3,SK);ball(cx+3,ty+1+(rp===1||rp===3?1:0))}
  else if(pose===14||pose===16){after.push(()=>{r(cx+2,y0+1,2,7,SK);r(cx+4,y0,2,6,SK);ball(cx+3,y0-2)})}
  else if(pose===18){after.push(()=>{r(cx-1,y0-3,2,8,SK);r(cx+3,y0-3,2,8,SK)})}
  else if(pose===19||pose===20){r(cx+2,ty+2,5,2,SK);r(cx+1,ty+1,2,2,J)}
  else{const s=rp>=0?[2,0,-2,0][rp]:0;arm(cx-1+s,ty+1,5)}
 }else{
  if(ts===0){if(back){r(L+1,ty+1,2,4,SK);r(R-1,ty+1,2,4,SK)}else{r(L+1,ty+1,2,3,SK);r(R-1,ty+1,2,3,SK);r(cx-3,ty+2,6,2,SK);ball(cx-1,ty)}}
  else if(ts===1){arm(L,ty+1,4);after.push(()=>{r(R,y0+3,2,6,SK);r(R,ty,2,2,J);ball(R-1,y0+2)})}
  else if(ts===2){arm(L+1,ty,3);after.push(()=>{r(R,y0+1,2,8,SK);r(R,ty,2,2,J);ball(R,y0-1)})}
  else if(ts===3){arm(L,ty+1,4);after.push(()=>{r(R-1,y0-2,2,10,SK);r(R-1,ty,2,2,J);ball(R-2,y0-3)})}
  else if(ts===4){arm(R,ty+1,3);r(L+1,ty+1,2,2,J);r(cx-4,ty+3,7,2,SK)}
  else if(carry){const k=rp===1||rp===3?1:0;if(back){r(L+1,ty+1+k,2,4,SK);r(R-1,ty+1,2,4,SK)}else{r(L+1,ty+1,2,3,SK);r(R-1,ty+1,2,3,SK);r(cx-3,ty+3,6,2,SK);ball(cx-1,ty+2+k)}}
  else if(pose===14||pose===16){after.push(()=>{r(L+1,y0-1,2,9,SK);r(R-1,y0-1,2,9,SK);ball(cx-1,y0-3)})}
  else if(pose===18){after.push(()=>{r(L,y0-3,2,10,SK);r(R,y0-3,2,10,SK)})}
  else if(pose===19||pose===20){r(L+1,ty+2,2,3,SK);r(R-1,ty+2,2,3,SK);r(cx-3,ty+4,2,2,SK);r(cx+1,ty+4,2,2,SK)}
  else{const a=rp>=0?[1,0,-1,0][rp]:0;arm(L,ty+1+Math.max(0,a),5);arm(R,ty+1+Math.max(0,-a),5)}
 }
 // ---- helmet: rounded shell, stripe, gloss pixel, facemask
 const clr=(x,y)=>g.clearRect(x,y,1,1);
 if(side){r(cx-4,y0,9,8,H);r(cx-5,y0+2,1,4,H);clr(cx-4,y0);clr(cx+4,y0);r(cx-4,y0+7,9,1,H2);r(cx+3,y0+1,1,6,H2);
  r(cx-3,y0,6,1,ST);r(cx-2,y0+1,2,1,HL);r(cx-1,y0+4,2,2,'#141220');r(cx-4,y0+6,2,1,H2);
  r(cx+3,y0+3,2,3,SK);r(cx+5,y0+3,2,1,MK);r(cx+5,y0+5,2,1,MK);r(cx+7,y0+3,1,4,MK2);r(cx+4,y0+6,3,1,MK2)}
 else if(back){r(cx-5,y0,10,8,H);clr(cx-5,y0);clr(cx+4,y0);r(cx-5,y0+7,10,1,H2);r(cx+4,y0+2,1,5,H2);r(cx-1,y0,2,7,ST);r(cx-4,y0+1,2,1,HL);r(cx-5,y0+5,1,1,'#141220');r(cx+4,y0+5,1,1,'#141220')}
 else{const o=diag?2:0,fw=6-(diag?1:0);r(cx-5,y0,10,8,H);clr(cx-5,y0);clr(cx+4,y0);r(cx-5,y0+7,10,1,H2);r(cx+4,y0+2,1,5,H2);r(cx-1+o,y0,2,2,ST);r(cx-4+o,y0+1,1,1,HL);r(cx-3+o,y0+1,1,1,'#ffffff');
  r(cx-3+o,y0+3,fw,4,SK);r(cx-3+o,y0+3,fw,1,SK2);r(cx-3+o,y0+4,fw,1,MK);r(cx-3+o,y0+6,fw,1,MK);r(cx+o,y0+4,1,3,MK2);if(diag)r(cx-4,y0+4,1,1,'#141220')}
 after.forEach(f=>f());
}
function outline(c,W,Hh,col){const g=c.getContext('2d',{willReadFrequently:true}),d=g.getImageData(0,0,W,Hh),a=d.data;
 for(let i=3;i<a.length;i+=4)a[i]=a[i]>127?255:0;const o=new Uint8ClampedArray(a);
 for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(a[i+3])continue;let n=false;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<Hh&&a[(Y*W+X)*4+3])n=true}
  if(n){o[i]=col[0];o[i+1]=col[1];o[i+2]=col[2];o[i+3]=255}}
 g.putImageData(new ImageData(o,W,Hh),0,0)}
function buildAtlas(t){const at=document.createElement('canvas');at.width=CELL*DIRS*POSES;at.height=CELL*10;const ag=at.getContext('2d');ag.imageSmoothingEnabled=false;
 const A=document.createElement('canvas');A.width=A.height=CELL;const B=document.createElement('canvas');B.width=B.height=CELL;
 const ga=A.getContext('2d'),gb=B.getContext('2d',{willReadFrequently:true});ga.imageSmoothingEnabled=gb.imageSmoothingEnabled=false;
 for(let s=0;s<5;s++)for(let line=0;line<2;line++)for(let dir=0;dir<DIRS;dir++)for(let pose=0;pose<POSES;pose++){
  ga.clearRect(0,0,CELL,CELL);gb.clearRect(0,0,CELL,CELL);
  if(pose===16||pose===17){fig(ga,t,SKIN[s],line,dir,pose===16?14:0);gb.save();gb.translate(12,17);gb.rotate(pose===16||dir===2?Math.PI/2:-Math.PI/2);gb.drawImage(A,-12,-12);gb.restore()}
  else fig(gb,t,SKIN[s],line,dir,pose);
  outline(B,CELL,CELL,OUT);ag.drawImage(B,(dir*POSES+pose)*CELL,(s*2+line)*CELL)}
 return at}
// jersey numbers: 3x5 pixel digits, 10x10 grid of 9x7 cells
const DG=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001010010010','111101111101111','111101111001111'];
function buildNumbers(t){const c=document.createElement('canvas');c.width=90;c.height=70;const g=c.getContext('2d',{willReadFrequently:true});
 const fg=Math.abs(lum(t.c2)-lum(t.c1))>60?t.c2:(lum(t.c1)>140?'#1a1a2a':'#ffffff');
 for(let n=0;n<100;n++){const ox=(n%10)*9,oy=Math.floor(n/10)*7;const s=String(n);const digs=s.length===1?[s]:[s[0],s[1]];const x0=s.length===1?ox+3:ox+1;
  digs.forEach((d,k)=>{const b=DG[+d];for(let i=0;i<15;i++)if(b[i]==='1'){g.fillStyle=fg;g.fillRect(x0+k*4+i%3,oy+1+Math.floor(i/3),1,1)}})}
 const sh=hx(shade(t.c1,.45));outline(c,90,70,sh);return c}
window.SPR={CELL,DIRS,POSES,P,buildAtlas,buildNumbers};
})();
