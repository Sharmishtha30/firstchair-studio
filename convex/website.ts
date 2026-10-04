"use node";
import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { lookup } from 'node:dns/promises';
import { load } from 'cheerio';
import { publicAddress, websiteUrl } from './websiteSafety';
async function readWebsite(input:string):Promise<{url:string;text:string}> {
  let url=websiteUrl(input);
  for(let i=0;i<5;i++) {
    const addresses=await lookup(url.hostname.replace(/^\[|\]$/g,''),{all:true});
    if(!addresses.length||addresses.some(a=>!publicAddress(a.address))) throw new Error('Local and private websites are not supported.');
    const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'CallToReel/1.0 (public brand research)'}});
    if(response.status>=300&&response.status<400) {const next=response.headers.get('location');if(!next)throw new Error('Website redirected without an address.');url=websiteUrl(new URL(next,url).href);continue;}
    if(!response.ok)throw new Error(`Website could not be read (HTTP ${response.status}).`);
    if(!response.headers.get('content-type')?.includes('text/html'))throw new Error('Enter a webpage, rather than a file.');
    const reader=response.body?.getReader();if(!reader)throw new Error('Website returned no content.');
    const chunks:Uint8Array[]=[];let size=0;
    try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2_000_000)throw new Error('Website is too large to read safely.');chunks.push(value);}}finally{await reader.cancel();}
    const $=load(Buffer.concat(chunks).toString('utf8'));$('script,style,nav,footer,noscript,svg').remove();
    const text=($('title').text()+'\n'+$('meta[name="description"]').attr('content')+'\n'+$('body').text()).replace(/\s+/g,' ').trim().slice(0,24000);
    if(text.length<100)throw new Error('This website has too little readable text.');
    return {url:url.href,text};
  }
  throw new Error('Website redirected too many times.');
}
export const inspect=internalAction({args:{packId:v.id('packs')},returns:v.null(),handler:async(ctx,{packId})=>{
  const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack)throw new Error('Pack no longer exists.');
  const result=await readWebsite(pack.url);
  await ctx.runMutation(internal.studio.update,{packId,stage:'Finding the audience’s pain',sourceText:result.text});return null;
}});
