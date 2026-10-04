import { v } from "convex/values";
export const frameV = v.object({ heading: v.string(), body: v.string() });
export const postV = v.object({
  format: v.union(v.literal("carousel"), v.literal("static"), v.literal("reel")),
  hook: v.string(), pain: v.string(), emotion: v.string(),
  frames: v.array(frameV), caption: v.string(), altText: v.string(),
  sourceFacts: v.array(v.string()),
});
export const paletteV=v.object({paper:v.string(),ink:v.string(),primary:v.string(),accent:v.string(),note:v.string()});
export const brandV = v.object({ name: v.string(), audience: v.string(), offer: v.string(), voice: v.string(), facts: v.array(v.string()), sourceUrl: v.string(), palette:v.optional(paletteV) });
export type Frame = {heading:string; body:string};
export type Post = {format:"carousel"|"static"|"reel"; hook:string; pain:string; emotion:string; frames:Frame[]; caption:string; altText:string; sourceFacts:string[]};
export type Brand = {name:string; audience:string; offer:string; voice:string; facts:string[]; sourceUrl:string;palette?:import('./brandPalette').Palette};
export function checkPosts(posts:Post[], facts:string[]) {
  if(posts.length!==3 || new Set(posts.map(p=>p.format)).size!==3) throw new Error("The writer must finish all three formats.");
  for(const p of posts) {
    if(/^(hi|hello|welcome|hey)\b/i.test(p.hook.trim()))throw new Error('The hook is a greeting, not an audience insight.');
    if(p.frames.some(f=>!f.body.trim()||/\b(puts|provides|offers|gives|with|and|or|to|the|a|an|your|because|at|for|from|in|on|of)\s*[.!?]?$/i.test(f.body.trim())))throw new Error('The writer left an unfinished line. Finish every on-screen sentence.');
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
export const packFields={
 token:v.string(),userId:v.optional(v.id('users')),url:v.string(),stage:v.string(),operationStartedAt:v.optional(v.number()),createdAt:v.number(),updatedAt:v.number(),
 brand:v.optional(brandV),posts:v.optional(v.array(postV)),mode:v.optional(v.string()),error:v.optional(v.string()),sourceText:v.optional(v.string()),sitePalette:v.optional(paletteV),
 feedback:v.optional(v.string()),revisionFormat:v.optional(v.union(v.literal('carousel'),v.literal('static'),v.literal('reel'))),
 videoStatus:v.optional(v.string()),videoError:v.optional(v.string()),videoTask:v.optional(v.string()),videoFile:v.optional(v.id('_storage')),
 ads:v.optional(v.array(adV)),adStatus:v.optional(v.string()),adError:v.optional(v.string()),
};
