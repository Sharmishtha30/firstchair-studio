import {articleInputV} from './articleInput';
import {callMakingV} from './callMaking';
import { v } from "convex/values";
import {copyLensV} from "./copyLenses";
import {platformV,compositionV,designV,itemV,sourcePageV,sourceAssetV,clientAssetV,strategyV} from "./creativeTypes";
export const styleV=v.object({wordmarkText:v.optional(v.string()),wordmarkAccent:v.optional(v.string()),headingEmphasis:v.optional(v.boolean()),layoutMotif:v.optional(v.union(v.literal('split'),v.literal('centered'),v.literal('image-led'),v.literal('editorial'),v.literal('unknown'))),imagePosition:v.optional(v.union(v.literal('top'),v.literal('bottom'))),layoutEvidence:v.optional(v.string()),imageShape:v.optional(v.union(v.literal('circle'),v.literal('rounded'),v.literal('square'))),actionRadius:v.optional(v.number()),cardRadius:v.optional(v.number()),bodyFont:v.optional(v.string()),fontName:v.optional(v.string()),regularUrl:v.optional(v.string()),semiboldUrl:v.optional(v.string()),bodyRegularUrl:v.optional(v.string()),bodySemiboldUrl:v.optional(v.string()),headline:v.union(v.literal('serif'),v.literal('sans')),weight:v.number(),sourceFont:v.string(),note:v.string(),logoUrl:v.optional(v.string())});
import {textStylesV,type TextStyles} from "./textStyles";
import {callQuoteV,callStoryV,storylineV,type CallQuote} from "./customerCall";
import {imageStyleV,textColoursV,type ImageStyle,type TextColours} from "./appearance";
import {lookV,brandLookV,type Look} from "./brandLook";
export const frameV = v.object({imageStyle:v.optional(imageStyleV),textColours:v.optional(textColoursV), textStyles:v.optional(textStylesV), heading: v.string(), body: v.string(),design:v.optional(designV),composition:v.optional(compositionV),items:v.optional(v.array(itemV)),assetKey:v.optional(v.string()),look:v.optional(lookV),eyebrow:v.optional(v.string()),quote:v.optional(callQuoteV),unclear:v.optional(v.boolean()),weakHandoff:v.optional(v.boolean()) });
export const postV = v.object({
 sourceKind:v.optional(v.union(v.literal("article"),v.literal("website"),v.literal("call"))),
  format: v.union(v.literal("carousel"), v.literal("static"), v.literal("reel")),
  platform:v.optional(platformV),destination:v.optional(v.string()),documentTitle:v.optional(v.string()),
  hook: v.string(), pain: v.string(), emotion: v.string(),
  frames: v.array(frameV), caption: v.string(), altText: v.string(),
  sourceFacts: v.array(v.string()),layout:v.optional(v.union(v.literal("headline"),v.literal("comparison"),v.literal("note"))),
});
export const paletteV=v.object({paper:v.string(),ink:v.string(),primary:v.string(),accent:v.string(),note:v.string(),observed:v.optional(v.array(v.string()))});
export const artworkV=v.object({sceneUrl:v.optional(v.string()),presenterUrl:v.optional(v.string()),note:v.string()});
export const brandV = v.object({ name: v.string(), audience: v.string(), offer: v.string(), voice: v.string(), facts: v.array(v.string()), sourceUrl: v.string(), palette:v.optional(paletteV),artwork:v.optional(artworkV),style:v.optional(styleV),assets:v.optional(v.array(clientAssetV)),strategy:v.optional(strategyV) });
export type Frame = {imageStyle?:ImageStyle;textColours?:TextColours;textStyles?:TextStyles;heading:string; body:string;design?:import("./creativeTypes").CreativeDesign;composition?:import("./creativeTypes").Composition;items?:{label:string;detail:string}[];assetKey?:string;look?:Look;eyebrow?:string;quote?:CallQuote;unclear?:boolean;weakHandoff?:boolean};
export type Post = {sourceKind?:"article"|"website"|"call";format:"carousel"|"static"|"reel"; platform?:import("./creativeTypes").Platform;destination?:string;documentTitle?:string;hook:string; pain:string; emotion:string; frames:Frame[]; caption:string; altText:string; sourceFacts:string[];layout?:"headline"|"comparison"|"note"};
export type Brand = {assets?:import("./creativeTypes").CreativeAsset[];strategy?:{category?:string;visualPriority?:'product'|'service'|'editorial';customer:string;situation:string;market:string;mechanism:string;action:string;destination:string;imageStyle:string;angles:{idea:string;usefulInsight:string;hooks:string[];evidence:string[]}[];chosenAngles:string[];note:string};name:string; audience:string; offer:string; voice:string; facts:string[]; sourceUrl:string;style?:import('./brandStyle').BrandStyle & {logoUrl?:string};artwork?:{sceneUrl?:string;presenterUrl?:string;note:string};palette?:import('./brandPalette').Palette};
export function checkPosts(posts:Post[], facts:string[],count=3,callEvidence:readonly {id:string;text:string}[]=[]) {
  if(posts.length!==count || new Set(posts.map(p=>p.format)).size!==count || count===2&&posts.some(p=>p.format==='reel')) throw new Error("The writer must finish each requested format exactly once.");
  for(const p of posts) {
    if(/^(hi|hello|welcome|hey)\b/i.test(p.hook.trim()))throw new Error('The hook is a greeting, not an audience insight.');
    if(p.frames.some(f=>/\b(puts|provides|offers|gives)\s*[.!?]?$/i.test(f.body.trim())))throw new Error('The writer left an unfinished line. Finish every on-screen sentence.');
  if(p.frames.some((f,i)=>!f.heading.trim()&&(!(p.sourceKind==='article'||p.sourceKind==='call'||p.sourceKind==='website')||i===0||!f.body.trim()&&!f.items?.some(item=>item.detail.trim()))))throw new Error('Every slide needs a meaningful headline.');
    if(p.caption.length>2200)throw new Error('The caption exceeds Instagram’s character limit.');
    if(p.hook.length>120) throw new Error("The opening is too long for a social creative. Shorten it without losing the idea.");
    const groundedCall=p.frames.length>0&&p.frames.every(frame=>frame.quote&&callEvidence.some(q=>q.id===frame.quote!.id&&q.text===frame.quote!.text));
    if((!p.sourceFacts.length&&!groundedCall) || p.sourceFacts.some(f=>!facts.includes(f))) throw new Error("The writer used an unsupported source fact.");
    const expected=p.format==='carousel'?5:p.format==='static'?1:5;
    if(p.format==='carousel'?(p.frames.length<(p.sourceKind==='article'||p.sourceKind==='call'||p.sourceKind==='website'?2:3)||p.frames.length>(p.sourceKind==='article'||p.sourceKind==='call'||p.sourceKind==='website'||p.frames.some(f=>f.quote)?8:7)):p.frames.length!==expected) throw new Error("The writer returned the wrong number of frames.");
    if(p.frames.some(f=>/\b(?:visual|voiceover|camera|scene)\s*:|\d+\s*[–-]\s*\d+\s*s\s*\|/i.test(f.heading+' '+f.body)))throw new Error('The writer returned production directions instead of finished on-screen copy.');
    if(p.frames[0].heading.replace(/\s+/g,' ').trim()!==p.hook.replace(/\s+/g,' ').trim())throw new Error('The first frame does not match the short hook.');
    if(p.format==='reel'&&p.frames.map(f=>f.heading+' '+f.body).join(' ').split(/\s+/).length>100)throw new Error('The reel has too much text for 25 seconds.');
    if(p.format==='reel'&&p.frames.some(f=>f.body.length>140))throw new Error('The reel scene copy is too long for the video.');
    if(p.frames.some(f=>f.heading.length>160 || f.body.length>600)) throw new Error("The copy is too long to fit the artwork.");
  }
  return posts;
}

