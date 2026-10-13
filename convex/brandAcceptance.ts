import type {Palette} from './brandPalette';
export function requireBrandEvidence(palette:Palette|undefined){
 if(!palette||!palette.observed?.includes(palette.primary)||!palette.observed.includes(palette.accent))throw Error('Website colour evidence is missing. Retry website styling before generating; your article or transcript is preserved.');
}
export function contrast(a:string,b:string){const l=(hex:string)=>hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);const x=l(a),y=l(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function readableBrandInk(palette:Palette){return contrast(palette.primary,palette.paper)>=4.5?palette.primary:contrast(palette.ink,palette.paper)>=4.5?palette.ink:contrast('#101010',palette.paper)>=4.5?'#101010':'#ffffff';}
