import {requireContent} from './contentPolicy';
import {articleInputV,checkArticleInput} from './articleInput';
import {presentBrand} from './brandPresentation';
import {callMakingV} from './callMaking';
import {anonymizePosts} from './callPrivacy';
import {imageStyleV,validColour} from './appearance';
import {textStylesV,updateTextStyle} from './textStyles';
import {needsDirection,completeDirection,validDirectionAnswer,appendStage,recordCompletion} from './onboarding';
import { mutation, query, internalMutation, internalQuery } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { internal, components } from './_generated/api';
import { v, ConvexError } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { WorkflowManager } from '@convex-dev/workflow';
import { brandV, postV, packFields, adV, paletteV,styleV,writerRunV,checkCreativePosts,categoryV,directionAnswersV } from './studioTypes';
import {platformV,sourcePageV,sourceAssetV,strategyV} from './creativeTypes';
import {generationUnavailable} from './generationAvailability';
import { websiteUrl } from './websiteSafety';
import {copyLensV} from './copyLenses';
import {claimEdit,remainingEdits} from './editAllowance';
import {checkDesignDensity} from './creativeDensity';
import {canReadOwnedPack} from './sessionOwnership';
import {callInputV,callQuoteV,storylineV,checkCallInput,stripQuotes} from './customerCall';
const workflow=new WorkflowManager(components.workflow);
export const makePack=workflow.define({args:{packId:v.id('packs'),revision:v.optional(v.boolean()),startedAt:v.optional(v.number())},returns:v.null()}).handler(async(step,{packId,revision,startedAt}):Promise<null>=>{
  try {
    const current=await step.runQuery(internal.studio.getInternal,{packId});if(startedAt!==undefined&&current?.operationStartedAt!==startedAt)return null;
    if(current){const unavailable=generationUnavailable(current.url,current.userId);if(unavailable)throw new Error(unavailable);if(!current.userId){if(!await step.runMutation(internal.studio.finishInspection,{packId}))return null;await step.runAction(internal.studioWriter.write,{packId,startedAt},{retry:false});return null;}}
    if(!revision){await step.runAction(internal.website.inspect,{packId},{retry:false});
    if(!current?.callRequested&&!current?.article)await step.runAction(internal.adInspiration.inspect,{packId},{retry:false});
 }
 if(!await step.runMutation(internal.studio.finishInspection,{packId}))return null;
    await step.runAction(internal.studioWriter.write,{packId,startedAt},{retry:false});

  } catch(e) {
    await step.runMutation(internal.studio.update,{packId,startedAt,stage:'Needs attention',error:e instanceof Error?/abort|timed? ?out/i.test(e.message)?'The connected writer took too long. Your source evidence and any completed draft are saved; retry the failed step.':e.message.replace(/^Uncaught (?:\w+Error|Error):\s*/, '').split(/\n\s+at /)[0].slice(0,400):'Could not finish this pack.'});
  }
  return null;
});
export const start=mutation({args:{url:v.string(),token:v.string(),platforms:v.optional(v.array(platformV)),onboardingRequested:v.optional(v.boolean()),call:v.optional(callInputV),article:v.optional(articleInputV)},returns:v.string(),handler:async(ctx,args):Promise<string>=>{
  if(!/^[a-f0-9]{64}$/.test(args.token))throw new ConvexError('Invalid pack link.');
  const url=websiteUrl(args.url).href;const platforms=args.platforms??['instagram','linkedin'];if(!platforms.length||new Set(platforms).size!==platforms.length)throw new ConvexError('Choose Instagram, LinkedIn or both.');
  const userId=await getAuthUserId(ctx);
  if(!userId)throw new ConvexError('Starting your private browser session. Please try again in a moment.');
  const existing=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();
  if(existing){if(existing.url===url&&existing.userId===(userId??undefined))return existing.token;throw new ConvexError('That pack link is already in use. Create a fresh pack.');}
  const unavailable=generationUnavailable(url,userId);if(unavailable)throw new ConvexError(unavailable);
  const startedAt=Date.now();
  try{requireContent(args.call,args.article);}catch(e){throw new ConvexError((e as Error).message);}
  if(args.article&&!userId)throw new ConvexError('Connect ChatGPT before adding an article.');
  let article;try{article=args.article?checkArticleInput(args.article):undefined;}catch(e){throw new ConvexError(e instanceof Error?e.message:'Invalid article.');}
  let call:{callRequested:true;callTranscriptId:Id<'callTranscripts'>;callName:string}|undefined;
  if(args.call){
   if(!userId)throw new ConvexError('Connect ChatGPT before adding a customer call. Calls are saved only to your account.');
   let checked;try{checked=checkCallInput(args.call);}catch(e){throw new ConvexError(e instanceof Error?e.message:'This call transcript could not be read.');}
   call={callRequested:true,callName:checked.name,callTranscriptId:await ctx.db.insert('callTranscripts',{userId,name:checked.name,text:checked.text,customerSpeaker:checked.customerSpeaker,createdAt:startedAt})};
  }
  const packId=await ctx.db.insert('packs',{token:args.token,url,platforms,article,onboardingRequested:args.call||article?false:args.onboardingRequested,onboardingVersion:args.call||article?undefined:args.onboardingRequested?2:undefined,stageHistory:[{stage:'Reading the website',startedAt}],userId:userId??undefined,...call,stage:'Reading the website',operationStartedAt:startedAt,createdAt:Date.now(),updatedAt:Date.now()});
  await workflow.start(ctx,internal.studio.makePack,{packId,startedAt});
  await ctx.scheduler.runAfter(720000,internal.studio.expire,{packId,startedAt});return args.token;
}});
export const get=query({args:{token:v.string()},returns:v.union(v.null(),v.object({url:v.string(),onboardingComplete:v.boolean(),completedSteps:v.optional(v.array(v.string())),directionAnswers:v.optional(directionAnswersV),detectedCategory:v.optional(categoryV),inspectionComplete:v.boolean(),onboardingAssets:v.optional(v.array(v.object({key:v.string(),url:v.string(),alt:v.string(),role:v.string()}))),onboardingPalette:v.optional(paletteV),onboardingTitle:v.optional(v.string()),stage:v.string(),updatedAt:v.number(),editsRemaining:v.number(),downloadedAt:v.optional(v.number()),copyLens:v.optional(copyLensV),sourcePages:v.optional(v.array(sourcePageV)),sourceWarnings:v.optional(v.array(v.string())),platforms:v.optional(v.array(platformV)),brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string()),imageStatus:v.optional(v.string()),imageError:v.optional(v.string()),videoStatus:v.optional(v.string()),videoError:v.optional(v.string()),videoUrl:v.optional(v.string()),hasVideoTask:v.boolean(),ads:v.optional(v.array(adV)),adStatus:v.optional(v.string()),adError:v.optional(v.string()),callMaking:v.optional(callMakingV),call:v.optional(v.object({name:v.string(),saved:v.boolean(),deletedAt:v.optional(v.number()),read:v.optional(v.object({sentences:v.number(),chunks:v.number(),moments:v.number()})),storylines:v.optional(v.array(storylineV)),chosenId:v.optional(v.string()),siblings:v.array(v.object({token:v.string(),title:v.string()}))}))})),handler:async(ctx,{token})=>{
 const p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!p)return null;const reader=await getAuthUserId(ctx);if(!canReadOwnedPack(reader,p.userId))return null;const savedBrand=p.brand??p.draftBrand;const sourceOnly=p.mode?.startsWith('source-only-');const baseBrand=savedBrand?presentBrand(savedBrand,p):undefined;const unavailable=generationUnavailable(p.url,p.userId);return {url:p.url,onboardingComplete:!!p.callRequested||!needsDirection(p),completedSteps:p.completedSteps,directionAnswers:p.directionAnswers,detectedCategory:p.detectedCategory,inspectionComplete:!!p.inspectionCompleteAt,onboardingTitle:p.sourcePages?.[0]?.title,onboardingPalette:p.sitePalette,onboardingAssets:p.stage==='Confirm your direction'?await Promise.all((p.sourceAssets??[]).map(async a=>({key:a.key,url:(await ctx.storage.getUrl(a.file))??'',alt:a.alt,role:a.role}))):undefined,editsRemaining:remainingEdits(p.editCount),downloadedAt:p.downloadedAt,copyLens:p.copyLens,sourcePages:p.sourcePages,sourceWarnings:p.sourceWarnings,platforms:p.platforms,stage:unavailable?'Needs attention':p.stage,updatedAt:p.updatedAt,brand:baseBrand?{...baseBrand,strategy:p.strategy??baseBrand.strategy,assets:await Promise.all((p.sourceAssets??[]).map(async({file,...asset})=>({...asset,url:(await ctx.storage.getUrl(file))??''}))),style:{...(p.siteStyle??baseBrand.style??{headline:"sans" as const,weight:600,sourceFont:"Not found",note:"Font information is missing; bundled Inter fallback."}),fontName:p.fontName,regularUrl:p.fontRegular?(await ctx.storage.getUrl(p.fontRegular))??undefined:undefined,semiboldUrl:p.fontSemibold?(await ctx.storage.getUrl(p.fontSemibold))??undefined:undefined,bodyRegularUrl:p.bodyFontRegular?(await ctx.storage.getUrl(p.bodyFontRegular))??undefined:undefined,bodySemiboldUrl:p.bodyFontSemibold?(await ctx.storage.getUrl(p.bodyFontSemibold))??undefined:undefined,logoUrl:!sourceOnly&&p.logoFile?(await ctx.storage.getUrl(p.logoFile))??undefined:undefined,...(sourceOnly?{wordmarkText:undefined,wordmarkAccent:undefined}:{})},artwork:{sceneUrl:p.sceneFile?(await ctx.storage.getUrl(p.sceneFile))??undefined:undefined,presenterUrl:p.presenterFile?(await ctx.storage.getUrl(p.presenterFile))??undefined:undefined,note:p.sceneFile&&p.presenterFile?'Original fictional images generated for this pack with Seedream.':'This creative flow uses website images and original diagrams; no generated photos.'}}:undefined,posts:(p.posts??p.draftPosts)?.length&&(p.posts??p.draftPosts)!.every(x=>x.frames.length>0&&x.frames.every(f=>f.heading.trim()||f.body.trim()||f.items?.some(item=>item.detail.trim())))?(p.posts??p.draftPosts)?.filter(x=>x.format!=='reel'):undefined,mode:p.mode,error:unavailable??p.error,imageStatus:p.imageStatus,imageError:p.imageError,videoStatus:p.videoStatus,videoError:p.videoError,videoUrl:p.videoFile?(await ctx.storage.getUrl(p.videoFile))??undefined:undefined,hasVideoTask:!!p.videoTask,ads:p.ads,adStatus:p.adStatus,adError:p.adError,callMaking:p.callMaking,call:p.callRequested?{name:p.callName??'Customer call',saved:!!p.callTranscriptId,deletedAt:p.callDeletedAt,read:p.callRead,storylines:p.callStorylines,chosenId:p.callStorylineId,siblings:p.callTranscriptId&&p.userId?(await ctx.db.query('packs').withIndex('by_call',q=>q.eq('callTranscriptId',p.callTranscriptId)).collect()).filter(x=>x.userId===p.userId&&x.callStorylineId).map(x=>({token:x.token,title:x.callStorylines?.find(st=>st.id===x.callStorylineId)?.title??'Story'})):[]}:undefined};
}});
export const getInternal=internalQuery({args:{packId:v.id('packs')},returns:v.union(v.null(),v.object({_id:v.id('packs'),_creationTime:v.number(),...packFields})),handler:async(ctx,{packId})=>ctx.db.get(packId)});
export const update=internalMutation({args:{packId:v.id('packs'),startedAt:v.optional(v.number()),resetFonts:v.optional(v.boolean()),resetLogo:v.optional(v.boolean()),stage:v.string(),completedStep:v.optional(v.union(v.literal('call'),v.literal('website'),v.literal('colours'),v.literal('assets'),v.literal('plan'),v.literal('drafts'),v.literal('review'))),detectedCategory:v.optional(categoryV),draftPosts:v.optional(v.array(postV)),draftBrand:v.optional(brandV),fontName:v.optional(v.string()),fontRegular:v.optional(v.id('_storage')),fontSemibold:v.optional(v.id('_storage')),bodyFontRegular:v.optional(v.id('_storage')),bodyFontSemibold:v.optional(v.id('_storage')),writerRun:v.optional(writerRunV),strategy:v.optional(strategyV),sourcePages:v.optional(v.array(sourcePageV)),sourceAssets:v.optional(v.array(sourceAssetV)),sourceWarnings:v.optional(v.array(v.string())),sourceText:v.optional(v.string()),sitePalette:v.optional(paletteV),siteStyle:v.optional(styleV),logoFile:v.optional(v.id('_storage')),brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string()),callMaking:v.optional(callMakingV),callQuotes:v.optional(v.array(callQuoteV)),callStorylines:v.optional(v.array(storylineV)),callRead:v.optional(v.object({sentences:v.number(),chunks:v.number(),moments:v.number()}))},returns:v.null(),handler:async(ctx,{packId,startedAt,resetFonts,resetLogo,completedStep,...patch})=>{
 const current=await ctx.db.get(packId);if(!current||current.error||startedAt!==undefined&&current.operationStartedAt!==startedAt)return null;
 const now=Date.now();
 await ctx.db.patch(packId,{completedSteps:recordCompletion(current.completedSteps,completedStep),stageHistory:appendStage(current.stageHistory,patch.stage,now),...(patch.stage==='Ready'&&!current.firstReadyAt?{firstReadyAt:now}:{}),...Object.fromEntries(Object.entries(patch).filter(([,x])=>x!==undefined)),updatedAt:Date.now(),...(resetLogo?{logoFile:undefined}:{}),...(resetFonts?{fontName:undefined,fontRegular:undefined,fontSemibold:undefined,bodyFontRegular:undefined,bodyFontSemibold:undefined}:{}),...(patch.stage==='Ready'?{error:undefined,feedback:undefined,revisionFormat:undefined,revisionPlatform:undefined}: {})});return null;
}});

