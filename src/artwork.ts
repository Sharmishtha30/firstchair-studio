import {anonymizePosts} from '../convex/callPrivacy';
import {installRedactionInk} from './redactionInk';
import {appearanceContexts,appearanceReports,recordTextAppearance,paintSlideImage,finishSlideImages} from './appearanceLayout';
import {fittingCandidates,type TextStyles,type TextField} from '../convex/textStyles';
import {editorFont} from './textStyleFonts';
import {styledContexts,fittedStyles,textOverride} from './textStyleLayout';
import {paintFrozen} from './frozenArtwork';
import type {Brand,Post,Frame} from '../convex/studioTypes';
export function colours(brand:Brand){return brand.palette??{paper:'#ffffff',ink:'#101010',primary:'#253e62',accent:'#253e62',note:'Neutral fallback'};}
function luminance(hex:string){return hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);}
export function foreground(background:string){return luminance(background)>.19?'#101010':'#ffffff';}
export function lines(ctx:CanvasRenderingContext2D,value:string,width:number){const result:string[]=[];for(const para of value.split('\n')){let row='';for(const word of para.split(/\s+/)){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){result.push(row);row=word;}else row=next;}if(row)result.push(row);}return result;}
export type TextBound={value:string;x:number;y:number;width:number;height:number;size:number};
export const bounds=new WeakMap<HTMLCanvasElement,TextBound[]>();
export function text(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,width:number,size:number,maxHeight:number,font:string,colour:string,weight=400,min=40,paint=true,field?:TextField,highlight?:{phrase:string;background:string}){
 if(field){const a=appearanceReports.get(ctx.canvas);colour=recordTextAppearance(ctx,field,colour,a?.text[field]?.background??'#ffffff');}
 const override=textOverride(ctx,field);if(override){size=override.size;min=size;font=override.font??font;if(override.font)weight=override.weight;}
 if(!value.trim())return y;let rows:string[]=[],line=0,used=size;
 for(let s=size;s>=Math.min(size,min);s-=2){used=s;ctx.font=`${weight} ${s}px ${font}`;rows=lines(ctx,value,width);line=s*1.14;if(rows.length*line<=maxHeight&&rows.every(row=>ctx.measureText(row).width<=width))break;}
 if(rows.length*line>maxHeight||rows.some(row=>ctx.measureText(row).width>width))throw new Error('This text does not fit at a readable size: “'+value.slice(0,85)+'”. Shorten it or choose a different layout.');
 if(x<80||y<55||x+width>1000||y+rows.length*line>1295)throw new Error('Text falls outside the creative safe area.');
 bounds.get(ctx.canvas)?.push({value,x,y,width,height:rows.length*line,size:used});appearanceContexts.get(ctx)?.textBounds.push({x,y,width,height:rows.length*line});ctx.fillStyle=colour;ctx.textBaseline='top';
 const joined=rows.join(' '),phrase=highlight?.phrase.replace(/\s+/g,' ').trim()??'',start=phrase?joined.indexOf(phrase):-1;let offset=0;
 for(const row of rows){if(paint){const a=Math.max(0,start-offset),b=Math.min(row.length,start+phrase.length-offset);const marked=start>=0&&b>a&&highlight;
 if(marked){ctx.fillStyle=highlight.background;ctx.fillRect(x+ctx.measureText(row.slice(0,a)).width-3,y-2,ctx.measureText(row.slice(a,b)).width+6,line);}
 ctx.fillStyle=colour;ctx.fillText(row,x,y);
 if(marked){ctx.fillStyle=foreground(highlight.background);ctx.fillText(row.slice(a,b),x+ctx.measureText(row.slice(0,a)).width,y);}
 }offset+=row.length+1;y+=line;}return y;
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
 if(brand.style?.wordmarkText&&brand.style.wordmarkAccent){
  const label=brand.style.wordmarkText,accent=brand.style.wordmarkAccent,at=label.indexOf(accent);const wordmarkFont=brand.style.headline==='serif'?'Georgia':font??'"Brand Inter"';ctx.textBaseline='top';ctx.font=`400 36px ${wordmarkFont}`;ctx.fillStyle=colours(brand).ink;
  if(at>=0){const before=label.slice(0,at);ctx.fillText(before,80,80);let x=80+ctx.measureText(before).width;ctx.font=`italic 400 36px ${wordmarkFont}`;ctx.fillStyle=colours(brand).primary;ctx.fillText(accent,x,80);x+=ctx.measureText(accent).width;ctx.font=`400 36px ${wordmarkFont}`;ctx.fillStyle=colours(brand).ink;ctx.fillText(label.slice(at+accent.length),x,80);return;}
 }
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
 // Load the exact faces this slide paints before measuring; a fallback face would mis-measure and get cached into exports.
 const faces=[`${weight} 60px ${font}`,`400 46px ${bodyFont}`,`600 36px ${bodyFont}`];
 await Promise.all(faces.map(face=>document.fonts.load(face)));
 if(faces.some(face=>!document.fonts.check(face)))throw new Error('A brand font did not finish loading. Retry the preview.');
 if(post.frames.some(frame=>frame.quote))installRedactionInk(ctx,f.quote);
 // The publisher identity remains visible even before the story mentions the offer.
 const fonts:Partial<Record<TextField,string>>={};
 for(const field of ['heading','body'] as const){const choice=styles[field]?.font;if(choice&&choice!=='brand')fonts[field]=await editorFont(choice);}
 styledContexts.set(ctx,{styles,fonts});fittedStyles.set(c,styles);appearanceContexts.set(ctx,{colours:f.textColours??{},imageStyle:f.imageStyle,pending:[],textBounds:[]});appearanceReports.set(c,{text:{heading:{background:p.paper,colour:ink},body:{background:!f.design&&f.composition==='spotlight'?p.primary:p.paper,colour:ink}}});
 await paintFrozen(ctx,post,brand,index,font,bodyFont,weight);finishSlideImages(ctx);return c;
}

export async function checkArtwork(posts:Post[],brand:Brand){const report=[];for(const post of posts)for(let i=0;i<post.frames.length;i++){const c=await renderArtwork(post,brand,i);report.push({platform:post.platform??'instagram',format:post.format,slide:i+1,width:c.width,height:c.height,text:bounds.get(c)});}return report;}
