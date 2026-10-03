import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { reelV, modeV } from './validators';
export default defineSchema({runs:defineTable({token:v.string(),transcript:v.string(),brand:v.string(),reels:v.array(reelV),mode:modeV}).index('by_token',['token'])});
