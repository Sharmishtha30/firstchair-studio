import { mutation, query, internalMutation, internalQuery } from './_generated/server';
import { internal, components } from './_generated/api';
import { v, ConvexError } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { WorkflowManager } from '@convex-dev/workflow';
import { brandV, postV, packFields, adV, paletteV,styleV } from './studioTypes';
import { websiteUrl } from './websiteSafety';
const workflow=new WorkflowManager(components.workflow);
export const makePack=workflow.define({args:{packId:v.id('packs'),revision:v.optional(v.boolean())},returns:v.null()}).handler(async(step,{packId,revision}):Promise<null>=>{
  try {
    if(!revision){await step.runAction(internal.website.inspect,{packId},{retry:false});
    await step.runAction(internal.adInspiration.inspect,{packId},{retry:false});}
    await step.runAction(internal.studioWriter.write,{packId},{retry:false});

  } catch(e) {
    await step.runMutation(internal.studio.update,{packId,stage:'Needs attention',error:e instanceof Error?e.message.replace(/^Uncaught (?:\w+Error|Error):\s*/, '').split(/\n\s+at /)[0].slice(0,400):'Could not finish this pack.'});
  }
  return null;
});
export const start=mutation({args:{url:v.string(),token:v.string()},returns:v.string(),handler:async(ctx,args):Promise<string>=>{
  if(!/^[a-f0-9]{64}$/.test(args.token))throw new ConvexError('Invalid pack link.');
  const url=websiteUrl(args.url).href;
  const userId=await getAuthUserId(ctx);
  const existing=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();
  if(existing){if(existing.url===url&&existing.userId===(userId??undefined))return existing.token;throw new ConvexError('That pack link is already in use. Create a fresh pack.');}
  const startedAt=Date.now();
  const packId=await ctx.db.insert('packs',{token:args.token,url,userId:userId??undefined,stage:'Reading the website',operationStartedAt:startedAt,createdAt:Date.now(),updatedAt:Date.now()});
  await workflow.start(ctx,internal.studio.makePack,{packId});
  await ctx.scheduler.runAfter(240000,internal.studio.expire,{packId,startedAt});return args.token;
}});
export const get=query({args:{token:v.string()},returns:v.union(v.null(),v.object({url:v.string(),stage:v.string(),updatedAt:v.number(),brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string()),imageStatus:v.optional(v.string()),imageError:v.optional(v.string()),videoStatus:v.optional(v.string()),videoError:v.optional(v.string()),videoUrl:v.optional(v.string()),hasVideoTask:v.boolean(),ads:v.optional(v.array(adV)),adStatus:v.optional(v.string()),adError:v.optional(v.string())})),handler:async(ctx,{token})=>{
 const p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!p)return null;return {url:p.url,stage:p.stage,updatedAt:p.updatedAt,brand:p.brand?{...p.brand,style:{...(p.siteStyle??p.brand.style??{headline:"sans" as const,weight:600,sourceFont:"Not found",note:"Font information is missing; bundled Inter fallback."}),logoUrl:p.logoFile?(await ctx.storage.getUrl(p.logoFile))??undefined:undefined},artwork:{sceneUrl:p.sceneFile?(await ctx.storage.getUrl(p.sceneFile))??undefined:undefined,presenterUrl:p.presenterFile?(await ctx.storage.getUrl(p.presenterFile))??undefined:undefined,note:p.sceneFile&&p.presenterFile?'Original fictional images generated for this pack with Seedream.':'Shared fictional sample artwork is used for any image not yet generated.'}}:undefined,posts:p.posts?.filter(x=>x.format!=='reel'),mode:p.mode,error:p.error,imageStatus:p.imageStatus,imageError:p.imageError,videoStatus:p.videoStatus,videoError:p.videoError,videoUrl:p.videoFile?(await ctx.storage.getUrl(p.videoFile))??undefined:undefined,hasVideoTask:!!p.videoTask,ads:p.ads,adStatus:p.adStatus,adError:p.adError};
}});
export const getInternal=internalQuery({args:{packId:v.id('packs')},returns:v.union(v.null(),v.object({_id:v.id('packs'),_creationTime:v.number(),...packFields})),handler:async(ctx,{packId})=>ctx.db.get(packId)});
export const update=internalMutation({args:{packId:v.id('packs'),stage:v.string(),sourceText:v.optional(v.string()),sitePalette:v.optional(paletteV),siteStyle:v.optional(styleV),logoFile:v.optional(v.id('_storage')),brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string())},returns:v.null(),handler:async(ctx,{packId,...patch})=>{
 const current=await ctx.db.get(packId);if(!current||current.error)return null;
 await ctx.db.patch(packId,{...Object.fromEntries(Object.entries(patch).filter(([,x])=>x!==undefined)),updatedAt:Date.now(),...(patch.stage==='Ready'?{feedback:undefined,revisionFormat:undefined}: {})});return null;
}});

export const expire=internalMutation({args:{packId:v.id('packs'),startedAt:v.optional(v.number())},returns:v.null(),handler:async(ctx,{packId,startedAt})=>{
 const pack=await ctx.db.get(packId);if(startedAt!==undefined&&pack?.operationStartedAt!==startedAt)return null;
 if(pack&&pack.stage!=='Ready'&&!pack.error)await ctx.db.patch(packId,{stage:'Needs attention',error:'The writer did not finish within four minutes. Try again; your saved website is still here.',updatedAt:Date.now()});return null;
}});

export const revise=mutation({args:{token:v.string(),format:v.union(v.literal('carousel'),v.literal('static')),feedback:v.string()},returns:v.null(),handler:async(ctx,{token,format,feedback})=>{
 const userId=await getAuthUserId(ctx);if(!userId)throw new ConvexError('Connect ChatGPT to revise this post.');
 const pack=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!pack?.posts||pack.userId&&pack.userId!==userId)throw new ConvexError('This pack is not available to your connection.');
 if(pack.stage!=='Ready'&&!pack.error)throw new ConvexError('Wait for the current revision to finish.');
 if(feedback.trim().length<3||feedback.length>1000)throw new ConvexError('Give feedback between 3 and 1000 characters.');
 const startedAt=Date.now();
 await ctx.db.patch(pack._id,{userId,feedback:feedback.trim(),revisionFormat:format,stage:'Revising '+format,operationStartedAt:startedAt,error:undefined,updatedAt:Date.now()});
 await workflow.start(ctx,internal.studio.makePack,{packId:pack._id,revision:true});
 await ctx.scheduler.runAfter(240000,internal.studio.expire,{packId:pack._id,startedAt});return null;
}});
