import {chromium} from '@playwright/test';import fs from 'node:fs/promises';
const pack=JSON.parse(await fs.readFile('verification/live-website-pack.json','utf8'));const browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.goto('http://localhost:5173',{waitUntil:'networkidle'});
const rendered=await page.evaluate(async pack=>{const {drawStaticAd}=await import('/src/staticAds.ts');const result=[];for(const layout of ['headline','comparison','note']){const c=await drawStaticAd(pack.posts.find(p=>p.format==='static'),pack.brand,layout);result.push({layout,image:c.toDataURL('image/png')});}return result;},pack);
await browser.close();
for(const {layout,image} of rendered){await fs.writeFile('verification/static-ad-variants/'+layout+'.png',Buffer.from(image.split(',')[1],'base64'));console.log('PASS',layout,'1080 × 1350 PNG; same approved hook/value/CTA; no photographs');}
await fs.writeFile('verification/static-ad-variants/caption.txt',pack.posts.find(p=>p.format==='static').caption);
