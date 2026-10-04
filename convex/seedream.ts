'use node';
import {internalAction} from './_generated/server';
import {internal} from './_generated/api';
import {v} from 'convex/values';
import {generateImage,imageRequest} from './seedreamClient';
export const create=internalAction({args:{packId:v.id('packs'),startedAt:v.number(),slot:v.union(v.literal('scene'),v.literal('presenter'))},returns:v.null(),handler:async(ctx,{packId,startedAt,slot})=>{
 const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack?.brand||!pack.posts||pack.imageStartedAt!==startedAt||pack.imageStatus!=='running')return null;
 if(slot==='scene'?pack.sceneFile:pack.presenterFile)return null;
 const key=process.env.ARK_API_KEY;if(!key)throw new Error('ARK_API_KEY is missing.');
 const raw=await generateImage(key,imageRequest(pack.brand,pack.posts,slot));
 const view=new DataView(raw.buffer,raw.byteOffset,raw.byteLength),width=view.getUint32(16),height=view.getUint32(20);
 if(width<512||height<512||width*height>20_000_000)throw new Error('Generated image dimensions are not suitable for Instagram.');
 const file=await ctx.storage.store(new Blob([raw as BlobPart],{type:'image/png'}));
 const accepted=await ctx.runMutation(internal.images.update,{packId,startedAt,status:'running',slot,file});if(!accepted)await ctx.storage.delete(file);return null;
}});
