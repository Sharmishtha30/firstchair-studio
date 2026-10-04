import { zipSync, strToU8 } from 'fflate';
import type { Brand, Post, Frame } from '../convex/studioTypes';
import {renderArtwork} from './artwork';
export async function drawFrame(post:Post,brand:Brand,index:number,_progress=0,_canvas?:HTMLCanvasElement){return renderArtwork(post,brand,index);}
export async function frameBlob(post:Post,brand:Brand,index:number){const c=await drawFrame(post,brand,index);return new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Artwork export failed.')),'image/png'));}
export function download(blob:Blob,name:string){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
export async function exportImages(posts:Post[],brand:Brand,onProgress:(s:string)=>void,ads:{pageName:string;snapshotUrl:string;body:string}[]=[]){
 const files:Record<string,Uint8Array>={};
 for(const p of posts.filter(p=>p.format!=='reel'))for(let i=0;i<p.frames.length;i++){
  onProgress(`Rendering ${p.format} ${i+1} of ${p.frames.length}`);
  files[`${p.format}/${String(i+1).padStart(2,'0')}.png`]=new Uint8Array(await (await frameBlob(p,brand,i)).arrayBuffer());
 }
 files['captions.txt']=strToU8(posts.map(p=>`${p.format.toUpperCase()}\n\n${p.caption}\n\nALT TEXT\n${brand.name+' typography-led '+p.format+'. '+p.frames.map(f=>f.heading).join(' / ')}`).join('\n\n----------\n\n'));
 files['sources.txt']=strToU8(`${brand.sourceUrl}\n\n${brand.facts.join('\n')}\n\nBrand voice and audience emotions are inferred. Typography-led layout using observed website colours and font-family matching. No AI photographs or faces. ${brand.style?.note??'Font information was unavailable; bundled Inter fallback.'} ${ads.length?'Imported ad sources (structural inspiration only, no performance claims):\n'+ads.map(a=>a.pageName+' — '+a.snapshotUrl).join('\n'):'No ad-library records were imported.'} Composition inspiration: founder-supplied static-ad overview board. Small individual copy and performance are not verified. No video is included.`);
 download(new Blob([zipSync(files) as BlobPart],{type:'application/zip'}),`${brand.name.toLowerCase().replace(/\W+/g,'-')}-instagram.zip`);
}
