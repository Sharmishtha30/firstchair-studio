import type {Brand,Post} from '../convex/studioTypes';
import {bounds,colours,loadImage,text} from './artwork';
import {appearanceContexts,appearanceReports,paintSlideImage} from './appearanceLayout';
import {slideNumberLabel} from '../convex/carouselEdits';
import {readableBrandInk} from '../convex/brandAcceptance';
// Only explicitly uploaded photos use this layout. Generated artwork stays unchanged.
export async function paintUploadedPhoto(ctx:CanvasRenderingContext2D,post:Post,brand:Brand,index:number,font:string,bodyFont:string,weight:number){
 const f=post.frames[index],p=colours(brand),background=f.look?.background??p.paper,ink=f.look?.text??p.ink,heading=f.look?.heading??readableBrandInk(p),accent=f.look?.accent??p.primary;
 const asset=brand.assets?.find(a=>a.key===f.assetKey);if(!asset)throw new Error('Your uploaded photo is missing. Upload it again before downloading.');
 const image=await loadImage(asset.url);
 const report=appearanceReports.get(ctx.canvas);if(report)report.text={heading:{background,colour:heading},body:{background,colour:ink}};
 let fitted=false,last:unknown;
 for(const size of [40,36,32,28]){
  bounds.get(ctx.canvas)?.splice(0);const state=appearanceContexts.get(ctx);if(state){state.textBounds.splice(0);state.pending.splice(0);}
  ctx.fillStyle=background;ctx.fillRect(0,0,1080,1350);ctx.fillStyle=accent;ctx.fillRect(120,150,144,10);
  try{
   let y=190;
   if(f.eyebrow)y=text(ctx,f.eyebrow.toUpperCase(),120,65,840,24,60,bodyFont,heading,600,22);
   y=190;
   if(f.heading)y=text(ctx,f.heading,120,y,840,size+16,740-y,font,heading,weight,size+8,true,'heading')+24;
   if(f.body)y=text(ctx,f.body,120,y,840,size,740-y,bodyFont,ink,400,size,true,'body')+20;
   for(const item of f.items??[]){if(item.label)y=text(ctx,item.label,120,y,840,size,740-y,bodyFont,heading,600,size,true,'body')+6;if(item.detail)y=text(ctx,item.detail,120,y,840,size,740-y,bodyFont,ink,400,size,true,'body')+16;}
   if(f.design?.takeaway)text(ctx,f.design.takeaway,120,y,840,size,740-y,bodyFont,ink,400,size,true,'body');
   fitted=true;break;
  }catch(e){last=e;}
 }
 if(!fitted)throw last;
 const slot={x:80,y:790,width:920,height:390};
 paintSlideImage(ctx,image,slot,()=>{const scale=Math.min(slot.width/image.width,slot.height/image.height),box={x:slot.x+(slot.width-image.width*scale)/2,y:slot.y+(slot.height-image.height*scale)/2,width:image.width*scale,height:image.height*scale};ctx.drawImage(image,box.x,box.y,box.width,box.height);return box;});
 let website='';try{website=new URL(brand.sourceUrl).hostname.replace(/^www\./,'');}catch{}
 text(ctx,website,120,1218,760,24,40,bodyFont,ink,400,20);
 text(ctx,slideNumberLabel(post,index),920,1218,80,24,40,bodyFont,ink,400,22);
}
