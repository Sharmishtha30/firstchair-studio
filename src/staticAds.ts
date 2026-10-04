import type {Brand,Post} from '../convex/studioTypes';
import {renderArtwork} from './artwork';
export type StaticLayout='headline'|'comparison'|'note';
export function drawStaticAd(post:Post,brand:Brand,layout:StaticLayout=post.layout??'headline'){return renderArtwork(post,brand,0,layout);}
