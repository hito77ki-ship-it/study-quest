import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../../app.html', import.meta.url), 'utf8');
function source(name){
  const start = html.search(new RegExp(`(?:async )?function ${name}\\(`));
  assert.notEqual(start, -1, `Missing function ${name}`);
  const firstLine = html.slice(start,html.indexOf('\n',start));
  if(firstLine.trimEnd().endsWith('}')) return firstLine;
  const end = html.indexOf('\n}\n', start);
  assert.notEqual(end, -1);
  return html.slice(start, end + 3);
}
function context(functions, values = {}){
  const inputs = new Map();
  const alerts = [];
  const box = vm.createContext({
    document: {getElementById: id => inputs.get(id)},
    alert: message => alerts.push(message), ...values,
  });
  vm.runInContext(functions.map(source).join('\n'), box);
  const input = (id, value, extra = {}) => {
    const field = {value:String(value), validity:{badInput:false}, ...extra};
    inputs.set(id, field);
    return field;
  };
  return {box, inputs, input, alerts};
}

const duration = context(['readStudyDuration']);
for(const [h,m] of [[-1,61],[0,60],[24,0],[0,1.5],[0,0],['',''],['Infinity',1]]){
  duration.input('h',h); duration.input('m',m);
  assert.equal(duration.box.readStudyDuration('h','m'),null,`${h}h ${m}m must not save`);
}
for(const [h,m,total] of [[0,1,1],[1,30,90],[23,59,1439],['',5,5]]){
  duration.input('h',h); duration.input('m',m);
  assert.equal(duration.box.readStudyDuration('h','m').total,total);
}

let scoreWrites = 0;
const score = context(['addScoreRecord'],{
  EXAM_PRESETS:{custom:{subjects:[]}}, currentScoreTemplate:'custom', scoreRecords:[],
  allSelectedSubjects:()=>[{key:'s',name:'商業簿記',maxH:100}], selectedJobIds:[],
  MULTIPHASE_EXAMS:{}, saveScores:async()=>{scoreWrites++;},renderScoreTab:()=>{},updateScoreTotal:()=>{},
});
score.input('scoreExamName','テスト');score.input('scoreExamDate','2026-10-31');
score.input('scorePostToTl','',{checked:false});
for(const [points,max] of [[150,100],[-1,100],[1,0],[1,''],[1,-100]]){
  score.input('sscore_s',points);score.input('smax_s',max);
  await score.box.addScoreRecord();
  assert.equal(score.box.scoreRecords.length,0);
  assert.equal(scoreWrites,0);
  assert.equal(score.inputs.get('sscore_s').value,String(points),'Rejected input must be retained');
}
for(const [points,max] of [[0,100],[100,100],[150,200]]){
  score.input('scoreExamName','テスト');score.input('sscore_s',points);score.input('smax_s',max);
  await score.box.addScoreRecord();
  assert.equal(score.box.scoreRecords.at(-1).scores.s.score,points);
  assert.equal(score.box.scoreRecords.at(-1).scores.s.max,max);
}
assert.equal(scoreWrites,3);
score.box.EXAM_PRESETS.toeic={subjects:[{key:'s',name:'Listening',max:495}],detail:[{key:'p1',name:'Part1',max:6,section:'L'}]};
score.box.currentScoreTemplate='toeic';score.input('toeicDetailMode','',{checked:true});
for(const points of [-1,7,1.5]){
  score.input('scoreExamName','TOEICテスト');score.input('sscore_s',300);score.input('smax_s',495);score.input('sscore_p1',points);
  await score.box.addScoreRecord();assert.equal(scoreWrites,3);
}
score.input('sscore_p1',6);await score.box.addScoreRecord();assert.equal(scoreWrites,4);

