"use node";
import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { load } from 'cheerio';
import {extractPalette,type Palette} from './brandPalette';
import {publicWebsite} from './publicWebsite';
async function readWebsite(input:string):Promise<{url:string;text:string;palette?:Palette}>{
 const {url,html}=await publicWebsite(input);const $=load(html);
 const styles=$('link[rel="stylesheet"]').toArray().map(el=>$(el).attr('href')).filter((s):s is string=>!!s).map(s=>new URL(s,url)).filter(u=>u.origin===new URL(url).origin).slice(0,2);
 const sheets=await Promise.allSettled(styles.map(u=>publicWebsite(u.href,'text/css')));
 const palette=extractPalette(sheets.flatMap(s=>s.status==='fulfilled'?[s.value.html]:[]).join('\n'));
 $('script,style,nav,footer,noscript,svg').remove();
 const text=($('title').text()+'\n'+($('meta[name="description"]').attr('content')??'')+'\n'+$('body').text()).replace(/\s+/g,' ').trim().slice(0,24000);
 if(text.length<100)throw new Error('This website has too little readable text.');return {url,text,palette};
}
export const inspect=internalAction({args:{packId:v.id('packs')},returns:v.null(),handler:async(ctx,{packId})=>{
  const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack)throw new Error('Pack no longer exists.');
  const result=await readWebsite(pack.url);
  await ctx.runMutation(internal.studio.update,{packId,stage:'Finding the audience’s pain',sourceText:result.text,sitePalette:result.palette});return null;
}});
