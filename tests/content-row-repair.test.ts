import test from 'node:test';
import assert from 'node:assert/strict';
import {repairFillerRows} from '../convex/contentRowRepair';
import {fillerRowIssue,type ContentDraft} from '../convex/contentPolicy';
const frame=(bullets:string[]=[])=>({heading:'Supported point',body:'',label:'',bullets,emphasis:'',evidenceIds:[0]});
const draft=(bullets:string[]):ContentDraft=>({carousel:[frame(['Valid: actual source detail']),frame(bullets)],static:frame(),caption:'',staticCaption:'',altText:'',staticAltText:''});

test('only the failing row is rewritten, with its new source reference',async()=>{
 const original=draft(['CV screening: offered','Interview: compares skills with requirements']);const before=structuredClone(original);
 const result=await repairFillerRows(original,async request=>{
  assert.equal(request.slideNumber,2);assert.equal(request.rowIndex,0);assert.equal(request.row,'CV screening: offered');
  return {row:'CV screening: matches skills against job requirements',evidenceIds:[2]};
 });
 assert.equal(result.carousel[0],original.carousel[0]);assert.equal(result.static,original.static);
 assert.equal(result.carousel[1].bullets[1],original.carousel[1].bullets[1]);
 assert.equal(result.carousel[1].heading,original.carousel[1].heading);
 assert.deepEqual(result.carousel[1].evidenceIds,[0,2]);
 assert.deepEqual(original,before);assert.equal(fillerRowIssue(result),undefined);
});
test('a placeholder row gets four targeted attempts independent of slide-format repairs',async()=>{
 let calls=0;
 const result=await repairFillerRows(draft(['List: screening']),async()=>({row:++calls<4?'Screening: screening':'Screening: matches skills against requirements',evidenceIds:[0]}));
 assert.equal(calls,4);assert.equal(fillerRowIssue(result),undefined);
 assert.deepEqual(result.carousel[1].bullets,['Screening: matches skills against requirements']);
});
test('a row with no real source detail is dropped, including after four failed repairs',async()=>{
 let calls=0;
 const result=await repairFillerRows(draft(['CV screening: offered','Interview: compares skills with requirements']),async()=>{calls++;return {row:'CV screening: available',evidenceIds:[0]};});
 assert.equal(calls,4);assert.deepEqual(result.carousel[1].bullets,['Interview: compares skills with requirements']);
 const dropped=await repairFillerRows(draft(['List: screening']),async()=>({row:'',evidenceIds:[0]}));
 assert.deepEqual(dropped.carousel[1].bullets,[]);
});
test('row repairs cannot change or drop a customer quote',async()=>{
 const quote='“I got my Friday afternoons back.”';let calls=0;
 const result=await repairFillerRows(draft(['List: '+quote]),async()=>{calls++;return {row: calls===1?'Customer: “I doubled my output.”':'',evidenceIds:[0]};});
 assert.equal(calls,4);assert.deepEqual(result.carousel[1].bullets,[quote]);
 assert.equal(fillerRowIssue(result),undefined);
});
test('valid rows, static copy and quoted source statements do not trigger repair',async()=>{
 const original=draft(['Customer: “I got my Friday afternoons back.”','Screening: matches skills against requirements']);
 const result=await repairFillerRows(original,async()=>{assert.fail('No filler row');});
 assert.deepEqual(result,original);
});

test('straight and curly single-quoted customer words, including contractions, stay exact',async()=>{
 for(const quote of ["'I don't spend Fridays reporting.'",'‘I don’t spend Fridays reporting.’']){
  const result=await repairFillerRows(draft(['List: '+quote]),async()=>({row:'',evidenceIds:[0]}));
  assert.deepEqual(result.carousel[1].bullets,[quote]);
 }
});
