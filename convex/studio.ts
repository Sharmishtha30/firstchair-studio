import { mutation, query, internalMutation, internalQuery } from './_generated/server';
import { internal, components } from './_generated/api';
import { v, ConvexError } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { WorkflowManager } from '@convex-dev/workflow';
import { brandV, postV } from './studioTypes';
import { websiteUrl } from './websiteSafety';
const workflow=new WorkflowManager(components.workflow);
export const makePack=workflow.define({args:{packId:v.id('packs')},returns:v.null()}).handler(async(step,{packId}):Promise<null>=>{
  try {
    await step.runAction(internal.website.inspect,{packId},{retry:false});
    await step.runAction(internal.studioWriter.write,{packId},{retry:false});
  } catch(e) {
    await step.runMutation(internal.studio.update,{packId,stage:'Needs attention',error:e instanceof Error?e.message.slice(0,400):'Could not finish this pack.'});
  }
  return null;
});
export const start=mutation({args:{url:v.string(),token:v.string()},returns:v.string(),handler:async(ctx,args):Promise<string>=>{
  if(!/^[a-f0-9]{64}$/.test(args.token))throw new ConvexError('Invalid pack link.');
  const url=websiteUrl(args.url).href;
  const userId=await getAuthUserId(ctx);
  const packId=await ctx.db.insert('packs',{token:args.token,url,userId:userId??undefined,stage:'Reading the website',createdAt:Date.now(),updatedAt:Date.now()});
  await workflow.start(ctx,internal.studio.makePack,{packId});return args.token;
}});
export const get=query({args:{token:v.string()},returns:v.union(v.null(),v.object({url:v.string(),stage:v.string(),updatedAt:v.number(),brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string())})),handler:async(ctx,{token})=>{
 const p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!p)return null;return {url:p.url,stage:p.stage,updatedAt:p.updatedAt,brand:p.brand,posts:p.posts,mode:p.mode,error:p.error};
}});
export const getInternal=internalQuery({args:{packId:v.id('packs')},handler:async(ctx,{packId})=>ctx.db.get(packId)});
export const update=internalMutation({args:{packId:v.id('packs'),stage:v.string(),sourceText:v.optional(v.string()),brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string())},returns:v.null(),handler:async(ctx,{packId,...patch})=>{
 await ctx.db.patch(packId,{...Object.fromEntries(Object.entries(patch).filter(([,x])=>x!==undefined)),updatedAt:Date.now()});return null;
}});
