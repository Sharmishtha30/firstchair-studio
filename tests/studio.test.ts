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
 const bad=structuredClone(foundersPosts);bad[0].hook='This hook has far too many words to fit into a catchy opening';assert.throws(()=>checkPosts(bad,foundersBrand.facts),/too long/);
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
 assert.deepEqual(extractPalette(':root{--paper:#fff;--ink:#0f0f12;--c-pink:#ff307e;--primary:var(--c-pink);--c-yellow:#f5c518;}'),{paper:'#ffffff',ink:'#0f0f12',primary:'#ff307e',accent:'#f5c518',note:'Default colors read from the public website CSS; tone and styling are inferred, not formal brand guidelines.'});
 assert.equal(extractPalette(':root{--primary:var(--other);--other:var(--primary)}'),undefined);
 assert.equal(extractPalette(':root{--primary:url(https://bad.example)}'),undefined);
});

import {generateImage,imageRequest,imageEndpoint} from '../convex/seedreamClient';
import {readFileSync} from 'node:fs';
test('image briefs adapt to the actual offer and never request fake testimonials or written logos',()=>{
 const brand={...foundersBrand,audience:'parents shopping for children',offer:'durable outdoor play clothing'};
 const request=imageRequest(brand,foundersPosts,'scene');assert.equal(request.model,'seedream-4-5-251128');assert.equal(request.response_format,'b64_json');assert.equal(request.sequential_image_generation,'disabled');
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
 await assert.rejects(generateImage('test',{},async()=>Response.json({data:[{b64_json:Buffer.from('not a png'.repeat(20)).toString('base64')}]})),/requested PNG/);
});
