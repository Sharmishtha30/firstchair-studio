import {test} from 'node:test';
import assert from 'node:assert/strict';
import {zipSync,strToU8} from 'fflate';
import {callCandidates,checkCallInput,readCall,checkStorylines,checkCallStory,attachQuotes,stripQuotes,flagSlides,type CallQuote} from '../convex/customerCall';
import {checkDesignDensity,checkProductPriority} from '../convex/creativeDensity';
import type {Post} from '../convex/studioTypes';
import {completedProgress,generationSteps,callGenerationSteps} from '../convex/onboarding';
import {vttText,docxText} from '../src/transcriptFile';

// Fictional call, written for these tests.
const labelled=`Founder: Thanks for joining. How do you plan your bakery orders now?
Customer: Hi, yes, thanks.
Customer: Every evening I copy orders from WhatsApp into a paper notebook.
Customer: Last week I missed two birthday cakes because a message got buried.
Founder: What would help?
Customer: I just want one list that tells me what to bake tomorrow morning.`;
const named=labelled.replace(/^Customer:/gm,'Maya:');

test('only the customer’s substantive sentences become candidates',()=>{
 const c=callCandidates(labelled);
 assert.deepEqual(c,['Every evening I copy orders from WhatsApp into a paper notebook.','Last week I missed two birthday cakes because a message got buried.','I just want one list that tells me what to bake tomorrow morning.']);
 assert.ok(!c.some(s=>/How do you plan|What would help/.test(s)));
});
test('named speakers need an explicit customer choice',()=>{
 assert.throws(()=>callCandidates(named),/Choose which speaker is the customer/);
 assert.equal(callCandidates(named,'Maya').length,3);
 assert.throws(()=>checkCallInput({name:'call.txt',text:named+'\n'.repeat(1)+'Maya: '+'More detail about the notebook routine. '.repeat(5),customerSpeaker:'Priya'}),/not in this transcript/);
});
test('too little customer speech or text is refused plainly',()=>{
 assert.throws(()=>checkCallInput({name:'',text:'Customer: Hello.'}),/too short/);
 assert.throws(()=>callCandidates('Founder: Tell me more.\nCustomer: Hi.\nCustomer: Sure, okay.\nFounder: Right.'),/at least three things the customer said/);
});
test('the whole call is read in order: every customer sentence gets an ID in exactly one chunk, nothing is dropped',()=>{
 const long=Array.from({length:400},(_,i)=>`Founder: Question number ${i} about the shop?\nCustomer: In week ${i} I packed orders until midnight again. That meant ${i} late nights.`).join('\n');
 const {sentences,chunks}=readCall(long,undefined,4000);
 assert.equal(sentences.length,800);
 assert.ok(chunks.length>10);
 const ids=chunks.flatMap(c=>c.ids);
 assert.equal(ids.length,800);assert.equal(new Set(ids).size,800);
 assert.ok(chunks.every(c=>c.text.length<=4200));
 assert.match(chunks[0].text,/^Founder: Question number 0 about the shop\?\nCustomer: \[C0\] In week 0/);
 assert.match(chunks.at(-1)!.text,/\[C799\] That meant 399 late nights\./);
 assert.throws(()=>checkCallInput({name:'',text:'x'.repeat(150_001)}),/too long/);
});
test('storylines keep only backed, short-hooked tensions, ranked as given, and carry their exact lines',()=>{
 const sentences=['I trained as an architect for five years.','During COVID there were no projects at all.','I took night shifts at an Amazon warehouse.','At night I taught myself to code.'];
 const base={title:'Degree vs warehouse',tension:'Trained architect packing boxes',turningPoint:'Teaching myself to code at night',detail:'Night shifts at Amazon'};
 const {storylines,lines}=checkStorylines([
  {...base,hook:'Architect by degree. Amazon warehouse by necessity. Coder by night.',lineIds:['C0','C2','C3','C9']},
  {...base,title:'Too long',hook:'I had no architecture projects during COVID and it was a really hard time',lineIds:['C1','C2']},
  {...base,title:'Thin',hook:'No projects at all.',lineIds:['C1']},
  {...base,title:'Second',hook:'No projects. Then night shifts.',lineIds:['C1','C2']}],sentences);
 assert.deepEqual(storylines.map(x=>[x.id,x.title]),[['S1','Degree vs warehouse'],['S2','Second']]);
 assert.deepEqual(storylines[0].lineIds,['C0','C2','C3']);
 assert.deepEqual(lines.map(l=>l.id),['C0','C2','C3','C1']);
 assert.equal(lines[0].text,sentences[0]);
 assert.throws(()=>checkStorylines([{...base,hook:'x y',lineIds:['C1']}],sentences),/No storyline/);
});
const lines:CallQuote[]=[
 {id:'Q0',text:'Every evening I copy orders from WhatsApp into a paper notebook.'},
 {id:'Q1',text:'Last week I missed two birthday cakes because a message got buried.'},
 {id:'Q2',text:'I just want one list that tells me what to bake tomorrow morning.'}];