export const expire=internalMutation({args:{packId:v.id('packs'),startedAt:v.optional(v.number())},returns:v.null(),handler:async(ctx,{packId,startedAt})=>{
 const pack=await ctx.db.get(packId);if(startedAt!==undefined&&pack?.operationStartedAt!==startedAt)return null;
 if(pack&&pack.stage!=='Ready'&&pack.stage!=='Confirm your direction'&&pack.stage!=='Choose your story'&&!pack.error)await ctx.db.patch(packId,{stage:'Needs attention',error:'The writer did not finish within twelve minutes. Try again; your saved website is still here.',updatedAt:Date.now()});return null;
}});

export const revise=mutation({args:{token:v.string(),format:v.union(v.literal('carousel'),v.literal('static')),platform:v.optional(platformV),feedback:v.string()},returns:v.null(),handler:async(ctx,{token,format,platform,feedback})=>{
 const userId=await getAuthUserId(ctx);if(!userId)throw new ConvexError('Connect ChatGPT to revise this post.');
 const pack=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 const savedPosts=pack?.posts??pack?.draftPosts;
 if(!savedPosts||!canReadOwnedPack(userId,pack!.userId))throw new ConvexError('This pack is not available to your connection.');
 if(pack!.stage!=='Ready'&&!pack!.error)throw new ConvexError('Wait for the current revision to finish.');
 if(feedback.trim().length<3||feedback.length>1000)throw new ConvexError('Give feedback between 3 and 1000 characters.');
 const editCount=claimEdit(pack!.editCount);
 const startedAt=Date.now();
 await ctx.db.patch(pack!._id,{userId,editCount,posts:savedPosts,brand:pack!.brand??pack!.draftBrand,previousPosts:savedPosts,previousBrand:undefined,completedSteps:pack!.completedSteps?.filter(s=>s!=='drafts'&&s!=='review'),feedback:feedback.trim(),revisionFormat:format,revisionPlatform:platform??'instagram',stage:'Revising '+format,operationStartedAt:startedAt,error:undefined,updatedAt:Date.now()});
 await workflow.start(ctx,internal.studio.makePack,{packId:pack!._id,revision:true,startedAt});
 await ctx.scheduler.runAfter(720000,internal.studio.expire,{packId:pack!._id,startedAt});return null;
}});

