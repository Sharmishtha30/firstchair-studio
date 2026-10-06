import test from 'node:test';
import assert from 'node:assert/strict';
import {checkDesignDensity,checkProductPriority} from '../convex/creativeDensity';
import type {Post} from '../convex/studioTypes';
const post:Post={platform:'linkedin',format:'static',hook:'A clear request',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'A clear request',body:'Use your actual experience.',design:{layout:'split',surface:'paper',align:'left',imagePosition:'right',emphasis:'',takeaway:''},items:[{label:'Hiring manager',detail:'Explain your fit.'},{label:'Referrer',detail:'Ask for an introduction.'}]}]};
test('crowded split labels are caught before publication; caption context does not count',()=>{
 checkDesignDensity([post]);const bad=structuredClone(post);bad.frames[0].items![0].detail='Long detail '.repeat(15);assert.throws(()=>checkDesignDensity([bad]),/column detail/);
 const caption=structuredClone(post);caption.caption='Context '.repeat(150);checkDesignDensity([caption]);
});
test('connected diagrams require actual steps; posters and notes have different budgets',()=>{
 const diagram=structuredClone(post);diagram.frames[0].design!.layout='diagram';checkDesignDensity([diagram]);diagram.frames[0].items=[];assert.throws(()=>checkDesignDensity([diagram]),/supported steps/);
 const note=structuredClone(post);note.frames[0].design!.layout='note';note.frames[0].body='Useful advice '.repeat(15);checkDesignDensity([note]);note.frames[0].design!.layout='poster';assert.throws(()=>checkDesignDensity([note]),/poster body/);
});

test('photo frames stay concise while supporting detail can live in the caption',()=>{const p=structuredClone(post);p.frames[0].design!.layout='photo';p.frames[0].items=[];p.caption='Source-grounded detail '.repeat(80);checkDesignDensity([p]);p.frames[0].body='Long explanation '.repeat(8);assert.throws(()=>checkDesignDensity([p]),/photo body/);});

test('tangible product covers require a genuine product image and product layout; service posts are exempt',()=>{const p=structuredClone(post);const assets=[{key:'bottle',role:'product'}];assert.throws(()=>checkProductPriority([p],'product',assets),/product must lead/);checkProductPriority([p],'service',assets);p.frames[0]={heading:'Your daily ritual',body:'One simple step.',assetKey:'bottle',design:{layout:'product',surface:'paper',align:'center',imagePosition:'top',emphasis:'',takeaway:'Shop now'}};checkDesignDensity([p]);checkProductPriority([p],'product',assets);p.frames[0].body='Explanation '.repeat(10);assert.throws(()=>checkDesignDensity([p]),/product body/);});

test('product priority applies to the second and third carousel slides too',()=>{const p=structuredClone(post);p.format='carousel';p.frames=[{heading:'Actual bottle',body:'Daily refill',assetKey:'bottle',design:{layout:'product',surface:'paper',align:'center',imagePosition:'top',emphasis:'',takeaway:''}},structuredClone(post.frames[0]),structuredClone(post.frames[0])];assert.throws(()=>checkProductPriority([p],'product',[{key:'bottle',role:'product'}]),/slide 2/);});
test('total carousel words include lists and takeaways but exclude captions',()=>{const p=structuredClone(post);p.format='carousel';p.caption='Extra context '.repeat(200);p.frames[0].items=[];p.frames[0].body='Useful word '.repeat(18);assert.throws(()=>checkDesignDensity([p]),/32 visible words/);p.frames[0].body='One useful detail';checkDesignDensity([p]);});