const slide=(heading:string,body:string,quote?:CallQuote)=>({heading,body,...(quote?{quote}:{})});
const story=()=>[
 slide('I missed two birthday cakes in one week.','',lines[1]),
 slide('Every order lived in my WhatsApp.','So every evening I copied them into a paper notebook.',lines[0]),
 slide('Then one message got buried.','I found it the next day. Two cakes I never baked.',lines[1]),
 slide('All I wanted was one list.','Something that told me what to bake tomorrow morning.',lines[2]),
 slide('Now I start with that list.','Nothing important hides in a chat.',lines[2]),
 slide('Plan tomorrow’s bakes in one place','Try it free'),
];
test('a call carousel is one first-person story with a short hook and a closing action',()=>{
 assert.doesNotThrow(()=>checkCallStory([{format:'carousel',frames:story()}],lines,'Ovenly'));
 assert.throws(()=>checkCallStory([{format:'carousel',frames:story().slice(0,4)}],lines,'Ovenly'),/5 to 7 slides/);
 const longHook=story();longHook[0]=slide('I missed two birthday cakes in one single week of December orders.','',lines[1]);
 assert.throws(()=>checkCallStory([{format:'carousel',frames:longHook}],lines,'Ovenly'),/under 12 words/);
 const brandHook=story();brandHook[0]=slide('I wish I had found Ovenly sooner.','',lines[2]);
 assert.throws(()=>checkCallStory([{format:'carousel',frames:brandHook}],lines,'Ovenly'),/names the brand/);
 const generic=story();generic[0]=slide('Struggling with bakery orders?','',lines[1]);
 assert.throws(()=>checkCallStory([{format:'carousel',frames:generic}],lines,'Ovenly'),/generic question|first-person/);
 const long=story();long[2]=slide('Then one message got buried under forty other chats.','I only found it the next afternoon, long after the party, and I had to call the family and apologise for two cakes.',lines[1]);
 assert.throws(()=>checkCallStory([{format:'carousel',frames:long}],lines,'Ovenly'),/25 words or fewer/);
});
test('rewritten lines are never presented as direct quotes and stay in the customer’s voice',()=>{
 const quoted=story();quoted[1]=slide('“Every order lived in my WhatsApp.”','I copied them nightly.',lines[0]);
 assert.throws(()=>checkCallStory([{format:'carousel',frames:quoted}],lines,'Ovenly'),/quotation marks/);
 const labelled=story();labelled[1]=slide('A customer said orders lived in WhatsApp','I copied them nightly.',lines[0]);
 assert.throws(()=>checkCallStory([{format:'carousel',frames:labelled}],lines,'Ovenly'),/labels its line/);
 const third=story();third[2]=slide('Then a message got buried.','Two cakes were never baked.',lines[1]);
 assert.throws(()=>checkCallStory([{format:'carousel',frames:third}],lines,'Ovenly'),/first-person voice/);
 const unlinked=story();unlinked[3]=slide('All I wanted was one list.','Something simple.');
 assert.throws(()=>checkCallStory([{format:'carousel',frames:unlinked}],lines,'Ovenly'),/not linked to the transcript line/);
 const forged=story();forged[3]=slide('All I wanted was one list.','Something simple.',{...lines[2],text:'Invented words.'});
 assert.throws(()=>checkCallStory([{format:'carousel',frames:forged}],lines,'Ovenly'),/not linked/);
 assert.doesNotThrow(()=>checkCallStory([{format:'static',frames:[slide('I lost two cake orders to one buried message.','',lines[1])]}],lines,'Ovenly'));
});
test('the closing slide keeps its action; quoteId NONE never becomes a quote',()=>{
 const written=attachQuotes({posts:[{format:'carousel',frames:[{heading:'Try it',body:'',quoteId:'NONE'},{heading:'I',body:'',quoteId:'Q0'}]}]},lines);
 assert.deepEqual(written.posts[0].frames[0],{heading:'Try it',body:''});
 assert.deepEqual(written.posts[0].frames[1],{heading:'I',body:'',quote:lines[0]});
 assert.deepEqual(stripQuotes(written.posts)?.[0].frames[1],{heading:'I',body:''});
});
test('call packs may use type-led story slides; website-only packs keep every existing rule',()=>{
 const design={layout:'essay' as const,surface:'paper' as const,align:'left' as const,imagePosition:'top' as const,emphasis:'',takeaway:''};
 const posts=[{format:'carousel',platform:'instagram',hook:'h',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'h',body:'',design},{heading:'Every order lived in my WhatsApp.',body:'',design}]}] as Post[];
 assert.throws(()=>checkDesignDensity(posts),/needs a relevant source image/);
 assert.doesNotThrow(()=>checkDesignDensity(posts,{story:true}));
 const assets=[{key:'p1',role:'product'}];
 assert.throws(()=>checkProductPriority(posts,'product',assets),/tangible product must lead/);
 assert.throws(()=>checkProductPriority(posts,'product',assets,{story:true}),/slide 2: tangible product/);
 const closing=[{...posts[0],frames:[posts[0].frames[0],{heading:'Shop',body:'',assetKey:'p1',design:{...design,layout:'product' as const}}]}] as Post[];
 assert.doesNotThrow(()=>checkProductPriority(closing,'product',assets,{story:true}));
});
test('a weak handoff is only a warning on the failing middle slide; unclear slides are flagged too',()=>{
 const post={format:'carousel',platform:'instagram',frames:[{heading:'a'},{heading:'b'},{heading:'c'},{heading:'d'}]};
 const ok={platform:'instagram',format:'carousel',clear:true,raisesQuestion:true};
 const [flagged]=flagSlides([post],[{...ok,slide:1,raisesQuestion:false},{...ok,slide:2,raisesQuestion:false},{...ok,slide:3,clear:false},{...ok,slide:4,raisesQuestion:false}]);
 assert.deepEqual(flagged.frames,[{heading:'a'},{heading:'b',weakHandoff:true},{heading:'c',unclear:true},{heading:'d'}]);
 assert.deepEqual(flagSlides([{...post,format:'static',frames:[{heading:'s'}]}],[{...ok,format:'static',slide:1,raisesQuestion:false}])[0].frames,[{heading:'s'}]);
});
test('website-only progress keeps its six steps; call packs add one',()=>{
 assert.equal(generationSteps.length,6);
 assert.equal(completedProgress(['website','colours','assets','plan','drafts','review']),100);
 assert.equal(completedProgress(['website','colours','assets','plan','drafts','review'],callGenerationSteps),86);
});
test('VTT voice tags keep speakers; DOCX paragraphs become lines',()=>{
 const vtt='WEBVTT\n\nNOTE fictional\n\n1\n00:00:01.000 --> 00:00:04.000\n<v Founder>How do you plan orders?</v>\n\n2\n00:00:04.500 --> 00:00:09.000\n<v Maya>I copy orders into a paper notebook &amp; hope.</v>';
 assert.equal(vttText(vtt),'Founder: How do you plan orders?\nMaya: I copy orders into a paper notebook & hope.');
 const xml='<w:document><w:body><w:p><w:r><w:t>Founder: How</w:t></w:r><w:r><w:t xml:space="preserve"> do you plan?</w:t></w:r></w:p><w:p><w:r><w:t>Maya: Paper</w:t><w:tab/><w:t>notebook &amp; pen.</w:t></w:r></w:p></w:body></w:document>';
 assert.equal(docxText(zipSync({'word/document.xml':strToU8(xml)})),'Founder: How do you plan?\nMaya: Paper notebook & pen.');
 assert.throws(()=>docxText(new Uint8Array([1,2,3])),/could not be opened/);
});
