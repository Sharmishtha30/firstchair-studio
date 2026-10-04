export type Palette={paper:string;ink:string;primary:string;accent:string;note:string};
export const foundersPalette:Palette={paper:'#ffffff',ink:'#0f0f12',primary:'#ff307e',accent:'#f5c518',note:'Default colors read from Founders Find’s public website CSS. No formal brand guide was supplied.'};
export function extractPalette(css:string):Palette|undefined{
 const vars=new Map<string,string>();
 for(const root of css.matchAll(/:root(?:\s*,[^{}]+)?\s*\{([^}]+)\}/g))for(const declaration of root[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g))vars.set(declaration[1],declaration[2].trim());
 function resolve(name:string,depth=0):string|undefined{
  if(depth>8)return undefined;const value=vars.get(name);if(!value)return undefined;
  const ref=value.match(/^var\((--[\w-]+)\)$/);if(ref)return resolve(ref[1],depth+1);
  if(/^#[\da-f]{6}$/i.test(value))return value.toLowerCase();
  if(/^#[\da-f]{3}$/i.test(value))return '#'+value.slice(1).split('').map(c=>c+c).join('');return undefined;
 }
 const primary=resolve('--primary')??resolve('--color-primary');if(!primary)return undefined;
 return {primary,paper:resolve('--paper')??resolve('--background')??'#ffffff',ink:resolve('--ink')??resolve('--foreground')??'#101010',accent:resolve('--c-yellow')??primary,note:'Default colors read from the public website CSS; tone and styling are inferred, not formal brand guidelines.'};
}
