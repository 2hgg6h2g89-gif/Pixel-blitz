// PIXEL BLITZ v27: Career Mode — coach, draft, contracts, FA, trades (original IP)
(function(){
const CKEY='pb_career';
const CAP=280; // salary cap units
const POS=['QB','RB','WR','TE','OL','DL','LB','CB','S','K'];
const DEPTH={QB:1,RB:2,WR:3,TE:1,OL:5,DL:4,LB:3,CB:2,S:2,K:1};
const FIRST=['Axton','Keiran','Dorian','Zayden','Corven','Brantley','Nolan','Tavian','Merrick','Jalen','Kellan','Rylan','Cormac','Brevin','Daxen','Torin','Kade','Soren','Jace','Varek','Ellis','Ronan','Beckett','Silas','Tavon','Bryce','Camden','Marcus','Rhett','Quincy','Devin','Lennox','Malik','Corbin','Orion','Kai','Luca','Ezra','Milo','Asher','Finn','Rowan','Callum','Felix','Hugo','Jasper','Levi','Nico','Owen','Pax','Reid','Seth','Theo','Wilder','Yale','Zane','Arlo','Bodhi','Cruz','Drake','Elias','Ford','Gage','Hayes','Ivan','Jed','Knox','Lane','Mack','Nash','Otto','Pierce','Quinn','Remy','Shaw','Tate','Vance','Wade','Xander','York','Zeke','Alden','Brooks','Cade','Dane','Everett','Flynn','Greyson','Holden','Isaiah','Jonah','Kieran','Landon','Miles','Noel','Parker','Quade'];
const LAST=['Redvale','Solis','Mesa','Flint','Saguaro','Cinder','Crest','Rook','Stone','Arroyo','Voss','Ember','Vale','Slate','Ridge','Ash','Marlow','Pike','Calder','Dunn','Quill','West','Wynn','Hartwell','Mercer','Hollis','Bellamy','Banks','Pryce','Ellery','Whitlock','Calloway','Maddox','Ashford','Carr','Stroud','Hale','Keene','Locke','Briar','Colton','Dray','Ellison','Farley','Grant','Holt','Jett','Kemp','Larsen','Monroe','Ormond','Pruitt','Ransom','Sable','Thorne','Underwood','Wexley','Yorke','Aldridge','Beckett','Carver','Dalton','Eastman','Frost','Gable','Hawke','Jensen','Kingsley','Lang','Morrow','North','Oakley','Quade','Sawyer','Trent','Upton','Vaughn','Wilder','Yates','Ziegler','Barrett','Cross','Drake','Ellis','Ford','Gage'];
let C=null; // career save
let ui={tab:0,sel:0,scroll:0,pick:null,offer:null,review:null,msg:'',msgT:0,coach:'',maxScr:0};

function rnd(a,b){return a+Math.random()*(b-a)}
function ri(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function name(){return FIRST[ri(0,FIRST.length-1)]+' '+LAST[ri(0,LAST.length-1)]}
function salFor(ovr,yrs){return Math.max(1,Math.round((ovr-60)*0.25+(ovr>88?4:ovr>82?1.5:0)))}
function pid(){return 'p'+Math.random().toString(36).slice(2,9)}

function enrichPlayer(p){
  if(p.mor==null)p.mor=ri(55,95);
  if(p.cond==null)p.cond=ri(70,100);
  if(p.pot==null)p.pot=Math.min(5,Math.max(1,Math.round((p.ovr-70)/6+rnd(0,1.5))));
  if(p.xp==null)p.xp=ri(0,80);
  if(p.lvl==null)p.lvl=Math.max(1,Math.round((p.ovr-60)/8));
  if(!p.attr){const b=p.ovr;
    p.attr={spd:cl(b+ri(-8,8),50,99),str:cl(b+ri(-10,8),50,99),cat:cl(b+ri(-12,10),45,99),sta:cl(b+ri(-6,10),55,99)}}
  return p;
}
function enrichRoster(R){(R||[]).forEach(enrichPlayer);return R}
function mkPlayer(pos,ovr,age){
  ovr=Math.round(ovr);age=age||ri(21,28);
  const yrs=ri(1,4);const sal=Math.max(1,Math.round((ovr-60)*0.25+(ovr>88?4:ovr>82?1.5:0)));
  return enrichPlayer({id:pid(),nm:name(),pos,ovr,age,yrs,sal,yLeft:yrs})
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
function loadC(){try{C=JSON.parse(localStorage.getItem(CKEY)||'null')}catch(e){C=null}
  if(C){if(C.credits==null)C.credits=10;if(C.fans==null)C.fans=20;if(C.morale==null)C.morale=70;
    if(C.stadium==null)C.stadium=2;if(C.training==null)C.training=3;if(C.rehab==null)C.rehab=2;
    if(!C.coach)C.coach='COACH';
    if(!C.oc)C.oc={nm:'Vance',stars:2,mood:1};if(!C.dc)C.dc={nm:'Holt',stars:1,mood:0};
    (C.rosters||[]).forEach(enrichRoster);C.v=3}return C}
function clearC(){C=null;localStorage.removeItem(CKEY)}

function initCareer(team,diff,coach){
  const rosters=TEAMS.map((t,i)=>blankRoster(t.rat+(i===team?1:0)));
  const coachNm=String(coach||ui.coach||'COACH').toUpperCase().replace(/[^A-Z0-9 .'-]/g,'').slice(0,16)||'COACH';
  C={v:3,team,diff,year:1,phase:'reg',coach:coachNm,rosters,fa:[],draft:null,scout:null,tradeLog:[],cap:CAP,
    credits:12,fans:18,morale:72,stadium:2,training:3,rehab:2,
    oc:{nm:name().split(' ')[1],stars:2,mood:1},dc:{nm:name().split(' ')[1],stars:1,mood:0}};
  enrichRoster(rosters[team]);
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
function ensureScout(){if(!C)return null;if(!C.scout||C.scout.year!==C.year||!C.scout.board){C.scout={year:C.year,board:genProspects(36).map(p=>Object.assign(p,{fog:true,seen:false}))};saveC()}return C.scout}
function startDraft(){
  if(!C)return;
  const order=[];for(let r=0;r<3;r++){const ids=[...Array(32).keys()];
    // worse records draft earlier — use season record if available
    const S=window.__season&&window.__season.get();
    if(S&&S.rec)ids.sort((a,b)=>{const pa=(S.rec[a].w+S.rec[a].t*0.5)/(S.rec[a].w+S.rec[a].l+S.rec[a].t+0.01);const pb=(S.rec[b].w+S.rec[b].t*0.5)/(S.rec[b].w+S.rec[b].l+S.rec[b].t+0.01);return r%2?pb-pa:pa-pb});
    else ids.sort(()=>Math.random()-0.5);
    order.push(...ids);
  }
  let board=genProspects(120);
  if(C.scout&&C.scout.year===C.year&&C.scout.board&&C.scout.board.length){
    const seeded=C.scout.board.map(p=>Object.assign({},p,{prospect:true,yLeft:p.yrs||3,fog:false}));
    board=seeded.concat(genProspects(Math.max(40,120-seeded.length)));
    const seen=new Set();board=board.filter(p=>!seen.has(p.id)&&(seen.add(p.id),true));
    board.sort((a,b)=>b.ovr-a.ovr);board=board.slice(0,120)}
  C.draft={round:1,pick:0,order,board,log:[]};
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
  if((p.yLeft||0)>1){ui.msg='STILL UNDER CONTRACT';ui.msgT=1.4;return}
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
function openTrades(){C.phase='trade';ui.sel=0;ui.pick=null;ui.offer=null;ui.review=null;ui.scroll=0;G.st='ctrade';saveC()}
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

function offDefStars(){
  const R=myRoster();if(!R.length)return[2,2];
  const off=R.filter(p=>'QB RB WR TE OL'.includes(p.pos));
  const def=R.filter(p=>'DL LB CB S'.includes(p.pos));
  const avg=a=>a.length?a.reduce((s,p)=>s+p.ovr,0)/a.length:75;
  const toS=v=>Math.max(0.5,Math.min(5,Math.round((v-68)/5*2)/2));
  return[toS(avg(off)+(C.oc?C.oc.stars:0)),toS(avg(def)+(C.dc?C.dc.stars:0))];
}
function drawStars(x,y,n,col,max){max=max||5;for(let i=0;i<max;i++){
  const f=Math.max(0,Math.min(1,n-i));X.fillStyle=f>0.6?col:(f>0.1?mixStar(col):'#2a2a40');
  // tiny 5-point via rect diamond
  X.fillRect(x+i*14,y-3,10,6);if(f>0.6){X.fillStyle='#fff';X.globalAlpha=.35;X.fillRect(x+i*14+2,y-2,4,2);X.globalAlpha=1}
}}
function mixStar(c){return c}
function meter(x,y,w,h,pct,fill,bg){pill(x,y,w,h,bg||'rgba(10,12,28,.9)','#3a2a6a');
  const pw=Math.max(2,Math.round((w-4)*Math.max(0,Math.min(1,pct))));
  X.fillStyle=fill;X.fillRect(x+2,y+2,pw,h-4)}
function segMeter(x,y,w,h,lvl,max,fill){max=max||10;pill(x,y,w,h,'rgba(10,12,28,.9)','#3a2a6a');
  const sw=(w-6)/max;for(let i=0;i<max;i++){X.fillStyle=i<lvl?fill:'#1a1a30';X.fillRect(x+3+i*sw,y+3,sw-2,h-6)}}
// ---------- UI HELPERS ----------
function bg(){if(window.drawNightBowl){drawNightBowl(0.86);X.fillStyle='rgba(7,6,20,.8)';X.fillRect(0,0,W,H);return}const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0a26');g.addColorStop(1,'#1a0f33');X.fillStyle=g;X.fillRect(0,0,W,H)}
function starters(){const R=myRoster();return POS.map(pos=>{const L=R.filter(p=>p.pos===pos).sort((a,b)=>b.ovr-a.ovr);return{pos,p:L[0]||null}})}
function coachBox(on){const el=document.getElementById('coachIn');if(!el)return;
 if(on){if(el.style.display!=='block'){el.style.display='block';if(ui.coach&&!el.value)el.value=ui.coach}}
 else if(el.style.display!=='none'){el.style.display='none';el.blur()}}
function hdr(s){txt(s,W/2,56,22,PAL.yel)}
function back(to){btn(12,40,90,40,'< BACK','#2b3a7a','#8fc4ff',13);ui._back=to}
function toast(){if(ui.msgT>0){pill(24,H/2-24,W-48,48,'rgba(14,20,48,.96)',PAL.yel);txt(ui.msg,W/2,H/2,14,PAL.yel)}}

function hubNav(){
  const y0=612,h=52,g=8,w=(W-32-g)/2;
  const items=[['COACH',0,0],['DRAFT',1,0],['CONTRACTS',0,1],['FREE AGENTS',1,1],['TRADES',0,2],['STANDINGS',1,2]];
  return items.map(([lab,c,r])=>({lab,x:16+c*(w+g),y:y0+r*(h+8),w,h}));
}
function drawCHub(){
  bg();const t=TEAMS[C.team];const S=window.__season&&window.__season.get();
  if(window.drawPBLogo)drawPBLogo(46,0.42);else uiTxt('PIXEL BLITZ',W/2,40,16,PAL.yel);
  pill(12,78,88,26,'rgba(18,10,36,.95)',PAL.yel);uiTxt(C.credits+' CC',56,91,12,PAL.yel,'center',false);
  pill(W-100,78,88,26,'rgba(18,10,36,.95)','#4fa3ff');uiTxt('YEAR '+C.year,W-56,91,12,'#8fc4ff','center',false);
  uiTxt((C.coach||'COACH')+'   '+t.a,W/2,116,13,'#ffd23f','center',false);
  const wk=S?S.week:0;const phase=S?S.phase:'reg';
  const rec=S?S.rec[C.team].w+'-'+S.rec[C.team].l+'-'+S.rec[C.team].t:'0-0-0';
  const g=S&&window.__season.myGame&&window.__season.myGame();
  pill(12,124,W-24,58,'rgba(18,10,36,.94)','#ffd23f');
  uiTxt(phase==='reg'?('WEEK '+(wk+1)+' OF 17'):phase==='po'?'PLAYOFFS':phase==='done'||(S&&S.phase==='done')?'SEASON COMPLETE':'OFFSEASON',W/2,142,13,PAL.yel,'center',false);
  uiTxt('RECORD  '+rec+'    CAP '+salaryUsed()+'/'+C.cap,W/2,164,12,'#c9d4ff','center',false);
  const prog=phase==='reg'?wk/17:phase==='po'?0.9:phase==='done'||(S&&S.phase==='done')?1:0.05;
  meter(28,172,W-56,8,prog,'#4fa3ff');
  let sub='Build your dynasty',playLab='PLAY';
  if(C.draft||C.phase==='draft'){sub='Draft is open';playLab='ENTER DRAFT'}
  else if(C.phase==='fa'){sub='Sign free agents';playLab='FREE AGENTS'}
  else if(C.phase==='resign'){sub='Renew expiring deals';playLab='CONTRACTS'}
  else if(S&&S.phase==='done'){sub='Season complete';playLab='START DRAFT'}
  else if(S&&S.phase==='po'&&!(window.__season.myGame&&window.__season.myGame())){sub='Eliminated';playLab='PLAYOFFS'}
  else if(g)sub=(g.atHome?'HOME':'AWAY')+' vs '+TEAMS[g.opp].city+' '+TEAMS[g.opp].nick;
  pill(12,192,W-24,108,'rgba(22,14,42,.95)',PAL.pink);
  uiTxt('NEXT',W/2,208,11,'#9fb3ff','center',false);
  uiTxt(sub,W/2,230,14,PAL.yel,'center',false);
  HELM.drawHelmet(X,78,258,52,t,false,C.team);
  if(g){HELM.drawHelmet(X,W-78,258,52,TEAMS[g.opp],true,g.opp);uiTxt('VS',W/2,258,14,PAL.pink)}
  else uiTxt(t.a,W-70,258,16,'#fff');
  uiTxt('OVR '+TEAMS[C.team].rat+'   '+DIFFS[C.diff||1].n,W/2,286,11,'#c9d4ff','center',false);
  const di=(window.divOf||(x=>x%4))(C.team);
  const conf=(window.confOf||(x=>0))(C.team);
  const divTeams=(window.DIVS&&window.DIVS[conf]?window.DIVS[conf][di]:null)||[C.team,(C.team+1)%32,(C.team+2)%32,(C.team+3)%32];
  const sorted=divTeams.slice().sort((a,b)=>{if(!S||!S.rec)return 0;const pa=S.rec[a],pb=S.rec[b];return (pb.w-pa.w)||(pb.pf-pa.pf)});
  pill(12,310,W-24,132,'rgba(18,10,36,.92)','#4a3a8a');
  uiTxt((window.CABR?window.CABR[conf]:'CONF')+' '+(window.DIVN?window.DIVN[di]:'DIV'),24,326,12,PAL.yel,'left',false);
  uiTxt('W-L-T',W-28,326,11,'#9fb3ff','right',false);
  sorted.forEach((ti,i)=>{const y=350+i*22;const me=ti===C.team;if(me)rect(18,y-10,W-36,20,'rgba(255,210,63,.16)');
    uiTxt(TEAMS[ti].a,28,y,12,me?PAL.yel:'#fff','left',false);
    const r=S&&S.rec?S.rec[ti]:{w:0,l:0,t:0};uiTxt(r.w+'-'+r.l+'-'+r.t,W-28,y,12,'#c9d4ff','right',false)});
  const line=starters().filter(s=>s.p&&'QB RB WR TE'.includes(s.pos)).slice(0,4);
  pill(12,452,W-24,70,'rgba(18,10,36,.92)','#3a2a6a');
  uiTxt('LINEUP',24,468,11,PAL.yel,'left',false);
  line.forEach((s,i)=>{const x=20+i*((W-40)/4);uiTxt(s.pos,x+8,490,11,'#9fb3ff','left',false);uiTxt(s.p.nm.split(' ').pop(),x+8,508,12,'#fff','left',false);uiTxt(String(s.p.ovr),x+((W-40)/4)-16,508,12,PAL.yel,'right',false)});
  btn(16,534,W-32,64,playLab,'#e8344e','#ffe7a0',20);
  hubNav().forEach(n=>btn(n.x,n.y,n.w,n.h,n.lab,'#1f4fb0','#d7e6ff',n.lab.length>10?11:13));
  ui.maxScr=0;
  btn(16,H-48,110,36,'QUIT','#3a2a6a','#8a7ab0',12);
  if(ui.holdHint){pill(136,H-48,W-152,36,'rgba(14,20,48,.95)',PAL.pink);uiTxt('Tap here to reset career',136+(W-152)/2,H-30,11,PAL.pink,'center',false)}
  toast();
}

function drawCFront(){
  bg();hdr('FRONT OFFICE');back('chub');
  pill(12,84,90,28,'rgba(18,10,36,.95)',PAL.yel);uiTxt(C.credits+' CC',57,98,13,PAL.yel,'center',false);
  pill(12,124,W-24,48,'rgba(18,10,36,.92)','#4fa3ff');
  uiTxt('SALARY CAP  '+salaryUsed()+' / '+C.cap,24,142,13,'#fff','left',false);
  meter(24,152,W-48,12,salaryUsed()/C.cap,salaryUsed()>C.cap?'#ff6a7a':'#ffd23f');
  const fac=[['STADIUM','stadium',3],['TRAINING','training',4],['REHAB','rehab',3]];
  fac.forEach((F,i)=>{const y=188+i*70;
    pill(12,y,W-100,60,'rgba(18,10,36,.92)','#3a2a6a');
    uiTxt(F[0]+'  Lv '+C[F[1]],24,y+22,14,PAL.yel,'left',false);
    segMeter(24,y+34,W-140,14,C[F[1]],10,'#ffd23f');
    const cost=F[2]+C[F[1]];btn(W-80,y+8,68,44,'+'+cost,C.credits>=cost?'#2fd35f':'#3a2a6a','#fff',13);
  });
  pill(12,410,W-24,150,'rgba(18,10,36,.92)','#4a3a8a');
  uiTxt('COORDINATORS',W/2,428,13,PAL.yel,'center',false);
  [['OC',C.oc,'#4fa3ff'],['DC',C.dc,'#e8344e']].forEach((S,i)=>{
    const x=24+i*((W-60)/2+12);pill(x,444,(W-60)/2,100,'#120a24',S[2]);
    uiTxt(S[0]+'  '+S[1].nm,x+(W-60)/4,468,14,'#fff','center',false);
    drawStars(x+20,492,S[1].stars,S[2]);
    uiTxt(S[1].mood>0?'GOOD':S[1].mood<0?'LOW':'OK',x+(W-60)/4,520,12,S[1].mood>0?'#5dff8a':'#ffd23f','center',false);
  });
  const [os,ds]=offDefStars();
  uiTxt('OFFENSE',40,580,12,'#8fc4ff','left',false);drawStars(110,580,os,'#4fa3ff');
  uiTxt('DEFENSE',40,600,12,'#ff6a7a','left',false);drawStars(110,600,ds,'#e8344e');
  pill(W/2,568,W/2-24,48,'rgba(18,10,36,.92)','#3a2a6a');
  uiTxt('DRAFT PICKS',W*0.75,586,11,'#9fb3ff','center',false);
  uiTxt('1 - 1 - 2',W*0.75,606,15,PAL.yel,'center',false);
  btn(16,H-70,(W-40)/2,48,'FREE AGENTS','#1f6fd6','#fff',14);
  btn(24+(W-40)/2,H-70,(W-40)/2,48,'STAFF','#2b3a7a','#c9d4ff',14);
  toast();
}

function drawCRoster(){
  bg();hdr('ROSTER');back('chub');
  uiTxt('Cap '+salaryUsed()+'/'+C.cap+'   Morale '+Math.round(C.morale)+'%',W/2,78,12,PAL.cy,'center',false);
  meter(16,90,W-32,12,salaryUsed()/C.cap,salaryUsed()>C.cap?'#ff6a7a':'#ffd23f');
  const [os,ds]=offDefStars();
  uiTxt('O',20,118,11,'#8fc4ff','left',false);drawStars(36,118,os,'#4fa3ff',5);
  uiTxt('D',W/2+10,118,11,'#ff6a7a','left',false);drawStars(W/2+26,118,ds,'#e8344e',5);
  const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);
  const cols=2,cw=(W-28)/cols,ch=74;
  ui.maxScr=Math.max(0,136+Math.ceil(R.length/2)*ch-(H-16));
  R.forEach((p,i)=>{const col=i%cols,row=Math.floor(i/cols);const x=12+col*cw,y=136+row*ch-ui.scroll;
    if(y<128||y>H-24)return;
    const on=i===ui.sel;pill(x,y,cw-8,ch-8,on?'#2a1450':'rgba(18,10,36,.92)',on?PAL.yel:TEAMS[C.team].c1);
    uiTxt(p.pos,x+10,y+18,12,PAL.yel,'left',false);uiTxt(p.nm.split(' ').pop(),x+48,y+18,13,'#fff','left',false);
    uiTxt(String(p.ovr),x+cw-16,y+20,18,'#fff','right',false);
    drawStars(x+10,y+40,Math.min(5,p.pot||2),PAL.yel,5);
    uiTxt('Mor '+((p.mor|0))+'  Cond '+((p.cond|0)),x+10,y+58,10,p.cond>70?'#5dff8a':'#ffd23f','left',false);
    uiTxt('$'+p.sal+' / '+p.yLeft+'y',x+cw-14,y+58,10,'#9fb3ff','right',false);
  });
  toast();
}

function drawCPlayer(){
  bg();const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);const p=R[ui.sel];back('croster');
  if(!p){uiTxt('NO PLAYER',W/2,300,18,PAL.pink);return}
  enrichPlayer(p);
  hdr(p.nm);uiTxt(p.pos+'  ·  AGE '+p.age,W/2,84,13,PAL.cy,'center',false);
  pill(W/2-50,100,100,70,'#120a24',PAL.yel);uiTxt(String(p.ovr),W/2,138,34,PAL.yel,'center',false);
  uiTxt('OVR',W/2,160,11,'#9fb3ff','center',false);
  const rows=[['CONTRACT',p.yLeft+' YR  $'+p.sal+'/YR'],['MORALE',Math.round(p.mor)+'%'],['CONDITION',Math.round(p.cond)+'%'],['VALUE','$'+(Math.round(p.ovr*p.pot*0.4))]];
  rows.forEach((r,i)=>{const y=186+i*36;pill(16,y,W-32,32,'rgba(18,10,36,.9)','#3a2a6a');
    uiTxt(r[0],28,y+16,12,'#9fb3ff','left',false);uiTxt(r[1],W-28,y+16,14,'#fff','right',false)});
  pill(16,340,W-32,70,'rgba(18,10,36,.92)','#4a3a8a');
  uiTxt('POTENTIAL',28,360,12,PAL.yel,'left',false);drawStars(130,360,p.pot,PAL.yel);
  uiTxt('LEVEL '+p.lvl,28,390,12,'#c9d4ff','left',false);
  meter(120,382,W-160,14,(p.xp%100)/100,'#4fa3ff');
  pill(16,424,W-32,140,'rgba(18,10,36,.92)','#3a2a6a');
  uiTxt('ATTRIBUTES',W/2,442,13,PAL.yel,'center',false);
  [['CATCHING',p.attr.cat,'#4fa3ff'],['STRENGTH',p.attr.str,'#e8344e'],['SPEED',p.attr.spd,'#ffd23f'],['STAMINA',p.attr.sta,'#5dff8a']].forEach((a,i)=>{
    const y=458+i*26;uiTxt(a[0],28,y+8,11,'#c9d4ff','left',false);
    meter(130,y,W-190,12,a[1]/100,a[2]);uiTxt(String(a[1]|0),W-28,y+8,13,'#fff','right',false);
  });
  const bw=(W-40)/4;
  [['BENCH','#2b3a7a'],['STATS','#1f6fd6'],['MEET','#2fd35f'],['TRADE','#ff4f7a']].forEach((A,i)=>{
    btn(16+i*(bw+4),H-70,bw,48,A[0],A[1],'#fff',13)});
  toast();
}

function drawCDraft(){
  bg();hdr('DRAFT  R'+((C.draft&&C.draft.round)||1));back('chub');
  const D=C.draft;if(!D){txt('NO DRAFT',W/2,300,18,PAL.pink);return}
  const onClock=D.order[D.pick]===C.team;
  txt('PICK '+(D.pick+1)+' / '+D.order.length+(onClock?'  —  YOUR PICK':'  —  '+TEAMS[D.order[D.pick]].a),W/2,84,12,onClock?PAL.yel:PAL.cy);
  if(!onClock){ui.maxScr=0;txt('AI DRAFTING...',W/2,200,16,'#9fb3ff');btn(80,400,W-160,50,'SKIP AI PICKS TO YOU','#1f6fd6','#fff',14);toast();return}
  ui.maxScr=Math.max(0,40*36-(H-200));
  D.board.slice(0,40).forEach((p,i)=>{const y=110+i*36-ui.scroll;if(y<100||y>H-80)return;
    const on=i===ui.sel;pill(12,y,W-24,32,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:'#3a2a6a');
    txt((i+1)+'',24,y+16,11,'#9fb3ff','left',false);txt(p.pos,50,y+16,12,PAL.yel,'left',false);
    txt(p.nm,90,y+16,12,'#fff','left',false);txt(String(p.ovr),W-50,y+16,14,'#fff','center',false)});
  btn(40,H-70,W-80,48,'DRAFT SELECTED','#ff4f7a','#fff',16);toast();
}

function drawCFA(){
  bg();hdr('FREE AGENTS');back('chub');
  uiTxt('Cap left  '+capLeft(),W/2,84,13,capLeft()<0?'#ff6a7a':'#5dff8a','center',false);
  ui.maxScr=Math.max(0,Math.min(50,C.fa.length)*38-(H-200));
  C.fa.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,50).forEach((p,i)=>{const y=110+i*38-ui.scroll;if(y<100||y>H-80)return;
    const on=i===ui.sel;pill(12,y,W-24,34,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:'#3a2a6a');
    uiTxt(p.pos,24,y+17,12,PAL.yel,'left',false);uiTxt(p.nm,64,y+17,13,'#fff','left',false);
    uiTxt(String(p.ovr),W-100,y+17,14,'#fff','center',false);uiTxt('$'+Math.max(2,Math.round((p.ovr-60)*0.32)),W-28,y+17,12,'#9fb3ff','right',false)});
  btn(16,H-70,(W-40)/2,48,'SIGN 2 YR','#2fd35f','#0a2a14',15);
  btn(24+(W-40)/2,H-70,(W-40)/2,48,'TO DEALS','#1f6fd6','#fff',14);toast();
}

function drawCContract(){
  bg();hdr('CONTRACTS');back('chub');
  txt('EXPIRING & DEPTH  ·  CAP '+salaryUsed()+'/'+C.cap,W/2,84,11,PAL.cy);
  const R=myRoster();
  ui.maxScr=Math.max(0,R.length*40-(H-210));
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
  btn(16,H-70,W-32,48,ui.review?'CONFIRM TRADE':'PROPOSE TRADE','#ff4f7a','#fff',16);toast();
  if(ui.review){const m=ui.review.mine,th=ui.review.th;
    X.fillStyle='rgba(6,8,20,.72)';X.fillRect(0,0,W,H);
    pill(20,220,W-40,280,'#120a24',PAL.yel);
    uiTxt('REVIEW TRADE',W/2,248,18,PAL.yel,'center',false);
    uiTxt('YOU SEND',W/2,280,12,'#9fb3ff','center',false);
    uiTxt(m.pos+'  '+m.nm,W/2,304,15,'#fff','center',false);
    uiTxt('OVR '+m.ovr+'   $'+m.sal+'   '+m.yLeft+'Y',W/2,326,13,'#ffd0d6','center',false);
    uiTxt('YOU GET',W/2,360,12,'#9fb3ff','center',false);
    uiTxt(th.pos+'  '+th.nm,W/2,384,15,'#fff','center',false);
    uiTxt('OVR '+th.ovr+'   $'+th.sal+'   '+th.yLeft+'Y',W/2,406,13,'#c9ffd4','center',false);
    uiTxt(TEAMS[ui.review.ti].city+' '+TEAMS[ui.review.ti].nick,W/2,432,12,PAL.cy,'center',false);
    btn(36,456,(W-88)/2,40,'REJECT','#3a2a6a','#c9d4ff',14);
    btn(52+(W-88)/2,456,(W-88)/2,40,'CONFIRM','#2fd35f','#0a2a14',14)}
}

function drawCName(){
  bg();if(window.drawPBLogo)drawPBLogo(150,0.72);
  uiTxt('NAME YOUR COACH',W/2,250,18,PAL.yel,'center',false);
  uiTxt('This name is saved with the franchise',W/2,278,12,'#9fb3ff','center',false);
  btn(40,430,W-80,64,'CONTINUE','#1d6fe6','#ffe7a0',20);
  btn(40,510,W-80,48,'BACK','#2b3a7a','#8fc4ff',16);
  coachBox(true);
}
function drawCCoach(){
  bg();hdr('COACH');back('chub');
  const t=TEAMS[C.team];const S=window.__season&&window.__season.get();
  const rec=S?S.rec[C.team].w+'-'+S.rec[C.team].l+'-'+S.rec[C.team].t:'0-0-0';
  HELM.drawHelmet(X,64,118,72,t,false,C.team);
  uiTxt(C.coach||'COACH',140,108,16,PAL.yel,'left',false);
  uiTxt(t.city+' '+t.nick,140,132,13,'#fff','left',false);
  uiTxt('OVR '+t.rat+'   '+rec,140,154,12,'#9fb3ff','left',false);
  uiTxt('LINEUP',24,186,13,PAL.yel,'left',false);
  const rows=starters();
  ui.maxScr=Math.max(0,rows.length*36+280-(H-40));
  rows.forEach((s,i)=>{const y=204+i*36-ui.scroll;if(y<190||y>H-150)return;
    pill(12,y,W-24,32,'rgba(18,10,36,.92)',s.p&&s.p.yLeft<=1?PAL.pink:'#3a2a6a');
    uiTxt(s.pos,24,y+16,12,PAL.yel,'left',false);
    uiTxt(s.p?s.p.nm:'EMPTY',70,y+16,13,'#fff','left',false);
    if(s.p)uiTxt(s.p.ovr+'   '+s.p.yLeft+'Y',W-24,y+16,12,'#c9d4ff','right',false)});
  btn(16,H-120,W-32,48,'FULL ROSTER','#1f6fd6','#fff',16);
  btn(16,H-64,W-32,48,'FRONT OFFICE','#2b3a7a','#c9d4ff',16);
  toast();
}
function drawCScout(){
  bg();hdr('SCOUT');back('chub');
  const B=ensureScout();
  uiTxt('Credits '+C.credits+'    Tap a name, then scout',W/2,84,12,'#9fb3ff','center',false);
  const list=(B&&B.board||[]).slice(0,36);
  ui.maxScr=Math.max(0,list.length*36-(H-220));
  list.forEach((p,i)=>{const y=104+i*36-ui.scroll;if(y<96||y>H-90)return;
    const on=i===ui.sel;pill(12,y,W-24,32,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:'#3a2a6a');
    uiTxt(p.pos,24,y+16,12,PAL.yel,'left',false);uiTxt(p.nm,64,y+16,12,'#fff','left',false);
    const ask=Math.max(2,Math.round((p.ovr-60)*0.28));
    uiTxt(p.seen?String(p.ovr):'??',W-108,y+16,14,p.seen?PAL.yel:'#8a93b8','center',false);
    uiTxt(p.seen?'$'+ask:'HIDDEN',W-24,y+16,11,'#9fb3ff','right',false)});
  btn(16,H-70,W-32,48,'SCOUT  1 CC','#2fd35f','#0a2a14',16);
  toast();
}
function drawCTeamPick(){
  bg();back('ccoach');txt('CHOOSE YOUR FRANCHISE',W/2,60,18,PAL.yel);txt((ui.coach||'COACH')+'  ·  PICK A TEAM',W/2,88,12,PAL.cy);
  for(let i=0;i<32;i++){const cols=4,cw=(W-24)/cols,rh=54,a=12+(i%cols)*cw,b=110+Math.floor(i/cols)*rh,w=cw-6,h=rh-6;
    const on=i===ui.sel;pill(a,b,w,h,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:TEAMS[i].c1);
    HELM.drawHelmet(X,a+w/2,b+18,28,TEAMS[i],false,i);txt(TEAMS[i].a,a+w/2,b+h-8,10,on?PAL.yel:'#fff','center',false)}
  const t=TEAMS[ui.sel];pill(16,H-150,W-32,50,'#120a24',t.c1);txt(t.city+' '+t.nick,W/2,H-125,16,'#fff');
  btn(40,H-88,W-80,56,'START CAREER','#c8102e','#fff',18);
}

// ---------- INPUT ----------
const CMENU=['cteam','ccoach','chub','cstaff','croster','cplayer','cfront','cdraft','cscout','cfa','ccontract','ctrade'];
function hit(t,x,y,w,h){return t&&t[0]>=x&&t[0]<=x+w&&t[1]>=y&&t[1]<=y+h}
function readCoach(){const el=document.getElementById('coachIn');return String((el&&el.value)||ui.coach||'COACH').toUpperCase().replace(/[^A-Z0-9 .'-]/g,'').slice(0,16)||'COACH'}
function hubPlay(){
  const S=window.__season&&window.__season.get();
  if(C.draft){G.st='cdraft';advanceDraftAI();return}
  if(C.phase==='draft'||(S&&S.phase==='done')){startDraft();return}
  if(C.phase==='fa'){openFA();return}
  if(C.phase==='resign'){openContracts();return}
  if(S&&S.phase==='po'&&!(window.__season.myGame&&window.__season.myGame())){G.st='bracket';return}
  if(window.startMyGame){G.career=true;window.startMyGame()}
}
function goDraft(){
  if(C.draft){G.st='cdraft';advanceDraftAI();return}
  const S=window.__season&&window.__season.get();
  if(C.phase==='draft'||(S&&S.phase==='done')){startDraft();return}
  ui.scroll=0;ui.sel=0;G.st='cscout';
}

function careerTap(t){
  if(ui.msgT>0)ui.msgT=0;
  if(G.st==='ccoach'){
    if(hit(t,40,430,W-80,64)){ui.coach=readCoach();coachBox(false);ui.sel=0;G.st='cteam';return}
    if(hit(t,40,510,W-80,48)){coachBox(false);G.career=false;G.st='modesel';return}
    return;
  }
  if(G.st==='cteam'){
    if(hit(t,12,40,90,40)){G.st='ccoach';return}
    for(let i=0;i<32;i++){const cols=4,cw=(W-24)/cols,rh=54,a=12+(i%cols)*cw,b=110+Math.floor(i/cols)*rh,w=cw-6,h=rh-6;
      if(hit(t,a,b,w,h)){ui.sel=i;return}}
    if(hit(t,40,H-88,W-80,56)){initCareer(ui.sel,1,ui.coach);return}
    return;
  }
  if(G.st==='chub'){
    if(hit(t,16,H-48,110,36)){clearC();G.career=false;G.st='modesel';return}
    if(hit(t,16,534,W-32,64)){hubPlay();return}
    for(const n of hubNav()){if(!hit(t,n.x,n.y,n.w,n.h))continue;
      ui.scroll=0;ui.sel=0;
      if(n.lab==='COACH')G.st='cstaff';
      else if(n.lab==='DRAFT')goDraft();
      else if(n.lab==='CONTRACTS')openContracts();
      else if(n.lab==='FREE AGENTS')openFA();
      else if(n.lab==='TRADES')openTrades();
      else if(n.lab==='STANDINGS')G.st='standings';
      return}
    return;
  }
  if(hit(t,12,40,90,40)&&G.st!=='chub'&&G.st!=='cteam'&&G.st!=='ccoach'){G.st=ui._back||'chub';ui.scroll=0;return}
  if(G.st==='cstaff'){
    const rows=starters();
    rows.forEach((s,i)=>{const y=204+i*36-ui.scroll;if(s.p&&hit(t,12,y,W-24,32)){const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);ui.sel=Math.max(0,R.indexOf(s.p));ui.scroll=0;G.st='cplayer'}});
    if(hit(t,16,H-120,W-32,48)){ui.scroll=0;G.st='croster';return}
    if(hit(t,16,H-64,W-32,48)){G.st='cfront';return}
    return}
  if(G.st==='cscout'){
    const B=ensureScout();const list=(B&&B.board||[]).slice(0,36);
    list.forEach((p,i)=>{const y=104+i*36-ui.scroll;if(hit(t,12,y,W-24,32))ui.sel=i});
    if(hit(t,16,H-70,W-32,48)){const p=list[ui.sel];if(!p)return;
      if(p.seen){ui.msg='ALREADY SCOUTED';ui.msgT=1.2;return}
      if((C.credits||0)<1){ui.msg='NEED CREDITS';ui.msgT=1.2;return}
      C.credits--;p.seen=true;p.fog=false;ui.msg='SCOUTED  OVR '+p.ovr;ui.msgT=1.6;saveC()}
    return}
  if(G.st==='croster'){
    const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);const cols=2,cw=(W-28)/cols,ch=74;
    R.forEach((p,i)=>{const col=i%cols,row=Math.floor(i/cols);const x=12+col*cw,y=136+row*ch-ui.scroll;
      if(hit(t,x,y,cw-8,ch-8)){ui.sel=i;ui.scroll=0;G.st='cplayer'}});
    return}
  if(G.st==='cplayer'){
    const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);const p=R[ui.sel];
    if(hit(t,12,H-70,(W-28)/4,48)){ui.msg='BENCHED';ui.msgT=1.2;if(p)p.mor=Math.max(20,p.mor-8);saveC();return}
    if(hit(t,12+((W-28)/4+4),H-70,(W-28)/4,48)){if(p){const mates=myRoster().filter(q=>q.pos===p.pos);const avg=mates.reduce((s,q)=>s+q.ovr,0)/Math.max(1,mates.length);ui.msg=p.pos+' OVR '+p.ovr+'  '+(p.ovr>=avg?'ABOVE':'BELOW')+' AVG '+Math.round(avg)+'   SPD '+(p.attr.spd|0)+' STR '+(p.attr.str|0)+' CAT '+(p.attr.cat|0);ui.msgT=2.6}return}
    if(hit(t,12+2*((W-28)/4+4),H-70,(W-28)/4,48)){if(p){p.mor=Math.min(99,p.mor+10);C.credits=Math.max(0,C.credits-1);C.morale=Math.min(99,C.morale+2);ui.msg='MEETING +MORALE';ui.msgT=1.4;saveC()}return}
    if(hit(t,12+3*((W-28)/4+4),H-70,(W-28)/4,48)){openTrades();return}
    return}
  if(G.st==='cfront'){
    const fac=[['stadium',3],['training',4],['rehab',3]];
    fac.forEach((F,i)=>{const y=188+i*70;const cost=F[1]+C[F[0]];
      if(hit(t,W-80,y+8,68,44)){if(C.credits<cost){ui.msg='NEED CREDITS';ui.msgT=1.2;return}
        if(C[F[0]]>=10){ui.msg='MAXED';ui.msgT=1;return}
        C.credits-=cost;C[F[0]]++;if(F[0]==='stadium')C.fans=Math.min(99,C.fans+4);if(F[0]==='training')C.morale=Math.min(99,C.morale+3);ui.msg=F[0].toUpperCase()+' UP';ui.msgT=1.2;saveC()}});
    if(hit(t,16,H-70,(W-40)/2,48)){openFA();return}
    if(hit(t,24+(W-40)/2,H-70,(W-40)/2,48)){
      if(C.credits<5){ui.msg='NEED 5 CC';ui.msgT=1.2;return}
      C.credits-=5;const who=Math.random()<0.5?'oc':'dc';C[who]={nm:name().split(' ')[1],stars:Math.min(5,(C[who].stars||1)+1),mood:1};ui.msg='HIRED '+who.toUpperCase();ui.msgT=1.4;saveC();return}
    return}
  if(G.st==='cdraft'){
    const D=C.draft;if(!D)return;
    if(D.order[D.pick]!==C.team){if(hit(t,80,400,W-160,50)){advanceDraftAI();return}return}
    D.board.slice(0,40).forEach((p,i)=>{const y=110+i*36-ui.scroll;if(hit(t,12,y,W-24,32))ui.sel=i});
    if(hit(t,40,H-70,W-80,48)){makeDraftPick(ui.sel);ui.sel=0;return}
    return;
  }
  if(G.st==='cfa'){
    C.fa.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,50).forEach((p,i)=>{const y=110+i*38-ui.scroll;if(hit(t,12,y,W-24,34))ui.sel=i});
    if(hit(t,16,H-70,(W-40)/2,48)){const sorted=C.fa.slice().sort((a,b)=>b.ovr-a.ovr);const p=sorted[ui.sel];const idx=C.fa.indexOf(p);if(idx>=0)signFA(idx,2);return}
    if(hit(t,24+(W-40)/2,H-70,(W-40)/2,48)){openContracts();return}
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
    if(ui.review){const rw=(W-88)/2;
      if(hit(t,36,456,rw,40)){ui.review=null;ui.msg='TRADE CANCELLED';ui.msgT=1.2;return}
      if(hit(t,52+rw,456,rw,40)){const r=ui.review;ui.review=null;tryTrade(r.mi,r.ti,r.tj);return}
      return}
    const R=myRoster().slice().sort((a,b)=>b.ovr-a.ovr);
    R.slice(0,12).forEach((p,i)=>{if(hit(t,12,128+i*28,W/2-18,26))ui.pick=i});
    const oi=(ui.offer&&ui.offer.ti!=null)?ui.offer.ti:((C.team+1)%32);
    const OR=C.rosters[oi].slice().sort((a,b)=>b.ovr-a.ovr);
    OR.slice(0,12).forEach((p,i)=>{if(hit(t,W/2+4,128+i*28,W/2-16,26))ui.offer={ti:oi,i}});
    if(hit(t,16,H-120,W-32,40)){ui.offer={ti:((oi+1)%32===C.team?(oi+2)%32:(oi+1)%32),i:0};ui.review=null;return}
    if(hit(t,16,H-70,W-32,48)){
      if(ui.pick==null||!ui.offer){ui.msg='PICK BOTH SIDES';ui.msgT=1.2;return}
      const mine=R[ui.pick];const th=OR[ui.offer.i];
      const mi=myRoster().indexOf(mine),tj=C.rosters[ui.offer.ti].indexOf(th);
      if(mi<0||tj<0){ui.msg='PICK BOTH SIDES';ui.msgT=1.2;return}
      ui.review={mine,th,ti:ui.offer.ti,mi,tj};return}
    return;
  }
}

function careerDraw(){
  if(G.st==='ccoach')drawCName();
  else if(G.st==='cteam')drawCTeamPick();
  else if(G.st==='chub')drawCHub();
  else if(G.st==='cstaff')drawCCoach();
  else if(G.st==='croster')drawCRoster();
  else if(G.st==='cplayer')drawCPlayer();
  else if(G.st==='cfront')drawCFront();
  else if(G.st==='cdraft')drawCDraft();
  else if(G.st==='cscout')drawCScout();
  else if(G.st==='cfa')drawCFA();
  else if(G.st==='ccontract')drawCContract();
  else if(G.st==='ctrade')drawCTrade();
  coachBox(G.st==='ccoach');
}

// hooks
function careerTick(dt){if(ui.msgT>0)ui.msgT=Math.max(0,ui.msgT-dt);
  if(typeof PT==='undefined'||!(ui.maxScr>0))return;
  let drag=null;for(const p of PT.values())if(p.kind==='tap'){drag=p;break}
  if(drag&&drag.moved>10){if(drag._ss==null)drag._ss=ui.scroll;ui.scroll=Math.max(0,Math.min(ui.maxScr,drag._ss-(drag.y-drag.sy)))}
}
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
