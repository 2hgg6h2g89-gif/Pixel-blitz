// Catch, interception, out of bounds, and a post-throw quarterback
// who cannot end the pass. Run: node tools/pass-fate-check.js
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const canvas={width:390,height:844,style:{},getContext(){return{imageSmoothingEnabled:false,clearRect(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},fillText(){},measureText(){return{width:0}}}},getBoundingClientRect(){return{width:390,height:844,left:0,top:0,height:844}},addEventListener(){}};
const g={};
g.window=g;g.globalThis=g;g.console=console;g.Math=Math;g.JSON=JSON;g.Set=Set;g.Map=Map;g.Object=Object;g.Array=Array;g.Number=Number;g.String=String;g.parseInt=parseInt;g.parseFloat=parseFloat;g.isNaN=isNaN;g.performance={now:()=>0};g.requestAnimationFrame=()=>0;g.addEventListener=()=>{};g.setTimeout=fn=>fn&&fn();g.devicePixelRatio=1;g.navigator={};g.location={protocol:'http:',search:''};
g.document={getElementById:()=>canvas,createElement:()=>({style:{},appendChild(){},remove(){},getBoundingClientRect(){return{height:0}}}),body:{appendChild(){},removeChild(){}}};
g.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
vm.createContext(g);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8'),g,{filename:'game.js'});
const api=g.__api,G=g.G,fail=[];
function check(ok,msg){if(!ok)fail.push(msg)}
function fresh(){G.diff=1;G.home=0;G.away=1;G.paused=false;G.two=false;G.season=false;G.los=25;G.sh=0;G.sa=0;G.q=1;G.clock=180;G.banner=null;G.celeb=false;G.wx={k:'clear',s:0,x:0,y:0}}
function arm(tx,ty){
 fresh();api.setupPlay(api.PLAYS[0]);api.snap();
 const w=G.players.find(p=>p.role==='WR');
 w.x=tx;w.y=ty;w.vx=0;w.vy=0;
 const T=0.4;
 G.thrown=true;G.passer=true;G.pend=null;G.ball={x0:G.qb.x,y0:G.qb.y,x:G.qb.x,y:G.qb.y,tx,ty,t:T-1/60,T,h:2,tt:'lob',tgt:w,caught:false,z:0.2,h0:1.6,noTip:true};
 return w}
const rnd=Math.random;
Math.random=()=>0.99;
const w=arm(30,40);
G.players.forEach(p=>{if(p.team){p.x=2;p.y=2}});
api.update(1/60);
check(G.ball&&G.ball.caught&&G.carrier===w,'catch did not stick '+G.st+' '+(G.banner&&G.banner.t));
check(G.sh===0,'catch added points');
Math.random=()=>0;
fresh();api.setupPlay(api.PLAYS[0]);api.snap();
const wr=G.players.find(p=>p.role==='WR'),db=G.players.find(p=>p.team===1);
wr.x=40;wr.y=50;db.x=28;db.y=36;db.fallen=0;
 G.thrown=true;G.pend=null;G.ball={x0:G.qb.x,y0:G.qb.y,x:27.5,y:35.5,tx:28,ty:36,t:0.39,T:0.4,h:1,tt:'bullet',tgt:wr,caught:false,z:0.2,h0:1.6,noTip:true};
api.update(1/60);
check(/INTERCEPT/.test((G.banner&&G.banner.t)||'')||G.stats.int===1,'expected a pick '+(G.banner&&G.banner.t));
check(G.sh===0,'pick added points');
Math.random=rnd;
fresh();api.setupPlay(api.PLAYS[0]);api.snap();
G.lastAim={tx:0.1,ty:60,lock:null,ty2:'lob',ok:false};G.relAim=true;
api.update(1/60);
const spot=G.pend?G.pend.tx:(G.ball?G.ball.tx:null);
check(spot!=null&&spot>=1.5&&spot<=53.3-1.5,'sideline aim was not clamped '+spot);
const miss=arm(18,55);
G.players.forEach(p=>{if(p.team===0&&p!==G.qb){p.x=40;p.y=70;p.fallen=2}});
api.update(1/60);
check(G.st==='result'&&!(G.ball&&G.ball.caught),'wide throw was caught '+G.st+' '+(G.banner&&G.banner.t));
fresh();api.setupPlay(api.PLAYS[0]);api.snap();
const rec=G.players.find(p=>p.role==='WR');
api.throwTo(rec,false,'lob');
for(let i=0;i<40&&G.st==='live';i++){if(G.ball&&!G.ball.caught){G.qb.x=0.3;G.qb.y=G.los-1}api.update(1/60)}
check(G.st==='live'||(G.ball&&G.ball.caught)||/CATCH|INCOMPLETE|INTERCEPT|OUT/.test((G.banner&&G.banner.t)||''),'post-throw QB ended the pass '+G.st+' '+(G.banner&&G.banner.t));
check(!(G.banner&&/SACK|TACKLE/.test(G.banner.t||'')),'post-throw became a tackle '+(G.banner&&G.banner.t));
if(fail.length){console.error('FAIL');fail.forEach(f=>console.error(' - '+f));process.exit(1)}
console.log('PASS');