export const editPost=mutation({args:{token:v.string(),platform:platformV,format:v.union(v.literal('carousel'),v.literal('static')),slide:v.number(),takeaway:v.optional(v.string()),heading:v.string(),body:v.string(),caption:v.string(),items:v.array(v.object({label:v.string(),detail:v.string()})),assetKey:v.optional(v.string()),composition:v.optional(v.union(v.literal('editorial'),v.literal('checklist'),v.literal('comparison'),v.literal('process'),v.literal('spotlight'),v.literal('image'),v.literal('closing')))},returns:v.null(),handler:async(ctx,args)=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();if(!userId||!p?.posts||p.userId!==userId)throw new ConvexError('Connect to the account that created this pack to edit it.');
 if(p.stage!=='Ready')throw new ConvexError('Wait for writing to finish.');if(!args.heading.trim()&&(args.slide===0||!args.body.trim()&&!args.items.some(item=>item.detail.trim())))throw new ConvexError('Add a headline before saving. Your edit is still available.');if(args.heading.length>160||args.body.length>600||args.caption.length>2200||args.items.length>5||args.items.some(i=>i.label.length>100||i.detail.length>240)||args.takeaway&&args.takeaway.length>200)throw new ConvexError('Shorten the text to keep it readable.');
 if(args.assetKey&&!p.sourceAssets?.some(a=>a.key===args.assetKey))throw new ConvexError('Choose an image from this website.');
 let posts=p.posts.map(post=>{if(post.format!==args.format||(post.platform??'instagram')!==args.platform)return post;if(!post.frames[args.slide])throw new ConvexError('Slide not found.');return {...post,hook:args.slide===0?args.heading:post.hook,caption:args.caption,frames:post.frames.map((frame,i)=>i===args.slide?{...frame,heading:args.heading,body:args.body,items:args.items,...(frame.design?{design:{...frame.design,takeaway:args.takeaway??frame.design.takeaway,...(args.assetKey&&args.assetKey!==frame.assetKey?{layout:frame.design.layout==='product'?'product' as const:'photo' as const,imagePosition:'bottom' as const}:args.assetKey===''&&(frame.design.layout==='photo'||frame.design.layout==='product')?{layout:'essay' as const}:{})}}:{}),...(args.assetKey!==undefined?{assetKey:args.assetKey}:{}),...(args.composition?{composition:args.composition}:{})}:frame)};});
 if(p.callRequested)posts=anonymizePosts(posts,p.posts.flatMap(post=>post.frames.flatMap(f=>f.quote?[f.quote]:[])));
 try{checkCreativePosts(posts,p.brand?.facts??p.posts.flatMap(post=>post.sourceFacts),[...new Set(posts.map(post=>post.platform??'instagram'))],(p.sourceAssets??[]).map(a=>a.key));
 checkDesignDensity(posts,{story:!!p.callRequested});}catch(e){throw new ConvexError(e instanceof Error?e.message:'This edit does not fit the creative. Shorten it and try again.');}
 await ctx.db.patch(p._id,{editCount:claimEdit(p.editCount),previousPosts:p.posts,previousBrand:undefined,posts,updatedAt:Date.now(),mode:'Edited by you — new claims have not been rechecked'});return null;
}});
export const adjustBrand=mutation({args:{token:v.string(),name:v.string(),primary:v.string(),paper:v.string(),audience:v.string(),offer:v.string(),voice:v.string(),headline:v.union(v.literal('serif'),v.literal('sans'))},returns:v.null(),handler:async(ctx,args)=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();if(!userId||!p?.brand||p.userId!==userId)throw new ConvexError('Connect to the account that created this pack to adjust its brand.');if(p.stage!=='Ready')throw new ConvexError('Wait for writing to finish.');if(!/^#[a-f0-9]{6}$/i.test(args.primary)||!/^#[a-f0-9]{6}$/i.test(args.paper))throw new ConvexError('Choose valid colours.');if([args.name,args.audience,args.offer,args.voice].some(x=>!x.trim()||x.length>1000))throw new ConvexError('Complete the brand details with short descriptions.');
 const palette={paper:args.paper,ink:'#101010',primary:args.primary,accent:args.primary,note:'Brand colours corrected by you.'},style={headline:args.headline,weight:args.headline==='serif'?400:600,sourceFont:args.headline==='serif'?'Georgia':'Inter',note:'Typography corrected by you. Georgia or bundled Inter is used.'};
 await ctx.db.patch(p._id,{editCount:claimEdit(p.editCount),previousPosts:p.posts,previousBrand:p.brand,previousLogoFile:p.logoFile,previousSiteStyle:p.siteStyle,previousSitePalette:p.sitePalette,previousFontName:p.fontName,previousFontRegular:p.fontRegular,previousFontSemibold:p.fontSemibold,previousBodyFontRegular:p.bodyFontRegular,previousBodyFontSemibold:p.bodyFontSemibold,fontName:undefined,fontRegular:undefined,fontSemibold:undefined,bodyFontRegular:undefined,bodyFontSemibold:undefined,sitePalette:palette,siteStyle:style,brand:{...p.brand,name:args.name,audience:args.audience,offer:args.offer,voice:args.voice,palette,style},updatedAt:Date.now()});return null;
}});
export const restore=mutation({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();if(!userId||!p||p.userId!==userId)throw new ConvexError('This pack belongs to another account.');if(p.stage!=='Ready')throw new ConvexError('Wait for writing to finish.');if(p.previousPosts)await ctx.db.patch(p._id,{posts:p.previousPosts,brand:p.previousBrand??p.brand,sitePalette:p.previousSitePalette??p.previousBrand?.palette??p.sitePalette,siteStyle:p.previousSiteStyle??p.previousBrand?.style??p.siteStyle,...(p.previousBrand?{logoFile:p.previousLogoFile,fontName:p.previousFontName,fontRegular:p.previousFontRegular,fontSemibold:p.previousFontSemibold,bodyFontRegular:p.previousBodyFontRegular,bodyFontSemibold:p.previousBodyFontSemibold}:{}),previousPosts:undefined,previousBrand:undefined,updatedAt:Date.now()});return null;}});
export const retry=mutation({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();if(!p||!canReadOwnedPack(userId,p.userId))throw new ConvexError('This pack is not available to your account.');const unavailable=generationUnavailable(p.url,p.userId);if(unavailable)throw new ConvexError(unavailable);if(!p.error)throw new ConvexError('This pack is already running or finished.');const startedAt=Date.now();await ctx.db.patch(p._id,{error:undefined,stage:p.sourceText?'Writing posts':'Reading website',operationStartedAt:startedAt,updatedAt:startedAt});await workflow.start(ctx,internal.studio.makePack,{packId:p._id,revision:!!p.sourceText&&(!(p.article||p.callRequested)||!!p.sitePalette?.observed?.includes(p.sitePalette.primary)&&!!p.sitePalette?.observed?.includes(p.sitePalette.accent)),startedAt});await ctx.scheduler.runAfter(720000,internal.studio.expire,{packId:p._id,startedAt});return null;}});
export const find=internalQuery({args:{token:v.string()},returns:v.union(v.null(),v.object({_id:v.id('packs'),_creationTime:v.number(),...packFields})),handler:async(ctx,{token})=>ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique()});
export const uploadUrl=mutation({args:{token:v.string()},returns:v.string(),handler:async(ctx,{token})=>{const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();if(!userId||p?.userId!==userId)throw new ConvexError('Connect to the account that created this pack to upload a brand asset.');claimEdit(p.editCount);return ctx.storage.generateUploadUrl();}});
export const attachAsset=internalMutation({args:{packId:v.id('packs'),asset:sourceAssetV,role:v.union(v.literal('logo'),v.literal('photo'))},returns:v.null(),handler:async(ctx,{packId,asset,role})=>{const p=await ctx.db.get(packId);if(!p)return null;const editCount=claimEdit(p.editCount);if(role==='logo')await ctx.db.patch(packId,{editCount,previousPosts:p.posts,previousBrand:p.brand,previousLogoFile:p.logoFile,previousSiteStyle:p.siteStyle,previousSitePalette:p.sitePalette,previousFontName:p.fontName,previousFontRegular:p.fontRegular,previousFontSemibold:p.fontSemibold,previousBodyFontRegular:p.bodyFontRegular,previousBodyFontSemibold:p.bodyFontSemibold,logoFile:asset.file,updatedAt:Date.now()});else{const sourceAssets=[...(p.sourceAssets??[]),asset];if(sourceAssets.length>8)throw new ConvexError('Use at most eight images in this pack.');await ctx.db.patch(packId,{editCount,sourceAssets,updatedAt:Date.now()});}return null;}});
export const useProvidedText=mutation({args:{token:v.string(),text:v.string()},returns:v.null(),handler:async(ctx,{token,text})=>{const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();if(!userId||p?.userId!==userId)throw new ConvexError('Connect to the account that created this pack.');if(p.article||p.callRequested)throw new ConvexError('Website text cannot replace your content. Retry styling or use another website with the same article or transcript.');if(!p.error)throw new ConvexError('Use this recovery step after website reading fails.');if(text.trim().length<200||text.length>24000)throw new ConvexError('Paste 200–24,000 characters describing the business, customer, offer and action.');const startedAt=Date.now(),sourceText=text.trim();await ctx.db.patch(p._id,{sourceText,inputMethod:'provided',sourcePages:[{url:p.url,title:'Business text provided by you',retrievedAt:startedAt,blocks:[{kind:'provided',text:sourceText}]}],sourceWarnings:['This pack uses your pasted business text in place of website analysis.'],strategy:undefined,draftPosts:undefined,draftBrand:undefined,posts:undefined,brand:undefined,error:undefined,stage:'Understanding customers',operationStartedAt:startedAt,updatedAt:startedAt});await workflow.start(ctx,internal.studio.makePack,{packId:p._id,revision:true,startedAt});await ctx.scheduler.runAfter(720000,internal.studio.expire,{packId:p._id,startedAt});return null;}});

