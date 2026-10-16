export const websiteUnavailableMessage="We couldn't reach this website right now. Try again, or paste your business text instead.";
const transientCodes=new Set(['EBUSY','ETIMEDOUT','ECONNRESET','EAI_AGAIN','ENOTFOUND','ECONNREFUSED','EHOSTUNREACH','ENETUNREACH','EPIPE']);
function isNetworkFailure(error:unknown):boolean{
 let current=error;
 for(let depth=0;depth<8&&current instanceof Error;depth++){
  const code='code' in current?String(current.code):'';
  const message=current.message;
  if(/^[A-Z][A-Z0-9_]+$/.test(code)||[...transientCodes].some(value=>new RegExp(`\\b${value}\\b`).test(message))||/^Website (took too long to respond|response was interrupted)\.$/.test(message))return true;
  current=current.cause;
 }
 return false;
}
// Retry the entire read, including DNS and redirects, with a fresh per-attempt deadline.
// Deliberate blocks, invalid URLs and private-address checks keep their original errors.
export async function withWebsiteNetworkRetry<T>(read:()=>Promise<T>,wait:(ms:number)=>Promise<void>=ms=>new Promise(resolve=>setTimeout(resolve,ms))):Promise<T>{
 for(let retry=0;;retry++){
  try{return await read();}catch(error){
   if(!isNetworkFailure(error))throw error;
   if(retry===3)throw new Error(websiteUnavailableMessage);
   await wait(250*(retry+1));
  }
 }
}
