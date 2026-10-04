import test from 'node:test';
import assert from 'node:assert/strict';
import {publicAddress,websiteUrl} from '../convex/websiteSafety';
import {checkPosts} from '../convex/studioTypes';
import {foundersPosts,foundersBrand} from '../convex/foundersPack';
test('website fetch rejects private IPv4 and IPv6, credentials and unexpected ports',()=>{
 for(const ip of ['127.0.0.1','10.0.0.8','192.168.1.5','172.16.0.1','169.254.169.254','100.64.1.1','::1','fe80::1','fd00::1','::ffff:127.0.0.1'])assert.equal(publicAddress(ip),false,ip);
 for(const ip of ['8.8.8.8','1.1.1.1','2606:4700:4700::1111'])assert.equal(publicAddress(ip),true,ip);
 for(const url of ['http://localhost','http://server.local','ftp://example.com','https://user:secret@example.com','http://example.com:3210'])assert.throws(()=>websiteUrl(url));
 assert.equal(websiteUrl('foundersfind.club').href,'https://foundersfind.club/');
});
test('three formats have short hooks, complete frames and exact source facts',()=>{
 assert.equal(checkPosts(foundersPosts,foundersBrand.facts).length,3);
 const bad=structuredClone(foundersPosts);bad[0].hook='A very long opening '.repeat(10);assert.throws(()=>checkPosts(bad,foundersBrand.facts),/too long/);
 const invented=structuredClone(foundersPosts);invented[0].sourceFacts=['Guaranteed job in 30 days'];assert.throws(()=>checkPosts(invented,foundersBrand.facts),/unsupported/);
});
import {seedanceRequest} from '../convex/seedanceRequest';
import {createTask,taskState,downloadVideo} from '../convex/seedanceClient';
test('Seedance requests a vertical 25-second fictional presenter with the exact approved script',()=>{
 const reel=foundersPosts.find(p=>p.format==='reel')!;const request=seedanceRequest(reel,foundersBrand);
 assert.equal(request.model,'dreamina-seedance-2-5-260628');assert.equal(request.ratio,'9:16');assert.equal(request.duration,25);assert.equal(request.generate_audio,true);
 assert.match(request.content[0].text,/fictional adult presenter/);assert.ok(request.content[0].text.endsWith(reel.frames.map(f=>f.heading+'. '+f.body).join(' ')));
});
test('Seedance pending, completed and failed responses are distinct; invalid hosts never download',async()=>{
 const response=(data:unknown)=>async()=>Response.json(data);
 assert.equal(await createTask('test-key',{},response({id:'task-1'})),'task-1');
 assert.deepEqual(await taskState('test-key','task-1',response({status:'running'})),{done:false});
 assert.deepEqual(await taskState('test-key','task-1',response({status:'succeeded',content:{video_url:'https://test.tos-ap-southeast-1.volces.com/video.mp4'}})),{done:true,url:'https://test.tos-ap-southeast-1.volces.com/video.mp4'});
 await assert.rejects(taskState('test-key','task-1',response({status:'failed'})),/did not produce/);
 await assert.rejects(taskState('test-key','task-1',response({status:'succeeded',content:{video_url:'https://127.0.0.1/file'}})),/unexpected video host/);
 await assert.rejects(downloadVideo('https://test.volces.com/file',async()=>new Response(new Uint8Array(10))),/incomplete/);
 await assert.rejects(createTask('sensitive-key',{},async()=>new Response('sensitive-key',{status:401})),e=>e instanceof Error&&!e.message.includes('sensitive-key'));
});

test('unfinished bodies and greeting hooks cannot be saved as finished artwork',()=>{
 const draft=structuredClone(foundersPosts);draft[1].frames[0].body='Proving Ground puts';assert.throws(()=>checkPosts(draft,foundersBrand.facts),/unfinished/);
 const greeting=structuredClone(foundersPosts);greeting[0].hook='Hello everyone';assert.throws(()=>checkPosts(greeting,foundersBrand.facts),/greeting/);
});
import {extractPalette} from '../convex/brandPalette';
test('brand palette resolves only safe default CSS colors and handles cycles',()=>{
 assert.deepEqual(extractPalette(':root{--paper:#fff;--ink:#0f0f12;--c-pink:#ff307e;--primary:var(--c-pink);--c-yellow:#f5c518;}'),{paper:'#ffffff',ink:'#0f0f12',primary:'#ff307e',accent:'#f5c518',note:'Colours observed in public CSS; when semantic tokens are absent, the most frequent non-neutral colour is inferred. Not a formal brand guide.'});
 assert.equal(extractPalette(':root{--primary:var(--other);--other:var(--primary)}'),undefined);
 assert.equal(extractPalette(':root{--primary:url(https://bad.example)}'),undefined);
});

