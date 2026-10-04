import { v } from "convex/values";
import {platformV,compositionV,itemV,sourcePageV,sourceAssetV,clientAssetV,strategyV} from "./creativeTypes";
export const styleV=v.object({bodyFont:v.optional(v.string()),fontName:v.optional(v.string()),regularUrl:v.optional(v.string()),semiboldUrl:v.optional(v.string()),headline:v.union(v.literal('serif'),v.literal('sans')),weight:v.number(),sourceFont:v.string(),note:v.string(),logoUrl:v.optional(v.string())});
export const frameV = v.object({ heading: v.string(), body: v.string(),composition:v.optional(compositionV),items:v.optional(v.array(itemV)),assetKey:v.optional(v.string()),eyebrow:v.optional(v.string()) });
export const postV = v.object({
  format: v.union(v.literal("carousel"), v.literal("static"), v.literal("reel")),
  platform:v.optional(platformV),destination:v.optional(v.string()),documentTitle:v.optional(v.string()),
  hook: v.string(), pain: v.string(), emotion: v.string(),
  frames: v.array(frameV), caption: v.string(), altText: v.string(),
  sourceFacts: v.array(v.string()),layout:v.optional(v.union(v.literal("headline"),v.literal("comparison"),v.literal("note"))),
});
export const paletteV=v.object({paper:v.string(),ink:v.string(),primary:v.string(),accent:v.string(),note:v.string()});
export const artworkV=v.object({sceneUrl:v.optional(v.string()),presenterUrl:v.optional(v.string()),note:v.string()});
export const brandV = v.object({ name: v.string(), audience: v.string(), offer: v.string(), voice: v.string(), facts: v.array(v.string()), sourceUrl: v.string(), palette:v.optional(paletteV),artwork:v.optional(artworkV),style:v.optional(styleV),assets:v.optional(v.array(clientAssetV)),strategy:v.optional(strategyV) });
export type Frame = {heading:string; body:string;composition?:import("./creativeTypes").Composition;items?:{label:string;detail:string}[];assetKey?:string;eyebrow?:string};
export type Post = {format:"carousel"|"static"|"reel"; platform?:import("./creativeTypes").Platform;destination?:string;documentTitle?:string;hook:string; pain:string; emotion:string; frames:Frame[]; caption:string; altText:string; sourceFacts:string[];layout?:"headline"|"comparison"|"note"};
export type Brand = {assets?:import("./creativeTypes").CreativeAsset[];strategy?:{customer:string;situation:string;market:string;mechanism:string;action:string;destination:string;imageStyle:string;angles:{idea:string;usefulInsight:string;hooks:string[];evidence:string[]}[];chosenAngles:string[];note:string};name:string; audience:string; offer:string; voice:string; facts:string[]; sourceUrl:string;style?:import('./brandStyle').BrandStyle & {logoUrl?:string};artwork?:{sceneUrl?:string;presenterUrl?:string;note:string};palette?:import('./brandPalette').Palette};
export function checkPosts(posts:Post[], facts:string[],count=3) {
  if(posts.length!==count || new Set(posts.map(p=>p.format)).size!==count || count===2&&posts.some(p=>p.format==='reel')) throw new Error("The writer must finish each requested format exactly once.");
  for(const p of posts) {
    if(/^(hi|hello|welcome|hey)\b/i.test(p.hook.trim()))throw new Error('The hook is a greeting, not an audience insight.');
    if(p.frames.some(f=>!f.body.trim()||/\b(puts|provides|offers|gives|and|or|the|a|an|your|because)\s*[.!?]?$/i.test(f.body.trim())))throw new Error('The writer left an unfinished line. Finish every on-screen sentence.');
    if(p.caption.length>2200)throw new Error('The caption exceeds Instagram’s character limit.');
    if(p.hook.trim().split(/\s+/).length>8 || p.hook.length>65) throw new Error("The hook is too long. Keep it under eight words.");
    if(!p.sourceFacts.length || p.sourceFacts.some(f=>!facts.includes(f))) throw new Error("The writer used an unsupported source fact.");
    const expected=p.format==='carousel'?5:p.format==='static'?1:5;
    if(p.frames.length!==expected) throw new Error("The writer returned the wrong number of frames.");
    if(p.frames.some(f=>/\b(?:visual|voiceover|camera|scene)\s*:|\d+\s*[–-]\s*\d+\s*s\s*\|/i.test(f.heading+' '+f.body)))throw new Error('The writer returned production directions instead of finished on-screen copy.');
    if(p.frames[0].heading.replace(/\s+/g,' ').trim()!==p.hook.replace(/\s+/g,' ').trim())throw new Error('The first frame does not match the short hook.');
    if(p.format==='reel'&&p.frames.map(f=>f.heading+' '+f.body).join(' ').split(/\s+/).length>100)throw new Error('The reel has too much text for 25 seconds.');
    if(p.format==='reel'&&p.frames.some(f=>f.body.length>140))throw new Error('The reel scene copy is too long for the video.');
    if(p.frames.some(f=>f.heading.length>75 || f.body.length>220)) throw new Error("The copy is too long to fit the artwork.");
  }
  return posts;
}

