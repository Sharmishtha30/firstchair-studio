import {v} from 'convex/values';
import {needsCustomerSpeaker,transcriptSpeakers} from './content';
// A customer call is founder-supplied text. Source lines are verbatim customer sentences chosen by ID, never model-written.
export type CallQuote={id:string;text:string;group?:'pain'|'today'|'easier'};
export const callQuoteV=v.object({id:v.string(),text:v.string(),group:v.optional(v.union(v.literal('pain'),v.literal('today'),v.literal('easier')))});
export const callInputV=v.object({name:v.string(),text:v.string(),customerSpeaker:v.optional(v.string())});
// No truncation anywhere: longer input is refused with a message, and every accepted sentence is read in chunks.
export const callLimits={minChars:200,maxChars:150_000,maxName:120,maxSentences:4000,chunkChars:12_000,maxFileBytes:5*1024*1024};
export {transcriptSpeakers,needsCustomerSpeaker};

export function checkCallInput(input:{name:string;text:string;customerSpeaker?:string}){
 const text=input.text.replace(/\r\n?/g,'\n').trim(),name=(input.name.trim()||'Pasted transcript').slice(0,callLimits.maxName);
 if(text.length<callLimits.minChars)throw new Error('The call transcript is too short. Paste at least a few customer answers.');
 if(text.length>callLimits.maxChars)throw new Error('The call transcript is too long. Paste up to about two hours of conversation (150,000 characters).');
 const customerSpeaker=input.customerSpeaker?.trim()||undefined;
 if(customerSpeaker&&!transcriptSpeakers(text).some(s=>s.toLowerCase()===customerSpeaker.toLowerCase()))throw new Error('The chosen customer speaker is not in this transcript.');
 readCall(text,customerSpeaker);
 return {name,text,customerSpeaker};
}

const smallTalk=/^(?:hi|hello|hey|yes|yeah|yep|thanks|thank|you|okay|ok|sure|right|so|um|uh|great|cool|no|problem|totally|absolutely|exactly|of|course|mhm|hmm|good|morning|nice|meet)$/;
const words=(text:string)=>text.toLowerCase().replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}'\s]+/gu,' ').split(/\s+/).filter(Boolean);
const customerRole=/^(customer|client|buyer|user|participant)$/i;
const timestamp=/^\[?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?\]?\s*(?:[-–—]\s*)?/;
const turn=(line:string)=>{const m=line.match(/^([^:]{1,40}):\s*(.*)$/);return m&&!/^\d+$/.test(m[1])?{speaker:m[1].trim(),text:m[2].trim()}:null;};
const substantive=(sentence:string)=>{const w=words(sentence);return w.length>=3&&!w.every(x=>smallTalk.test(x));};
export type CallChunk={text:string;ids:string[]};
// The whole transcript in order, split into chunks for the model. Customer sentences carry IDs; other speakers stay as context.
export function readCall(text:string,customerSpeaker?:string,chunkChars:number=callLimits.chunkChars):{sentences:string[];chunks:CallChunk[]}{
 if(needsCustomerSpeaker(text)&&!customerSpeaker)throw new Error('Choose which speaker is the customer. Only that person’s words are used.');
 const lines=text.replace(/\r\n?/g,'\n').split('\n').map(l=>l.trim().replace(timestamp,'')).filter(Boolean),labelled=lines.some(l=>turn(l));
 const sentences:string[]=[],index=new Map<string,number>(),chunks:CallChunk[]=[];
 let current='',ids:string[]=[],customer=!labelled,speaker='Customer';
 for(const line of lines){
  const t=labelled?turn(line):null;let body=line;
  if(t){speaker=t.speaker;body=t.text;customer=customerSpeaker?t.speaker.toLowerCase()===customerSpeaker.toLowerCase():customerRole.test(t.speaker);}
  if(!body)continue;
  const local:string[]=[];let rendered:string;
  if(customer)rendered='Customer: '+(body.match(/[^.!?]+[.!?]*/g)??[body]).map(p=>p.trim()).filter(Boolean).map(p=>{if(!substantive(p))return p;let i=index.get(p);if(i===undefined){i=sentences.length;sentences.push(p);index.set(p,i);}local.push('C'+i);return `[C${i}] ${p}`;}).join(' ');
  else rendered=`${speaker}: ${body.slice(0,400)}`;
  if(current&&current.length+rendered.length>chunkChars){chunks.push({text:current,ids});current='';ids=[];}
  current+=rendered+'\n';for(const id of local)if(!ids.includes(id))ids.push(id);
 }
 if(current)chunks.push({text:current,ids});
 if(sentences.length<3)throw new Error('The transcript needs at least three things the customer said. Greetings and the interviewer’s questions do not count.');
 if(sentences.length>callLimits.maxSentences)throw new Error('This transcript has more customer speech than one pack can read. Split the call into two transcripts.');
 return {sentences,chunks:chunks.filter(c=>c.ids.length)};
}
export function callCandidates(text:string,customerSpeaker?:string){return readCall(text,customerSpeaker).sentences;}

