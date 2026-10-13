import test from 'node:test';
import assert from 'node:assert/strict';
import {completedStream} from '../convex/chatgptModel';
import {sourceWriterFailure} from '../convex/sourceWriterFailure';

test('a capped response is rejected with a useful error, even through SDK wrappers',async()=>{
 const event='data: '+JSON.stringify({type:'response.incomplete',response:{incomplete_details:{reason:'max_output_tokens'}}})+'\n\n';
 const input=new ReadableStream<Uint8Array>({start(c){for(const piece of [event.slice(0,31),event.slice(31)])c.enqueue(new TextEncoder().encode(piece));c.close();}});
 try{await new Response(completedStream(input)).text();assert.fail('Partial content must not pass');}catch(error){
  const wrapped=new Error('Failed to process successful response',{cause:error});
  assert.match(sourceWriterFailure(wrapped),/size limit/);
  assert.match(sourceWriterFailure(wrapped),/input is saved/);
 }
});
test('an interrupted response remains a failure and does not expose private request fields',()=>{
 const root=new Error('ChatGPT response was interrupted. Try again.');
 const wrapped=Object.assign(new Error('Failed to process successful response',{cause:root}),{requestBodyValues:{private:'do not expose'}});
 assert.match(sourceWriterFailure(wrapped),/stopped before it finished/);
 assert.ok(!sourceWriterFailure(wrapped).includes('do not expose'));
});
