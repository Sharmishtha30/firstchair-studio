import test from 'node:test';
import assert from 'node:assert/strict';
import {shapeProblems,shapeCorrections,trimExampleRows} from '../convex/contentFormatting';
import {planSchema,publicMetadata,slideItems,makePosts,metaCopyIssue,fragmentIssue,overclaimIssue,fillerRowIssue,echoIssue,addedRuleIssue,stripAddedRules,contentReviewInput,type ContentDraft} from '../convex/contentPolicy';
import {checkCreativePosts} from '../convex/studioTypes';

const frame=(heading:string,body='',bullets:string[]=[])=>({label:'',heading,body,bullets,emphasis:'',evidenceIds:[0]});

// Slides from the 14 October live article run (USD receivables, INR expenses) that passed review but were too dense.
const liveCover=frame('Two gaps, fixed in order','Timing (when rupees leave) first, then currency. Map flows, maximise natural matching, convert by policy, hedge only the residual, and bridge timing with export credit.');
const liveCrammed=frame('Convert and hedge systematically','Set a budget rate and convert receipts on schedule; keep conversion distinct from hedging. After matching and conversion, hedge only the monthly net residual (60–80%, tenor‑matched). Bridge timing gaps with export‑credit backed by rolling cash‑flow visibility.');

test('the dense live-run cover and crammed slide fail the generation budgets',()=>{
 assert.ok(shapeProblems(liveCover,'cover').some(p=>/body has \d+ words/.test(p)));
 const crammed=shapeProblems(liveCrammed,'point');
 assert.ok(crammed.some(p=>/body has \d+ words; use at most 20/.test(p)));
 assert.ok(crammed.some(p=>/visible words in total; use at most 32/.test(p)));
});

test('short single-idea slides of each role pass',()=>{
 assert.deepEqual(shapeProblems(frame('Dollars in, rupees out, never in the same week','Two gaps: timing and currency.'),'cover'),[]);
 assert.deepEqual(shapeProblems(frame('Hedge only what is left','Cover 60–80% of signed contracts, less of forecasts.'),'point'),[]);
 assert.deepEqual(shapeProblems(frame('Match dollars first','',['Pay dollar suppliers from dollar receipts','Move supplier contracts into dollars','Hold matched dollars in an EEFC account']),'steps'),[]);
 assert.deepEqual(shapeProblems(frame('One short month','Healthy totals can hide a shortfall.',['Month 1: 120 in, 80 out, +40','Month 2: 60 in, 90 out, −30','Month 3: 150 in, 70 out, +80']),'example'),[]);
 assert.deepEqual(shapeProblems(frame('Convert on schedule, not headlines','A held dollar waiting for a better rate is an open position.'),'takeaway'),[]);
});

test('roles require the right shape, not just a word count',()=>{
 assert.ok(shapeProblems(frame('Match dollars first','Pay suppliers from receipts.'),'steps').some(p=>/needs 2–4 short bullets/.test(p)));
 assert.ok(shapeProblems(frame('Example','',['Month 2 was short','Month 3 was long']),'example').some(p=>/Label: value/.test(p)));
 assert.ok(shapeProblems(frame('A cover','',['a','b']),'cover').some(p=>/no bullets/.test(p)));
 assert.ok(shapeProblems(frame('Point','One sentence here.',['and a bullet']),'point').some(p=>/not both/.test(p)));
 assert.ok(shapeProblems(frame('Steps','',['Do this one thing now please and then also that']),'steps').some(p=>/bullet 1 has 10 words/.test(p)));
});

test('corrections target only dense frames, with the static numbered 0',()=>{
 const ok=frame('Hedge only what is left','Cover 60–80% of signed contracts.');
 const corrections=shapeCorrections({carousel:[liveCover,ok,liveCrammed],static:frame('Fix timing first, then currency, and only then pay to hedge what remains of the gap')},['cover','point','point']);
 assert.deepEqual(corrections.map(c=>c.slideNumbers[0]),[1,3,0]);
 assert.ok(corrections.every(c=>/too dense/.test(c.fix)));
});

test('the outline requires one role and key point per slide',()=>{
 const base={usable:true,reason:'',reader:'exporters',centralMessage:'Fix timing, then currency',structure:'guide' as const};
 assert.ok(!planSchema.safeParse({...base,script:[{text:'Brief',evidenceIds:[0]}]}).success);
 assert.ok(planSchema.safeParse({...base,script:[{role:'cover',keyPoint:'Two gaps',text:'Brief',evidenceIds:[0]}]}).success);
 assert.ok(!planSchema.safeParse({...base,script:[{role:'essay',keyPoint:'Two gaps',text:'Brief',evidenceIds:[0]}]}).success);
});

test('steps are numbered and example rows keep label and value apart',()=>{
 assert.deepEqual(slideItems(['Map flows','2) Match dollars'],'steps').map(i=>i.detail),['1. Map flows','2. Match dollars']);
 assert.deepEqual(slideItems(['Month 2: 60 in, 90 out'],'example'),[{label:'Month 2',detail:'60 in, 90 out'}]);
 assert.deepEqual(slideItems(['Pay suppliers from receipts']),[{label:'',detail:'Pay suppliers from receipts'}]);
});

