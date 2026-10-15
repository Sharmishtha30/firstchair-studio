"use node";
import {detectCategory} from './onboarding';
import {internalAction} from './_generated/server';
import {internal} from './_generated/api';
import {v} from 'convex/values';
import {load} from 'cheerio';
import {requireBrandEvidence} from './brandAcceptance';
import {defaultWebsitePalette,extractPalette} from './brandPalette';
import {matchedWebsiteColourEvidence} from './websiteColours';
import {websiteTypography} from './websiteTypography';
import {extractStyle} from './brandStyle';
import {websiteGeometry} from './websiteGeometry';
import {websiteImageSource} from './websiteImageSource';
import {publicWebsite} from './publicWebsite';
import {primaryLogo,primaryInlineLogo} from './websiteIdentity';
import {imageInfo} from './websiteAssets';
import {inlineIllustrations} from './websiteDiagrams';
import {websiteBrandEvidence} from './websiteBrandEvidence';
import type {SourcePage} from './creativeTypes';
function inspectHtml(url:string,html:string){
 const $=load(html),title=$('title').text().trim(),language=$('html').attr('lang')??'';
 const styles=$('link[rel="stylesheet"]').toArray().map(el=>$(el).attr('href')).filter((s):s is string=>!!s).map(s=>new URL(s,url).href).slice(0,8);
 const usedClasses=$('[class]').toArray().flatMap(el=>($(el).attr('class')??'').split(/\s+/));
 const inline=$('style').text(),bodyClasses=($('body').attr('class')??'').split(/\s+/).filter(Boolean);
 const brandEvidence=websiteBrandEvidence($);
 const diagrams=inlineIllustrations($,url);
 const logo=primaryLogo($,url),inlineLogo=primaryInlineLogo($,url);const contentHeadings=$('main h1,main h2,article h1,article h2').toArray();const headingClasses=(contentHeadings.length?contentHeadings:$('h1,h2').toArray()).find(el=>$(el).text().trim().length>12&&!/cart|notification|drawer/i.test($(el).attr('class')??''));const primaryHeadingClasses=headingClasses?($(headingClasses).attr('class')??'').split(/\s+/).filter(Boolean):[];
 const links=$('a[href]').toArray().flatMap(el=>{try{const href=new URL($(el).attr('href')!,url);href.hash='';if(href.origin!==new URL(url).origin||href.pathname==='/'||/login|sign.?in|cart|account|policy|privacy|terms|mailto|\.(pdf|jpg|png|zip|json)$/i.test(href.href))return [];const words=$(el).text()+' '+href.pathname;const score=/\/products?\//i.test(href.pathname)?6:/service|offer|solution|proving|roast/i.test(words)?4:/about|story|pricing|price|faq|case.study|testimonial|review/i.test(words)?3:/collection/i.test(words)?2:0;return score?[{url:href.href,score}]:[];}catch{return [];}}).sort((a,b)=>b.score-a.score);
 const images=$('main img,article img,section img,img').toArray().flatMap(el=>{const node=$(el);if(node.closest('header,nav,[role=dialog],[class*=cart-drawer],[class*=cart-notification]').length)return [];const alt=node.attr('alt')??'',raw=websiteImageSource(node.attr('data-src')??node.attr('src'),node.attr('data-srcset')??node.attr('srcset')??node.closest('picture').find('source').first().attr('srcset'));if(!raw||/logo|payment|avatar|partner|pixel|tracking/i.test(alt+' '+raw))return [];const decorative=/star.?icon|underline|doodle|decorative|scribble/i.test(alt+' '+raw);const icon=/icon|badge/i.test(alt+' '+raw);try{return [{url:new URL(raw,url).href,alt:alt.slice(0,250),pageUrl:url,score:(decorative?7:0)+(Number(node.attr('width'))>=500?3:0)+(alt.length>15?2:0)+(node.closest('main,article').length?4:0),role:decorative?'brand decoration':icon?'brand icon':(/product|coffee|shoe|bottle|roast|bag|shop|serum|cream|snack|chocolate|protein|tshirt|t-shirt|sneaker/i.test(alt+' '+raw)||node.closest('[class*=product-card],[class*=product__media],[class*=product-media]').length>0||/\/products?\//i.test(node.closest('a').attr('href')??''))?'product':'editorial'}];}catch{return [];}});
 const og=$('meta[property="og:image"]').attr('content');if(og&&!images.some(i=>i.url===og))try{images.push({url:new URL(og,url).href,alt:title,pageUrl:url,score:1,role:'website cover'});}catch{}
 $('script,style,nav,footer,noscript,svg,header,[class*=cookie],[id*=cookie]').remove();
 const blocks=$('h1,h2,h3,p,li,main div,section div').toArray().filter(el=>!$(el).is('div')||!$(el).find('div,p,li,h1,h2,h3').length).map(el=>({kind:el.tagName,text:$(el).text().replace(/\s+/g,' ').trim()})).filter(b=>b.text.length>12&&b.text.length<1800).filter((b,i,a)=>a.findIndex(x=>x.text===b.text)===i).slice(0,100);
 blocks.push(...brandEvidence);
 const description=$('meta[name="description"]').attr('content');if(description)blocks.unshift({kind:'description',text:description});
 if(blocks.map(b=>b.text).join(' ').length<100)blocks.push({kind:'body',text:$('body').text().replace(/\s+/g,' ').trim().slice(0,16000)});
 return {usedClasses,language,bodyClasses,primaryHeadingClasses,inlineLogo,page:{url,title,retrievedAt:Date.now(),blocks} satisfies SourcePage,styles,inline,logo,links,images,diagrams};
}
export const inspect=internalAction({args:{packId:v.id('packs')},returns:v.null(),handler:async(ctx,{packId})=>{
 const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack)throw new Error('Pack no longer exists.');
 const stylingOnly=!!pack.callRequested||!!pack.article;
 const main=await publicWebsite(pack.url),home=inspectHtml(main.url,main.html),warnings:string[]=[];
 if(!stylingOnly&&home.language&&!/^en(?:-|$)/i.test(home.language))throw new Error('Only English output is tested in this version. Paste English business text to continue.');
 if(!stylingOnly&&home.page.blocks.map(b=>b.text).join('').length<100)throw new Error('This website has too little readable text. Try a public product or service page.');
 await ctx.runMutation(internal.studio.update,{packId,startedAt:pack.operationStartedAt,stage:stylingOnly?'Reading website fonts and colours':'Reading related pages',...(stylingOnly?{}:{sourcePages:[home.page],detectedCategory:detectCategory(home.page.title+' '+home.page.blocks.slice(0,35).map(b=>b.text).join(' '))})});
 const urls=stylingOnly?[]:[...new Set(home.links.map(l=>l.url))].slice(0,4);
 const pagesPromise=Promise.allSettled(urls.map(async u=>{const r=await publicWebsite(u);if(new URL(r.url).origin!==new URL(main.url).origin)throw new Error('Related page redirected outside this website.');return inspectHtml(r.url,r.html);}));
 const sheetsPromise=Promise.allSettled(home.styles.map(u=>publicWebsite(u,'text/css')));
 const [pages,sheets]=await Promise.all([pagesPromise,sheetsPromise]);
 const sources=[home,...pages.flatMap((p,i)=>{if(p.status==='fulfilled')return[p.value];warnings.push('Related page unavailable: '+urls[i]+' — '+(p.reason instanceof Error?p.reason.message.slice(0,120):'could not read page'));return[];})];
 let css=home.inline+'\n'+sheets.flatMap(s=>s.status==='fulfilled'?[s.value.html]:[]).join('\n');
 const scoped=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(m=>home.bodyClasses.some(c=>m[1].split(',').some(selector=>selector.trim()==='.'+c||selector.trim()==='body.'+c))).map(m=>m[2]).join(';');if(scoped)css=':root{'+scoped+'}\n'+css;
 for(const [i,sheet]of sheets.entries()){if(sheet.status!=='fulfilled')continue;for(const match of sheet.value.html.matchAll(/url\([\"']?([^\"')]+\.(?:jpg|jpeg|png|webp)(?:\?[^\"')]*)?)[\"']?\)/gi)){try{home.images.push({url:new URL(match[1],home.styles[i]).href,alt:'Source background image for '+home.page.title,pageUrl:home.page.url,score:1,role:'website background'});}catch{}}}
 await ctx.runMutation(internal.studio.update,{packId,startedAt:pack.operationStartedAt,stage:'Picking brand colours',completedStep:'website'});
 let palette=defaultWebsitePalette,paletteFailed=false;
 try{
  const paletteCss=css.slice(0,300_000),evidence=matchedWebsiteColourEvidence(load(main.html),paletteCss);
  palette=extractPalette(paletteCss,home.usedClasses,evidence.found,evidence.roles)??defaultWebsitePalette;
  paletteFailed=palette===defaultWebsitePalette;
 }catch(error){paletteFailed=true;warnings.push('Website colour extraction failed; default colours were used. '+(error instanceof Error?error.message.slice(0,160):''));}
 if(paletteFailed&&!warnings.some(w=>w.startsWith('Website colour extraction failed')))warnings.push('Website colour extraction did not find usable colours; default colours were used.');
 const style={...extractStyle(css,home.primaryHeadingClasses),...websiteTypography(load(main.html),css),...websiteGeometry(load(main.html),css)};
 if((pack.article||pack.callRequested)&&!paletteFailed)requireBrandEvidence(palette);
 home.page.blocks.push(...websiteBrandEvidence(load(main.html),css));
 warnings.push('Asset collection covers the homepage and up to four linked offer, about or review pages, with up to 24 imported images and illustrations. Dynamic or protected content may be missing; CSS declarations are not computed browser styles.');
 await ctx.runMutation(internal.studio.update,{packId,startedAt:pack.operationStartedAt,stage:'Loading website fonts',completedStep:'colours',sitePalette:palette,sourceWarnings:[...new Set([...(pack.sourceWarnings??[]),...warnings])]});
 let fontName:string|undefined,fontRegular,fontSemibold,bodyFontRegular,bodyFontSemibold;
 const openFonts=['Inter','DM Sans','Roboto','Montserrat','Poppins','Manrope','Lato','Open Sans','Work Sans','Nunito','Oswald','Bebas Neue','Space Grotesk','Playfair Display','Libre Baskerville'];
 fontName=openFonts.find(name=>style.sourceFont.split(',')[0].toLowerCase()===name.toLowerCase())??openFonts.find(name=>(style.bodyFont??'').split(',')[0].toLowerCase()===name.toLowerCase());
 if(fontName)try{
  const fontCss=await publicWebsite('https://fonts.googleapis.com/css2?family='+encodeURIComponent(fontName)+':wght@400;600&display=swap','text/css');
  const faces=[...fontCss.html.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m=>({weight:m[1].match(/font-weight:\s*(\d+)/)?.[1],url:m[1].match(/src:\s*url\(([^)]+)\)/)?.[1]}));
  const getFont=async(weight:string)=>{const href=faces.find(f=>f.weight===weight)?.url;if(!href)return undefined;const file=await publicWebsite(href,'font/');return ctx.storage.store(new Blob([file.bytes! as BlobPart],{type:href.endsWith('.ttf')?'font/ttf':'font/woff2'}));};
  [fontRegular,fontSemibold]=await Promise.all([getFont('400'),getFont('600')]);
  if(fontRegular&&fontSemibold){style.fontName=fontName;style.note='Declared website font '+fontName+' loaded from its open-source Google Fonts distribution. '+(style.sourceFont.split(',')[0].toLowerCase()!==fontName.toLowerCase()&&!/georgia|times/i.test(style.sourceFont)?'Heading font '+style.sourceFont+' is unavailable for import; '+fontName+' is loaded for body text; headings use '+(style.headline==='serif'?'Georgia':'Inter')+' as the explicit substitution.':'')+(style.headline==='serif'?' Serif headings use Georgia when the declared heading font cannot be imported.':'')+' CSS declarations are not proof of rendered site styles.';}else fontName=undefined;
 }catch{fontName=undefined;warnings.push('Open website font could not be loaded; bundled Inter or Georgia fallback.');}
 // Prefer the site's own declared heading font when its public CSS supplies both weights.
 if(style.sourceFont.split(',')[0].trim().toLowerCase()!==(fontName??'').toLowerCase()){
  const family=style.sourceFont.split(',')[0].trim().replace(/["']/g,'');
  const fontSheets=[{html:home.inline,url:main.url},...sheets.flatMap((sheet,i)=>sheet.status==='fulfilled'?[{html:sheet.value.html,url:home.styles[i]}]:[])];
  const faces=fontSheets.flatMap(sheet=>[...sheet.html.matchAll(/@font-face\s*\{([^}]+)\}/g)].flatMap(m=>{const faceFamily=m[1].match(/font-family\s*:\s*([^;]+)/i)?.[1].replace(/["']/g,'').trim();const href=m[1].match(/src\s*:\s*url\(["']?([^"')]+)/i)?.[1];const weight=m[1].match(/font-weight\s*:\s*(\d+)/i)?.[1];return !/font-style\s*:\s*italic/i.test(m[1])&&faceFamily?.toLowerCase()===family.toLowerCase()&&href?[{url:new URL(href,sheet.url).href,weight}]:[];}));
  const byWeight=(target:number)=>[...faces].sort((a,b)=>Math.abs(Number(a.weight??400)-target)-Math.abs(Number(b.weight??400)-target))[0];
  const regular=byWeight(400),bold=byWeight(600);
  if(regular&&bold)try{const files=await Promise.all([regular,bold].map(async f=>{const r=await publicWebsite(f.url,'font/');if(!r.bytes||r.bytes.length>2000000)throw Error('Unsupported font file');return ctx.storage.store(new Blob([r.bytes as BlobPart],{type:/\.otf(?:\?|$)/i.test(f.url)?'font/otf':/\.ttf(?:\?|$)/i.test(f.url)?'font/ttf':'font/woff2'}));}));[fontRegular,fontSemibold]=files;fontName=family;style.fontName=family;style.note='Declared heading font loaded from the source website public font files; nearest available normal weights '+(regular.weight??'400')+' and '+(bold.weight??'400')+' are used for regular and bold rendering. Usage rights are not independently verified; no formal brand guide supplied.';}catch{warnings.push('Declared source heading font could not be loaded; bundled fallback remains.');}
 }
 // A separate body face preserves the site's headline/body contrast.
 const bodyFamily=(style.bodyFont??'').split(',')[0].trim().replace(/["']/g,'');
 if(bodyFamily&&bodyFamily.toLowerCase()!==(fontName??'').toLowerCase()){
  const bodySheets=[{html:home.inline,url:main.url},...sheets.flatMap((s,i)=>s.status==='fulfilled'?[{html:s.value.html,url:home.styles[i]}]:[])];
  let faces=bodySheets.flatMap(sheet=>[...sheet.html.matchAll(/@font-face\s*\{([^}]+)\}/g)].flatMap(m=>{const family=m[1].match(/font-family\s*:\s*([^;]+)/i)?.[1].replace(/["']/g,'').trim();const href=m[1].match(/src\s*:\s*url\(["']?([^"')]+)/i)?.[1];const weight=Number(m[1].match(/font-weight\s*:\s*(\d+)/i)?.[1]??400);return !/font-style\s*:\s*italic/i.test(m[1])&&family?.toLowerCase()===bodyFamily.toLowerCase()&&href?[{url:new URL(href,sheet.url).href,weight}]:[];}));
  try{
   if(!faces.length&&openFonts.some(f=>f.toLowerCase()===bodyFamily.toLowerCase())){const r=await publicWebsite('https://fonts.googleapis.com/css2?family='+encodeURIComponent(bodyFamily)+':wght@400;600&display=swap','text/css');faces=[...r.html.matchAll(/@font-face\s*\{([^}]+)\}/g)].flatMap(m=>{const href=m[1].match(/src\s*:\s*url\(["']?([^"')]+)/i)?.[1];return href?[{url:href,weight:Number(m[1].match(/font-weight\s*:\s*(\d+)/i)?.[1]??400)}]:[];});}
   if(faces.length){const targets=[400,600].map(w=>[...faces].sort((a,b)=>Math.abs(a.weight-w)-Math.abs(b.weight-w))[0]);const files=await Promise.all(targets.map(async face=>{const r=await publicWebsite(face.url,'font/');if(!r.bytes||r.bytes.length>2000000)throw Error('Unsupported body font');return ctx.storage.store(new Blob([r.bytes as BlobPart],{type:/\.otf(?:\?|$)/i.test(face.url)?'font/otf':/\.ttf(?:\?|$)/i.test(face.url)?'font/ttf':'font/woff2'}));}));[bodyFontRegular,bodyFontSemibold]=files;style.note+=' Separate declared body font '+bodyFamily+' loaded for supporting text.';}
   else style.note+=' Separate body font unavailable; supporting text uses bundled Inter.';
  }catch{warnings.push('Declared body font could not be loaded; supporting text uses bundled Inter.');}
 }
 if(stylingOnly){
  const {wordmarkText,wordmarkAccent,...fontStyle}=style;
  await ctx.runMutation(internal.studio.update,{packId,startedAt:pack.operationStartedAt,stage:'Website styling ready',completedStep:'assets',sourceText:'Styles only; no website content.',sourcePages:[],sourceAssets:[],fontName,fontRegular,fontSemibold,bodyFontRegular,bodyFontSemibold,resetFonts:!fontName||!fontRegular||!fontSemibold,sourceWarnings:['Website colours and fonts only. CSS declarations may differ from rendered styles.',...warnings.filter(w=>/font/i.test(w))],sitePalette:palette,siteStyle:fontStyle,resetLogo:true});return null;
 }
 const sourcePages=sources.map(s=>s.page),sourceText=sourcePages.map(p=>'PAGE '+p.url+'\n'+p.title+'\n'+p.blocks.map(b=>b.kind+': '+b.text).join('\n')).join('\n\n').slice(0,52000);
 let logoFile;
 if(home.logo)try{
  const asset=await publicWebsite(home.logo,'image/'),bytes=asset.bytes!,info=imageInfo(bytes);
  if(info)logoFile=await ctx.storage.store(new Blob([bytes as BlobPart],{type:info.mime}));
  else if(/<svg[\s>]/i.test(asset.html.slice(0,1000))){const svg=load(asset.html,{xmlMode:true});svg('script,foreignObject,iframe,image,style').remove();svg('*').each((_,el)=>{const attributes=(el as unknown as {attribs?:Record<string,string>}).attribs??{};for(const [key,value]of Object.entries(attributes))if(/^on/i.test(key)||/href$/i.test(key)&&!value.startsWith('#')||/url\(/i.test(value)&&[...value.matchAll(/url\(([^)]+)\)/g)].some(m=>!/^#[\w-]+$/.test(m[1])))svg(el).removeAttr(key);});const clean=svg('svg').first().toString();if(clean)logoFile=await ctx.storage.store(new Blob([clean],{type:'image/svg+xml'}));}
 }catch{warnings.push('Logo could not be imported; a text wordmark is used.');}
 if(!logoFile&&home.inlineLogo)logoFile=await ctx.storage.store(new Blob([home.inlineLogo],{type:'image/svg+xml'}));
 await ctx.runMutation(internal.studio.update,{packId,startedAt:pack.operationStartedAt,stage:'Collecting brand imagery'});
 const candidates=sources.flatMap((s,index)=>s.images.map(image=>({...image,score:image.score+(index===0?8:0)+(image.role==='product'?5:0)-(/notice|update on|debunk|reddit|reel/i.test(image.alt)?8:0)}))).filter((i,n,a)=>a.findIndex(x=>x.url===i.url)===n).sort((a,b)=>b.score-a.score).slice(0,36);
 const fetched=await Promise.allSettled(candidates.map(async(c,i)=>{const r=await publicWebsite(c.url,'image/');let info=imageInfo(r.bytes!),bytes=r.bytes!;if(!info&&/<svg[\s>]/i.test(r.html.slice(0,1000))){const svg=inlineIllustrations(load('<main>'+r.html+'</main>'),c.pageUrl)[0];if(svg){info={width:svg.width,height:svg.height,mime:'image/svg+xml'};bytes=new TextEncoder().encode(svg.svg);}}if(!info||info.width>6000||info.height>6000||(/brand decoration|brand icon/.test(c.role)?info.width<16||info.height<16:info.width<240||info.height<180)||info.width/info.height>4)throw new Error('Image is too small or unsuitable.');return {...c,...info,key:(info.mime==='image/svg+xml'?'diagram-external-':'image-')+i,bytes};}));
 const sourceAssets=[];
 // Reserve up to two places for the site's own explanatory artwork.
 for(const d of sources.flatMap(s=>s.diagrams).slice(0,8)){
  const file=await ctx.storage.store(new Blob([d.svg],{type:'image/svg+xml'}));
  sourceAssets.push({key:'diagram-'+sourceAssets.length,file,originalUrl:d.url,width:d.width,height:d.height,alt:d.alt,role:d.role,pageUrl:d.pageUrl});
 }
 if(sourceAssets.length)warnings.push('Inline website diagrams imported with safe presentation attributes; external CSS and animation are omitted. Compare their preview before publishing.');
 const usable=fetched.flatMap(r=>r.status==='fulfilled'?[r.value]:[]).slice(0,24-sourceAssets.length);
 sourceAssets.push(...await Promise.all(usable.map(async a=>({key:a.key,file:await ctx.storage.store(new Blob([a.bytes as BlobPart],{type:a.mime})),originalUrl:a.url,width:a.width,height:a.height,alt:a.alt,role:a.role,pageUrl:a.pageUrl}))));
 if(!sourceAssets.length)warnings.push('No suitable website imagery loaded. Original typographic diagrams will be used.');
 await ctx.runMutation(internal.studio.update,{packId,startedAt:pack.operationStartedAt,stage:'Website reading complete',completedStep:'assets',sourceText,sourcePages,sourceAssets,fontName,fontRegular,fontSemibold,bodyFontRegular,bodyFontSemibold,resetFonts:!fontName||!fontRegular||!fontSemibold,sourceWarnings:warnings,sitePalette:palette,siteStyle:style,logoFile,resetLogo:!logoFile});return null;
}});
