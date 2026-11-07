// Phone fit, upward-drag aim, sky clamp, and the same projection for the
// landing spot. Run from a machine with puppeteer-core:
//   node tools/frame-aim-check.js
'use strict';
const puppeteer=require('puppeteer-core');
const OUT=process.env.PB_OUT||'/opt/cursor/artifacts';
const fail=[];
function check(ok,msg){if(!ok)fail.push(msg);else console.log('ok',msg)}
(async()=>{
  const browser=await puppeteer.connect({browserURL:process.env.PB_BROWSER||'http://127.0.0.1:9222',defaultViewport:null});
  const cases=[[393,852,59,34,'after_iphone16_safe'],[360,740,47,24,'after_small_safe']];
  for(const [w,h,top,bot,name] of cases){
    const page=await browser.newPage();
    await page.setViewport({width:w,height:h,deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await page.setCacheEnabled(false);
    page.on('pageerror',e=>fail.push(name+' '+e.message));
    await page.goto('http://127.0.0.1:8765/index.html?'+name,{waitUntil:'networkidle0',timeout:30000});
    await page.evaluate(async()=>{const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))});
    await page.reload({waitUntil:'networkidle0'});
    await page.waitForFunction(()=>window.groundAt&&window.R3D);
    await page.evaluate((t,b)=>{window.__safeTop=t;window.__safeBottom=b;window.__hold=true},top,bot);
    const box=await page.evaluate(()=>{const r=document.getElementById('wrap').getBoundingClientRect();return{l:r.left,r:r.right,t:r.top,b:r.bottom}});
    check(box.l<3&&box.r>w-3&&box.t<3&&box.b>h-3,name+' fills the screen '+JSON.stringify(box));
    const frame=await page.evaluate(()=>{
      const api=window.__api,G=window.G;
      G.home=0;G.away=5;api.wxApply({k:'clear',s:0,x:0,y:0});
      api.setupPlay(api.PLAYS[0]);G.st='presnap';window.R3D();
      const q=G.qb,head=PROJ(q.x,q.y,2.05),feet=PROJ(q.x,q.y,0.05);
      const wrs=G.players.filter(p=>p.role==='WR').map(p=>PROJ(p.x,p.y,1.6)[0]);
      const up=groundAt(head[0],Math.max(30,head[1]-160));
      const sky=groundAt(head[0],12);
      const left=G.players.find(p=>p.role==='WR');
      left.x=4;window.R3D();
      const backL=groundAt.apply?null:null;
      const pL=PROJ(4,q.y+12,0.05),gL=groundAt(pL[0],pL[1]);
      const pR=PROJ(48,q.y+12,0.05),gR=groundAt(pR[0],pR[1]);
      return {head,feet,wrs,up,sky,gL,gR,qb:q.y,top:safeTop(),bot:safeBottom()};
    });
    const dragged=await page.evaluate(()=>{
      const G=window.G,api=window.__api;
      api.snap();
      const c=document.getElementById('c'),r=c.getBoundingClientRect();
      const ev=(type,x,y)=>c.dispatchEvent(new MouseEvent(type,{clientX:r.left+x/390*r.width,clientY:r.top+y/844*r.height,bubbles:true,button:0}));
      const base=PROJ(G.qb.x,G.qb.y,0.4);
      ev('mousedown',base[0],base[1]);
      ev('mousemove',base[0],Math.max(20,base[1]-180));
      api.update(1/60);
      const up=G.aim&&{tx:+G.aim.tx.toFixed(1),ty:+G.aim.ty.toFixed(1),ty2:G.aim.ty2};
      ev('mousemove',base[0],8);
      api.update(1/60);
      const sky=G.aim&&{tx:+G.aim.tx.toFixed(1),ty:+G.aim.ty.toFixed(1)};
      ev('mouseup',base[0],8);
      return {up,sky,qb:+G.qb.y.toFixed(1)};
    });
    check(dragged.up&&dragged.up.ty>dragged.qb+4,name+' upward screen point is downfield '+JSON.stringify(dragged.up));
    check(dragged.sky&&dragged.sky.ty>dragged.qb+15,name+' sky drag clamps to a deep spot '+JSON.stringify(dragged.sky));
    check(frame.gL&&Math.abs(frame.gL.x-4)<2.5&&frame.gR&&Math.abs(frame.gR.x-48)<2.5,name+' sideline round-trip '+JSON.stringify({gL:frame.gL,gR:frame.gR}));
    const topLim=frame.top+70,botLim=844-frame.bot-150;
    check(frame.head[1]>topLim&&frame.feet[1]<botLim&&frame.feet[1]>frame.head[1],name+' QB in the safe band '+frame.head[1]+' '+frame.feet[1]);
    check(frame.wrs.every(x=>x>-20&&x<410),name+' receivers near the screen '+frame.wrs.join(','));
    await page.screenshot({path:OUT+'/'+name+'.png'});
    if(name==='after_iphone16_safe'){
      await page.evaluate(()=>{
        const api=window.__api,G=window.G;
        api.startKickoff();for(let i=0;i<20;i++){api.update(1/60);window.R3D()}
      });
      const ko=await page.evaluate(()=>{const c=G.carrier;return {head:PROJ(c.x,c.y,2).map(n=>n|0),feet:PROJ(c.x,c.y,0.05).map(n=>n|0),st:G.st}});
      check(ko.feet[1]>ko.head[1]&&ko.feet[1]<844-frame.bot-120&&ko.head[1]>frame.top+30, 'kickoff returner in band '+JSON.stringify(ko));
      await page.screenshot({path:OUT+'/after_kickoff_phone.png'});
      await page.evaluate(()=>{window.startFG(false);for(let i=0;i<8;i++)window.R3D()});
      const fg=await page.evaluate(()=>{const b=G.fgBall;const p=PROJ(b.x,b.y,1);return {p:p.map(n=>n|0),st:G.st}});
      check(fg.p[0]>0&&fg.p[0]<390&&fg.p[1]>frame.top&&fg.p[1]<844-frame.bot,'FG ball in the safe picture '+JSON.stringify(fg));
      await page.screenshot({path:OUT+'/after_fg_phone.png'});
    }
    await page.close();
  }
  const page=await browser.newPage();
  await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8765/index.html?throw=1',{waitUntil:'networkidle0'});
  await page.evaluate(async()=>{const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))});
  await page.reload({waitUntil:'networkidle0'});
  await page.waitForFunction(()=>window.groundAt);
  await page.evaluate(()=>{window.__hold=true;window.__safeTop=0;window.__safeBottom=0});
  const rec=await page.screencast({path:OUT+'/after_throw_demo.webm',fps:12});
  const thrown=await page.evaluate(async()=>{
    const api=window.__api,G=window.G;
    G.home=0;G.away=5;api.setupPlay(api.PLAYS[0]);api.snap();window.R3D();
    const c=document.getElementById('c'),r=c.getBoundingClientRect();
    const ev=(type,x,y)=>c.dispatchEvent(new MouseEvent(type,{clientX:r.left+x/390*r.width,clientY:r.top+y/844*r.height,bubbles:true,button:0}));
    ev('mousedown',300,500);
    for(let i=0;i<6;i++){ev('mousemove',300,500-i*40);api.update(1/60);window.R3D();await new Promise(s=>setTimeout(s,30))}
    const aim=G.aim&&{ty:+G.aim.ty.toFixed(1),tx:+G.aim.tx.toFixed(1),ty2:G.aim.ty2};
    const qbY=G.qb.y;
    ev('mouseup',300,260);
    let flight=false;
    for(let i=0;i<25;i++){api.update(1/60);window.R3D();if(G.ball&&!G.ball.caught&&G.ball.t>0.08)flight=true;await new Promise(s=>setTimeout(s,30))}
    const arc=G.ball?PROJ(G.ball.x,G.ball.y,G.ball.z+1):null;
    const spot=G.ball?groundAt(PROJ(G.ball.tx,G.ball.ty,0.05)[0],PROJ(G.ball.tx,G.ball.ty,0.05)[1]):null;
    return {aim,qbY:+qbY.toFixed(1),flight,st:G.st,spot,arc};
  });
  await rec.stop();
  check(thrown.aim&&thrown.aim.ty>thrown.qbY+4,'drag up aims forward '+JSON.stringify(thrown.aim));
  check(thrown.flight&&thrown.st==='live','ball is in flight and the play is live');
  const replay=await page.evaluate(()=>{const G=window.G;G.st='replay';window.R3D();const c=G.carrier;return {head:PROJ(c.x,c.y,2.05).map(n=>n|0),feet:PROJ(c.x,c.y,0.05).map(n=>n|0)};});
  check(replay.feet[1]>replay.head[1]&&replay.feet[1]<700&&replay.head[1]>80,'replay carrier in band '+JSON.stringify(replay));
  check(thrown.spot&&Math.abs(thrown.spot.x-thrown.aim.tx)<5&&Math.abs(thrown.spot.y-thrown.aim.ty)<4,'landing spot uses the same projection '+JSON.stringify(thrown.spot));
  await page.screenshot({path:OUT+'/after_throw_flight_phone.png'});
  await page.evaluate(()=>{
    const G=window.G,p=G.carrier||G.qb;
    const X=p.x-26.65,Z=-p.y;
    window.__camOv={p:[X+1.5,2.1,Z-3.3],l:[X,1.15,Z]};
    window.R3D();
  });
  await page.screenshot({path:OUT+'/after_body_close_phone.png'});
  await page.close();
  await browser.disconnect();
  if(fail.length){console.error('FAIL');fail.forEach(f=>console.error(' - '+f));process.exit(1)}
  console.log('PASS');
})().catch(e=>{console.error(e);process.exit(1)});
