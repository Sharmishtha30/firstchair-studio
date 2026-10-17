import {useEffect,useState} from 'react';
import {useAction,useMutation} from 'convex/react';
import {ConvexError} from 'convex/values';
import {api} from '../convex/_generated/api';
import type {Brand,Post} from '../convex/studioTypes';
import {drawFrame} from './render';
export function CarouselControls({token,post,brand,slide,version,disabled,onBusy,onDone}:{token:string;post:Post;brand:Brand;slide:number;version:number;disabled:boolean;onBusy:(busy:boolean)=>void;onDone:(deleted:boolean)=>void}){
 const edit=useMutation(api.carouselEditor.edit),upload=useAction(api.carouselUpload.photo);
 const [number,setNumber]=useState(String(post.frames[slide].slideNumber??slide+1)),[note,setNote]=useState(''),[error,setError]=useState('');
 useEffect(()=>setNumber(String(post.frames[slide].slideNumber??slide+1)),[slide,post.frames[slide].slideNumber]);
 const target={token,platform:post.platform??'instagram' as const,slide,version};
 async function run(work:()=>Promise<unknown>,success:string,deleted=false){onBusy(true);setError('');setNote('Saving…');try{await work();onDone(deleted);setNote(success);}catch(e){setNote('');setError(e instanceof ConvexError&&typeof e.data==='string'?e.data:e instanceof Error?e.message:'Could not save this change.');}finally{onBusy(false);}}
 async function photo(file:File){await run(async()=>{
  if(file.size>2_000_000)throw Error('Upload a PNG, JPEG or WebP under 2 MB.');
  const url=URL.createObjectURL(file),key='upload-preview';
  try{await drawFrame({...post,frames:post.frames.map((f,i)=>i===slide?{...f,assetKey:key,uploadedPhoto:true,imageStyle:{size:'Full',mode:'fit'}}:f)},{...brand,assets:[...(brand.assets??[]),{key,url,originalUrl:file.name,pageUrl:brand.sourceUrl,alt:file.name,width:1,height:1,role:'uploaded slide photo'}]},slide);}finally{URL.revokeObjectURL(url);}
  await upload({...target,name:file.name,bytes:await file.arrayBuffer()});
 },'Photo saved. PNG and ZIP downloads include it.');}
 return <fieldset className="carousel-controls" disabled={disabled}>
  <legend>Slide controls</legend>
  <div className="slide-number-control"><label>Slide number<input type="number" min="1" max="99" step="1" value={number} onChange={e=>setNumber(e.target.value)}/></label><button type="button" onClick={()=>void run(()=>edit({...target,change:{kind:'number',number:Number(number)}}),'Slide number saved.')}>Save number</button></div>
  <label>Upload slide image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(file)void photo(file);}}/></label>
  <p className="editor-note">PNG, JPEG or WebP, up to 2 MB. Adds or replaces this slide’s photo.</p>
  <button type="button" className="delete-slide" disabled={disabled||post.frames.length===1} onClick={()=>void run(()=>edit({...target,change:{kind:'delete'}}),'Slide deleted. Remaining slides renumbered.',true)}>Delete slide {slide+1}</button>
  {post.frames.length===1&&<p className="editor-note">Keep at least one slide.</p>}
  {note&&<p role="status" className="editor-note">{note}</p>}{error&&<p role="alert">{error}</p>}
 </fieldset>;
}
