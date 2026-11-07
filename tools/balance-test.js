// Fixed-seed balance checks for sideline QB runs, kick returns, CPU drives,
// and a pass/run viability sample. Run: node tools/balance-test.js
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const canvas={width:390,height:844,style:{},getContext(){return{imageSmoothingEnabled:false,clearRect(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},fillText(){},measureText(){return{width:0}}}},getBoundingClientRect(){return{width:390,height:844,left:0,top:0,height:844}},addEventListener(){}};
const g={};
g.window=g;g.globalThis=g;g.console=console;g.Math=Math;g.JSON=JSON;g.Set=Set;g.Map=Map;g.Object=Object;g.Array=Array;g.Number=Number;g.String=String;g.parseInt=parseInt;g.parseFloat=parseFloat;g.isNaN=isNaN;g.performance={now:()=>0};g.requestAnimationFrame=()=>0;g.addEventListener=()=>{};g.devicePixelRatio=1;g.navigator={};g.location={protocol:'http:',search:''};
g.document={getElementById:()=>canvas,createElement:()=>({style:{},appendChild(){},remove(){},getBoundingClientRect(){return{height:0}}}),body:{appendChild(){},removeChild(){}}};
g.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
vm.createContext(g);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8'),g,{filename:'game.js'});
const api=g.__api,G=g.G;
if(!api||!api.simCpuDrive){console.error('missing __api');process.exit(1)}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const prev=Math.random;Math.random=mulberry32(seed>>>0);try{return fn()}finally{Math.random=prev}}
const mean=a=>a.reduce((s,v)=>s+v,0)/(a.length||1);
const med=a=>{const b=[...a].sort((x,y)=>x-y);const i=b.length>>1;return b.length?(b.length%2?b[i]:(b[i-1]+b[i])/2):0};
const pct=a=>Math.round(mean(a)*1000)/10;
function fresh(diff){G.diff=diff;G.lvl=1;G.home=0;G.away=1;G.paused=false;G.two=false;G.season=false;G.career=false;G.clock=180;G.q=1;G.sh=0;G.sa=0;G.los=25;G.down=1;G.togo=10;G.read=0;G._rk=null;G.replay=null;G.stats={py:0,ry:0,td:0,int:0,sack:0};G.log=[];G.banner=null;G.hint=null}
function yardsOf(start){const td=!!(G.banner&&/TOUCHDOWN/.test(G.banner.t||''));if(td)return{y:100-start,td:1,kind:'td'};return{y:(G.los||start)-start,td:0,kind:(G.banner&&G.banner.t)||G.st}}
function keys(side,up){const K=api.KEYS;K.ArrowLeft=side<0?1:0;K.ArrowRight=side>0?1:0;K.ArrowUp=up?1:0;K.ArrowDown=0}
function clearKeys(){const K=api.KEYS;K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=0}
function qbRun(diff,side,seed){return withSeed(seed,()=>{fresh(diff);clearKeys();api.setupPlay(api.PLAYS[0]);api.snap();G.tuck=true;const y0=G.los;let n=0;while(G.st==='live'&&n<900){keys(n<28?side:side,1);api.update(1/60);n++}clearKeys();const r=yardsOf(y0);r.n=n;r.x=G.carrier?+G.carrier.x.toFixed(1):0;return r})}
function kickRet(diff,side,seed){return withSeed(seed,()=>{fresh(diff);clearKeys();api.startKickoff();let caught=null,n=0,drop=0;while(G.st==='live'&&n<1100){const air=G.ball&&!G.ball.caught;if(!air&&caught==null)caught=G.carrier?G.carrier.y:G.los;keys(air?0:side,1);api.update(1/60);n++;if(G.banner&&/DROPPED/.test(G.banner.t||''))drop=1}clearKeys();const end=G.banner&&/TOUCHDOWN/.test(G.banner.t||'')?100:(G.los||(caught||0));return{y:drop?0:end-(caught==null?0:caught),td:G.banner&&/TOUCHDOWN/.test(G.banner.t||'')?1:0,drop,caught:caught==null?null:+caught.toFixed(1),n}})}
function insideRun(diff,seed){return withSeed(seed,()=>{fresh(diff);clearKeys();api.setupPlay(api.PLAYS[3]);api.snap();const y0=G.los;let n=0;while(G.st==='live'&&n<700){keys(0,1);api.update(1/60);n++}clearKeys();return yardsOf(y0)})}
function calledRun(diff,seed){return withSeed(seed,()=>{fresh(diff);clearKeys();const kind=seed%3;api.setupPlay(api.PLAYS[kind===0?3:kind===1?5:4]);api.snap();if(api.PLAYS[kind===0?3:kind===1?5:4].t==='keep')G.tuck=true;const y0=G.los;let n=0;const side=kind===1?-1:kind===2?1:0;while(G.st==='live'&&n<700){if(kind===2&&n===36)api.IN.jk=1;keys(side,1);api.update(1/60);n++}clearKeys();return yardsOf(y0)})}
function passResult(t){const sack=/SACK/.test(t),inc=/INCOMPLETE|OUT OF BOUNDS|BROKEN|DROP|REACH/.test(t),pick=/INTERCEPT|PICK/.test(t);const comp=(/CAUGHT|TOUCHDOWN|\+/.test(t)||G.stats.py>0)&&!inc&&!pick&&!sack;return{comp:comp?1:0,sack:sack?1:0,inc:inc&&!pick?1:0,pick:pick?1:0,t}}
function quickPass(diff,seed){return withSeed(seed,()=>{fresh(diff);api.setupPlay(api.PLAYS[0]);api.snap();let n=0,threw=0;while(G.st==='live'&&n<700){api.IN.jx=0;api.IN.jy=0;if(!threw&&n>40){const w=G.players.find(p=>p.role==='WR');api.throwTo(w,false,'bullet');threw=1}api.update(1/60);n++}return passResult((G.banner&&G.banner.t)||'')})}
function variedPass(diff,seed){return withSeed(seed,()=>{fresh(diff);clearKeys();api.setupPlay(api.PLAYS[seed%3]);api.snap();const wait=32+(seed%7)*8;let n=0,threw=0;while(G.st==='live'&&n<760){if(!threw&&n>=wait){const ws=G.players.filter(p=>p.role==='WR'&&p.route!=='block');const w=ws[(seed>>2)%Math.max(1,ws.length)];if(w){const d=Math.hypot(w.x-G.qb.x,w.y-G.qb.y);api.throwTo(w,false,d<15?'bullet':d<28?'lob':'bomb')}threw=1}api.update(1/60);n++}clearKeys();return passResult((G.banner&&G.banner.t)||'')})}
function jukeScram(diff,seed){return withSeed(seed,()=>{fresh(diff);clearKeys();api.setupPlay(api.PLAYS[0]);api.snap();G.tuck=true;const y0=G.los,side=seed%2?1:-1;let n=0;while(G.st==='live'&&n<900){if(n===42)api.IN.jk=1;keys(n<42?side:-side,1);api.update(1/60);n++}clearKeys();const r=yardsOf(y0);return r})}
function jukeRet(diff,seed){return withSeed(seed,()=>{fresh(diff);clearKeys();api.startKickoff();let caught=null,n=0,since=0;while(G.st==='live'&&n<1100){const air=G.ball&&!G.ball.caught;if(!air&&caught==null)caught=G.carrier?G.carrier.y:G.los;if(!air)since++;if(since===28)api.IN.jk=1;keys(air?0:(since<28?0.2:1),1);api.update(1/60);n++}clearKeys();const td=G.banner&&/TOUCHDOWN/.test(G.banner.t||'');const end=td?100:(G.los||(caught||0));return{y:(caught==null?0:end-caught),td:td?1:0}}) }
function postThrow(seed){return withSeed(seed,()=>{fresh(1);api.setupPlay(api.PLAYS[0]);api.snap();let n=0;while(G.st==='live'&&n<30){api.update(1/60);n++}const w=G.players.find(p=>p.role==='WR');api.throwTo(w,false,'lob');for(let i=0;i<25&&G.st==='live';i++){if(G.qb){G.qb.x=0.3;G.qb.y=G.los-1}api.update(1/60)}const air=!!(G.ball&&!G.ball.caught)||!!G.pend;return{live:G.st==='live'&&air}})}
function lateral(seed){return withSeed(seed,()=>{fresh(1);clearKeys();api.setupPlay(api.PLAYS[0]);api.snap();G.tuck=true;const x0=G.qb.x;let back=0,prev=x0,n=0;while(n<70&&G.st==='live'){keys(1,0);api.update(1/60);if(G.qb.x<prev-0.08)back++;prev=G.qb.x;n++}clearKeys();return{gain:G.qb.x-x0,back,live:G.st==='live'}})}
function cpu(diff,seed){return withSeed(seed,()=>{fresh(diff);return api.simCpuDrive()})}
function sum(rows,key){return rows.map(r=>r[key]?1:0)}
const TIERS=['ROOKIE','PRO','ALL-PRO','LEGEND'];
const report={qb:{},ret:{},run:{},pass:{},cpu:{},keep:{},mix:{},vp:{},juke:{},jret:{}};
const NQB=24,NRET=16,NRUN=12,NPASS=12,NCPU=80,NMIX=18,NVP=36,NJ=16;
for(let d=0;d<4;d++){
 const L=[],R=[];
 for(let i=0;i<NQB;i++){L.push(qbRun(d,-1,1000+d*1000+i));R.push(qbRun(d,1,5000+d*1000+i))}
 const all=L.concat(R);
 report.qb[TIERS[d]]={n:all.length,perSide:NQB,left:{mean:+mean(L.map(r=>r.y)).toFixed(2),med:+med(L.map(r=>r.y)).toFixed(2),td:pct(L.map(r=>r.td))},right:{mean:+mean(R.map(r=>r.y)).toFixed(2),med:+med(R.map(r=>r.y)).toFixed(2),td:pct(R.map(r=>r.td))},mean:+mean(all.map(r=>r.y)).toFixed(2),td:pct(all.map(r=>r.td)),big:pct(all.map(r=>r.y>=12?1:0))};
 const S=[],E=[];
 for(let i=0;i<NRET;i++){S.push(kickRet(d,0,9000+d*500+i));E.push(kickRet(d,1,12000+d*500+i))}
 const kr=S.concat(E);
 report.ret[TIERS[d]]={n:kr.length,straight:{mean:+mean(S.map(r=>r.y)).toFixed(2),td:pct(S.map(r=>r.td)),drop:pct(S.map(r=>r.drop))},sideline:{mean:+mean(E.map(r=>r.y)).toFixed(2),td:pct(E.map(r=>r.td))},mean:+mean(kr.map(r=>r.y)).toFixed(2),td:pct(kr.map(r=>r.td)),long:kr.filter(r=>r.y>=20).length};
 const runs=[];for(let i=0;i<NRUN;i++)runs.push(insideRun(d,20000+d*100+i));
 report.run[TIERS[d]]={n:runs.length,mean:+mean(runs.map(r=>r.y)).toFixed(2),td:pct(runs.map(r=>r.td))};
 const ps=[];for(let i=0;i<NPASS;i++)ps.push(quickPass(d,30000+d*100+i));
 report.pass[TIERS[d]]={n:ps.length,comp:pct(ps.map(r=>r.comp)),sack:pct(ps.map(r=>r.sack)),inc:pct(ps.map(r=>r.inc)),pick:pct(ps.map(r=>r.pick))};
 const mix=[];for(let i=0;i<NMIX;i++)mix.push(calledRun(d,110000+d*200+i));
 report.mix[TIERS[d]]={n:mix.length,mean:+mean(mix.map(r=>r.y)).toFixed(2),med:+med(mix.map(r=>r.y)).toFixed(2),td:pct(mix.map(r=>r.td)),plus3:pct(mix.map(r=>r.y>=3?1:0))};
 const vp=[];for(let i=0;i<NVP;i++)vp.push(variedPass(d,150000+d*400+i));
 report.vp[TIERS[d]]={n:vp.length,comp:pct(vp.map(r=>r.comp)),sack:pct(vp.map(r=>r.sack)),inc:pct(vp.map(r=>r.inc)),pick:pct(vp.map(r=>r.pick))};
 const jk=[];for(let i=0;i<NJ;i++)jk.push(jukeScram(d,180000+d*300+i));
 report.juke[TIERS[d]]={n:jk.length,mean:+mean(jk.map(r=>r.y)).toFixed(2),td:pct(jk.map(r=>r.td)),big:pct(jk.map(r=>r.y>=10?1:0))};
 const jr=[];for(let i=0;i<NJ;i++)jr.push(jukeRet(d,210000+d*300+i));
 report.jret[TIERS[d]]={n:jr.length,mean:+mean(jr.map(r=>r.y)).toFixed(2),td:pct(jr.map(r=>r.td)),long:jr.filter(r=>r.y>=25).length};
 const cs=[];for(let i=0;i<NCPU;i++)cs.push(cpu(d,40000+i+d*1000));
 const kinds={};
 for(const c of cs)kinds[c.kind]=(kinds[c.kind]||0)+1;
 report.cpu[TIERS[d]]={n:cs.length,mean:+mean(cs.map(c=>c.pts)).toFixed(2),td:pct(cs.map(c=>c.pts===7?1:0)),fg:pct(cs.map(c=>c.pts===3?1:0)),punt:pct(cs.map(c=>c.kind==='punt'?1:0)),to:pct(cs.map(c=>c.kind==='int'||c.kind==='fum'?1:0)),secs:+mean(cs.map(c=>c.secs)).toFixed(1),kinds,bad:cs.filter(c=>![0,3,7].includes(c.pts)).length};
}
const keep=[];
for(let i=0;i<8;i++){const p=postThrow(70000+i),l=lateral(80000+i);keep.push({post:p.live,lat:l.gain,back:l.back})}
report.keep={postLive:keep.filter(k=>k.post).length+'/'+keep.length,latMean:+mean(keep.map(k=>k.lat)).toFixed(2),latBack:keep.reduce((s,k)=>s+k.back,0)};
const fails=[];
const qb=TIERS.map(t=>report.qb[t]);
// Slant Flood is left-heavy, so the open edge is the right. Neither edge may be a free TD, and rookie is the only tier that still breaks a long one.
for(const q of qb){if(+q.left.td>8||+q.right.td>8)fails.push('Sideline TD% '+q.left.td+'/'+q.right.td);if(+q.left.med>8||+q.right.med>8)fails.push('Sideline median still a free run '+q.left.med+'/'+q.right.med)}
if(+qb[3].mean>10)fails.push('Legend QB yards '+qb[3].mean);
if(+qb[0].mean+0.4<+qb[3].mean)fails.push('Legend sideline easier than rookie '+qb[0].mean+' vs '+qb[3].mean);
if(+qb[0].big<4)fails.push('Rookie has no real scramble gains');
if(+qb[3].big>+qb[0].big)fails.push('Legend breaks more long runs than rookie');
const rt=TIERS.map(t=>report.ret[t]);
if(!(+rt[0].mean>+rt[1].mean&&+rt[1].mean>+rt[2].mean&&+rt[2].mean>+rt[3].mean-0.5))fails.push('Return means not tiered '+rt.map(r=>r.mean).join('>'));
if(+rt[3].td>15)fails.push('Legend return TD% '+rt[3].td);
if(+rt[0].td>55)fails.push('Rookie return TD% '+rt[0].td);
if(+rt[0].mean<+rt[3].mean+6)fails.push('Return tier gap small');
if(rt[0].long<1)fails.push('Rookie never breaks a 20 yard return');
if(+rt[3].mean<4)fails.push('Legend returns auto-dead '+rt[3].mean);
const cpuR=TIERS.map(t=>report.cpu[t]);
if(!(+cpuR[0].mean<+cpuR[1].mean&&+cpuR[1].mean<+cpuR[2].mean&&+cpuR[2].mean<+cpuR[3].mean))fails.push('CPU points not tiered '+cpuR.map(c=>c.mean).join('<'));
if(+cpuR[0].mean<0.8||+cpuR[0].mean>2.3)fails.push('Rookie CPU ppd '+cpuR[0].mean);
if(+cpuR[1].mean<1.5||+cpuR[1].mean>3.0)fails.push('Pro CPU ppd '+cpuR[1].mean);
if(+cpuR[2].mean<2.2||+cpuR[2].mean>3.8)fails.push('All-Pro CPU ppd '+cpuR[2].mean);
if(+cpuR[3].mean<2.9||+cpuR[3].mean>4.8)fails.push('Legend CPU ppd '+cpuR[3].mean);
if(+cpuR[0].secs>120||+cpuR[3].secs>140)fails.push('CPU drive ate the quarter '+cpuR.map(c=>c.secs).join(','));
if(cpuR.some(c=>c.bad))fails.push('CPU scored something other than 0/3/7');
if(+cpuR[0].td>+cpuR[3].td)fails.push('Rookie CPU scores more TDs than Legend');
const run=TIERS.map(t=>report.run[t]);
if(+run[1].mean<0.4||+run[1].mean>16)fails.push('Pro inside run '+run[1].mean);
if(+run[1].td>40)fails.push('Pro inside run TD% '+run[1].td);
const pass=TIERS.map(t=>report.pass[t]);
if(+pass[1].comp<15||+pass[1].comp>90)fails.push('Pro completion '+pass[1].comp);
if(pass.some(p=>+p.sack>80))fails.push('A tier sacked almost every pass');
if(+pass[3].comp>+pass[0].comp+5)fails.push('Legend passes easier than rookie');
const vp=TIERS.map(t=>report.vp[t]);
if(+vp[0].comp<+vp[3].comp+8)fails.push('Varied pass tier flat '+vp.map(p=>p.comp).join(','));
if(+vp[3].comp>+vp[1].comp+1)fails.push('Legend completes more varied passes than Pro '+vp[3].comp+' vs '+vp[1].comp);
if(+vp[2].comp>+vp[0].comp)fails.push('All-Pro varied passes easier than Rookie');
const mix=TIERS.map(t=>report.mix[t]);
if(+mix[3].mean<1.2)fails.push('Legend called runs dead '+mix[3].mean);
if(+mix[0].plus3<15)fails.push('Rookie called runs never gain 3');
const jk=TIERS.map(t=>report.juke[t]);
if(+jk[0].mean<5)fails.push('Rookie cutback stuffed '+jk[0].mean);
if(+jk[0].big<5)fails.push('No rookie scramble breakaway');
const jr=TIERS.map(t=>report.jret[t]);
if(+jr[0].mean<=+jr[3].mean)fails.push('Cutback returns not tiered '+jr.map(x=>x.mean).join('>'));
if(jr[0].long<1)fails.push('Rookie cutback return never reaches 25');
if(report.keep.postLive!=='8/8')fails.push('Post-throw ended a live pass '+report.keep.postLive);
if(+report.keep.latMean<1.2)fails.push('Lateral stick froze in the OL '+report.keep.latMean);
if(report.keep.latBack>6)fails.push('Lateral stick jittered backward '+report.keep.latBack);
console.log(JSON.stringify(report,null,2));
if(fails.length){console.error('FAIL');fails.forEach(f=>console.error(' - '+f));process.exit(1)}
console.log('PASS');
