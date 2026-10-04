import {mutation,query,internalMutation} from './_generated/server';
import {internal,components} from './_generated/api';
import {typographyOnly} from './brandPresentation';
import {v,ConvexError} from 'convex/values';
import {getAuthUserId} from '@convex-dev/auth/server';
import {WorkflowManager} from '@convex-dev/workflow';
const workflow=new WorkflowManager(components.workflow);
export const providers=query({args:{},returns:v.object({seedance:v.boolean(),images:v.boolean(),ads:v.boolean()}),handler:()=>({seedance:!!process.env.ARK_API_KEY,images:!!process.env.ARK_API_KEY,ads:!!process.env.META_AD_LIBRARY_TOKEN&&!!process.env.META_GRAPH_VERSION})});
export const generate=mutation({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{
 if(!process.env.ARK_API_KEY)throw new ConvexError('Seedance needs ARK_API_KEY in Convex. Your ChatGPT plan does not include BytePlus video credits.');
 const userId=await getAuthUserId(ctx);if(!userId)throw new ConvexError('Connect ChatGPT before requesting paid video generation.');
 const pack=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!pack?.posts||!pack.brand||pack.userId&&pack.userId!==userId)throw new ConvexError('This pack is not available to your connection.');
 if(typographyOnly(pack.brand))throw new ConvexError('Founder’s Find uses a typographic motion reel, without AI faces.');
 if(['queued','running','succeeded'].includes(pack.videoStatus??''))throw new ConvexError('This pack already has a video request.');
 await ctx.db.patch(pack._id,{userId,videoStatus:pack.videoTask?'running':'queued',videoError:undefined});
 await workflow.start(ctx,internal.media.videoWorkflow,{packId:pack._id,resume:!!pack.videoTask});return null;
}});
export const videoWorkflow=workflow.define({args:{packId:v.id('packs'),resume:v.optional(v.boolean())},returns:v.null()}).handler(async(step,{packId,resume}):Promise<null>=>{
 try{
  if(!resume)await step.runAction(internal.seedance.create,{packId},{retry:false});
  for(let i=0;i<60;i++){
   await step.sleep(10000);
   const done=await step.runAction(internal.seedance.poll,{packId},{retry:false});if(done)return null;
  }
  throw new Error('Seedance did not finish within ten minutes. No completed video was saved.');
 }catch(e){await step.runMutation(internal.media.updateVideo,{packId,status:'failed',error:e instanceof Error?e.message.slice(0,300):'Video generation failed.'});}
 return null;
});
export const updateVideo=internalMutation({args:{packId:v.id('packs'),status:v.string(),error:v.optional(v.string()),task:v.optional(v.string()),file:v.optional(v.id('_storage'))},returns:v.null(),handler:async(ctx,{packId,status,error,task,file})=>{
 await ctx.db.patch(packId,{videoStatus:status,videoError:error,...(task?{videoTask:task}:{}),...(file?{videoFile:file}:{})});return null;
}});