test('captions and alt text read as sentences instead of fields run together',()=>{
 const cover=frame('Two gaps, fixed in order','Timing first, then currency.'),stat=frame('Hedge only the residual','');
 const meta=publicMetadata([cover,frame('Match first','',['Pay dollar bills from dollar receipts'])],stat);
 assert.equal(meta.caption,'Two gaps, fixed in order. Timing first, then currency.');
 assert.equal(meta.altText.split('\n')[1],'Slide 2: Match first. Pay dollar bills from dollar receipts.');
});

test('structured slides still pass the shared post checks',()=>{
 const evidence=['Month 2 is the whole lesson.'];
 const draft:ContentDraft={carousel:[frame('One short month','Healthy totals can hide a shortfall.'),frame('The map','',['Month 2: 60 in, 90 out, −30','Month 3: 150 in, 70 out, +80'])],static:frame('Hedge only what is left'),caption:'',staticCaption:'',altText:'',staticAltText:''};
 const posts=makePosts(draft,evidence,'article',['instagram'],undefined,['cover','example']);
 assert.deepEqual(posts[0].frames[1].items,[{label:'Month 2',detail:'60 in, 90 out, −30'},{label:'Month 3',detail:'150 in, 70 out, +80'}]);
 checkCreativePosts(posts,evidence,['instagram']);
});

test('slides that describe themselves instead of speaking to the reader are flagged',()=>{
 const draft=(body:string,stat='One dashboard reclaimed our Friday afternoons.'):ContentDraft=>({carousel:[frame('A hook',''),frame('Pain',body)],static:frame(stat),caption:'',staticCaption:'',altText:'',staticAltText:''});
 // Bodies from the 14 October live website and call runs.
 assert.equal(metaCopyIssue(draft('Start with that tension: one sentence showing the pain of five spreadsheets.'))?.slideNumber,2);
 assert.equal(metaCopyIssue(draft('Fine body.','A concise positioning line summing Subko’s regional intent.'))?.slideNumber,0);
 assert.equal(metaCopyIssue(draft('By the time they found the numbers, the meeting was over.')),undefined);
});

test('a cover split mid-sentence across heading and body is flagged',()=>{
 const draft=(f:ReturnType<typeof frame>):ContentDraft=>({carousel:[f],static:frame('Guided by in-house Q Graders'),caption:'',staticCaption:'',altText:'',staticAltText:''});
 assert.equal(fragmentIssue(draft(frame('to help reimagine and reinvent an unlikely origin','the Indian subcontinent as a specialty origin.')))?.slideNumber,1);
 assert.equal(fragmentIssue(draft(frame('“I used to spend every Friday chasing updates”','Five spreadsheets, every week.'))),undefined);
});

test('absolute words the source never uses are flagged as overclaims',()=>{
 const site='Guided by our in-house Arabica Q Graders, we source coffee across the subcontinent. Only the residual needs hedging.';
 const draft=(body:string):ContentDraft=>({carousel:[frame('Meticulously sourced coffee',body)],static:frame('Guided by in-house Q Graders'),caption:'',staticCaption:'',altText:'',staticAltText:''});
 // Wording from the 14 October subko.coffee run.
 assert.match(overclaimIssue(draft('We oversee every batch with in-house Arabica Q Graders.'),site)?.message??'',/"every"/);
 assert.equal(overclaimIssue(draft('Guided by in-house Arabica Q Graders.'),site),undefined);
 assert.equal(overclaimIssue(draft('Hedge only the residual.'),site),undefined);
});

test('list rows padded with a filler value are flagged',()=>{
 const draft=(bullets:string[]):ContentDraft=>({carousel:[{...frame('Fine cacao, pod to bar',''),bullets}],static:frame('Guided by in-house Q Graders'),caption:'',staticCaption:'',altText:'',staticAltText:''});
 // Rows from the 15 October subko.coffee run.
 assert.equal(fillerRowIssue(draft(['Single Origin Terroir Bars: offered','Big Cubes: available']))?.slideNumber,1);
 assert.equal(fillerRowIssue(draft(['1. List: Single Origin Terroir Bars','2. List: Dark/Milk/White Bars']))?.slideNumber,1);
 assert.equal(fillerRowIssue(draft(['1. Filled Bars: Filled Bars','2. The Coated Collection: The Coated Collection']))?.slideNumber,1);
 assert.equal(fillerRowIssue(draft(['Project Sankalp: Garo Hills, Meghalaya (SCA 87)'])),undefined);
 assert.equal(fillerRowIssue(draft(['Month 1: USD in 120, out 80'])),undefined);
});