export const adV=v.object({id:v.string(),pageName:v.string(),body:v.string(),snapshotUrl:v.string()});
export const writerRunV=v.object({provider:v.string(),model:v.string(),requests:v.number(),durationMs:v.number(),review:v.string(),usageNote:v.string()});
export const packFields={
 draftPosts:v.optional(v.array(postV)),draftBrand:v.optional(brandV),
 writerRun:v.optional(writerRunV),fontName:v.optional(v.string()),fontRegular:v.optional(v.id('_storage')),fontSemibold:v.optional(v.id('_storage')),
 platforms:v.optional(v.array(platformV)),sourcePages:v.optional(v.array(sourcePageV)),sourceAssets:v.optional(v.array(sourceAssetV)),sourceWarnings:v.optional(v.array(v.string())),strategy:v.optional(strategyV),revisionPlatform:v.optional(platformV),previousPosts:v.optional(v.array(postV)),previousBrand:v.optional(brandV),previousLogoFile:v.optional(v.id('_storage')),previousSiteStyle:v.optional(styleV),previousSitePalette:v.optional(paletteV),previousFontName:v.optional(v.string()),previousFontRegular:v.optional(v.id('_storage')),previousFontSemibold:v.optional(v.id('_storage')),
 inputMethod:v.optional(v.union(v.literal('website'),v.literal('provided'))),
 token:v.string(),userId:v.optional(v.id('users')),url:v.string(),stage:v.string(),operationStartedAt:v.optional(v.number()),createdAt:v.number(),updatedAt:v.number(),
 brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string()),sourceText:v.optional(v.string()),sitePalette:v.optional(paletteV),siteStyle:v.optional(styleV),logoFile:v.optional(v.id('_storage')),
 feedback:v.optional(v.string()),revisionFormat:v.optional(v.union(v.literal('carousel'),v.literal('static'),v.literal('reel'))),
 videoStatus:v.optional(v.string()),videoError:v.optional(v.string()),videoTask:v.optional(v.string()),videoFile:v.optional(v.id('_storage')),
 imageStatus:v.optional(v.string()),imageError:v.optional(v.string()),imageStartedAt:v.optional(v.number()),sceneFile:v.optional(v.id('_storage')),presenterFile:v.optional(v.id('_storage')),
 ads:v.optional(v.array(adV)),adStatus:v.optional(v.string()),adError:v.optional(v.string()),
};

export function checkCreativePosts(posts:Post[],facts:string[],platforms:import('./creativeTypes').Platform[],assetKeys:string[]=[]){
 if(posts.length!==platforms.length*2)throw new Error('Finish the carousel and static for each selected platform.');
 for(const platform of platforms)checkPosts(posts.filter(p=>(p.platform??'instagram')===platform),facts,2);
 for(const p of posts){
  if(!p.destination||!/^https?:\/\//.test(p.destination))throw new Error('Every post needs a real destination.');
  if(/unlock your potential|elevate your|game.changer|take .+ to the next level/i.test(p.hook))throw new Error('Replace the generic promise with a specific customer situation.');
  if(p.format==='carousel'&&new Set(p.frames.map(f=>f.composition)).size<3)throw new Error('Vary the carousel pace with at least three purposeful compositions.');
  for(const f of p.frames){
   if(!f.composition)throw new Error('Each slide needs a designed composition.');
   if(f.assetKey&&!assetKeys.includes(f.assetKey))throw new Error('An image reference does not belong to this website.');
   if(f.composition==='image'&&!f.assetKey)throw new Error('An image layout needs a verified website image.');
   if(['checklist','comparison','process'].includes(f.composition)&&(!f.items||f.items.length<2||f.items.length>3))throw new Error('This visual needs two or three useful items.');
   if(f.items?.some(i=>i.label.length>32||i.detail.length>78))throw new Error('Rewrite long visual labels and details for phone readability.');
  }
 }
 return posts;
}
