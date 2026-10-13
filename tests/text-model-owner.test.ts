import test from 'node:test';
import assert from 'node:assert/strict';
import {textModel} from '../convex/textModel';
import {encrypt} from '../convex/chatgptSecurity';
import type {ActionCtx} from '../convex/_generated/server';
import type {Id} from '../convex/_generated/dataModel';

test('background writer uses only its saved owner; public writer still requires a signed-in session',async()=>{
 const keys=['AI_PROVIDER','CONVEX_SITE_URL','SITE_URL','CHATGPT_TOKEN_KEY'] as const;
 const before=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.AI_PROVIDER='chatgpt';process.env.CONVEX_SITE_URL='http://127.0.0.1:3211';process.env.SITE_URL='http://localhost:5173';process.env.CHATGPT_TOKEN_KEY=Buffer.alloc(32,7).toString('base64');
  const encrypted=await encrypt({access_token:'test-only',scope:'chatgpt.tokens.use.direct',expiresAt:Date.now()+600000,model:'fixture-model'});
  const owners:string[]=[];
  const ctx={auth:{getUserIdentity:async()=>null},runQuery:async(_fn:unknown,args:{userId:string})=>{owners.push(args.userId);return args.userId==='saved-owner'?{encrypted}:null;}} as unknown as ActionCtx;
  assert.equal((await textModel(ctx,'saved-owner' as Id<'users'>)).modelName,'fixture-model');
  assert.deepEqual(owners,['saved-owner']);
  await assert.rejects(textModel(ctx),/Continue with ChatGPT/);
  await assert.rejects(textModel(ctx,'other-owner' as Id<'users'>),/connection is unavailable/);
 }finally{for(const k of keys){if(before[k]===undefined)delete process.env[k];else process.env[k]=before[k];}}
});
