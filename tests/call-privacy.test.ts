import test from 'node:test';
import assert from 'node:assert/strict';
import {markPrivateQuotes,anonymizePosts,publicRedactions} from '../convex/callPrivacy';
import {installRedactionInk} from '../src/redactionInk';
test('identifiers survive only in source quotes, including captions and nested slide fields',()=>{
 const q=markPrivateQuotes([{id:'C1',text:'I am Maya in Pune. I worked at Acme Labs.'}],[{text:'Maya',company:false},{text:'Pune',company:false},{text:'Acme Labs',company:true}])[0];
 const [p]=anonymizePosts([{caption:'Maya in Pune at Acme Labs',frames:[{quote:q,heading:'I joined Acme Labs.',body:'Maya in Pune',design:{takeaway:'ACME LABS'},items:[{label:'Maya',detail:'Pune'}]}]}],[q]);
 assert.equal(p.frames[0].heading,'I joined [R:31:4] [R:36:4].');
 assert.equal(p.frames[0].quote.text,q.text);
 const {quote,...visible}=p.frames[0];assert.doesNotMatch(JSON.stringify({...p,frames:[visible]}),/Maya|Pune|Acme Labs/i);
 assert.equal(publicRedactions(p.frames[0].heading),'I joined [REDACTED] [REDACTED].');
 assert.throws(()=>anonymizePosts([{frames:[{quote:q,heading:'[R:0:5]'}]}],[q]),/not backed/);
});
test('a redaction paints a solid rectangle at the original word width and never paints the word',()=>{
 const calls:{kind:string;text?:string;width?:number}[]=[];
 const ctx={font:'400 40px Brand',textAlign:'left',textBaseline:'top',measureText:(text:string)=>({width:text.length*11}),fillText:(text:string)=>calls.push({kind:'text',text}),fillRect:(_x:number,_y:number,width:number)=>calls.push({kind:'bar',width})} as unknown as CanvasRenderingContext2D;
 const q=markPrivateQuotes([{id:'C0',text:'Acme Labs'}],[{text:'Acme Labs',company:true}])[0];installRedactionInk(ctx,q);
 assert.equal(ctx.measureText('At [R:0:4]').width,77);ctx.fillText('At [R:0:4]',0,0);
 assert.deepEqual(calls,[{kind:'text',text:'At '},{kind:'bar',width:44}]);
});
test('editing a known employer back into slide copy still redacts it; missing evidence stops rendering',()=>{
 const q=markPrivateQuotes([{id:'C0',text:'I worked at Acme.'}],[{text:'Acme',company:true}])[0];
 const [post]=anonymizePosts([{hook:'I worked at Acme.',frames:[{heading:'I worked at Acme.',quote:q}]}],[q]);
 assert.equal(post.hook,post.frames[0].heading);assert.equal(post.hook,'I worked at [R:12:4].');
 assert.throws(()=>anonymizePosts([{frames:[{heading:'Acme',quote:{id:'C1',text:'No company here.'}}]}],[q]),/source quote/);
 assert.throws(()=>anonymizePosts([{frames:[{heading:'[R:12:4]'}]}],[q]),/source quote/);
});

test('weekdays, months, time words and speaker roles are never redacted',async()=>{
 const {identifyingEntities,markPrivateQuotes}=await import('../convex/callPrivacy');
 const found=[{text:'Friday',company:false},{text:'Friday afternoons',company:false},{text:'Founder',company:false},{text:'March 2026',company:false},{text:'Priya Shah',company:false},{text:'Acme Logistics',company:true}];
 assert.deepEqual(identifyingEntities(found).map(e=>e.text),['Priya Shah','Acme Logistics']);
 // The quote from the 14 October live call run.
 const [q]=markPrivateQuotes([{id:'C0',text:'I used to spend every Friday chasing updates.'}],[{text:'Friday',company:false}]);
 assert.deepEqual(q.privateSpans,[]);
});
