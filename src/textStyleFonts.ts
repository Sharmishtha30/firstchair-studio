import type {TextFont} from '../convex/textStyles';
const cache=new Map<string,Promise<string>>();
export function editorFont(font:Exclude<TextFont,'brand'>){
 const family='Creative '+font;
 let promise=cache.get(font);
 if(!promise){promise=(async()=>{await Promise.all([400,600].map(async weight=>{const slug=font.toLowerCase().replaceAll(' ','-');const face=new FontFace(family,`url(/fonts/${slug}-${weight}.${font==='Inter'?'woff2':'ttf'})`,{weight:String(weight)});await face.load();document.fonts.add(face);}));return `"${family}"`;})();cache.set(font,promise);promise.catch(()=>cache.delete(font));}
 return promise;
}
