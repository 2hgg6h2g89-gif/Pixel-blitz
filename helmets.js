// Pixel Blitz helmets — original side shell and original shaded marks. No baked league art.
(function(){
function hex(h){const n=parseInt(String(h).replace('#',''),16);return[n>>16&255,n>>8&255,n&255]}
function mix(h,f){const[r,g,b]=hex(h);const m=v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)));return'rgb('+m(r)+','+m(g)+','+m(b)+')'}
function lum(h){const[r,g,b]=hex(h);return .3*r+.59*g+.11*b}
function best(bg,cs){let b=cs[0],bd=-1;for(const c of cs){const d=Math.abs(lum(c)-lum(bg));if(d>bd){bd=d;b=c}}return b}
const EMB=["hawk","wing","rook","horns","paw","claws","stripes","spike","lasso","horse","talons","gear","star","shoe","spots","crown","cutlass","bolt","ram","fin","axe","tricorn","halo","pillar","rocket","wings","anvil","pick","osprey","sail","peak","wheel"];
const GRID=[
'....................######..............................',
'.................####SSSSSS####.........................',
'..............##SSSSSSSSSSSSSSSS##......................',
'............##SSSHHHHHSSSSSSSSSSSS##....................',
'..........##SSSHHHHHHHSSSSSSSSSSSSSS##..................',
'.........#SSSSSSSSSSSSSSSSSSSSSSSSSSSS#.................',
'........#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#...............',
'.......#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#..............',
'......#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#.............',
'.....#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#............',
'....#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSVVV##...........',
'...#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSVVVVV########mw#.',
'..#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSVVVVVV#wwwwww#mw#.',
'.#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSVVVVVVV#mmmmmm#mw#.',
'.#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSVVVVVVVV########mw#.',
'#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSVVVVVVVV#......#mw#.',
'#SSSSSSSSSSEEEESSSSSSSSSSSSSSSSSSSSVVVVVVVVV########mw#.',
'#SSSSSSSSSSEEEESSSSSSSSSSSSSSSSSSSSVVVVVVVVV#wwwwww#mw#.',
'#SSSSSSSSSSEEEESSSSSSSSSSSSSSSSSSSSVVVVVVVVV#mmmmmm#mw#.',
'#SSSSSSSSSSEEEESSSSSSSSSSSSSSSSSSSSVVVVVVVVV########mw#.',
'.#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#......#mw#.',
'.#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS########mw#.',
'..#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#wwwwww#mw#.',
'..#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#mmmmmm#mw#.',
'...#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS########mw#.',
'....#SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#...........',
'.....##SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#............',
'.......###SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS###.............',
'..........######SSSSSSSSSSSSSSSS######..................',
'...............##################.......................'
];
const GW=GRID[0].length,GH=GRID.length,SHELL_W=GW,SHELL_H=GH;
const ART={
 hawk:['............','.HHHHHHHHHH.','H##########H','##..AA..AA##','##..AA..AA##','##..AA..AA##','H##########H','.H########H.','..H######H..','...H####H...','....HDDH....','.....DD.....'],
 wing:['.....HH.....','....H##H....','...H#AA#H...','..H#A##A#H..','.H#A####A#H.','H#AA#HH#AA#H','H#A######A#H','.H#A####A#H.','..H#AAAA#H..','...H####H...','....HDDH....','.....DD.....'],
 rook:['..HHHHHHHH..','.H########H.','H##AAAAAA##H','H##A####A##H','.H##AAAA##H.','..H######H..','..H#AAAA#H..','..H######H..','..H#AAAA#H..','..H######H..','...H####H...','....DDDD....'],
 horns:['HH........HH','##H......H##','#H#HHHHHH#H#','.H##H##H##H.','..H#AAAA#H..','..##A##A##..','..H######H..','.H##DDDD##H.','H###DDDD###H','.H########H.','..H######H..','...DDDDDD...'],
 paw:['.......HHH..','......H###H.','.....H####H.','....H####H..','...H####H...','..H######HH.','..HH####H...','....H####H..','.....H####H.','......H###H.','.......H##H.','........DD..'],
 claws:['..HH....HH..','.H##H..H##H.','.H##HHHH##H.','.H##H##H##HH','HH##H##H####','######H#####','############','H##########H','.H########H.','..H######H..','...DDDDDD...','............'],
 stripes:['H..H....H..H','##H#HHHH#H##','#H##H##H##H#','.H########H.','..H######H..','..H#AAAA#H..','..H######H..','..H######H..','.H########H.','H##########H','.DDDDDDDDDD.','............'],
 spike:['........HHHH','......HH####','....HH###AA#','..HH###AAAA#','.H###AAAAAA#','H###AAAAAAAA','####AAAAAAAA','####AAAAAAA#','H###DDDDDDD#','.H##DDDDDDD#','..H#DDDDDDD#','...DDDDDDDDD'],
 lasso:['......HH....','.....H##H...','....H####H..','...H##AA##H.','..H###AA###H','.H####AA####','H#####AA####','######AA###H','H#####DD##H.','.H####DD#H..','..H###DDH...','...DDDDD....'],
 horse:['....HH......','...H##HH....','..H#####HH..','.H#######HH.','H#########H.','######HH####','####H####HH#','###H######H#','H#H#######H.','.H#######H..','..DDDDDDD...','............'],
 talons:['....H#HH#...','...H##HH##H.','..H########H','.H###HHHH###','H###H#AA#H##','H###H#AA#H##','.H###HHHH###','..H########H','...H##DD##H.','....D#DD#D..','.....H##H...','............'],
 gear:['.....HH.....','....H##H....','...H####H...','..H######H..','.H########H.','H##########H','....H##H....','....H##H....','..H######H..','.H########H.','H##########H','DDDDDDDDDDDD'],
 star:['.....HH.....','....H##H....','...H#HH#H...','..H##HH##H..','.H###HH###H.','H####HH####H','.....HH.....','.....HH.....','....H##H....','...H####H...','..H######H..','.DDDDDDDDDD.'],
 shoe:['....HH......','..HH#AH.....','H#A#A#AH....','H#A#A##H....','HA#A#A#H....','H#A#A##H....','.HHH#AH.....','.....H......','.....H......','.....H......','....H#H.....','....DDD.....'],
 spots:['............','..HH....HH..','.H##H..H##HH','H####HH#####','###AAAAAA###','##AAAAAAAA##','H##########H','.H########H.','..DDDDDDDD..','............','............','............'],
 crown:['H..........H','#H........H#','.#HHHHHHHH#.','..H######H..','..H#H##H#H..','..H######H..','..H#H##H#H..','..H######H..','..H#H##H#H..','..H######H..','.H########H.','DDDDDDDDDDDD'],
 cutlass:['....HHHH....','..HH####HH..','.H##AAAA##H.','.H#AAAAAA#H.','.H#AAAAAA#H.','.H##AAAA##H.','..HH####HH..','...H####H...','...H#HH#H...','...######...','...#HHHH#...','....DDDD....'],
 bolt:['.....HHHHHHH','...HH#######','..H###AAAAA#','.H###AAAAAA#','H###AAAAAAA#','.H###AAAAA#.','..H###AAA#..','...H#####H..','....H###H...','.....H#H....','......H.....','......D.....'],
 ram:['...HHHHHH...','..H######H..','.H##A##A##H.','.H#AA##AA#H.','H##AAHHAA##H','H###HHHH###H','H##AAHHAA##H','.H#AA##AA#H.','.H##A##A##H.','..H######H..','...DDDDDD...','............'],
 fin:['H..H....H..H','##H#H..H#H##','#H###HH###H#','.H########H.','..H##HH##H..','.H###HH###H.','H####HH####H','.H########H.','..H######H..','...H####H...','....HDDH....','.....DD.....'],
 axe:['............','....HHHH....','...H#AA#H...','..H#A##A#H..','.H#A#HH#A#H.','H#A##HH##A#H','.H#A#HH#A#H.','..H#A##A#H..','...H#AA#H...','....HHHH....','.....DD.....','............'],
 tricorn:['.....HH.....','....H##H....','...H#AA#H...','....H##H....','...H####H...','..H######H..','..H#AAAA#H..','..H######H..','..H#AAAA#H..','.H########H.','H##########H','DDDDDDDDDDDD'],
 halo:['.....HHH....','...HH###H...','..H##AAA#H..','..H#AAAAA...','..H#AAAAAH..','..H##AAA#...','...HH###....','....HH......','..H......H..','.H#H....H#H.','H##########H','DDDDDDDDDDDD'],
 pillar:['....HHHH....','...H#AA#H...','...H####H...','..H#H##H#H..','.H########H.','H#H#H##H#H#H','############','H#H#H##H#H#H','############','H#H#H##H#H#H','############','DDDDDDDDDDDD'],
 rocket:['....H##H....','..HH#AA#HH..','.H##AAAA##H.','H#AAA##AAA#H','H#AAA##AAA#H','.H##AAAA##H.','..HH#AA#HH..','....H##H....','.....HH.....','.....HH.....','....H##H....','....DDDD....'],
 wings:['...HHHHHH...','..H#AAAA#H..','.H#AAAAAA#H.','.H##AAAA##H.','..H#AAAA#H..','...H#AA#H...','....H##H....','....H##H....','....H##H....','...H####H...','...H####H...','....DDDD....'],
 anvil:['H..........H','#H........H#','.#HHHHHHHH#.','..H######H..','...H####H...','..H#H##H#H..','.H##HHHH##H.','H##########H','############','H##########H','.DDDDDDDDDD.','............'],
 pick:['.HHHHHHHHHH.','H###########','##........##','#H#......#H#','#.#......#.#','#.#......#.#','#.#HHHHHH#.#','#.#......#.#','#.#......#.#','#H#......#H#','############','DDDDDDDDDDDD'],
 osprey:['H....HH....H','#H..H##H..H#','H#H######H#H','#H########H#','H#A######A#H','#H########H#','H#H######H#H','#H..H##H..H#','H....HH....H','.....HH.....','....H##H....','.....DD.....'],
 sail:['..HHHHHHHH..','.H########H.','H###HHHH###H','###HHHHHH###','.H########H.','.....HH.....','....H##H....','...H#AA#H...','..H##AA##H..','...H#AA#H...','....H##H....','.....DD.....'],
 peak:['........HHH.','.........###','.........#A#','.........#A#','....HHH..#A#','...H###H.#A#','..H##AA###H.','..H#AAAA#H..','..H##AA##H..','...H####H...','....HHHH....','.....DD.....'],
 wheel:['.....HHHH...','...HH####HH.','..H########H','.H###AAAA###','H####AAAA###','H####AAAA##H','.H###AAAA##.','..H#######H.','.H#########H','H###########','#H#H#H#H#H#.','DDDDDDDDDDDD']
};
function artRows(id){return ART[id]||ART.star}
function cellsOf(id){const rows=artRows(id),out=[];for(let y=0;y<12;y++)for(let x=0;x<12;x++){const ch=rows[y][x];if(ch&&ch!=='.')out.push([x,y,ch])}return out}
const LOGO_CELLS=(()=>{const m={};for(const id of EMB)m[id]=cellsOf(id).map(([x,y])=>[x,y]);return m})();
function clamp(v){return Math.max(0,Math.min(255,v|0))}
function liftRGB(c,f){return c.map(v=>clamp(f>1?v+(255-v)*(f-1):v*f))}
function toHex(c){return '#'+c.map(v=>clamp(v).toString(16).padStart(2,'0')).join('')}
function markCols(t){
  const fill=best(t.h,[t.c1,t.c2,'#ffffff','#ffd23f','#141018']);
  let accent=best(t.h,[t.c2,t.c1,'#ffffff','#ffd23f','#141018']);
  if(accent===fill)accent=['#ffffff','#ffd23f','#141018','#e8eef8'].find(c=>c!==fill)||'#ffffff';
  const hi=toHex(liftRGB(hex(fill),1.62));
  const sh=toHex(liftRGB(hex(fill),0.45));
  const out=lum(t.h)>150?'#121016':'#f4f8fc';
  return {fill,accent,hi,sh,out};
}
function colOf(ch,mc){if(ch==='H')return hex(mc.hi);if(ch==='A')return hex(mc.accent);if(ch==='D')return hex(mc.sh);return hex(mc.fill)}
function pxHelm(t,ti,left){
  const c=document.createElement('canvas');c.width=SHELL_W;c.height=SHELL_H;const g=c.getContext('2d');
  const img=g.createImageData(SHELL_W,SHELL_H),d=img.data,shell=hex(t.h);
  const role=new Uint8Array(SHELL_W*SHELL_H);
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){
    const ch=GRID[y][x];if(ch==='.')continue;role[y*GW+x]=ch.charCodeAt(0);
    let r,gc,b;
    if(ch==='#'){r=gc=b=8}
    else if(ch==='V'){const glass=y>0&&'SH#'.includes(GRID[y-1][x]);r=gc=b=glass?62:16}
    else if(ch==='E'){r=gc=b=12}
    else if(ch==='m'){r=gc=b=20}
    else if(ch==='w'){r=gc=b=188}
    else{
      let k=0.62+(1-y/GH)*0.62+(1-x/GW)*0.1;
      const gx=(x-16)/13,gy=(y-5)/6,gl=Math.max(0,1-gx*gx-gy*gy);
      k+=gl*0.34;
      if(ch==='H')k=Math.max(k,1.58);
      if(y>GH-7)k*=0.8;
      r=shell[0]*k;gc=shell[1]*k;b=shell[2]*k;
    }
    const o=(y*GW+x)*4;d[o]=clamp(r);d[o+1]=clamp(gc);d[o+2]=clamp(b);d[o+3]=255;
  }
  stampMark(d,role,t,ti);
  g.putImageData(img,0,0);
  if(left){const f=document.createElement('canvas');f.width=SHELL_W;f.height=SHELL_H;const fg=f.getContext('2d');fg.imageSmoothingEnabled=false;fg.translate(SHELL_W,0);fg.scale(-1,1);fg.drawImage(c,0,0);return f}
  return c;
}
function relLum(c){return .3*c[0]+.59*c[1]+.11*c[2]}
function stampMark(d,role,t,ti){
  const rows=artRows(EMB[(ti|0)%EMB.length]);
  const mc=markCols(t),out=hex(mc.out),shell=hex(t.h),shellL=relLum(shell);
  const sc=2,ox=16,oy=4,W=SHELL_W;
  const shellAt=(x,y)=>x>=0&&y>=0&&x<W&&y<SHELL_H&&(role[y*W+x]===83||role[y*W+x]===72);
  const put=(x,y,c)=>{if(!shellAt(x,y))return;const o=(y*W+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255};
  const inkOf=(ch)=>{let c=colOf(ch,mc);if(Math.abs(relLum(c)-shellL)<46)c=hex(mc.fill);if(Math.abs(relLum(c)-shellL)<46)c=out;return c};
  const ink=[];
  for(let y=0;y<12;y++)for(let x=0;x<12;x++){
    if(!rows[y][x]||rows[y][x]==='.')continue;
    for(let py=0;py<sc;py++)for(let px=0;px<sc;px++){const X=ox+x*sc+px,Y=oy+y*sc+py;if(shellAt(X,Y))ink.push(Y*W+X)}
  }
  const seen=new Set(ink);
  for(const i of ink){const x=i%W,y=(i/W)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,j=yy*W+xx;if(seen.has(j)||!shellAt(xx,yy))continue;put(xx,yy,out)}}
  for(let y=0;y<12;y++)for(let x=0;x<12;x++){
    const ch=rows[y][x];if(!ch||ch==='.')continue;const c=inkOf(ch);
    for(let py=0;py<sc;py++)for(let px=0;px<sc;px++)put(ox+x*sc+px,oy+y*sc+py,c);
  }
}
const _helmCache=new Map();
function drawHelmet(g,x,y,size,t,left,ti){
  const key=(ti|0)+':'+(left?1:0)+':'+(t.h||'')+':'+(t.c1||'')+':'+(t.c2||'')+':v35shell';
  let src=_helmCache.get(key);if(!src){src=pxHelm(t,ti,!!left);_helmCache.set(key,src)}
  const s=Math.max(12,Math.round(size));
  const dw=s,dh=Math.round(s*SHELL_H/SHELL_W);
  g.save();g.imageSmoothingEnabled=false;
  g.globalAlpha=.28;g.fillStyle='#000';g.fillRect(Math.round(x-dw/2)+2,Math.round(y+dh*0.28)+2,dw,Math.max(2,dh*0.16|0));g.globalAlpha=1;
  g.drawImage(src,Math.round(x-dw/2),Math.round(y-dh*0.55),dw,dh);
  g.restore();
}
function drawLogo(g,x,y,size,ti,fill,stroke){
  const cells=cellsOf(EMB[(ti|0)%EMB.length]);const s=Math.max(1,Math.round(size/16));
  const cx=Math.round(x-6*s),cy=Math.round(y-6*s);
  g.save();g.imageSmoothingEnabled=false;
  const paint=(dx,dy,col)=>{g.fillStyle=col;g.fillRect(cx+dx*s,cy+dy*s,s,s)};
  if(stroke)cells.forEach(([dx,dy])=>{for(const[ox,oy]of[[-1,0],[1,0],[0,-1],[0,1]])paint(dx+ox,dy+oy,stroke)});
  cells.forEach(([dx,dy,ch])=>{const col=ch==='H'?mix(fill||'#fff',1.45):ch==='D'?mix(fill||'#fff',0.55):ch==='A'?mix(fill||'#fff',1.2):(fill||'#fff');paint(dx,dy,col)});
  g.restore();
}
function emblem(g,id,fill,stroke){drawLogo(g,0,0,40,(EMB.indexOf(id)+32)%32,fill,stroke)}
const GLY={};
function glyph(ti){
  const id=EMB[(ti|0)%EMB.length];if(GLY[id])return GLY[id];
  const rows=artRows(id),g=[];
  for(let gy=0;gy<4;gy++){const row=[];for(let gx=0;gx<4;gx++){let ink=0,acc=0;
    for(let y=gy*3;y<gy*3+3;y++)for(let x=gx*3;x<gx*3+3;x++){const ch=rows[y][x];if(ch&&ch!=='.'){ink++;if(ch==='A'||ch==='H')acc++}}
    row.push(ink>=4?(acc>ink/2?2:1):0)}g.push(row)}
  return GLY[id]=g;
}
function clearHelmCache(){_helmCache.clear()}
window.HELM={drawHelmet,drawLogo,emblem,EMB,MARK:LOGO_CELLS,ART,glyph,markCols,mix,clearHelmCache};
})();
