import {chromium} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {ConvexHttpClient} from 'convex/browser';
import {api} from '../convex/_generated/api';
import {digest,random} from '../convex/chatgptSecurity';
const website=process.env.TEST_WEBSITE??'https://foundersfind.club/',slug=new URL(website).hostname.replace(/[^a-z0-9]/g,'-');
const client=new ConvexHttpClient('http://127.0.0.1:3210'),ticket=random(),binding=random();
execFileSync('npx',['convex','run','studioVerification:ticket',JSON.stringify({ticketHash:await digest(ticket),browserHash:await digest(binding)})],{stdio:'pipe'});
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://localhost:5173',{waitUntil:'networkidle'});await page.evaluate(binding=>sessionStorage.setItem('chatgpt_browser',binding),binding);
 await page.goto('http://localhost:5173/#chatgpt_ticket='+encodeURIComponent(ticket));await page.getByRole('button',{name:'Disconnect',exact:true}).waitFor({timeout:20000});
 await page.getByLabel('Your website',{exact:true}).fill(website);await page.getByRole('button',{name:'Create Instagram pack'}).click();
 await Promise.race([page.getByRole('tab',{name:'01 / Carousel'}).waitFor({timeout:240000}),page.getByRole('alert').waitFor({timeout:240000}).then(async()=>{throw Error(await page.getByRole('alert').innerText());})]);
 const token=new URLSearchParams(new URL(page.url()).hash.slice(1)).get('pack')!,before=await client.query(api.studio.get,{token});assert.equal(before?.stage,'Ready');assert.equal(before!.posts!.length,2);assert.deepEqual(before!.posts!.map(p=>p.format).sort(),['carousel','static']);assert.match(before!.mode!,/connected ChatGPT/);
 assert.equal(await page.getByRole('tab',{name:/Reel/}).count(),0);assert.equal(await page.getByRole('button',{name:/Seedance|Generate original images/}).count(),0);
 console.log('PASS',website,'→ live carousel and static only; no paid image/video controls');
 for(const p of before!.posts!)console.log('HOOK',p.format,p.hook,'LAYOUT',p.layout);console.log('BRAND',JSON.stringify({name:before!.brand!.name,palette:before!.brand!.palette,style:before!.brand!.style}));
 await page.getByRole('tab',{name:'02 / Static'}).click();await page.locator('.artwork').waitFor();
 if(!process.env.SKIP_REVISION){await page.getByLabel('Make this static better').fill('Make the hook sharper and more emotionally specific. Keep the offer and CTA supported by the website. Use the note layout with complete, short, practical copy.');await page.getByRole('button',{name:'Revise this static',exact:true}).click();await page.getByRole('button',{name:'Revising…',exact:true}).waitFor({state:'hidden',timeout:150000});const after=await client.query(api.studio.get,{token});assert.equal(after?.stage,'Ready');assert.deepEqual(after!.posts!.find(p=>p.format==='carousel'),before!.posts!.find(p=>p.format==='carousel'));assert.notDeepEqual(after!.posts!.find(p=>p.format==='static'),before!.posts!.find(p=>p.format==='static'));console.log('PASS feedback revises only static; carousel unchanged');}
 await page.locator('.artwork').waitFor();await page.getByRole('alert').waitFor({state:'hidden'});
 const wait=page.waitForEvent('download');await page.getByRole('button',{name:'Download images + captions'}).click();const download=await wait;const target='verification/'+slug+'-instagram.zip';await download.saveAs(target);
 const fs=await import('node:fs/promises'),files=unzipSync(await fs.readFile(target)),pngs=Object.keys(files).filter(x=>x.endsWith('.png'));assert.equal(pngs.length,6);assert.ok(!strFromU8(files['captions.txt']).includes('REEL'));assert.ok(pngs.every(n=>files[n].length>5000));console.log('PASS ZIP contains six rendered PNGs and carousel/static captions only');
 await page.reload();await page.getByRole('tab',{name:'01 / Carousel'}).waitFor();const saved=await client.query(api.studio.get,{token});assert.equal(saved!.posts!.length,2);
 await page.getByRole('tab',{name:'02 / Static'}).click();await page.locator('.artwork').waitFor();const desktop=await page.screenshot({fullPage:true});await page.setViewportSize({width:390,height:844});const mobile=await page.screenshot({fullPage:true});assert.deepEqual(errors,[]);console.log('PASS reload, desktop/mobile and no browser errors');
 const session=await page.evaluate(()=>Object.entries(localStorage).find(([key])=>key.startsWith('__convexAuthJWT_'))?.[1]);if(session){client.setAuth(session);await client.action(api.auth.signOut,{});client.clearAuth();}
 await browser.close();await mkdir('verification/'+slug+'-assets',{recursive:true});for(const name of pngs)await writeFile('verification/'+slug+'-assets/'+name.replace('/','-'),files[name]);await writeFile('verification/'+slug+'-desktop.png',desktop);await writeFile('verification/'+slug+'-mobile.png',mobile);await writeFile('verification/'+slug+'-pack.json',JSON.stringify(saved,null,2));console.log('PACK LINK http://localhost:5173/#pack='+token);console.log('FULL OUTPUT\n'+JSON.stringify(saved,null,2));
}catch(e){console.log('Browser state:',(await page.locator('body').innerText()).slice(0,1800));await browser.close();throw e;}
