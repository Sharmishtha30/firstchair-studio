import {anonymizePosts} from '../convex/callPrivacy';
import {installRedactionInk} from './redactionInk';
import {appearanceContexts,appearanceReports,recordTextAppearance,paintSlideImage,finishSlideImages} from './appearanceLayout';
import {fittingCandidates,type TextStyles,type TextField} from '../convex/textStyles';
import {editorFont} from './textStyleFonts';
import {styledContexts,fittedStyles,textOverride} from './textStyleLayout';
import {paintDesigned} from './editorialArtwork';
import type {Brand,Post,Frame} from '../convex/studioTypes';
export function colours(brand:Brand){return brand.palette??{paper:'#ffffff',ink:'#101010',primary:'#253e62',accent:'#253e62',note:'Neutral fallback'};}
function luminance(hex:string){return hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);}
export function foreground(background:string){return luminance(background)>.19?'#101010':'#ffffff';}
export function lines(ctx:CanvasRenderingContext2D,value:string,width:number){const result:string[]=[];for(const para of value.split('\n')){let row='';for(const word of para.split(/\s+/)){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){result.push(row);row=word;}else row=next;}if(row)result.push(row);}return result;}
export type TextBound={value:string;x:number;y:number;width:number;height:number;size:number};
export const bounds=new WeakMap<HTMLCanvasElement,TextBound[]>();
export function text(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,width:number,size:number,maxHeight:number,font:string,colour:string,weight=400,min=40,paint=true,field?:TextField){
 if(field){const a=appearanceReports.get(ctx.canvas);colour=recordTextAppearance(ctx,field,colour,a?.text[field]?.background??'#ffffff');}
 const override=textOverride(ctx,field);if(override){size=override.size;min=size;font=override.font??font;if(override.font)weight=override.weight;}
 if(!value.trim())return y;let rows:string[]=[],line=0,used=size;
 for(let s=size;s>=Math.min(size,min);s-=2){used=s;ctx.font=`${weight} ${s}px ${font}`;rows=lines(ctx,value,width);line=s*1.14;if(rows.length*line<=maxHeight&&rows.every(row=>ctx.measureText(row).width<=width))break;}
 if(rows.length*line>maxHeight||rows.some(row=>ctx.measureText(row).width>width))throw new Error('This text does not fit at a readable size: “'+value.slice(0,85)+'”. Shorten it or choose a different layout.');
 if(x<80||y<55||x+width>1000||y+rows.length*line>1295)throw new Error('Text falls outside the creative safe area.');
 bounds.get(ctx.canvas)?.push({value,x,y,width,height:rows.length*line,size:used});appearanceContexts.get(ctx)?.textBounds.push({x,y,width,height:rows.length*line});ctx.fillStyle=colour;ctx.textBaseline='top';for(const row of rows){if(paint)ctx.fillText(row,x,y);y+=line;}return y;
}
const images=new Map<string,Promise<HTMLImageElement>>();
export function loadImage(url:string){let request=images.get(url);if(!request){request=new Promise((resolve,reject)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('A website image could not load. Change the image or retry.'));i.src=url;});images.set(url,request);}return request;}
function rect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,radius=0){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,radius);ctx.fill();}
function outline(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,colour:string){ctx.strokeStyle=colour;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);}
function contain(ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number){paintSlideImage(ctx,img,{x,y,width:w,height:h},()=>{const s=Math.min(w/img.width,h/img.height),box={x:x+(w-img.width*s)/2,y:y+(h-img.height*s)/2,width:img.width*s,height:img.height*s};ctx.drawImage(img,box.x,box.y,box.width,box.height);return box;});}
export const hiddenBrandHeaders=new WeakSet<CanvasRenderingContext2D>();
export async function header(ctx:CanvasRenderingContext2D,brand:Brand,ink:string,font?:string){
 if(hiddenBrandHeaders.has(ctx))return;
 if(brand.style?.logoUrl){try{const img=await loadImage(brand.style.logoUrl);const s=Math.min(340/img.width,64/img.height);const p=colours(brand);if(foreground(p.paper)==='#ffffff')rect(ctx,80,60,img.width*s+24,88,'#ffffff',4);ctx.drawImage(img,foreground(p.paper)==='#ffffff'?92:80,72,img.width*s,img.height*s);if(img.width/img.height<1.6)text(ctx,brand.name,80+img.width*s+30,84,600,36,60,font??(brand.style?.headline==='serif'?'Georgia':'\"Brand Inter\"'),ink,600,28);return;}catch{/* Text wordmark is the honest fallback. */}}
 text(ctx,brand.name,80,80,680,32,74,brand.style?.headline==='serif'?'Georgia':'"Brand Inter"',ink,600,28);
}
const fontCache=new Map<string,Promise<string>>();
export async function brandFont(brand:Brand,body=false){const original=brand.style;const style=body?{regularUrl:original?.bodyRegularUrl,semiboldUrl:original?.bodySemiboldUrl}:original;if(!style?.regularUrl||!style.semiboldUrl)return '\"Brand Inter\"';const key=style.regularUrl+'|'+style.semiboldUrl;let p=fontCache.get(key);if(!p){p=(async()=>{const name='WebsiteFont'+fontCache.size;for(const [url,weight]of [[style.regularUrl,'400'],[style.semiboldUrl,'600']] as const){const face=new FontFace(name,`url(${url})`,{weight});await face.load();document.fonts.add(face);}return name;})();fontCache.set(key,p);}return p;}
const renderCache=new Map<string,Promise<HTMLCanvasElement>>();
export function renderArtwork(post:Post,brand:Brand,index=0,_layout=post.layout??'headline'){
 const privacyQuotes=post.frames.flatMap(f=>f.quote?[f.quote]:[]);if(privacyQuotes.some(q=>q.privateSpans))post=anonymizePosts([post],privacyQuotes)[0];
 const key=JSON.stringify([post,brand,index]);let result=renderCache.get(key);if(!result){result=paintFitted(post,brand,index);renderCache.set(key,result);if(renderCache.size>80)renderCache.delete(renderCache.keys().next().value!);}return result;
}
async function paintFitted(post:Post,brand:Brand,index:number){
 let last:unknown;
 for(const styles of fittingCandidates(post.frames[index]?.textStyles??{})){
  try{return await paint(post,brand,index,styles);}catch(error){last=error;if(!(error instanceof Error)||!/fit|Shorten|space|outside|too much/i.test(error.message))throw error;}
 }
 throw last;
}
async function paint(post:Post,brand:Brand,index:number,styles:TextStyles){
 await Promise.all([400,600].map(w=>document.fonts.load(`${w} 40px "Brand Inter"`)));await document.fonts.ready;
 const headingFont=await brandFont(brand);
 const separateBody=!!brand.style?.bodyFont&&brand.style.bodyFont.split(',')[0].trim().toLowerCase()!==brand.style.sourceFont.split(',')[0].trim().toLowerCase();
 const bodyFont=separateBody?await brandFont(brand,true):headingFont;
 const c=document.createElement('canvas');c.width=1080;c.height=1350;bounds.set(c,[]);const ctx=c.getContext('2d')!,p=colours(brand),ink=foreground(p.paper),font=brand.style?.headline==='serif'?(brand.style.fontName&&brand.style.sourceFont.toLowerCase().includes(brand.style.fontName.toLowerCase())?headingFont:'Georgia'):headingFont,weight=brand.style?.weight??(brand.style?.headline==='serif'?400:600),f=post.frames[index];
 if(!f)throw new Error('Slide not found.');
 if(post.frames.some(frame=>frame.quote))installRedactionInk(ctx,f.quote);
 if(post.format==='carousel'&&post.frames.some(frame=>frame.quote)&&!post.frames.slice(0,index+1).some(frame=>[frame.heading,frame.body,frame.design?.takeaway].join(' ').toLowerCase().includes(brand.name.toLowerCase())))hiddenBrandHeaders.add(ctx);
 const fonts:Partial<Record<TextField,string>>={};
 for(const field of ['heading','body'] as const){const choice=styles[field]?.font;if(choice&&choice!=='brand')fonts[field]=await editorFont(choice);}
 styledContexts.set(ctx,{styles,fonts});fittedStyles.set(c,styles);appearanceContexts.set(ctx,{colours:f.textColours??{},imageStyle:f.imageStyle,pending:[],textBounds:[]});appearanceReports.set(c,{text:{heading:{background:p.paper,colour:ink},body:{background:!f.design&&f.composition==='spotlight'?p.primary:p.paper,colour:ink}}});
 if(f.design){await paintDesigned(ctx,post,brand,index,font,bodyFont,weight);finishSlideImages(ctx);return c;}ctx.fillStyle=p.paper;ctx.fillRect(0,0,1080,1350);await header(ctx,brand,ink,font);
 const rule=(y:number)=>{ctx.strokeStyle=ink;ctx.globalAlpha=.18;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(80,y);ctx.lineTo(1000,y);ctx.stroke();ctx.globalAlpha=1;};
 rule(165);if(post.format==='carousel')text(ctx,`${String(index+1).padStart(2,'0')} / ${post.frames.length}`,850,84,150,28,36,bodyFont,ink,600,28);
 const comp=f.composition??(index===post.frames.length-1&&post.format==='carousel'?'closing':'editorial');
 const tx=(value:string,x:number,y:number,w:number,size:number,max:number,family=bodyFont,colour=ink,bold=400,min=40,field?:TextField)=>text(ctx,value,x,y,w,size,max,family,colour,bold,min,true,field);
 const body=(...args:Parameters<typeof tx>)=>tx(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8],args[9],'body');
 if(f.eyebrow)tx(f.eyebrow,80,206,880,28,42,bodyFont,ink,600,28);
 const top=f.eyebrow?260:220,structured=comp==='checklist'||comp==='process',headingEnd=tx(f.heading,80,top,920,comp==='editorial'?112:comp==='closing'?100:structured?76:86,comp==='editorial'?440:structured?240:300,font,ink,weight,64,'heading');
 const items=f.items??[];
 if(comp==='checklist'){
  const bodyEnd=body(f.body,80,headingEnd+24,920,40,110),start=Math.max(520,bodyEnd+38),h=Math.min(184,(1180-start)/Math.max(1,items.length));
  items.forEach((item,i)=>{const y=start+i*h;ctx.strokeStyle=ink;ctx.globalAlpha=.18;ctx.beginPath();ctx.moveTo(80,y);ctx.lineTo(1000,y);ctx.stroke();ctx.globalAlpha=1;rect(ctx,80,y+28,44,44,p.primary,5);ctx.strokeStyle=foreground(p.primary);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(90,y+51);ctx.lineTo(99,y+59);ctx.lineTo(115,y+41);ctx.stroke();tx(item.label,150,y+16,850,46,65,bodyFont,ink,600);tx(item.detail,150,y+72,850,40,h-76);});
 }else if(comp==='comparison'){
  const bodyEnd=body(f.body,80,headingEnd+28,920,42,100),start=Math.max(540,bodyEnd+40),height=1125-start;
  items.slice(0,2).forEach((item,i)=>{const x=80+i*476,accent=i===1,paper=accent?p.primary:p.paper,colour=accent?foreground(p.primary):ink;rect(ctx,x,start,444,height,paper,14);if(!accent)outline(ctx,x,start,444,height,ink);tx(item.label,x+30,start+45,380,52,135,font,colour,weight);tx(item.detail,x+30,start+225,380,42,height-260,bodyFont,colour);});
 }else if(comp==='process'){
  const bodyEnd=body(f.body,80,headingEnd+28,920,42,110),start=Math.max(530,bodyEnd+35),h=Math.min(190,(1180-start)/Math.max(1,items.length));
  items.forEach((item,i)=>{const y=start+i*h;rect(ctx,80,y+18,74,74,p.primary,37);tx(String(i+1),103,y+35,48,40,56,bodyFont,foreground(p.primary),600);if(i<items.length-1){ctx.strokeStyle=p.primary;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(117,y+97);ctx.lineTo(117,y+h+10);ctx.stroke();}tx(item.label.replace(/^\d+[.)]\s*/,''),190,y+16,800,48,68,bodyFont,ink,600);tx(item.detail,190,y+72,790,40,h-76);});
 }else if(comp==='image'){
  const end=body(f.body,80,headingEnd+26,920,42,140),asset=brand.assets?.find(a=>a.key===f.assetKey);if(!asset)throw new Error('This layout needs a website image. Choose another image or composition.');
  const img=await loadImage(asset.url),y=Math.max(670,end+30);rect(ctx,80,y,920,1140-y,'#ffffff',16);contain(ctx,img,100,y+20,880,1100-y);
 }else if(comp==='spotlight'){
  const y=Math.max(610,headingEnd+60);rect(ctx,80,y,920,1120-y,p.primary,14);body(f.body,125,y+65,820,60,1120-y-120,font,foreground(p.primary),weight,44);
 }else if(comp==='closing'){
  body(f.body,80,headingEnd+45,900,48,235);if(f.assetKey){const asset=brand.assets?.find(a=>a.key===f.assetKey);if(asset)contain(ctx,await loadImage(asset.url),80,820,670,300);}
  ctx.strokeStyle=p.primary;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(820,1050);ctx.lineTo(975,1050);ctx.moveTo(920,995);ctx.lineTo(975,1050);ctx.lineTo(920,1105);ctx.stroke();rect(ctx,80,1164,920,8,p.primary);
 }else{
  const bodyEnd=body(f.body,80,headingEnd+48,900,48,230);
  if(f.assetKey){const asset=brand.assets?.find(a=>a.key===f.assetKey);if(asset){const y=Math.max(820,bodyEnd+30);contain(ctx,await loadImage(asset.url),80,y,920,1130-y);}}
  else if(items.length){const y=Math.max(870,bodyEnd+50),w=(920-(items.length-1)*22)/items.length;items.forEach((item,i)=>{const x=80+i*(w+22);rect(ctx,x,y,w,230,p.primary,12);tx(item.label,x+22,y+28,w-44,42,172,bodyFont,foreground(p.primary),600);});}
  else{const visual=index===0?post.frames.find(frame=>frame.composition==='comparison'&&frame.items?.length===2)?.items:undefined;
   if(visual){const y=Math.max(860,bodyEnd+45);visual.forEach((item,i)=>{const x=80+i*476,paper=i?p.primary:p.paper,colour=i?foreground(p.primary):ink;rect(ctx,x,y,444,1140-y,paper,brand.style?.headline==='serif'?0:12);if(!i)outline(ctx,x,y,444,1140-y,ink);tx(item.label,x+30,y+35,380,52,1140-y-65,font,colour,weight,40);});}
   else{rect(ctx,80,1050,920,80,p.primary,0);tx(post.format==='carousel'?'A practical guide':brand.name,110,1069,860,32,46,bodyFont,foreground(p.primary),600,28);}}

 }
 rule(1210);if(!hiddenBrandHeaders.has(ctx))tx(new URL(post.destination??brand.sourceUrl).hostname.replace(/^www\./,''),80,1250,700,26,38,bodyFont,ink,400,26);
 if(post.format==='carousel'&&index<post.frames.length-1)tx('Swipe →',850,1250,150,26,38,bodyFont,ink,600,26);
 finishSlideImages(ctx);return c;
}
export async function checkArtwork(posts:Post[],brand:Brand){const report=[];for(const post of posts)for(let i=0;i<post.frames.length;i++){const c=await renderArtwork(post,brand,i);report.push({platform:post.platform??'instagram',format:post.format,slide:i+1,width:c.width,height:c.height,text:bounds.get(c)});}return report;}
