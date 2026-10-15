// Limit concurrent single-slide requests and preserve source order
// even when a later request finishes first; never truncate generated content.
export async function mapInPairs<T,R>(items:T[],run:(item:T)=>Promise<R>):Promise<R[]>{
 const results:R[]=[];
 for(let i=0;i<items.length;i+=2)results.push(...await Promise.all(items.slice(i,i+2).map(run)));
 return results;
}

// Retry only provider capacity errors (ChatGPT overload, rate limit or 5xx), at most twice.
// Each attempt still reserves a call from the hourly allowance.
export function transientWriterFailure(error:unknown){
 let current=error;
 for(let depth=0;depth<8&&current instanceof Error;depth++){
  if(/temporarily busy|plan allowance is temporarily unavailable/.test(current.message))return true;
  current=current.cause;
 }
 return false;
}
export async function withTransientRetry<R>(run:()=>Promise<R>,delays=[2000,6000],wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms))):Promise<R>{
 for(let attempt=0;;attempt++){
  try{return await run();}
  catch(error){if(attempt>=delays.length||!transientWriterFailure(error))throw error;await wait(delays[attempt]);}
 }
}

// GPT-5 mini's reasoning tokens share the 1,500-token output cap. Keep
// deliberation for planning, and use its documented minimal setting for
// small formatting/classification requests. Other models keep their setting.
export function sourceReasoningEffort(provider:string,model:string,stage:string){
 return provider==='OpenAI API'&&/^gpt-5-mini(?:-\d{4}-\d{2}-\d{2})?$/.test(model)&&stage!=='Understanding your content and writing the story'?'minimal':'low';
}
