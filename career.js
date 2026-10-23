// PIXEL BLITZ v27: Career Mode — coach, draft, contracts, FA, trades (original IP)
(function(){
const CKEY='pb_career';
const CAP=280; // salary cap units
const POS=['QB','RB','WR','TE','OL','DL','LB','CB','S','K'];
const DEPTH={QB:1,RB:2,WR:3,TE:1,OL:5,DL:4,LB:3,CB:2,S:2,K:1};
const FIRST=['Axton','Keiran','Dorian','Zayden','Corven','Brantley','Nolan','Tavian','Merrick','Jalen','Kellan','Rylan','Cormac','Brevin','Daxen','Torin','Kade','Soren','Jace','Varek','Ellis','Ronan','Beckett','Silas','Tavon','Bryce','Camden','Marcus','Rhett','Quincy','Devin','Lennox','Malik','Corbin','Orion','Kai','Luca','Ezra','Milo','Asher','Finn','Rowan','Callum','Felix','Hugo','Jasper','Levi','Nico','Owen','Pax','Reid','Seth','Theo','Wilder','Yale','Zane','Arlo','Bodhi','Cruz','Drake','Elias','Ford','Gage','Hayes','Ivan','Jed','Knox','Lane','Mack','Nash','Otto','Pierce','Quinn','Remy','Shaw','Tate','Vance','Wade','Xander','York','Zeke','Alden','Brooks','Cade','Dane','Everett','Flynn','Greyson','Holden','Isaiah','Jonah','Kieran','Landon','Miles','Noel','Parker','Quade'];
const LAST=['Redvale','Solis','Mesa','Flint','Saguaro','Cinder','Crest','Rook','Stone','Arroyo','Voss','Ember','Vale','Slate','Ridge','Ash','Marlow','Pike','Calder','Dunn','Quill','West','Wynn','Hartwell','Mercer','Hollis','Bellamy','Banks','Pryce','Ellery','Whitlock','Calloway','Maddox','Ashford','Carr','Stroud','Hale','Keene','Locke','Briar','Colton','Dray','Ellison','Farley','Grant','Holt','Jett','Kemp','Larsen','Monroe','Ormond','Pruitt','Ransom','Sable','Thorne','Underwood','Wexley','Yorke','Aldridge','Beckett','Carver','Dalton','Eastman','Frost','Gable','Hawke','Jensen','Kingsley','Lang','Morrow','North','Oakley','Quade','Sawyer','Trent','Upton','Vaughn','Wilder','Yates','Ziegler','Barrett','Cross','Drake','Ellis','Ford','Gage'];
let C=null; // career save
let ui={tab:0,sel:0,scroll:0,pick:null,offer:null,msg:'',msgT:0};

function rnd(a,b){return a+Math.random()*(b-a)}
function ri(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function name(){return FIRST[ri(0,FIRST.length-1)]+' '+LAST[ri(0,LAST.length-1)]}
function salFor(ovr,yrs){return Math.max(1,Math.round((ovr-60)*0.25+(ovr>88?4:ovr>82?1.5:0)))}
function pid(){return 'p'+Math.random().toString(36).slice(2,9)}

function mkPlayer(pos,ovr,age){
  ovr=Math.round(ovr);age=age||ri(21,28);
  const yrs=ri(1,4);const sal=Math.max(1,Math.round((ovr-60)*0.25+(ovr>88?4:ovr>82?1.5:0)));
  return{id:pid(),nm:name(),pos,ovr,age,yrs,sal,yLeft:yrs}
}
function blankRoster(teamOvr){
  const R=[];
  for(const pos of POS){const n=DEPTH[pos];for(let i=0;i<n;i++){
    const base=teamOvr+(pos==='QB'?2:0)-i*3+rnd(-4,4);
    R.push(mkPlayer(pos,cl(base,62,97),ri(22,30)));
  }}
  return R;
}
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
function payroll(R){return (R||[]).reduce((s,p)=>s+(p.sal||0),0)}
function teamOvr(R){if(!R||!R.length)return 70;const q=R.filter(p=>p.pos==='QB').sort((a,b)=>b.ovr-a.ovr)[0];
  const sk=R.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,11);const avg=sk.reduce((s,p)=>s+p.ovr,0)/sk.length;
  return Math.round(avg*0.7+(q?q.ovr:75)*0.3)}

function saveC(){try{localStorage.setItem(CKEY,JSON.stringify(C))}catch(e){}}
function loadC(){try{C=JSON.parse(localStorage.getItem(CKEY)||'null')}catch(e){C=null}return C}
function clearC(){C=null;localStorage.removeItem(CKEY)}

function initCareer(team,diff){
  const rosters=TEAMS.map((t,i)=>blankRoster(t.rat+(i===team?1:0)));
  C={v:2,team,diff,year:1,phase:'reg',rosters,fa:[],draft:null,tradeLog:[],cap:CAP};
  // seed FA
  for(let i=0;i<40;i++)C.fa.push(mkPlayer(POS[ri(0,POS.length-1)],rnd(68,88),ri(24,32)));
  // sync arcade season
  if(window.__season)window.__season.newSeason(team,diff);
  const S=window.__season.get();if(S){S.career=true;S.year=1;if(window.__season.save)window.__season.save()}
  applyRatings();saveC();G.career=true;G.st='chub';
}

function applyRatings(){
  if(!C)return;
  C.rosters.forEach((R,i)=>{TEAMS[i].rat=teamOvr(R);TEAMS[i]._cr=R});
}

function myRoster(){return C?C.rosters[C.team]:[]}
function salaryUsed(){return payroll(myRoster())}
function capLeft(){return (C?C.cap:CAP)-salaryUsed()}

// Apply career OVRs onto on-field players after setup
function applyFieldOvr(){
  if(!G.career||!C||!G.players)return;
  const homeR=C.rosters[G.home]||[],awayR=C.rosters[G.away]||[];
  const take=(R,pos,i)=>{const L=R.filter(p=>p.pos===pos).sort((a,b)=>b.ovr-a.ovr);return L[i]||L[0]}
  const hc={QB:0,RB:0,WR:0,OL:0,DL:0,LB:0,CB:0,S:0};
  const ac={DL:0,LB:0,CB:0,S:0};
  G.players.forEach(p=>{
    if(p.team===0){
      const pos=p.role==='QB'?'QB':p.role==='RB'?'RB':p.role==='WR'?'WR':p.role==='OL'?'OL':p.role==='K'?'K':'WR';
      const i=hc[pos]||0;hc[pos]=(hc[pos]||0)+1;
      const pl=take(homeR,pos==='K'?'K':pos,i);if(pl){p.ovr=pl.ovr;p.nm=pl.nm;p._cid=pl.id}
    }else{
      const pos=p.role==='DL'?'DL':p.role==='LB'?'LB':p.role==='CB'?'CB':p.role==='S'?'S':'LB';
      const i=ac[pos]||0;ac[pos]=(ac[pos]||0)+1;
      const pl=take(awayR,pos,i);if(pl){p.ovr=pl.ovr;p.nm=pl.nm;p._cid=pl.id}
    }
  });
}

// ---------- DRAFT ----------
function genProspects(n){
  const out=[];for(let i=0;i<n;i++){
    const pos=POS[ri(0,POS.length-2)]; // no flood of K
    const ovr=Math.round(rnd(70,94)-(i/n)*8+rnd(-2,2));
    out.push(Object.assign(mkPlayer(pos,cl(ovr,68,96),ri(21,23)),{yrs:ri(3,4),sal:Math.max(1,Math.round((cl(ovr,68,96)-60)*0.22)),yLeft:0,prospect:true}));
  }
  return out.sort((a,b)=>b.ovr-a.ovr);
}
function startDraft(){
  if(!C)return;
  const order=[];for(let r=0;r<3;r++){const ids=[...Array(32).keys()];
    // worse records draft earlier — use season record if available
    const S=window.__season&&window.__season.get();
    if(S&&S.rec)ids.sort((a,b)=>{const pa=(S.rec[a].w+S.rec[a].t*0.5)/(S.rec[a].w+S.rec[a].l+S.rec[a].t+0.01);const pb=(S.rec[b].w+S.rec[b].t*0.5)/(S.rec[b].w+S.rec[b].l+S.rec[b].t+0.01);return r%2?pb-pa:pa-pb});
    else ids.sort(()=>Math.random()-0.5);
    order.push(...ids);
  }
  C.draft={round:1,pick:0,order,board:genProspects(120),log:[]};
  C.phase='draft';ui.sel=0;ui.scroll=0;saveC();G.st='cdraft';
}
function draftNeed(ti){
  const R=C.rosters[ti],need={};POS.forEach(p=>{const have=R.filter(x=>x.pos===p).length;need[p]=Math.max(0,(DEPTH[p]||1)-have)+ (R.filter(x=>x.pos===p).sort((a,b)=>b.ovr-a.ovr)[0]?.ovr<78?1:0)});
  return need;
}
function aiDraftPick(ti){
  const need=draftNeed(ti);const board=C.draft.board;
  let best=0,bs=-1e9;board.forEach((p,i)=>{const sc=p.ovr+(need[p.pos]||0)*6+rnd(-2,2);if(sc>bs){bs=sc;best=i}});
  return best;
}
function makeDraftPick(idx){
  const D=C.draft;if(!D||!D.board[idx])return;
  const ti=D.order[D.pick];const p=D.board.splice(idx,1)[0];
  p.yLeft=p.yrs;p.sal=Math.max(1,Math.round((p.ovr-60)*0.22));p.prospect=false;
  C.rosters[ti].push(p);D.log.push({ti,nm:p.nm,pos:p.pos,ovr:p.ovr,round:D.round});
  D.pick++;if(D.pick%32===0)D.round++;
  if(D.pick>=D.order.length){C.phase='fa';C.draft=null;ui.msg='DRAFT COMPLETE';ui.msgT=2;G.st='cfa';applyRatings();saveC();return}
  // auto AI until user on clock
  while(D.pick<D.order.length&&D.order[D.pick]!==C.team){
    const j=aiDraftPick(D.order[D.pick]);makeDraftPick(j);if(!C.draft)return;
  }
  saveC();
}
function advanceDraftAI(){
  const D=C.draft;if(!D)return;
  while(D.pick<D.order.length&&D.order[D.pick]!==C.team){
    makeDraftPick(aiDraftPick(D.order[D.pick]));if(!C.draft)return;
  }
}

// ---------- FREE AGENTS ----------
function openFA(){
  if(!C)return;C.phase='fa';
  // age out / release some to FA
  if(C.fa.length<25){for(let i=0;i<20;i++)C.fa.push(mkPlayer(POS[ri(0,POS.length-1)],rnd(70,90),ri(25,33)))}
  ui.sel=0;ui.scroll=0;G.st='cfa';saveC();
}
function signFA(idx,yrs){
  const p=C.fa[idx];if(!p)return;
  yrs=yrs||2;const sal=Math.max(2,Math.round((p.ovr-60)*0.32+(p.ovr>88?4:0)));
  if(salaryUsed()+sal>C.cap){ui.msg='OVER THE CAP';ui.msgT=1.6;return}
  p.yrs=yrs;p.yLeft=yrs;p.sal=sal;C.rosters[C.team].push(p);C.fa.splice(idx,1);
  ui.msg='SIGNED '+p.nm.split(' ').pop().toUpperCase();ui.msgT=1.5;applyRatings();saveC();
}

// ---------- CONTRACTS / RESIGN ----------
function openContracts(){C.phase='resign';ui.sel=0;ui.scroll=0;G.st='ccontract';saveC()}
function resignPlayer(idx,yrs){
  const R=myRoster();const p=R[idx];if(!p)return;
  yrs=yrs||2;const sal=Math.max(p.sal,Math.round((p.ovr-60)*0.34+(p.ovr>88?4:0)));
  const delta=sal-p.sal;
  if(salaryUsed()+delta>C.cap){ui.msg='OVER THE CAP';ui.msgT=1.6;return}
  p.yrs=yrs;p.yLeft=yrs;p.sal=sal;ui.msg='RE-SIGNED';ui.msgT=1.2;saveC();
}
function releasePlayer(idx){
  const R=myRoster();const p=R[idx];if(!p)return;
  R.splice(idx,1);C.fa.push(p);ui.msg='RELEASED';ui.msgT=1.2;applyRatings();saveC();
}
function tickContracts(){
  // end of year: decrement yLeft, free agents if 0
  C.rosters.forEach((R,ti)=>{
    const keep=[];R.forEach(p=>{p.age=(p.age||25)+1;p.yLeft=(p.yLeft||1)-1;
      if(p.yLeft<=0){if(ti===C.team){/* user decides in resign */}else if(Math.random()<0.45)C.fa.push(p);else{p.yLeft=ri(1,3);p.sal=Math.round(p.ovr*0.5);keep.push(p)}}
      else keep.push(p)});
    C.rosters[ti]=keep;
  });
}

// ---------- TRADES ----------
function openTrades(){C.phase='trade';ui.sel=0;ui.pick=null;ui.offer=null;ui.scroll=0;G.st='ctrade';saveC()}
function tradeValue(p){return p.ovr*p.ovr/100+(p.yLeft||1)*2}
function tryTrade(myIdx,theirTi,theirIdx){
  const mine=myRoster()[myIdx],theirs=C.rosters[theirTi][theirIdx];
  if(!mine||!theirs)return;
  const dv=tradeValue(theirs)-tradeValue(mine);
  if(Math.abs(dv)>14&&Math.random()>0.25){ui.msg='TRADE REJECTED';ui.msgT=1.5;return}
  C.rosters[C.team].splice(myIdx,1);C.rosters[theirTi].splice(theirIdx,1);
  C.rosters[C.team].push(theirs);C.rosters[theirTi].push(mine);
  C.tradeLog.push({y:C.year,gave:mine.nm,got:theirs.nm,with:theirTi});
  ui.msg='TRADE DONE';ui.msgT=1.5;ui.pick=null;ui.offer=null;applyRatings();saveC();
}

// ---------- YEAR ADVANCE ----------
function finishCareerSeason(){
  // called when arcade season phase==='done' and career
  tickContracts();applyRatings();
  C.phase='draft';startDraft();
}
function newCareerYear(){
  C.year++;C.phase='reg';
  if(window.__season){window.__season.newSeason(C.team,C.diff);const S=window.__season.get();if(S){S.career=true;S.year=C.year;if(window.__season.save)window.__season.save()}}
  applyRatings();saveC();G.st='chub';ui.msg='YEAR '+C.year;ui.msgT=2;
}

// ---------- UI HELPERS ----------
function bg(){const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0a26');g.addColorStop(1,'#1a0f33');X.fillStyle=g;X.fillRect(0,0,W,H)}
function hdr(s){txt(s,W/2,56,22,PAL.yel)}
function back(to){btn(12,40,90,40,'< BACK','#2b3a7a','#8fc4ff',13);ui._back=to}
function toast(){if(ui.msgT>0){pill(40,H-90,W-80,36,'rgba(14,20,48,.95)',PAL.yel);txt(ui.msg,W/2,H-72,13,PAL.yel)}}

function drawCHub(){
  bg();const t=TEAMS[C.team];hdr('COACH HUB');txt('YEAR '+C.year+'  ·  '+t.city+' '+t.nick,W/2,84,12,PAL.cy,'center',false);
  HELM.drawHelmet(X,70,150,70,t,false,C.team);
  if(HELM.drawLogo)HELM.drawLogo(X,W-70,150,50,C.team,t.c2,'#000');
  const S=window.__season&&window.__season.get();
  const rec=S? (S.rec[C.team].w+'-'+S.rec[C.team].l+'-'+S.rec[C.team].t):'0-0-0';
  txt('RECORD '+rec,160,130,16,'#fff','left',false);
  txt('TEAM OVR '+TEAMS[C.team].rat,160,154,13,PAL.cy,'left',false);
  txt('CAP '+salaryUsed()+' / '+C.cap,160,176,12,salaryUsed()>C.cap?'#ff6a7a':'#5dff8a','left',false);
  const g=S&&window.__season.myGame&&window.__season.myGame();
  let playLab='PLAY GAME',sub=C.phase;
  if(S){if(S.phase==='reg')sub='WEEK '+(S.week+1)+' / 17';else if(S.phase==='po')sub='PLAYOFFS';else if(S.phase==='done'){playLab='START DRAFT';sub='SEASON COMPLETE'}}
  if(C.phase==='draft'){playLab='CONTINUE DRAFT';sub='DRAFT IN PROGRESS'}
  if(C.phase==='fa'){playLab='FREE AGENTS';sub='OFFSEASON'}
  if(C.phase==='resign'){playLab='CONTRACTS';sub='OFFSEASON'}
  pill(20,210,W-40,70,'rgba(18,10,36,.92)','#4fa3ff');txt(sub,W/2,235,13,PAL.yel);txt(g&&S&&S.phase!=='done'?('NEXT: VS '+TEAMS[g.opp].a):'BUILD YOUR DYNASTY',W/2,258,12,'#c9d4ff');
  btn(20,300,W-40,56,playLab,'#ff4f7a','#ffd0dc',18);
  const labs=[['ROSTER','croster'],['CONTRACTS','ccontract'],['FREE AGENTS','cfa'],['TRADES','ctrade']];
  labs.forEach((L,i)=>{const x=20+(i%2)*((W-50)/2+10),y=370+Math.floor(i/2)*70;btn(x,y,(W-50)/2,56,L[0],'#1f6fd6','#8fc4ff',14)});
  btn(20,520,W-40,48,'STANDINGS / SCHEDULE','#3a2a6a','#c9d4ff',13);
  if(S&&S.phase==='done'&&C.phase==='reg')btn(20,580,W-40,48,'ENTER OFFSEASON (DRAFT)','#c8102e','#fff',13);
  if(C.phase==='fa'||C.phase==='resign')btn(20,580,W-40,48,'START YEAR '+(C.year+1),'#2fd35f','#0a2a14',14);
  btn(W/2-80,760,160,34,'QUIT CAREER','#3a2a6a','#8a7ab0',11);
  toast();
}

function drawCRoster(){
  bg();hdr('ROSTER');back('chub');
  txt('OVR '+TEAMS[C.team].rat+'   CAP '+salaryUsed()+'/'+C.cap,W/2,84,12,PAL.cy);
  const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);
  R.forEach((p,i)=>{const y=110+i*34-ui.scroll;if(y<100||y>H-40)return;
    pill(12,y,W-24,30,'rgba(18,10,36,.9)',p.pos==='QB'?PAL.yel:'#3a2a6a');
    txt(p.pos,28,y+15,11,PAL.yel,'left',false);txt(p.nm,70,y+15,12,'#fff','left',false);
    txt(String(p.ovr),W-100,y+15,13,'#fff','center',false);txt('$'+p.sal+'/'+p.yLeft+'y',W-36,y+15,10,'#9fb3ff','right',false)});
  toast();
}

function drawCDraft(){
  bg();hdr('DRAFT  R'+((C.draft&&C.draft.round)||1));back('chub');
  const D=C.draft;if(!D){txt('NO DRAFT',W/2,300,18,PAL.pink);return}
  const onClock=D.order[D.pick]===C.team;
  txt('PICK '+(D.pick+1)+' / '+D.order.length+(onClock?'  —  YOUR PICK':'  —  '+TEAMS[D.order[D.pick]].a),W/2,84,12,onClock?PAL.yel:PAL.cy);
  if(!onClock){txt('AI DRAFTING...',W/2,200,16,'#9fb3ff');btn(80,400,W-160,50,'SKIP AI PICKS TO YOU','#1f6fd6','#fff',14);toast();return}
  D.board.slice(0,40).forEach((p,i)=>{const y=110+i*36-ui.scroll;if(y<100||y>H-80)return;
    const on=i===ui.sel;pill(12,y,W-24,32,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:'#3a2a6a');
    txt((i+1)+'',24,y+16,11,'#9fb3ff','left',false);txt(p.pos,50,y+16,12,PAL.yel,'left',false);
    txt(p.nm,90,y+16,12,'#fff','left',false);txt(String(p.ovr),W-50,y+16,14,'#fff','center',false)});
  btn(40,H-70,W-80,48,'DRAFT SELECTED','#ff4f7a','#fff',16);toast();
}

function drawCFA(){
  bg();hdr('FREE AGENTS');back('chub');
  txt('CAP LEFT '+capLeft(),W/2,84,12,capLeft()<0?'#ff6a7a':'#5dff8a');
  C.fa.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,50).forEach((p,i)=>{const y=110+i*36-ui.scroll;if(y<100||y>H-80)return;
    const on=i===ui.sel;pill(12,y,W-24,32,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:'#3a2a6a');
    txt(p.pos,24,y+16,11,PAL.yel,'left',false);txt(p.nm,60,y+16,12,'#fff','left',false);
    txt(String(p.ovr),W-110,y+16,13,'#fff','center',false);txt('$'+Math.max(2,Math.round((p.ovr-60)*0.32)),W-40,y+16,11,'#9fb3ff','right',false)});
  btn(20,H-70,(W-50)/2,48,'SIGN 2 YR','#2fd35f','#0a2a14',14);
  btn(30+(W-50)/2,H-70,(W-50)/2,48,'DONE → CONTRACTS','#1f6fd6','#fff',12);toast();
}

function drawCContract(){
  bg();hdr('CONTRACTS');back('chub');
  txt('EXPIRING & DEPTH  ·  CAP '+salaryUsed()+'/'+C.cap,W/2,84,11,PAL.cy);
  const R=myRoster();
  R.forEach((p,i)=>{const y=110+i*40-ui.scroll;if(y<100||y>H-90)return;
    const on=i===ui.sel;const exp=p.yLeft<=1;pill(12,y,W-24,36,on?'#2a1450':'rgba(18,10,36,.9)',exp?PAL.pink:'#3a2a6a');
    txt(p.pos,24,y+18,11,PAL.yel,'left',false);txt(p.nm,60,y+18,12,'#fff','left',false);
    txt(p.ovr+'  $'+p.sal+'  '+p.yLeft+'Y',W-20,y+18,11,'#c9d4ff','right',false)});
  btn(16,H-70,110,48,'RE-SIGN','#2fd35f','#0a2a14',13);
  btn(136,H-70,110,48,'RELEASE','#e8344e','#fff',13);
  btn(256,H-70,W-272,48,'NEXT YEAR','#ffd23f','#141a36',12);toast();
}

function drawCTrade(){
  bg();hdr('TRADES');back('chub');
  txt('TAP YOURS, THEN THEIRS',W/2,84,11,PAL.cy);
  const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);
  txt('YOUR ROSTER',20,110,12,PAL.yel,'left',false);
  R.slice(0,12).forEach((p,i)=>{const y=128+i*28;const on=ui.pick===i;pill(12,y,W/2-18,26,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:'#3a2a6a');
    txt(p.pos+' '+p.nm.split(' ').pop()+' '+p.ovr,20,y+13,10,'#fff','left',false)});
  // other team selector
  const oi=(ui.offer&&ui.offer.ti!=null)?ui.offer.ti:((C.team+1)%32);
  txt(TEAMS[oi].a+' ROSTER',W/2+8,110,12,PAL.pink,'left',false);
  const OR=C.rosters[oi].slice().sort((a,b)=>b.ovr-a.ovr);
  OR.slice(0,12).forEach((p,i)=>{const y=128+i*28;const on=ui.offer&&ui.offer.ti===oi&&ui.offer.i===i;
    pill(W/2+4,y,W/2-16,26,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.pink:'#3a2a6a');
    txt(p.pos+' '+p.nm.split(' ').pop()+' '+p.ovr,W/2+12,y+13,10,'#fff','left',false)});
  btn(16,H-120,W-32,40,'CYCLE TEAM  ('+TEAMS[oi].a+')','#1f6fd6','#fff',13);
  btn(16,H-70,W-32,48,'PROPOSE TRADE','#ff4f7a','#fff',16);toast();
}

