import type {Post} from './studioTypes';
import type {CreativeAsset} from './creativeTypes';
// Conservative copy budgets catch crowded drafts before they reach the renderer.
// Pixel checks remain authoritative: font metrics vary by brand.
// story: call-pack carousels may use type-led slides; character limits still apply.
export function checkDesignDensity(posts:Post[],{story=false}:{story?:boolean}={}){
 for(const post of posts)for(const [i,f] of post.frames.entries()){
  const d=f.design;if(!d)continue;
  if(!story&&post.format==='carousel'&&i>0&&!f.assetKey&&(f.items?.length??0)<2)throw Error(`${post.platform} carousel slide ${i+1}: needs a relevant source image or a compact visual comparison/process, not another text-only page.`);
  const visible=[f.heading,f.body,f.eyebrow??'',d.takeaway,...(f.items??[]).flatMap(item=>[item.label,item.detail])].join(' ').trim().split(/\s+/).filter(Boolean);
  if(post.format==='carousel'&&visible.length>(story?40:32))throw Error(`${post.platform} carousel slide ${i+1}: exceeds 32 visible words. Keep one idea, show it visually and move explanation into the caption.`);
  const limit=(value:string,max:number,label:string)=>{if(value.trim().length>max)throw Error(`${post.platform} ${post.format} slide ${i+1}: ${d.layout} ${label} exceeds ${max} characters. Rewrite concisely; move context to the caption.`);};
  if(d.layout==='product'){limit(f.heading,36,'heading');limit(f.body,24,'body');limit(f.heading+f.body,60,'combined copy');limit(d.takeaway,28,'takeaway');if(f.items?.length||f.eyebrow?.trim())throw Error('Product frames need the product and short copy; move labels and explanations to captions.');if(!f.assetKey)throw Error('Product layout needs a supplied product image.');}
  if(d.layout==='photo'){limit(f.heading,65,'heading');limit(f.body,90,'body');limit(d.takeaway,45,'takeaway');if(f.items?.length)throw Error('Photo frames need one short idea; move item explanations to the caption.');}
  if(d.layout==='poster'){limit(f.heading,100,'heading');limit(f.body,140,'body');limit(d.takeaway,80,'takeaway');}
  if(d.layout==='note'){limit(f.heading,90,'heading');limit(f.body,260,'body');limit(d.takeaway,100,'takeaway');}
  if(d.layout==='diagram'){
   if(!f.items||f.items.length<2||f.items.length>4)throw Error('A connected-step diagram requires 2–4 supported steps.');
   limit(f.heading,90,'heading');limit(f.body,100,'body');limit(d.takeaway,80,'takeaway');
   for(const item of f.items){limit(item.label,36,'step label');limit(item.detail,75,'step detail');}
  }
  if(d.layout==='split'&&!f.assetKey&&f.items?.length){limit(f.heading,100,'heading');limit(f.body,140,'body');limit(d.takeaway,100,'takeaway');for(const item of f.items){limit(item.label,40,'column label');limit(item.detail,110,'column detail');}}
 }
}

// Ingestion roles are filename/DOM hints, not a semantic verdict.
// The evidence reviewer still decides whether a candidate shows the named product.
export function productImageKeys(assets:Pick<CreativeAsset,'key'|'role'>[]){return assets.filter(a=>a.role==='product'||a.role==='editorial').map(a=>a.key);}

// story: in call packs only the static and the carousel's closing action slide must lead with the product.
export function checkProductPriority(posts:Post[],priority:string|undefined,assets:Pick<CreativeAsset,'key'|'role'>[],{story=false}:{story?:boolean}={}){
 const allowed=productImageKeys(assets);
 if(priority!=='product'||!allowed.length)return;
 for(const post of posts)for(const [index,frame] of post.frames.entries()){if(story&&post.format==='carousel'&&index<post.frames.length-1)continue;if(frame.design?.layout!=='product'||!allowed.includes(frame.assetKey??''))throw Error(`${post.platform} ${post.format} slide ${index+1}: tangible product must lead every slide using product layout and a supplied product asset. Show a different relevant product detail or source scene; keep explanation in captions.`);}
}
