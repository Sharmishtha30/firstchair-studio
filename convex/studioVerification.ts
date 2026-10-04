// Local CLI-only verification: never exposed through the public API.
import { internalMutation, internalAction, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
export const startConnected=internalMutation({args:{token:v.string()},returns:v.string(),handler:async(ctx,{token})=>{
 const connections=await ctx.db.query('chatgptConnections').take(10);
 const c=connections.find(c=>c.encrypted);if(!c)throw new Error('No connected ChatGPT plan is available for the live test.');
 const packId=await ctx.db.insert('packs',{token,url:'https://foundersfind.club/',userId:c.userId,stage:'Reading the website',operationStartedAt:Date.now(),createdAt:Date.now(),updatedAt:Date.now()});
 await ctx.scheduler.runAfter(0,internal.studio.makePack,{args:{packId}});await ctx.scheduler.runAfter(140000,internal.studio.expire,{packId,startedAt:Date.now()});return token;
}});
// Creates a short-lived first-party test session using an already-approved plan.
// The provider credential stays encrypted and is never returned to the test browser.
export const ticket=internalMutation({args:{ticketHash:v.string(),browserHash:v.string()},returns:v.null(),handler:async(ctx,args)=>{
 const connections=await ctx.db.query('chatgptConnections').take(10);const c=connections.find(c=>c.encrypted);
 if(!c)throw new Error('No existing ChatGPT connection is available for live verification.');
 await ctx.db.insert('chatgptTickets',{...args,userId:c.userId,expiresAt:Date.now()+60000});return null;
}});

export const locate=internalQuery({args:{token:v.string()},returns:v.union(v.null(),v.id('packs')),handler:async(ctx,{token})=>(await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',token)).unique())?._id??null});
export const refreshPalette=internalAction({args:{token:v.string()},returns:v.null(),handler:async(ctx,{token})=>{
 const packId=await ctx.runQuery(internal.studioVerification.locate,{token});if(!packId)throw new Error('Pack not found.');
 const original=await ctx.runQuery(internal.studio.getInternal,{packId});if(original?.stage!=='Ready')throw new Error('Only a completed pack can be used for palette verification.');
 await ctx.runAction(internal.website.inspect,{packId});const p=await ctx.runQuery(internal.studio.getInternal,{packId});
 if(!p?.brand||!p.sitePalette)throw new Error('Website palette could not be extracted.');
 await ctx.runMutation(internal.studio.update,{packId,stage:'Ready',brand:{...p.brand,palette:p.sitePalette}});return null;
}});
export const deadlineFixture=internalMutation({args:{token:v.string()},returns:v.id('packs'),handler:async(ctx,{token})=>ctx.db.insert('packs',{token,url:'https://example.com/',stage:'Writing carousel, static and reel',operationStartedAt:100,createdAt:Date.now(),updatedAt:Date.now()})});
// Temporary media fixtures prove Convex storage and browser canvas access, not AI generation.
export const imageUploadFixture=internalMutation({args:{},returns:v.string(),handler:async(ctx)=>ctx.storage.generateUploadUrl()});
export const imageUrlFixture=internalQuery({args:{file:v.id('_storage')},returns:v.union(v.string(),v.null()),handler:async(ctx,{file})=>ctx.storage.getUrl(file)});
export const removeImageFixture=internalMutation({args:{file:v.id('_storage')},returns:v.null(),handler:async(ctx,{file})=>{await ctx.storage.delete(file);return null;}});
