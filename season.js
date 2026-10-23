// PIXEL BLITZ v15: 32-team season mode (original team names), standings, schedule, playoffs
(function(){
const CITY=["Phoenix", "Atlanta", "Baltimore", "Buffalo", "Charlotte", "Chicago", "Cincinnati", "Cleveland", "Arlington", "Denver", "Detroit", "Green Bay", "Houston", "Indianapolis", "Jacksonville", "Kansas City", "Las Vegas", "Los Angeles", "Anaheim", "Miami", "Minneapolis", "Boston", "New Orleans", "Brooklyn", "Jersey City", "Philadelphia", "Pittsburgh", "San Francisco", "Seattle", "Tampa", "Nashville", "Washington"];
const NICK=["Emberhawks", "Nightstrike", "Ironwake", "Frontier", "Volt", "Windfall", "Riverfangs", "Forge", "Stampede", "Peakrunners", "Motorknights", "Timberline", "Sunrail", "Gridlock", "Breakwater", "Railhorns", "Neonjacks", "Pacifire", "Goldrush", "Gulfstream", "Northwall", "Harborguard", "Jazzfire", "Colossus", "Stormrail", "Bellforge", "Riveters", "Fogline", "Rainforge", "Stormcap", "Soundwave", "Monumentals"];
const AB=["PHX", "ATL", "BAL", "BUF", "CHA", "CHI", "CIN", "CLE", "ARL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC", "LV", "LA", "ANA", "MIA", "MIN", "BOS", "NO", "BKN", "JC", "PHI", "PIT", "SF", "SEA", "TB", "NSH", "WAS"];
const COL=[['#9b1b30','#111111','#ffffff','#ffffff'],['#d1102f','#111111','#111111','#c0c4c8'],['#3b1f73','#c9a227','#111111','#111111'],['#1f4fbf','#d6202f','#ffffff','#ffffff'],['#4fa3e0','#111111','#c0c4c8','#c0c4c8'],['#0e1f3d','#e05a12','#0e1f3d','#ffffff'],['#f26a1b','#111111','#111111','#ffffff'],['#4a2b1a','#f25c19','#f25c19','#ffffff'],
 ['#0b2a55','#1f5fbf','#c0c4c8','#c0c4c8'],['#f2611d','#0a2246','#0a2246','#ffffff'],['#0076b6','#b0b7bc','#b0b7bc','#b0b7bc'],['#1f4a2f','#ffb81c','#ffb81c','#ffb81c'],['#0b2240','#c8102e','#0b2240','#ffffff'],['#0a4a9a','#ffffff','#ffffff','#ffffff'],['#00788c','#d4a12a','#111111','#ffffff'],['#e31837','#ffb612','#e31837','#ffffff'],
 ['#111111','#a5acaf','#a5acaf','#a5acaf'],['#6ab4e8','#ffc20e','#ffffff','#ffc20e'],['#1e3fa8','#ffc72c','#1e3fa8','#ffc72c'],['#00a3ad','#f58220','#ffffff','#ffffff'],['#4f2683','#ffc62f','#4f2683','#ffffff'],['#0b2244','#c60c30','#b0b7bc','#b0b7bc'],['#111111','#c8aa76','#c8aa76','#c8aa76'],['#0b2265','#c8102e','#0b2265','#ffffff'],
 ['#125740','#111111','#125740','#ffffff'],['#004c54','#a5acaf','#004c54','#ffffff'],['#111111','#ffb612','#111111','#ffb612'],['#aa0000','#b3995d','#b3995d','#b3995d'],['#0b2240','#69be28','#0b2240','#a5acaf'],['#c8102e','#ff7900','#5a5850','#5a5850'],['#0c2340','#4b92db','#ffffff','#ffffff'],['#6b1a26','#ffb612','#6b1a26','#ffb612']];
const RAT=[80,79,90,88,74,78,84,79,85,81,89,86,83,80,77,91,75,82,84,82,85,78,76,73,76,90,87,88,81,83,72,84];
const CONF=['BLITZ CONFERENCE','PIXEL CONFERENCE'],CABR=['BLITZ','PIXEL'],DIVN=['NORTH','EAST','SOUTH','WEST'];
const DIVS=[[[2,6,7,26],[3,19,21,24],[12,13,14,30],[9,15,16,17]],[[5,10,11,20],[8,23,25,31],[1,4,22,29],[0,18,27,28]]];
TEAMS.length=0;CITY.forEach((c,i)=>TEAMS.push({n:(c+' '+NICK[i]).toUpperCase(),city:c.toUpperCase(),nick:NICK[i].toUpperCase(),a:AB[i],c1:COL[i][0],c2:COL[i][1],h:COL[i][2],p:COL[i][3],rat:RAT[i],r:(window.ROSTERS||[])[i]||{}}));
const confOf=t=>DIVS[0].flat().includes(t)?0:1,divOf=t=>DIVS[confOf(t)].findIndex(d=>d.includes(t));
window.SEASON_TEAMS=()=>TEAMS.map((t,i)=>({i,name:t.city+' '+t.nick,a:t.a,conf:CABR[confOf(i)],div:DIVN[divOf(i)]}));
// ---------- season data ----------
const KEY='pb_season';let S=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{S=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){S=null}return S}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makeSchedule(){const weeks=[];
 // 6 division weeks (double round robin inside each 4-team division)
 const rr4=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]];
 for(let r=0;r<6;r++){const wk=[];DIVS.forEach(cf=>cf.forEach(d=>rr4[r%3].forEach(([a,b])=>wk.push(r<3?[d[a],d[b]]:[d[b],d[a]]))));weeks.push(wk)}
 // 11 weeks from a circle-method round robin, skipping divisional pairings where possible
 const ids=shuffle([...Array(32).keys()]);const rounds=[];for(let r=0;r<31;r++){const wk=[];for(let i=0;i<16;i++){const a=ids[i],b=ids[31-i];wk.push(r%2?[a,b]:[b,a])}rounds.push(wk);ids.splice(1,0,ids.pop())}
 const sameDiv=(a,b)=>confOf(a)===confOf(b)&&divOf(a)===divOf(b);rounds.sort((x,y)=>x.filter(p=>sameDiv(...p)).length-y.filter(p=>sameDiv(...p)).length);
 for(let r=0;r<11;r++)weeks.push(rounds[r]);return shuffle(weeks)}
