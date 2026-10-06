import type {CheerioAPI} from 'cheerio';
// Preserve observations separately from business claims. No inferred customer identities.
export function websiteBrandEvidence($:CheerioAPI,css=''){
 const blocks:Array<{kind:string;text:string}>=[];
 const seen=new Set<string>();
 const add=(kind:string,text:string)=>{text=text.replace(/\s+/g,' ').trim();if(text.length>12&&!seen.has(kind+text)){seen.add(kind+text);blocks.push({kind,text:text.slice(0,1700)});}};
 $('blockquote,[itemprop="reviewBody"],[class*="testimonial"],[class*="customer-review"]').each((_,el)=>{
  const node=$(el);if(node.find('blockquote,[itemprop="reviewBody"],[class*="testimonial"],[class*="customer-review"]').length)return;
  const text=node.text().trim();const author=node.find('cite,[itemprop="author"]').text().trim()||node.closest('figure').find('figcaption').text().trim();
  add('website testimonial — attribution not independently verified',text+(author?' — Attribution: '+author:''));
 });
 const typeNodes=$('h1,h2,h3,button,p').toArray().slice(0,70);
 for(const el of typeNodes){const node=$(el),classes=(node.attr('class')??'').split(/\s+/).filter(Boolean),tag=el.tagName;
  const rules=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(m=>!m[1].includes('@font-face')&&m[1].split(',').some(selector=>(()=>{try{return node.is(selector.trim());}catch{return false;}})()));
  const declarations=[...rules.map(m=>m[2]),node.attr('style')??''].flatMap(rule=>[...rule.matchAll(/(?:^|;)\s*(font-family|font-size|font-weight|font-style|line-height|letter-spacing|text-transform|border-radius|color|background-color)\s*:\s*([^;{}]+)/gi)].map(m=>m[1]+': '+m[2].trim()));
  if(declarations.length)add('website visual evidence — declared styles',tag+' '+node.text().trim().slice(0,90)+' | '+declarations.join('; '));
 }
 const faces=[...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m=>m[1].replace(/\s+/g,' ').trim());
 for(const face of faces.slice(0,20))add('website font declaration',face);
 return blocks.slice(0,60);
}
