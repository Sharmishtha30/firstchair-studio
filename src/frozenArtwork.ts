import {readableBrandInk} from '../convex/brandAcceptance';
import type {Brand,Post} from '../convex/studioTypes';
import {colours,loadImage,text} from './artwork';

/** Approved 13 October 2026: fixed composition; only copy and source branding vary. */
export async function paintFrozen(ctx:CanvasRenderingContext2D,post:Post,brand:Brand,index:number,font:string,bodyFont:string,weight:number){
 const f=post.frames[index],p=colours(brand),call=post.sourceKind==='call'||post.frames.some(frame=>!!frame.quote);
 ctx.fillStyle=p.paper;ctx.fillRect(0,0,1080,1350);
 // A fixed brand-colour rule is present even when the model chooses no highlight.
 ctx.fillStyle=p.primary;ctx.fillRect(120,305,144,10);
 const headingInk=readableBrandInk(p);
 const label=(f.eyebrow?.trim()||'').toUpperCase();
 if(label)text(ctx,label,120,55,840,24,64,bodyFont,p.primary,600,22);
 const highlight=f.design?.emphasis?{phrase:f.design.emphasis,background:p.primary}:undefined;
 let y=360;
 if(call){ctx.font='600 132px Georgia';ctx.fillStyle=p.primary;ctx.textBaseline='top';ctx.fillText('“',114,235);}
 if(f.heading.trim())y=text(ctx,f.heading,120,y,840,60,360,font,headingInk,weight,48,true,'heading',highlight)+28;
 if(f.body.trim())y=text(ctx,f.body,120,y,840,50,1100-y,bodyFont,p.ink,400,40,true,'body',highlight)+24;
 for(const item of f.items??[]){const content=[item.label,item.detail].filter(Boolean).join(': ');if(!content.trim())continue;
 const numbered=content.match(/^(\d+[.)])\s+(.*)$/s);
 ctx.font=`400 46px ${bodyFont}`;ctx.fillStyle=p.primary;ctx.fillText(numbered?.[1]||'•',120,y);
 y=text(ctx,numbered?.[2]||content,178,y,782,46,1100-y,bodyFont,p.ink,400,40,true,'body',highlight)+20;}
 if(f.design?.takeaway)y=text(ctx,f.design.takeaway,120,y,840,44,1100-y,bodyFont,p.ink,400,40,true,'body',highlight);
 // Stable footer: website address and optional brand identity, count at right.
 let logo=false;
 if(brand.style?.logoUrl){try{const image=await loadImage(brand.style.logoUrl),scale=Math.min(200/image.width,48/image.height);ctx.drawImage(image,120,1210,image.width*scale,image.height*scale);logo=true;}catch{/* Use the source text identity when its image is unavailable. */}}
 if(!logo){
  const label=brand.style?.wordmarkText||brand.name,accent=brand.style?.wordmarkAccent,at=accent?label.indexOf(accent):-1;
  let size=30;ctx.font=`400 ${size}px ${font}`;while(size>18&&ctx.measureText(label).width>215){size--;ctx.font=`400 ${size}px ${font}`;}
  ctx.textBaseline='top';ctx.fillStyle=p.ink;
  if(at>=0&&accent){const before=label.slice(0,at);ctx.fillText(before,120,1215);let x=120+ctx.measureText(before).width;ctx.font=`italic 400 ${size}px ${font}`;ctx.fillStyle=p.primary;ctx.fillText(accent,x,1215);x+=ctx.measureText(accent).width;ctx.font=`400 ${size}px ${font}`;ctx.fillStyle=p.ink;ctx.fillText(label.slice(at+accent.length),x,1215);}
  else text(ctx,label,120,1215,215,size,60,font,p.ink,400,18);
 }
 let website='';try{website=new URL(brand.sourceUrl).hostname.replace(/^www\./,'');}catch{/* No invented address. */}
 const hasIdentity=logo||!!(brand.style?.wordmarkText||brand.name);
 text(ctx,website,hasIdentity?350:120,1218,hasIdentity?475:760,24,40,bodyFont,p.ink,400,20);
 if(post.format==='carousel')text(ctx,`${index+1}/${post.frames.length}`,920,1218,80,24,40,bodyFont,p.ink,400,22);
}
