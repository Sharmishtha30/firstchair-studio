import {v} from 'convex/values';
export const fontChoices=['brand','Inter','DM Sans','Manrope','Montserrat','Lora'] as const;
export const sizePresets=['S','M','L','XL'] as const;
export type TextFont=typeof fontChoices[number];
export type TextSize=typeof sizePresets[number];
export type TextField='heading'|'body';
export type TextStyle={font:TextFont;size:TextSize};
export type TextStyles=Partial<Record<TextField,TextStyle>>;
export const textStyleV=v.object({font:v.union(v.literal('brand'),v.literal('Inter'),v.literal('DM Sans'),v.literal('Manrope'),v.literal('Montserrat'),v.literal('Lora')),size:v.union(v.literal('S'),v.literal('M'),v.literal('L'),v.literal('XL'))});
export const textStylesV=v.object({heading:v.optional(textStyleV),body:v.optional(textStyleV)});
export const textPixels={heading:{S:64,M:80,L:104,XL:136},body:{S:40,M:44,L:52,XL:64}};
// Largest combined preset first; never enlarge either requested size.
export function fittingCandidates(styles:TextStyles):TextStyles[]{
 const options=(field:TextField)=>(styles[field]?sizePresets.slice(0,sizePresets.indexOf(styles[field]!.size)+1).reverse().map(size=>({...styles[field]!,size})):[undefined]);
 return options('heading').flatMap(heading=>options('body').map(body=>({...(heading?{heading}:{}),...(body?{body}:{})}))).sort((a,b)=>score(b)-score(a));
}
function score(s:TextStyles){return (s.heading?sizePresets.indexOf(s.heading.size):0)+(s.body?sizePresets.indexOf(s.body.size):0);}
export function updateTextStyle<T extends {format:string;platform?:string;frames:{textStyles?:TextStyles}[]}>(posts:T[],args:{format:string;platform:string;slide:number;field:TextField;style:TextStyle}):T[]{
 if(!Number.isInteger(args.slide)||args.slide<0)throw new Error('Slide not found.');
 let found=false;
 const updated=posts.map(post=>{if(post.format!==args.format||(post.platform??'instagram')!==args.platform)return post;
 if(!post.frames[args.slide])throw new Error('Slide not found.');found=true;
 return {...post,frames:post.frames.map((frame,i)=>i===args.slide?{...frame,textStyles:{...frame.textStyles,[args.field]:args.style}}:frame)};});
 if(!found)throw new Error('Creative not found.');return updated;
}
