import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleSession,newSession,allQuestions,counts,stateOf,loadSession,validSession} from '../discovery/src/model.js';
import {generateRequirements,toMarkdown,toPlainText,toDocx} from '../discovery/src/brd.js';

test('sample covers all 39 seed questions and preserves outstanding items',()=>{
  const s=sampleSession(),qs=allQuestions(s);assert.equal(qs.length,39);
  assert.deepEqual(counts(qs,s.answers),{answered:36,pending:3,na:0,total:39});
  const d=generateRequirements(s);assert.equal(d.sections.length,7);assert.equal(d.outstanding.length,3);
  assert.match(toMarkdown(d),/Open Questions \/ Outstanding Items/);assert.match(toPlainText(d),/Northstar Services/);
});
test('No is an answer; notes alone are pending; N/A excludes a requirement',()=>{
  const s=newSession('Client','Project'),q=allQuestions(s).find(q=>q.checklist);
  assert.equal(stateOf(q,{choice:'No'}),'answered');assert.equal(stateOf(q,{text:'Confirm with IT'}),'pending');
  s.answers[q.id]={choice:'Yes',text:'Retain this explanation',na:true};const d=generateRequirements(s);
  assert.equal(d.notApplicable.length,1);assert.equal(d.progress.answered,0);assert.match(toMarkdown(d),/Retain this explanation/);
});
test('custom questions, multiline text, and pending checklist notes survive export',()=>{
  const s=newSession('Client','Project');s.custom['0']=[{id:'custom1',text:'Who approves?',checklist:false,custom:true}];
  s.answers.custom1={text:'Finance\nHR'};s.answers['q-6-0']={text:'Follow up on Friday'};
  const text=toMarkdown(generateRequirements(s));assert.match(text,/Who approves\?/);assert.match(text,/Finance\nHR/);assert.match(text,/Follow up on Friday/);
});
test('saved sessions reload; corrupt and inaccessible storage are handled',()=>{
  const s=sampleSession();assert.equal(validSession(s),true);assert.deepEqual(loadSession({getItem:()=>JSON.stringify(s)}).session,s);
  assert.ok(loadSession({getItem:()=>'{broken'}).warning);assert.ok(loadSession({getItem:()=>{throw Error('blocked');}}).warning);
  assert.equal(validSession({...s,answers:{bad:{text:10}}}),false);
});
test('Word export produces a nonempty Office ZIP',async()=>{
  const b=await toDocx(generateRequirements(sampleSession()));const bytes=new Uint8Array(await b.arrayBuffer());
  assert.equal(bytes[0],80);assert.equal(bytes[1],75);assert.ok(bytes.length>5000);
});
