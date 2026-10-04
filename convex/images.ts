import {mutation,internalMutation,type MutationCtx} from './_generated/server';
import type {Id} from './_generated/dataModel';
import {internal,components} from './_generated/api';
import {v,ConvexError} from 'convex/values';
import {getAuthUserId} from '@convex-dev/auth/server';
import {WorkflowManager} from '@convex-dev/workflow';
const workflow=new WorkflowManager(components.workflow);
export const generate=mutation({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{
 if(!process.env.ARK_API_KEY)throw new ConvexError('Original images need ARK_API_KEY in Convex and Seedream model access. Shared sample artwork remains labelled.');
 const userId=await getAuthUserId(ctx);if(!userId)throw new ConvexError('Connect ChatGPT before requesting paid images.');
 const pack=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!pack?.posts||!pack.brand||pack.userId&&pack.userId!==userId)throw new ConvexError('This pack is not available to your connection.');
 if(['running','succeeded'].includes(pack.imageStatus??''))throw new ConvexError('Images are already being generated or saved.');
 await ctx.db.patch(pack._id,{userId});await queue(ctx,pack._id);return null;
}});
async function queue(ctx:MutationCtx,packId:Id<'packs'>){
 const startedAt=Date.now();await ctx.db.patch(packId,{imageStatus:'running',imageError:undefined,imageStartedAt:startedAt});
 await workflow.start(ctx,internal.images.imageWorkflow,{packId:packId,startedAt});
 await ctx.scheduler.runAfter(210000,internal.images.expire,{packId:packId,startedAt});return null;
}
export const auto=internalMutation({args:{packId:v.id('packs')},returns:v.null(),handler:async(ctx,{packId})=>{
 const pack=await ctx.db.get(packId);if(!process.env.ARK_API_KEY||!pack?.userId||!pack.brand||!pack.posts||pack.imageStatus)return null;
 await queue(ctx,packId);return null;
}});
export const imageWorkflow=workflow.define({args:{packId:v.id('packs'),startedAt:v.number()},returns:v.null()}).handler(async(step,{packId,startedAt}):Promise<null>=>{
 try{for(const slot of ['scene','presenter'] as const)await step.runAction(internal.seedream.create,{packId,startedAt,slot},{retry:false});await step.runMutation(internal.images.update,{packId,startedAt,status:'succeeded'});}
 catch{await step.runMutation(internal.images.update,{packId,startedAt,status:'failed',error:'Image generation did not finish. Check Seedream access and BytePlus credits. Retrying may create another paid image if a provider response was lost.'});}return null;
});
export const update=internalMutation({args:{packId:v.id('packs'),startedAt:v.number(),status:v.union(v.literal('running'),v.literal('succeeded'),v.literal('failed')),error:v.optional(v.string()),slot:v.optional(v.union(v.literal('scene'),v.literal('presenter'))),file:v.optional(v.id('_storage'))},returns:v.boolean(),handler:async(ctx,{packId,startedAt,status,error,slot,file})=>{
 const pack=await ctx.db.get(packId);if(!pack||pack.imageStartedAt!==startedAt||pack.imageStatus!=='running')return false;
 await ctx.db.patch(packId,{imageStatus:status,imageError:error,...(file&&slot?{[slot==='scene'?'sceneFile':'presenterFile']:file}:{})});return true;
}});
export const expire=internalMutation({args:{packId:v.id('packs'),startedAt:v.number()},returns:v.null(),handler:async(ctx,{packId,startedAt})=>{
 const pack=await ctx.db.get(packId);if(pack?.imageStartedAt===startedAt&&pack.imageStatus==='running')await ctx.db.patch(packId,{imageStatus:'failed',imageError:'Images did not finish within three minutes. Your content and any completed image are saved.'});return null;
}});
