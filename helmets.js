// Original vector helmets and team emblems (no real-world marks).
(function(){
function hex(h){const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function mix(h,f){const[r,g,b]=hex(h);const m=v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)));return`rgb(${m(r)},${m(g)},${m(b)})`}
const EMB=['coyote','heron','raptor','yeti'];
// emblem in a ~40x40 box centered at 0,0
function emblem(g,id,fill,stroke){g.save();g.lineJoin='round';g.lineCap='round';g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=3;g.beginPath();
 if(id==='coyote'){ // howling coyote head, facing right
  g.moveTo(-14,16);g.lineTo(-12,-2);g.lineTo(-16,-18);g.lineTo(-6,-8);g.lineTo(-2,-19);g.lineTo(3,-7);g.lineTo(18,-4);g.lineTo(20,0);g.lineTo(8,3);g.lineTo(14,8);g.lineTo(2,9);g.lineTo(-2,16);g.closePath();g.stroke();g.fill();
  g.fillStyle=stroke;g.beginPath();g.arc(2,-3,1.8,0,7);g.fill();}
 else if(id==='heron'){ // heron head + S-neck, facing right
  g.moveTo(-10,18);g.bezierCurveTo(-16,6,-2,2,-6,-6);g.bezierCurveTo(-9,-14,-2,-19,4,-16);g.lineTo(21,-12);g.lineTo(5,-9);g.bezierCurveTo(2,-7,4,-2,4,2);g.bezierCurveTo(4,8,-6,10,-2,18);g.closePath();g.stroke();g.fill();
  g.beginPath();g.moveTo(-1,-17);g.lineTo(-12,-21);g.lineTo(-3,-14);g.stroke();g.fillStyle=stroke;g.beginPath();g.arc(1,-13,1.6,0,7);g.fill();}
 else if(id==='raptor'){ // three talons
  for(const[ox,s] of[[-10,1],[0,1.15],[10,1]]){g.beginPath();g.moveTo(ox-4,14);g.bezierCurveTo(ox-6,0,ox-2,-12*s,ox+6,-18*s);g.bezierCurveTo(ox+2,-8*s,ox+3,2,ox+4,14);g.closePath();g.stroke();g.fill()}
  g.beginPath();g.rect(-16,12,32,6);g.stroke();g.fill();}
 else { // yeti: snowflake star
  g.lineWidth=7;g.strokeStyle=stroke;for(let i=0;i<3;i++){g.save();g.rotate(i*Math.PI/3);g.beginPath();g.moveTo(0,-18);g.lineTo(0,18);g.stroke();g.restore()}
  g.lineWidth=3.5;g.strokeStyle=fill;for(let i=0;i<3;i++){g.save();g.rotate(i*Math.PI/3);g.beginPath();g.moveTo(0,-17);g.lineTo(0,17);g.moveTo(-5,-12);g.lineTo(0,-8);g.lineTo(5,-12);g.moveTo(-5,12);g.lineTo(0,8);g.lineTo(5,12);g.stroke();g.restore()}
  g.fillStyle=fill;g.beginPath();g.arc(0,0,4,0,7);g.fill();}
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
 g.save();g.translate(-13,-11);g.scale(.74,.74);emblem(g,EMB[ti%4],best(shell,[t.c1,t.c2,'#ffffff']),'rgba(15,15,25,.9)');g.restore();
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