function newSeason(team,diff){S={v:1,team,diff,week:0,sched:makeSchedule(),res:[],rec:TEAMS.map(()=>({w:0,l:0,t:0,pf:0,pa:0})),phase:'reg',po:null,champ:null,last:null};save()}
function teamScore(r,oppR){let p=0;const tdP=0.21+(r-oppR)*0.008,fgP=0.17;for(let d=0;d<11;d++){const x=Math.random();if(x<tdP)p+=Math.random()<0.94?7:(Math.random()<0.5?8:6);else if(x<tdP+fgP)p+=3}return p}
function simGame(a,b,po){let sa=teamScore(TEAMS[a].rat+1.5,TEAMS[b].rat),sb=teamScore(TEAMS[b].rat,TEAMS[a].rat);if(sa===sb&&(po||Math.random()<0.85)){if(Math.random()<0.5+(TEAMS[a].rat-TEAMS[b].rat)*0.02)sa+=3;else sb+=3}return[sa,sb]}
function record(a,b,sa,sb){const A=S.rec[a],B=S.rec[b];A.pf+=sa;A.pa+=sb;B.pf+=sb;B.pa+=sa;if(sa>sb){A.w++;B.l++}else if(sb>sa){B.w++;A.l++}else{A.t++;B.t++}}
function myGame(){if(S.phase==='reg'){const wk=S.sched[S.week];if(!wk)return null;const g=wk.find(p=>p.includes(S.team));return g?{home:g[0],away:g[1],opp:g[0]===S.team?g[1]:g[0],atHome:g[0]===S.team}:null}
 if(S.phase==='po'){const m=curPOMatch();return m?{home:m[0],away:m[1],opp:m[0]===S.team?m[1]:m[0],atHome:m[0]===S.team}:null}return null}
