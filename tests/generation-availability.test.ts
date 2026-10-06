import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generationUnavailable} from '../convex/generationAvailability';
import {beforeDeadline} from '../convex/requestDeadline';
test('anonymous fresh sites are rejected; curated sample and connected writing remain allowed',()=>{
 assert.match(generationUnavailable('https://thewholetruthfoods.com/')!,/not connected/);
 assert.equal(generationUnavailable('https://www.foundersfind.club/'),undefined);
 assert.ok(generationUnavailable('https://foundersfind.club.example.com/'));
 assert.equal(generationUnavailable('https://thewholetruthfoods.com/','connected-user'),undefined);
});
test('an unresolved lookup cannot leave a website read waiting forever',async()=>{
 await assert.rejects(beforeDeadline(new Promise(()=>{}),Date.now()+25),/too long/);
});
test('redirect or later work shares the original deadline rather than starting a new budget',async()=>{
 const deadline=Date.now()+25;
 await beforeDeadline(Promise.resolve('first hop'),deadline);
 await assert.rejects(beforeDeadline(new Promise(resolve=>setTimeout(()=>resolve('late hop'),70)),deadline),/too long/);
});
test('fast response and actual network rejection survive the deadline wrapper',async()=>{
 assert.equal(await beforeDeadline(Promise.resolve('page'),Date.now()+100),'page');
 await assert.rejects(beforeDeadline(Promise.reject(new Error('DNS failed')),Date.now()+100),/DNS failed/);
});
