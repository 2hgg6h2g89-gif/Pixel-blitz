// Pixel Blitz helmets — classic line-drawing shell. Teams differ by color only.
(function(){
function hex(h){const n=parseInt(String(h).replace('#',''),16);return[n>>16&255,n>>8&255,n&255]}
function mix(h,f){const[r,g,b]=hex(h);const m=v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)));return`rgb(${m(r)},${m(g)},${m(b)})`}
function lum(h){const[r,g,b]=hex(h);return .3*r+.59*g+.11*b}
function best(bg,cs){let b=cs[0],bd=-1;for(const c of cs){const d=Math.abs(lum(c)-lum(bg));if(d>bd){bd=d;b=c}}return b}
const EMB=['hawk','wing','rook','horns','paw','claws','stripes','spike','lasso','horse','talons','gear','star','shoe','spots','crown','cutlass','bolt','ram','fin','axe','tricorn','halo','pillar','rocket','wings','anvil','pick','osprey','sail','peak','wheel'];
const ART={
hawk:['..######....','.##AAAA##...','#AA#AA#AA#..','#AA#AA#AA#..','#AAAAAAAA#..','.##AAAA##...','...####.....','...#AA#.....','...####.....','..#....#....','.##....##...','#........#..'],
wing:['.....AA.....','....AAAA....','...AAAAAA...','..AAAAAAAA..','..AAA##AAA..','...AA##AA...','....AAAA....','.....AA.....','.....##.....','....####....','...######...','....####....'],
rook:['......A#....','....AA##....','...AA#A#....','..AA#A.A#...','.AA#A...A#..','AA#A....A#..','AAAAAAAAA#..','.########...','############','.##########.','..########..','...######...'],
horns:['#..........#','##........##','A##......##A','.##A....A##.','..##A..A##..','...######...','..##AAAA##..','..##A..A##..','..##AAAA##..','...######...','..###..###..','.##......##.'],
paw:['......AAAA..','.....AAAAA..','....AAAAAA..','...AAAAAAAA.','..AAAAAAAAAA','.AAAAAAAAAA.','..AAAAAA....','...AAAAA....','....AAAA....','.....AAAA...','......AAA...','.......AA...'],
claws:['..AA....AA..','..AA.#..AA..','..AA.#..AA..','#####.#####.','#####.#####.','############','############','.##......##.','.##..AA..##.','.##..AA..##.','############','############'],
stripes:['A..A..A..A..','#A.#A.#A.#A.','############','.##########.','..A..A..A.A.','..########..','...######...','..########..','.##########.','############','..##....##..','.##########.'],
spike:['####........','#####.......','######..AA..','#######.AA..','########AA..','#########A..','##########..','.#########..','..########..','...#######..','....######..','.....#####..'],
lasso:['......AA....','.....AAAA...','....AAAAAA..','...AAA##AA..','..AAA####A..','.AAA######A.','AAA########A','############','.##########.','..########..','...######...','....####....'],
horse:['...AA...AA..','..AAAA.AAAA.','.AAAAA.AAAAA','AA###A.A###A','#####A.A####','.##########.','..########..','...######...','....####....','...######...','..########..','.##########.'],
talons:['..A....A....','A#A....A#A..','A########AA.','.A######A...','..A#AA#A....','..A#AA#A....','.A######A...','A########AA.','A#A....A#A..','..A....A....','...A..A.....','....AA......'],
gear:['......A.....','.....AAA....','....AAAAA...','...AAAAAAA..','..AAA#AAAA..','.AAAA#AAAAA.','AAAAA#AAAAAA','.AAAA#AAAA..','..AAA#AAA...','...AA#AA....','...####.....','..######....'],
star:['.....AA.....','....A##A....','...A#..#A...','..A#....#A..','.A########A.','...#....#...','..A#....#A..','.A########A.','...#....#...','...#....#...','..########..','.##########.'],
shoe:['.....AA.....','....AAAA....','...AA..AA...','..AA....AA..','.AA......AA.','#AA......AA.','##AA....AA..','###AA..AA...','####AAAA....','#####AA.....','####AA......','###AA.......'],
spots:['............','...AAA......','..AAAAA.....','..AAA..AAA..','.AAA....AAA.','##AA....AAA.','####AA...AA#','######AAAA##','.###########','..#########.','...#######..','....#####...'],
crown:['############','.#.#.#.#.#.#','############','............','AA........AA','AA..####..AA','AA..#AA#..AA','AA..#AA#..AA','AA..####..AA','AA........AA','############','.#.#.#.#.#.#'],
cutlass:['....AAAA....','...AAAAAA...','..AA.AA.AA..','..AA.AA.AA..','..AA....AA..','...AAAAAA...','....####....','....#AA#....','....####....','.....##.....','...######...','..########..'],
bolt:['.......AAA..','.....AAAAA..','...AAAA.AA..','.AAAA...AA..','AAA.....AA..','AA......AA..','A......AAA..','AA....AAA...','.AA..AAA....','..AAAAA.....','...AAA......','....A.......'],
ram:['.....AAA....','....AAAAA...','...AA##AA#..','..AAA##AAA#.','.AAAAAAAAA..','.AA.AAAA.AA.','.AAAAAAAAA..','.AAAAAAAAA..','..AAAAAAAA..','...AAAAAA...','....AAAA....','.....AA.....'],
fin:['......AA....','....AAAAA...','..AAA.AAAA..','.AAA...AAAA.','#AAA....AAA#','AAAA....AAAA','.AAA...AAAA.','..AAA.AAAA..','....AAAAA...','......AA....','.......A....','......AA....'],
axe:['...A....A...','..AAA..AAA..','.AAAAAAAAA..','############','AAAAAAAAAAAA','.AAAAAAAAA..','..AAAAAAAA..','...AAAAAA...','....AAAA....','.....AA.....','......A.....','............'],
tricorn:['.....AA.....','....AAAA....','...AA##AA...','..AA#..#AA..','.AA#....#AA.','AA#..##..#AA','A#..####..#A','....#AA#....','....#AA#....','...##AA##...','..###AA###..','...######...'],
halo:['.....AA.....','....AAAA....','...AAAAAA...','..AAA#AAA...','.AAAA#AAAA..','AAAAA#AAAAAA','....###.....','...#####....','..#######...','############','A.A.A.A.A.A.','.A...A...A..'],
pillar:['....AAAA....','...AAAAAA...','..########..','..#......#..','..#.AAAA.#..','..#.AAAA.#..','..#......#..','..#.AAAA.#..','..#.AAAA.#..','..#......#..','.##########.','############'],
rocket:['....AA......','...AAAA.....','..AA..AA....','.AA....AA...','AA..##..AA..','.AA.##.AA...','..AA##AA....','...AAAA.....','....##......','....##......','...####.....','..######....'],
wings:['....AAAA....','...AAAAAA...','..AAA..AAA..','.AAA....AAA.','..AAA..AAA..','...AAAAAA...','....A##A....','.....##.....','....####....','....####....','...######...','..########..'],
anvil:['..A......A..','.AAA....AAA.','AAAAA..AAAAA','############','#..######..#','#..........#','#..#....#..#','#..#....#..#','#..#....#..#','#..######..#','############','############'],
pick:['.##########.','.#........#.','.#...AA...#.','.#..AAAA..#.','.#.AA..AA.#.','.#.AA..AA.#.','.#.AA..AA.#.','.#.AA..AA.#.','.#.AA..AA.#.','.#.AA..AA.#.','############','############'],
osprey:['.....AAA....','....AAAAA...','...AA.A.AA..','..AA.AAA.AA.','..A.A.A.A.A.','A.A.AAA.A.AA','.A.A.A.A.A..','..A.AAA.A...','...A.A.A....','....AAA.....','.....A......','....AAA.....'],
sail:['...AAAAAAAA.','.AAAAAAAAAAA','AAAAAAAAAAAA','.AAA####AAA.','..AA#AA#AA..','...A#AA#A...','....#AA#....','.....#A#....','......##....','.....##.....','....##......','...##.......'],
peak:['......AAAA..','.....AAAAA..','......A.AA..','......A..A..','......A.....','......A.....','....AAA.....','...AAAAA....','..AAAAAAA...','...AAAAA....','....AAA.....','............'],
wheel:['.....AA.....','....AAAA....','...AAAAAA...','..AAA##AAA..','.AAA####AAA.','AAA######AAA','############','#..#....#..#','#..#....#..#','#..#....#..#','############','############']
};

