import {drawStaticAd} from './staticAds';
import { zipSync, strToU8 } from 'fflate';
import {typographyOnly} from '../convex/brandPresentation';
import {foundersPalette} from '../convex/brandPalette';
import type { Brand, Post, Frame } from '../convex/studioTypes';
const ink='#192820',paper='#F5F1E8',green='#254B36',gold='#D8B45A';
function contrast(a:string,b:string){const lum=(hex:string)=>{const rgb=hex.replace('#','').match(/../g)!.slice(0,3).map(s=>parseInt(s,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function paletteFor(brand:Brand){return brand.palette??(new URL(brand.sourceUrl).hostname.replace(/^www\./,'')==='foundersfind.club'?foundersPalette:{paper:'#ffffff',ink:'#101010',primary:'#192820',accent:'#d8b45a',note:'Neutral editorial template; site colours were not readable.'});}
const portraitCache=new Map<string,Promise<HTMLImageElement[]>>();
function images(brand:Brand){
 const urls=[brand.artwork?.sceneUrl??'/images/career-decision.webp',brand.artwork?.presenterUrl??'/images/fictional-presenter.webp'];
 const key=urls.join('|');let pending=portraitCache.get(key);
 if(!pending){pending=Promise.all(urls.map(src=>new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Artwork could not be loaded. Reload the pack and try again.'));i.src=src;})));portraitCache.set(key,pending);pending.catch(()=>portraitCache.delete(key));}
 return pending;
}
function wrapped(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number,size:number,line:number,weight=600,color=(ctx.canvas as HTMLCanvasElement).dataset.ink??ink,style=''){
 ctx.font=`${style} ${weight} ${size}px ${(ctx.canvas as HTMLCanvasElement).dataset.font??'Arial'}, sans-serif`;ctx.fillStyle=color;ctx.textBaseline='top';
 for(const paragraph of text.split('\n')){
  let row='';for(const word of paragraph.split(/\s+/)){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){ctx.fillText(row,x,y);y+=line;row=word;}else row=next;}ctx.fillText(row,x,y);y+=line;
 }
 return y;
}
function cover(ctx:CanvasRenderingContext2D,image:HTMLImageElement,x:number,y:number,w:number,h:number,zoom=1){const scale=Math.max(w/image.width,h/image.height)*zoom;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(image,x+(w-image.width*scale)/2,y+(h-image.height*scale)/2,image.width*scale,image.height*scale);ctx.restore();}
export async function drawFrame(post:Post,brand:Brand,index:number,progress=0,canvas?:HTMLCanvasElement){
 const isFounders=new URL(brand.sourceUrl).hostname.replace(/^www\./,'')==='foundersfind.club';
 const palette=paletteFor(brand);
 const {ink,paper,primary:green,accent:gold}=palette;
 const onPrimary=contrast(paper,green)>=4.5?paper:ink;
 if(isFounders)await Promise.all([400,600,700].map(w=>document.fonts.load(`${w} 40px "Brand Inter"`)));
 if(typographyOnly(brand))return post.format==='static'?drawStaticAd(post,brand):drawFounders(post,brand,index,progress,canvas);
 const pics=await images(brand);const c=canvas??document.createElement('canvas');c.width=1080;c.height=post.format==='reel'?1920:1350;c.dataset.ink=ink;c.dataset.font=isFounders?'"Brand Inter"':'Arial';const ctx=c.getContext('2d')!;const h=c.height;const frame=post.frames[index];
 ctx.fillStyle=paper;ctx.fillRect(0,0,1080,h);
 ctx.fillStyle=green;ctx.fillRect(64,60,34,8);
 wrapped(ctx,brand.name.toUpperCase(),116,48,750,25,32,700);
 wrapped(ctx,post.format==='carousel'?`${String(index+1).padStart(2,'0')} / ${post.frames.length}`:'',870,48,150,25,32);
 const isHero=index===0 || post.format==='static';
 if(post.format==='reel'){
  const photo=brand.artwork?.presenterUrl||brand.sourceUrl.includes('foundersfind.club')?pics[1]:pics[0];
  cover(ctx,photo,0,770,1080,920,1+progress*.04);
  const g=ctx.createLinearGradient(0,760,0,1000);g.addColorStop(0,paper);g.addColorStop(1,'rgba(245,241,232,0)');ctx.fillStyle=g;ctx.fillRect(0,760,1080,260);
  let y=wrapped(ctx,frame.heading,76,185,930,80,89,700);
  wrapped(ctx,frame.body,80,y+48,890,43,57,400);
  ctx.fillStyle=green;ctx.fillRect(0,1710,1080,210);
  wrapped(ctx,brand.name+'  ·  '+new URL(brand.sourceUrl).hostname,80,1740,920,28,38,600,onPrimary);
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
  const y=wrapped(ctx,frame.heading,76,270,900,80,92,700);
  wrapped(ctx,frame.body,80,y+65,890,48,65,400);
  ctx.fillStyle=gold;ctx.beginPath();ctx.arc(930,1110,45,0,Math.PI*2);ctx.fill();
  wrapped(ctx,'→',901,1076,100,60,70,400);
 }
 ctx.fillStyle=green;ctx.fillRect(0,h-100,1080,100);
 wrapped(ctx,new URL(brand.sourceUrl).hostname,80,h-65,830,26,35,600,onPrimary);
 if(post.format==='carousel'&&index<post.frames.length-1)wrapped(ctx,'SWIPE →',840,h-65,180,24,35,600,onPrimary);
 return c;
}

function drawFounders(post:Post,brand:Brand,index:number,progress:number,canvas?:HTMLCanvasElement){
 const c=canvas??document.createElement('canvas');c.width=1080;c.height=post.format==='reel'?1920:1350;
 c.dataset.font='"Brand Inter"';c.dataset.ink='#0f0f12';const ctx=c.getContext('2d')!,h=c.height;
 const pink='#ff307e',ink='#0f0f12';ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,h);
 ctx.textBaseline='top';ctx.font='400 38px Georgia';ctx.fillStyle=ink;ctx.fillText("Founder's",76,62);ctx.font='italic 38px Georgia';ctx.fillStyle=pink;ctx.fillText('Find',ctx.measureText("Founder's").width+88,62);
 ctx.strokeStyle='#e5e5e8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(76,136);ctx.lineTo(1004,136);ctx.stroke();
 wrapped(ctx,post.format==='carousel'?`${String(index+1).padStart(2,'0')} / ${post.frames.length}`:'',76,175,900,22,30,400,'#686873');
 const frame=post.frames[index];c.dataset.font='Georgia';
 const words=frame.heading.split(/\s+/),accent=words.length>=4?words.splice(-2).join(' '):'',size=post.format==='static'?110:100,line=post.format==='static'?122:113;
 let headingEnd=wrapped(ctx,accent?words.join(' '):frame.heading,76,post.format==='reel'?310:250,928,size,line,400,ink);
 if(accent)headingEnd=wrapped(ctx,accent,76,headingEnd,928,size,line,400,pink,'italic');
 c.dataset.font='"Brand Inter"';const bodyEnd=wrapped(ctx,frame.body,80,headingEnd+52,890,post.format==='reel'?43:37,post.format==='reel'?59:52,400,'#45454f');
 // Geometric career-path tiles follow the website's thin-line isometric language.
 const centreY=Math.max(bodyEnd+110,post.format==='reel'?1220:945);
 if(centreY+160<h-140){
  const labels=['Proof','Capability','Opportunity'];
  const tile=(x:number,y:number,active:boolean,label:string)=>{
   ctx.fillStyle=active?pink:'#fff';ctx.strokeStyle=active?pink:ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-40);ctx.lineTo(x+75,y);ctx.lineTo(x,y+40);ctx.lineTo(x-75,y);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(x-75,y);ctx.lineTo(x-75,y+16);ctx.lineTo(x,y+56);ctx.lineTo(x+75,y+16);ctx.lineTo(x+75,y);ctx.moveTo(x,y+40);ctx.lineTo(x,y+56);ctx.stroke();
   wrapped(ctx,label.toUpperCase(),x-105,y+88,230,21,29,400,active?pink:'#686873');
  };
  ctx.strokeStyle='#e5e5e8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(250,centreY+30);ctx.lineTo(810,centreY-65);ctx.stroke();
  labels.forEach((label,n)=>tile(250+n*280,centreY+(n===1?-72:0),n===(post.format==='reel'?Math.floor(progress*3)%3:index%3),label));
 }
 ctx.strokeStyle='#e5e5e8';ctx.beginPath();ctx.moveTo(76,h-136);ctx.lineTo(1004,h-136);ctx.stroke();
 wrapped(ctx,'foundersfind.club',76,h-90,760,27,36,400,ink);
 if(post.format==='carousel'&&index<post.frames.length-1)wrapped(ctx,'SWIPE →',835,h-90,185,24,36,600,ink);
 ctx.fillStyle=pink;ctx.fillRect(76,h-136,post.format==='reel'?928*((index+progress)/post.frames.length):84,3);
 return c;
}
export async function frameBlob(post:Post,brand:Brand,index:number){const c=await drawFrame(post,brand,index);return new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Artwork export failed.')),'image/png'));}
export function download(blob:Blob,name:string){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
export async function exportImages(posts:Post[],brand:Brand,onProgress:(s:string)=>void,ads:{pageName:string;snapshotUrl:string;body:string}[]=[]){
 const files:Record<string,Uint8Array>={};
 for(const p of posts.filter(p=>p.format!=='reel'))for(let i=0;i<p.frames.length;i++){
  onProgress(`Rendering ${p.format} ${i+1} of ${p.frames.length}`);
  files[`${p.format}/${String(i+1).padStart(2,'0')}.png`]=new Uint8Array(await (await frameBlob(p,brand,i)).arrayBuffer());
 }
 files['captions.txt']=strToU8(posts.map(p=>`${p.format.toUpperCase()}\n\n${p.caption}\n\nALT TEXT\n${typographyOnly(brand)?'Founder’s Find typography-led '+p.format+' with serif headlines and pink italic emphasis. '+(p.format==='static'?'Execution and judgement comparison panels. ':'Thin-line career diagrams. ')+p.frames.map(f=>f.heading).join(' / '):p.altText}`).join('\n\n----------\n\n'));
 files['sources.txt']=strToU8(`${brand.sourceUrl}\n\n${brand.facts.join('\n')}\n\nBrand voice and audience emotions are inferred. ${typographyOnly(brand)?'Typography and original geometric diagrams based on the website. No AI faces.':brand.artwork?.note??'Shared original fictional sample artwork.'} Imagery is conceptual, not a customer testimonial or an exact product photograph. ${ads.length?'Imported ad sources (structural inspiration only, no performance claims):\n'+ads.map(a=>a.pageName+' — '+a.snapshotUrl).join('\n'):'No ad-library records were imported.'} ${typographyOnly(brand)?'Static composition inspiration: founder-supplied 98 Static Ads overview board, saved in design/inspiration-library/assets/static-ads-board.png. Composition-level reference only; individual ad copy and performance are not verified. ':''}Reel video is downloaded separately.`);
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

/** Composite the actual provider footage; retain its speech instead of substituting music. */
export async function exportAvatar(post:Post,brand:Brand,url:string,onProgress:(s:string)=>void){
 const {Input,UrlSource,ALL_FORMATS,CanvasSink,EncodedPacketSink,Output,Mp4OutputFormat,BufferTarget,CanvasSource,EncodedAudioPacketSource,QUALITY_HIGH}=await import('mediabunny');
 const input=new Input({source:new UrlSource(url),formats:ALL_FORMATS});
 const output=new Output({format:new Mp4OutputFormat(),target:new BufferTarget()});
 try{
  const track=await input.getPrimaryVideoTrack(),speech=await input.getPrimaryAudioTrack();
  if(!track||!speech)throw new Error('The generated video needs both footage and speech before it can be exported.');
  const duration=await input.computeDuration();
  if(!Number.isFinite(duration)||duration<=0||duration>35)throw new Error('The generated video has an unsupported duration.');
  const c=await drawFrame(post,brand,0),ctx=c.getContext('2d')!;
  const palette=paletteFor(brand);
  const video=new CanvasSource(c,{codec:'avc',bitrate:QUALITY_HIGH});output.addVideoTrack(video);
  if(await speech.getCodec()!=='aac')throw new Error('The provider video needs AAC speech for a lossless Instagram export.');
  const decoderConfig=await speech.getDecoderConfig();if(!decoderConfig)throw new Error('Provider audio metadata is missing.');
  const audio=new EncodedAudioPacketSource('aac');output.addAudioTrack(audio);
  await output.start();
  const writeAudio=async()=>{for await(const chunk of new EncodedPacketSink(speech).packets())await audio.add(chunk,{decoderConfig});audio.close();};
  const writeVideo=async()=>{for await(const frame of new CanvasSink(track).canvases()){
   const scene=Math.min(post.frames.length-1,Math.floor(frame.timestamp/duration*post.frames.length)),card=post.frames[scene];
   ctx.drawImage(frame.canvas,0,0,c.width,c.height);
   ctx.globalAlpha=.96;ctx.fillStyle=palette.paper;ctx.fillRect(40,1130,1000,690);ctx.globalAlpha=1;
   const y=wrapped(ctx,card.heading,80,1180,920,64,74,700,palette.ink);
   wrapped(ctx,card.body,80,y+30,920,39,51,400,palette.ink);
   wrapped(ctx,new URL(brand.sourceUrl).hostname,80,1750,920,26,34,600,palette.ink);
   onProgress(`Finishing avatar reel · ${Math.round(frame.timestamp/duration*100)}%`);
   await video.add(frame.timestamp,frame.duration);
  }video.close();};
  await Promise.all([writeAudio(),writeVideo()]);await output.finalize();
  if(!output.target.buffer)throw new Error('Avatar export returned no file.');
  download(new Blob([output.target.buffer],{type:'video/mp4'}),`${brand.name.toLowerCase().replace(/\W+/g,'-')}-avatar-reel.mp4`);
 }catch(e){await output.cancel();throw e;}finally{input.dispose();}
}