export const recordDownload=mutation({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!userId||!p||p.userId!==userId)throw new ConvexError('Connect to the account that created this pack.');
 if(p.stage!=='Ready'||!p.posts)throw new ConvexError('Wait for your pack to finish.');
 // Client reports completed file preparation; this does not prove the file was saved by the user.
 await ctx.db.patch(p._id,{downloadedAt:p.downloadedAt??Date.now()});return null;
}});
export const createPerspective=mutation({args:{token:v.string(),newToken:v.string(),lens:copyLensV},returns:v.string(),handler:async(ctx,{token,newToken,lens})=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!userId||!p||p.userId!==userId)throw new ConvexError('Connect to the account that created this pack.');
 if(p.stage!=='Ready'||!p.downloadedAt||!p.sourceText)throw new ConvexError('Download your first pack before choosing another perspective.');
 if(lens==='auto')throw new ConvexError('Choose a perspective.');
 if(!/^[a-f0-9]{64}$/.test(newToken)||await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',newToken)).unique())throw new ConvexError('Create a fresh pack link.');
 const startedAt=Date.now();
 const packId=await ctx.db.insert('packs',{token:newToken,parentToken:token,url:p.url,userId,article:p.article,callRequested:p.callRequested,callTranscriptId:p.callTranscriptId,callName:p.callName,platforms:p.platforms,copyLens:lens,editCount:0,onboarding:p.onboarding,inputMethod:p.inputMethod,sourceText:p.sourceText,sourcePages:p.sourcePages,sourceAssets:p.sourceAssets,sourceWarnings:p.sourceWarnings,sitePalette:p.sitePalette,siteStyle:p.siteStyle,logoFile:p.logoFile,fontName:p.fontName,fontRegular:p.fontRegular,fontSemibold:p.fontSemibold,bodyFontRegular:p.bodyFontRegular,bodyFontSemibold:p.bodyFontSemibold,stage:'Choosing a new perspective',operationStartedAt:startedAt,createdAt:startedAt,updatedAt:startedAt});
 await workflow.start(ctx,internal.studio.makePack,{packId,revision:true,startedAt});
 await ctx.scheduler.runAfter(720000,internal.studio.expire,{packId,startedAt});return newToken;
}});

