import type {CheerioAPI} from 'cheerio';
// Only the site's own navigation/header can nominate the primary logo.
export function primaryLogo($:CheerioAPI,base:string){
 const candidates=$('header img,nav img,[class*=header] a[href="/"] img,[id*=header] a[href="/"] img').toArray();
 const el=candidates.find(el=>/logo/i.test([$(el).attr('src'),$(el).attr('alt'),$(el).attr('class'),$(el).attr('id')].join(' ')))??candidates.find(el=>$(el).closest('a').attr('href')==='/');
 const src=el?$(el).attr('src'):undefined;try{return src?new URL(src,base).href:undefined;}catch{return undefined;}
}
