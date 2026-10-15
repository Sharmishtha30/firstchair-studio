import test from 'node:test';
import assert from 'node:assert/strict';
import {contentInput,sourcePassages,requireContent,checkPlan,checkDraft,makePosts,instructionsForSource,planInstructions,type ContentDraft} from '../convex/contentPolicy';
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
test('website-only source is explicit while existing article and call source checks remain intact',()=>{assert.throws(()=>requireContent(undefined,undefined),/transcript or an article/);assert.throws(()=>requireContent({},{}),/not both/);assert.throws(()=>requireContent({},undefined,true),/one content source/);requireContent(undefined,undefined,true);requireContent({},undefined);requireContent(undefined,{});});
test('website-only posts cite the inspected site and receive website-specific story guidance',()=>{
 const website=makePosts(draft,evidence,'website',['instagram'],'https://bluetokaicoffee.com');
 checkCreativePosts(website,evidence,['instagram']);assert.ok(website.every(post=>post.sourceKind==='website'&&post.destination==='https://bluetokaicoffee.com'));
 assert.match(instructionsForSource('website',planInstructions),/supplied website text is the ONLY content source/i);
 assert.match(instructionsForSource('article',planInstructions),/supplied article or transcript is the ONLY content source/i);
});
test('source plan rejects invented evidence and insufficient source',()=>{
 const source={kind:'article' as const,text:evidence.join(' ')};
 const plan={usable:true,reason:'',reader:'portfolio author',centralMessage:'Explain decisions',structure:'guide' as const,script:[{text:'Explain your reasoning.',evidenceIds:[0]}]};
 checkPlan(plan,sourcePassages(source.text));assert.throws(()=>checkPlan({...plan,script:[{text:'Buy now',evidenceIds:[99]} ]},sourcePassages(source.text)),/missing/);assert.throws(()=>checkPlan({...plan,usable:false,reason:'Missing context'},sourcePassages(source.text)),/More source/);
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


test('numbered evidence preserves exact source characters and all words across long inputs',()=>{
 const text='Customer: I didn’t say “always”.\nFounder: Why?\nCustomer: '+('Long example with details. '.repeat(90));
 const passages=sourcePassages(text);
 assert.ok(passages.length>3);
 for(const [id,p] of passages.entries()){assert.equal(p.id,id);assert.equal(p.text,text.slice(p.start,p.end));assert.ok(p.text.length<=600);}
 assert.equal(passages.map(p=>p.text).join(' ').replace(/\s+/g,' '),text.trim().replace(/\s+/g,' '));
 assert.equal(passages.at(-1)?.speaker,'Customer');
});
test('plan cannot cite negative, fractional, or absent passage IDs',()=>{
 const passages=sourcePassages('An exact source passage.');
 const base={usable:true,reason:'',reader:'reader',centralMessage:'message',structure:'guide' as const};
 for(const id of [-1,0.5,1,NaN])assert.throws(()=>checkPlan({...base,script:[{text:'message',evidenceIds:[id]}]},passages),/missing/);
 checkPlan({...base,script:[{text:'message',evidenceIds:[0]}]},passages);
});

test('semantic review sees all public copy but no private evidence or duplicate platform copies',async()=>{
 const {contentForReview}=await import('../convex/contentPolicy');
 const posts=makePosts(draft,evidence,'article',['instagram','linkedin']);
 posts[0].frames[0].quote={id:'C0',text:'Private reference'};
 const result=contentForReview(posts);assert.equal(result.length,2);
 assert.equal(result[0].frames[0].heading,posts[0].frames[0].heading);
 assert.equal(result[0].caption,posts[0].caption);
 assert.ok(!JSON.stringify(result).includes('Private reference'));assert.ok(!('sourceFacts' in result[0]));
});


test('review failures require location, reason and correction; empty issues means pass',async()=>{
 const {reviewSchema,reviewReasons}=await import('../convex/contentPolicy');
 assert.deepEqual(reviewReasons(reviewSchema.parse({issues:[]})),[]);
 assert.throws(()=>reviewSchema.parse({supported:false,coherent:true,private:true}));
 assert.throws(()=>reviewSchema.parse({issues:[{category:'accuracy',location:'slide 1',problem:' ',fix:''}]}));
 const review=reviewSchema.parse({issues:[{category:'accuracy',slideNumbers:[2],location:'slide 2',problem:'One week is presented as a permanent result.',fix:'Restore the one-week caveat.'}]});
 assert.match(reviewReasons(review)[0],/slide 2.*Restore the one-week caveat/);
});

test('review input excludes all planning IDs and retains the full source and public copy',async()=>{
 const {contentReviewInput}=await import('../convex/contentPolicy');
 const source={kind:'article' as const,text:'Full source with caveats.'};
 const plan={structure:'guide' as const,centralMessage:'Keep caveats',script:[{text:'Internal',evidenceIds:[42]}]};
 const input=contentReviewInput(source,plan,makePosts(draft,evidence,'article',['instagram']));
 assert.deepEqual(input.source,source);assert.equal(input.structure,'guide');
 assert.ok(!JSON.stringify(input).includes('evidenceIds'));assert.ok(!('plan' in input));
});

test('a stale optional highlight is dropped without altering any content',async()=>{
 const {validHighlights}=await import('../convex/contentPolicy');
 const input={...draft,static:{...draft.static,emphasis:'not in the text'},carousel:[{...slide(0),emphasis:'decision'},slide(1)]};
 const result=validHighlights(input);assert.equal(result.static.emphasis,'');assert.equal(result.static.heading,input.static.heading);assert.equal(result.static.body,input.static.body);assert.deepEqual(result.static.evidenceIds,input.static.evidenceIds);assert.equal(result.carousel[0].emphasis,'decision');checkDraft(result,evidence);
});




test('repeated slide bodies and incomplete static endings are rejected before review',async()=>{
 const {duplicateSlideIssue,danglingCopy,publicMetadata}=await import('../convex/contentPolicy');
 const a={...slide(0),body:'Ask about one recent experience.'};
 const b={...slide(1),body:'Ask about one recent experience'};
 assert.equal(duplicateSlideIssue([a,b])?.slideNumber,2);
 assert.equal(duplicateSlideIssue([a,slide(2)]),null);
 assert.equal(danglingCopy({...a,body:'Learn whether they,'}),true);
 assert.equal(danglingCopy({...a,body:'One interview offers clues, not proof.'}),false);
 assert.equal(publicMetadata([a],a).staticCaption,a.heading+' '+a.body);
});


test('artificial word joining cannot masquerade as short copy',async()=>{
 const {malformedSpacing}=await import('../convex/contentPolicy');
 assert.equal(malformedSpacing({...slide(0),body:'Switching.from.three.separate.spreadsheets'}),true);
 assert.equal(malformedSpacing({...slide(0),heading:'One-shared-order-tracker'}),true);
 assert.equal(malformedSpacing({...slide(0),body:'A shared order tracker reduced the weekly check.'}),false);
 assert.equal(malformedSpacing({...slide(0),body:'A one-week result is not proof of long-term success.'}),false);
});
test('only transcripts get speaker labels; article and website prefixes are not people',()=>{
 const article=sourcePassages('Note: forwards need genuine exposure.\nStep 2: match dollars first.',false);
 assert.ok(article.every(p=>p.speaker===undefined));
 const website=sourcePassages('PAGE https://example.com/\nh1: Coffee roasted weekly\np: Ships across India.',false);
 assert.ok(website.every(p=>p.speaker===undefined));assert.equal(website[1].text,'h1: Coffee roasted weekly');
 assert.equal(sourcePassages('Customer: It took a week.')[0].speaker,'Customer');
});
