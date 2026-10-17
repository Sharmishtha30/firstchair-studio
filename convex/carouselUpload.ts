"use node";
import {action} from './_generated/server';
import {internal} from './_generated/api';
import {v,ConvexError} from 'convex/values';
import {getAuthUserId} from '@convex-dev/auth/server';
import {platformV} from './creativeTypes';
import {editCarousel,requireCarouselEdit,slideUploadInfo} from './carouselEdits';
export const photo=action({args:{token:v.string(),platform:platformV,slide:v.number(),version:v.number(),name:v.string(),bytes:v.bytes()},returns:v.null(),handler:async(ctx,args)=>{
 const userId=await getAuthUserId(ctx),pack=await ctx.runQuery(internal.studio.find,{token:args.token});
 try{editCarousel(requireCarouselEdit(pack,userId,args.version),args.platform,args.slide,{kind:'photo',assetKey:'pending'});}catch(e){throw new ConvexError(e instanceof Error?e.message:'Could not edit this slide.');}
 let info:ReturnType<typeof slideUploadInfo>;
 try{info=slideUploadInfo(new Uint8Array(args.bytes));}catch(e){throw new ConvexError(e instanceof Error?e.message:'Could not read this photo.');}
 const file=await ctx.storage.store(new Blob([args.bytes],{type:info.mime}));
 try{await ctx.runMutation(internal.carouselEditor.attachPhoto,{packId:pack!._id,userId:userId!,platform:args.platform,slide:args.slide,version:args.version,asset:{key:'upload-'+file,file,width:info.width,height:info.height,originalUrl:'Uploaded by you: '+args.name.slice(0,150),alt:args.name.slice(0,150),role:'uploaded slide photo',pageUrl:pack!.url}});}catch(e){await ctx.storage.delete(file);throw e;}
 return null;
}});
