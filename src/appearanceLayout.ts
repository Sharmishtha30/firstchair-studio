import {fitImageBox,type Box,type ImageStyle,type TextColours} from '../convex/appearance';
import type {TextField} from '../convex/textStyles';
export type AppearanceReport={text:Partial<Record<TextField,{background:string;colour:string}>>;image?:Box;imageStyle?:ImageStyle;imageAdjusted?:boolean};
export const appearanceReports=new WeakMap<HTMLCanvasElement,AppearanceReport>();
export const appearanceContexts=new WeakMap<CanvasRenderingContext2D,{colours:TextColours;imageStyle?:ImageStyle;pending:(()=>void)[];textBounds:Box[]}>();
export function recordTextAppearance(ctx:CanvasRenderingContext2D,field:TextField|undefined,colour:string,background:string){
 if(!field)return colour;const custom=appearanceContexts.get(ctx)?.colours[field],effective=custom??colour;
 const report=appearanceReports.get(ctx.canvas);if(report)report.text[field]={colour:effective,background};return effective;
}
export function paintSlideImage(ctx:CanvasRenderingContext2D,img:HTMLImageElement,slot:Box,original:()=>Box,shape?:string){
 const state=appearanceContexts.get(ctx),report=appearanceReports.get(ctx.canvas);
 if(!state?.imageStyle){const box=original();if(report)report.image=box;return;}
 const style=state.imageStyle;
 state.pending.push(()=>{
  const fitted=fitImageBox(slot,style.size,state.textBounds),box=fitted.box;
  const scale=(style.mode==='fit'?Math.min:Math.max)(box.width/img.width,box.height/img.height),w=img.width*scale,h=img.height*scale;
  const x=box.x+(box.width-w)/2,y=box.y+(box.height-h)/2;
  ctx.save();ctx.beginPath();
  if(style.mode==='fill'&&shape==='circle'){const radius=Math.min(box.width,box.height)/2;ctx.arc(box.x+box.width/2,box.y+box.height/2,radius,0,Math.PI*2);}
  else ctx.roundRect(box.x,box.y,box.width,box.height,style.mode==='fill'&&shape==='rounded'?Math.min(box.width,box.height)*.06:0);
  ctx.clip();ctx.drawImage(img,x,y,w,h);ctx.restore();
  if(report){report.image=style.mode==='fit'?{x,y,width:w,height:h}:box;report.imageStyle={...style,size:fitted.size};report.imageAdjusted=fitted.size!==style.size;}
 });
}
export function finishSlideImages(ctx:CanvasRenderingContext2D){for(const paint of appearanceContexts.get(ctx)?.pending??[])paint();}
