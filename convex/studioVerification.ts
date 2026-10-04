// Local CLI-only verification: never exposed through the public API.
import { internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
export const startConnected=internalMutation({args:{token:v.string()},returns:v.string(),handler:async(ctx,{token})=>{
 const connections=await ctx.db.query('chatgptConnections').take(10);
 const c=connections.find(c=>c.encrypted);if(!c)throw new Error('No connected ChatGPT plan is available for the live test.');
 const packId=await ctx.db.insert('packs',{token,url:'https://foundersfind.club/',userId:c.userId,stage:'Reading the website',createdAt:Date.now(),updatedAt:Date.now()});
 await ctx.scheduler.runAfter(0,internal.studio.makePack,{args:{packId}});return token;
}});
