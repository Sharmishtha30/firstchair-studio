"use node";
import {inflateSync} from 'node:zlib';
import {isBrandColour} from './brandLook';

// Brand colours from the site's own logo, for sites whose CSS is only black, white and grey.
// PNG (8-bit, non-interlaced) and SVG fills are read; other formats return no colours.
function pngPixels(bytes:Uint8Array){
 const buf=Buffer.from(bytes);if(buf.readUInt32BE(0)!==0x89504e47)return undefined;
 let at=8,width=0,height=0,depth=0,type=0,interlace=0,palette:number[][]=[],alpha:number[]=[];const data:Buffer[]=[];
 while(at<buf.length){const length=buf.readUInt32BE(at),kind=buf.toString('ascii',at+4,at+8),chunk=buf.subarray(at+8,at+8+length);
  if(kind==='IHDR'){width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);depth=chunk[8];type=chunk[9];interlace=chunk[12];}
  else if(kind==='PLTE')for(let i=0;i<chunk.length;i+=3)palette.push([chunk[i],chunk[i+1],chunk[i+2]]);
  else if(kind==='tRNS')alpha=[...chunk];else if(kind==='IDAT')data.push(chunk);else if(kind==='IEND')break;
  at+=12+length;}
 const channels={0:1,2:3,3:1,4:2,6:4}[type as 0|2|3|4|6];
 if(depth!==8||interlace||!channels||width*height>4_000_000)return undefined;
 const raw=inflateSync(Buffer.concat(data)),stride=width*channels,out=Buffer.alloc(stride*height);
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)],row=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1));
  for(let x=0;x<stride;x++){const a=x>=channels?out[y*stride+x-channels]:0,b=y?out[(y-1)*stride+x]:0,c=x>=channels&&y?out[(y-1)*stride+x-channels]:0;
   const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c),pred=[0,a,b,(a+b)>>1,pa<=pb&&pa<=pc?a:pb<=pc?b:c][filter]??0;
   out[y*stride+x]=(row[x]+pred)&255;}}
 const pixels:[number,number,number,number][]=[];
 for(let i=0;i<out.length;i+=channels){
  if(type===3){const [r,g,b]=palette[out[i]]??[0,0,0];pixels.push([r,g,b,alpha[out[i]]??255]);}
  else if(type===0||type===4)pixels.push([out[i],out[i],out[i],type===4?out[i+1]:255]);
  else pixels.push([out[i],out[i+1],out[i+2],type===6?out[i+3]:255]);}
 return pixels;
}
const hex=(r:number,g:number,b:number)=>'#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
/** Brand colours in order of how much of the logo they cover. */
export function logoColours(bytes:Uint8Array,text:string):string[]{
 if(/<svg[\s>]/i.test(text.slice(0,2000))){
  const counts=new Map<string,number>();
  for(const m of text.matchAll(/(?:fill|stop-color|color)\s*[:=]\s*["']?(#[0-9a-f]{6}|#[0-9a-f]{3})\b/gi)){let c=m[1].toLowerCase();if(c.length===4)c='#'+[...c.slice(1)].map(x=>x+x).join('');counts.set(c,(counts.get(c)??0)+1);}
  return [...counts].sort((a,b)=>b[1]-a[1]).map(([c])=>c).filter(isBrandColour).slice(0,4);
 }
 let pixels;try{pixels=pngPixels(bytes);}catch{return [];}
 if(!pixels)return [];
 // Bucket to 4 bits per channel, then report each bucket's average colour.
 const buckets=new Map<number,{n:number;r:number;g:number;b:number}>();
 for(const [r,g,b,a] of pixels){if(a<200)continue;const key=(r>>4)<<8|(g>>4)<<4|b>>4,s=buckets.get(key)??{n:0,r:0,g:0,b:0};s.n++;s.r+=r;s.g+=g;s.b+=b;buckets.set(key,s);}
 const total=[...buckets.values()].reduce((n,s)=>n+s.n,0);
 return [...buckets.values()].filter(s=>s.n>=total*.01).sort((a,b)=>b.n-a.n).map(s=>hex(Math.round(s.r/s.n),Math.round(s.g/s.n),Math.round(s.b/s.n))).filter(isBrandColour).slice(0,4);
}
