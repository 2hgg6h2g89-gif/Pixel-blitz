// Weather resume, one touchdown, replay skip, PAT handoff, and front-office screens.
// Run: node tools/flow-check.js
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const canvas={width:390,height:844,style:{},getContext(){return{imageSmoothingEnabled:false,clearRect(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},fillText(){},measureText(){return{width:0}},roundRect(){},ellipse(){},createLinearGradient(){return{addColorStop(){}}},fillStyle:'',strokeStyle:'',font:''}},getBoundingClientRect(){return{width:390,height:844,left:0,top:0,height:844}},addEventListener(){}};
const g={};
g.window=g;g.globalThis=g;g.console=console;g.Math=Math;g.JSON=JSON;g.Set=Set;g.Map=Map;g.Object=Object;g.Array=Array;g.Number=Number;g.String=String;g.parseInt=parseInt;g.parseFloat=parseFloat;g.isNaN=isNaN;g.performance={now:()=>0};g.requestAnimationFrame=()=>0;g.addEventListener=()=>{};g.devicePixelRatio=1;g.navigator={};g.location={protocol:'http:',search:''};g.setTimeout=fn=>fn&&fn();g.clearTimeout=()=>{};
const store={};
g.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
g.document={getElementById:id=>id==='coachIn'?{value:'COACH',style:{}}:canvas,createElement:()=>({style:{},appendChild(){},remove(){},getBoundingClientRect(){return{height:0}}}),body:{appendChild(){},removeChild(){}}};
vm.createContext(g);
function load(f){vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),g,{filename:f})}
load('game.js');load('season.js');load('career.js');load('fg.js');
const api=g.__api,G=g.G,fail=[];
function check(ok,msg){if(!ok)fail.push(msg)}
function fresh(){G.diff=1;G.lvl=1;G.home=0;G.away=1;G.paused=false;G.two=false;G.season=true;G.career=false;G.clock=180;G.q=2;G.sh=0;G.sa=0;G.los=25;G.down=1;G.togo=10;G.banner=null;G.hint=null;G.celeb=false;G.fg=null;G.replay=null}
g.__season.newSeason(0,1,false);
fresh();
api.wxApply({k:'rain',s:5,x:1.2,y:-0.3});
G.sh=7;G.sa=3;G.q=2;G.clock=44;G.los=40;
api.saveMid();
const saved=api.loadMid(false);
check(saved&&saved.wx&&saved.wx.k==='rain'&&saved.wx.s===5,'rain mid save '+JSON.stringify(saved&&saved.wx));
check(saved.sh===7&&saved.q===2,'saved score/quarter');
const old=JSON.parse(JSON.stringify(saved));delete old.wx;
api.wxApply({k:'snow',s:4,x:2,y:1});
api.resumeMid(old);
check(G.wx&&G.wx.k==='clear'&&G.wx.s===0,'old save resumed '+JSON.stringify(G.wx));
api.wxApply({k:'wind',s:8,x:3,y:1});
G.season=true;G.q=3;G.sh=10;G.sa=7;G.clock=20;
api.saveMid();
const again=api.loadMid(false);
api.wxApply({k:'clear',s:0,x:0,y:0});
api.resumeMid(again);
check(G.wx&&G.wx.k==='wind'&&G.wx.s===8&&G.q===3&&G.sh===10,'resume kept wind and score '+JSON.stringify({k:G.wx&&G.wx.k,s:G.wx&&G.wx.s,q:G.q,sh:G.sh}));
fresh();
api.wxApply({k:'clear',s:0,x:0,y:0});
api.setupPlay(api.PLAYS[4]||api.PLAYS[0]);
api.snap();
G.tuck=true;
G.players.forEach(p=>{if(p.team)p.fallen=3});
G.carrier.y=99.2;G.carrier.vy=12;G.carrier.x=26;
let n=0;while(G.st==='live'&&n<30){api.update(1/60);n++}
check(G.sh===6&&G.stats.td===1&&G.celeb===true,'TD scored once '+G.sh+' td '+G.stats.td+' celeb '+G.celeb+' st '+G.st);
const sh=G.sh;
n=0;while((G.st==='result'||G.st==='replay')&&n<400){g.update(1/60);if(G.st==='replay'){api.IN.keyp.push(' ');g.update(1/60)}n++}
check(G.sh===sh,'score changed across replay/result '+G.sh);
check(G.st==='patpick','did not reach PAT '+G.st+' next '+G.next);
api.IN.taps.push([40,844-140]);
g.update(1/60);
check(G.st==='fg'&&G.fg&&G.fg.pat===true,'PAT did not open '+G.st);
check(G.sh===6,'PAT choice added points '+G.sh);
const C0=g.__career;
C0.init(0,1,'COACH');
const before=C0.get().rosters[0].length;
const W=390,y0=612,h=52,gap=8,bw=(W-32-gap)/2;
function nav(col,row){C0.tap([16+col*(bw+gap)+8,y0+row*(h+8)+8]);return G.st}
check(nav(0,1)==='ccontract','contracts '+G.st);
C0.tap([20,50]);
check(G.st==='chub','back from contracts '+G.st);
check(nav(1,1)==='cfa','free agents '+G.st);
C0.tap([20,50]);
check(nav(0,2)==='ctrade','trades '+G.st);
C0.tap([20,50]);
check(nav(1,0)==='cscout'||G.st==='cdraft','draft entry '+G.st);
check(C0.get().rosters[0].length===before,'roster changed just by opening screens '+before+' -> '+C0.get().rosters[0].length);
const exp=C0.get().rosters[0].filter(p=>(p.yLeft|0)<=1).length;
check(exp>=0,'expiring count');
if(fail.length){console.error('FAIL');fail.forEach(f=>console.error(' - '+f));process.exit(1)}
console.log(JSON.stringify({wx:'rain save, old clear, wind resume',td:sh,after:'patpick then fg',roster:before,expiring:exp,screens:'contracts fa trades draft'}));
console.log('PASS');
