"use node";
import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { load } from 'cheerio';
import {extractPalette,type Palette} from './brandPalette';
import {extractStyle,type BrandStyle} from './brandStyle';
import {publicWebsite} from './publicWebsite';
async function readWebsite(input:string):Promise<{url:string;text:string;palette?:Palette;style:BrandStyle;logo?:string}>{
 const {url,html}=await publicWebsite(input);const $=load(html);
 const styles=$('link[rel="stylesheet"]').toArray().map(el=>$(el).attr('href')).filter((s):s is string=>!!s).map(s=>new URL(s,url)).filter(u=>u.protocol==='https:'||u.protocol==='http:').slice(0,5);
 const sheets=await Promise.allSettled(styles.map(u=>publicWebsite(u.href,'text/css')));
 const css=$('style').text()+'\n'+sheets.flatMap(s=>s.status==='fulfilled'?[s.value.html]:[]).join('\n');
 const palette=extractPalette(css),style=extractStyle(css);
 const logo=$('img[alt*=logo i],img[class*=logo i],img[id*=logo i],header a[href="/"] img,nav a[href="/"] img').toArray().map(el=>$(el).attr('src')).find(Boolean);
 $('script,style,nav,footer,noscript,svg').remove();
 const text=($('title').text()+'\n'+($('meta[name="description"]').attr('content')??'')+'\n'+$('body').text()).replace(/\s+/g,' ').trim().slice(0,24000);
 if(text.length<100)throw new Error('This website has too little readable text.');return {url,text,palette,style,logo:logo?new URL(logo,url).href:undefined};
}
export const inspect=internalAction({args:{packId:v.id('packs')},returns:v.null(),handler:async(ctx,{packId})=>{
  const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack)throw new Error('Pack no longer exists.');
  const result=await readWebsite(pack.url);
  let logoFile;
  if(result.logo){try{const asset=await publicWebsite(result.logo,'image/');const bytes=asset.bytes!;let mime=bytes[0]===137?'image/png':bytes[0]===255?'image/jpeg':String.fromCharCode(...bytes.slice(0,4))==='RIFF'?'image/webp':'';if(!mime&&/<svg[\s>]/i.test(asset.html.slice(0,1000))){const svg=load(asset.html,{xmlMode:true});svg('script,foreignObject,iframe,image,style').remove();svg('*').each((_,el)=>{const attributes=(el as unknown as {attribs?:Record<string,string>}).attribs??{};for(const [key,value]of Object.entries(attributes))if(/^on/i.test(key)||/href$/i.test(key)&&!value.startsWith('#')||/url\(/i.test(value)&&!/url\(#[\w-]+\)/.test(value))svg(el).removeAttr(key);});const clean=svg('svg').first().toString();if(clean)logoFile=await ctx.storage.store(new Blob([clean],{type:'image/svg+xml'}));}
  if(mime)logoFile=await ctx.storage.store(new Blob([bytes as BlobPart],{type:mime}));}catch{/* Logo unavailable: text wordmark is labelled as fallback. */}}
  await ctx.runMutation(internal.studio.update,{packId,stage:'Finding the audience’s pain',sourceText:result.text,sitePalette:result.palette,siteStyle:result.style,logoFile});return null;
}});
