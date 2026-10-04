import { mutation, query, internalMutation, internalQuery } from './_generated/server';
import { internal, components } from './_generated/api';
import { v, ConvexError } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { WorkflowManager } from '@convex-dev/workflow';
import { brandV, postV, packFields, adV, paletteV,styleV,writerRunV } from './studioTypes';
import {platformV,sourcePageV,sourceAssetV,strategyV} from './creativeTypes';
import { websiteUrl } from './websiteSafety';
const workflow=new WorkflowManager(components.workflow);
export const makePack=workflow.define({args:{packId:v.id('packs'),revision:v.optional(v.boolean()),startedAt:v.optional(v.number())},returns:v.null()}).handler(async(step,{packId,revision,startedAt}):Promise<null>=>{
  try {
    const current=await step.runQuery(internal.studio.getInternal,{packId});if(startedAt!==undefined&&current?.operationStartedAt!==startedAt)return null;
    if(!revision){await step.runAction(internal.website.inspect,{packId},{retry:false});
    await step.runAction(internal.adInspiration.inspect,{packId},{retry:false});}
    await step.runAction(internal.studioWriter.write,{packId,startedAt},{retry:false});

  } catch(e) {
    await step.runMutation(internal.studio.update,{packId,startedAt,stage:'Needs attention',error:e instanceof Error?e.message.replace(/^Uncaught (?:\w+Error|Error):\s*/, '').split(/\n\s+at /)[0].slice(0,400):'Could not finish this pack.'});
  }
  return null;
});
export const start=mutation({args:{url:v.string(),token:v.string(),platforms:v.optional(v.array(platformV))},returns:v.string(),handler:async(ctx,args):Promise<string>=>{
  if(!/^[a-f0-9]{64}$/.test(args.token))throw new ConvexError('Invalid pack link.');
  const url=websiteUrl(args.url).href;const platforms=args.platforms??['instagram','linkedin'];if(!platforms.length||new Set(platforms).size!==platforms.length)throw new ConvexError('Choose Instagram, LinkedIn or both.');
  const userId=await getAuthUserId(ctx);
  const existing=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();
  if(existing){if(existing.url===url&&existing.userId===(userId??undefined))return existing.token;throw new ConvexError('That pack link is already in use. Create a fresh pack.');}
  const startedAt=Date.now();
  const packId=await ctx.db.insert('packs',{token:args.token,url,platforms,userId:userId??undefined,stage:'Reading the website',operationStartedAt:startedAt,createdAt:Date.now(),updatedAt:Date.now()});
  await workflow.start(ctx,internal.studio.makePack,{packId,startedAt});
  await ctx.scheduler.runAfter(360000,internal.studio.expire,{packId,startedAt});return args.token;
}});
export const get=query({args:{token:v.string()},returns:v.union(v.null(),v.object({url:v.string(),stage:v.string(),updatedAt:v.number(),sourcePages:v.optional(v.array(sourcePageV)),sourceWarnings:v.optional(v.array(v.string())),platforms:v.optional(v.array(platformV)),brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string()),imageStatus:v.optional(v.string()),imageError:v.optional(v.string()),videoStatus:v.optional(v.string()),videoError:v.optional(v.string()),videoUrl:v.optional(v.string()),hasVideoTask:v.boolean(),ads:v.optional(v.array(adV)),adStatus:v.optional(v.string()),adError:v.optional(v.string())})),handler:async(ctx,{token})=>{
 const p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!p)return null;const reader=await getAuthUserId(ctx);if(p.userId&&reader!==p.userId)return null;return {url:p.url,sourcePages:p.sourcePages,sourceWarnings:p.sourceWarnings,platforms:p.platforms,stage:p.stage,updatedAt:p.updatedAt,brand:p.brand?{...p.brand,strategy:p.strategy??p.brand.strategy,assets:await Promise.all((p.sourceAssets??[]).map(async({file,...asset})=>({...asset,url:(await ctx.storage.getUrl(file))??''}))),style:{...(p.siteStyle??p.brand.style??{headline:"sans" as const,weight:600,sourceFont:"Not found",note:"Font information is missing; bundled Inter fallback."}),fontName:p.fontName,regularUrl:p.fontRegular?(await ctx.storage.getUrl(p.fontRegular))??undefined:undefined,semiboldUrl:p.fontSemibold?(await ctx.storage.getUrl(p.fontSemibold))??undefined:undefined,logoUrl:p.logoFile?(await ctx.storage.getUrl(p.logoFile))??undefined:undefined},artwork:{sceneUrl:p.sceneFile?(await ctx.storage.getUrl(p.sceneFile))??undefined:undefined,presenterUrl:p.presenterFile?(await ctx.storage.getUrl(p.presenterFile))??undefined:undefined,note:p.sceneFile&&p.presenterFile?'Original fictional images generated for this pack with Seedream.':'Shared fictional sample artwork is used for any image not yet generated.'}}:undefined,posts:p.posts?.filter(x=>x.format!=='reel'),mode:p.mode,error:p.error,imageStatus:p.imageStatus,imageError:p.imageError,videoStatus:p.videoStatus,videoError:p.videoError,videoUrl:p.videoFile?(await ctx.storage.getUrl(p.videoFile))??undefined:undefined,hasVideoTask:!!p.videoTask,ads:p.ads,adStatus:p.adStatus,adError:p.adError};
}});
export const getInternal=internalQuery({args:{packId:v.id('packs')},returns:v.union(v.null(),v.object({_id:v.id('packs'),_creationTime:v.number(),...packFields})),handler:async(ctx,{packId})=>ctx.db.get(packId)});
export const update=internalMutation({args:{packId:v.id('packs'),startedAt:v.optional(v.number()),stage:v.string(),fontName:v.optional(v.string()),fontRegular:v.optional(v.id('_storage')),fontSemibold:v.optional(v.id('_storage')),writerRun:v.optional(writerRunV),strategy:v.optional(strategyV),sourcePages:v.optional(v.array(sourcePageV)),sourceAssets:v.optional(v.array(sourceAssetV)),sourceWarnings:v.optional(v.array(v.string())),sourceText:v.optional(v.string()),sitePalette:v.optional(paletteV),siteStyle:v.optional(styleV),logoFile:v.optional(v.id('_storage')),brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string())},returns:v.null(),handler:async(ctx,{packId,startedAt,...patch})=>{
 const current=await ctx.db.get(packId);if(!current||current.error||startedAt!==undefined&&current.operationStartedAt!==startedAt)return null;
 await ctx.db.patch(packId,{...Object.fromEntries(Object.entries(patch).filter(([,x])=>x!==undefined)),updatedAt:Date.now(),...(patch.stage==='Ready'?{feedback:undefined,revisionFormat:undefined,revisionPlatform:undefined}: {})});return null;
}});