import {generateImage,imageRequest,imageEndpoint,imageInfo} from '../convex/seedreamClient';
import {readFileSync} from 'node:fs';
test('image briefs adapt to the actual offer and never request fake testimonials or written logos',()=>{
 const brand={...foundersBrand,audience:'parents shopping for children',offer:'durable outdoor play clothing'};
 const request=imageRequest(brand,foundersPosts,'scene');assert.equal(request.model,'seedream-4-5-251128');assert.equal(request.response_format,'b64_json');assert.equal(request.sequential_image_generation,'disabled');assert.equal('output_format' in request,false);
 assert.ok(request.prompt.includes(brand.offer));assert.match(request.prompt,/do not default to an office/);assert.match(request.prompt,/not a real customer or product photograph/);assert.match(request.prompt,/Never: logos/);
 assert.match(imageRequest(brand,foundersPosts,'presenter').prompt,/Head and face in the upper half/);
});
test('image client retains real PNG bytes, rejects empty output and keeps provider errors free of secrets',async()=>{
 const png=readFileSync('public/images/founders-editorial.png');
 const result=await generateImage('test-image-key',{},async(url,options)=>{
  assert.equal(url,imageEndpoint);assert.equal((options?.headers as Record<string,string>).Authorization,'Bearer test-image-key');
  return Response.json({data:[{b64_json:png.toString('base64')}]});
 });assert.deepEqual(Buffer.from(result),png);
 await assert.rejects(generateImage('private-image-key',{},async()=>new Response('private-image-key',{status:401})),e=>e instanceof Error&&!e.message.includes('private-image-key'));
 await assert.rejects(generateImage('test',{},async()=>Response.json({data:[]})),/no usable image/);
 await assert.rejects(generateImage('test',{},async()=>Response.json({data:[{b64_json:Buffer.from('not a png'.repeat(20)).toString('base64')}]})),/unsupported or incomplete/);
});

test('Seedream 4.5 JPEG output is accepted with its real dimensions and truncated files are rejected',async()=>{
 const jpeg=readFileSync('tests/fixtures/seedream-image.jpg');const info=imageInfo(jpeg);
 assert.equal(info.mime,'image/jpeg');assert.ok(info.width>=512&&info.height>=512);
 assert.deepEqual(Buffer.from(await generateImage('test',{},async()=>Response.json({data:[{b64_json:jpeg.toString('base64')}]}))),jpeg);
 assert.throws(()=>imageInfo(jpeg.subarray(0,100)),/unsupported or incomplete/);
});

import {typographyOnly} from '../convex/brandPresentation';
test('Founder’s Find uses a face-free brand profile; other websites keep their own media support',()=>{assert.equal(typographyOnly(foundersBrand),true);assert.equal(typographyOnly({sourceUrl:'https://basecamp.com/'}),false);assert.equal(typographyOnly({sourceUrl:'unfinished url'}),false);});
import {extractStyle} from '../convex/brandStyle';
test('new website packs require only carousel and static, never a reel',()=>{
 assert.equal(checkPosts(foundersPosts.filter(p=>p.format!=='reel'),foundersBrand.facts,2).length,2);
 assert.throws(()=>checkPosts(foundersPosts,foundersBrand.facts,2));assert.throws(()=>checkPosts(foundersPosts.filter(p=>p.format!=='static'),foundersBrand.facts,2));
});
test('brand extraction is semantic, not tied to a domain',()=>{
 assert.equal(extractStyle(':root{--heading:Georgia,serif} h1{font-family:var(--heading)}').headline,'serif');
 assert.equal(extractStyle('h1{font-family:Inter,sans-serif}').headline,'sans');assert.equal(extractStyle('').sourceFont,'Not found');
 assert.equal(extractPalette('.button{background:#ae302f}.link{color:#ae302f}')?.primary,'#ae302f');
});

test('modern CSS colour tokens and aliases are converted without a brand lookup',()=>{
 const p=extractPalette(':root{--l:0.535 0.1602 254.08;--color-link:oklch(var(--l));--color-canvas:oklch(1 0 0);--color-ink:rgb(10, 20, 30);}');
 assert.equal(p?.primary,'#146dc7');assert.equal(p?.paper,'#ffffff');assert.equal(p?.ink,'#0a141e');
});

