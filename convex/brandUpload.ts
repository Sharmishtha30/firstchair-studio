"use node";
import {action} from './_generated/server';
import {internal} from './_generated/api';
import {v,ConvexError} from 'convex/values';
import {getAuthUserId} from '@convex-dev/auth/server';
import {imageInfo} from './websiteAssets';
export const finish=action({args:{token:v.string(),file:v.id('_storage'),name:v.string(),role:v.union(v.literal('photo'),v.literal('logo'))},returns:v.null(),handler:async(ctx,args)=>{
 const userId=await getAuthUserId(ctx),p=await ctx.runQuery(internal.studio.find,{token:args.token});if(!userId||p?.userId!==userId)throw new ConvexError('Connect to the account that created this pack.');
 const blob=await ctx.storage.get(args.file);if(!blob||blob.size>2_000_000)throw new ConvexError('Upload a PNG, JPEG or WebP under 2 MB.');const info=imageInfo(new Uint8Array(await blob.arrayBuffer()));if(!info||info.width>6000||info.height>6000||info.width<(args.role==='logo'?64:500)||info.height<(args.role==='logo'?32:300))throw new ConvexError('The image could not be read or is too small. Use a larger PNG, JPEG or WebP.');
 await ctx.runMutation(internal.studio.attachAsset,{packId:p._id,role:args.role,asset:{key:'upload-'+args.file,file:args.file,width:info.width,height:info.height,originalUrl:'Uploaded by you: '+args.name.slice(0,150),alt:args.name.slice(0,150),role:args.role==='logo'?'uploaded logo':'uploaded brand photo',pageUrl:p.url}});return null;
}});