export const expire=internalMutation({args:{packId:v.id('packs'),startedAt:v.optional(v.number())},returns:v.null(),handler:async(ctx,{packId,startedAt})=>{
 const pack=await ctx.db.get(packId);if(startedAt!==undefined&&pack?.operationStartedAt!==startedAt)return null;
 if(pack&&pack.stage!=='Ready'&&!pack.error)await ctx.db.patch(packId,{stage:'Needs attention',error:'The writer did not finish within six minutes. Try again; your saved website is still here.',updatedAt:Date.now()});return null;
}});

export const revise=mutation({args:{token:v.string(),format:v.union(v.literal('carousel'),v.literal('static')),platform:v.optional(platformV),feedback:v.string()},returns:v.null(),handler:async(ctx,{token,format,platform,feedback})=>{
 const userId=await getAuthUserId(ctx);if(!userId)throw new ConvexError('Connect ChatGPT to revise this post.');
 const pack=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!pack?.posts||pack.userId&&pack.userId!==userId)throw new ConvexError('This pack is not available to your connection.');
 if(pack.stage!=='Ready'&&!pack.error)throw new ConvexError('Wait for the current revision to finish.');
 if(feedback.trim().length<3||feedback.length>1000)throw new ConvexError('Give feedback between 3 and 1000 characters.');
 const startedAt=Date.now();
 await ctx.db.patch(pack._id,{userId,previousPosts:pack.posts,feedback:feedback.trim(),revisionFormat:format,revisionPlatform:platform??'instagram',stage:'Revising '+format,operationStartedAt:startedAt,error:undefined,updatedAt:Date.now()});
 await workflow.start(ctx,internal.studio.makePack,{packId:pack._id,revision:true,startedAt});
 await ctx.scheduler.runAfter(360000,internal.studio.expire,{packId:pack._id,startedAt});return null;
}});

