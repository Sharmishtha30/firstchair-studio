import {zipSync,strToU8} from 'fflate';
import {PDFDocument} from 'pdf-lib';
import type {Brand,Post} from '../convex/studioTypes';
import {renderArtwork} from './artwork';
export async function drawFrame(post:Post,brand:Brand,index:number,_progress=0,_canvas?:HTMLCanvasElement){return renderArtwork(post,brand,index);}
export async function frameBlob(post:Post,brand:Brand,index:number){const c=await drawFrame(post,brand,index);return new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Artwork export failed.')),'image/png'));}
export function download(blob:Blob,name:string){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
export async function packFiles(posts:Post[],brand:Brand,onProgress:(s:string)=>void){
 const files:Record<string,Uint8Array>={},captions:string[]=[];
 for(const p of posts.filter(p=>p.format!=='reel')){
  const platform=p.platform??'instagram',folder=platform+'/'+p.format,pngs:Uint8Array[]=[];
  for(let i=0;i<p.frames.length;i++){onProgress(`Designing ${platform} ${p.format} ${i+1}/${p.frames.length}`);const bytes=new Uint8Array(await(await frameBlob(p,brand,i)).arrayBuffer());pngs.push(bytes);files[folder+'/'+String(i+1).padStart(2,'0')+'.png']=bytes;}
  const instruction=platform==='instagram'?`Upload the ordered PNGs${p.format==='carousel'?' together as one carousel':''}. Paste the caption. Set your profile link to ${p.destination??brand.sourceUrl} before using a link-in-bio CTA. Image text and drawn actions are not clickable.`:`${p.format==='carousel'?'Upload carousel.pdf as a document, using the document title below.':'Upload 01.png as an image.'} Paste the caption, including the destination link.`;
  files[folder+'/caption.txt']=strToU8(p.caption);files[folder+'/posting.txt']=strToU8(instruction+'\n\nDestination: '+(p.destination??brand.sourceUrl)+'\nDocument title: '+(p.documentTitle??p.hook));
  files[folder+'/alt-text.txt']=strToU8(p.frames.map((f,i)=>`${i+1}. ${brand.name}. ${f.heading}. ${f.body} ${(f.items??[]).map(item=>item.label+': '+item.detail).join('. ')}${f.assetKey?' Source website image: '+(brand.assets?.find(a=>a.key===f.assetKey)?.alt??''):''}`).join('\n\n'));
  if(platform==='linkedin'&&p.format==='carousel'){onProgress('Checking LinkedIn PDF');const pdf=await PDFDocument.create();pdf.setTitle(p.documentTitle??p.hook);pdf.setAuthor(brand.name);pdf.setSubject('Five-slide brand-specific carousel. Slides are embedded artwork; text is not selectable.');for(const png of pngs){const img=await pdf.embedPng(png),page=pdf.addPage([540,675]);page.drawImage(img,{x:0,y:0,width:540,height:675});}files[folder+'/carousel.pdf']=await pdf.save();}
  captions.push(`${platform.toUpperCase()} / ${p.format.toUpperCase()}\n\n${p.caption}\n\nDESTINATION\n${p.destination??brand.sourceUrl}`);
 }
 files['captions.txt']=strToU8(captions.join('\n\n----------\n\n'));
 files['sources.txt']=strToU8(`${brand.sourceUrl}\n\n${brand.facts.join('\n')}\n\n${brand.style?.note??'Bundled Inter font fallback.'}\nSource images:\n${(brand.assets??[]).filter(a=>posts.some(p=>p.frames.some(f=>f.assetKey===a.key))).map(a=>a.originalUrl+' — '+a.pageUrl).join('\n')}\n\nVoice and emotional hypotheses are inferred, not customer testimony. No generated photography or invented proof. Layout inspiration: supplied static-ad overview; small copy and ad performance unverified. PDF pages preserve artwork pixels; text is not selectable.`);
 return files;
}
export async function exportImages(posts:Post[],brand:Brand,onProgress:(s:string)=>void,_ads:unknown[]=[]){const files=await packFiles(posts,brand,onProgress);onProgress('Checking ZIP');download(new Blob([zipSync(files) as BlobPart],{type:'application/zip'}),`${brand.name.toLowerCase().replace(/\W+/g,'-')}-social-creatives.zip`);}
