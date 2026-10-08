import {v} from 'convex/values';
export const imageSizes=['S','M','L','Full'] as const;
export type ImageStyle={size:typeof imageSizes[number];mode:'fit'|'fill'};
export type TextColours={heading?:string;body?:string};
export const imageStyleV=v.object({size:v.union(v.literal('S'),v.literal('M'),v.literal('L'),v.literal('Full')),mode:v.union(v.literal('fit'),v.literal('fill'))});
export const textColoursV=v.object({heading:v.optional(v.string()),body:v.optional(v.string())});
export const validColour=(value:string)=>/^#[0-9a-f]{6}$/i.test(value);
export function contrastRatio(a:string,b:string){
 const lum=(c:string)=>{const rgb=c.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 return (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
}
export function readableSwatch(chosen:string,background:string,swatches:string[]){
 const rgb=(c:string)=>c.slice(1).match(/../g)!.map(x=>parseInt(x,16));const from=rgb(chosen);
 const readable=swatches.filter(c=>contrastRatio(c,background)>=4.5);if(!readable.length)readable.push(contrastRatio('#000000',background)>=4.5?'#000000':'#ffffff');
 return readable.sort((a,b)=>rgb(a).reduce((n,x,i)=>n+(x-from[i])**2,0)-rgb(b).reduce((n,x,i)=>n+(x-from[i])**2,0))[0];
}
export type Box={x:number;y:number;width:number;height:number};
export function intersects(a:Box,b:Box){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
export function fitImageBox(slot:Box,requested:ImageStyle['size'],text:Box[]){
 const scales={S:.55,M:.7,L:.85,Full:1};
 for(const size of imageSizes.slice(0,imageSizes.indexOf(requested)+1).reverse()){
  const width=slot.width*scales[size],height=slot.height*scales[size],box={x:slot.x+(slot.width-width)/2,y:slot.y+(slot.height-height)/2,width,height};
  if(box.x>=80&&box.y>=165&&box.x+width<=1000&&box.y+height<=1180&&!text.some(t=>intersects(box,{x:t.x-8,y:t.y-8,width:t.width+16,height:t.height+16})))return {box,size};
 }
 throw new Error('This image has no safe space beside the text. Choose another slide or shorten its text.');
}
