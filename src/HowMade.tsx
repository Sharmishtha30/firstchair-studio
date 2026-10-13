import type {CallMaking} from '../convex/callMaking';
import {publicRedactions} from '../convex/callPrivacy';
import './howMade.css';
const text=(value:string)=>publicRedactions(value);
function Choice({title,step}:{title:string;step:{options:string[];pick:number;reason:string}}){return <section><h3>{title}</h3><ol>{step.options.map((option,i)=><li key={i}>{text(option)}{i+1===step.pick&&<strong> — Selected</strong>}</li>)}</ol><p><strong>Pick:</strong> {step.pick}</p><p><strong>Why:</strong> {text(step.reason)}</p></section>;}
export function HowMade({making}:{making?:CallMaking}){
 if(!making)return null;
 return <details className="how-made"><summary>How this was made</summary><div>
 {making.insights&&<section><h3>1. Insights</h3><p><strong>Ideal customer:</strong> {text(making.insights.audience)}</p><ol>{making.insights.options.map((option,i)=><li key={i}>{text(option.text)}{i+1===making.insights!.pick&&<strong> — Selected</strong>}<small>Source sentences: {option.lineIds.join(', ')}</small></li>)}</ol><p><strong>Pick:</strong> {making.insights.pick}</p><p><strong>Why:</strong> {text(making.insights.reason)}</p></section>}
 {making.concept&&<Choice title="2. Concept" step={making.concept}/>}
 {making.hooks&&<Choice title="3. Hooks" step={making.hooks}/>}
 {making.story&&<section><h3>4. Story</h3><dl>{([['admission','Admission'],['situation','Situation'],['middleTurn','Middle turn'],['unmetNeed','Unmet need'],['answer','Brand answer']] as const).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{text(making.story![key])}</dd></div>)}</dl></section>}
 {making.slides&&<section><h3>5. Hook and body</h3>{making.slides.map(post=><div key={post.platform}><h4>{post.platform}</h4><ol>{post.frames.map((f,i)=><li key={i}>{text([f.heading,f.body].filter(Boolean).join(' '))}</li>)}</ol></div>)}</section>}
 {making.carousel&&<section><h3>6. Carousel</h3>{making.carousel.map(post=><p key={post.platform}>{post.platform}: {post.layouts.length} slides sent to the existing carousel design. Layouts: {post.layouts.join(', ')}.</p>)}</section>}
 </div></details>;
}
