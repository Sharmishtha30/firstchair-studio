import type {CheerioAPI} from 'cheerio';

// Product-page evidence comes from a named product with a priced offer, not a guessed URL suffix.
export function hasProductOffer($:CheerioAPI):boolean{
 const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
 const hasType=(value:Record<string,unknown>,type:string)=>[value['@type']].flat().some(t=>typeof t==='string'&&(t===type||t==='https://schema.org/'+type||t==='http://schema.org/'+type));
 const offer=(value:unknown)=>object(value)&&(hasType(value,'Offer')||hasType(value,'AggregateOffer'))&&typeof value.priceCurrency==='string'&&value.priceCurrency.trim()!==''&&[value.price,value.lowPrice].some(p=>(typeof p==='string'&&p.trim()!==''||typeof p==='number')&&Number.isFinite(Number(p))&&Number(p)>=0);
 const product=(value:unknown,depth=0):boolean=>{
  if(depth>10)return false;
  if(Array.isArray(value))return value.some(v=>product(v,depth+1));
  if(!object(value))return false;
  if(hasType(value,'Product')&&typeof value.name==='string'&&value.name.trim()&&[value.offers].flat().some(offer))return true;
  // Only page entities and graph roots count; a review's itemReviewed is not a storefront.
  return product(value['@graph'],depth+1)||product(value.mainEntity,depth+1);
 };
 return $('script[type="application/ld+json"]').toArray().some(el=>{try{return product(JSON.parse($(el).text()));}catch{return false;}});
}

// Product images must survive both caps even when a homepage has many higher-scored backgrounds.
export function selectWebsiteImages<T extends {url:string;role:string;score:number}>(images:T[],limit:number):T[]{
 const seen=new Set<string>();
 return [...images].sort((a,b)=>Number(b.role==='product')-Number(a.role==='product')||b.score-a.score)
  .filter(image=>{if(seen.has(image.url))return false;seen.add(image.url);return true;}).slice(0,Math.max(0,limit));
}
