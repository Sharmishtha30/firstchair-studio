import {internalMutation} from './_generated/server';
import {v} from 'convex/values';
import {adV} from './studioTypes';
export const save=internalMutation({args:{packId:v.id('packs'),ads:v.array(adV),status:v.string(),error:v.optional(v.string())},returns:v.null(),handler:async(ctx,{packId,ads,status,error})=>{await ctx.db.patch(packId,{ads,adStatus:status,adError:error});return null;}});
