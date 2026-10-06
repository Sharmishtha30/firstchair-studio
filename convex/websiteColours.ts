import type {CheerioAPI} from 'cheerio';
import {cssColour} from './brandPalette';
// Match selectors to source HTML. This is declared styling, not a browser-computed cascade.
function inspectColours($:CheerioAPI,css:string){
 const vars=new Map<string,string>();
 for(const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g))if(!vars.has(m[1]))vars.set(m[1],m[2].trim());
 const expand=(s:string,depth=0):string=>depth>8?'':s.replace(/var\((--[\w-]+)(?:,\s*([^)]*))?\)/g,(_,key,fallback)=>expand(vars.get(key)??fallback??'',depth+1));
 const colour=(s:string)=>{s=expand(s).trim();if(/^transparent$/i.test(s)||/^rgba\([^)]*[, /]\s*0(?:\.0+)?\s*\)$/i.test(s))return undefined;const h=s.match(/^#([a-f\d]{3}|[a-f\d]{6})(?:\b|$)/i);if(h)return '#'+(h[1].length===3?h[1].split('').map(c=>c+c).join(''):h[1]).toLowerCase();return cssColour(s);};
 const nodes=$('body,h1,h2,h3,p,a,button,main,section,article,[class]').toArray().filter(el=>!$(el).closest('[hidden],[aria-hidden="true"],script,style,nav,footer,[class*=cookie],[id*=cookie],[role=dialog],[class*=cart-drawer]').length).slice(0,700);
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(m=>!m[1].includes('@')&&!/:hover|:focus|:active|:visited|::/.test(m[1]));
 const found:string[]=[],roles:{paper?:string;ink?:string;primary?:string}={};
 for(const el of nodes){const node=$(el),declarations=new Map<string,string>();
  for(const m of rules){if(!m[1].split(',').some(selector=>{try{return node.is(selector.trim());}catch{return false;}}))continue;
   for(const d of m[2].matchAll(/(?:^|;)\s*(color|background-color|background|border-color|fill|stroke)\s*:\s*([^;{}]+)/gi))declarations.set(d[1].toLowerCase(),d[2].trim());
  }
  for(const d of (node.attr('style')??'').matchAll(/(?:^|;)\s*(color|background-color|background|border-color|fill|stroke)\s*:\s*([^;{}]+)/gi))declarations.set(d[1].toLowerCase(),d[2].trim());
  for(const value of declarations.values()){const c=colour(value);if(c)found.push(c);}
  const background=colour(declarations.get('background-color')??declarations.get('background')??''),text=colour(declarations.get('color')??'');
  if(node.is('body,main,[role=main]')){if(background&&!roles.paper)roles.paper=background;if(text&&!roles.ink)roles.ink=text;}
  if(node.is('h1')&&text&&!roles.ink)roles.ink=text;
  if(node.is('a,button')&&/shop|buy|start|try|join|book/i.test(node.text())&&background&&!roles.primary)roles.primary=background;
 }
 return {found,roles};
}

export function matchedWebsiteColours($:CheerioAPI,css:string):string[]{return inspectColours($,css).found;}
export function matchedWebsiteColourRoles($:CheerioAPI,css:string){return inspectColours($,css).roles;}
