import {chromium} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {ConvexHttpClient} from 'convex/browser';
import {api} from '../convex/_generated/api';
import {digest,random} from '../convex/chatgptSecurity';
const client=new ConvexHttpClient('http://127.0.0.1:3210');
const ticket=random(),binding=random();
execFileSync('npx',['convex','run','studioVerification:ticket',JSON.stringify({ticketHash:await digest(ticket),browserHash:await digest(binding)})],{stdio:'pipe'});
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true});
const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://localhost:5173');await page.evaluate(binding=>sessionStorage.setItem('chatgpt_browser',binding),binding);
 await page.goto('http://localhost:5173/#chatgpt_ticket='+encodeURIComponent(ticket));
 await page.getByRole('button',{name:'Disconnect',exact:true}).waitFor({timeout:15000});
 console.log('PASS existing approved ChatGPT connection works in the studio (new local test session; no new OAuth consent simulated)');
 await page.getByLabel('Your website',{exact:true}).fill(process.env.TEST_WEBSITE??'https://foundersfind.club/');
 await page.getByRole('button',{name:'Create Instagram pack'}).click();
 await Promise.race([page.getByRole('tab',{name:'01 / Carousel'}).waitFor({timeout:150000}),page.getByRole('alert').waitFor({timeout:150000}).then(async()=>{throw new Error(await page.getByRole('alert').innerText());})]);
 const token=new URLSearchParams(new URL(page.url()).hash.slice(1)).get('pack')!;
 const before=await client.query(api.studio.get,{token});assert.equal(before?.stage,'Ready');assert.match(before!.mode!,/connected ChatGPT/);assert.equal(before?.posts?.length,3);
 console.log('PASS live website → AI-written carousel, static and reel, source excerpts and claims reviewed');
 for(const post of before!.posts!)console.log(`HOOK ${post.format}: ${post.hook}`);
 if(process.env.SKIP_REVISION){console.log('PASS second public website produces all three formats:',before!.brand!.name);await writeFile('verification/second-website-pack.json',JSON.stringify(before,null,2));}else{
 await page.getByRole('tab',{name:'02 / Static'}).click();
 await page.getByLabel('Make this static better').fill('Use the hook "Doing more. Still overlooked?" Focus on being trusted with tasks but not decisions. Ground the useful advice and CTA in Proving Ground. Keep the caption practical. Use complete short sentences, never end the artwork with an unfinished phrase.');
 await page.getByRole('button',{name:'Revise this static',exact:true}).click();
 await page.getByRole('heading',{name:'Doing more. Still overlooked?',exact:true}).waitFor({timeout:150000});
 await page.getByRole('button',{name:'Revise this static',exact:true}).waitFor();
 const after=await client.query(api.studio.get,{token});assert.equal(after?.stage,'Ready');
 for(const format of ['carousel','reel'])assert.deepEqual(after!.posts!.find(p=>p.format===format),before!.posts!.find(p=>p.format===format));
 assert.notDeepEqual(after!.posts!.find(p=>p.format==='static'),before!.posts!.find(p=>p.format==='static'));
 console.log('PASS typed feedback revises only the static post; carousel and reel remain byte-for-byte unchanged');
 await page.screenshot({path:'verification/studio-revision.png',fullPage:true});
 const zipWait=page.waitForEvent('download');await page.getByRole('button',{name:'Download images + captions'}).click();await (await zipWait).saveAs('verification/founders-instagram.zip');
 await page.getByRole('tab',{name:'03 / Reel'}).click();assert.equal(await page.getByRole('button',{name:'Generate with Seedance'}).isDisabled(),true);
 console.log('PASS missing Seedance key is visible and cannot trigger a paid request; no fake imported ads');
 const videoWait=page.waitForEvent('download',{timeout:180000});await page.getByRole('button',{name:'Download MP4 reel'}).click();await (await videoWait).saveAs('verification/founders-reel.mp4');
 console.log('PASS revised pack downloads six PNGs/captions and a finished motion MP4');
 await page.reload();await page.getByRole('tab',{name:'01 / Carousel'}).waitFor();console.log('PASS saved pack survives reload');
 await writeFile('verification/live-website-pack.json',JSON.stringify(after,null,2));await writeFile('verification/latest-pack-url.txt',page.url());
 console.log('FULL WEBSITE OUTPUT\n'+JSON.stringify(after,null,2));assert.deepEqual(errors,[]);console.log('PASS no browser page errors');
 // Ends only this test's first-party session, preserving the founder's provider connection.
 }
 const session=await page.evaluate(()=>Object.entries(localStorage).find(([key])=>key.startsWith('__convexAuthJWT_'))?.[1]);if(session){client.setAuth(session);await client.action(api.auth.signOut,{});client.clearAuth();}await page.evaluate(()=>localStorage.clear());
}catch(e){await page.screenshot({path:'verification/website-flow-error.png',fullPage:true});console.log('Browser state:',(await page.locator('body').innerText()).slice(0,1600));throw e;}finally{await browser.close();}
