import {internalAction} from './_generated/server';
import {internal} from './_generated/api';
import {v} from 'convex/values';
export const inspect=internalAction({args:{packId:v.id('packs')},returns:v.null(),handler:async(ctx,{packId})=>{
 const pack=await ctx.runQuery(internal.studio.getInternal,{packId});if(!pack)throw new Error('Pack not found.');
 const key=process.env.META_AD_LIBRARY_TOKEN,version=process.env.META_GRAPH_VERSION;
 if(!key||!version){await ctx.runMutation(internal.adStore.save,{packId,ads:[],status:'not_connected',error:'No ads imported. Meta ad-library access and a Graph API version are required.'});return null;}
 if(!/^v\d+\.\d+$/.test(version)){await ctx.runMutation(internal.adStore.save,{packId,ads:[],status:'unavailable',error:'META_GRAPH_VERSION must be an enabled version from the Meta app dashboard.'});return null;}
 const host=new URL(pack.url).hostname.replace(/^www\./,'');
 const query=host==='foundersfind.club'?'Founders Find':host.split('.')[0].replace(/[-_]/g,' ');
 const country=process.env.META_AD_LIBRARY_COUNTRY??'IN';
 if(!/^[A-Z]{2}$/.test(country)){await ctx.runMutation(internal.adStore.save,{packId,ads:[],status:'unavailable',error:'META_AD_LIBRARY_COUNTRY must be a two-letter country code.'});return null;}
 const url=new URL(`https://graph.facebook.com/${version}/ads_archive`);
 url.search=new URLSearchParams({search_terms:query,ad_reached_countries:JSON.stringify([country]),ad_type:'ALL',ad_active_status:'ACTIVE',fields:'id,page_name,ad_creative_bodies,ad_snapshot_url',limit:'10'}).toString();
 try{
  const response=await fetch(url,{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Meta ad-library request failed (HTTP ${response.status}). Verify approved access and country coverage.`);
  const result=await response.json();if(!Array.isArray(result.data))throw new Error('Meta returned no usable ad records.');
  const ads=result.data.slice(0,10).flatMap((ad:Record<string,unknown>)=>{
   if(typeof ad.id!=='string'||!/^\d+$/.test(ad.id)||typeof ad.page_name!=='string'||typeof ad.ad_snapshot_url!=='string'||!Array.isArray(ad.ad_creative_bodies))return [];
   const link=new URL(ad.ad_snapshot_url);if(!['facebook.com','www.facebook.com'].includes(link.hostname)||link.protocol!=='https:')return [];
   return [{id:ad.id,pageName:ad.page_name,body:ad.ad_creative_bodies.filter((x:unknown)=>typeof x==='string').join('\n').slice(0,3000),snapshotUrl:'https://www.facebook.com/ads/library/?id='+encodeURIComponent(ad.id)}];
  });
  await ctx.runMutation(internal.adStore.save,{packId,ads,status:ads.length?'imported':'no_results',error:ads.length?undefined:'No matching ads returned for this brand and country. This is not evidence that the brand has never advertised.'});
 }catch(e){await ctx.runMutation(internal.adStore.save,{packId,ads:[],status:'unavailable',error:e instanceof Error?e.message:'Ad library could not be read.'});}
 return null;
}});
