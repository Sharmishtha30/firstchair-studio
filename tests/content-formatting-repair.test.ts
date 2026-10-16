import test from 'node:test';
import assert from 'node:assert/strict';
import {oversizedSourceCorrections,repairSourceWordBudgets} from '../convex/contentFormatting';
const frame=(words:number)=>({label:'',heading:'',body:Array(words).fill('word').join(' '),bullets:[] as string[]});
test('one repair targets every oversized carousel frame and static, preserving valid frames',()=>{
 const draft={carousel:[frame(40),frame(41),frame(5),frame(52)],static:frame(26)};
 const before=structuredClone(draft);
 assert.deepEqual(oversizedSourceCorrections(draft).map(c=>c.slideNumbers),[[2],[4],[0]]);
 assert.deepEqual(draft,before);
});
test('all visible fields count together and limits remain inclusive',()=>{
 const draft={carousel:[{...frame(35),heading:'one two three',label:'four',bullets:['five six']}],static:frame(25)};
 assert.deepEqual(oversizedSourceCorrections(draft).map(c=>c.slideNumbers),[[1]]);
 assert.deepEqual(oversizedSourceCorrections({carousel:[frame(40)],static:frame(25)}),[]);
});

test('slide 5 gets its own shortening retries, keeping quotes and every other slide',async()=>{
 const quote='“I got my Friday afternoons back.”';
 const draft={carousel:[frame(10),frame(12),frame(14),frame(16),{...frame(45),body:frame(45).body+' '+quote}],static:frame(20)};
 const before=structuredClone(draft),targets:number[]=[];
 const repaired=await repairSourceWordBudgets(draft,async(previous,correction)=>{
  targets.push(correction.slideNumbers[0]);
  assert.match(correction.fix,/quote/i);
  return {...previous,body:targets.length<4?frame(45).body+' '+quote:'A customer said: '+quote};
 });
 assert.deepEqual(targets,[5,5,5,5]);
 assert.equal(repaired.carousel[4].body,'A customer said: '+quote);
 for(let i=0;i<4;i++)assert.equal(repaired.carousel[i],draft.carousel[i]);
 assert.equal(repaired.static,draft.static);
 assert.deepEqual(draft,before);
 assert.deepEqual(oversizedSourceCorrections(repaired),[]);
});

test('shortening rejects a changed customer quote and retries only the same slide',async()=>{
 const quote='“My team spends less time reporting.”';
 const draft={carousel:[{...frame(45),body:frame(45).body+' '+quote},frame(5)],static:frame(20)};
 let attempts=0;
 const repaired=await repairSourceWordBudgets(draft,async previous=>({...previous,body:++attempts===1?'“My team stopped reporting.”':quote}));
 assert.equal(attempts,2);
 assert.equal(repaired.carousel[0].body,quote);
});

test('a repeatedly oversized reply stays unapproved without exposing a word-count task to the user',async()=>{
 let attempts=0;
 await assert.rejects(repairSourceWordBudgets({carousel:[frame(45),frame(10)],static:frame(20)},async previous=>{attempts++;return previous;}),error=>{
  assert.ok(error instanceof Error);
  assert.doesNotMatch(error.message,/shorten|words|needs attention/i);
  assert.match(error.message,/retry/i);
  return true;
 });
 assert.equal(attempts,4);
});

test('a later review rewrite is shortened again and valid drafts need no requests',async()=>{
 const draft={carousel:[frame(40),frame(10)],static:frame(25)};
 await repairSourceWordBudgets(draft,async()=>{assert.fail('No repair needed');});
 const revised={...draft,static:frame(35)};
 const repaired=await repairSourceWordBudgets(revised,async(previous,correction)=>{
  assert.deepEqual(correction.slideNumbers,[0]);return {...previous,body:frame(20).body};
 });
 assert.equal(repaired.carousel[0],draft.carousel[0]);
 assert.deepEqual(oversizedSourceCorrections(repaired),[]);
});
