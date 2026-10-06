import {load,type CheerioAPI} from 'cheerio';
import {inlineIllustrations} from './websiteDiagrams';
// Only the site's own navigation/header can nominate the primary logo.
export function primaryLogo($:CheerioAPI,base:string){
 const candidates=$('header img,nav img,[class*=header] a[href="/"] img,[id*=header] a[href="/"] img').toArray();
 const el=candidates.find(el=>/logo/i.test([$(el).attr('src'),$(el).attr('alt'),$(el).attr('class'),$(el).attr('id')].join(' ')))??candidates.find(el=>$(el).closest('a').attr('href')==='/');
 const src=el?$(el).attr('src'):undefined;try{return src?new URL(src,base).href:undefined;}catch{return undefined;}
}

// Some primary wordmarks are inline SVG rather than linked image files.
export function primaryInlineLogo($:CheerioAPI,base:string){
 const nodes=$('header svg,nav svg,[role="banner"] svg,[data-testid*="header-logo"] svg,[class*="header"] a svg,[id*="header"] a svg').toArray();
 for(const el of nodes){const node=$(el),anchor=node.closest('a'),href=anchor.attr('href');if(!href)continue;
  try{const destination=new URL(href,base),website=new URL(base);if(destination.origin!==website.origin||destination.pathname!=='/')continue;}catch{continue;}
  const clean=inlineIllustrations(load('<main>'+$.html(el)+'</main>'),base)[0];if(clean)return clean.svg;
 }
 return undefined;
}
