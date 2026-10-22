// Original vector helmets and team emblems (no real-world marks).
(function(){
function hex(h){const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function mix(h,f){const[r,g,b]=hex(h);const m=v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)));return`rgb(${m(r)},${m(g)},${m(b)})`}
const EMB=['hawk','wing','rook','horns','paw','claws','stripes','spike','lasso','horse','talons','gear','star','shoe','spots','crown','cutlass','bolt','ram','fin','axe','tricorn','halo','pillar','rocket','wings','anvil','pick','osprey','sail','peak','wheel'];
const OLD={coyote:'hawk',heron:'osprey',raptor:'talons',yeti:'gear'};
// emblem in a ~40x40 box centered at 0,0 (all original shapes)
function emblem(g,id,fill,stroke){id=OLD[id]||id;g.save();g.lineJoin='round';g.lineCap='round';g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=3;
 const P=pts=>{g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.stroke();g.fill()};
 const C=(x,y,r)=>{g.beginPath();g.arc(x,y,r,0,7);g.stroke();g.fill()};const dot=(x,y,r)=>{g.save();g.fillStyle=stroke;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.restore()};
 switch(id){
 case 'hawk':P([[-16,16],[-14,-4],[-6,-16],[8,-18],[20,-10],[22,-2],[12,-4],[16,4],[6,4],[0,12],[-4,18]]);dot(6,-9,2);g.beginPath();g.moveTo(-8,-12);g.lineTo(-18,-14);g.stroke();break;
 case 'osprey':P([[-14,18],[-12,-2],[-4,-14],[10,-16],[22,-8],[12,-6],[14,2],[4,2],[-2,18]]);g.save();g.strokeStyle=stroke;g.lineWidth=3.5;g.beginPath();g.moveTo(-6,-6);g.lineTo(14,-10);g.stroke();g.restore();dot(8,-10,1.8);break;
 case 'wing':g.beginPath();g.moveTo(-18,10);g.bezierCurveTo(-10,-18,14,-20,20,-14);g.lineTo(10,-8);g.lineTo(16,-4);g.lineTo(4,0);g.lineTo(10,4);g.lineTo(-2,8);g.lineTo(2,12);g.closePath();g.stroke();g.fill();break;
 case 'wings':g.beginPath();g.moveTo(0,8);g.bezierCurveTo(-8,-10,-20,-14,-22,-8);g.lineTo(-14,-2);g.lineTo(-18,4);g.lineTo(-8,6);g.closePath();g.moveTo(0,8);g.bezierCurveTo(8,-10,20,-14,22,-8);g.lineTo(14,-2);g.lineTo(18,4);g.lineTo(8,6);g.closePath();g.stroke();g.fill();C(0,4,4);break;
 case 'rook':P([[-12,18],[12,18],[10,10],[7,8],[7,-6],[11,-8],[11,-16],[6,-16],[6,-12],[2,-12],[2,-16],[-2,-16],[-2,-12],[-6,-12],[-6,-16],[-11,-16],[-11,-8],[-7,-6],[-7,8],[-10,10]]);break;
 case 'horns':g.lineWidth=3;g.beginPath();g.moveTo(-6,0);g.bezierCurveTo(-20,2,-22,-10,-16,-18);g.bezierCurveTo(-14,-10,-10,-8,-4,-8);g.closePath();g.moveTo(6,0);g.bezierCurveTo(20,2,22,-10,16,-18);g.bezierCurveTo(14,-10,10,-8,4,-8);g.closePath();g.stroke();g.fill();g.beginPath();g.ellipse(0,4,9,12,0,0,7);g.stroke();g.fill();dot(-3,2,1.5);dot(3,2,1.5);break;
 case 'paw':C(0,8,9);C(-11,-4,4.5);C(-4,-12,4.5);C(5,-12,4.5);C(12,-4,4.5);break;
 case 'claws':for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*9-6,16);g.quadraticCurveTo(i*9-4,-4,i*9+8,-18);g.quadraticCurveTo(i*9+2,-2,i*9+2,16);g.closePath();g.stroke();g.fill()}break;
 case 'stripes':g.beginPath();g.ellipse(0,0,18,18,0,0,7);g.stroke();g.fill();g.save();g.fillStyle=stroke;for(const[y,w] of[[-10,12],[-2,16],[6,12]]){g.beginPath();g.moveTo(-w,y-3);g.lineTo(w,y);g.lineTo(-w,y+3);g.closePath();g.fill()}g.restore();break;
 case 'spike':C(0,0,14);g.save();for(let i=0;i<8;i++){g.rotate(Math.PI/4);g.beginPath();g.moveTo(-4,-13);g.lineTo(0,-21);g.lineTo(4,-13);g.closePath();g.stroke();g.fill()}g.restore();g.save();g.fillStyle=stroke;g.font='900 16px Arial Black,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('B',0,1);g.restore();break;
 case 'lasso':g.lineWidth=6;g.strokeStyle=stroke;g.beginPath();g.ellipse(0,-4,15,10,0,0,7);g.stroke();g.beginPath();g.moveTo(8,4);g.quadraticCurveTo(4,14,14,20);g.stroke();g.lineWidth=3;g.strokeStyle=fill;g.beginPath();g.ellipse(0,-4,15,10,0,0,7);g.stroke();g.beginPath();g.moveTo(8,4);g.quadraticCurveTo(4,14,14,20);g.stroke();break;
 case 'horse':P([[-12,18],[-10,0],[-6,-12],[-2,-20],[0,-14],[10,-12],[20,-4],[18,2],[8,0],[4,6],[2,18]]);g.save();g.fillStyle=stroke;g.beginPath();g.moveTo(-6,-12);g.lineTo(-14,-4);g.lineTo(-12,6);g.lineTo(-8,-4);g.closePath();g.fill();g.restore();dot(6,-8,1.8);break;
 case 'talons':for(const[ox,s] of[[-10,1],[0,1.15],[10,1]]){g.beginPath();g.moveTo(ox-4,14);g.bezierCurveTo(ox-6,0,ox-2,-12*s,ox+6,-18*s);g.bezierCurveTo(ox+2,-8*s,ox+3,2,ox+4,14);g.closePath();g.stroke();g.fill()}g.beginPath();g.rect(-16,12,32,6);g.stroke();g.fill();break;
 case 'gear':g.beginPath();for(let i=0;i<20;i++){const a=i/20*Math.PI*2,r=i%2?13:19;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.stroke();g.fill();g.save();g.fillStyle=stroke;g.beginPath();g.arc(0,0,5,0,7);g.fill();g.restore();break;
 case 'star':g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?8:20;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.stroke();g.fill();break;
 case 'shoe':g.lineWidth=11;g.strokeStyle=stroke;g.beginPath();g.arc(0,-2,13,Math.PI*0.8,Math.PI*2.2);g.stroke();g.lineWidth=6;g.strokeStyle=fill;g.stroke();for(const a of[0.95,1.3,1.7,2.05]){dot(Math.cos(a*Math.PI)*13,-2+Math.sin(a*Math.PI)*13,1.3)}break;
 case 'spots':C(0,0,18);g.save();g.fillStyle=stroke;for(const[x,y,r] of[[-8,-8,3.5],[6,-10,3],[9,3,4],[-4,4,3],[-10,8,2.5],[2,12,3]]){g.beginPath();g.arc(x,y,r,0,7);g.fill()}g.restore();break;
 case 'crown':P([[-18,12],[18,12],[20,-12],[10,-2],[0,-18],[-10,-2],[-20,-12]]);g.beginPath();g.rect(-18,12,36,6);g.stroke();g.fill();dot(0,4,3);break;
 case 'cutlass':g.beginPath();g.moveTo(-14,16);g.lineTo(-10,12);g.quadraticCurveTo(6,2,16,-18);g.quadraticCurveTo(10,4,-6,16);g.closePath();g.stroke();g.fill();g.lineWidth=5;g.strokeStyle=stroke;g.beginPath();g.moveTo(-16,8);g.lineTo(-6,18);g.stroke();break;
 case 'bolt':P([[4,-20],[-12,2],[-1,2],[-6,20],[12,-4],[1,-4]]);break;
 case 'ram':g.lineWidth=8;g.strokeStyle=stroke;g.beginPath();g.arc(-2,0,13,-Math.PI*0.2,Math.PI*1.4);g.stroke();g.beginPath();g.arc(-2,0,6,Math.PI*1.4,Math.PI*2.7);g.stroke();g.lineWidth=4.5;g.strokeStyle=fill;g.beginPath();g.arc(-2,0,13,-Math.PI*0.2,Math.PI*1.4);g.stroke();g.beginPath();g.arc(-2,0,6,Math.PI*1.4,Math.PI*2.7);g.stroke();break;
 case 'fin':P([[-20,8],[-6,-4],[6,-18],[10,-6],[20,0],[10,6],[18,14],[4,10],[-6,12]]);dot(10,-1,1.8);break;
 case 'axe':g.lineWidth=5;g.strokeStyle=stroke;g.beginPath();g.moveTo(-12,18);g.lineTo(8,-16);g.stroke();g.lineWidth=3;P([[2,-12],[-10,-20],[-16,-8],[-6,-2]]);break;
 case 'tricorn':P([[-20,6],[-8,-14],[0,-8],[8,-14],[20,6],[0,12]]);dot(0,0,3);break;
 case 'halo':g.lineWidth=9;g.strokeStyle=stroke;g.beginPath();g.ellipse(0,-4,17,8,0,0,7);g.stroke();g.lineWidth=5;g.strokeStyle=fill;g.stroke();g.lineWidth=3;g.strokeStyle=stroke;g.beginPath();g.moveTo(0,4);g.lineTo(0,18);g.moveTo(-6,10);g.lineTo(6,10);g.stroke();break;
 case 'pillar':P([[-14,-16],[14,-16],[12,-12],[8,-12],[8,12],[12,12],[14,18],[-14,18],[-12,12],[-8,12],[-8,-12],[-12,-12]]);g.save();g.strokeStyle=stroke;g.lineWidth=2;for(const x of[-3,3]){g.beginPath();g.moveTo(x,-10);g.lineTo(x,10);g.stroke()}g.restore();break;
 case 'rocket':P([[0,-20],[7,-8],[7,8],[13,16],[5,14],[0,18],[-5,14],[-13,16],[-7,8],[-7,-8]]);dot(0,-4,3);break;
 case 'anvil':P([[-20,-8],[14,-8],[20,-14],[20,-6],[10,0],[6,8],[12,16],[-12,16],[-6,8],[-8,0],[-20,-2]]);break;
 case 'pick':g.lineWidth=5;g.strokeStyle=stroke;g.beginPath();g.moveTo(-10,18);g.lineTo(6,-10);g.stroke();g.lineWidth=3;g.beginPath();g.moveTo(-14,-10);g.quadraticCurveTo(4,-22,20,-4);g.quadraticCurveTo(6,-14,-14,-10);g.closePath();g.stroke();g.fill();break;
 case 'sail':P([[-2,-20],[-2,12],[-18,12]]);P([[2,-16],[18,10],[2,10]]);g.beginPath();g.moveTo(-20,14);g.lineTo(20,14);g.lineTo(14,20);g.lineTo(-14,20);g.closePath();g.stroke();g.fill();break;
 case 'peak':P([[-22,16],[-6,-14],[0,-4],[8,-18],[22,16]]);g.save();g.fillStyle=stroke;g.beginPath();g.moveTo(8,-18);g.lineTo(13,-9);g.lineTo(3,-9);g.closePath();g.fill();g.restore();break;
 case 'wheel':g.lineWidth=3;g.beginPath();g.arc(0,0,13,0,7);g.stroke();g.lineWidth=6;g.strokeStyle=stroke;for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(Math.cos(a)*4,Math.sin(a)*4);g.lineTo(Math.cos(a)*20,Math.sin(a)*20);g.stroke()}g.lineWidth=3;g.strokeStyle=fill;for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(Math.cos(a)*4,Math.sin(a)*4);g.lineTo(Math.cos(a)*19,Math.sin(a)*19);g.stroke()}g.strokeStyle=stroke;g.lineWidth=5;g.beginPath();g.arc(0,0,13,0,7);g.stroke();g.strokeStyle=fill;g.lineWidth=2.5;g.stroke();C(0,0,4);break;
 default:C(0,0,14);}
 g.restore()}