function finishWeek(my){const wk=S.sched[S.week];const out=[];wk.forEach(([a,b])=>{let sa,sb;if(my&&(a===S.team||b===S.team)){sa=a===S.team?my[0]:my[1];sb=a===S.team?my[1]:my[0]}else[sa,sb]=simGame(a,b,false);record(a,b,sa,sb);out.push([a,b,sa,sb])});S.res[S.week]=out;S.week++;if(S.week>=S.sched.length)startPlayoffs();save()}
function pct(t){const r=S.rec[t];const g=r.w+r.l+r.t;return g?(r.w+r.t*0.5)/g:0}
function sortTeams(ts){return ts.slice().sort((a,b)=>pct(b)-pct(a)||(S.rec[b].pf-S.rec[b].pa)-(S.rec[a].pf-S.rec[a].pa)||TEAMS[b].rat-TEAMS[a].rat)}
function seeds(c){const winners=sortTeams(DIVS[c].map(d=>sortTeams(d)[0]));const rest=sortTeams(DIVS[c].flat().filter(t=>!winners.includes(t))).slice(0,3);return winners.concat(rest)}
function startPlayoffs(){S.phase='po';S.po={seeds:[seeds(0),seeds(1)],round:0,games:[[],[],[],[]]};buildRound();}
function buildRound(){const P=S.po,r=P.round,g=[];
 if(r<3){for(let c=0;c<2;c++){const sd=P.seeds[c];let alive;if(r===0){g.push([sd[1],sd[6],c],[sd[2],sd[5],c],[sd[3],sd[4],c])}else{alive=P.games[r-1].filter(x=>x[2]===c).map(x=>x[5]);if(r===1)alive=[sd[0]].concat(alive);alive.sort((a,b)=>sd.indexOf(a)-sd.indexOf(b));
   if(r===1)g.push([alive[0],alive[3],c],[alive[1],alive[2],c]);else g.push([alive[0],alive[1],c])}}}
 else{const w=c=>P.games[2].find(x=>x[2]===c)[5];g.push([w(0),w(1),2])}
 P.games[r]=g.map(x=>[x[0],x[1],x[2],null,null,null]);save()}
function curPOMatch(){if(!S.po)return null;return S.po.games[S.po.round].find(x=>(x[0]===S.team||x[1]===S.team)&&x[3]===null)||null}
function playRound(my){const P=S.po,r=P.round;P.games[r].forEach(x=>{if(x[3]!==null)return;let sa,sb;if(my&&(x[0]===S.team||x[1]===S.team)){sa=x[0]===S.team?my[0]:my[1];sb=x[0]===S.team?my[1]:my[0]}else[sa,sb]=simGame(x[0],x[1],true);x[3]=sa;x[4]=sb;x[5]=sa>sb?x[0]:x[1]});
 if(r===3){S.phase='done';S.champ=P.games[3][0][5]}else{P.round++;buildRound()}save()}
function alive(){if(S.phase!=='po')return false;return !!curPOMatch()}
const RND=['WILD CARD','DIVISIONAL','CONFERENCE','PIXEL BOWL'];
// ---------- game hooks ----------
lvlStr=function(){const g=S&&G.season?myGame():null;const opp=g?TEAMS[g.opp].rat:80;return (opp-80)*0.006+(S&&S.phase==='po'?0.03:0)};
const _fin=finish;finish=function(){if(!G.season)return _fin();
 if(G.sh===G.sa&&S.phase==='po'){G.q++;G.clock=Math.round(QLEN/2);G.st='result';G.resT=0.1;G.next='down';G.los=25;G.down=1;G.togo=10;banner('OVERTIME','PLAYOFFS NEED A WINNER');G.otFlag=true;return}
 const g=myGame();const my=[G.sh,G.sa];G.lastWeekLabel=S.phase==='reg'?'WEEK '+(S.week+1):RND[S.po.round];
 if(S.phase==='reg')finishWeek(my);else if(S.phase==='po')playRound(my);
 S.last={opp:g.opp,us:G.sh,them:G.sa,lab:G.lastWeekLabel};save();G.unlockMsg=G.sh>G.sa?'WIN':G.sh<G.sa?'LOSS':'TIE'};
function nm(t,k){const r=TEAMS[t].r||{};const v=r[k]||'';return v}
function last(s){return (s||'').split(' ').slice(-1)[0].toUpperCase()}
function nameTeam(){if(!G.season||!G.players)return;const h=G.home,a=G.away;const wr=['WR1','WR2','TE'],ol=['LT','LG','C','RG','RT'],dl=['DE1','DT1','DT2','DE2'],lb=['OLB1','MLB','OLB2'],cb=['CB1','CB2','FS'],s=['FS','SS'];const c={};
 G.players.forEach(p=>{const k=(p.team?'d':'o')+p.role;const i=c[k]=(c[k]||0);c[k]++;let key='';
  if(p.team===0){key=p.role==='QB'?'QB':p.role==='RB'?(G.play&&G.play.t==='ko'?'WR2':'RB'):p.role==='WR'?wr[i%3]:p.role==='OL'?ol[i%5]:p.role==='K'?'K':''}
  else{key=p.role==='DL'?dl[i%4]:p.role==='LB'?(p.kicker?'K':lb[i%3]):p.role==='CB'?cb[i%3]:p.role==='S'?(p.kicker?'K':s[i%2]):''}
  p.nm=nm(p.team?a:h,key)})}