function artRows(id){return ART[id]||ART.star}
function cellsOf(id){const rows=artRows(id),out=[];for(let y=0;y<12;y++)for(let x=0;x<12;x++){const ch=rows[y][x];if(ch&&ch!=='.')out.push([x,y,ch])}return out}
const LOGO_CELLS=(()=>{const m={};for(const id of EMB)m[id]=cellsOf(id).map(([x,y])=>[x,y]);return m})();
function liftRGB(c,f){return c.map(v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f))))}
function toHex(c){return '#'+c.map(v=>Math.max(0,Math.min(255,v|0)).toString(16).padStart(2,'0')).join('')}
function markCols(t){
  const fill=best(t.h,[t.c1,t.c2,'#ffffff','#ffd23f','#141018']);
  let accent=best(t.h,[t.c2,t.c1,'#ffffff','#ffd23f','#141018']);
  if(accent===fill){accent=['#ffffff','#ffd23f','#141018','#e8eef8'].find(c=>c!==fill)||'#ffffff'}
  const hi=toHex(liftRGB(hex(fill),1.55));
  const out=lum(t.h)>150?'#121016':'#f4f8fc';
  return {fill,accent,hi,out};
}
function emblem(g,id,fill,stroke){drawLogo(g,0,0,40,(EMB.indexOf(id)+32)%32,fill,stroke)}
function drawLogo(g,x,y,size,ti,fill,stroke){
  const cells=cellsOf(EMB[(ti|0)%EMB.length]);const s=Math.max(1,Math.round(size/16));
  const cx=Math.round(x-6*s),cy=Math.round(y-6*s);
  g.save();g.imageSmoothingEnabled=false;
  if(stroke){g.fillStyle=stroke;cells.forEach(([dx,dy])=>{for(const[ox,oy]of[[-1,0],[1,0],[0,-1],[0,1]])g.fillRect(cx+(dx+ox)*s,cy+(dy+oy)*s,s,s)})}
  cells.forEach(([dx,dy,ch])=>{g.fillStyle=ch==='A'?mix(fill||'#ffffff',1.35):(fill||'#fff');g.fillRect(cx+dx*s,cy+dy*s,s,s)});
  g.restore();
}
const GLY={};
function glyph(ti){
  const id=EMB[(ti|0)%EMB.length];if(GLY[id])return GLY[id];
  const rows=artRows(id),g=[];
  for(let gy=0;gy<4;gy++){const row=[];for(let gx=0;gx<4;gx++){let ink=0,acc=0;
    for(let y=gy*3;y<gy*3+3;y++)for(let x=gx*3;x<gx*3+3;x++){const ch=rows[y][x];if(ch==='#')ink++;else if(ch==='A')acc++}
    row.push((ink+acc)>=3?(acc>ink?2:1):0)}g.push(row)}
  return GLY[id]=g;
}

