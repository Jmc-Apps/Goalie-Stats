/* Hockey Goalie Stats v5.82 - single-goalie backup, merge and deletion approval. */
(function(){
'use strict';

const TRANSFER_TYPE='SingleGoalieTransfer';
const SCHEMA_VERSION='1.0';
const originalSaveDB=saveDB;
const originalRenderAll=renderAll;
let trackingSuspended=false;
let baseline=new Map();

function clone(value){return JSON.parse(JSON.stringify(value))}
function isoNow(){return new Date().toISOString()}
function validTime(value){const time=Date.parse(value||'');return Number.isFinite(time)?time:0}
function newer(a,b){return validTime(a)>validTime(b)}
function latestIso(values){
  let best=0;
  for(const value of values||[]){const time=validTime(value);if(time>best)best=time}
  return best?new Date(best).toISOString():new Date(0).toISOString();
}
function cleanName(value){return String(value||'').trim().toLowerCase().replace(/\s+/g,' ')}
function safeFileName(value){return String(value||'goalie').trim().replace(/[^a-z0-9_-]+/gi,'_').replace(/^_+|_+$/g,'')||'goalie'}
function stable(value){
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object')return Object.keys(value).sort().reduce((out,key)=>{out[key]=stable(value[key]);return out},{});
  return value;
}
function hash(value){return JSON.stringify(stable(value))}
function stripKeys(value,keys){
  if(Array.isArray(value))return value.map(item=>stripKeys(item,keys));
  if(!value||typeof value!=='object')return value;
  const out={};
  for(const [key,item] of Object.entries(value)){if(!keys.has(key))out[key]=stripKeys(item,keys)}
  return out;
}
function profileFingerprint(g){
  const omitted=new Set(['matches','teams','teamProfiles','syncUpdatedAt','syncDeletedMatches','syncDeletedTeams','benchmarkConsent','benchmarkAccess','benchmarkGoalieId','benchmarkReportCache','benchmarkLastSuccessfulUpload','benchmarkLastPayloadHash','benchmarkLastUploadCount','benchmarkLastDownload']);
  const out={};
  for(const [key,value] of Object.entries(g||{})){if(!omitted.has(key)&&!key.startsWith('benchmark'))out[key]=value}
  return hash(out);
}
function teamFingerprint(team){return hash(stripKeys(team,new Set(['syncUpdatedAt'])))}
function matchFingerprint(match){
  const out=clone(match||{});
  delete out.syncUpdatedAt;
  if(out.videoReview)out.videoReview=stripKeys(out.videoReview,new Set(['url','available','durationReadFailed','position','playlistPosition','activeClipIndex','masterTime','virtualPlaying','isPlaying']));
  return hash(out);
}
function itemMap(items,fingerprint){
  return new Map((items||[]).filter(item=>item&&item.id).map(item=>[String(item.id),{hash:fingerprint(item),name:item.name||(item.homeTeam&&item.opponentTeam?`${item.homeTeam} VS ${item.opponentTeam}`:''),updatedAt:item.syncUpdatedAt||''}]));
}
function snapshot(g){return {profileHash:profileFingerprint(g),teams:itemMap(g.teamProfiles,teamFingerprint),matches:itemMap(g.matches,matchFingerprint)}}
function captureBaseline(){baseline=new Map((db.goalies||[]).map(g=>[String(g.id),snapshot(g)]))}

function matchFallback(match){
  const date=String(match?.date||'');
  return latestIso([match?.syncUpdatedAt,match?.updatedAt,match?.finalizedAt,date&&/^\d{4}-\d{2}-\d{2}$/.test(date)?date+'T23:59:59.000Z':'']);
}
function initializeGoalieSync(g){
  let changed=false;
  if(!Array.isArray(g.matches)){g.matches=[];changed=true}
  if(!Array.isArray(g.teamProfiles)){try{ensureTeamProfiles568(g)}catch(x){g.teamProfiles=[]}changed=true}
  if(!Array.isArray(g.syncDeletedMatches)){g.syncDeletedMatches=[];changed=true}
  if(!Array.isArray(g.syncDeletedTeams)){g.syncDeletedTeams=[];changed=true}
  for(const match of g.matches){if(!match.syncUpdatedAt){match.syncUpdatedAt=matchFallback(match);changed=true}}
  for(const team of g.teamProfiles){
    if(!team.id){team.id=typeof benchmarkUuid566==='function'?benchmarkUuid566('team_'):uid();changed=true}
    if(!team.syncUpdatedAt){
      const related=g.matches.filter(m=>cleanName(m.homeTeam)===cleanName(team.name)).map(m=>m.syncUpdatedAt);
      team.syncUpdatedAt=latestIso(related);changed=true;
    }
  }
  if(!g.syncUpdatedAt){g.syncUpdatedAt=latestIso(g.matches.map(m=>m.syncUpdatedAt).concat(g.teamProfiles.map(t=>t.syncUpdatedAt)));changed=true}
  if(!Array.isArray(g.syncAliases)){g.syncAliases=[];changed=true}
  return changed;
}
function initializeSyncMetadata(){let changed=false;for(const g of db.goalies||[])changed=initializeGoalieSync(g)||changed;return changed}

function trackedSaveDB(){
  if(trackingSuspended)return originalSaveDB();
  const now=isoNow();
  for(const g of db.goalies||[]){
    initializeGoalieSync(g);
    const before=baseline.get(String(g.id));
    if(!before){g.syncUpdatedAt=now;for(const t of g.teamProfiles||[])t.syncUpdatedAt=now;for(const m of g.matches||[])m.syncUpdatedAt=now;continue}
    if(profileFingerprint(g)!==before.profileHash)g.syncUpdatedAt=now;
    const currentTeams=itemMap(g.teamProfiles,teamFingerprint);
    for(const team of g.teamProfiles||[]){const prior=before.teams.get(String(team.id));if(!prior||prior.hash!==teamFingerprint(team))team.syncUpdatedAt=now}
    for(const [id,prior] of before.teams){if(!currentTeams.has(id)){g.syncDeletedTeams=(g.syncDeletedTeams||[]).filter(x=>String(x.id)!==id);g.syncDeletedTeams.push({id,name:prior.name||'Unnamed team',deletedAt:now})}}
    const currentMatches=itemMap(g.matches,matchFingerprint);
    for(const match of g.matches||[]){const prior=before.matches.get(String(match.id));if(!prior||prior.hash!==matchFingerprint(match))match.syncUpdatedAt=now}
    for(const [id,prior] of before.matches){if(!currentMatches.has(id)){g.syncDeletedMatches=(g.syncDeletedMatches||[]).filter(x=>String(x.id)!==id);g.syncDeletedMatches.push({id,name:prior.name||'Unnamed match',deletedAt:now})}}
  }
  const result=originalSaveDB();captureBaseline();refreshGoalieSelect();return result;
}

function clipKey(clip){return String(clip?.id||clip?.relativePath||((clip?.name||'')+'|'+(clip?.size||'')))}
function collectLiveClips(value,map=new Map()){
  if(Array.isArray(value)){for(const item of value)collectLiveClips(item,map);return map}
  if(!value||typeof value!=='object')return map;
  if((value.url||value.available)&&value.name)map.set(clipKey(value),{url:value.url,available:value.available});
  for(const item of Object.values(value))collectLiveClips(item,map);
  return map;
}
function restoreLiveClips(value,map){
  if(Array.isArray(value)){for(const item of value)restoreLiveClips(item,map);return}
  if(!value||typeof value!=='object')return;
  if(value.name){const live=map.get(clipKey(value));if(live){value.url=live.url;value.available=live.available}}
  for(const item of Object.values(value))restoreLiveClips(item,map);
}
function sanitizeForTransfer(value){
  if(Array.isArray(value))return value.map(sanitizeForTransfer);
  if(!value||typeof value!=='object')return value;
  const out={};
  const looksLikeClip=!!value.name&&('url' in value||'available' in value||'relativePath' in value||'lastModified' in value);
  for(const [key,item] of Object.entries(value)){
    if(key==='url'||key==='durationReadFailed')continue;
    if(key.startsWith('benchmark')&&key!=='benchmarkGoalieId')continue;
    out[key]=sanitizeForTransfer(item);
  }
  if(looksLikeClip)out.available=false;
  return out;
}
function prepareTransferGoalie(g){
  const out=sanitizeForTransfer(g);
  delete out.benchmarkConsent;delete out.benchmarkAccess;delete out.benchmarkReportCache;delete out.benchmarkLastSuccessfulUpload;delete out.benchmarkLastPayloadHash;delete out.benchmarkLastUploadCount;delete out.benchmarkLastDownload;
  return out;
}
function tombstoneMap(items){const map=new Map();for(const item of items||[]){if(!item?.id)continue;const prior=map.get(String(item.id));if(!prior||newer(item.deletedAt,prior.deletedAt))map.set(String(item.id),item)}return map}
function mergeTombstones(localItems,incomingItems){return [...tombstoneMap([...(localItems||[]),...(incomingItems||[])]).values()]}
function itemUpdated(item,type){return type==='match'?matchFallback(item):(item?.syncUpdatedAt||new Date(0).toISOString())}
function displayMatch(match){return match?.name||[match?.date,[match?.homeTeam,match?.opponentTeam].filter(Boolean).join(' VS ')].filter(Boolean).join(' - ')||'Unnamed match'}

function deletionPlan(local,incoming){
  const plan={teams:[],matches:[]};
  const incomingTeamDeletes=tombstoneMap(incoming.syncDeletedTeams),incomingMatchDeletes=tombstoneMap(incoming.syncDeletedMatches);
  for(const item of local.teamProfiles||[]){const tomb=incomingTeamDeletes.get(String(item.id));if(tomb&&newer(tomb.deletedAt,itemUpdated(item,'team')))plan.teams.push({id:String(item.id),name:item.name||tomb.name||'Unnamed team',tomb})}
  for(const item of local.matches||[]){const tomb=incomingMatchDeletes.get(String(item.id));if(tomb&&newer(tomb.deletedAt,itemUpdated(item,'match')))plan.matches.push({id:String(item.id),name:displayMatch(item)||tomb.name,tomb})}
  return plan;
}
function mergeCollection(localItems,incomingItems,localDeletes,incomingDeletes,type,allowDeletion,stats){
  const localTombs=tombstoneMap(localDeletes),incomingTombs=tombstoneMap(incomingDeletes);
  const output=(localItems||[]).map(clone),byId=new Map(output.map((item,index)=>[String(item.id),index]));
  for(const incoming of incomingItems||[]){
    if(!incoming?.id)continue;
    const id=String(incoming.id),localTomb=localTombs.get(id),incomingTime=itemUpdated(incoming,type);
    if(localTomb&&!newer(incomingTime,localTomb.deletedAt)){stats.kept++;continue}
    const index=byId.get(id);
    if(index===undefined){output.push(clone(incoming));byId.set(id,output.length-1);stats.added++;continue}
    const local=output[index];
    if(newer(incomingTime,itemUpdated(local,type))){
      const replacement=clone(incoming);
      if(type==='match')restoreLiveClips(replacement,collectLiveClips(local));
      output[index]=replacement;stats.updated++;
    }else stats.kept++;
  }
  if(allowDeletion){
    for(const [id,tomb] of incomingTombs){const index=byId.get(id);if(index===undefined)continue;const item=output[index];if(newer(tomb.deletedAt,itemUpdated(item,type))){output[index]=null;stats.deleted++;}}
  }
  return output.filter(Boolean);
}
function mergeGoalieData(localInput,incomingInput,allowDeletion){
  const local=clone(localInput),incoming=clone(incomingInput),stats={added:0,updated:0,kept:0,deleted:0};
  initializeGoalieSync(local);initializeGoalieSync(incoming);
  const preserved={};for(const [key,value] of Object.entries(local)){if(key.startsWith('benchmark'))preserved[key]=value}
  if(newer(incoming.syncUpdatedAt,local.syncUpdatedAt)){
    for(const key of ['name','dob','gender'])if(key in incoming)local[key]=incoming[key];
    local.syncUpdatedAt=incoming.syncUpdatedAt;stats.updated++;
  }
  local.syncAliases=[...new Set([...(local.syncAliases||[]),...(incoming.syncAliases||[]),incoming.id].filter(id=>id&&id!==local.id))];
  const plan=deletionPlan(local,incoming);
  local.teamProfiles=mergeCollection(local.teamProfiles,incoming.teamProfiles,local.syncDeletedTeams,incoming.syncDeletedTeams,'team',allowDeletion,stats);
  local.matches=mergeCollection(local.matches,incoming.matches,local.syncDeletedMatches,incoming.syncDeletedMatches,'match',allowDeletion,stats);
  local.teams=local.teamProfiles.map(team=>team.name).filter(Boolean);
  const acceptedTeamTombs=(incoming.syncDeletedTeams||[]).filter(t=>allowDeletion||!plan.teams.some(x=>x.id===String(t.id)));
  const acceptedMatchTombs=(incoming.syncDeletedMatches||[]).filter(t=>allowDeletion||!plan.matches.some(x=>x.id===String(t.id)));
  local.syncDeletedTeams=mergeTombstones(local.syncDeletedTeams,acceptedTeamTombs).filter(t=>{const item=local.teamProfiles.find(x=>String(x.id)===String(t.id));return !item||!newer(itemUpdated(item,'team'),t.deletedAt)});
  local.syncDeletedMatches=mergeTombstones(local.syncDeletedMatches,acceptedMatchTombs).filter(t=>{const item=local.matches.find(x=>String(x.id)===String(t.id));return !item||!newer(itemUpdated(item,'match'),t.deletedAt)});
  Object.assign(local,preserved);
  return {goalie:local,stats,plan};
}

function findLocalGoalie(incoming){
  const incomingIds=new Set([incoming.id,...(incoming.syncAliases||[])].filter(Boolean).map(String));
  let local=(db.goalies||[]).find(g=>incomingIds.has(String(g.id))||(g.syncAliases||[]).some(id=>incomingIds.has(String(id))));
  if(local)return local;
  return (db.goalies||[]).find(g=>cleanName(g.name)===cleanName(incoming.name)&&String(g.dob||'')===String(incoming.dob||''))||null;
}
function deletionMessage(plan){
  const lines=['This incoming backup contains newer deletion records. Approve these deletions?'];
  if(plan.teams.length){lines.push('','Teams:');for(const item of plan.teams)lines.push('• '+item.name)}
  if(plan.matches.length){lines.push('','Matches:');for(const item of plan.matches)lines.push('• '+item.name)}
  lines.push('','Cancel keeps these teams and matches, while still importing other newer information.');
  return lines.join('\n');
}
function setStatus(message){const el=document.getElementById('singleGoalieTransferStatus');if(el)el.textContent=message}
function refreshGoalieSelect(){
  const select=document.getElementById('singleGoalieBackupSelect');if(!select)return;
  const chosen=select.value||currentGoalieId;
  select.innerHTML=(db.goalies||[]).map(g=>`<option value="${esc(g.id)}">${esc(g.name||'Unnamed Goalie')}</option>`).join('');
  if((db.goalies||[]).some(g=>g.id===chosen))select.value=chosen;
}

function exportSingleGoalie577(){
  const id=document.getElementById('singleGoalieBackupSelect')?.value||currentGoalieId,g=(db.goalies||[]).find(item=>item.id===id);
  if(!g){alert('Choose a goalie to back up.');return}
  trackedSaveDB();
  const payload={sourceApp:'Hockey Goalie Stats',sourceVersion:typeof APP_VERSION_566==='string'?APP_VERSION_566:'5.82',exportType:TRANSFER_TYPE,schemaVersion:SCHEMA_VERSION,exportedAt:isoNow(),goalie:prepareTransferGoalie(g)};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hgs_goalie_'+safeFileName(g.name)+'_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href);
  setStatus('Single-goalie backup exported. Video files remain in their existing folders and can be reconnected on the other device.');
}
function readFile(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(new Error('The file could not be read.'));reader.readAsText(file)})}
async function importSingleGoalie577(){
  const file=document.getElementById('singleGoalieImportFile')?.files?.[0];if(!file){alert('Choose a single-goalie JSON backup.');return}
  try{
    const payload=JSON.parse(await readFile(file));
    if(payload?.exportType!==TRANSFER_TYPE||!payload.goalie?.id||!Array.isArray(payload.goalie.matches))throw new Error('This is not a valid single-goalie transfer backup.');
    const incoming=payload.goalie;initializeGoalieSync(incoming);
    let local=findLocalGoalie(incoming);
    if(local&&String(local.id)!==String(incoming.id)&&!(local.syncAliases||[]).includes(incoming.id)){
      if(!confirm(`A goalie named ${incoming.name||'Unnamed Goalie'} with the same date of birth already exists. Merge this backup into that goalie?`))return;
    }
    trackingSuspended=true;
    let message='';
    if(!local){
      const added=prepareTransferGoalie(incoming);added.benchmarkConsent='undecided';added.benchmarkAccess=false;initializeGoalieSync(added);db.goalies.push(added);currentGoalieId=added.id;message=`Imported ${added.name||'goalie'} with ${added.matches.length} match${added.matches.length===1?'':'es'}.`;
    }else{
      const plan=deletionPlan(local,incoming),hasDeletions=plan.teams.length||plan.matches.length,allowDeletion=hasDeletions?confirm(deletionMessage(plan)):true;
      const result=mergeGoalieData(local,incoming,allowDeletion),index=db.goalies.indexOf(local);db.goalies[index]=result.goalie;currentGoalieId=result.goalie.id;
      const s=result.stats;message=`Merge complete: ${s.added} added, ${s.updated} updated, ${s.kept} already current, ${s.deleted} deleted.`+(hasDeletions&&!allowDeletion?' Requested deletions were not applied.':'');
    }
    activeMatchId='';originalSaveDB();captureBaseline();originalRenderAll();refreshGoalieSelect();setStatus(message);
  }catch(error){alert('Could not import goalie: '+(error.message||error));setStatus('Import failed.')}
  finally{trackingSuspended=false}
}