function drawCTeamPick(){
  bg();txt('CHOOSE YOUR FRANCHISE',W/2,60,20,PAL.yel);txt('YOU ARE THE COACH',W/2,88,12,PAL.cy);
  for(let i=0;i<32;i++){const cols=4,cw=(W-24)/cols,rh=54,a=12+(i%cols)*cw,b=110+Math.floor(i/cols)*rh,w=cw-6,h=rh-6;
    const on=i===ui.sel;pill(a,b,w,h,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:TEAMS[i].c1);
    HELM.drawHelmet(X,a+w/2,b+18,28,TEAMS[i],false,i);txt(TEAMS[i].a,a+w/2,b+h-8,10,on?PAL.yel:'#fff','center',false)}
  const t=TEAMS[ui.sel];pill(16,H-150,W-32,50,'#120a24',t.c1);txt(t.city+' '+t.nick,W/2,H-125,16,'#fff');
  btn(40,H-88,W-80,56,'START CAREER','#c8102e','#fff',18);
}

// ---------- INPUT ----------
const CMENU=['cteam','chub','croster','cdraft','cfa','ccontract','ctrade'];
function hit(t,x,y,w,h){return t&&t[0]>=x&&t[0]<=x+w&&t[1]>=y&&t[1]<=y+h}

function careerTap(t){
  if(ui.msgT>0)ui.msgT=0;
  if(G.st==='cteam'){
    for(let i=0;i<32;i++){const cols=4,cw=(W-24)/cols,rh=54,a=12+(i%cols)*cw,b=110+Math.floor(i/cols)*rh,w=cw-6,h=rh-6;
      if(hit(t,a,b,w,h)){ui.sel=i;return}}
    if(hit(t,40,H-88,W-80,56)){initCareer(ui.sel,1);return}
    return;
  }
  if(G.st==='chub'){
    if(hit(t,W/2-80,760,160,34)){clearC();G.career=false;G.st='modesel';return}
    if(hit(t,20,300,W-40,56)){
      if(C.phase==='draft'){G.st='cdraft';advanceDraftAI();return}
      if(C.phase==='fa'){G.st='cfa';return}
      if(C.phase==='resign'){G.st='ccontract';return}
      const S=window.__season&&window.__season.get();
      if(S&&S.phase==='done'){finishCareerSeason();return}
      if(window.startMyGame){G.career=true;window.startMyGame()}
      return;
    }
    if(hit(t,20,370,(W-50)/2,56)){ui.scroll=0;G.st='croster';return}
    if(hit(t,30+(W-50)/2,370,(W-50)/2,56)){openContracts();return}
    if(hit(t,20,440,(W-50)/2,56)){openFA();return}
    if(hit(t,30+(W-50)/2,440,(W-50)/2,56)){openTrades();return}
    if(hit(t,20,520,W-40,48)){G.st='standings';return}
    if(hit(t,20,580,W-40,48)){
      if(C.phase==='fa'||C.phase==='resign'){newCareerYear();return}
      const S=window.__season&&window.__season.get();
      if(S&&S.phase==='done'){finishCareerSeason();return}
    }
    return;
  }
  if(hit(t,12,40,90,40)&&G.st!=='chub'&&G.st!=='cteam'){G.st='chub';return}
  if(G.st==='croster'){return}
  if(G.st==='cdraft'){
    const D=C.draft;if(!D)return;
    if(D.order[D.pick]!==C.team){if(hit(t,80,400,W-160,50)){advanceDraftAI();return}return}
    D.board.slice(0,40).forEach((p,i)=>{const y=110+i*36-ui.scroll;if(hit(t,12,y,W-24,32))ui.sel=i});
    if(hit(t,40,H-70,W-80,48)){makeDraftPick(ui.sel);ui.sel=0;return}
    return;
  }
  if(G.st==='cfa'){
    C.fa.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,50).forEach((p,i)=>{const y=110+i*36-ui.scroll;if(hit(t,12,y,W-24,32))ui.sel=i});
    if(hit(t,20,H-70,(W-50)/2,48)){const sorted=C.fa.slice().sort((a,b)=>b.ovr-a.ovr);const p=sorted[ui.sel];const idx=C.fa.indexOf(p);if(idx>=0)signFA(idx,2);return}
    if(hit(t,30+(W-50)/2,H-70,(W-50)/2,48)){openContracts();return}
    return;
  }
  if(G.st==='ccontract'){
    myRoster().forEach((p,i)=>{const y=110+i*40-ui.scroll;if(hit(t,12,y,W-24,36))ui.sel=i});
    if(hit(t,16,H-70,110,48)){resignPlayer(ui.sel,2);return}
    if(hit(t,136,H-70,110,48)){releasePlayer(ui.sel);return}
    if(hit(t,256,H-70,W-272,48)){newCareerYear();return}
    return;
  }
  if(G.st==='ctrade'){
    const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);
    R.slice(0,12).forEach((p,i)=>{if(hit(t,12,128+i*28,W/2-18,26))ui.pick=i});
    const oi=(ui.offer&&ui.offer.ti!=null)?ui.offer.ti:((C.team+1)%32);
    const OR=C.rosters[oi].slice().sort((a,b)=>b.ovr-a.ovr);
    OR.slice(0,12).forEach((p,i)=>{if(hit(t,W/2+4,128+i*28,W/2-16,26))ui.offer={ti:oi,i}});
    if(hit(t,16,H-120,W-32,40)){ui.offer={ti:((oi+1)%32===C.team?(oi+2)%32:(oi+1)%32),i:0};return}
    if(hit(t,16,H-70,W-32,48)&&ui.pick!=null&&ui.offer){
      const mine=R[ui.pick];const theirs=OR[ui.offer.i];
      const mi=myRoster().indexOf(mine),ti=C.rosters[ui.offer.ti].indexOf(C.rosters[ui.offer.ti].slice().sort((a,b)=>b.ovr-a.ovr)[ui.offer.i]);
      // re-find theirs in unsorted
      const th=C.rosters[ui.offer.ti].slice().sort((a,b)=>b.ovr-a.ovr)[ui.offer.i];
      const tj=C.rosters[ui.offer.ti].indexOf(th);
      tryTrade(mi,ui.offer.ti,tj);return}
    return;
  }
}

function careerDraw(){
  if(G.st==='cteam')drawCTeamPick();
  else if(G.st==='chub')drawCHub();
  else if(G.st==='croster')drawCRoster();
  else if(G.st==='cdraft')drawCDraft();
  else if(G.st==='cfa')drawCFA();
  else if(G.st==='ccontract')drawCContract();
  else if(G.st==='ctrade')drawCTrade();
}

// hooks
function careerTick(dt){if(ui.msgT>0)ui.msgT=Math.max(0,ui.msgT-dt)}
window.__career={
  CMENU,load:loadC,save:saveC,get:()=>C,init:initCareer,clear:clearC,
  applyFieldOvr,applyRatings,tap:careerTap,draw:careerDraw,tick:careerTick,
  finishSeason:finishCareerSeason,openDraft:startDraft,capLeft,salaryUsed
};

// Patch season menu: Career → cteam or resume chub
const _ready=()=>{
  // wrap setupPlay/startKickoff for OVR
  ['setupPlay','startKickoff'].forEach(f=>{const o=window[f];if(!o||o.__c)return;
    window[f]=function(){const r=o.apply(this,arguments);if(G.career)applyFieldOvr();return r};window[f].__c=1});
};
setTimeout(_ready,0);

})();