// 3–5 storylines mined from every chunk, ranked by hook strength (array order). The founder picks which to write.
export type Storyline={id:string;title:string;tension:string;turningPoint:string;detail:string;hook:string;lineIds:string[]};
export const storylineV=v.object({id:v.string(),title:v.string(),tension:v.string(),turningPoint:v.string(),detail:v.string(),hook:v.string(),lineIds:v.array(v.string())});
type RawStoryline=Omit<Storyline,'id'>;
export function checkStorylines(raw:RawStoryline[],sentences:string[]):{storylines:Storyline[];lines:CallQuote[]}{
 const valid=(id:string)=>/^C\d+$/.test(id)&&Number(id.slice(1))<sentences.length;
 const storylines:Storyline[]=[];
 for(const s of raw){
  const lineIds=[...new Set(s.lineIds.filter(valid))],hook=s.hook.replace(/[“”"]/g,'').trim(),fields=[s.title,s.tension,s.turningPoint,s.detail].map(x=>x.trim());
  if(lineIds.length<2||!hook||words(hook).length>=12||fields.some(f=>!f))continue;
  storylines.push({id:'S'+(storylines.length+1),title:fields[0],tension:fields[1],turningPoint:fields[2],detail:fields[3],hook,lineIds});
  if(storylines.length===5)break;
 }
 if(!storylines.length)throw new Error('No storyline in this call had a clear tension backed by what the customer said.');
 const ids=[...new Set(storylines.flatMap(s=>s.lineIds))];
 return {storylines,lines:ids.map(id=>({id,text:sentences[Number(id.slice(1))]}))};
}

// Legacy two-line brief, kept so packs saved before storylines still validate.
const beatV=v.object({summary:v.string(),quoteIds:v.array(v.string())});
export const callStoryV=v.object({line1:v.string(),line2:v.string(),problem:beatV,tried:beatV,cost:beatV,changed:beatV});

type StoryFrame={heading:string;body:string;eyebrow?:string;design?:{takeaway:string};items?:{label:string;detail:string}[];quote?:{id:string;text:string}};
export function slideText(frame:StoryFrame){return [frame.eyebrow,frame.heading,frame.body,frame.design?.takeaway,...(frame.items??[]).flatMap(i=>[i.label,i.detail])].filter(Boolean).join(' \n ');}
const firstPerson=/\b(i|i'm|i've|i'd|i'll|me|my|mine|myself|we|we're|we've|our|us)\b/;
const genericHook=/^(struggling|tired of|sick of|want to|ready to|looking for|do you|are you|ever wondered|did you know)\b/i;
// Story rules for call packs. Rewritten lines are never presented as direct quotes.
export function checkCallStory(posts:{format:string;platform?:string;frames:StoryFrame[]}[],quotes:CallQuote[],brandName:string){
 const brand=brandName.trim().toLowerCase();
 for(const post of posts){
  const n=post.frames.length,label=`${post.platform??'instagram'} ${post.format}`;
  if(post.format==='carousel'&&(n<5||n>7))throw new Error(`The ${label} must tell the story in 5 to 7 slides.`);
  post.frames.forEach((frame,i)=>{
   const where=`${label} slide ${i+1}`,text=slideText(frame),count=words(text).length,cta=post.format==='carousel'&&i===n-1;
   if(/[“”"«»]/.test(text))throw new Error(`The ${where} uses quotation marks. Rewrite the customer’s story in your own first-person words, without presenting it as a direct quote.`);
   if(/\b(a|the|one|our)\s+customer\s+(said|says|told|request|wish|quote)|\bcustomer:\s/i.test(text))throw new Error(`The ${where} labels its line as a customer quote. Tell the story in first person instead.`);
   if(!cta){
    const quote=frame.quote&&quotes.find(q=>q.id===frame.quote!.id&&q.text===frame.quote!.text);
    if(!quote)throw new Error(`The ${where} is not linked to the transcript line it comes from. Set its quoteId.`);
    if(!firstPerson.test(words(text).join(' ')))throw new Error(`The ${where} is not in the customer’s first-person voice ("I…").`);
   }
   if(post.format==='carousel'&&i===0){
    if(count>=12)throw new Error(`The ${label} hook has ${count} words. Keep slide 1 under 12 words.`);
    if(brand&&text.toLowerCase().includes(brand))throw new Error(`The ${label} hook names the brand. Open with the customer’s tension instead.`);
    if(genericHook.test(frame.heading.trim()))throw new Error(`The ${label} hook is a generic question. Open with a specific tension, number or admission from the story.`);
   }else if(count>25)throw new Error(`The ${where} has ${count} words. Keep each slide to 25 words or fewer.`);
  });
 }
 return posts;
}
// Reviewer slide checks become editor warnings. Handoff only applies from carousel slide 2 to the slide before the closing action.
export function flagSlides<T extends {format:string;platform?:string;frames:object[]}>(posts:T[],checks:{platform:string;format:string;slide:number;clear:boolean;raisesQuestion?:boolean}[]):T[]{
 return posts.map(p=>({...p,frames:p.frames.map((f,i)=>{
  const check=checks.find(x=>x.platform===(p.platform??'instagram')&&x.format===p.format&&x.slide===i+1);
  const handoff=p.format==='carousel'&&i>0&&i<p.frames.length-1;
  return {...f,...(check&&!check.clear?{unclear:true}:{}),...(check&&handoff&&check.raisesQuestion===false?{weakHandoff:true}:{})};
 })}));
}
// Replaces the writer's quoteId with the stored quote so only real quotes reach the database.
export function attachQuotes<T extends {posts:{frames:object[]}[]}>(result:T,quotes:CallQuote[]):T{
 return {...result,posts:result.posts.map(post=>({...post,frames:post.frames.map(frame=>{const {quoteId,...rest}=frame as {quoteId?:string};const quote=quotes.find(q=>q.id===quoteId);return quote?{...rest,quote}:rest;})}))};
}
export function stripQuotes<T extends {frames:object[]}>(posts?:T[]){return posts?.map(post=>({...post,frames:post.frames.map(frame=>{const {quote,...rest}=frame as {quote?:unknown};return rest;})})) as T[]|undefined;}
