/* Hockey Goalie Stats v5.88 - two-goalie match support. */
(function(){
'use strict';

const VERSION='5.88';
const clone=value=>JSON.parse(JSON.stringify(value));
const byId=id=>document.getElementById(id);
const goalCount=shots=>(shots||[]).filter(s=>String(s?.outcome||'').toLowerCase()==='goal').length;
const safeName=value=>String(value||'').trim();
let loadedMatchToken=null;

function primaryGoalie(){try{return goalie()}catch(error){return null}}
function currentMatch(){try{if(document.body.classList.contains('videoReviewMode')&&typeof window.v585CurrentVideoReviewMatch==='function')return window.v585CurrentVideoReviewMatch();return activeMatch()}catch(error){return null}}
function detailedAlternate(match){return !!(match?.multipleGoalies&&['existing','guest'].includes(match.alternateRecordingMode))}
function alternateShots(match){match.alternateAppearance=match.alternateAppearance||{shots:[],ratings:{}};match.alternateAppearance.shots=match.alternateAppearance.shots||[];return match.alternateAppearance.shots}
function selectedRecordingTarget(){const inVideo=document.body.classList.contains('videoReviewMode'),select=inVideo?byId('v583VideoRecordingGoalie'):byId('v583RecordingGoalie');return select?.value==='alternate'?'alternate':'primary'}

function installStyles(){
  if(byId('v583Styles'))return;
  const style=document.createElement('style');
  style.id='v583Styles';
  style.textContent='.v583Box{margin:18px 0;padding:16px;border:1px solid #43535d;border-radius:16px;background:#101b22}.v583Box h3{margin:0 0 12px}.v583Hidden{display:none!important}.v583Summary{margin-top:12px;padding:12px;border-radius:12px;background:#091319;border:1px solid #30414b}.v583Recording{margin-bottom:16px;border-color:#35c8df}.v583Recording b{color:#7de8f5}.v583InlineCheck{display:flex;align-items:center;gap:10px;font-weight:800}.v583InlineCheck input{width:auto}';
  document.head.appendChild(style);
}

function installMatchControls(){
  const details=document.querySelector('#match .card');
  if(!details||byId('v583MultiGoalieBox'))return;
  const action=Array.from(details.querySelectorAll('button')).find(button=>/Start \/ Save Match Details/i.test(button.textContent||''));
  if(!action)return;
  const box=document.createElement('div');
  box.id='v583MultiGoalieBox';
  box.className='v583Box v583Hidden';
  box.innerHTML='<h3>Alternate Goalie</h3><div id="v583AlternatePanel"><label>Record the alternate goalie’s full statistics?</label><select id="v583RecordAlternate"><option value="">Choose an option</option><option value="yes">Yes — record shots and statistics</option><option value="no">No — record goals conceded only</option></select><div id="v583DetailedAlternate" class="v583Hidden"><div class="grid2"><div><label>Alternate goalie</label><select id="v583AlternateType"><option value="existing">Existing goalie</option><option value="guest">Guest goalie</option></select></div><div id="v583ExistingWrap"><label>Existing goalie</label><select id="v583AlternateGoalie"></select></div></div><div id="v583GuestWrap" class="v583Hidden"><label>Guest goalie name</label><input id="v583GuestName" placeholder="Enter guest goalie name"></div><label>Alternate goalie minutes played</label><input id="v583AlternateMinutes" type="number" min="0" step="1" placeholder="Optional"></div><div id="v583GoalsOnly" class="v583Hidden"><label>Goals conceded by alternate goalie</label><input id="v583AlternateGoals" type="number" min="0" step="1" value="0"></div></div>';
  details.insertBefore(box,action);

  const recordCard=Array.from(document.querySelectorAll('#match .card')).find(card=>/^\s*Record Shot/i.test(card.textContent||''));
  if(recordCard&&!byId('v583RecordingBox')){
    const recording=document.createElement('div');
    recording.id='v583RecordingBox';
    recording.className='v583Box v583Recording v583Hidden';
    recording.innerHTML='<h3>Recording For</h3><select id="v583RecordingGoalie"></select><div class="small">Each shot is saved only against the selected goalie.</div>';
    recordCard.insertBefore(recording,recordCard.querySelector('label'));
  }

  const outcomes=Array.from(document.querySelectorAll('#match .card')).find(card=>/^\s*Match Outcomes/i.test(card.textContent||''));
  if(outcomes&&!byId('v583GoalieSummary')){
    const summary=document.createElement('div');
    summary.id='v583GoalieSummary';
    summary.className='v583Summary v583Hidden';
    outcomes.insertBefore(summary,outcomes.querySelector('h3'));
  }

  ['matchParticipation','v583RecordAlternate','v583AlternateType','v583AlternateGoalie','v583GuestName','v583AlternateMinutes','v583AlternateGoals','v583RecordingGoalie'].forEach(id=>byId(id)?.addEventListener('change',()=>{
    const match=currentMatch();
    if(match&&id==='v583RecordingGoalie'){match.recordingGoalieTarget=selectedRecordingTarget();saveDB()}
    refreshControls();
  }));
}

function populateExistingGoalies(selected){
  const select=byId('v583AlternateGoalie');
  if(!select)return;
  const primary=primaryGoalie();
  const options=(db.goalies||[]).filter(g=>g&&g.id!==primary?.id);
  select.innerHTML=options.length?options.map(g=>'<option value="'+esc(g.id)+'">'+esc(g.name||'Unnamed Goalie')+'</option>').join(''):'<option value="">No other goalie profiles</option>';
  if(selected&&options.some(g=>g.id===selected))select.value=selected;
}

function loadMatchConfig(match){
  if(!byId('v583RecordAlternate'))return;
  byId('v583RecordAlternate').value=!match?.multipleGoalies?'':(match.alternateRecordingMode==='goals_only'?'no':'yes');
  byId('v583AlternateType').value=match?.alternateRecordingMode==='guest'?'guest':'existing';
  populateExistingGoalies(match?.alternateGoalieId||'');
  byId('v583GuestName').value=match?.alternateRecordingMode==='guest'?(match.alternateGoalieName||''):'';
  byId('v583AlternateMinutes').value=match?.alternateAppearance?.minutesPlayed??'';
  byId('v583AlternateGoals').value=Number(match?.alternateGoalsConceded||0);
}

function refreshControls(){
  installStyles();installMatchControls();
  const match=currentMatch(),token=match?.id||'';
  if(token!==loadedMatchToken){loadedMatchToken=token;loadMatchConfig(match)}
  const multiple=byId('matchParticipation')?.value==='Partial match',answer=byId('v583RecordAlternate')?.value||'',type=byId('v583AlternateType')?.value||'existing';
  byId('v583MultiGoalieBox')?.classList.toggle('v583Hidden',!multiple);
  byId('v583DetailedAlternate')?.classList.toggle('v583Hidden',!multiple||answer!=='yes');
  byId('v583GoalsOnly')?.classList.toggle('v583Hidden',!multiple||answer!=='no');
  byId('v583ExistingWrap')?.classList.toggle('v583Hidden',type!=='existing');
  byId('v583GuestWrap')?.classList.toggle('v583Hidden',type!=='guest');
  const recordBox=byId('v583RecordingBox'),recordSelect=byId('v583RecordingGoalie');
  const detailed=multiple&&answer==='yes'&&(type==='guest'||!!byId('v583AlternateGoalie')?.value);
  recordBox?.classList.toggle('v583Hidden',!detailed);
  if(recordSelect&&detailed){
    const primaryName=primaryGoalie()?.name||'Primary goalie';
    const altName=type==='guest'?(safeName(byId('v583GuestName')?.value)||'Guest goalie'):((db.goalies||[]).find(g=>g.id===byId('v583AlternateGoalie')?.value)?.name||'Alternate goalie');
    const wanted=match?.recordingGoalieTarget||recordSelect.value||'primary';
    recordSelect.innerHTML='<option value="primary">'+esc(primaryName)+'</option><option value="alternate">'+esc(altName)+'</option>';
    recordSelect.value=wanted==='alternate'?'alternate':'primary';
  }
  renderSummary(match);
}

function validateConfig(){
  if(byId('matchParticipation')?.value!=='Partial match')return {multipleGoalies:false};
  const answer=byId('v583RecordAlternate')?.value;
  if(!answer){alert('Choose whether to record the alternate goalie’s full statistics.');return null}
  if(answer==='no')return {multipleGoalies:true,alternateRecordingMode:'goals_only',alternateGoalsConceded:Math.max(0,Number(byId('v583AlternateGoals')?.value||0))};
  const type=byId('v583AlternateType')?.value||'existing';
  if(type==='existing'){
    const id=byId('v583AlternateGoalie')?.value;
    const alternate=(db.goalies||[]).find(g=>g.id===id);
    if(!alternate){alert('Add or choose an existing alternate goalie.');return null}
    return {multipleGoalies:true,alternateRecordingMode:'existing',alternateGoalieId:id,alternateGoalieName:alternate.name||'Alternate goalie',alternateMinutesPlayed:byId('v583AlternateMinutes')?.value};
  }
  const name=safeName(byId('v583GuestName')?.value);
  if(!name){alert('Enter the guest goalie’s name.');return null}
  return {multipleGoalies:true,alternateRecordingMode:'guest',alternateGoalieName:name,alternateMinutesPlayed:byId('v583AlternateMinutes')?.value};
}

function applyConfig(match,config){
  if(!match||!config)return;
  match.multipleGoalies=!!config.multipleGoalies;
  if(!match.multipleGoalies){
    delete match.alternateRecordingMode;delete match.alternateGoalieId;delete match.alternateGoalieName;delete match.alternateGoalsConceded;delete match.alternateAppearance;delete match.recordingGoalieTarget;
    return;
  }
  match.sharedMatchId=match.sharedMatchId||('shared_'+uid());
  match.goalkeeperParticipation='Partial match';
  const participation=byId('matchParticipation');if(participation)participation.value='Partial match';
  match.alternateRecordingMode=config.alternateRecordingMode;
  match.alternateGoalieId=config.alternateGoalieId||'';
  match.alternateGoalieName=config.alternateGoalieName||'';
  match.alternateGoalsConceded=Number(config.alternateGoalsConceded||0);
  if(detailedAlternate(match)){
    match.alternateAppearance=match.alternateAppearance||{shots:[],ratings:{}};
    match.alternateAppearance.shots=match.alternateAppearance.shots||[];
    match.alternateAppearance.ratings=match.alternateAppearance.ratings||{};
    match.alternateAppearance.minutesPlayed=config.alternateMinutesPlayed===''?'':Number(config.alternateMinutesPlayed||0);
  }
}

function renderSummary(match){
  const el=byId('v583GoalieSummary');if(!el)return;
  if(!match?.multipleGoalies){el.classList.add('v583Hidden');el.innerHTML='';return}
  el.classList.remove('v583Hidden');
  const primaryGoals=goalCount(match.shots),primaryShots=(match.shots||[]).length;
  if(match.alternateRecordingMode==='goals_only'){
    el.innerHTML='<b>Two-goalie match</b><br>'+esc(primaryGoalie()?.name||'Primary goalie')+': '+primaryShots+' shot records, '+primaryGoals+' goals conceded<br>Alternate goalie: '+Number(match.alternateGoalsConceded||0)+' goals conceded (shots not recorded)';
    return;
  }
  const alt=match.alternateAppearance||{shots:[]},altGoals=goalCount(alt.shots),altShots=(alt.shots||[]).length;
  el.innerHTML='<b>Two-goalie match</b><br>'+esc(primaryGoalie()?.name||'Primary goalie')+': '+primaryShots+' shot records, '+primaryGoals+' goals conceded<br>'+esc(match.alternateGoalieName||'Alternate goalie')+': '+altShots+' shot records, '+altGoals+' goals conceded';
}

function totalOpponentGoals(match){
  const primary=goalCount(match?.shots);
  if(!match?.multipleGoalies)return primary;
  return primary+(match.alternateRecordingMode==='goals_only'?Number(match.alternateGoalsConceded||0):goalCount(match.alternateAppearance?.shots));
}

function moveNewestShotToAlternate(match,beforeIds){
  if(!match||selectedRecordingTarget()!=='alternate'||!detailedAlternate(match))return false;
  const index=(match.shots||[]).findIndex(s=>!beforeIds.has(s.id));
  if(index<0)return false;
  const shot=match.shots.splice(index,1)[0];
  shot.period=shot.period||Math.max(1,(match.periodMarkers||[]).length+1);
  shot.recordedAt=shot.recordedAt||shot.time||new Date().toISOString();
  alternateShots(match).push(shot);
  match.orderItems=match.orderItems||[];
  const sharedOrderItem=match.orderItems.find(item=>item?.kind==='shot'&&item.id===shot.id);
  if(sharedOrderItem){sharedOrderItem.goalieTarget='alternate';sharedOrderItem.period=shot.period}
  else match.orderItems.push({kind:'shot',id:shot.id,goalieTarget:'alternate',period:shot.period});
  match.timeline=(match.timeline||[]).filter(item=>item?.shotId!==shot.id);
  match.alternateAppearance.orderItems=match.alternateAppearance.orderItems||[];
  match.alternateAppearance.timeline=match.alternateAppearance.timeline||[];
  match.alternateAppearance.orderItems.push({kind:'shot',id:shot.id,period:shot.period});
  match.alternateAppearance.timeline.push({eventType:'shot',shotId:shot.id,outcome:shot.outcome,type:shot.type,shotSituation:shot.shotSituation,outnumbered:shot.outnumbered,rebound:shot.rebound,time:shot.time,period:shot.period,videoReview:shot.videoReview});
  match.recordingGoalieTarget='alternate';
  saveDB();renderAll();updateOpponentGoalsDisplay();renderSummary(match);
  if(byId('shotStatus'))showStatus('shotStatus','Shot saved for '+(match.alternateGoalieName||'alternate goalie')+'.');
  return true;
}

function teamProfileFor(g,name){
  const profiles=Array.isArray(g?.teamProfiles)?g.teamProfiles:[];
  return profiles.find(profile=>String(profile?.name||'')===String(name||''))||null;
}

function materializeExistingAlternate(primary,match){
  if(match?.alternateRecordingMode!=='existing'||!match.alternateGoalieId)return;
  const alt=(db.goalies||[]).find(g=>g.id===match.alternateGoalieId);if(!alt)return;
  alt.matches=alt.matches||[];
  let mirror=alt.matches.find(item=>item.sharedMatchId===match.sharedMatchId&&item.sharedRole==='alternate');
  if(!mirror){mirror={id:'alternate_'+match.sharedMatchId,benchmarkMatchId:benchmarkUuid566('match_')};alt.matches.push(mirror)}
  const profile=teamProfileFor(alt,match.homeTeam);
  Object.assign(mirror,{
    date:match.date,homeTeam:match.homeTeam,opponentTeam:match.opponentTeam,opponent:match.opponentTeam,name:match.name,
    shots:clone(match.alternateAppearance?.shots||[]),ratings:clone(match.alternateAppearance?.ratings||{}),homeGoals:match.homeGoals,
    oppGoals:match.oppGoals,opponentGoals:match.oppGoals,result:match.result,periods:match.periods,periodChoice:match.periodChoice,
    periodMarkers:clone(match.periodMarkers||[]),orderItems:clone(match.alternateAppearance?.orderItems||[]),timeline:clone(match.alternateAppearance?.timeline||[]),
    matchType:match.matchType,goalkeeperParticipation:'Partial match',minutesPlayed:match.alternateAppearance?.minutesPlayed??'',
    goalieAgeGroupAtMatch:benchmarkAgeAtMatch566(alt,match),goalieTeamLevel:profile?.level||match.goalieTeamLevel,
    goalieTeamTier:profile?.tier||match.goalieTeamTier,opponentAgeGroup:match.opponentAgeGroup,opponentTeamLevel:match.opponentTeamLevel,
    opponentTeamTier:match.opponentTeamTier,matchStatus:'finalised',finalizedAt:match.finalizedAt,sharedMatchId:match.sharedMatchId,
    sharedRole:'alternate',sharedPrimaryGoalieId:primary?.id||'',multipleGoalies:true
  });
  ensureBenchmarkMatch566(alt,mirror,false);
  mirror.matchStatus='finalised';
}

function installOverrides(){
  if(window.v583MultiGoalieInstalled)return;window.v583MultiGoalieInstalled=true;

  const baseStart=startOrUpdateMatch;
  startOrUpdateMatch=function(){
    const config=validateConfig();if(!config)return;
    const result=baseStart.apply(this,arguments),match=currentMatch();
    applyConfig(match,config);saveDB();refreshControls();updateOpponentGoalsDisplay();
    return result;
  };
  window.startOrUpdateMatch=startOrUpdateMatch;

  const baseCalculated=calculatedOpponentGoals;
  calculatedOpponentGoals=function(match){return match?.multipleGoalies?totalOpponentGoals(match):baseCalculated(match)};
  window.calculatedOpponentGoals=calculatedOpponentGoals;

  const baseWithHeat=saveShot;
  saveShot=function(){const match=currentMatch(),before=new Set((match?.shots||[]).map(s=>s.id));const result=baseWithHeat.apply(this,arguments);moveNewestShotToAlternate(match,before);return result};
  window.saveShot=saveShot;

  const baseWithoutHeat=saveShotWithoutHeat;
  saveShotWithoutHeat=function(){const match=currentMatch(),before=new Set((match?.shots||[]).map(s=>s.id));const result=baseWithoutHeat.apply(this,arguments);moveNewestShotToAlternate(match,before);return result};
  window.saveShotWithoutHeat=saveShotWithoutHeat;

  if(typeof renderRecordPanel==='function'){
    const baseVideoPanel=renderRecordPanel;
    renderRecordPanel=function(){const result=baseVideoPanel.apply(this,arguments);installVideoRecordingControl();return result};
    window.renderRecordPanel=renderRecordPanel;
  }
  if(typeof saveVideoShot==='function'){
    const baseVideoShot=saveVideoShot;
    saveVideoShot=function(){const match=currentMatch(),before=new Set((match?.shots||[]).map(s=>s.id));const result=baseVideoShot.apply(this,arguments);if(moveNewestShotToAlternate(match,before)){match.oppGoals=totalOpponentGoals(match);match.opponentGoals=match.oppGoals;saveDB();try{renderRecordPanel();renderVideoTimeline();renderLongVideoTimeline522();updateVideoUI()}catch(error){}}return result};
    window.saveVideoShot=saveVideoShot;
  }

  const baseComplete=completeMatch;
  completeMatch=function(){
    const primary=primaryGoalie(),match=currentMatch();
    if(match?.multipleGoalies){
      const config=validateConfig();if(!config)return;applyConfig(match,config);
      match.oppGoals=totalOpponentGoals(match);match.opponentGoals=match.oppGoals;
    }
    const result=baseComplete.apply(this,arguments);
    if(match?.multipleGoalies){match.oppGoals=totalOpponentGoals(match);match.opponentGoals=match.oppGoals;match.result=Number(match.homeGoals||0)>match.oppGoals?'Win':Number(match.homeGoals||0)<match.oppGoals?'Loss':'Draw';materializeExistingAlternate(primary,match);saveDB();renderAll();loadMatchConfig(null);refreshControls()}
    return result;
  };
  window.completeMatch=completeMatch;

  const baseRender=renderAll;
  renderAll=function(){const result=baseRender.apply(this,arguments);setTimeout(()=>{installMatchControls();refreshControls()},0);return result};
  window.renderAll=renderAll;
}

function installVideoRecordingControl(){
  const match=currentMatch(),panel=byId('v521RecordPanel');
  if(!panel||!detailedAlternate(match))return;
  let box=byId('v583VideoRecordingBox');
  if(!box){box=document.createElement('div');box.id='v583VideoRecordingBox';box.className='v583Box v583Recording';box.innerHTML='<h3>Recording For</h3><select id="v583VideoRecordingGoalie"></select><div class="small">Each reviewed shot is saved only against the selected goalie.</div>';panel.insertBefore(box,panel.firstChild)}
  const select=byId('v583VideoRecordingGoalie'),primary=primaryGoalie()?.name||'Primary goalie';
  select.innerHTML='<option value="primary">'+esc(primary)+'</option><option value="alternate">'+esc(match.alternateGoalieName||'Alternate goalie')+'</option>';
  select.value=match.recordingGoalieTarget==='alternate'?'alternate':'primary';
  select.onchange=()=>{match.recordingGoalieTarget=select.value;saveDB()};
}

function init(){installStyles();installMatchControls();installOverrides();loadMatchConfig(currentMatch());refreshControls()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
window.v583MultiGoalie={version:VERSION,refresh:refreshControls,load:loadMatchConfig,totalOpponentGoals};
})();