function lum(h){const[r,g,b]=hex(h);return .3*r+.59*g+.11*b}
function best(bg,cs){let b=cs[0],bd=-1;for(const c of cs){const d=Math.abs(lum(c)-lum(bg));if(d>bd){bd=d;b=c}}return b}
function shellPath(g){g.beginPath();g.moveTo(-36,24);g.bezierCurveTo(-50,4,-44,-40,-2,-44);g.bezierCurveTo(30,-46,46,-26,44,-6);g.lineTo(38,2);g.lineTo(31,4);g.bezierCurveTo(30,14,30,24,24,32);g.lineTo(6,33);g.bezierCurveTo(-4,32,-12,28,-18,27);g.closePath()}
// size = width in px of the full helmet incl. facemask; faces right unless left=true
function drawHelmet(g,x,y,size,t,left,ti){const k=size/104;g.save();g.translate(x,y);g.scale(left?-k:k,k);g.translate(-8,0);
 const shell=t.h,stripe=t.c1===t.h?t.c2:t.c1,trim=t.c2===stripe?'#ffffff':t.c2;
 // drop shadow
 g.save();g.translate(3,5);shellPath(g);g.fillStyle='rgba(0,0,0,.35)';g.fill();g.restore();
 // shell gradient
 shellPath(g);const gr=g.createRadialGradient(-14,-26,4,-2,-4,60);gr.addColorStop(0,mix(shell,1.35));gr.addColorStop(.45,shell);gr.addColorStop(1,mix(shell,.55));g.fillStyle=gr;g.fill();
 g.save();shellPath(g);g.clip();
 // stripe band over the crown with trims
 g.lineCap='butt';g.beginPath();g.moveTo(-36,22);g.bezierCurveTo(-46,-8,-30,-36,0,-37);g.bezierCurveTo(24,-38,36,-26,40,-12);g.lineWidth=12;g.strokeStyle=trim;g.stroke();g.lineWidth=6;g.strokeStyle=stripe;g.stroke();
 // jaw flare shading + rim shade
 const jg=g.createLinearGradient(0,6,0,34);jg.addColorStop(0,'rgba(0,0,0,0)');jg.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=jg;g.fillRect(-60,6,120,40);
 g.restore();
 shellPath(g);g.lineWidth=3;g.strokeStyle=mix(shell,.35);g.stroke();
 // back ridge / bumper
 g.beginPath();g.moveTo(-38,20);g.bezierCurveTo(-40,26,-34,30,-26,29);g.lineWidth=4;g.strokeStyle='rgba(20,20,30,.8)';g.stroke();
 // ear hole
 g.beginPath();g.arc(-4,8,6.5,0,7);g.fillStyle=mix(shell,.6);g.fill();g.beginPath();g.arc(-4,8,4,0,7);g.fillStyle='#14121c';g.fill();g.beginPath();g.arc(-5,7,1.4,0,7);g.fillStyle='rgba(255,255,255,.35)';g.fill();
 // decal
 g.save();g.translate(-13,-11);g.scale(.74,.74);emblem(g,EMB[(ti|0)%EMB.length],best(shell,[t.c1,t.c2,'#ffffff']),'rgba(15,15,25,.9)');g.restore();
 // specular highlight
 g.save();g.translate(-14,-30);g.rotate(-0.35);const sg=g.createRadialGradient(0,0,1,0,0,16);sg.addColorStop(0,'rgba(255,255,255,.85)');sg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sg;g.beginPath();g.ellipse(0,0,17,6,0,0,7);g.fill();g.restore();
 g.beginPath();g.ellipse(14,-34,5,2,0.4,0,7);g.fillStyle='rgba(255,255,255,.45)';g.fill();
 // chin strap
 g.beginPath();g.moveTo(14,30);g.quadraticCurveTo(30,40,44,36);g.lineWidth=3;g.strokeStyle='#e8e8ee';g.stroke();g.beginPath();g.ellipse(46,35,6,4,0,0,7);g.fillStyle='#f4f4f8';g.fill();g.lineWidth=1.5;g.strokeStyle='#777';g.stroke();
 // facemask with depth: dark under-stroke then light bar
 const bars=[[[38,-3],[50,-5],[60,-3]],[[34,9],[48,8],[61,9]],[[30,21],[46,23],[57,23]]];
 const draw=(w,c)=>{g.lineWidth=w;g.strokeStyle=c;g.lineCap='round';g.lineJoin='round';
  for(const b of bars){g.beginPath();g.moveTo(...b[0]);g.quadraticCurveTo(...b[1],...b[2]);g.stroke()}
  g.beginPath();g.moveTo(60,-5);g.bezierCurveTo(64,4,63,18,56,26);g.stroke();
  g.beginPath();g.moveTo(49,-4);g.lineTo(47,24);g.stroke()};
 draw(6.5,'rgba(15,15,25,.85)');draw(3.6,'#c9ced8');g.lineWidth=1.2;g.strokeStyle='rgba(255,255,255,.7)';for(const b of bars){g.beginPath();g.moveTo(b[0][0],b[0][1]-1);g.quadraticCurveTo(b[1][0],b[1][1]-1,b[2][0],b[2][1]-1);g.stroke()}
 // mask clip to shell
 g.fillStyle='#8f96a2';g.beginPath();g.ellipse(39,-3,3.5,3,0,0,7);g.ellipse(29,21,3.5,3,0,0,7);g.fill();
 g.restore()}
window.HELM={drawHelmet,emblem,EMB,mix};
})();
