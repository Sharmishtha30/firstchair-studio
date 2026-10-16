import test from 'node:test';
import assert from 'node:assert/strict';
import {withWebsiteNetworkRetry,websiteUnavailableMessage} from '../convex/websiteNetworkRetry';
import {validateWebsiteResponse} from '../convex/publicWebsite';

for(const code of ['EBUSY','ETIMEDOUT','ECONNRESET','EAI_AGAIN']){
 test(`${code} retries the website three times with short waits before succeeding`,async()=>{
  let calls=0;const waits:number[]=[];
  const result=await withWebsiteNetworkRetry(async()=>{
   if(++calls<4)throw Object.assign(new Error(`getaddrinfo ${code} expertia.ai`),{code});
   return {html:'Real website content'};
  },async ms=>{waits.push(ms);});
  assert.deepEqual(result,{html:'Real website content'});
  assert.equal(calls,4);assert.deepEqual(waits,[250,500,750]);
 });
 test(`${code} exhaustion shows only the plain website message`,async()=>{
  let calls=0;
  await assert.rejects(withWebsiteNetworkRetry(async()=>{
   calls++;throw new Error('fetch failed',{cause:Object.assign(new Error(`getaddrinfo ${code} expertia.ai`),{code})});
  },async()=>{}),error=>{
   assert.ok(error instanceof Error);assert.equal(error.message,"We couldn't reach this website right now. Try again, or paste your business text instead.");
   assert.equal(error.message,websiteUnavailableMessage);assert.equal(error.cause,undefined);return true;
  });
  assert.equal(calls,4);
 });
}
test('website deadlines and interrupted responses receive the same automatic recovery',async()=>{
 for(const message of ['getaddrinfo EBUSY expertia.ai','Website took too long to respond.','Website response was interrupted.']){
  let calls=0;
  assert.equal(await withWebsiteNetworkRetry(async()=>{if(++calls===1)throw Error(message);return 'ok';},async()=>{}),'ok');
  assert.equal(calls,2);
 }
});
test('blocked-site messages and private-address protection are unchanged and never retried',async()=>{
 for(const status of [401,403,429]){
  let original:unknown;try{validateWebsiteResponse(status,'text/html','text/html');}catch(error){original=error;}
  let calls=0;
  await assert.rejects(withWebsiteNetworkRetry(async()=>{calls++;throw original;},async()=>{assert.fail('Do not retry blocked sites');}),error=>error===original);
  assert.equal(calls,1);
 }
 const privateSite=Error('Local and private websites are not supported.');
 await assert.rejects(withWebsiteNetworkRetry(async()=>{throw privateSite;},async()=>{assert.fail();}),error=>error===privateSite);
});

test('other coded DNS and connection failures also cannot expose raw codes',async()=>{
 for(const code of ['ENODATA','ERR_TLS_CERT_ALTNAME_INVALID','HPE_INVALID_HEADER_TOKEN']){
  let calls=0;
  await assert.rejects(withWebsiteNetworkRetry(async()=>{calls++;throw Object.assign(Error(code+' expertia.ai'),{code});},async()=>{}),{message:websiteUnavailableMessage});
  assert.equal(calls,4);
 }
});