window.__nameTeam=nameTeam;['setupPlay','startKickoff'].forEach(f=>{const o=window[f];if(!o)return;window[f]=function(){const r=o.apply(this,arguments);nameTeam();return r}});
// ---------- update / screens ----------
const MENU=['modesel','team','hub','standings','schedule','bracket','career','cteam','chub','croster','cplayer','cfront','cdraft','cfa','ccontract','ctrade'];window.MENU_ST=st=>st==='title'||MENU.includes(st)||(window.__career&&window.__career.CMENU.includes(st));
let sel=0,tab=0,scroll=0,teamDiff=1;
function hitR(t,x,y,w,h){return t&&t[0]>=x&&t[0]<=x+w&&t[1]>=y&&t[1]<=y+h}
function gridPos(i){const cols=4,cw=(W-24)/cols,rh=54;return[12+(i%cols)*cw,136+Math.floor(i/cols)*rh,cw-6,rh-6]}
function startMyGame(){const g=myGame();if(!g)return;G.season=true;if(window.__career&&window.__career.get())G.career=true;G.home=S.team;G.away=g.opp;G.diff=S.diff;G.lvl=1;
 Object.assign(G,{sh:0,sa:0,drive:0,q:1,clock:QLEN,aud:4,los:25,down:1,togo:10,log:[],stats:{py:0,ry:0,td:0,int:0,sack:0},two:false,fgDone:false,paused:false});G.st='vs';G.vsT=0}
window.startMyGame=startMyGame;
const _u=update;update=function(dt){
 if(G.st==='title'&&!G.paused){const taps=IN.taps.splice(0);IN.keyp.splice(0);G.t+=dt;if(taps.length){G.st='modesel'}return}
 if(G.st==='vs'){G.t+=dt;G.vsT+=dt;const taps=IN.taps.splice(0);IN.keyp.splice(0);if(G.vsT>2.2||(taps.length&&G.vsT>0.5)){startKickoff()}return}
 if(G.st==='final'&&G.season){G.t+=dt;const taps=IN.taps.splice(0);IN.keyp.splice(0);if(taps.length){G.season=false;G.st=(G.career?'chub':'hub')}return}
 if(MENU.includes(G.st)&&!G.paused){G.t+=dt;const taps=IN.taps.splice(0);IN.keyp.splice(0);if(window.__career&&window.__career.CMENU.includes(G.st)){if(window.__career.tick)window.__career.tick(dt);for(const tp of taps){if(!tp)continue;window.__career.tap(tp)}return}for(const tp of taps){if(!tp)continue;menuTap(tp)}return}
 if(G.otFlag&&G.st==='result'){G.otFlag=false}
 _u(dt)};
function menuTap(t){const[x,y]=t;
 if(G.st==='modesel'){if(hitR(t,40,270,W-80,84)){G.career=false;load();if(S&&S.v===1)G.st='hub';else{sel=0;G.st='team'}return}
  if(hitR(t,40,410,W-80,84)){G.career=true;load();const C=window.__career&&window.__career.load();if(C&&C.v>=2){G.st='chub';window.__career.applyRatings();if(!S||!S.v){window.__season.newSeason(C.team,C.diff||1);const Ss=window.__season.get();if(Ss){Ss.career=true;Ss.year=C.year||1;window.__season.save()}}}else G.st='cteam';return}return}
 if(G.st==='career'){if(hitR(t,40,700,W-80,56)){G.career=false;G.st='modesel'}return}
 if(G.st==='team'){for(let i=0;i<32;i++){const[a,b,w,h]=gridPos(i);if(hitR(t,a,b,w,h)){sel=i;return}}
  const bw=(W-32)/4;for(let i=0;i<4;i++)if(hitR(t,16+i*bw,690,bw,40)){teamDiff=i;return}
  if(hitR(t,40,750,W-80,56)){newSeason(sel,teamDiff);G.st='hub'}if(S&&hitR(t,8,40,90,40)&&S.v===1)G.st='hub';return}
 if(G.st==='hub'){if(hitR(t,30,520,W-60,64)){if(S.phase==='done'||(S.phase==='po'&&!alive())){finishOutPlayoffs();return}startMyGame();return}
  const bw=(W-60-16)/3;['standings','schedule','bracket'].forEach((s,i)=>{if(hitR(t,30+i*(bw+8),604,bw,52))G.st=s,scroll=0});
  if(hitR(t,W/2-80,780,160,34)){S=null;localStorage.removeItem(KEY);sel=0;G.st='team'}return}
 if(hitR(t,12,40,90,40)){G.st=G.career?'chub':'hub';return}
 if(G.st==='standings'){if(hitR(t,W/2-150,92,150,34))tab=0;if(hitR(t,W/2,92,150,34))tab=1;return}
 if(G.st==='schedule'){return}
 if(G.st==='bracket'){return}}