let studyWrites = 0;
const subjects = [{key:'s',name:'商業簿記'}];
const study = context(['readStudyDuration','addQuest'],{
  char:{lastLoginDate:'2026-10-31',totalEXP:0},sessions:[],currentType:'study',
  timerStartedAt:null,currentUser:null,levelStudyMins:()=>0,computeLevel:()=>1,
  getTodayStr:()=> '2026-10-31',getReportSubjects:()=>subjects,allSelectedSubjects:()=>subjects,
  saveAll:async()=>{studyWrites++;},renderAll:()=>{},getTodayGoalMinsFor:()=>0,
  recoverHp:()=>{},autoPostToTimeline:()=>{},showSessionShareBanner:()=>{},checkWeeklyGoalMilestones:async()=>{},
});
for(const [id,value] of Object.entries({questSubject:'s',questNote:'教材テスト',questDate:'2026-10-31',questAmountHour:-1,questAmountMin:61,timerMaterial:'material-test'})) study.input(id,value);
assert.equal(await study.box.addQuest(),false);assert.equal(studyWrites,0);
study.input('questAmountHour',0);study.input('questAmountMin',2);
assert.equal(await study.box.addQuest(),true);assert.equal(studyWrites,1);
assert.equal(study.box.sessions[0].material_id,'material-test');
assert.equal(study.box.sessions[0].amount,2);

const material = context(['toFiniteNumber','sAmount','fmtSecs','renderMaterials'],{
  loadMaterials:()=>{},materials:[{id:'a',name:'教材A',subjectKey:'s'}],
  sessions:[{material_id:'a',type:'study',amount:1,amountSecs:71},{material_id:'a',type:'study',amount:2},{material_id:'b',type:'study',amount:99}],
  allSelectedSubjects:()=>subjects,escHtml:value=>value,
});
material.inputs.set('materialCategoryList',{innerHTML:''});material.box.renderMaterials();
assert.match(material.inputs.get('materialCategoryList').innerHTML,/⏱ 3分11秒/);

for(const [done,goal,expected] of [[3,1,'残り: 0h57m'],[60,2,'残り: 1h'],[59.6,2,'達成済み: 1h'],[120,1,'✅ 達成！']]){
  const weekly = context(['renderWeeklyGoal'],{
    getWeekStart:()=> '2026-10-26',getWeekSunday:()=> '2026-11-01',isThisWeekGoalSet:()=>true,
    getThisWeekGoalHours:()=>goal,getWeekDailyMins:()=>[{mins:done}],renderWeekDailyBars:()=>{},
    weeklyGoalData:{},WG_MILESTONES:[],
  });
  weekly.inputs.set('wgLockedSub',{innerHTML:''});weekly.box.renderWeeklyGoal();
  assert.ok(weekly.inputs.get('wgLockedSub').innerHTML.includes(expected));
  assert.doesNotMatch(weekly.inputs.get('wgLockedSub').innerHTML,/h60m/);
}
const stopwatch = context(['syncMrecButtons'],{timerRunning:true,timerSeconds:0});
stopwatch.inputs.set('mrecStartSW',{});
stopwatch.inputs.set('mrecStopSW',{style:{}});
stopwatch.box.syncMrecButtons();
assert.equal(stopwatch.inputs.get('mrecStopSW').style.display,'','End button must be visible when starting at zero seconds');
stopwatch.box.timerRunning=false;stopwatch.box.timerSeconds=15;stopwatch.box.syncMrecButtons();
assert.equal(stopwatch.inputs.get('mrecStopSW').style.display,'','Paused sessions remain saveable');
stopwatch.box.timerSeconds=0;stopwatch.box.syncMrecButtons();
assert.equal(stopwatch.inputs.get('mrecStopSW').style.display,'none','Empty idle session has no end button');
class MidnightDate extends Date {
  constructor(...args){super(...(args.length?args:['2026-10-30T16:15:00Z']));}
}
const calendar = context(['toLocalDateStr','getTodayStr','initMrecUI'],{
  Date:MidnightDate,materials:[],timerRunning:false,timerSeconds:0,
  switchMrecTab:()=>{},updateMrecDisplay:()=>{},syncMrecButtons:()=>{},
});
calendar.inputs.set('mrecDate',{value:''});calendar.box.initMrecUI(null);
const localToday = new MidnightDate().getFullYear()+'-'+String(new MidnightDate().getMonth()+1).padStart(2,'0')+'-'+String(new MidnightDate().getDate()).padStart(2,'0');
assert.equal(calendar.inputs.get('mrecDate').value,localToday);
if(process.env.TZ==='Asia/Tokyo') assert.equal(localToday,'2026-10-31');
console.log('PASS: duration rejection, score boundaries/zero/custom maximum/TOEIC details, no writes on rejected input, material association and seconds, weekly remaining time, mobile end button, local date after midnight');
