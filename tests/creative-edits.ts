import {chromium} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {PDFDocument} from 'pdf-lib';
import sharp from 'sharp';
import {ConvexHttpClient} from 'convex/browser';
import {api} from '../convex/_generated/api';
import {digest,random} from '../convex/chatgptSecurity';
const website=process.env.TEST_WEBSITE??'https://foundersfind.club/',slug=new URL(website).hostname.replace(/[^a-z0-9]/g,'-'),prefix='verification/creative-'+slug;
const client=new ConvexHttpClient('http://127.0.0.1:3210'),ticket=random(),binding=random();
execFileSync('npx',['convex','run','studioVerification:ticket',JSON.stringify({ticketHash:await digest(ticket),browserHash:await digest(binding)})],{stdio:'pipe'});
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://localhost:5173',{waitUntil:'networkidle'});await page.evaluate(binding=>sessionStorage.setItem('chatgpt_browser',binding),binding);await page.goto('http://localhost:5173/#chatgpt_ticket='+encodeURIComponent(ticket));await page.getByRole('button',{name:'Disconnect',exact:true}).waitFor({timeout:20000});
 const session=await page.evaluate(()=>Object.entries(localStorage).find(([key])=>key.startsWith('__convexAuthJWT_'))?.[1]);assert.ok(session);client.setAuth(session);

 const token='11e9fbde4dd5163a1c8ff3fd1fd200ad765c2530e97190f56a99e3cf0d0574af';
 await page.goto('http://localhost:5173/#pack='+token);await page.getByText(/Files checked/).waitFor({timeout:30000});
 const original=await client.query(api.studio.get,{token});
 await page.getByRole('tab',{name:'02 / Static'}).click();await page.locator('details.edit-panel').evaluate((el:HTMLDetailsElement)=>{el.open=true;});
 await page.getByLabel('Slide heading',{exact:true}).fill('A cheaper clean can carry a catch');await page.getByRole('button',{name:'Save this post',exact:true}).click();
 await page.waitForTimeout(1000);const edited=await client.query(api.studio.get,{token});assert.equal(edited!.posts!.find(p=>p.platform==='instagram'&&p.format==='static')!.hook,'A cheaper clean can carry a catch');
 for(const p of original!.posts!.filter(p=>!(p.platform==='instagram'&&p.format==='static')))assert.deepEqual(edited!.posts!.find(x=>x.platform===p.platform&&x.format===p.format),p);
 console.log('PASS browser text edit changes only selected static');
 await page.getByRole('button',{name:'Restore previous version',exact:true}).click();await page.waitForTimeout(1000);assert.deepEqual((await client.query(api.studio.get,{token}))!.posts,original!.posts);console.log('PASS browser restore returns all original posts');
 await page.getByText('Adjust brand details — applies to all posts',{exact:true}).click();await page.getByLabel('Accent',{exact:true}).fill('#197359');await page.getByRole('button',{name:'Apply brand correction',exact:true}).click();await page.waitForTimeout(1000);
 const corrected=await client.query(api.studio.get,{token});assert.equal(corrected!.brand!.palette.primary,'#197359');assert.deepEqual(corrected!.posts,original!.posts);
 await page.getByRole('button',{name:'Restore previous version',exact:true}).click();await page.waitForTimeout(1000);assert.deepEqual((await client.query(api.studio.get,{token}))!.brand,original!.brand);console.log('PASS brand correction updates shared design and restore preserves fonts and logo');
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download this post',exact:true}).click();const d=await downloaded;await d.saveAs('verification/creative-single.zip');const files=unzipSync(await readFile('verification/creative-single.zip'));assert.equal(Object.keys(files).filter(n=>n.endsWith('.png')).length,1);console.log('PASS single static download contains one PNG');
 await page.getByRole('tab',{name:'01 / Carousel'}).click();await page.locator('details.edit-panel').evaluate((el:HTMLDetailsElement)=>{el.open=true;});await page.locator('.edit-panel select').selectOption(original!.brand!.assets![0].key);await page.getByRole('button',{name:'Save this post',exact:true}).click();await page.waitForTimeout(1000);await page.getByText(/Files checked/).waitFor();const withPhoto=await client.query(api.studio.get,{token});assert.equal(withPhoto!.posts!.find(p=>p.platform==='instagram'&&p.format==='carousel')!.frames[0].composition,'image');console.log('PASS original website photograph appears on the selected cover');
 console.log('The Maid2Clean sample intentionally retains this source-photo edit. Other posts are unchanged.');
 assert.deepEqual(errors,[]);
}catch(e){console.log(await page.locator('body').innerText());throw e;}finally{await browser.close();}