export const confirmDirection=mutation({args:{token:v.string(),primary:v.optional(v.string()),paper:v.optional(v.string()),focus:v.string(),audience:v.string(),tone:v.string(),goal:v.union(v.literal('understand'),v.literal('enquire'),v.literal('buy'))},returns:v.null(),handler:async(ctx,{token,...onboarding})=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!p||!canReadOwnedPack(userId,p.userId))throw new ConvexError('This pack is not available to your account.');
 if(p.onboardingVersion===2)throw new ConvexError('Please finish all five questions.');
 if(p.onboarding||p.stage==='Ready'||p.error)throw new ConvexError('This direction has already been confirmed.');
 if(Object.values(onboarding).some(x=>x!==undefined&&x.length>600))throw new ConvexError('Keep each answer under 600 characters.');
 if([onboarding.primary,onboarding.paper].some(c=>c!==undefined&&!/^#[a-f0-9]{6}$/i.test(c)))throw new ConvexError('Choose a valid colour.');
 const palette=p.sitePalette?{...p.sitePalette,...(onboarding.primary?{primary:onboarding.primary}:{}),...(onboarding.paper?{paper:onboarding.paper}:{}),note:p.sitePalette.note+' User confirmed onboarding colours.'}:undefined;
 if(p.stage!=='Confirm your direction'){await ctx.db.patch(p._id,{onboarding,updatedAt:Date.now()});return null;}
 const startedAt=Date.now();await ctx.db.patch(p._id,{onboarding,...(palette?{sitePalette:palette}:{}),stage:'Writing posts',operationStartedAt:startedAt,updatedAt:startedAt});
 await workflow.start(ctx,internal.studio.makePack,{packId:p._id,revision:true,startedAt});await ctx.scheduler.runAfter(720000,internal.studio.expire,{packId:p._id,startedAt});return null;
}});

