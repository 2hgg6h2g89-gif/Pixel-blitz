// Original 16-bit style football sprites, drawn pixel-by-pixel in code from a small pose rig (v17).
(function(){
const CELL=24,DIRS=5,SKIN=['#5a3a26','#8a5a3c','#c08a5e','#e0b48c','#f1cfb0'];
const BALL='#7a3f17',LACE='#f4efe4',OUT=[22,18,34];
function hx(h){const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function shade(hex,f){let[r,g,b]=hx(hex);const m=v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)));return'#'+((1<<24)|(m(r)<<16)|(m(g)<<8)|m(b)).toString(16).slice(1)}
function lum(h){const[r,g,b]=hx(h);return .3*r+.59*g+.11*b}
// ---- pose rig. Side view faces right. L=[front foot dx, front lift, back foot dx, back lift]; A=[[near hand dx,dy],[far hand dx,dy]] from the shoulder.
// c=crouch px, j=jump px, ln=upper-body lean px, ball: tuck | n (near hand) | hi (overhead) ; F = optional front-view override {L:[liftL,liftR],sp,A:[[out,dy],[out,dy]],ball:chest|l|r|up}
const D={};const add=(n,s)=>{D[n]=s};
add('idle0',{L:[1,0,-1,0],A:[[0,5],[0,5]]});add('idle1',{c:0,L:[1,0,-1,0],A:[[1,5],[-1,5]],br:1});
add('stance',{c:4,ln:3,L:[3,0,-3,0],A:[[3,7],[1,5]],F:{L:[0,0],sp:2,A:[[0,7],[1,4]]}});
add('ready',{c:2,ln:1,L:[2,0,-2,0],A:[[2,4],[2,4]],F:{L:[0,0],sp:2,A:[[2,4],[2,4]]}});
const RUN=[[4,0,-4,1],[2,0,-3,3],[0,0,-1,4],[-4,1,4,0],[-3,3,2,0],[-1,4,0,0]],RA=[[[-3,3],[3,2]],[[-2,4],[2,3]],[[0,5],[0,5]],[[3,2],[-3,3]],[[2,3],[-2,4]],[[0,5],[0,5]]],BOB=[0,1,0,0,1,0];
RUN.forEach((l,i)=>{add('run'+i,{ln:1,c:BOB[i],L:l,A:RA[i]});add('carry'+i,{ln:1,c:BOB[i],L:l,A:[[2,3],RA[i][1]],ball:'tuck'})});
const SPR_=[[5,0,-5,2],[1,0,-2,5],[-5,2,5,0],[-2,5,1,0]],SPA=[[[-4,2],[4,0]],[[0,4],[0,4]],[[4,0],[-4,2]],[[0,4],[0,4]]];
SPR_.forEach((l,i)=>{add('sprint'+i,{ln:2,c:i%2,L:l,A:SPA[i]});add('scarry'+i,{ln:2,c:i%2,L:l,A:[[2,3],SPA[i][1]],ball:'tuck'})});
[[1,0,-2,2],[-1,2,1,0],[-2,0,1,2],[1,2,-1,0]].forEach((l,i)=>{add('bp'+i,{ln:-1,c:1,L:l,A:[[2,3],[2,4]]});add('drop'+i,{ln:-1,c:1,L:l,A:[[0,-1],[2,2]],ball:'n',F:{L:[l[1],l[3]],sp:0,A:[[1,3],[0,-2]],ball:'r'}})});
add('cut',{ln:3,c:2,L:[5,0,-3,2],A:[[-3,2],[4,1]]});
add('stiff0',{ln:1,L:[3,0,-3,2],A:[[6,-1],[2,3]],ball:'tuck2',F:{L:[0,2],sp:0,A:[[0,-4],[1,3]],ball:'chest'}});add('stiff1',{ln:1,L:[-2,2,3,0],A:[[7,-1],[2,3]],ball:'tuck2',F:{L:[2,0],sp:0,A:[[0,-4],[1,3]],ball:'chest'}});
add('catchUp',{j:1,L:[2,0,-2,1],A:[[2,-7],[3,-6]],ball:'hi',F:{L:[0,1],sp:0,A:[[0,-8],[0,-8]],ball:'up'}});
add('catchTuck',{L:[2,0,-2,0],A:[[2,3],[1,3]],ball:'tuck'});
add('dcatch',{L:[-3,1,-5,2],A:[[1,-8],[2,-7]],ball:'hi',F:{L:[1,1],sp:0,A:[[0,-8],[0,-8]],ball:'up'}});
add('jplant',{c:3,ln:2,L:[4,0,-4,0],A:[[2,3],[-2,2]],ball:'tuck',F:{L:[0,0],sp:3,A:[[1,3],[3,2]],ball:'chest'}});
add('jfake',{c:2,ln:-1,L:[2,2,-3,0],A:[[2,3],[-4,1]],ball:'tuck',F:{L:[2,0],sp:2,A:[[4,1],[1,3]],ball:'chest'}});
add('jcut',{c:1,ln:3,L:[5,0,-4,3],A:[[2,3],[4,0]],ball:'tuck',F:{L:[0,3],sp:1,A:[[1,3],[4,0]],ball:'chest'}});
add('dive0',{c:4,ln:3,L:[3,0,-3,0],A:[[3,5],[2,5]],ball:'tuck'});add('dive1',{L:[-1,0,-3,1],A:[[1,-8],[2,-8]],ball:'hi',F:{L:[0,0],sp:0,A:[[0,-8],[0,-8]],ball:'up'}});
add('wrap',{c:2,ln:4,L:[4,0,-4,1],A:[[6,1],[6,3]],F:{L:[0,1],sp:1,A:[[-2,2],[-2,2]]}});
add('fall0',{c:1,ln:-1,L:[2,2,-2,0],A:[[-2,-5],[3,-4]],F:{L:[2,0],sp:1,A:[[3,-5],[3,-4]]}});
add('down',{L:[1,0,-1,0],A:[[2,4],[-1,4]],F:{L:[0,0],sp:1,A:[[2,4],[2,4]]}});
add('getup0',{c:5,ln:2,kn:1,L:[3,0,-4,0],A:[[3,6],[1,5]],F:{L:[3,0],sp:1,A:[[1,6],[2,5]]}});
add('getup1',{c:2,ln:1,L:[2,0,-2,0],A:[[2,5],[1,4]],F:{L:[0,0],sp:1,A:[[1,4],[1,4]]}});
add('cel0',{c:3,L:[2,0,-2,0],A:[[1,4],[1,4]]});add('cel1',{j:3,L:[1,2,-1,2],A:[[1,-8],[2,-7]],F:{L:[2,2],sp:1,A:[[2,-8],[2,-8]]}});
add('cel2',{j:1,L:[2,0,-2,1],A:[[3,-6],[0,5]],ball:'raise',F:{L:[0,1],sp:1,A:[[0,4],[2,-8]],ball:'up'}});add('cel3',{c:1,ln:1,L:[2,0,-2,0],A:[[5,6],[0,5]],ball:'spike',F:{L:[0,0],sp:1,A:[[3,6],[1,5]]}});
add('blk0',{c:2,ln:3,L:[3,0,-4,0],A:[[5,1],[5,2]],F:{L:[0,0],sp:2,A:[[-1,1],[-1,1]]}});add('blk1',{c:2,ln:4,L:[4,0,-3,1],A:[[6,0],[6,1]],F:{L:[0,1],sp:2,A:[[-2,0],[-2,0]]}});add('blk2',{c:2,ln:4,L:[2,1,-4,0],A:[[6,1],[6,0]],F:{L:[1,0],sp:2,A:[[-2,0],[-2,0]]}});
add('hold',{L:[2,0,-2,0],A:[[1,0],[2,1]],ball:'n',F:{L:[0,0],sp:1,A:[[1,2],[0,-1]],ball:'r'}});
// throw: load (anticipation), cock, whip, release, follow-through x2
add('thr0',{c:1,ln:-1,L:[2,0,-3,0],A:[[1,0],[2,1]],ball:'n',F:{L:[0,0],sp:1,A:[[1,2],[0,-1]],ball:'r'}});
add('thr1',{c:2,ln:-2,L:[3,1,-3,0],A:[[-4,-3],[4,1]],ball:'n',F:{L:[1,0],sp:1,A:[[3,1],[2,-4]],ball:'r'}});
add('thr2',{c:2,ln:0,L:[4,0,-3,0],A:[[-1,-7],[3,2]],ball:'n',F:{L:[0,0],sp:1,A:[[3,2],[0,-7]],ball:'r'}});
add('thr3',{c:1,ln:2,L:[4,0,-3,1],A:[[4,-5],[-1,3]],F:{L:[0,1],sp:1,A:[[1,3],[-1,-5]]}});
add('thr4',{c:2,ln:3,L:[4,0,-2,3],A:[[5,2],[-2,4]],F:{L:[0,3],sp:1,A:[[1,4],[-2,2]]}});
add('thr5',{c:1,ln:2,L:[3,0,-1,2],A:[[3,4],[-1,5]],F:{L:[0,2],sp:1,A:[[1,5],[-1,4]]}});
add('kick0',{c:2,ln:1,L:[3,0,-4,2],A:[[-3,1],[3,1]]});add('kick1',{c:1,ln:-1,L:[2,0,6,6],A:[[-4,0],[4,0]],F:{L:[0,6],sp:1,A:[[4,0],[4,0]]}});add('kick2',{c:0,j:1,ln:-2,L:[1,0,7,11],A:[[-4,-2],[4,-1]],F:{L:[0,9],sp:1,A:[[4,-2],[4,-1]]}});
const NAMES=Object.keys(D);const POSES=NAMES.length;const P={};NAMES.forEach((n,i)=>P[n]=i);
// legacy names used by game code
Object.assign(P,{idle:P.idle0,run:P.run0,hrun:P.carry0,throw:P.thr0,catch1:P.catchUp,catch2:P.catchTuck,dive:P.dive1,fall:P.down,celeb:P.cel1,block:P.blk0});
function frontOf(s){if(s.F)return Object.assign({c:s.c||0,j:s.j||0},s.F);const A=s.A||[[0,5],[0,5]];
 const f=([hx,hy])=>[1+Math.max(0,-hx)*0.3|0,hy-(hx>2?2:0)];return{c:s.c||0,j:s.j||0,L:[s.L?s.L[1]:0,s.L?s.L[3]:0],sp:(s.c||0)>=2?1:0,A:[f(A[0]),f(A[1])],ball:s.ball==='tuck'||s.ball==='tuck2'?'chest':s.ball==='n'?'r':s.ball==='hi'?'up':null}}