// Classic side-profile shell. Ids: 1 shell, 2 crown, 3 shade, 4 ear, 5 metal,
// 7 rivet ring, 8 rivet dot, 9 screw disk, 10 screw X, 11 ink outline.
const GW=32,GH=24,INK='#14161c',EAR='#101114',MET='#d5dbe3';
const MASTER=[
'................................',
'................................',
'................................',
'.........######.................',
'.......###HHHHH###..............',
'.....##############.....MMMMM...',
'....################..MMM..MMMM.',
'....################.MM..MM..MM.',
'...##################MM..MM..MM.',
'...##################MM..MM..MM.',
'...##################MMMMMMMMMM.',
'...##################MMMMMMMMMM.',
'...######EEEE########MM..MM..MM.',
'...######EEEE#####XOXMM..MM..MM.',
'...#####EEEEEE####OXOMMMMMMMMMM.',
'.########EEEE#####XO.MMMMMMMMMM.',
'#########EEEE#RRR###...MMMMMMM..',
'######RRR#####RDR##......MMM....',
'######RDR#####RRR...............',
'.SSSSSRR.SSSSSS.................',
'...SSS..........................',
'................................',
'................................',
'................................'
];
const ID={'.':0,'#':1,'H':2,'S':3,'E':4,'M':5,'R':7,'D':8,'O':9,'X':10};
function raster(){
  const g=new Uint8Array(GW*GH);
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++)g[y*GW+x]=ID[MASTER[y][x]]||0;
  return g;
}
let _base=null;
function baseGrid(){return _base||(_base=raster())}
const PRI=[0,10,40,30,100,50,0,70,80,60,90,0];
function downsample(src){
  const dw=GW>>1,dh=GH>>1,o=new Uint8Array(dw*dh);
  for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
    let best=0,bp=-1;
    for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
      const v=src[(y*2+dy)*GW+(x*2+dx)];
      const p=PRI[v]||0;if(p>bp){bp=p;best=v}
    }
    o[y*dw+x]=best;
  }
  return {g:o,w:dw,h:dh};
}
function outline(g,w,h){
  const at=(x,y)=>x<0||y<0||x>=w||y>=h?0:g[y*w+x];
  const metal=v=>v===5;
  const o=new Uint8Array(g);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(g[y*w+x])continue;
    let touch=false;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(at(x+dx,y+dy))touch=true;
    if(!touch)continue;
    let L=false,R=false,U=false,D=false;
    for(let k=1;k<=2;k++){if(metal(at(x-k,y)))L=true;if(metal(at(x+k,y)))R=true;if(metal(at(x,y-k)))U=true;if(metal(at(x,y+k)))D=true}
    if((L&&R)||(U&&D))continue;
    o[y*w+x]=11;
  }
  return o;
}
function prepare(half,sil){
  let g=baseGrid(),w=GW,h=GH;
  if(half){const d=downsample(g);g=d.g;w=d.w;h=d.h}
  if(sil){g=g.slice();for(let i=0;i<g.length;i++)if(g[i]===4)g[i]=0}
  return {g:outline(g,w,h),w,h};
}
function paint(t,ps,half,sil,color){
  const {g,w,h}=prepare(!!half,!!sil);
  const c=document.createElement('canvas');c.width=w*ps;c.height=h*ps;
  const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const shell=sil?color:(t&&t.h)||'#d9e3ef';
  const hi=sil?color:mix(shell,1.72);
  const sh=sil?color:mix(shell,0.58);
  const ink=sil?(lum(color)>150?'#14161c':'#f4f7f2'):INK;
  const col={1:shell,2:hi,3:sh,4:EAR,5:sil?color:MET,7:sil?color:'#e7ebf0',8:sil?ink:'#1a1c22',9:sil?color:MET,10:sil?ink:INK,11:ink};
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){
    const id=g[y*w+i];if(!id)continue;
    x.fillStyle=col[id]||shell;x.fillRect(i*ps,y*ps,ps,ps);
  }
  return c;
}
const _cache=new Map();
function sheet(t,ps,half,sil,color){
  const key=(sil?color:(t&&t.h)||'')+'|'+ps+'|'+(half?1:0)+'|'+(sil?1:0);
  let c=_cache.get(key);if(!c){c=paint(t,ps,half,sil,color);_cache.set(key,c)}
  return c;
}
function pick(size){
  if(size<28)return{ps:1,half:true,gw:16,gh:12};
  let ps=Math.max(1,Math.round(size/GW));
  if(ps>1&&ps*GW>size*1.12)ps--;
  return{ps,half:false,gw:GW,gh:GH};
}
function blit(g,c,x,y,dw,dh,left,anchor){
  const top=Math.round(y-dh*anchor),ox=Math.round(x-dw/2);
  g.save();g.imageSmoothingEnabled=false;
  g.globalAlpha=.22;g.fillStyle='#000';
  g.fillRect(ox+2,Math.round(y+dh*0.22)+2,dw,Math.max(2,(dh*0.14)|0));
  g.globalAlpha=1;
  g.translate(Math.round(x),0);if(left)g.scale(-1,1);
  g.drawImage(c,Math.round(-dw/2),top);
  g.restore();
}
function drawHelmet(g,x,y,size,t,left){
  const s=Math.max(12,size||32);
  const p=pick(s);
  const c=sheet(t,p.ps,p.half,false);
  blit(g,c,x,y,c.width,c.height,!!left,0.55);
}
function drawMark(g,x,y,size,color){
  const s=Math.max(16,size||64);
  let ps=Math.max(1,Math.round(s/GW));
  if(ps>1&&ps*GW>s*1.08)ps--;
  const c=sheet(null,ps,false,true,color||'#f4f7f2');
  g.save();g.imageSmoothingEnabled=false;
  g.drawImage(c,Math.round(x-c.width/2),Math.round(y-c.height/2));
  g.restore();
}
// On-field stamp. Shell center sits on cx; top row is y0. Same features as the big shell, few frames.
const STAMP={
  side:{ax:5,rows:[
    '..HHH........',
    '.H###HM......',
    'H##EE##MM....',
    'H#EEEE#XM....',
    'H##EE##MMM...',
    '.H#D#R#HMM...',
    '..H###HMM....',
    '...SSSS......']},
  front:{ax:4,rows:[
    '..HHHHH..',
    '.H#####H.',
    'H##MMM##H',
    'H#MMMMM#H',
    'H##MMM##H',
    '.H#MMM#H.',
    '..H###H..',
    '...SSS...']},
  back:{ax:4,rows:[
    '..HHHHH..',
    '.H#####H.',
    'H#######H',
    'H#######H',
    'H###H###H',
    '.H#####H.',
    '..HH#HH..',
    '...SSS...']},
  diag:{ax:4,rows:[
    '..HHHH....',
    '.H###HM...',
    'H##EE#MM..',
    'H#EEEE#XM.',
    'H##EE#MMM.',
    '.H#D#RHM..',
    '..H###M...',
    '...SS....']},
  diagB:{ax:4,rows:[
    '..HHHH..',
    '.H####H.',
    'H#####M.',
    'H####XM.',
    'H###HH..',
    '.H##H...',
    '..HHH...',
    '...S....']}
};
function stamp(g,cx,y0,view,t){
  const s=STAMP[view]||STAMP.front;
  const shell=(t&&t.h)||'#d9e3ef';
  const col={
    '#':shell,'H':mix(shell,1.7),'S':mix(shell,.58),
    'E':'#101114','D':'#1a1c22','X':'#1a1c22',
    'M':MET,'m':'#8e97a6','R':'#e7ebf0','O':MET
  };
  const ax=s.ax|0;
  for(let y=0;y<s.rows.length;y++){
    const row=s.rows[y];
    for(let i=0;i<row.length;i++){
      const ch=row[i];if(ch==='.'||!col[ch])continue;
      const px=Math.round(cx+(i-ax)),py=Math.round(y0+y);
      if(px<0||py<0||px>23||py>23)continue;
      g.fillStyle=col[ch];g.fillRect(px,py,1,1);
    }
  }
}
function clearHelmCache(){_cache.clear();_base=null}
function shell(t,left){return sheet(t,2,false,false)}
window.HELM={drawHelmet,shell,drawLogo,emblem,EMB,MARK:LOGO_CELLS,ART,glyph,markCols,mix,clearHelmCache,stamp,drawMark};
})();
