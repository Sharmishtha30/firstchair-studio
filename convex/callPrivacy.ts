import type {CallQuote} from './customerCall';
export type PrivateSpan={start:number;length:number;company:boolean};
export const redactionPattern=/\[R:(\d+):(\d+)\]/g;
export function publicRedactions(text:string){return text.replace(redactionPattern,'[REDACTED]');}
// Weekdays, months, time words and speaker roles cannot identify anyone; redacting them only breaks the copy.
const notIdentifying=/^(?:(?:mon|tues|wednes|thurs|fri|satur|sun)days?|january|february|march|april|may|june|july|august|september|october|november|december|today|yesterday|tomorrow|(?:morning|afternoon|evening|night|weekend|week|month|year|founder|customer|day)s?|interviewer|host|guest|speaker\s*\d*|ceo|manager|team|[\d\s.,%]+)$/i;
export function identifyingEntities<T extends {text:string}>(entities:T[]){return entities.filter(e=>e.text.trim()&&!e.text.trim().split(/\s+/).every(w=>notIdentifying.test(w.replace(/[^\p{L}\p{N}%.,]/gu,''))));}
export function markPrivateQuotes(quotes:CallQuote[],found:{text:string;company:boolean}[]):CallQuote[]{
 const entities=identifyingEntities(found);
 return quotes.map(q=>({...q,privateSpans:entities.flatMap(entity=>{const spans:PrivateSpan[]=[];let from=0;while(entity.text&&from<q.text.length){const start=q.text.toLowerCase().indexOf(entity.text.toLowerCase(),from);if(start<0)break;spans.push({start,length:entity.text.length,company:entity.company});from=start+entity.text.length;}return spans;})}));
}
// Only offsets are added to quotes. No parallel list of real names is persisted in creative fields.
export function anonymizePosts<T extends {frames:object[]}>(posts:T[],quotes:CallQuote[]):T[]{
 const entities=quotes.flatMap(q=>(q.privateSpans??[]).map(s=>({text:q.text.slice(s.start,s.start+s.length),company:s.company}))).sort((a,b)=>b.text.length-a.text.length);
 function clean(value:string,quote?:CallQuote,frame=false):string{
  for(const e of entities){if(!e.text)continue;const escaped=e.text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');value=value.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,'giu'),()=>{
   const at=quote?.text.toLowerCase().indexOf(e.text.toLowerCase())??-1;
   if(e.company&&frame&&at<0)throw Error('A company on the slide needs its original word in the attached source quote.');
   if(!e.company||at<0)return '[REDACTED]';
   return [...e.text.matchAll(/\S+/g)].map(m=>`[R:${at+m.index!}:${m[0].length}]`).join(' ');
  });}
  // A marker can only reference an identified company in the attached source quote.
  return value.replace(redactionPattern,(marker,start,length)=>{const a=Number(start),n=Number(length);if(!quote){if(frame)throw Error('A redaction needs its source quote.');return '[REDACTED]';}if(!(quote.privateSpans??[]).some(s=>s.company&&a>=s.start&&a+n<=s.start+s.length)||n<=0)throw Error('A redaction is not backed by its source quote. Use the correct company word offsets.');return marker;});
 }
 function walk(value:unknown,quote?:CallQuote,key='',frame=false):unknown{
  if(key==='quote')return value;
  if(typeof value==='string')return clean(value,quote,frame);
  if(Array.isArray(value))return value.map(x=>walk(x,quote,'',frame));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,walk(v,quote,k,frame)]));
  return value;
 }
 return posts.map(post=>{const {frames,...rest}=post;const cleanedFrames=frames.map(frame=>walk(frame,(frame as {quote?:CallQuote}).quote,'',true));const cleaned={...walk(rest) as object,frames:cleanedFrames} as T;if('hook' in cleaned&&cleanedFrames.length)(cleaned as T & {hook:string}).hook=(cleanedFrames[0] as {heading:string}).heading;return cleaned;});
}