function fig(g,t,skin,line,dir,name){const s=D[name];
 const r=(x,y,w,h,c)=>{if(w>0&&h>0){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}};
 const seg=(x0,y0,x1,y1,w,c)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++){const k=i/n;r(x0+(x1-x0)*k-w/2+0.5,y0+(y1-y0)*k-w/2+0.5,w,w,c)}};
 const side=dir===2,back=dir>=3,diag=dir===1||dir===3;
 const bw=line?11:8,cx=12;const fs=side?s:frontOf(s);
 const c=fs.c||0,j=fs.j||0,br=fs.br||0;const y0=1+c-j+br,ty=y0+8,py=ty+6,ly=py+2,fy=22-j;const ln=side?(s.ln||0):0;
 const J=t.c1,J2=shade(t.c1,.7),JL=shade(t.c1,1.2),H=t.h,HL=shade(t.h,1.45),H2=shade(t.h,.68),ST=lum(t.c1)-lum(t.h)>-40&&Math.abs(lum(t.c1)-lum(t.h))>40?t.c1:t.c2,
  PN=t.p,PN2=shade(t.p,.75),SK=skin,SK2=shade(skin,.8),MK='#d4d8e0',MK2='#8a909c',SH='#1a1a1a',SO=t.c2;
 const ballAt=(x,y,v)=>{if(v){r(x,y,2,3,BALL);r(x,y+1,1,1,LACE)}else{r(x,y,3,2,BALL);r(x+1,y,1,1,LACE)}};
 const after=[];
 // ---- legs
 if(side){const L=s.L||[1,0,-1,0];const hipX=cx,hipY=ly;
  const leg=(fx,lift,col,front)=>{const footX=hipX+fx,footY=fy-1-lift;const kx=hipX+fx*0.5+(lift>1?2:0)+(s.kn&&front?2:0),ky=hipY+(footY-hipY)*0.5-(lift>1?lift*0.35:0);
   seg(hipX,hipY,kx,ky,3,col);seg(kx,ky,footX,footY-1,3,col);r(footX-1,footY-1,3,1,SO);r(footX-1,footY,4,1,SH)};
  leg(L[2],L[3],PN2,false);leg(L[0],L[1],PN,true);
 }else{const sp=(line?1:0)+(fs.sp||0);const l1=fs.L?fs.L[0]:0,l2=fs.L?fs.L[1]:0;
  r(cx-bw/2+1-sp,ly,3,fy-ly-l1,PN);r(cx-bw/2+1-sp,fy-2-l1,3,1,SO);r(cx-bw/2+1-sp,fy-l1,3,1,SH);
  r(cx+bw/2-4+sp,ly,3,fy-ly-l2,PN2);r(cx+bw/2-4+sp,fy-2-l2,3,1,SO);r(cx+bw/2-4+sp,fy-l2,3,1,SH)}
 // ---- pants + torso
 const tw=side?(line?8:6):bw,tx=Math.round(cx-tw/2+ln*0.6);
 r(Math.round(cx-tw/2),py,tw,2,PN);r(Math.round(cx-tw/2),py+1,tw,1,PN2);
 r(tx,ty,tw,6,J);r(tx-(side?0:1),ty,tw+(side?1:2),2,J);r(tx,ty,tw,1,JL);r(tx+tw-1,ty+2,1,4,J2);r(tx,ty+5,tw,1,J2);if(side)r(tx+1,ty+1,1,4,SO);
 // ---- arms
 const A=fs.A||[[0,5],[0,5]];
 if(side){const shX=tx+tw-2,shY=ty+1;const arm=(h,col,front)=>{const hx=shX+h[0],hy=shY+h[1];seg(shX,shY,shX+(h[0])*0.35,shY+(h[1])*0.35,2,J);seg(shX+h[0]*0.35,shY+h[1]*0.35,hx,hy,2,col);return[hx,hy]};
  const far=arm(A[1],SK2,false);
  const draw=()=>{const nh=arm(A[0],SK,true);const b=s.ball;
   if(b==='tuck'||b==='tuck2')ballAt(tx+tw-2,ty+2,false);else if(b==='n')ballAt(nh[0]-1,nh[1]-2,false);else if(b==='hi')ballAt(nh[0]-1,nh[1]-3,false);else if(b==='raise')ballAt(nh[0]-1,nh[1]-3,true);else if(b==='spike')ballAt(nh[0],nh[1]+1,true)};
  if((s.ball==='tuck'||s.ball==='tuck2')&&A[0][1]>1)draw();else after.push(draw);
 }else{const sy=ty+1;const L=tx-2,R=tx+tw;const arm=(h,x,dirx,col)=>{const hx=x+dirx*h[0],hy=sy+h[1];seg(x,sy,x+dirx*h[0]*0.35,sy+h[1]*0.35,2,J);seg(x+dirx*h[0]*0.35,sy+h[1]*0.35,hx,hy,2,col);return[hx,hy]};
  const up=A[0][1]<0||A[1][1]<0;const go=()=>{const a=arm(A[0],L,-1,SK),b=arm(A[1],R,1,SK);const bl=fs.ball;
   if(bl==='chest'&&!back){r(cx-3,ty+2,6,2,SK);ballAt(cx-1,ty+1,false)}else if(bl==='up')ballAt(cx-1,Math.min(a[1],b[1])-2,false);else if(bl==='r')ballAt(b[0]-1,b[1]-1,false);else if(bl==='l')ballAt(a[0]-1,a[1]-1,false)};
  if(up)after.push(go);else go()}
 // ---- helmet
 const hx0=side?cx+Math.round(ln):cx;const clr=(x,y)=>g.clearRect(x,y,1,1);
 if(side){const cx=hx0;r(cx-4,y0,9,8,H);r(cx-5,y0+2,1,4,H);clr(cx-4,y0);clr(cx+4,y0);r(cx-4,y0+7,9,1,H2);r(cx+3,y0+1,1,6,H2);
  r(cx-3,y0,6,1,ST);r(cx-2,y0+1,2,1,HL);r(cx-1,y0+4,2,2,'#141220');r(cx-4,y0+6,2,1,H2);
  r(cx+3,y0+3,2,3,SK);r(cx+5,y0+3,2,1,MK);r(cx+5,y0+5,2,1,MK);r(cx+7,y0+3,1,4,MK2);r(cx+4,y0+6,3,1,MK2)}
 else if(back){r(cx-5,y0,10,8,H);clr(cx-5,y0);clr(cx+4,y0);r(cx-5,y0+7,10,1,H2);r(cx+4,y0+2,1,5,H2);r(cx-1,y0,2,7,ST);r(cx-4,y0+1,2,1,HL);r(cx-5,y0+5,1,1,'#141220');r(cx+4,y0+5,1,1,'#141220')}
 else{const o=diag?2:0,fw=6-(diag?1:0);r(cx-5,y0,10,8,H);clr(cx-5,y0);clr(cx+4,y0);r(cx-5,y0+7,10,1,H2);r(cx+4,y0+2,1,5,H2);r(cx-1+o,y0,2,2,ST);r(cx-4+o,y0+1,1,1,HL);r(cx-3+o,y0+1,1,1,'#ffffff');
  r(cx-3+o,y0+3,fw,4,SK);r(cx-3+o,y0+3,fw,1,SK2);r(cx-3+o,y0+4,fw,1,MK);r(cx-3+o,y0+6,fw,1,MK);r(cx+o,y0+4,1,3,MK2);if(diag)r(cx-4,y0+4,1,1,'#141220')}
 after.forEach(f=>f());
 return {ty,cover:!side&&(fs.ball==='chest'||(A[0][1]>0&&A[0][1]<4&&fs.A&&fs.A[0][0]<0))}}
