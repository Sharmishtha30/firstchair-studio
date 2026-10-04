import {chromium} from '@playwright/test';import {readFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const pack=JSON.parse(await readFile('verification/creative-www-maid2clean-co-uk-pack.json','utf8'));
const browser=await chromium.launch();const page=await browser.newPage();try{await page.goto('http://localhost:5173',{waitUntil:'networkidle'});const report=await page.evaluate(async pack=>{
 const {renderArtwork,bounds}=await import('/src/artwork.ts' as string),post=pack.posts[0],frames=[];
 for(const layout of ['essay','poster','split','photo','list']){
  const f={heading:'A room count is not a cleaning plan',body:'Kitchen first, then the hallway floor. Name the actual tasks before deciding which jobs matter most.',eyebrow:'Plan your clean',composition:layout==='list'?'process':'editorial',assetKey:layout==='photo'?pack.brand.assets[0].key:'',items:layout==='list'||layout==='split'?[{label:'Scope',detail:'Kitchen, bathroom and hallway.'},{label:'Priority',detail:'Bathroom first, kitchen surfaces, then the hallway floor.'}]:[],design:{layout,surface:layout==='poster'?'primary':'paper',align:layout==='poster'?'center':'left',imagePosition:'bottom',emphasis:'cleaning plan',takeaway:'Start with tasks, then choose your hours.'}};
  const c=await renderArtwork({...post,frames:[f]},pack.brand,0);frames.push({layout,width:c.width,height:c.height,text:bounds.get(c)});
 }
 let overflow=false;try{await renderArtwork({...post,frames:[{heading:'A useful opening',body:'Too much text '.repeat(200),composition:'editorial',design:{layout:'essay',surface:'paper',align:'left',imagePosition:'bottom',emphasis:'',takeaway:''}}]},pack.brand);}catch{overflow=true;}
 return {frames,overflow};
},pack);assert.equal(report.frames.length,5);assert.ok(report.overflow);for(const frame of report.frames){assert.equal(frame.width,1080);assert.equal(frame.height,1350);assert.ok(frame.text.every((t:any)=>t.x>=80&&t.x+t.width<=1000&&t.y+t.height<=1295));console.log('PASS safe readable browser render:',frame.layout);}console.log('PASS excessive text fails explicitly rather than clipping');}finally{await browser.close();}
