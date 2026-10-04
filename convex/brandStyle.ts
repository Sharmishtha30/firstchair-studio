export type BrandStyle={headline:'serif'|'sans';weight:number;sourceFont:string;note:string};
export function extractStyle(css:string):BrandStyle{
 const vars=new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)].map(m=>[m[1],m[2].trim()]));
 let source=css.match(/(?:h1|\.headline|\.heading)[^{]*\{[^}]*font-family\s*:\s*([^;}]+)/i)?.[1]??vars.get('--font-display')??vars.get('--font-serif')??vars.get('--font-family-heading')??css.match(/font-family\s*:\s*([^;}]+)/i)?.[1]??'';
 for(let n=0;n<5;n++){const ref=source.match(/var\((--[\w-]+)[^)]*\)/);if(!ref)break;source=source.replace(ref[0],vars.get(ref[1])??'');}
 source=source.replace(/["']/g,'').trim();if(/^(inherit|initial|unset|var\()/.test(source))source='';const serif=/georgia|times|garamond|baskerville|\bserif\b/i.test(source)&&!/sans-serif/i.test(source);
 return {headline:serif?'serif':'sans',weight:serif?400:600,sourceFont:source.slice(0,180)||'Not found',note:source?'Font family observed in public CSS. Artwork uses the matching serif/sans family with bundled Inter or Georgia; proprietary font files are not imported.':'Website fonts could not be read; bundled Inter is an explicit fallback.'};
}