export const adV=v.object({id:v.string(),pageName:v.string(),body:v.string(),snapshotUrl:v.string()});
export const writerRunV=v.object({provider:v.string(),model:v.string(),requests:v.number(),durationMs:v.number(),review:v.string(),usageNote:v.string()});
export const categoryV=v.union(v.literal('D2C brand'),v.literal('Education'),v.literal('Health and wellness'),v.literal('SaaS'),v.literal('Consumer tech and wearables'),v.literal('Services or agency'),v.literal('Food and beverage'),v.literal('Fashion and beauty'),v.literal('Finance'),v.literal('Other'));
export const directionAnswersV=v.object({goal:v.optional(v.string()),focus:v.optional(v.string()),category:v.optional(categoryV),topic:v.optional(v.string()),tone:v.optional(v.string()),promotion:v.optional(v.string())});
export const stageHistoryV=v.array(v.object({stage:v.string(),startedAt:v.number()}));
export const packFields={
 article:v.optional(articleInputV),
 completedSteps:v.optional(v.array(v.string())),onboardingVersion:v.optional(v.number()),directionAnswers:v.optional(directionAnswersV),detectedCategory:v.optional(categoryV),answersSavedAt:v.optional(v.number()),inspectionCompleteAt:v.optional(v.number()),firstReadyAt:v.optional(v.number()),stageHistory:v.optional(stageHistoryV),
 onboardingRequested:v.optional(v.boolean()),websiteOnlyRequested:v.optional(v.boolean()),onboarding:v.optional(v.object({primary:v.optional(v.string()),paper:v.optional(v.string()),focus:v.string(),audience:v.string(),tone:v.string(),category:v.optional(categoryV),topic:v.optional(v.string()),promotion:v.optional(v.string()),goal:v.union(v.literal("understand"),v.literal("enquire"),v.literal("buy"))})),
 editCount:v.optional(v.number()),downloadedAt:v.optional(v.number()),copyLens:v.optional(copyLensV),parentToken:v.optional(v.string()),
 draftPosts:v.optional(v.array(postV)),draftBrand:v.optional(brandV),
 writerRun:v.optional(writerRunV),brandLook:v.optional(brandLookV),logoColours:v.optional(v.array(v.string())),fontName:v.optional(v.string()),fontRegular:v.optional(v.id('_storage')),fontSemibold:v.optional(v.id('_storage')),bodyFontRegular:v.optional(v.id('_storage')),bodyFontSemibold:v.optional(v.id('_storage')),
 platforms:v.optional(v.array(platformV)),sourcePages:v.optional(v.array(sourcePageV)),sourceAssets:v.optional(v.array(sourceAssetV)),sourceWarnings:v.optional(v.array(v.string())),strategy:v.optional(strategyV),revisionPlatform:v.optional(platformV),previousPosts:v.optional(v.array(postV)),previousBrand:v.optional(brandV),previousLogoFile:v.optional(v.id('_storage')),previousSiteStyle:v.optional(styleV),previousSitePalette:v.optional(paletteV),previousFontName:v.optional(v.string()),previousFontRegular:v.optional(v.id('_storage')),previousFontSemibold:v.optional(v.id('_storage')),previousBodyFontRegular:v.optional(v.id('_storage')),previousBodyFontSemibold:v.optional(v.id('_storage')),
 inputMethod:v.optional(v.union(v.literal('website'),v.literal('provided'))),
 callMaking:v.optional(callMakingV),callRequested:v.optional(v.boolean()),callTranscriptId:v.optional(v.id('callTranscripts')),callName:v.optional(v.string()),callQuotes:v.optional(v.array(callQuoteV)),callStory:v.optional(callStoryV),callStorylines:v.optional(v.array(storylineV)),callStorylineId:v.optional(v.string()),callRead:v.optional(v.object({sentences:v.number(),chunks:v.number(),moments:v.number()})),callDeletedAt:v.optional(v.number()),
 token:v.string(),userId:v.optional(v.id('users')),url:v.string(),stage:v.string(),operationStartedAt:v.optional(v.number()),createdAt:v.number(),updatedAt:v.number(),
 brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string()),sourceText:v.optional(v.string()),sitePalette:v.optional(paletteV),siteStyle:v.optional(styleV),logoFile:v.optional(v.id('_storage')),
 feedback:v.optional(v.string()),revisionFormat:v.optional(v.union(v.literal('carousel'),v.literal('static'),v.literal('reel'))),
 videoStatus:v.optional(v.string()),videoError:v.optional(v.string()),videoTask:v.optional(v.string()),videoFile:v.optional(v.id('_storage')),
 imageStatus:v.optional(v.string()),imageError:v.optional(v.string()),imageStartedAt:v.optional(v.number()),sceneFile:v.optional(v.id('_storage')),presenterFile:v.optional(v.id('_storage')),
 ads:v.optional(v.array(adV)),adStatus:v.optional(v.string()),adError:v.optional(v.string()),
};