export const editPost=mutation({args:{token:v.string(),platform:platformV,format:v.union(v.literal('carousel'),v.literal('static')),slide:v.number(),heading:v.string(),body:v.string(),caption:v.string(),items:v.array(v.object({label:v.string(),detail:v.string()})),assetKey:v.optional(v.string()),composition:v.optional(v.union(v.literal('editorial'),v.literal('checklist'),v.literal('comparison'),v.literal('process'),v.literal('spotlight'),v.literal('image'),v.literal('closing')))},returns:v.null(),handler:async(ctx,args)=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();if(!userId||!p?.posts||p.userId!==userId)throw new ConvexError('Connect to the account that created this pack to edit it.');
 if(p.stage!=='Ready')throw new ConvexError('Wait for writing to finish.');if(args.heading.length>75||args.body.length>180||args.caption.length>2200||args.items.length>3||args.items.some(i=>i.label.length>32||i.detail.length>78))throw new ConvexError('Shorten the text to keep it readable.');
 if(args.assetKey&&!p.sourceAssets?.some(a=>a.key===args.assetKey))throw new ConvexError('Choose an image from this website.');
 const posts=p.posts.map(post=>{if(post.format!==args.format||(post.platform??'instagram')!==args.platform)return post;if(!post.frames[args.slide])throw new ConvexError('Slide not found.');return {...post,hook:args.slide===0?args.heading:post.hook,caption:args.caption,frames:post.frames.map((frame,i)=>i===args.slide?{...frame,heading:args.heading,body:args.body,items:args.items,...(args.assetKey!==undefined?{assetKey:args.assetKey}:{}),...(args.composition?{composition:args.composition}:{})}:frame)};});
 await ctx.db.patch(p._id,{previousPosts:p.posts,posts,updatedAt:Date.now(),mode:'Edited by you — new claims have not been rechecked'});return null;
}});
export const adjustBrand=mutation({args:{token:v.string(),name:v.string(),primary:v.string(),paper:v.string(),audience:v.string(),offer:v.string(),voice:v.string(),headline:v.union(v.literal('serif'),v.literal('sans'))},returns:v.null(),handler:async(ctx,args)=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();if(!userId||!p?.brand||p.userId!==userId)throw new ConvexError('Connect to the account that created this pack to adjust its brand.');if(p.stage!=='Ready')throw new ConvexError('Wait for writing to finish.');if(!/^#[a-f0-9]{6}$/i.test(args.primary)||!/^#[a-f0-9]{6}$/i.test(args.paper))throw new ConvexError('Choose valid colours.');if([args.name,args.audience,args.offer,args.voice].some(x=>!x.trim()||x.length>1000))throw new ConvexError('Complete the brand details with short descriptions.');
 const palette={paper:args.paper,ink:'#101010',primary:args.primary,accent:args.primary,note:'Brand colours corrected by you.'},style={headline:args.headline,weight:args.headline==='serif'?400:600,sourceFont:args.headline==='serif'?'Georgia':'Inter',note:'Typography corrected by you. Georgia or bundled Inter is used.'};
 await ctx.db.patch(p._id,{previousPosts:p.posts,previousBrand:p.brand,sitePalette:palette,siteStyle:style,brand:{...p.brand,name:args.name,audience:args.audience,offer:args.offer,voice:args.voice,palette,style},updatedAt:Date.now()});return null;
}});
export const restore=mutation({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();if(!userId||!p||p.userId!==userId)throw new ConvexError('This pack belongs to another account.');if(p.stage!=='Ready')throw new ConvexError('Wait for writing to finish.');if(p.previousPosts)await ctx.db.patch(p._id,{posts:p.previousPosts,brand:p.previousBrand??p.brand,sitePalette:p.previousBrand?.palette??p.sitePalette,siteStyle:p.previousBrand?.style??p.siteStyle,previousPosts:undefined,previousBrand:undefined,updatedAt:Date.now()});return null;}});
export const retry=mutation({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();if(!p||p.userId&&p.userId!==userId)throw new ConvexError('This pack is not available to your account.');if(!p.error)throw new ConvexError('This pack is already running or finished.');const startedAt=Date.now();await ctx.db.patch(p._id,{error:undefined,stage:p.sourceText?'Writing posts':'Reading website',operationStartedAt:startedAt,updatedAt:startedAt});await workflow.start(ctx,internal.studio.makePack,{packId:p._id,revision:!!p.sourceText,startedAt});await ctx.scheduler.runAfter(360000,internal.studio.expire,{packId:p._id,startedAt});return null;}});
