import test from 'node:test';
import assert from 'node:assert/strict';
import {checkArticleInput,articleExcerpts,articleRules} from '../convex/articleInput';
import {callProblem,callForStart} from '../src/CallInput';
test('article validates separately from transcript speakers and keeps exact evidence',()=>{
 const text='A useful article discusses how founders choose a focused message. '.repeat(5);
 const draft={kind:'article' as const,name:'',text,customerSpeaker:''};
 assert.equal(callProblem(draft),'');assert.equal(checkArticleInput(draft).name,'Pasted article');
 assert.ok(articleExcerpts(text).every(x=>text.includes(x)));assert.match(articleRules,/supplies no content/i);
 assert.throws(()=>checkArticleInput({name:'',text:'too short'}),/200/);
 assert.throws(()=>checkArticleInput({name:'',text:'a'.repeat(60001)}),/60,000/);
 assert.equal(callForStart({...draft,name:'Pasted article'})?.name,'Pasted article');
});