export const finishInspection=internalMutation({args:{packId:v.id('packs')},returns:v.boolean(),handler:async(ctx,{packId})=>{
 const p=await ctx.db.get(packId);if(!p||p.error)return false;const now=Date.now();
 if(!p.callRequested&&!p.article&&needsDirection(p)){await ctx.db.patch(packId,{inspectionCompleteAt:p.inspectionCompleteAt??now,stage:'Confirm your direction',stageHistory:appendStage(p.stageHistory,'Confirm your direction',now),updatedAt:now});return false;}
 await ctx.db.patch(packId,{inspectionCompleteAt:p.inspectionCompleteAt??now});return true;
}});

export const saveDirectionAnswer=mutation({args:{token:v.string(),key:v.union(v.literal('goal'),v.literal('focus'),v.literal('category'),v.literal('topic'),v.literal('tone'),v.literal('promotion')),value:v.string()},returns:v.null(),handler:async(ctx,{token,key,value})=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!p||!canReadOwnedPack(userId,p.userId))throw new ConvexError('This pack is not available to your account.');
 if(!p.onboardingRequested||p.onboarding||p.stage==='Ready'||p.error)throw new ConvexError('This direction cannot be changed now.');
 value=value.trim();if(!validDirectionAnswer(key,value))throw new ConvexError('Choose an answer or enter up to 600 characters.');
 const answers={...p.directionAnswers,[key]:value} as NonNullable<typeof p.directionAnswers>;
 const now=Date.now();
 const inspectionComplete=p.inspectionCompleteAt??(p.stage==='Confirm your direction'?now:undefined);
 if(!completeDirection(answers)){await ctx.db.patch(p._id,{onboardingVersion:2,inspectionCompleteAt:inspectionComplete,directionAnswers:answers,updatedAt:now});return null;}
 const onboarding={goal:answers.goal as 'understand'|'enquire'|'buy',focus:answers.focus!,category:answers.category!,topic:answers.topic!,tone:answers.tone!,...(answers.promotion?{promotion:answers.promotion}:{}),audience:''};
 await ctx.db.patch(p._id,{onboardingVersion:2,inspectionCompleteAt:inspectionComplete,directionAnswers:answers,onboarding,answersSavedAt:now,updatedAt:now});
 // The mutation and finishInspection serialize: exactly one side starts writing.
 if(inspectionComplete){await ctx.db.patch(p._id,{stage:'Preparing writer',stageHistory:appendStage(p.stageHistory,'Preparing writer',now),operationStartedAt:now});await workflow.start(ctx,internal.studio.makePack,{packId:p._id,revision:true,startedAt:now});await ctx.scheduler.runAfter(720000,internal.studio.expire,{packId:p._id,startedAt:now});}
 return null;
}});