function finishOutPlayoffs(){while(S.phase==='po')playRound(null);G.st='bracket'}
// ---------- drawing ----------
function bg(){const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0a26');g.addColorStop(1,'#1a0f33');X.fillStyle=g;X.fillRect(0,0,W,H);stars();for(let y=0;y<H;y+=4){X.fillStyle='rgba(0,0,0,.12)';X.fillRect(0,y,W,1)}}
function hdr(s){txt(s,W/2,62,24,PAL.yel)}
function back(){btn(12,40,90,40,'< BACK','#2b3a7a','#8fc4ff',13)}
function recStr(t){const r=S.rec[t];return r.w+'-'+r.l+(r.t?'-'+r.t:'')}
function drawModeSel(){bg();
 uiTxt('PIXEL BLITZ',W/2,110,30,PAL.yel,'center');uiTxt('CHOOSE YOUR PATH',W/2,148,14,PAL.cy,'center',false);
 btn(36,250,W-72,100,'ARCADE','#1f6fd6','#fff',28);
 uiTxt('Pick a team and play now',W/2,372,13,'#c9d4ff','center',false);
 btn(36,410,W-72,100,'CAREER','#c8102e','#fff',28);
 uiTxt('Coach, draft, build a dynasty',W/2,532,13,'#ffd0d6','center',false);
 uiTxt('Contracts  ·  Free Agents  ·  Trades',W/2,590,12,'#8a93b8','center',false)}
function drawCareer(){bg();hdr('CAREER MODE');txt('YOU ARE THE COACH',W/2,120,16,PAL.cy,'center',false);
 txt('DRAFT  ·  CONTRACTS  ·  FREE AGENTS  ·  TRADES',W/2,160,11,'#9fb3ff','center',false);
 box(30,220,W-60,280,'#120a24',PAL.yel);
 txt('CAREER IS LIVE',W/2,300,22,PAL.yel);txt('Use Career on the mode select screen.',W/2,340,13,PAL.txt);txt('Draft · contracts · free agents · trades.',W/2,370,13,PAL.txt);
 btn(40,700,W-80,56,'BACK TO MODES','#2b3a7a','#8fc4ff',16)}
function drawTeam(){bg();txt('PICK YOUR TEAM',W/2,60,24,PAL.yel);txt('32 TEAMS  -  17 GAMES  -  PLAYOFFS',W/2,92,11,PAL.cy,'center',false);txt('TAP A HELMET',W/2,118,10,'#9fb3ff','center',false);
 for(let i=0;i<32;i++){const[a,b,w,h]=gridPos(i);const on=i===sel;pill(a,b,w,h,on?'#2a1450':'rgba(18,10,36,.9)',on?PAL.yel:TEAMS[i].c1);HELM.drawHelmet(X,a+w/2,b+19,30,TEAMS[i],false,i);txt(TEAMS[i].a,a+w/2,b+h-9,11,on?PAL.yel:'#fff','center',false)}
 const t=TEAMS[sel];pill(16,602,W-32,72,'#120a24',t.c1);uiTxt(t.city,W/2,622,13,'#c9d4ff','center',false);uiTxt(t.nick,W/2,646,22,'#fff');txt('OVR '+t.rat+'   '+CABR[confOf(sel)]+' '+DIVN[divOf(sel)]+'   QB '+last(t.r.QB),W/2,664,10,PAL.cy,'center',false);
 const bw=(W-32)/4;DIFFS.forEach((d,i)=>{const x=16+i*bw;box(x+3,690,bw-6,40,teamDiff===i?PAL.pink:'#120a24',teamDiff===i?PAL.yel:'#5a4a8a');txt(d.n,x+bw/2,710,d.n.length>5?11:13,PAL.txt)});
 btn(40,750,W-80,56,'START SEASON','#ff4f7a','#ffd0dc',20)}
function drawHub(){bg();const t=TEAMS[S.team];hdr(t.nick);txt(t.city,W/2,36,12,'#c9d4ff','center',false);
 HELM.drawHelmet(X,W/2,150,110,t,false,S.team);txt('RECORD  '+recStr(S.team),W/2,226,20,'#fff');txt(DIFFS[S.diff].n+'  -  '+CABR[confOf(S.team)]+' '+DIVN[divOf(S.team)],W/2,252,11,PAL.cy,'center',false);
 if(S.last){const L=S.last;const w=L.us>L.them;txt('LAST: '+L.lab+'  '+(w?'W':L.us<L.them?'L':'T')+' '+L.us+'-'+L.them+' VS '+TEAMS[L.opp].a,W/2,278,12,w?'#5dff8a':'#ff6a7a','center',false)}
 let label='PLAY',sub='';const g=myGame();
 if(S.phase==='reg'){sub='WEEK '+(S.week+1)+' OF 17'}else if(S.phase==='po'){sub=alive()?RND[S.po.round]:'ELIMINATED'}else sub='SEASON COMPLETE';
 pill(30,300,W-60,200,'rgba(18,10,36,.92)','#4fa3ff');txt(sub,W/2,322,14,PAL.yel,'center',false);
 if(g&&(S.phase==='reg'||alive())){const o=TEAMS[g.opp];HELM.drawHelmet(X,110,400,80,t,false,S.team);HELM.drawHelmet(X,W-110,400,80,o,true,g.opp);txt('VS',W/2,400,28,PAL.pink);txt(t.a+' '+recStr(S.team),110,456,12,'#fff','center',false);txt(o.a+' '+recStr(g.opp),W-110,456,12,'#fff','center',false);txt((g.atHome?'HOME':'AWAY')+'  -  '+o.city+' '+o.nick,W/2,482,11,'#c9d4ff','center',false);label='PLAY GAME'}
 else if(S.phase==='done'){txt('CHAMPIONS',W/2,360,16,'#c9d4ff','center',false);HELM.drawHelmet(X,W/2,420,80,TEAMS[S.champ],false,S.champ);txt(TEAMS[S.champ].city+' '+TEAMS[S.champ].nick,W/2,476,14,PAL.yel);label='VIEW BRACKET'}
 else{txt(S.phase==='po'?'YOUR SEASON IS OVER':'',W/2,400,16,'#ff6a7a');label='SIM PLAYOFFS'}
 btn(30,520,W-60,64,label,'#ff4f7a','#ffd0dc',22);
 const bw=(W-60-16)/3;['STANDINGS','SCHEDULE','BRACKET'].forEach((s,i)=>btn(30+i*(bw+8),604,bw,52,s,'#1f6fd6','#8fc4ff',12));
 txt('PROGRESS SAVES AUTOMATICALLY',W/2,690,10,'#8a7ab0','center',false);btn(W/2-80,780,160,34,'NEW SEASON','#3a2a6a','#8a7ab0',11)}
function drawStandings(){bg();hdr('STANDINGS');back();btn(W/2-150,92,148,34,'BLITZ','#'+(tab?'2b3a7a':'ff4f7a'),'#fff',13);btn(W/2+2,92,148,34,'PIXEL','#'+(tab?'ff4f7a':'2b3a7a'),'#fff',13);
 const sd=S.phase!=='reg'&&S.po?S.po.seeds[tab]:seeds(tab);
 const nameW=W-168; // leave room for W-L-T + PF + PA columns
 DIVS[tab].forEach((d,di)=>{const y0=146+di*170;pill(12,y0,W-24,160,'rgba(18,10,36,.92)','#4a3a8a');
  uiTxt(DIVN[di],28,y0+16,13,PAL.yel,'left',false);
  uiTxt('W-L-T',W-118,y0+16,10,'#9fb3ff','center',false);uiTxt('PF',W-70,y0+16,10,'#9fb3ff','center',false);uiTxt('PA',W-34,y0+16,10,'#9fb3ff','center',false);
  sortTeams(d).forEach((ti,i)=>{const y=y0+40+i*31,me=ti===S.team;if(me)rect(16,y-13,W-32,27,'rgba(255,79,163,.25)');rect(22,y-8,6,16,TEAMS[ti].c1);
   const s=sd.indexOf(ti);let nm=(s>=0?(s+1)+'. ':'')+TEAMS[ti].a+' '+TEAMS[ti].nick;
   // truncate so never overlaps record column
   X.font='800 12px "Trebuchet MS",Arial';while(X.measureText(nm).width>nameW-50&&nm.length>6)nm=nm.slice(0,-1);
   if(nm.length<((s>=0?(s+1)+'. ':'')+TEAMS[ti].a+' '+TEAMS[ti].nick).length)nm=nm.replace(/\.?$/,'');
   uiTxt(nm,36,y,12,me?PAL.yel:'#fff','left',false);
   const r=S.rec[ti];uiTxt(r.w+'-'+r.l+'-'+r.t,W-118,y,12,'#fff','center',false);uiTxt(String(r.pf),W-70,y,11,'#c9d4ff','center',false);uiTxt(String(r.pa),W-34,y,11,'#c9d4ff','center',false)})});
 uiTxt('Number = current playoff seed',W/2,H-24,11,'#8a7ab0','center',false)}
function drawSchedule(){bg();hdr('SCHEDULE');back();for(let w=0;w<17;w++){const g=S.sched[w].find(p=>p.includes(S.team));const opp=g[0]===S.team?g[1]:g[0],home=g[0]===S.team;const y=112+w*40;const cur=w===S.week&&S.phase==='reg';
  pill(12,y,W-24,34,cur?'#2a1450':'rgba(18,10,36,.9)',cur?PAL.yel:'#3a2a6a');txt('WK '+(w+1),22,y+17,11,'#9fb3ff','left',false);rect(76,y+9,6,16,TEAMS[opp].c1);txt((home?'VS ':'AT ')+TEAMS[opp].city+' '+TEAMS[opp].nick,88,y+17,11,'#fff','left',false);
  const r=S.res[w]&&S.res[w].find(x=>x[0]===S.team||x[1]===S.team);if(r){const us=r[0]===S.team?r[2]:r[3],th=r[0]===S.team?r[3]:r[2];txt((us>th?'W ':us<th?'L ':'T ')+us+'-'+th,W-22,y+17,12,us>th?'#5dff8a':us<th?'#ff6a7a':'#fff','right',false)}else if(cur)txt('NEXT',W-22,y+17,11,PAL.yel,'right',false)}}
function drawBracket(){bg();hdr('PLAYOFFS');back();
 if(!S.po){const p=[seeds(0),seeds(1)];txt('IF THE SEASON ENDED TODAY',W/2,104,12,PAL.cy,'center',false);p.forEach((sd,c)=>{const x=c?W/2+6:12;pill(x,124,W/2-18,300,'rgba(18,10,36,.92)','#4a3a8a');txt(CABR[c],x+(W/2-18)/2,142,13,PAL.yel,'center',false);sd.forEach((t,i)=>{const y=172+i*36;rect(x+10,y-8,6,16,TEAMS[t].c1);txt((i+1)+'  '+TEAMS[t].a+'  '+recStr(t),x+22,y,13,t===S.team?PAL.yel:'#fff','left',false)})});return}
 const P=S.po;const colX=[8,8+(W-16)/4,8+(W-16)/2,8+3*(W-16)/4],cw=(W-16)/4-4;['WILD CARD','DIVISION','CONF','FINAL'].forEach((s,i)=>txt(s,colX[i]+cw/2,100,9,'#9fb3ff','center',false));
 const slot=(x,y,g)=>{const box2=(t,yy,sc,win)=>{pill(x,yy,cw,22,win?'#2a1450':'rgba(18,10,36,.92)',t===S.team?PAL.yel:TEAMS[t].c1);txt(TEAMS[t].a,x+6,yy+11,10,'#fff','left',false);if(sc!==null)txt(String(sc),x+cw-6,yy+11,10,win?'#5dff8a':'#c9d4ff','right',false)};box2(g[0],y,g[3],g[5]===g[0]);box2(g[1],y+24,g[4],g[5]===g[1])};
 for(let c=0;c<2;c++){const y0=c?470:120;txt(CABR[c]+'  (1 SEED BYE: '+TEAMS[P.seeds[c][0]].a+')',W/2,y0,10,PAL.cy,'center',false);
  for(let r=0;r<3;r++){const gs=(P.games[r]||[]).filter(g=>g[2]===c);gs.forEach((g,i)=>slot(colX[r],y0+18+i*(r===0?96:r===1?140:0)+(r===1?40:r===2?100:0),g))}}
 if(P.games[3]&&P.games[3][0])slot(colX[3],400,P.games[3][0]);if(S.champ!==null&&S.champ!==undefined)txt('CHAMPION: '+TEAMS[S.champ].city+' '+TEAMS[S.champ].nick,W/2,H-30,13,PAL.yel)}
function drawVS(){bg();const t=TEAMS[G.home],o=TEAMS[G.away];const k=Math.min(1,G.vsT/0.35);X.save();X.fillStyle=t.c1;X.beginPath();X.moveTo(0,0);X.lineTo(W*(0.75*k),0);X.lineTo(W*(0.25*k),H);X.lineTo(0,H);X.fill();X.fillStyle=o.c1;X.beginPath();X.moveTo(W,0);X.lineTo(W-W*0.25*k,0);X.lineTo(W-W*0.75*k,H);X.lineTo(W,H);X.fill();
 X.strokeStyle='#fff';X.lineWidth=6;X.beginPath();X.moveTo(W*0.75,0);X.lineTo(W*0.25,H);X.stroke();for(let y=0;y<H;y+=4){X.fillStyle='rgba(0,0,0,.1)';X.fillRect(0,y,W,1)}
 HELM.drawHelmet(X,110-(1-k)*200,250,150,t,false,G.home);HELM.drawHelmet(X,W-110+(1-k)*200,600,150,o,true,G.away);
 txt(t.city,110,350,13,'#fff');txt(t.nick,110,374,20,'#fff');txt(recStr(G.home),110,398,13,'#fff');txt(o.city,W-110,452,13,'#fff');txt(o.nick,W-110,476,20,'#fff');txt(recStr(G.away),W-110,500,13,'#fff');
 const s=G.vsT<0.5?3-4*G.vsT:1;X.translate(W/2,H/2-10);X.scale(s,s);txt('VS',0,0,64,PAL.yel);X.restore();txt(S.phase==='po'?RND[S.po.round]:'WEEK '+(S.week+1),W/2,H-60,16,'#fff')}
const _r=render;render=function(){if(MENU.includes(G.st)||G.st==='vs'||(G.st==='title'&&false)){X.setTransform(DPR,0,0,DPR,0,0);X.save();
  if(G.st==='modesel')drawModeSel();else if(G.st==='career')drawCareer();else if(window.__career&&window.__career.CMENU.includes(G.st))window.__career.draw();else if(G.st==='team')drawTeam();else if(G.st==='hub')drawHub();else if(G.st==='standings')drawStandings();else if(G.st==='schedule')drawSchedule();else if(G.st==='bracket')drawBracket();else if(G.st==='vs')drawVS();X.restore();return}
 _r();
 if(G.season&&(G.st==='live'||G.st==='result')&&window.PROJ){const c=G.carrier;if(c&&c.nm&&G.st==='live'&&!((G.hoA||0)>0.05&&c===G.qb)){const q=scr(c.x,c.y,3.6);X.save();X.setTransform(DPR,0,0,DPR,0,0);const s=last(c.nm);X.font='800 11px Trebuchet MS';const w=X.measureText(s).width+12;pill(q[0]-w/2,q[1]-34,w,16,'rgba(10,14,36,.85)','#ffd23f');txt(s,q[0],q[1]-26,11,'#fff','center',false);X.restore()}}
 if(G.st==='final'&&G.season){X.save();X.setTransform(DPR,0,0,DPR,0,0);rect(40,540,W-80,40,'#120a24');txt('TAP TO CONTINUE THE SEASON',W/2,560,13,PAL.cy);X.restore()}};
// carrier-change callouts with roster names
let prevC=null;const _u2=update;update=function(dt){_u2(dt);if(!G.season)return;const c=G.carrier;if(G.st==='live'&&c&&c!==prevC&&prevC&&c.nm&&c.team===0){const how=c.role==='WR'?'CATCH BY ':c.role==='RB'&&G.play&&G.play.t!=='ko'?'HANDOFF TO ':'';if(how)say(how+last(c.nm),1.1)}prevC=G.st==='live'?c:null};
window.DIVS=DIVS;window.DIVN=DIVN;window.CABR=CABR;window.confOf=confOf;window.divOf=divOf;
window.__season={get:()=>S,load,save,newSeason,finishWeek,startPlayoffs,playRound,seeds,myGame,sim:simGame};
})();
