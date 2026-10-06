export type ImageFocus={x:number;y:number;width:number;height:number};
/** Conservative framing only: preserve all visible pixels, never remove backgrounds or subjects. */
export function productImageFocus(pixels:Uint8ClampedArray,width:number,height:number):ImageFocus{
 const full={x:0,y:0,width,height};if(width<16||height<16)return full;
 const at=(x:number,y:number)=>Array.from(pixels.slice((y*width+x)*4,(y*width+x)*4+4));
 const background=at(0,0),same=(pixel:number[])=>background[3]<8?pixel[3]<8:pixel[3]>247&&pixel.slice(0,3).every((n,i)=>Math.abs(n-background[i])<=5);
 if(![[width-1,0],[0,height-1],[width-1,height-1]].every(([x,y])=>same(at(x,y))))return full;
 let left=width,right=-1,top=height,bottom=-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(!same(at(x,y))){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<left)return full;
 const pad=Math.max(8,Math.ceil(Math.max(right-left+1,bottom-top+1)*.08));
 left=Math.max(0,left-pad);right=Math.min(width-1,right+pad);top=Math.max(0,top-pad);bottom=Math.min(height-1,bottom+pad);
 const focus={x:left,y:top,width:right-left+1,height:bottom-top+1};
 // Avoid changing already well-framed photographs for negligible benefit.
 return focus.width*focus.height<width*height*.75?focus:full;
}
