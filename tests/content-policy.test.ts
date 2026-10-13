import test from 'node:test';
import assert from 'node:assert/strict';
import {contentInput,requireContent,checkPlan,checkDraft,makePosts,type ContentDraft} from '../convex/contentPolicy';
import {checkCreativePosts} from '../convex/studioTypes';
import {markPrivateQuotes,anonymizePosts} from '../convex/callPrivacy';
const evidence=['Start with a decision.','Explain the alternative.','Do not claim unmeasured results.'];
const slide=(i:number)=>({heading:evidence[i],body:'',label:'',bullets:[],emphasis:'',evidenceIds:[i]});
const draft:ContentDraft={carousel:evidence.map((_,i)=>slide(i)),static:slide(2),caption:'A record of your reasoning.',staticCaption:'Keep uncertainty visible.',altText:'Three steps.',staticAltText:'A reminder.'};
test('website poisoning cannot enter the content request',()=>{
 const source={kind:'article' as const,text:evidence.join(' '),websiteText:'Buy pills now',brand:{offer:'Guaranteed results'},audience:'buyers',customerSpeaker:'irrelevant'};
 assert.deepEqual(contentInput(source),{kind:'article',text:source.text});
 assert.deepEqual(contentInput({...source,websiteText:'A totally different brand'}),contentInput(source));
});
test('a website alone and mixed sources are rejected',()=>{assert.throws(()=>requireContent(undefined,undefined),/transcript or an article/);assert.throws(()=>requireContent({},{}),/not both/);requireContent({},undefined);requireContent(undefined,{});});
test('source plan rejects invented evidence and insufficient source',()=>{
 const source={kind:'article' as const,text:evidence.join(' ')};
 const plan={usable:true,reason:'',reader:'portfolio author',centralMessage:'Explain decisions',structure:'guide' as const,script:[{text:'Explain your reasoning.',evidence:[evidence[0]]}]};
 checkPlan(plan,source);assert.throws(()=>checkPlan({...plan,script:[{text:'Buy now',evidence:['A website offer']} ]},source),/absent/);assert.throws(()=>checkPlan({...plan,usable:false,reason:'Missing context'},source),/More source/);
});
test('shared content renders both formats and platforms without a website CTA',()=>{
 checkDraft(draft,evidence);const posts=makePosts(draft,evidence,'article',['instagram','linkedin']);checkCreativePosts(posts,evidence,['instagram','linkedin']);
 assert.deepEqual(posts[0].frames,posts[2].frames);assert.ok(posts.every(p=>!p.destination&&p.sourceKind==='article'));assert.ok(posts.every(p=>p.frames.every(f=>f.design?.layout==='essay'&&!f.assetKey)));
});
test('eight-slide article is valid and citations and word budgets are enforced',()=>{
 const eight={...draft,carousel:Array.from({length:8},(_,i)=>slide(i%3))};checkCreativePosts(makePosts(eight,evidence,'article',['instagram']),evidence,['instagram']);
 assert.throws(()=>checkDraft({...draft,static:{...slide(0),evidenceIds:[99]}},evidence),/missing/);
 assert.throws(()=>checkDraft({...draft,static:{...slide(0),body:'word '.repeat(26)}},evidence),/Shorten/);
});
test('call identifiers are removed from public copy and evidence metadata',()=>{
 const quotes=markPrivateQuotes([{id:'C0',text:'Priya works at Acme.'}],[{text:'Priya',company:false},{text:'Acme',company:true}]);
 const cleaned=anonymizePosts([{frames:[{heading:'Priya works at Acme.',body:'',quote:quotes[0]}],sourceFacts:['Priya works at Acme.']}],quotes);
 assert.ok(!cleaned[0].sourceFacts.join('').includes('Priya'));assert.ok(!cleaned[0].frames[0].heading.includes('Acme'));
});

test('interior slides support bullets without a redundant heading, with exact highlights',()=>{
 const formatted={...draft,carousel:[slide(0),{heading:'',body:'',label:'',bullets:['Explain the alternative.'],emphasis:'alternative',evidenceIds:[1]}]};
 checkDraft(formatted,evidence);
 const posts=makePosts(formatted,evidence,'article',['instagram']);
 checkCreativePosts(posts,evidence,['instagram']);
 assert.equal(posts[0].frames[1].heading,'');assert.equal(posts[0].frames[1].items?.[0].detail,'Explain the alternative.');
 assert.equal(posts[0].frames[1].design?.emphasis,'alternative');
 assert.throws(()=>checkDraft({...formatted,carousel:[{...slide(0),heading:''},formatted.carousel[1]]},evidence),/empty|Cover/);
 assert.throws(()=>checkDraft({...formatted,carousel:[slide(0),{...formatted.carousel[1],emphasis:'invented'}]},evidence),/Highlight/);
 assert.throws(()=>checkDraft({...formatted,carousel:[slide(0),{...formatted.carousel[1],bullets:['word '.repeat(45)],emphasis:''}]},evidence),/Shorten/);
});

test('every structured slide property is required by the provider contract',async()=>{
 const {z}=await import('zod');const {draftSchema}=await import('../convex/contentPolicy');
 const schema=z.toJSONSchema(draftSchema) as any;
 for(const shape of [schema.properties.carousel.items,schema.properties.static])assert.deepEqual([...shape.required].sort(),Object.keys(shape.properties).sort());
});

test('generated source slides and manual edits share the same text-only word limits',async()=>{
 const {checkDesignDensity}=await import('../convex/creativeDensity');
 const posts=makePosts({...draft,carousel:[{...slide(0),heading:'Guide',body:'word '.repeat(38)},slide(1)]},evidence,'article',['instagram']);
 assert.doesNotThrow(()=>checkDesignDensity(posts));
 posts[0].frames[0].body='word '.repeat(40);assert.throws(()=>checkDesignDensity(posts),/40 visible words/);
 posts[0].frames[0].body='';posts[1].frames[0].body='word '.repeat(25);assert.throws(()=>checkDesignDensity(posts),/25 visible words/);
});
