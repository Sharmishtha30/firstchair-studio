import {slideNumberLabel} from '../convex/carouselEdits';
import type {Brand,Post} from '../convex/studioTypes';
import type {Box} from '../convex/appearance';
import {bounds,loadImage,text} from './artwork';
import {appearanceContexts,appearanceReports,paintSlideImage} from './appearanceLayout';
import {brandHighlight} from '../convex/brandLook';

/** Website brand-colour cards, with photos only for D2C packs. Text never sits on a photo;
 * every text colour is chosen for 4.5:1 contrast on its card colour (see convex/brandLook.ts). */
export async function paintBrand(ctx:CanvasRenderingContext2D,post:Post,brand:Brand,index:number,font:string,bodyFont:string,weight:number){
 const f=post.frames[index],url=f.assetKey?brand.assets?.find(a=>a.key===f.assetKey)?.url:undefined;
 let image:HTMLImageElement|undefined;
 if(url)try{image=await loadImage(url);}catch{/* A missing photo leaves the slide text-only, never broken. */}
 // When the copy needs the photo's space, the cover photo gets shorter first; only then does the slide drop the photo and keep its words.
 const heights=image&&index===0?[520,380,260]:[520];
 for(const height of heights){
  try{return await layout(ctx,post,brand,index,font,bodyFont,weight,image,height);}
  catch(error){if(!image||!(error instanceof Error)||!/fit|Shorten|space|outside/i.test(error.message))throw error;reset(ctx);}
 }
 return layout(ctx,post,brand,index,font,bodyFont,weight,undefined);
 function reset(c:CanvasRenderingContext2D){bounds.get(c.canvas)?.splice(0);const state=appearanceContexts.get(c);if(state){state.textBounds.splice(0);state.pending.splice(0);}const report=appearanceReports.get(c.canvas);if(report)delete report.image;}
}

function photo(ctx:CanvasRenderingContext2D,img:HTMLImageElement,slot:Box){
 paintSlideImage(ctx,img,slot,()=>{
  const scale=Math.max(slot.width/img.width,slot.height/img.height),w=img.width*scale,h=img.height*scale;
  ctx.save();ctx.beginPath();ctx.roundRect(slot.x,slot.y,slot.width,slot.height,28);ctx.clip();
  ctx.drawImage(img,slot.x+(slot.width-w)/2,slot.y+(slot.height-h)/2,w,h);ctx.restore();return slot;
 },'rounded');
}

async function layout(ctx:CanvasRenderingContext2D,post:Post,brand:Brand,index:number,font:string,bodyFont:string,weight:number,image?:HTMLImageElement,photoHeight=520){
 const f=post.frames[index],look=f.look!,lead=index===0,report=appearanceReports.get(ctx.canvas);
 if(report)report.text={heading:{background:look.background,colour:look.heading},body:{background:look.background,colour:look.text}};
 ctx.fillStyle=look.background;ctx.fillRect(0,0,1080,1350);
 const highlight=f.design?.emphasis?brandHighlight(f.design.emphasis,look.accent):undefined;
 // Cover and static: the photo leads and the words sit on the brand colour below it.
 const photoFirst=!!image&&lead;
 if(photoFirst)photo(ctx,image!,{x:80,y:165,width:920,height:photoHeight});
 const ruleY=photoFirst?165+photoHeight+35:image?140:305;
 ctx.fillStyle=look.accent;ctx.fillRect(120,ruleY,144,10);
 const label=(f.eyebrow?.trim()||'').toUpperCase();
 if(label&&!photoFirst)text(ctx,label,120,55,840,24,64,bodyFont,look.heading,600,22);
 let y=ruleY+(photoFirst?40:image?40:55);
 const limit=1180;
 if(f.heading.trim())y=text(ctx,f.heading,120,y,840,lead?(photoFirst?72:84):64,photoFirst?limit-y-60:lead?420:300,font,look.heading,weight,44,true,'heading',highlight)+(lead?30:28);
 if(f.body.trim())y=text(ctx,f.body,120,y,840,lead?42:46,limit-y,bodyFont,look.text,400,36,true,'body',highlight)+26;
 for(const item of f.items??[]){
  if(item.label.trim()&&item.detail.trim()){y=text(ctx,item.label,120,y,840,36,limit-y,bodyFont,look.heading,600,32,true,'body')+6;y=text(ctx,item.detail,120,y,840,46,limit-y,bodyFont,look.text,400,40,true,'body',highlight)+22;continue;}
  const content=[item.label,item.detail].filter(Boolean).join(': ');if(!content.trim())continue;
  const numbered=content.match(/^(\d+[.)])\s+(.*)$/s);
  ctx.font=`400 46px ${bodyFont}`;ctx.fillStyle=look.heading;ctx.fillText(numbered?.[1]||'•',120,y);
  y=text(ctx,numbered?.[2]||content,178,y,782,46,limit-y,bodyFont,look.text,400,40,true,'body',highlight)+20;
 }
 if(f.design?.takeaway)y=text(ctx,f.design.takeaway,120,y,840,44,limit-y,bodyFont,look.text,400,40,true,'body',highlight)+20;
 // Inside the carousel, a photo takes the space below the words when there is enough of it.
 if(image&&!photoFirst){const top=y+20,height=limit-top;if(height>=320)photo(ctx,image,{x:80,y:top,width:920,height});}
 let website='';try{website=new URL(brand.sourceUrl).hostname.replace(/^www\./,'');}catch{/* No invented address. */}
 text(ctx,website,120,1218,760,24,40,bodyFont,look.text,400,20);
 if(post.format==='carousel')text(ctx,slideNumberLabel(post,index),920,1218,80,24,40,bodyFont,look.text,400,22);
}
