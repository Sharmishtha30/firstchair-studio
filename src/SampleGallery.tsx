import React,{useEffect,useState} from 'react';
type Sample={slug:string;name:string;url:string;static:string;slides:string[]};
function SampleRow({sample,index}:{sample:Sample;index:number}){
 const [slide,setSlide]=useState(0);
 return <section className="sample-row" aria-labelledby={'sample-'+sample.slug}>
 <div className="sample-site"><span className="sample-number">{String(index+1).padStart(2,'0')}</span><div><h2 id={'sample-'+sample.slug}>{sample.name}</h2><a href={sample.url} target="_blank" rel="noreferrer">{new URL(sample.url).hostname} ↗</a></div></div>
 <div className="sample-pair"><figure><figcaption>Static</figcaption><img loading="lazy" src={sample.static} alt={sample.name+' static creative'}/></figure><figure><figcaption>Carousel <span>{sample.slides.length} slides</span></figcaption><img loading="lazy" src={sample.slides[slide]} alt={sample.name+' carousel slide '+(slide+1)}/><div className="sample-slide-nav"><button aria-label={'Previous '+sample.name+' slide'} disabled={slide===0} onClick={()=>setSlide(slide-1)}>←</button><span>{slide+1} / {sample.slides.length}</span><button aria-label={'Next '+sample.name+' slide'} disabled={slide===sample.slides.length-1} onClick={()=>setSlide(slide+1)}>→</button></div></figure></div>
 </section>;
}
export function SampleGallery({onClose}:{onClose:()=>void}){
 const [samples,setSamples]=useState<Sample[]>([]),[error,setError]=useState(false);
 useEffect(()=>{let active=true;void fetch('/samples/index.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(s=>{if(active)setSamples(s);}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[]);
 return <div className="sample-page"><header className="sample-header"><a className="firstchair-name" href="/">FirstChair</a><button onClick={onClose} className="sample-back">Back to studio ↗</button></header><main className="sample-main"><div className="sample-intro"><p>Made with FirstChair</p><h1>Different websites.<br/>Their own creative worlds.</h1><p>Saved test previews. One static and one carousel for every website.</p></div>{error?<p role="alert">The gallery could not load. Please refresh.</p>:!samples.length?<p role="status">Opening the gallery…</p>:samples.map((s,i)=><SampleRow key={s.slug} sample={s} index={i}/>)}<p className="sample-footnote">These are saved test outputs, including reviewed and edited examples. They do not guarantee the same result for every website.</p></main></div>;
}
