import {imageInfo} from './websiteAssets';
import type {Post} from './studioTypes';
import type {Platform} from './creativeTypes';
export function slideNumberLabel(post:Post,index:number){return `${post.frames[index].slideNumber??index+1}/${post.frames.length}`;}
export function requireCarouselEdit(pack:{userId?:string;stage:string;updatedAt:number;posts?:Post[]}|null,userId:string|null,version:number){
 if(!userId||!pack?.posts||pack.userId!==userId)throw new Error('Connect to the account that created this pack to edit it.');
 if(pack.stage!=='Ready')throw new Error('Wait for writing to finish.');
 if(pack.updatedAt!==version)throw new Error('This pack changed. Check the slide and try again.');
 return pack.posts;
}
export type CarouselEdit={kind:'delete'}|{kind:'number';number:number}|{kind:'photo';assetKey:string};
export function editCarousel(posts:Post[],platform:Platform,slide:number,edit:CarouselEdit):Post[]{
 if(!Number.isInteger(slide)||slide<0)throw new Error('Slide not found.');
 let found=false;
 const result=posts.map(post=>{
  if(post.format!=='carousel'||(post.platform??'instagram')!==platform)return post;
  if(!post.frames[slide])throw new Error('Slide not found.');found=true;
  if(edit.kind==='delete'){
   if(post.frames.length<=1)throw new Error('Keep at least one slide in your carousel.');
   const frames=post.frames.filter((_,i)=>i!==slide).map(({slideNumber,...frame})=>frame);
   return {...post,frames,hook:frames[0].heading};
  }
  if(edit.kind==='number'&&(!Number.isInteger(edit.number)||edit.number<1||edit.number>99))throw new Error('Choose a whole slide number from 1 to 99.');
  return {...post,frames:post.frames.map((f,i)=>i!==slide?f:edit.kind==='number'?{...f,slideNumber:edit.number}:{...f,assetKey:edit.assetKey,uploadedPhoto:true,imageStyle:{size:'Full' as const,mode:'fit' as const}})};
 });
 if(!found)throw new Error('Carousel not found.');return result;
}

export function slideUploadInfo(bytes:Uint8Array){
 if(bytes.byteLength>2_000_000)throw new Error('Upload a PNG, JPEG or WebP under 2 MB.');
 const info=imageInfo(bytes);
 if(!info||info.width<64||info.height<64||info.width>6000||info.height>6000)throw new Error('The image could not be read. Use a PNG, JPEG or WebP between 64 and 6000 pixels.');
 return info;
}
