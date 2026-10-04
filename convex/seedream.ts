'use node';
import {internalAction} from './_generated/server';
import {internal} from './_generated/api';
import {v} from 'convex/values';
import {generateImage,imageRequest,imageInfo} from './seedreamClient';
export const create=internalAction({args:{packId:v.id('packs'),startedAt:v.number(),slot:v.union(v.literal('scene'),v.literal('presenter'))},returns:v.null(),handler:async(ctx,{packId,startedAt,slot})=>{
 const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack?.brand||!pack.posts||pack.imageStartedAt!==startedAt||pack.imageStatus!=='running')return null;
 if(slot==='scene'?pack.sceneFile:pack.presenterFile)return null;
 const key=process.env.ARK_API_KEY;if(!key)throw new Error('ARK_API_KEY is missing.');
 const raw=await generateImage(key,imageRequest(pack.brand,pack.posts,slot));
 const info=imageInfo(raw);
 const file=await ctx.storage.store(new Blob([raw as BlobPart],{type:info.mime}));
 const accepted=await ctx.runMutation(internal.images.update,{packId,startedAt,status:'running',slot,file});if(!accepted)await ctx.storage.delete(file);return null;
}});
