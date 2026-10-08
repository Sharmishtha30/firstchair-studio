import {textPixels,type TextStyles,type TextField} from '../convex/textStyles';
export const styledContexts=new WeakMap<CanvasRenderingContext2D,{styles:TextStyles;fonts:Partial<Record<TextField,string>>}>();
export const fittedStyles=new WeakMap<HTMLCanvasElement,TextStyles>();
export function textOverride(ctx:CanvasRenderingContext2D,field?:TextField){
 if(!field)return;const active=styledContexts.get(ctx),style=active?.styles[field];
 if(style)return {size:textPixels[field][style.size],font:active!.fonts[field],weight:field==='heading'?600:400};
}
