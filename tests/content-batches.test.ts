import test from 'node:test';
import assert from 'node:assert/strict';
import {mapInPairs} from '../convex/contentBatches';

test('parallel generation is limited to two requests and retains order',async()=>{
 let active=0,peak=0;
 const results=await mapInPairs([0,1,2,3],async i=>{active++;peak=Math.max(peak,active);await new Promise(resolve=>setTimeout(resolve,i%2?1:10));active--;return i;});
 assert.deepEqual(results,[0,1,2,3]);assert.equal(peak,2);
});
test('a failed batch is not silently accepted as a partial carousel',async()=>{
 const started:number[]=[];
 await assert.rejects(mapInPairs([0,1,2,3],async i=>{started.push(i);if(i===1)throw Error('incomplete');return i;}),/incomplete/);
 assert.deepEqual(started,[0,1]);
});

test('lightweight reasoning is restricted to supported API model and non-planning steps',async()=>{
 const {sourceReasoningEffort}=await import('../convex/contentBatches');
 assert.equal(sourceReasoningEffort('OpenAI API','gpt-5-mini','Checking accuracy and story flow'),'minimal');
 assert.equal(sourceReasoningEffort('OpenAI API','gpt-5-mini','Understanding your content and writing the story'),'low');
 assert.equal(sourceReasoningEffort('ChatGPT sign-in','gpt-5-mini','Writing your slides'),'low');
 assert.equal(sourceReasoningEffort('OpenAI API','another-model','Writing your slides'),'low');
});

test('provider capacity errors are retried at most twice, then reported',async()=>{
 const {withTransientRetry}=await import('../convex/contentBatches');
 const {chatgptBusy}=await import('../convex/chatgptModel');
 const waits:number[]=[],wait=async(ms:number)=>{waits.push(ms);};
 let calls=0;
 assert.equal(await withTransientRetry(async()=>{if(++calls<3)throw new Error('Failed to process successful response',{cause:new Error(chatgptBusy)});return 'ok';},[2000,6000],wait),'ok');
 assert.equal(calls,3);assert.deepEqual(waits,[2000,6000]);
 calls=0;
 await assert.rejects(withTransientRetry(async()=>{calls++;throw new Error(chatgptBusy);},[1,1],wait),/temporarily busy/);
 assert.equal(calls,3);
});
test('content, size-limit and validation failures are never retried',async()=>{
 const {withTransientRetry}=await import('../convex/contentBatches');
 for(const message of ['The AI reply reached its size limit. Your input is saved.','ChatGPT did not finish the response. Try again.','Slide 2 exceeds 40 words.','Your ChatGPT connection needs renewing. Continue with ChatGPT again.']){
  let calls=0;
  await assert.rejects(withTransientRetry(async()=>{calls++;throw new Error(message);},[1,1],async()=>{}));
  assert.equal(calls,1,message);
 }
});
