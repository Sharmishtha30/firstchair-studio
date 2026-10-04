import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ConvexReactClient,useQuery,useMutation,useAction,useConvexAuth} from 'convex/react';
import {ConvexAuthProvider,useAuthActions} from '@convex-dev/auth/react';
import {api} from '../convex/_generated/api';
import type {Brand,Post} from '../convex/studioTypes';
import {TranscriptApp} from './TranscriptApp';
import {drawFrame,exportImages,exportReel} from './render';
import './style.css';
const convexUrl=import.meta.env.VITE_CONVEX_URL;
function Preview({post,brand,index}:{post:Post;brand:Brand;index:number}){
 const [src,setSrc]=useState('');
 useEffect(()=>{let active=true;void drawFrame(post,brand,index).then(c=>{if(active)setSrc(c.toDataURL('image/png'));});return()=>{active=false;};},[post,brand,index]);
 return src?<img className={'artwork '+post.format} src={src} alt={post.frames[index].heading+' — '+post.frames[index].body}/>:<div className="artwork loading">Preparing artwork…</div>;
}
function App(){
 const {isAuthenticated,isLoading}=useConvexAuth();const {signIn,signOut}=useAuthActions();
 const start=useMutation(api.studio.start);const connection=useAction(api.chatgpt.connection);const disconnect=useAction(api.chatgpt.disconnect);
 const [website,setWebsite]=useState(()=>sessionStorage.getItem('studio-website')??'https://foundersfind.club/');
 const [token,setToken]=useState(()=>new URLSearchParams(location.hash.slice(1)).get('pack')??'');
 const [active,setActive]=useState<Post['format']>('carousel');const [slide,setSlide]=useState(0);const [connected,setConnected]=useState(false);
 const [error,setError]=useState('');const [starting,setStarting]=useState(false);const [exporting,setExporting]=useState('');const [copied,setCopied]=useState(false);
 const pack=useQuery(api.studio.get,token?{token}:'skip');
 useEffect(()=>{if(isLoading)return;const params=new URLSearchParams(location.hash.slice(1));const ticket=params.get('chatgpt_ticket');const failure=params.get('chatgpt_error');if(failure){setError(failure);history.replaceState(null,'','/');}if(ticket){const browser=sessionStorage.getItem('chatgpt_browser');history.replaceState(null,'','/');if(!browser){setError('Connection could not be verified. Connect ChatGPT again.');return;}void signIn('chatgpt',{ticket,browser}).then(()=>sessionStorage.removeItem('chatgpt_browser')).catch(()=>setError('ChatGPT connection did not finish. Try again.'));}},[signIn,isLoading]);
 useEffect(()=>{let mounted=true;void connection({}).then(c=>{if(mounted)setConnected(c.connected);}).catch(()=>{});return()=>{mounted=false;};},[connection,isAuthenticated]);
 function connect(){const bytes=crypto.getRandomValues(new Uint8Array(32));const browser=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');sessionStorage.setItem('chatgpt_browser',browser);sessionStorage.setItem('studio-website',website);const site=convexUrl.replace(':3210',':3211').replace('.convex.cloud','.convex.site');location.assign(site+'/chatgpt/start?browser='+browser);}
 async function create(){setError('');setStarting(true);try{const key=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');await start({url:website,token:key});setToken(key);history.replaceState(null,'','/#pack='+key);setSlide(0);}catch(e){setError(e instanceof Error?e.message:'Could not start. Check your website address.');}finally{setStarting(false);}}
 async function download(which:'images'|'reel'){if(!pack?.posts||!pack.brand)return;setExporting('Preparing files…');setError('');try{if(which==='images')await exportImages(pack.posts,pack.brand,setExporting);else await exportReel(pack.posts.find(p=>p.format==='reel')!,pack.brand,setExporting);}catch(e){setError(e instanceof Error?e.message:'Export failed. Try Chrome for video downloads.');}finally{setExporting('');}}
 const post=pack?.posts?.find(p=>p.format===active);
 if(location.hash==='#transcript')return <TranscriptApp/>;
 return <>
  <header className="studio-header"><a href="/" className="wordmark"><span className="mark">↗</span> Call to Reel <span className="beta">STUDIO</span></a><div className="connection">{connected?<><span className="connected-dot"/>ChatGPT connected<button className="text-button" onClick={()=>void disconnect({}).then(()=>signOut()).then(()=>setConnected(false))}>Disconnect</button></>:<button className="text-button" onClick={connect}>Connect ChatGPT ↗</button>}</div></header>
  <main className="studio-main">
   <section className="intro"><p className="eyebrow">YOUR WEBSITE. YOUR NEXT POST.</p><h1>Turn what you sell<br/>into something worth <em>sharing.</em></h1><p className="intro-copy">Short hooks. Real value. Your brand’s voice.<br/>A carousel, a static post and a reel — from one website.</p></section>
   <form className="website-form" onSubmit={e=>{e.preventDefault();void create();}}><label htmlFor="website">Your website</label><div className="url-row"><span aria-hidden>↗</span><input id="website" type="text" inputMode="url" autoComplete="url" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yourbrand.com" required/><button disabled={starting||!!pack&&!pack.posts&&!pack.error}>{starting?'Starting…':'Create Instagram pack →'}</button></div><p>{connected?'Uses your connected ChatGPT plan. No paid API fallback.':'Founders Find is available as a clearly labelled curated example. Connect ChatGPT for live writing from other websites.'}</p></form>
   {error&&<div className="error" role="alert">{error}</div>}
   {pack&&!pack.posts&&!pack.error&&<section className="progress" aria-live="polite"><span className="spinner"/><div><h2>{pack.stage}</h2><p>You can reload this page. Your pack keeps working in Convex.</p></div></section>}
   {pack?.error&&<section className="error" role="alert"><strong>This pack needs attention.</strong><p>{pack.error}</p><button onClick={()=>void create()}>Try again</button></section>}
   {pack?.posts&&pack.brand&&post&&<section className="pack-section">
    <div className="pack-heading"><div><p className="eyebrow">YOUR INSTAGRAM PACK</p><h2>{pack.brand.name}</h2><p className="mode">{pack.mode}</p></div><button className="secondary" disabled={!!exporting} onClick={()=>void download('images')}>Download images + captions ↓</button></div>
    <div className="format-tabs" role="tablist" aria-label="Post format">{(['carousel','static','reel'] as const).map(f=><button key={f} role="tab" aria-selected={active===f} onClick={()=>{setActive(f);setSlide(0);setCopied(false);}}>{f==='carousel'?'01 / Carousel':f==='static'?'02 / Static':'03 / Reel'}<span>{f==='carousel'?'5 slides':f==='static'?'1 image':'25 seconds'}</span></button>)}</div>
    <div className="creative-workspace"><div className="preview-column"><Preview post={post} brand={pack.brand} index={slide}/>{post.frames.length>1&&<div className="slide-nav"><button aria-label="Previous slide" disabled={slide===0} onClick={()=>setSlide(s=>s-1)}>←</button><span>{active==='reel'?'Scene':'Slide'} {slide+1} of {post.frames.length}</span><button aria-label="Next slide" disabled={slide===post.frames.length-1} onClick={()=>setSlide(s=>s+1)}>→</button></div>}</div>
     <aside className="content-column"><p className="eyebrow">THE ANGLE</p><h3>{post.hook}</h3><p>{post.pain}</p><div className="emotion"><span>Emotional tension</span><p>{post.emotion}</p></div><div className="caption-heading"><h4>Instagram caption</h4><button className="text-button" onClick={()=>void navigator.clipboard.writeText(post.caption).then(()=>setCopied(true))}>{copied?'Copied ✓':'Copy caption'}</button></div><p className="caption">{post.caption}</p>
      {active==='reel'&&<div className="media-note"><strong>Motion reel with original music</strong><p>A fictional AI-created portrait with animated text. This is not a talking or lip-synced avatar. Seedance video is not connected yet.</p><button disabled={!!exporting} onClick={()=>void download('reel')}>Download MP4 reel ↓</button></div>}
      <details><summary>Brand notes & sources</summary><p><strong>Audience:</strong> {pack.brand.audience}</p><p><strong>Offer:</strong> {pack.brand.offer}</p><p>{pack.brand.voice}</p><a href={pack.brand.sourceUrl} target="_blank" rel="noreferrer">Read source website ↗</a><ul>{post.sourceFacts.map(f=><li key={f}>{f}</li>)}</ul><p>Images depict original fictional people. Emotions are inferred audience tensions, not customer quotes.</p></details>
     </aside></div>
    {exporting&&<p className="export-progress" role="status">{exporting} Keep this tab open.</p>}
    <div className="integration-status"><span><i/>Seedance: not connected</span><span><i/>Ad library: 0 ads imported</span><p>Provider access is required for generated talking-avatar video and real ad-library inspiration. These have not been faked.</p></div>
   </section>}
  </main><footer className="studio-footer"><span>Built for the next thing you share.</span><a href="/#transcript" onClick={()=>location.reload()}>Open transcript writer ↗</a></footer>
 </>;
}
createRoot(document.getElementById('root')!).render(convexUrl?<ConvexAuthProvider client={new ConvexReactClient(convexUrl)}><App/></ConvexAuthProvider>:<main>Run npm run dev to open the studio.</main>);
