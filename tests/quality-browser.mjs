// Repeatable local renderer gate. No AI requests or private source content.
import {chromium} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.env.QUALITY_ORIGIN||'http://localhost:5173';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(origin);await page.waitForLoadState('networkidle');
 const result=await page.evaluate(async()=>{
  const {renderArtwork}=await import('/src/artwork.ts');
  const patterns=[['guide','Prepare your application','',['Photo identification.','Proof of occupancy.']],['explanation','Why this matters','One clear explanation preserves the important qualification.',[]],['comparison','Compare the options','',['First option: less setup.','Second option: more control.']],['argument','Make the reasoning clear','A conclusion needs supporting evidence, not a stronger invented claim.',[]],['experience','The turning point','We changed direction after noticing the same problem twice.',[]],['insights','','A useful observation can stand alone without a redundant heading.',[]]];
  const colours=['#ff307e','#0a192f','#007766','#ffdd00'];const reports=[];
  document.body.innerHTML='';document.body.style.cssText='background:#eee;display:flex;flex-wrap:wrap;gap:8px;padding:8px';
  for(const primary of colours)for(const [kind,heading,body,bullets]of patterns){
   const brand={name:'',audience:'',offer:'',voice:'',facts:[],sourceUrl:'https://example.com/private?token=secret',palette:{primary,accent:primary,paper:'#ffffff',ink:'#101010',observed:[primary],note:'Test fixture'}};
   const frame={heading,body,items:bullets.map(detail=>({label:'',detail})),design:{layout:'essay',surface:'paper',align:'left',imagePosition:'bottom',emphasis:body.includes('important qualification')?'important qualification':'',takeaway:''}};
   const post={format:'carousel',sourceKind:kind==='experience'?'call':'article',hook:heading,caption:'',altText:'',sourceFacts:[],pain:'',emotion:'',frames:[frame]};
   const texts=[],rects=[];const proto=CanvasRenderingContext2D.prototype,ft=proto.fillText,fr=proto.fillRect;
   proto.fillText=function(t,x,y,...args){texts.push({t,x,y,width:this.measureText(t).width});return ft.call(this,t,x,y,...args)};
   proto.fillRect=function(x,y,w,h){rects.push({x,y,w,h,colour:this.fillStyle});return fr.call(this,x,y,w,h)};
   let c;try{c=await renderArtwork(post,brand);}finally{proto.fillText=ft;proto.fillRect=fr;}
   if(!texts.some(x=>x.t==='example.com'))throw Error('Missing website footer');
   if(texts.some(x=>/from an article|secret|private\?/i.test(x.t)))throw Error('Source label or private URL leaked');
   if(texts.some(x=>x.x<80||x.x+x.width>1001||x.y<55||x.y>1295))throw Error('Text outside safe area');
   if(!rects.some(r=>r.colour===primary&&r.w>=140&&r.h>=10))throw Error('Brand colour absent');
   if(bullets.length&&!texts.some(x=>x.t==='•'))throw Error('Missing list markers');
   c.style.cssText='width:216px;height:270px';document.body.append(c);reports.push({kind,primary,width:c.width,height:c.height,passed:true});
  }return reports;
 });
 mkdirSync('verification',{recursive:true});await page.screenshot({path:'verification/quality-matrix.png',fullPage:true});
 const samples=JSON.parse(readFileSync('public/samples/index.json','utf8'));let images=0;
 for(const sample of samples)for(const path of [sample.static,...sample.slides]){
  const size=await page.evaluate(async url=>{const i=new Image();i.src=url;await i.decode();return [i.naturalWidth,i.naturalHeight]},path);
  assert.ok(size[0]>0&&size[1]>0,`Cannot decode ${path}`);images++;
 }
 const report={rendererCases:result.length,results:result,savedGalleries:samples.length,savedImagesDecoded:images,limitations:'Historical image samples checked for decoding only; no claim of source accuracy or new-pipeline provenance. Matrix uses synthetic fixtures, not new model generations.'};
 writeFileSync('verification/quality-gate.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
