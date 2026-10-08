"use node";
import {lookup} from 'node:dns/promises';
import {request as httpsRequest} from 'node:https';
import {request as httpRequest} from 'node:http';
import {publicAddress,websiteUrl} from './websiteSafety';
import {beforeDeadline} from './requestDeadline';
import {websiteReadLimit} from './websiteReadLimit';
export function validateWebsiteResponse(status:number,contentType:string,mime:string):void{
 if(status===401||status===403)throw new Error('This website blocks automated reading. Open “Website blocked? Use your business text” below to continue.');
 if(status<200||status>=300)throw new Error(`Website could not be read (HTTP ${status}).`);
 const supportedType=mime==='font/'?/^(?:font\/|application\/(?:x-font|font|vnd\.ms-fontobject|octet-stream))/i.test(contentType):contentType.includes(mime);
 if(!supportedType)throw new Error('Enter a webpage, rather than a file.');
}
export async function publicWebsite(input:string,mime='text/html'):Promise<{url:string;html:string;bytes?:Uint8Array}>{
 let url=websiteUrl(input);const deadline=Date.now()+20000;
 for(let hop=0;hop<5;hop++){
  const addresses=await beforeDeadline(lookup(url.hostname.replace(/^\[|\]$/g,''),{all:true}),deadline);
  if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new Error('Local and private websites are not supported.');
  // Pin the checked address into this connection. A second DNS lookup cannot redirect it into a private network.
  const result=await new Promise<{status:number;location?:string;html:string;bytes?:Uint8Array}>((resolve,reject)=>{
   let settled=false;const succeed=(value:{status:number;location?:string;html:string;bytes?:Uint8Array})=>{settled=true;resolve(value);};const fail=(error:Error)=>{settled=true;reject(error);};
   const request=url.protocol==='https:'?httpsRequest:httpRequest;
   const req=request(url,{agent:false,lookup:(_hostname,options,cb)=>options.all?cb(null,addresses):cb(null,addresses[0].address,addresses[0].family),headers:{'User-Agent':'CallToReel/1.0 (public brand research)','Accept':'text/html'}},response=>{
    const status=response.statusCode??0;
    if(status>=300&&status<400){response.resume();succeed({status,location:response.headers.location,html:''});return;}
    const contentType=response.headers['content-type']??'';
    try{validateWebsiteResponse(status,contentType,mime);}catch(error){response.resume();fail(error as Error);return;}
    let size=0;const chunks:Buffer[]=[];
    response.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>websiteReadLimit(mime)){req.destroy(new Error('Website is too large to read safely.'));return;}chunks.push(chunk);});
    response.on('error',fail);response.on('aborted',()=>fail(new Error('Website response was interrupted.')));response.on('close',()=>{if(!response.complete)fail(new Error('Website response was interrupted.'));});response.on('end',()=>succeed({status,html:Buffer.concat(chunks).toString('utf8'),bytes:new Uint8Array(Buffer.concat(chunks))}));
   });
   const timer=setTimeout(()=>req.destroy(new Error('Website took too long to respond.')),Math.max(1,deadline-Date.now()));
   req.on('close',()=>{clearTimeout(timer);if(!settled)fail(new Error('Website response was interrupted.'));});req.on('error',fail);req.end();
  });
  if(result.status>=300&&result.status<400){if(!result.location)throw new Error('Website redirected without an address.');url=websiteUrl(new URL(result.location,url).href);continue;}
  if(result.status<200||result.status>=300)throw new Error(`Website could not be read (HTTP ${result.status}).`);
  if(mime==='font/'){const b=result.bytes;const tag=b?String.fromCharCode(...b.slice(0,4)):'';if(!b||!['OTTO','wOFF','wOF2','true','ttcf'].includes(tag)&&!(b[0]===0&&b[1]===1&&b[2]===0&&b[3]===0))throw new Error('The source file is not a supported font.');}
  return {url:url.href,html:result.html,bytes:result.bytes};
 }
 throw new Error('Website redirected too many times.');
}