export function checkCreativePosts(posts:Post[],facts:string[],platforms:import('./creativeTypes').Platform[],assetKeys:string[]=[],callEvidence:readonly {id:string;text:string}[]=[]){
 if(posts.length!==platforms.length*2)throw new Error('Finish the carousel and static for each selected platform.');
 for(const platform of platforms)checkPosts(posts.filter(p=>(p.platform??'instagram')===platform),facts,2,callEvidence);
 for(const p of posts){
  if(p.sourceKind!=='article'&&p.sourceKind!=='call'&&p.sourceKind!=='website'&&(!p.destination||!/^https?:\/\//.test(p.destination)))throw new Error('Every post needs a real destination.');
  if(/unlock your potential|elevate your|game.changer|take .+ to the next level/i.test(p.hook))throw new Error('Replace the generic promise with a specific customer situation.');
  for(const f of p.frames){
   if(!f.composition)throw new Error('Each slide needs a designed composition.');
   if(f.assetKey&&!assetKeys.includes(f.assetKey))throw new Error('An image reference does not belong to this website.');
   if((!f.design&&f.composition==='image'||f.design?.layout==='photo')&&!f.assetKey)throw new Error('An image layout needs a verified website image.');
   if((!f.design&&['checklist','comparison','process'].includes(f.composition)||f.design?.layout==='list')&&(!f.items?.length||f.items.length>5))throw new Error('This visual needs useful items that fit the space.');
   if((!f.design&&f.composition==='comparison'||f.design?.layout==='split'&&!f.assetKey&&!!f.items?.length)&&f.items?.length!==2)throw new Error('A two-column comparison needs two sides.');
   if(f.items?.some(i=>i.label.length>100||i.detail.length>240))throw new Error('Rewrite long visual labels and details for phone readability.');
  }
 }
 return posts;
}