// Internal support view: narrowly scoped to a requested website, no account or token data.
export const generationDiagnostics=internalQuery({args:{url:v.string()},handler:async(ctx,{url})=>{
 const host=new URL(url).hostname.replace(/^www\./,'');const rows=await ctx.db.query('packs').filter(q=>q.or(q.eq(q.field('url'),'https://'+host),q.eq(q.field('url'),'https://'+host+'/'),q.eq(q.field('url'),'https://www.'+host),q.eq(q.field('url'),'https://www.'+host+'/'))).collect();
 return rows.sort((a,b)=>b.createdAt-a.createdAt).slice(0,10).map(p=>({website:host,createdAt:p.createdAt,operationStartedAt:p.operationStartedAt,updatedAt:p.updatedAt,stage:p.stage,error:p.error,writerRun:p.writerRun,posts:(p.posts??p.draftPosts)?.map(post=>({format:post.format,frames:post.frames.map(f=>({heading:f.heading,body:f.body,assetKey:f.assetKey}))}))}));
}});

export const styleText=mutation({args:{token:v.string(),platform:platformV,format:v.union(v.literal('carousel'),v.literal('static')),slide:v.number(),styles:textStylesV},returns:v.null(),handler:async(ctx,args)=>{
 const userId=await getAuthUserId(ctx),pack=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();
 if(!userId||!pack?.posts||pack.userId!==userId)throw new ConvexError('Connect to the account that created this pack to style it.');
 if(pack.stage!=='Ready')throw new ConvexError('Wait for writing to finish.');
 try{let posts=pack.posts;if(!args.styles.heading&&!args.styles.body)throw new Error('Choose a text style.');for(const field of ['heading','body'] as const){const style=args.styles[field];if(style)posts=updateTextStyle(posts,{...args,field,style});}await ctx.db.patch(pack._id,{posts,updatedAt:Date.now()});}catch(e){throw new ConvexError(e instanceof Error?e.message:'Could not save text style.');}
 return null;
}});

export const styleAppearance=mutation({args:{token:v.string(),platform:platformV,format:v.union(v.literal('carousel'),v.literal('static')),slide:v.number(),colour:v.optional(v.object({field:v.union(v.literal('heading'),v.literal('body')),value:v.string()})),image:v.optional(imageStyleV)},returns:v.null(),handler:async(ctx,args)=>{
 const userId=await getAuthUserId(ctx),pack=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();
 if(!userId||!pack?.posts||pack.userId!==userId)throw new ConvexError('Connect to the account that created this pack to style it.');
 if(pack.stage!=='Ready')throw new ConvexError('Wait for writing to finish.');
 if(!Number.isInteger(args.slide)||args.slide<0)throw new ConvexError('Slide not found.');
 if(!args.colour&&!args.image||args.colour&&!validColour(args.colour.value))throw new ConvexError('Choose a valid colour or image size.');
 let found=false;
 const posts=pack.posts.map(post=>{if(post.format!==args.format||(post.platform??'instagram')!==args.platform)return post;
 const frame=post.frames[args.slide];if(!frame)throw new ConvexError('Slide not found.');if(args.image&&!frame.assetKey)throw new ConvexError('This slide has no image to resize.');found=true;
 return {...post,frames:post.frames.map((f,i)=>i===args.slide?{...f,...(args.colour?{textColours:{...f.textColours,[args.colour.field]:args.colour.value.toLowerCase()}}:{}),...(args.image?{imageStyle:args.image}:{})}:f)};});
 if(!found)throw new ConvexError('Creative not found.');
 await ctx.db.patch(pack._id,{posts,updatedAt:Date.now()});return null;
}});

