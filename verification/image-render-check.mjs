import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const admin=(name,args)=>JSON.parse(execFileSync('npx',['convex','run',name,JSON.stringify(args)],{encoding:'utf8'})||'null');
const pack=JSON.parse(await fs.readFile('verification/live-website-pack.json','utf8'));
const browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.goto('http://localhost:5173/#pack='+new URL((await fs.readFile('verification/latest-pack-url.txt','utf8')).trim()).hash.split('pack=')[1]);
await page.getByRole('tab',{name:'01 / Carousel'}).waitFor();
await page.getByRole('button',{name:'Generate original images',exact:true}).waitFor();
if(!await page.getByRole('button',{name:'Generate original images',exact:true}).isDisabled())throw Error('Missing image access should disable generation');
await page.getByText('Sample artwork',{exact:true}).waitFor();console.log('PASS missing image access is labelled and cannot start a paid request');
const uploadUrl=admin('studioVerification:imageUploadFixture',{});
const stored=await page.evaluate(async uploadUrl=>{const blob=await(await fetch('/tests/fixtures/seedream-image.jpg')).blob();const response=await fetch(uploadUrl,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});if(!response.ok)throw Error('Convex fixture upload failed');return response.json();},uploadUrl);
const sceneUrl=admin('studioVerification:imageUrlFixture',{file:stored.storageId});
try{
const result=await page.evaluate(async ({pack,sceneUrl})=>{
 const {drawFrame,frameBlob}=await import('/src/render.ts');const post=pack.posts.find(p=>p.format==='static');
 const before=(await drawFrame(post,pack.brand,0)).toDataURL();
 const brand={...pack.brand,artwork:{sceneUrl,presenterUrl:'/images/career-decision.webp',note:'Explicit renderer test fixture; not live generated imagery.'}};
 const after=await drawFrame(post,brand,0);if(before===after.toDataURL())throw Error('Renderer ignored pack-specific image URL');
 const blob=await frameBlob(post,brand,0);if(blob.size<10000)throw Error('Image export is empty');
 let rejected=false;try{await drawFrame(post,{...brand,artwork:{sceneUrl:'/missing-fixture.png',note:'Bad URL test'}},0);}catch{rejected=true;}if(!rejected)throw Error('Unreadable imagery was silently accepted');
 return {width:after.width,height:after.height,bytes:blob.size};
},{pack,sceneUrl});
console.log('PASS real Convex storage image URLs change the real exported PNG',JSON.stringify(result));console.log('PASS unreadable image URLs fail explicitly');await page.screenshot({path:'verification/image-status-desktop.png',fullPage:true});}finally{admin('studioVerification:removeImageFixture',{file:stored.storageId});await browser.close();}
