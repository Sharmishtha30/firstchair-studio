import React,{useState} from 'react';
import {checkArticleInput} from '../convex/articleInput';
import {callLimits,needsCustomerSpeaker,transcriptSpeakers} from '../convex/customerCall';
import {readTranscriptFile} from './transcriptFile';
export type CallDraft={kind?:'call'|'article';name:string;text:string;customerSpeaker:string};
export const emptyCall:CallDraft={kind:'call',name:'',text:'',customerSpeaker:''};
// The server repeats every check.
export function callForStart(call:CallDraft){return call.text.trim()?{name:call.name||(call.kind==='article'?'Pasted article':'Pasted transcript'),text:call.text,...(call.customerSpeaker?{customerSpeaker:call.customerSpeaker}:{})}:undefined;}
export function callProblem(call:CallDraft){
 if(!call.text.trim())return '';
 if(call.kind==='article'){try{checkArticleInput(call);return '';}catch(e){return (e as Error).message;}}
 if(call.text.trim().length<callLimits.minChars)return 'Add more of the call — at least a few customer answers.';
 if(call.text.length>callLimits.maxChars)return 'This transcript is too long. Paste up to about an hour of conversation.';
 if(needsCustomerSpeaker(call.text)&&!call.customerSpeaker)return 'Choose which speaker is your customer.';
 return '';
}
// Screen 2 of the landing flow. Sign-in stays with the header's Connect ChatGPT button.
export function CallStep({website,call,onChange,connected,busy,onContinue,onBack}:{website:string;call:CallDraft;onChange:(call:CallDraft)=>void;connected:boolean;busy:boolean;onContinue:()=>void;onBack:()=>void}){
 const [fileError,setFileError]=useState(''),[reading,setReading]=useState(false),[drafts,setDrafts]=useState<Partial<Record<'call'|'article',CallDraft>>>({});
 function selectKind(kind:'call'|'article'){setDrafts(prev=>({...prev,[call.kind??'call']:call}));setFileError('');onChange(drafts[kind]??{...emptyCall,kind});}
 const article=call.kind==='article';
 const speakers=call.text?transcriptSpeakers(call.text):[],chooseSpeaker=!article&&!!call.text&&needsCustomerSpeaker(call.text),problem=callProblem(call);
 async function upload(file:File){setFileError('');setReading(true);try{const text=await readTranscriptFile(file);if(!text.trim())throw new Error('This file has no transcript text.');onChange({...call,text,name:file.name,customerSpeaker:''});}catch(e){setFileError(e instanceof Error?e.message:'This file could not be read.');}finally{setReading(false);}}
 return <section className="call-step" aria-labelledby="call-step-title">
  <p className="call-step-site"><span>{website}</span><button type="button" className="call-step-back" disabled={busy} onClick={onBack}>Change website</button></p>
  <h1 id="call-step-title">What should your posts come from?</h1>
  <div className="source-choice" role="group" aria-label="Content source"><button type="button" aria-pressed={!article} disabled={busy} onClick={()=>selectKind('call')}>Call transcript</button><button type="button" aria-pressed={article} disabled={busy} onClick={()=>selectKind('article')}>Article</button></div>
  <p className="call-step-intro">{article?'Paste your article or upload a .txt or .docx file. Your website supplies only colours and fonts; the article supplies the content.':'Paste a sales or feedback call, or upload a .txt, .docx or .vtt transcript. Your website supplies only colours and fonts; the call supplies the story.'}</p>
  <div className="call-input">
   <label className="sr-only" htmlFor="call-text">{article?'Article text':'Call transcript'}</label>
   <textarea id="call-text" value={call.text} maxLength={article?60000:callLimits.maxChars} disabled={busy||reading} placeholder={article?'Paste the full article here…':'Founder: What was hard before?\nCustomer: …'} onChange={e=>onChange({...call,text:e.target.value,name:article?'Pasted article':call.name&&call.name!=='Pasted transcript'&&e.target.value?call.name:'Pasted transcript'})}/>
   <div className="call-row"><label className="call-file">{reading?'Reading file…':article?'Upload article':'Upload transcript'}<input type="file" accept=".txt,.docx,.vtt,text/plain,text/vtt,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={busy||reading} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void upload(file);}}/></label>
   {call.text&&<span className="call-name">{call.name||'Pasted transcript'} · {call.text.trim().split(/\s+/).length} words</span>}</div>
   {chooseSpeaker&&<label className="call-speaker">Which speaker is your customer?<select value={call.customerSpeaker} onChange={e=>onChange({...call,customerSpeaker:e.target.value})}><option value="">Choose a speaker</option>{speakers.map(s=><option key={s} value={s}>{s}</option>)}</select></label>}
   {fileError&&<p className="call-error" role="alert">{fileError}</p>}
   {problem&&<p className="call-error" role="status">{problem}</p>}
   {!connected&&<p className="call-signin" role="status">Starting your private browser session. What you typed stays here.</p>}
   <p className="call-privacy">{article?"Saved only to this browser’s private session.":"Saved only to this browser’s private session. Delete it any time from your results."}</p>
  </div>
  <div className="call-step-actions"><button type="button" className="call-continue" disabled={busy||reading||!connected||!call.text.trim()||!!problem} onClick={onContinue}>{busy?'Starting…':article?'Continue with this article':'Continue with this call'}</button></div>
 </section>;
}
// The original transcript line, so the founder can check the rewritten story is true.
export function SlideQuote({quote,unclear,weakHandoff}:{quote?:{text:string};unclear?:boolean;weakHandoff?:boolean}){
 return <>{unclear&&<p className="slide-unclear" role="status">This slide may not read clearly</p>}{weakHandoff&&<p className="slide-unclear" role="status">This slide may not make the reader want the next one</p>}{quote&&<figure className="slide-quote"><figcaption>From your call</figcaption><blockquote>{quote.text}</blockquote></figure>}</>;
}
type StorylineCard={id:string;title:string;tension:string;turningPoint:string;detail:string;hook:string};
// Ranked strongest hook first. The founder picks one or more; each becomes its own carousel and static.
export function StoryPicker({storylines,read,busy,onChoose}:{storylines:StorylineCard[];read?:{sentences:number;chunks:number};busy:boolean;onChoose:(ids:string[])=>void}){
 const [picked,setPicked]=useState<string[]>([storylines[0]?.id].filter(Boolean));
 const toggle=(id:string)=>setPicked(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
 return <section className="story-picker" aria-labelledby="story-picker-title">
  <h1 id="story-picker-title">Pick the stories to write</h1>
  <p className="story-picker-intro">{read?`We read your whole call — ${read.sentences} customer sentences in ${read.chunks} ${read.chunks===1?'part':'parts'}. `:''}Strongest hook first. Each story you pick becomes its own carousel and static.</p>
  <ol className="story-cards">{storylines.map((s,i)=><li key={s.id}><label className={'story-card'+(picked.includes(s.id)?' is-picked':'')}>
   <input type="checkbox" checked={picked.includes(s.id)} disabled={busy} onChange={()=>toggle(s.id)}/>
   <span className="story-rank">{i+1}</span>
   <span className="story-title">{s.title}</span>
   <strong className="story-hook">{s.hook}</strong>
   <dl><dt>Tension</dt><dd>{s.tension}</dd><dt>Turning point</dt><dd>{s.turningPoint}</dd><dt>Most surprising detail</dt><dd>{s.detail}</dd></dl>
  </label></li>)}</ol>
  <button type="button" className="call-continue" disabled={busy||!picked.length} onClick={()=>onChoose(storylines.filter(s=>picked.includes(s.id)).map(s=>s.id))}>{busy?'Starting…':picked.length>1?`Write ${picked.length} stories`:'Write this story'}</button>
 </section>;
}
export function CallStatus({call,onDelete,busy,token}:{token:string;call:{name:string;saved:boolean;deletedAt?:number;read?:{sentences:number;chunks:number};storylines?:{id:string;title:string}[];chosenId?:string;siblings:{token:string;title:string}[]};onDelete:()=>void;busy:boolean}){
 const story=call.storylines?.find(s=>s.id===call.chosenId);
 return <div className="call-status" role="status">{call.deletedAt?<p>Customer call deleted. The transcript and the lines under each slide were removed from every story made from it. Text already on your slides stays until you edit it.</p>:<><div><p><strong>Customer call:</strong> {call.name}{call.read?` · whole call read (${call.read.sentences} customer sentences)`:''}</p>{story&&<p className="call-story"><strong>Story:</strong> {story.title}</p>}{call.siblings.length>1&&<p className="call-siblings">Stories from this call: {call.siblings.map((s,i)=><React.Fragment key={s.token}>{i>0?' · ':''}{s.token===token?<strong>{s.title}</strong>:<a href={'#pack='+s.token}>{s.title}</a>}</React.Fragment>)}</p>}</div><button type="button" disabled={busy||!call.saved} onClick={()=>{if(confirm('Delete this customer call? The transcript is removed from your account, along with the call lines in every story made from it.'))onDelete();}}>{busy?'Deleting…':'Delete call'}</button></>}</div>;
}
