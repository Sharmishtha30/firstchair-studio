import {internalAction} from './_generated/server';
import {internal} from './_generated/api';
import {v} from 'convex/values';
import {seedanceRequest} from './seedanceRequest';
import {createTask,taskState,downloadVideo} from './seedanceClient';
function key(){const key=process.env.ARK_API_KEY;if(!key)throw new Error('Seedance needs ARK_API_KEY in Convex.');return key;}
export const create=internalAction({args:{packId:v.id('packs')},returns:v.null(),handler:async(ctx,{packId})=>{
 const pack=await ctx.runQuery(internal.studio.getInternal,{packId});const post=pack?.posts?.find(p=>p.format==='reel');if(!post||!pack?.brand)throw new Error('Finish a content pack before making video.');
 const task=await createTask(key(),seedanceRequest(post,pack.brand));
 await ctx.runMutation(internal.media.updateVideo,{packId,status:'running',task});return null;
}});
export const poll=internalAction({args:{packId:v.id('packs')},returns:v.boolean(),handler:async(ctx,{packId})=>{
 const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack?.videoTask)throw new Error('Video task was not saved.');
 const state=await taskState(key(),pack.videoTask);if(!state.done)return false;
 const blob=await downloadVideo(state.url);const storageId=await ctx.storage.store(blob);
 await ctx.runMutation(internal.media.updateVideo,{packId,status:'succeeded',file:storageId});return true;
}});
