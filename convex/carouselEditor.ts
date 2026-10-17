import {mutation,internalMutation} from './_generated/server';
import {v,ConvexError} from 'convex/values';
import {getAuthUserId} from '@convex-dev/auth/server';
import {platformV,sourceAssetV} from './creativeTypes';
import {editCarousel,requireCarouselEdit} from './carouselEdits';
const target={token:v.string(),platform:platformV,slide:v.number(),version:v.number()};
export const edit=mutation({args:{...target,change:v.union(v.object({kind:v.literal('delete')}),v.object({kind:v.literal('number'),number:v.number()}))},returns:v.null(),handler:async(ctx,args)=>{
 const pack=await ctx.db.query('packs').withIndex('by_token',q=>q.eq('token',args.token)).unique();
 try{const posts=editCarousel(requireCarouselEdit(pack,await getAuthUserId(ctx),args.version),args.platform,args.slide,args.change);
 await ctx.db.patch(pack!._id,{posts,previousPosts:pack!.posts,previousBrand:undefined,updatedAt:Date.now()});}catch(e){throw new ConvexError(e instanceof Error?e.message:'Could not edit this slide.');}return null;
}});
export const attachPhoto=internalMutation({args:{packId:v.id('packs'),userId:v.id('users'),platform:platformV,slide:v.number(),version:v.number(),asset:sourceAssetV},returns:v.null(),handler:async(ctx,args)=>{
 const pack=await ctx.db.get(args.packId);
 try{const posts=editCarousel(requireCarouselEdit(pack,args.userId,args.version),args.platform,args.slide,{kind:'photo',assetKey:args.asset.key});
 await ctx.db.patch(args.packId,{posts,sourceAssets:[...(pack!.sourceAssets??[]),args.asset],previousPosts:pack!.posts,previousBrand:undefined,updatedAt:Date.now()});}catch(e){throw new ConvexError(e instanceof Error?e.message:'Could not save this photo.');}return null;
}});