function outline(c,W,Hh,col){const g=c.getContext('2d',{willReadFrequently:true}),d=g.getImageData(0,0,W,Hh),a=d.data;
 for(let i=3;i<a.length;i+=4)a[i]=a[i]>127?255:0;const o=new Uint8ClampedArray(a);
 for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(a[i+3])continue;let n=false;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<Hh&&a[(Y*W+X)*4+3])n=true}
  if(n){o[i]=col[0];o[i+1]=col[1];o[i+2]=col[2];o[i+3]=255}}
 g.putImageData(new ImageData(o,W,Hh),0,0)}
// atlas: columns = pose, rows = dir*10 + skin*2 + line
const META=[];
function buildAtlas(t){const at=document.createElement('canvas');at.width=CELL*POSES;at.height=CELL*10*DIRS;const ag=at.getContext('2d');ag.imageSmoothingEnabled=false;
 const B=document.createElement('canvas');B.width=B.height=CELL;const gb=B.getContext('2d',{willReadFrequently:true});gb.imageSmoothingEnabled=false;
 for(let dir=0;dir<DIRS;dir++)for(let pose=0;pose<POSES;pose++)for(let s=0;s<5;s++)for(let line=0;line<2;line++){
  gb.clearRect(0,0,CELL,CELL);const m=fig(gb,t,SKIN[s],line,dir,NAMES[pose]);if(s===0&&line===0)META[dir*POSES+pose]=m;
  outline(B,CELL,CELL,OUT);ag.drawImage(B,pose*CELL,(dir*10+s*2+line)*CELL)}
 return at}
// jersey numbers: 3x5 pixel digits, 10x10 grid of 9x7 cells
const DG=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001010010010','111101111101111','111101111001111'];
function buildNumbers(t){const c=document.createElement('canvas');c.width=90;c.height=70;const g=c.getContext('2d',{willReadFrequently:true});
 const fg=Math.abs(lum(t.c2)-lum(t.c1))>60?t.c2:(lum(t.c1)>140?'#1a1a2a':'#ffffff');
 for(let n=0;n<100;n++){const ox=(n%10)*9,oy=Math.floor(n/10)*7;const s=String(n);const digs=s.length===1?[s]:[s[0],s[1]];const x0=s.length===1?ox+3:ox+1;
  digs.forEach((d,k)=>{const b=DG[+d];for(let i=0;i<15;i++)if(b[i]==='1'){g.fillStyle=fg;g.fillRect(x0+k*4+i%3,oy+1+Math.floor(i/3),1,1)}})}
 const sh=hx(shade(t.c1,.45));outline(c,90,70,sh);return c}
window.SPR={CELL,DIRS,POSES,P,NAMES,META,buildAtlas,buildNumbers};
})();