// Writer-only read: the transcript text never leaves the backend through a public query.
export const callTranscript=internalQuery({args:{packId:v.id('packs')},returns:v.union(v.null(),v.object({text:v.string(),customerSpeaker:v.optional(v.string())})),handler:async(ctx,{packId})=>{
 const p=await ctx.db.get(packId);if(!p?.callTranscriptId||!p.userId)return null;
 const t=await ctx.db.get(p.callTranscriptId);if(!t||t.userId!==p.userId)return null;
 return {text:t.text,customerSpeaker:t.customerSpeaker};
}});

export const deleteCall=mutation({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!userId||!p||p.userId!==userId)throw new ConvexError('Connect to the account that added this call to delete it.');
 await removeCall(ctx,p,userId);return null;
}});
export async function removeCall(ctx:MutationCtx,p:Doc<'packs'>,userId:Id<'users'>){
 if(!p.callRequested||p.callDeletedAt)throw new ConvexError('No customer call is saved for this pack.');
 // Every storyline pack from this call shares the transcript, so all of them lose it together.
 const siblings=p.callTranscriptId?(await ctx.db.query('packs').withIndex('by_call',q=>q.eq('callTranscriptId',p.callTranscriptId)).collect()).filter(x=>x.userId===userId):[p];
 if(p.callTranscriptId){const t=await ctx.db.get(p.callTranscriptId);if(t&&t.userId===userId)await ctx.db.delete(t._id);}
 const now=Date.now();
 for(const x of siblings.some(x=>x._id===p._id)?siblings:[...siblings,p]){
  const running=x.stage!=='Ready'&&!x.error&&x.stage!=='Choose your story';
  // A changed operation and an error stop any writer still holding call lines in memory.
  await ctx.db.patch(x._id,{callTranscriptId:undefined,callMaking:undefined,callQuotes:undefined,callStory:undefined,callStorylines:undefined,callDeletedAt:now,posts:stripQuotes(x.posts),draftPosts:stripQuotes(x.draftPosts),previousPosts:stripQuotes(x.previousPosts),updatedAt:now,
   ...(running||x.stage==='Choose your story'?{stage:'Needs attention',operationStartedAt:now,error:running?'You deleted the customer call while posts were being written, so writing stopped. No posts were made from your website alone.':'You deleted the customer call before choosing a story, so no posts were made.'}:{})});
 }
}

// The founder picks one or more storylines. The first is written in this pack; each extra one gets its own pack with the same website evidence.
export const chooseStorylines=mutation({args:{token:v.string(),ids:v.array(v.string()),newTokens:v.array(v.string())},returns:v.array(v.string()),handler:async(ctx,{token,ids,newTokens})=>{
 const userId=await getAuthUserId(ctx),p=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique();
 if(!userId||!p||p.userId!==userId)throw new ConvexError('Connect to the account that added this call to choose its stories.');
 return startStorylines(ctx,p,ids,newTokens);
}});
export async function startStorylines(ctx:MutationCtx,p:Doc<'packs'>,ids:string[],newTokens:string[]){
 const token=p.token;
 if(p.stage!=='Choose your story'||p.error||!p.callStorylines?.length||!p.callTranscriptId)throw new ConvexError('These stories cannot be chosen now.');
 const picked=[...new Set(ids)];
 if(!picked.length||picked.some(id=>!p.callStorylines!.some(s=>s.id===id)))throw new ConvexError('Choose at least one story from the list.');
 if(newTokens.length!==picked.length-1||newTokens.some(t=>!/^[a-f0-9]{64}$/.test(t)))throw new ConvexError('Invalid pack link.');
 const now=Date.now(),tokens=[token];
 const {_id,_creationTime,token:_t,posts,draftPosts,previousPosts,previousBrand,brand,strategy,writerRun,mode,error,editCount,downloadedAt,parentToken,...shared}=p;
 for(const [i,id] of picked.entries()){
  let packId=p._id;
  if(i===0)await ctx.db.patch(p._id,{callStorylineId:id,stage:'Preparing writer',stageHistory:appendStage(p.stageHistory,'Preparing writer',now),operationStartedAt:now,updatedAt:now});
  else{
   if(await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',newTokens[i-1])).unique())throw new ConvexError('That pack link is already in use.');
   packId=await ctx.db.insert('packs',{...shared,token:newTokens[i-1],parentToken:token,callStorylineId:id,stage:'Preparing writer',stageHistory:[{stage:'Preparing writer',startedAt:now}],operationStartedAt:now,createdAt:now,updatedAt:now});
   tokens.push(newTokens[i-1]);
  }
  await workflow.start(ctx,internal.studio.makePack,{packId,revision:true,startedAt:now});
  await ctx.scheduler.runAfter(720000,internal.studio.expire,{packId,startedAt:now});
 }
 return tokens;
}
