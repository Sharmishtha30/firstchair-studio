import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const admin=(name:string,args:unknown)=>JSON.parse(execFileSync('npx',['convex','run',name,JSON.stringify(args)],{encoding:'utf8'})||'null');
const token=randomBytes(32).toString('hex');const packId=admin('studioVerification:deadlineFixture',{token});
admin('studio:expire',{packId,startedAt:99});assert.equal(admin('studio:get',{token}).stage,'Writing carousel, static and reel');console.log('PASS a previous job deadline cannot expire a newer operation');
admin('studio:expire',{packId,startedAt:100});const failed=admin('studio:get',{token});assert.equal(failed.stage,'Needs attention');assert.match(failed.error,/two minutes/);console.log('PASS the server watchdog turns a stalled job into an explicit error');
admin('studio:update',{packId,stage:'Ready'});assert.equal(admin('studio:get',{token}).stage,'Needs attention');console.log('PASS a late response cannot overwrite the failed state');
