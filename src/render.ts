import { zipSync, strToU8 } from 'fflate';
import type { Brand, Post, Frame } from '../convex/studioTypes';
const ink='#192820',paper='#F5F1E8',green='#254B36',gold='#D8B45A';
let portraits:Promise<HTMLImageElement[]>|undefined;
function images(){return portraits??=Promise.all(['career-decision','fictional-presenter'].map(name=>new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=`/images/${name}.webp`;})));}
function wrapped(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number,size:number,line:number,weight=600,color=ink){
 ctx.font=`${weight} ${size}px Arial, sans-serif`;ctx.fillStyle=color;ctx.textBaseline='top';
 for(const paragraph of text.split('\n')){
  let row='';for(const word of paragraph.split(/\s+/)){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){ctx.fillText(row,x,y);y+=line;row=word;}else row=next;}ctx.fillText(row,x,y);y+=line;
 }
 return y;
}
function cover(ctx:CanvasRenderingContext2D,image:HTMLImageElement,x:number,y:number,w:number,h:number,zoom=1){const scale=Math.max(w/image.width,h/image.height)*zoom;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(image,x+(w-image.width*scale)/2,y+(h-image.height*scale)/2,image.width*scale,image.height*scale);ctx.restore();}
export async function drawFrame(post:Post,brand:Brand,index:number,progress=0,canvas?:HTMLCanvasElement){
 const pics=await images();const c=canvas??document.createElement('canvas');c.width=1080;c.height=post.format==='reel'?1920:1350;const ctx=c.getContext('2d')!;const h=c.height;const frame=post.frames[index];
 ctx.fillStyle=paper;ctx.fillRect(0,0,1080,h);
 ctx.fillStyle=green;ctx.fillRect(64,60,34,8);
 wrapped(ctx,brand.name.toUpperCase(),116,48,750,25,32,700);
 wrapped(ctx,post.format==='carousel'?`${String(index+1).padStart(2,'0')} / ${post.frames.length}`:'',870,48,150,25,32);
 const isHero=index===0 || post.format==='static';
 if(post.format==='reel'){
  const photo=brand.sourceUrl.includes('foundersfind.club')?pics[1]:pics[0];
  cover(ctx,photo,0,770,1080,920,1+progress*.04);
  const g=ctx.createLinearGradient(0,760,0,1000);g.addColorStop(0,paper);g.addColorStop(1,'rgba(245,241,232,0)');ctx.fillStyle=g;ctx.fillRect(0,760,1080,260);
  let y=wrapped(ctx,frame.heading,76,185,930,80,89,700);
  wrapped(ctx,frame.body,80,y+48,890,43,57,400);
  ctx.fillStyle=green;ctx.fillRect(0,1710,1080,210);
  wrapped(ctx,brand.name+'  ·  '+new URL(brand.sourceUrl).hostname,80,1740,920,28,38,600,paper);
  ctx.fillStyle=gold;ctx.fillRect(80,1810,920*((index+progress)/post.frames.length),5);
 }else if(isHero){
  const y=wrapped(ctx,frame.heading,76,165,930,85,96,700);
  if(post.format==='static'){
   cover(ctx,pics[0],560,650,520,570);
   wrapped(ctx,frame.body,78,y+55,460,40,54,400);
  }else{
   const bottom=wrapped(ctx,frame.body,80,y+46,880,38,52,400);
   const photoTop=Math.max(690,bottom+50);
   cover(ctx,pics[0],0,photoTop,1080,1250-photoTop);
  }
 }else{
  wrapped(ctx,['THE SHIFT','YOUR PRACTICE ROUND','MAKE IT VISIBLE','YOUR NEXT MOVE'][Math.min(index-1,3)],80,170,900,25,34,700,green);
  const y=wrapped(ctx,frame.heading,76,270,900,80,92,700);
  wrapped(ctx,frame.body,80,y+65,890,48,65,400);
  ctx.fillStyle=gold;ctx.beginPath();ctx.arc(930,1110,45,0,Math.PI*2);ctx.fill();
  wrapped(ctx,'→',901,1076,100,60,70,400);
 }
 ctx.fillStyle=green;ctx.fillRect(0,h-100,1080,100);
 wrapped(ctx,new URL(brand.sourceUrl).hostname,80,h-65,830,26,35,600,paper);
 if(post.format==='carousel'&&index<post.frames.length-1)wrapped(ctx,'SWIPE →',840,h-65,180,24,35,600,paper);
 return c;
}
export async function frameBlob(post:Post,brand:Brand,index:number){const c=await drawFrame(post,brand,index);return new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Artwork export failed.')),'image/png'));}
export function download(blob:Blob,name:string){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
export async function exportImages(posts:Post[],brand:Brand,onProgress:(s:string)=>void){
 const files:Record<string,Uint8Array>={};
 for(const p of posts.filter(p=>p.format!=='reel'))for(let i=0;i<p.frames.length;i++){
  onProgress(`Rendering ${p.format} ${i+1} of ${p.frames.length}`);
  files[`${p.format}/${String(i+1).padStart(2,'0')}.png`]=new Uint8Array(await (await frameBlob(p,brand,i)).arrayBuffer());
 }
 files['captions.txt']=strToU8(posts.map(p=>`${p.format.toUpperCase()}\n\n${p.caption}\n\nALT TEXT\n${p.altText}`).join('\n\n----------\n\n'));
 files['sources.txt']=strToU8(`${brand.sourceUrl}\n\n${brand.facts.join('\n')}\n\nBrand voice and audience emotions are inferred. Imagery depicts fictional AI-created people. No ad-library records were imported. Reel video is downloaded separately.`);
 download(new Blob([zipSync(files) as BlobPart],{type:'application/zip'}),`${brand.name.toLowerCase().replace(/\W+/g,'-')}-instagram.zip`);
}
export async function exportReel(post:Post,brand:Brand,onProgress:(s:string)=>void){
 const {Output,Mp4OutputFormat,BufferTarget,CanvasSource,AudioBufferSource,QUALITY_HIGH}=await import('mediabunny');
 const c=await drawFrame(post,brand,0);const output=new Output({format:new Mp4OutputFormat(),target:new BufferTarget()});
 const video=new CanvasSource(c,{codec:'avc',bitrate:QUALITY_HIGH});output.addVideoTrack(video,{frameRate:24});
 const audio=new AudioBufferSource({codec:'aac',bitrate:128000});output.addAudioTrack(audio);
 const duration=25;const buffer=new AudioBuffer({numberOfChannels:2,length:48000*duration,sampleRate:48000});
 // Original quiet instrumental bed, rendered into the downloadable MP4.
 for(let ch=0;ch<2;ch++){const d=buffer.getChannelData(ch);for(let i=0;i<d.length;i++){const t=i/48000;const section=Math.floor(t/5)%4;const notes=[146.83,174.61,130.81,164.81];const fade=Math.min(1,t, duration-t);d[i]=fade*.035*(Math.sin(2*Math.PI*notes[section]*t)+.35*Math.sin(2*Math.PI*notes[section]*1.5*t))*(.65+.35*Math.cos(t*Math.PI));}}
 await output.start();await audio.add(buffer);audio.close();
 for(let n=0;n<duration*24;n++){const t=n/24;const scene=Math.min(4,Math.floor(t/5));if(n%24===0)onProgress(`Making reel · ${Math.round(t/duration*100)}%`);await drawFrame(post,brand,scene,(t%5)/5,c);await video.add(t,1/24);}
 video.close();await output.finalize();
 if(!output.target.buffer)throw new Error('Video export returned no file.');
 download(new Blob([output.target.buffer],{type:'video/mp4'}),`${brand.name.toLowerCase().replace(/\W+/g,'-')}-reel.mp4`);
}