test('a body that repeats its heading is flagged',()=>{
 const draft=(f:ReturnType<typeof frame>):ContentDraft=>({carousel:[f],static:frame('Guided by in-house Q Graders'),caption:'',staticCaption:'',altText:'',staticAltText:''});
 assert.equal(echoIssue(draft(frame('FROM THE SUBCONTINENT, FOR ALL.','From the Subcontinent, For All.')))?.slideNumber,1);
 assert.equal(echoIssue(draft(frame('Hedge only the residual','After matching, hedge the net residual.'))),undefined);
 // Both from the 15 October 19:45 trad.co.in run.
 assert.equal(echoIssue(draft(frame('Dollars in, rupees out','Dollars in, rupees out, and the two never arrive in the same week.')))?.slideNumber,1);
 assert.equal(echoIssue(draft(frame('Convert by policy, not mood','Diary EEFC deadlines; avoid forced conversions',['Set an annual budget rate in pricing','Diary EEFC retention windows to avoid forced conversions'])))?.slideNumber,1);
 assert.equal(echoIssue(draft(frame('Illustrative three-month map','Figures are an example; hedge the residual, not gross flows.',['Month 1: matched 80, residual +40','Month 2: matched 60, residual −30']))),undefined);
 assert.equal(echoIssue(draft(frame('“I used to spend every Friday chasing updates”','— a customer'))),undefined);
});

test('a rule or advice line the speaker never gave is flagged in call and website posts',()=>{
 const draft=(body:string):ContentDraft=>({carousel:[frame('“I wish we had made the switch sooner.”',body)],static:frame('“I got my Friday afternoons back.”'),caption:'',staticCaption:'',altText:'',staticAltText:''});
 const call={kind:'call' as const,text:'I wish we had made the switch sooner. I got my Friday afternoons back.'};
 // From the 15 October 19:42 foundersfind.club run.
 assert.equal(addedRuleIssue(draft('A simple rule: avoid delaying obvious improvements that save time.'),call)?.slideNumber,1);
 assert.equal(addedRuleIssue(draft('— a customer'),call),undefined);
 assert.equal(addedRuleIssue(draft('A simple rule: avoid delaying obvious improvements.'),{kind:'article',text:'Hedge the residual.'}),undefined);
 assert.match(addedRuleIssue(draft('A simple rule: avoid delaying obvious improvements.'),call)?.message??'',/^slide 1 \(body\) adds "a simple rule"/i);
});

test('a leftover unsourced rule sentence is removed, keeping the rest of the slide',()=>{
 const call={kind:'call' as const,text:'I wish we had made the switch sooner.'};
 const draft:ContentDraft={carousel:[frame('“I wish we had made the switch sooner.”','Said a customer. A simple rule: avoid delaying obvious improvements.')],static:{...frame('Fridays back'),bullets:['Act earlier next time']},caption:'',staticCaption:'',altText:'',staticAltText:''};
 const {draft:out,removed}=stripAddedRules(draft,call);
 assert.equal(out.carousel[0].body,'Said a customer.');
 assert.deepEqual(out.static.bullets,[]);
 assert.equal(removed.length,2);
 assert.match(removed[0],/^slide 1: "A simple rule/);
 assert.equal(addedRuleIssue(out,call),undefined);
});

test('the reviewer sees each slide role so list slides are not flagged for missing a body',()=>{
 const input=contentReviewInput({kind:'article',text:'Source.'},{structure:'guide',centralMessage:'x'},[],['cover','steps']);
 assert.deepEqual(input.slideRoles,['cover','steps']);
});

test('an over-long example keeps its first rows; steps are never trimmed',()=>{
 const rows=['Project Sankalp Garo Hills, Meghalaya: SCA 87, medium roast, washed process, small lots','Project Pearl, Ratnagiri Estate, Karnataka: SCA 85+, natural process, single estate lot','Terroir 70% Dark: Pollachi, Tamil Nadu, fermented on the farm for six days','Agave Barrel Aged 70% Dark: West Godavari, Andhra Pradesh, aged in agave barrels'];
 const draft={carousel:[frame('Named origins','',rows),frame('Steps','',rows)]};
 const out=trimExampleRows(draft,['example','steps']);
 assert.ok(out.carousel[0].bullets.length>=2&&out.carousel[0].bullets.length<4);
 assert.deepEqual(out.carousel[0].bullets,rows.slice(0,out.carousel[0].bullets.length));
 assert.equal(out.carousel[1],draft.carousel[1]);
});

test('an over-long example drops its lesson line before any row',()=>{
 // The 15 October trad.co.in run: rows were cut while the body still cited Month 3.
 const rows=['Month 1: USD in 120, out 80, matched 80, +40','Month 2: USD in 60, out 90, matched 60, −30','Month 3: USD in 150, out 70, matched 70, +80'];
 const out=trimExampleRows({carousel:[frame('Three-month illustrative map','Month 1 +40; Month 2 −30; Month 3 +80 — hedge the residuals only.',rows)]},['example']);
 assert.deepEqual(out.carousel[0].bullets,rows);
 assert.equal(out.carousel[0].body,'');
});
