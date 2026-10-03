import { v } from 'convex/values';
export const reelV = v.object({title:v.string(),script:v.array(v.string()),onScreen:v.array(v.string()),caption:v.string(),sources:v.array(v.string())});
export const modeV = v.union(v.literal('sample'),v.literal('ai'));