function restoreBackup577(){
  const input=document.getElementById('restoreFile'),file=input?.files?.[0];if(!file){alert('Choose a JSON file.');return}
  const reader=new FileReader();reader.onload=()=>{try{const restored=JSON.parse(reader.result);if(!Array.isArray(restored.goalies))throw new Error('Invalid backup');db=restored;currentGoalieId=db.currentGoalieId||db.goalies[0]?.id||'';activeMatchId=db.activeMatchId||'';trackingSuspended=true;initializeSyncMetadata();originalSaveDB();captureBaseline();trackingSuspended=false;originalRenderAll();refreshGoalieSelect();const status=document.getElementById('backupStatus');if(status)status.textContent='Backup restored.'}catch(error){trackingSuspended=false;alert('Could not restore backup: '+error.message)}};reader.readAsText(file);
}

saveDB=trackedSaveDB;
renderAll=function(){const result=originalRenderAll.apply(this,arguments);refreshGoalieSelect();return result};
restoreBackup=restoreBackup577;
window.exportSingleGoalie577=exportSingleGoalie577;
window.importSingleGoalie577=importSingleGoalie577;
window.v577GoalieTransfer={initializeGoalieSync,prepareTransferGoalie,mergeGoalieData,deletionPlan};

trackingSuspended=true;const metadataAdded=initializeSyncMetadata();if(metadataAdded)originalSaveDB();trackingSuspended=false;captureBaseline();refreshGoalieSelect();
})();
