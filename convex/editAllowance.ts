import {ConvexError} from 'convex/values';
export function remainingEdits(count=0){return Math.max(0,1-count);}
export function claimEdit(count=0){if(!remainingEdits(count))throw new ConvexError('Your one edit for this pack has been used. Download it, then create a new perspective.');return count+1;}
