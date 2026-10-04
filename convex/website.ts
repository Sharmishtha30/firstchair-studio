"use node";
import {internalAction} from './_generated/server';
import {internal} from './_generated/api';
import {v} from 'convex/values';
import {load} from 'cheerio';
import {extractPalette} from './brandPalette';
import {extractStyle} from './brandStyle';
import {publicWebsite} from './publicWebsite';
import {primaryLogo} from './websiteIdentity';
import {imageInfo} from './websiteAssets';
import type {SourcePage} from './creativeTypes';
function inspectHtml(url:string,html:string){
 const $=load(html),title=$('title').text().trim(),language=$('html').attr('lang')??'';
 const styles=$('link[rel="stylesheet"]').toArray().map(el=>$(el).attr('href')).filter((s):s is string=>!!s).map(s=>new URL(s,url).href).slice(0,8);
 const inline=$('style').text(),bodyClasses=($('body').attr('class')??'').split(/\s+/).filter(Boolean);
 const logo=primaryLogo($,url);const contentHeadings=$('main h1,main h2,article h1,article h2').toArray();const headingClasses=(contentHeadings.length?contentHeadings:$('h1,h2').toArray()).find(el=>$(el).text().trim().length>12&&!/cart|notification|drawer/i.test($(el).attr('class')??''));const primaryHeadingClasses=headingClasses?($(headingClasses).attr('class')??'').split(/\s+/).filter(Boolean):[];
 const links=$('a[href]').toArray().flatMap(el=>{try{const href=new URL($(el).attr('href')!,url);href.hash='';if(href.origin!==new URL(url).origin||href.pathname==='/'||/login|sign.?in|cart|account|policy|privacy|terms|mailto|\\.(pdf|jpg|png|zip)$/i.test(href.href))return [];const words=$(el).text()+' '+href.pathname;const score=/product|service|offer|solution|proving|roast|collection/i.test(words)?4:/about|story|pricing|price|faq|case.study/i.test(words)?3:0;return score?[{url:href.href,score}]:[];}catch{return [];}}).sort((a,b)=>b.score-a.score);
 const images=$('main img,article img,section img,img').toArray().flatMap(el=>{const node=$(el),alt=node.attr('alt')??'',raw=node.attr('data-src')??node.attr('src')??node.attr('data-srcset')?.split(/[ ,]/)[0];if(!raw||/logo|icon|payment|badge|avatar|partner|pixel|tracking/i.test(alt+' '+raw))return [];try{return [{url:new URL(raw,url).href,alt:alt.slice(0,250),pageUrl:url,score:(Number(node.attr('width'))>=500?3:0)+(alt.length>15?2:0),role:/product|coffee|shoe|bottle|roast|bag|shop/i.test(alt+' '+raw)?'product':'editorial'}];}catch{return [];}});
 const og=$('meta[property="og:image"]').attr('content');if(og&&!images.some(i=>i.url===og))try{images.push({url:new URL(og,url).href,alt:title,pageUrl:url,score:1,role:'website cover'});}catch{}
 $('script,style,nav,footer,noscript,svg,header,[class*=cookie],[id*=cookie]').remove();
 const blocks=$('h1,h2,h3,p,li').toArray().map(el=>({kind:el.tagName,text:$(el).text().replace(/\s+/g,' ').trim()})).filter(b=>b.text.length>12&&b.text.length<1800).filter((b,i,a)=>a.findIndex(x=>x.text===b.text)===i).slice(0,100);
 const description=$('meta[name="description"]').attr('content');if(description)blocks.unshift({kind:'description',text:description});
 if(blocks.map(b=>b.text).join(' ').length<100)blocks.push({kind:'body',text:$('body').text().replace(/\s+/g,' ').trim().slice(0,16000)});
 return {language,bodyClasses,primaryHeadingClasses,page:{url,title,retrievedAt:Date.now(),blocks} satisfies SourcePage,styles,inline,logo,links,images};
}
export const inspect=internalAction({args:{packId:v.id('packs')},returns:v.null(),handler:async(ctx,{packId})=>{
 const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack)throw new Error('Pack no longer exists.');
 const main=await publicWebsite(pack.url),home=inspectHtml(main.url,main.html),warnings:string[]=[];
 if(home.language&&!/^en(?:-|$)/i.test(home.language))throw new Error('Only English output is tested in this version. Paste English business text to continue.');
 if(home.page.blocks.map(b=>b.text).join('').length<100)throw new Error('This website has too little readable text. Try a public product or service page.');
 const urls=[...new Set(home.links.map(l=>l.url))].slice(0,4);
 const pages=await Promise.allSettled(urls.map(async u=>{const r=await publicWebsite(u);if(new URL(r.url).origin!==new URL(main.url).origin)throw new Error('Related page redirected outside this website.');return inspectHtml(r.url,r.html);}));
 const sources=[home,...pages.flatMap((p,i)=>{if(p.status==='fulfilled')return[p.value];warnings.push('Related page unavailable: '+urls[i]);return[];})];
 const sheets=await Promise.allSettled(home.styles.map(u=>publicWebsite(u,'text/css')));let css=home.inline+'\n'+sheets.flatMap(s=>s.status==='fulfilled'?[s.value.html]:[]).join('\n');
 const scoped=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(m=>home.bodyClasses.some(c=>m[1].split(',').some(selector=>selector.trim()==='.'+c||selector.trim()==='body.'+c))).map(m=>m[2]).join(';');if(scoped)css=':root{'+scoped+'}\n'+css;
 for(const [i,sheet]of sheets.entries()){if(sheet.status!=='fulfilled')continue;for(const match of sheet.value.html.matchAll(/url\([\"']?([^\"')]+\.(?:jpg|jpeg|png|webp)(?:\?[^\"')]*)?)[\"']?\)/gi)){try{home.images.push({url:new URL(match[1],home.styles[i]).href,alt:'Source background image for '+home.page.title,pageUrl:home.page.url,score:1,role:'website background'});}catch{}}}
 const palette=extractPalette(css),style=extractStyle(css,home.primaryHeadingClasses);
 let fontName:string|undefined,fontRegular,fontSemibold;
 const openFonts=['Inter','DM Sans','Roboto','Montserrat','Poppins','Manrope','Lato','Open Sans','Work Sans','Nunito','Oswald','Bebas Neue','Space Grotesk','Playfair Display','Libre Baskerville'];
 fontName=openFonts.find(name=>style.sourceFont.split(',')[0].toLowerCase()===name.toLowerCase())??openFonts.find(name=>(style.bodyFont??'').split(',')[0].toLowerCase()===name.toLowerCase());
 if(fontName)try{
  const fontCss=await publicWebsite('https://fonts.googleapis.com/css2?family='+encodeURIComponent(fontName)+':wght@400;600&display=swap','text/css');
  const faces=[...fontCss.html.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m=>({weight:m[1].match(/font-weight:\s*(\d+)/)?.[1],url:m[1].match(/src:\s*url\(([^)]+)\)/)?.[1]}));
  const getFont=async(weight:string)=>{const href=faces.find(f=>f.weight===weight)?.url;if(!href)return undefined;const file=await publicWebsite(href,'font/');return ctx.storage.store(new Blob([file.bytes! as BlobPart],{type:href.endsWith('.ttf')?'font/ttf':'font/woff2'}));};
  [fontRegular,fontSemibold]=await Promise.all([getFont('400'),getFont('600')]);
  if(fontRegular&&fontSemibold){style.fontName=fontName;style.note='Declared website font '+fontName+' loaded from its open-source Google Fonts distribution. '+(style.sourceFont.split(',')[0].toLowerCase()!==fontName.toLowerCase()&&!/georgia|times/i.test(style.sourceFont)?'Heading font '+style.sourceFont+' is unavailable for import; '+fontName+' is loaded for body text; headings use '+(style.headline==='serif'?'Georgia':'Inter')+' as the explicit substitution.':'')+(style.headline==='serif'?' Serif headings use Georgia when the declared heading font cannot be imported.':'')+' CSS declarations are not proof of rendered site styles.';}else fontName=undefined;
 }catch{fontName=undefined;warnings.push('Open website font could not be loaded; bundled Inter or Georgia fallback.');}
 const sourcePages=sources.map(s=>s.page),sourceText=sourcePages.map(p=>'PAGE '+p.url+'\n'+p.title+'\n'+p.blocks.map(b=>b.kind+': '+b.text).join('\n')).join('\n\n').slice(0,52000);
 let logoFile;
 if(home.logo)try{
  const asset=await publicWebsite(home.logo,'image/'),bytes=asset.bytes!,info=imageInfo(bytes);
  if(info)logoFile=await ctx.storage.store(new Blob([bytes as BlobPart],{type:info.mime}));
  else if(/<svg[\s>]/i.test(asset.html.slice(0,1000))){const svg=load(asset.html,{xmlMode:true});svg('script,foreignObject,iframe,image,style').remove();svg('*').each((_,el)=>{const attributes=(el as unknown as {attribs?:Record<string,string>}).attribs??{};for(const [key,value]of Object.entries(attributes))if(/^on/i.test(key)||/href$/i.test(key)&&!value.startsWith('#')||/url\(/i.test(value)&&[...value.matchAll(/url\(([^)]+)\)/g)].some(m=>!/^#[\w-]+$/.test(m[1])))svg(el).removeAttr(key);});const clean=svg('svg').first().toString();if(clean)logoFile=await ctx.storage.store(new Blob([clean],{type:'image/svg+xml'}));}
 }catch{warnings.push('Logo could not be imported; a text wordmark is used.');}
 await ctx.runMutation(internal.studio.update,{packId,startedAt:pack.operationStartedAt,stage:'Collecting brand imagery'});
 const candidates=sources.flatMap(s=>s.images).filter((i,n,a)=>a.findIndex(x=>x.url===i.url)===n).sort((a,b)=>b.score-a.score).slice(0,8);
 const fetched=await Promise.allSettled(candidates.map(async(c,i)=>{const r=await publicWebsite(c.url,'image/'),info=imageInfo(r.bytes!);if(!info||info.width>6000||info.height>6000||info.width<500||info.height<300||info.width/info.height>4)throw new Error('Image is too small or unsuitable.');return {...c,...info,key:'image-'+i,bytes:r.bytes!};}));
 const sourceAssets=[];
 for(const result of fetched){if(result.status!=='fulfilled'||sourceAssets.length>=4)continue;const a=result.value;const file=await ctx.storage.store(new Blob([a.bytes as BlobPart],{type:a.mime}));sourceAssets.push({key:a.key,file,originalUrl:a.url,width:a.width,height:a.height,alt:a.alt,role:a.role,pageUrl:a.pageUrl});}
 if(!sourceAssets.length)warnings.push('No suitable website photographs loaded. Original typographic diagrams will be used.');
 await ctx.runMutation(internal.studio.update,{packId,startedAt:pack.operationStartedAt,stage:'Understanding customers',sourceText,sourcePages,sourceAssets,fontName,fontRegular,fontSemibold,resetFonts:!fontName||!fontRegular||!fontSemibold,sourceWarnings:warnings,sitePalette:palette,siteStyle:style,logoFile,resetLogo:!logoFile});return null;
}});
