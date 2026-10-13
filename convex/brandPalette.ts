export type Palette={paper:string;ink:string;primary:string;accent:string;note:string;observed?:string[]};
export const foundersPalette:Palette={paper:'#ffffff',ink:'#0f0f12',primary:'#ff307e',accent:'#f5c518',note:'Default colors read from Founders Find’s public website CSS. No formal brand guide was supplied.'};
export function extractPalette(css:string,usedClasses:string[]=[],matchedColours?:string[],roles:{paper?:string;ink?:string;primary?:string}={}):Palette|undefined{
 const vars=new Map<string,string>();
 for(const root of css.matchAll(/:root(?:\s*,[^{}]+)?\s*\{([^}]+)\}/g))for(const declaration of root[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g))if(!vars.has(declaration[1]))vars.set(declaration[1],declaration[2].trim());
 for(const declaration of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);?/g))if(!vars.has(declaration[1]))vars.set(declaration[1],declaration[2].trim());
 function resolve(name:string,depth=0):string|undefined{
  if(depth>8)return undefined;const value=vars.get(name);if(!value)return undefined;
  const ref=value.match(/^var\((--[\w-]+)\)$/);if(ref)return resolve(ref[1],depth+1);
  const expanded=value.replace(/var\((--[\w-]+)\)/g,(_,key)=>expand(key,depth+1));const converted=cssColour(/^[\d.]+[, ]+[\d.]+[, ]+[\d.]+$/.test(expanded)?'rgb('+expanded+')':expanded);if(converted)return converted;
  if(/^#[\da-f]{6}$/i.test(value))return value.toLowerCase();
  if(/^#[\da-f]{3}$/i.test(value))return '#'+value.slice(1).split('').map(c=>c+c).join('');return undefined;
 }
 function expand(name:string,depth=0):string{if(depth>8)return '';return (vars.get(name)??'').replace(/var\((--[\w-]+)\)/g,(_,key)=>expand(key,depth+1));}
 const frequency=new Map<string,number>();
 for(const m of css.matchAll(/#[a-f0-9]{6}\b|#[a-f0-9]{3}\b/ig)){let c=m[0].toLowerCase();if(c.length===4)c='#'+c.slice(1).split('').map(x=>x+x).join('');const rgb=c.slice(1).match(/../g)!.map(x=>parseInt(x,16));if(Math.max(...rgb)-Math.min(...rgb)<45)continue;frequency.set(c,(frequency.get(c)??0)+1);}
 const used=new Map<string,number>();
 for(const token of usedClasses){const m=token.match(/(?:bg|text|border|decoration)-\[#([a-f\d]{6})\]/i);if(m){const c='#'+m[1].toLowerCase();used.set(c,(used.get(c)??0)+1);}}
 for(const colour of matchedColours??[])used.set(colour,(used.get(colour)??0)+1);
 const ranked=[...used].sort((a,b)=>b[1]-a[1]).map(([c])=>c);
 const vivid=(c:string)=>{const n=c.slice(1).match(/../g)!.map(x=>parseInt(x,16));return Math.max(...n)-Math.min(...n)>40;};
 const declaredPrimary=roles.primary??resolve('--primary')??resolve('--color-primary')??resolve('--brand-color')??resolve('--accent')??resolve('--color-accent')??resolve('--color-button')??resolve('--color-link');
 // A matched scan is authoritative, including an empty scan. Never use unrelated CSS.
 const matched=matchedColours!==undefined||ranked.length>0;
 const candidates=matched?[...new Set([...Object.values(roles),...ranked].filter((c):c is string=>!!c))]:[...new Set([...ranked,...vars.keys()].map(c=>c.startsWith('#')?c:resolve(c)).filter((c):c is string=>!!c).concat([...frequency.keys()]))];
 const chroma=(c:string)=>{const rgb=c.slice(1).match(/../g)!.map(x=>parseInt(x,16));return Math.max(...rgb)-Math.min(...rgb);};
 const saturation=(c:string)=>chroma(c)/Math.max(1,...c.slice(1).match(/../g)!.map(x=>parseInt(x,16)));
 const primary=roles.primary??(declaredPrimary&&candidates.includes(declaredPrimary)?declaredPrimary:candidates.find(vivid)??candidates.filter(c=>chroma(c)>8).sort((a,b)=>saturation(b)-saturation(a))[0]??candidates[0]);
 if(!primary)return undefined;
 const observed=[...new Set([...candidates,primary])];
 const choose=(value:string|undefined,fallback:string)=>value&&(!matched||observed.includes(value))?value:fallback;
 const paper=roles.paper??choose(resolve('--paper')??resolve('--bg')??resolve('--background')??resolve('--color-background')??resolve('--color-canvas'),'#ffffff');
 const ink=roles.ink??choose(resolve('--ink')??resolve('--foreground')??resolve('--color-foreground')??resolve('--color-ink'),observed.includes('#000000')?'#000000':'#101010');
 const secondary=resolve('--secondary')??resolve('--color-secondary')??resolve('--c-yellow');
 const accent=secondary&&observed.includes(secondary)?secondary:observed.find(c=>c!==primary&&vivid(c))??primary;
 return {observed,primary,paper,ink,accent,note:matchedColours?.length?'Colours from declarations matching visible website elements; inactive framework rules excluded. Public CSS evidence, not computed browser styles or a formal brand guide.':'Colours observed in public CSS; when semantic tokens are absent, the most frequent non-neutral colour is inferred. Not a formal brand guide.'};
}

export function cssColour(value:string):string|undefined{
 const rgb=value.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/i);
 if(rgb)return '#'+rgb.slice(1,4).map(n=>Math.max(0,Math.min(255,Math.round(Number(n)))).toString(16).padStart(2,'0')).join('');
 const match=value.match(/^oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)/i);if(!match)return undefined;
 const L=Number(match[1])/(match[2]?100:1),C=Number(match[3]),h=Number(match[4])*Math.PI/180,a=C*Math.cos(h),b=C*Math.sin(h);
 const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
 return '#'+[4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s].map(v=>Math.round(Math.max(0,Math.min(1,v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055))*255).toString(16).padStart(2,'0')).join('');
}
