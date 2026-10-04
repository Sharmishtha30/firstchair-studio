import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
// Run the saved-pack browser export first to produce founders-reel.mp4.
execFileSync('ffmpeg',['-y','-loop','1','-i','public/images/fictional-presenter.webp','-i','verification/founders-reel.mp4','-map','0:v','-map','1:a','-vf','scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920','-t','5','-c:v','libx264','-pix_fmt','yuv420p','-c:a','copy','verification/avatar-source-fixture.mp4','-loglevel','error']);
const pack=JSON.parse(await fs.readFile('verification/live-website-pack.json','utf8'));
const browser=await chromium.launch({headless:true});const page=await browser.newPage({acceptDownloads:true});await page.goto('http://localhost:5173');
const download=page.waitForEvent('download',{timeout:180000});
await page.evaluate(async pack=>{const {exportAvatar}=await import('/src/render.ts');await exportAvatar(pack.posts.find(p=>p.format==='reel'),pack.brand,'http://localhost:5173/verification/avatar-source-fixture.mp4',()=>{});},pack);
await(await download).saveAs('verification/avatar-composite-fixture.mp4');
console.log('PASS actual browser decodes footage, overlays approved copy, retains source audio and exports MP4');
console.log('Fixture uses a still fictional portrait and original music, NOT a live Seedance avatar.');await browser.close();
