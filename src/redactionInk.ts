import {redactionPattern} from '../convex/callPrivacy';
import type {CallQuote} from '../convex/customerCall';
// Canvas measures the original word but never paints it. Exports contain solid pixels only.
export function installRedactionInk(ctx:CanvasRenderingContext2D,quote?:CallQuote){
 const measure=ctx.measureText.bind(ctx),paint=ctx.fillText.bind(ctx);
 function parts(value:string){return value.split(/(\[R:\d+:\d+\]|\[REDACTED\])/g).filter(Boolean).map(text=>{
  const m=/^\[R:(\d+):(\d+)\]$/.exec(text);
  if(m){const start=Number(m[1]),length=Number(m[2]);if(!quote||(quote.privateSpans??[]).every(s=>!s.company||start<s.start||start+length>s.start+s.length))throw Error('The source for this redaction is unavailable.');return {text:quote.text.slice(start,start+length),hidden:true};}
  return {text:text==='[REDACTED]'?'██████':text,hidden:text==='[REDACTED]'};
 });}
 ctx.measureText=(value:string)=>{if(!/\[R:|\[REDACTED\]/.test(value))return measure(value);const chunks=parts(value),metrics=measure(value.replace(redactionPattern,''));return new Proxy(metrics,{get(target,key){return key==='width'?chunks.reduce((n,p)=>n+measure(p.text).width,0):Reflect.get(target,key,target);}});};
 ctx.fillText=(value:string,x:number,y:number,maxWidth?:number)=>{
  if(!/\[R:|\[REDACTED\]/.test(value)){paint(value,x,y,maxWidth);return;}
  const chunks=parts(value),width=chunks.reduce((n,p)=>n+measure(p.text).width,0),scale=maxWidth?Math.min(1,maxWidth/width):1;
  let at=x-(ctx.textAlign==='center'?width*scale/2:ctx.textAlign==='right'||ctx.textAlign==='end'?width*scale:0);
  const align=ctx.textAlign;ctx.textAlign='left';
  for(const chunk of chunks){const w=measure(chunk.text).width*scale;if(chunk.hidden){const size=Number(ctx.font.match(/([\d.]+)px/)?.[1]??40);ctx.fillRect(at,y+(ctx.textBaseline==='top'?size*.12:-size*.75),w,size*.82);}else paint(chunk.text,at,y,w);at+=w;}
  ctx.textAlign=align;
 };
}
