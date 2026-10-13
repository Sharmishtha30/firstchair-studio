import test from 'node:test';
import assert from 'node:assert/strict';
import {checkChoice,checkHooks,checkChosenHook,insightSchema,redactMakingInPlace,type CallMaking} from '../convex/callMaking';
import {anonymizePosts} from '../convex/callPrivacy';
const hooks={options:['I got good at work I never chose.','I wanted harder problems, not another title.','My job got easier. That was the problem.','I learned more when nobody taught me.','I could solve problems I could not explain.'],pick:2,reason:'This names a recognizable tension without giving away the turn.'};
test('automatic choices require all options, a valid pick, and one short reason',()=>{
 assert.doesNotThrow(()=>checkChoice(hooks,5));
 for(const bad of [{...hooks,pick:0},{...hooks,pick:6},{...hooks,pick:1.5},{...hooks,reason:''},{...hooks,reason:'first\nsecond'},{...hooks,options:hooks.options.slice(1)}])assert.throws(()=>checkChoice(bad,5));
});
test('every hook is distinct and strictly under twelve words, not just the chosen hook',()=>{
 assert.doesNotThrow(()=>checkHooks(hooks));
 assert.throws(()=>checkHooks({...hooks,options:[...hooks.options.slice(0,4),'I wanted a harder problem. (C54)']}),/source sentence IDs/);
 assert.throws(()=>checkHooks({...hooks,options:[...hooks.options.slice(0,4),'one two three four five six seven eight nine ten eleven twelve']}),/under 12/);
 assert.throws(()=>checkHooks({...hooks,options:[...hooks.options.slice(0,4),hooks.options[0]]}),/different/);
});
test('every insight has transcript evidence and there are exactly five options',()=>{
 const schema=insightSchema(['C0','C1','C2']);const option={text:'Work became easy before it became meaningful.',lineIds:['C0','C1']};
 const result={audience:'People seeking more challenging work',options:Array.from({length:5},()=>option),pick:1,reason:'The contradiction matters to this audience.'};
 assert.doesNotThrow(()=>schema.parse(result));
 assert.throws(()=>schema.parse({...result,options:[{...option,lineIds:['C0','C99']},...result.options.slice(1)]}));
 assert.throws(()=>schema.parse({...result,options:result.options.slice(1)}));
});
test('drafts and reviewer corrections must keep the selected hook alone on slide one',()=>{
 const hook=hooks.options[1],frame={heading:hook,body:'',eyebrow:'',items:[],design:{takeaway:''}};
 assert.doesNotThrow(()=>checkChosenHook([{format:'carousel',frames:[frame]},{format:'static',frames:[{heading:'A different static',body:''}]}],hook));
 for(const change of [{heading:'A replacement hook'},{body:'An extra sentence'},{eyebrow:'An extra label'},{design:{takeaway:'An extra CTA'}}])assert.throws(()=>checkChosenHook([{format:'carousel',frames:[{...frame,...change}]}],hook));
});
test('private making notes can be sanitized without retaining customer identifiers',()=>{
 const quote={id:'C0',text:'I joined Acme.',privateSpans:[{start:9,length:4,company:true}]};
 const [result]=anonymizePosts([{frames:[],concept:{options:['Acme was the turning point.'],pick:1,reason:'Acme mattered.'}}],[quote]);
 assert.doesNotMatch(JSON.stringify(result),/Acme/);assert.match(JSON.stringify(result),/REDACTED/);
});

test('saving a privacy-clean checkpoint during a model request does not lose the returned step',async()=>{
 const making:CallMaking={version:1};
 const quote={id:'C0',text:'I joined Acme.',privateSpans:[{start:9,length:4,company:true}]};
 making.concept=await (async()=>{assert.equal(redactMakingInPlace(making,[quote]),making);return {options:['Acme changed my work.','Another angle.','A third angle.'],pick:1,reason:'The strongest tension.'};})();
 redactMakingInPlace(making,[quote]);
 assert.equal(making.concept.pick,1);
 assert.equal(making.concept.options.length,3);
 assert.equal(making.concept.options[0],'[REDACTED] changed my work.');
});
