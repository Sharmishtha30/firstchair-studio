import {useState} from 'react';
import {useMutation} from 'convex/react';
import {api} from '../convex/_generated/api';
import {directionKeys,nextDirectionStep,onboardingCategories,progressMessage,type DirectionAnswers} from '../convex/onboarding';
const questions=['What should your posts do?','What should we feature?','Is this your business type?','What should these posts talk about?','How should your posts sound?'];
type DirectionPack={directionAnswers?:DirectionAnswers;detectedCategory?:string;stage:string;inspectionComplete:boolean;sourcePages?:{blocks:{kind:string;text:string}[]}[]};
export function Direction({token,pack}:{token:string;pack:DirectionPack}){
 const save=useMutation(api.studio.saveDirectionAnswer);
 const [step,setStep]=useState(()=>nextDirectionStep(pack.directionAnswers));
 const [text,setText]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const key=directionKeys[step];
 const saved=pack.directionAnswers?.[key];
 async function answer(value:string){setBusy(true);setError('');try{await save({token,key,value});if(step<directionKeys.length-1){setStep(step+1);setText(null);}}catch(e){setError(e instanceof Error?e.message:'Your answer could not be saved. Try again.');}finally{setBusy(false);}}
 function choices(items:[string,string][],category=false){return <div className={'journey-choices'+(category?' journey-category-choices':'')}>{items.map(([value,label])=><button key={value} type="button" disabled={busy} aria-pressed={value===saved||category&&!saved&&value===pack.detectedCategory} onClick={()=>void answer(value)}>{label}{category&&value===pack.detectedCategory&&<small>Detected</small>}</button>)}</div>;}
 const topics=[...new Set((pack.sourcePages?.[0]?.blocks??[]).filter(b=>/^h[123]$/.test(b.kind)&&b.text.length>8&&b.text.length<90&&!/^(menu|log in|sign up|subscribe|shop now|contact|cookies)/i.test(b.text)).map(b=>b.text))].slice(0,3);
 function custom(label:string,placeholder:string){return <form onSubmit={e=>{e.preventDefault();void answer((text??saved??'').trim()||(key==='tone'?'Match the website':'Choose for me'));}}><label className="sr-only" htmlFor={'direction-'+key}>{label}</label><input id={'direction-'+key} value={text??saved??''} maxLength={600} disabled={busy} onChange={e=>setText(e.target.value)} placeholder={placeholder}/><button type="submit" disabled={busy}>{busy?'Saving…':'Continue'}</button></form>;}
 return <section className="direction-panel journey-question journey-six-questions">
 <>{step===0&&<p className="onboarding-intro">This takes about 5 minutes. Answer a few quick questions while we read your website.</p>}</>
 <div className="journey-dots" aria-label={'Question '+(step+1)+' of '+directionKeys.length}>{directionKeys.map((k,i)=><span key={k} className={i===step?'active':''}/>)}</div>
 <div className="question-content" key={step}><h2>{questions[step]}</h2>
 {step===0&&choices([['understand','Build awareness'],['enquire','Get enquiries'],['buy','Drive sales']])}
 {step===1&&<><p>A product, programme, service, or your whole business.</p>{custom('Product, programme or service','Choose for me')}</>}
 {step===2&&<><p>{pack.detectedCategory?'We detected '+pack.detectedCategory+'. Tap it to confirm, or choose another.':pack.inspectionComplete?'Choose the category that best fits your business.':'We’re still reading your site. You can choose your category now.'}</p>{choices(onboardingCategories.map(c=>[c,c]),true)}</>}
 {step===3&&<>{topics.length>0&&<><p>Topics found on your website</p>{choices(topics.map(t=>[t,t]))}</>}{custom('Topic','Enter a topic, or choose for me')}</>}
 {step===4&&<>{choices([['Match the website','Match the website'],['Clear and direct','Clear and direct'],['Warm and friendly','Warm and friendly'],['Bold and playful','Bold and playful'],['Calm and reassuring','Calm and reassuring']])}{custom('Custom tone','Or enter your own tone')}</>}
 {step>0&&<button className="text-button" type="button" disabled={busy} onClick={()=>{setStep(step-1);setText(null);setError('');}}>Back</button>}
 {error&&<p role="alert" className="direction-error">{error}</p>}
 </div>
 <p className="journey-status" role="status">{!pack.inspectionComplete&&<span className="spinner"/>}{pack.inspectionComplete?(pack.sourcePages?.length?'Website ready. Writing starts after your last answer.':'Saved sample ready. Finish your answers to open it.'):progressMessage(pack.stage)}</p>
 </section>;
}