test('default colour tokens are preserved over later optional theme declarations',()=>{assert.equal(extractPalette(':root{--primary:#ff307e;--paper:#fff}@media(prefers-color-scheme:dark){:root{--primary:#0000ff;--paper:#000}}')?.paper,'#ffffff');});

import {checkCreativePosts} from '../convex/studioTypes';
import {imageInfo as websiteImageInfo} from '../convex/websiteAssets';
import sharp from 'sharp';
test('four-platform creatives reject a sixth slide and images from another brand',()=>{
 const posts=['instagram','linkedin'].flatMap(platform=>foundersPosts.filter(p=>p.format!=='reel').map(p=>({...p,platform:platform as 'instagram'|'linkedin',destination:foundersBrand.sourceUrl,frames:p.frames.map((f,i)=>({...f,composition:(i===0?'editorial':i===2?'spotlight':i===4?'closing':'editorial') as 'editorial'|'spotlight'|'closing'}))})));
 assert.doesNotThrow(()=>checkCreativePosts(posts,foundersBrand.facts,['instagram','linkedin']));
 const tooMany=structuredClone(posts);tooMany[0].frames.push(tooMany[0].frames[0]);assert.throws(()=>checkCreativePosts(tooMany,foundersBrand.facts,['instagram','linkedin']),/number of frames/);
 const wrongBrand=structuredClone(posts);Object.assign(wrongBrand[1].frames[0],{composition:'image',assetKey:'other-brand'});assert.throws(()=>checkCreativePosts(wrongBrand,foundersBrand.facts,['instagram','linkedin']),/does not belong/);
});
test('brand typography skips reset inheritance and preserves the actual later body font',()=>{
 const s=extractStyle('body{font-family:Roboto,Arial}h1,h2{font-family:inherit}body{font-family:cr,sans-serif}h2{font-family:cm,sans-serif}h1{font-family:cb,sans-serif}');assert.equal(s.sourceFont,'cb,sans-serif');assert.equal(s.bodyFont,'cr,sans-serif');
 assert.equal(extractStyle('h1{font-family:Revans-Bold,DM Sans,sans-serif}').headline,'serif');
});
test('image dimensions match real PNG, JPEG, lossy and lossless WebP bytes',async()=>{
 const raw=sharp({create:{width:512,height:640,channels:3,background:'#e12827'}});
 for(const bytes of [await raw.clone().png().toBuffer(),await raw.clone().jpeg().toBuffer(),await raw.clone().webp().toBuffer(),await raw.clone().webp({lossless:true}).toBuffer()]){const info=websiteImageInfo(bytes);assert.equal(info?.width,512);assert.equal(info?.height,640);}
 assert.equal(websiteImageInfo(new Uint8Array([1,2,3])),undefined);
});
test('a complete sentence may end with a preposition',()=>{const posts=structuredClone(foundersPosts);posts[1].frames[0].body='Before accepting, check what the cheaper rate commits you to.';assert.doesNotThrow(()=>checkPosts(posts,foundersBrand.facts));});
import {load} from 'cheerio';
import {primaryLogo} from '../convex/websiteIdentity';
test('partner logos cannot become the business logo',()=>{assert.equal(primaryLogo(load('<header><a href="/">Our brand</a></header><main><img src="/logos/partner.svg" alt="Partner"/></main>'),'https://example.com'),undefined);assert.equal(primaryLogo(load('<nav><a href="/"><img src="/logo.png" alt="Our business"/></a></nav><img src="/logos/partner.svg"/>'),'https://example.com'),'https://example.com/logo.png');});

test('actual hero heading classes take priority over generic heading resets',()=>{assert.equal(extractStyle('h1{font-family:DM Sans,sans-serif}.banner__heading{font-family:Revans-Bold,DM Sans,sans-serif}',['banner__heading']).sourceFont,'Revans-Bold,DM Sans,sans-serif');});

test('creative freedom allows a coherent single-layout carousel and a headline-only poster',()=>{const posts=foundersPosts.filter(p=>p.format!=='reel').map(p=>({...structuredClone(p),platform:'instagram' as const,destination:foundersBrand.sourceUrl,frames:p.frames.map(f=>({...f,composition:'editorial' as const}))}));posts[1].frames[0].body='';assert.doesNotThrow(()=>checkCreativePosts(posts,foundersBrand.facts,['instagram']));});
