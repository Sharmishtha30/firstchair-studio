import test from 'node:test';
import assert from 'node:assert/strict';
import {aiCallLimitMessage,writerErrorMessage} from '../convex/writerErrors';
import {sourceWriterFailure} from '../convex/sourceWriterFailure';
import {OPENAI_CALLS_PER_HOUR,OPENAI_CALL_WINDOW_MS,reserveOpenAICall} from '../convex/openaiLimits';

const expected="FirstChair is busy right now. Your pack is saved, try again in a few minutes.";

test('call-limit messages shed Convex and workflow wrappers and use the exact public sentence',()=>{
 for(const message of [
  'AI call limit reached. Try again later.',
  'Uncaught ConvexError: AI call limit reached. Try again later.\n    at handler (private-location)',
  'Uncaught Error: Uncaught ConvexError: AI call limit reached. Try again later.',
  'Uncaught Error: '+expected,
  expected,
 ]){
  assert.equal(aiCallLimitMessage(message),expected);
  assert.equal(writerErrorMessage(message),expected);
  assert.equal(sourceWriterFailure(new Error(message)),expected);
 }
 assert.equal(sourceWriterFailure(new Error('SDK wrapper',{cause:new Error('AI call limit reached. Try again later.')})),expected);
});

test('unrelated website and writer failures keep their existing handling',()=>{
 for(const message of [
  'This website blocks automated reading. Open “Website blocked? Use your business text” below to continue.',
  "We couldn't reach this website right now. Try again, or paste your business text instead.",
  'The source-based story needs attention: accuracy at slide 3.',
 ]){
  assert.equal(aiCallLimitMessage(message),undefined);
  assert.equal(sourceWriterFailure(new Error(message)),message);
 }
});

test('the limit remains 50 calls in a rolling hour and denied calls do not change the counter',()=>{
 assert.equal(OPENAI_CALLS_PER_HOUR,50);
 assert.equal(OPENAI_CALL_WINDOW_MS,3600000);
 const now=4_000_000,calls=Array.from({length:50},()=>now-1000),before=[...calls];
 assert.throws(()=>reserveOpenAICall(calls,now),/AI call limit reached/);
 assert.deepEqual(calls,before);
 assert.equal(reserveOpenAICall(calls,now+OPENAI_CALL_WINDOW_MS).length,1);
});
