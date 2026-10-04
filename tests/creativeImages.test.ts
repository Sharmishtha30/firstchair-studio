import test from 'node:test';import assert from 'node:assert/strict';import {planningImages} from '../convex/creativeImages';
test('visual planning receives website bytes paired with asset keys, not inaccessible local URLs',async()=>{
 const assets=[{key:'image-2',file:'stored-product',alt:'Coffee product'},{key:'image-4',file:'stored-room',alt:'Background image'}],bytes=new Uint8Array([1,2,3]);
 const messages=await planningImages(assets,async a=>new Blob([bytes],{type:a.file==='stored-product'?'image/png':'image/webp'}));
 assert.equal(messages.length,1);const content=messages[0].content as any[];assert.equal(content.filter(p=>p.type==='image').length,2);assert.match(content[1].text,/image-2/);assert.deepEqual(content[2].image,bytes);assert.match(content[3].text,/image-4/);assert.equal(content[4].mediaType,'image/webp');assert.ok(content.filter(p=>p.type==='image').every(p=>p.image instanceof Uint8Array));
});
test('missing stored images do not become a claimed visual inspection',async()=>{assert.deepEqual(await planningImages([{key:'gone',file:'gone',alt:''}],async()=>null),[]);});
test('planning cannot send SVG code or oversized image files',async()=>{
 const assets=[{key:'image-1',file:'stored',alt:''}];await assert.rejects(planningImages(assets,async()=>new Blob(['<svg/>'],{type:'image/svg+xml'})),/bounded raster/);await assert.rejects(planningImages(assets,async()=>new Blob([new Uint8Array(2*1024*1024+1)],{type:'image/png'})),/bounded raster/);
});
test('visual planning retains the existing six-image resource ceiling',async()=>{await assert.rejects(planningImages(Array.from({length:7},(_,i)=>({key:String(i),file:i,alt:''})),async()=>null),/Too many/);});
