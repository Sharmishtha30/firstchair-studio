import type {CheerioAPI} from 'cheerio';
// Keep evidence from actual elements, rather than guessing identity from a domain.
export function websiteTypography($:CheerioAPI,css:string){
 const vars=new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)].map(m=>[m[1],m[2]]));
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
 function value(node:ReturnType<CheerioAPI>,prop:string){let out='';const re=new RegExp('(?:^|;)\\s*'+prop+'\\s*:\\s*([^;}]+)','i');for(const r of rules)for(const selector of r[1].split(',')){try{if(node.is(selector.trim()))out=r[2].match(re)?.[1]??out;}catch{}}out=node.attr('style')?.match(re)?.[1]??out;for(let i=0;i<6;i++)out=out.replace(/var\((--[\w-]+)(?:,\s*([^)]*))?\)/g,(_m,k,f)=>vars.get(k)??f??'');return out.trim();}
 const italic=(node:ReturnType<CheerioAPI>)=>node.is('em,i')||value(node,'font-style')==='italic';
 const wordmark=$('header a[href="/"],nav a[href="/"]').first();
 const marked=wordmark.find('span,em,i').filter((_i,el)=>italic($(el))&&!!value($(el),'color')).first();
 const heading=$('h1').first().find('span,em,i').filter((_i,el)=>italic($(el))&&!!value($(el),'color')).first();
 return {...(marked.length&&wordmark.text().trim()?{wordmarkText:wordmark.text().trim(),wordmarkAccent:marked.text().trim()}:{}),...(heading.length?{headingEmphasis:true}:{})};
}
