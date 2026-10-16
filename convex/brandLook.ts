import {v} from 'convex/values';
import {contrastRatio} from './appearance';
import type {Post} from './studioTypes';
import {defaultWebsitePalette,type Palette} from './brandPalette';

// Colours for all website packs, photos for D2C only. No website object reaches a model;
// colours and images are attached after the copy has been written and reviewed.
export const lookV=v.object({background:v.string(),secondary:v.string(),text:v.string(),heading:v.string(),accent:v.string()});
export type Look={background:string;secondary:string;text:string;heading:string;accent:string};
export const brandLookV=v.object({applied:v.boolean(),d2c:v.optional(v.boolean()),label:v.string(),reason:v.string(),colours:v.optional(v.object({primary:v.string(),secondary:v.string(),background:v.string()})),images:v.optional(v.array(v.string()))});
export type BrandLook={applied:boolean;d2c?:boolean;label:string;reason:string;colours?:{primary:string;secondary:string;background:string};images?:string[]};
export const allowsBrandPhotos=(look:BrandLook)=>look.d2c??!!look.images?.length;
type Asset={key:string;role:string;width:number;height:number;alt:string;originalUrl?:string};

const consumerCategories=['D2C brand','Food and beverage','Fashion and beauty','Consumer tech and wearables'];
export const isPhoto=(a:Asset)=>a.key.startsWith('image-')&&!/decoration|icon/i.test(a.role)&&Math.min(a.width,a.height)>=400&&a.width/a.height>=.6&&a.width/a.height<=2;
const productPath=(url:string)=>{try{return /\/(products?|collections?|shop)\//i.test(new URL(url).pathname);}catch{return false;}};

/** Sells its own physical products direct to consumers: a consumer-goods category with product evidence, or strong product evidence alone. */
export function classifyD2C(i:{category?:string;assets:Asset[];pageUrls:string[];productPageUrls?:string[]}){
 const productImages=i.assets.filter(a=>isPhoto(a)&&a.role==='product').length,productPages=new Set(i.pageUrls.filter(url=>productPath(url)||i.productPageUrls?.includes(url))).size;
 const consumer=!!i.category&&consumerCategories.includes(i.category);
 const d2c=consumer&&(productImages>=2||productPages>=1)||productPages>=2&&productImages>=3;
 const evidence=`category "${i.category??'unknown'}", ${productImages} product image${productImages===1?'':'s'}, ${productPages} product page${productPages===1?'':'s'}`;
 return {d2c,reason:`${d2c?'D2C brand':'Not a D2C brand'}: ${evidence}.`};
}

const generic=/^(video poster|media card|image|banner|slide|untitled|product image|website)/i;
const stem=(a:Asset)=>{const alt=a.alt.trim();if(alt&&!generic.test(alt))return 'alt:'+alt.toLowerCase();try{return 'file:'+new URL(a.originalUrl??a.key).pathname.split('/').pop()!.replace(/\.[a-z]+$/i,'').replace(/[_-]?[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i,'').replace(/[_-]?\d+$/,'').toLowerCase();}catch{return a.key;}};
/** Up to six distinct real photos: products first, then images with a descriptive alt and a near-square shape. */
export function pickBrandImages(assets:Asset[],max=6){
 const score=(a:Asset)=>(a.role==='product'?2:0)+(a.alt.trim()&&!generic.test(a.alt.trim())?2:0)+(a.width/a.height>=.8&&a.width/a.height<=1.25?1:0);
 const seen=new Set<string>(),picked:string[]=[];
 for(const a of assets.map((a,i)=>({a,i})).filter(x=>isPhoto(x.a)).sort((x,y)=>score(y.a)-score(x.a)||x.i-y.i).map(x=>x.a)){
  const id=stem(a);if(seen.has(id))continue;seen.add(id);picked.push(a.key);if(picked.length===max)break;
 }
 return picked;
}

const rgb=(hex:string)=>hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255);
function hsl(hex:string){const [r,g,b]=rgb(hex),max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,d=max-min;
 const s=d===0?0:d/(1-Math.abs(2*l-1));let h=0;if(d)h=max===r?60*(((g-b)/d)%6):max===g?60*((b-r)/d+2):60*((r-g)/d+4);return {h:(h+360)%360,s,l};}
/** A colour that reads as a brand colour rather than white, black or a grey. */
export const isBrandColour=(hex:string)=>{if(!/^#[0-9a-f]{6}$/i.test(hex))return false;const {s,l}=hsl(hex);return s>=.25&&l>=.12&&l<=.9;};
const distinct=(a:string,b:string)=>{const x=hsl(a),y=hsl(b),dh=Math.min(Math.abs(x.h-y.h),360-Math.abs(x.h-y.h));return dh>=40||Math.abs(x.l-y.l)>=.3;};
/** Honour the site's selected CSS roles, including neutral brands; only then fall back to the logo. */
export function brandColours(palette:Palette|undefined,logoColours:string[]=[]){
 const css=palette&&palette.note!==defaultWebsitePalette.note?[palette.primary,palette.paper,palette.ink,palette.accent,...(palette.observed??[])].filter(c=>palette.observed===undefined||palette.observed.some(observed=>observed.toLowerCase()===c.toLowerCase())).map(c=>c.toLowerCase()).filter(isHex):[];
 for(const [source,colours] of [['website CSS',css],['logo',logoColours.map(c=>c.toLowerCase()).filter(isHex)]] as const){
  const primary=colours.find(c=>c!=='#ffffff');if(!primary)continue;
  const secondary=colours.find(c=>c!==primary&&distinct(c,primary))??(hsl(primary).l>.5?'#101010':'#ffffff');
  return {primary,secondary,background:palette&&css.includes(palette.paper.toLowerCase())?palette.paper.toLowerCase():'#ffffff',source};
 }
 return undefined;
}
/** Text that stays readable (4.5:1) on a card colour, preferring the brand's other colour. */
export function readableOn(background:string,preferred:string[]){
 return [...preferred,'#101010','#ffffff','#000000'].find(c=>isHex(c)&&contrastRatio(c,background)>=4.5)??'#000000';
}
export const brandHighlight=(phrase:string,background:string)=>({phrase,background,colour:readableOn(background,[])});
const isHex=(c:string)=>/^#[0-9a-f]{6}$/i.test(c);
/** Card colours for one slide: primary on covers, alternating with secondary inside the carousel. */
export function slideLook(colours:{primary:string;secondary:string},alternate:boolean):Look{
 const background=alternate?colours.secondary:colours.primary,other=alternate?colours.primary:colours.secondary;
 // Headings take the brand's other colour when it reads well; body text stays neutral for comfortable reading.
 const heading=readableOn(background,[other]),text=readableOn(background,[]);
 return {background,secondary:other,text,heading,accent:contrastRatio(other,background)>=3?other:heading};
}

const words=(t:string)=>t.trim().split(/\s+/).filter(Boolean).length;
/** Cover and static carry the best image; inside the carousel, short single-idea slides take the next images. */
export function applyBrandLook(posts:Post[],colours:{primary:string;secondary:string},images:string[]):Post[]{
 return posts.map(post=>{
  let next=1;
  return {...post,frames:post.frames.map((f,i)=>{
   const roomy=!f.items?.length&&words([f.heading,f.body].join(' '))<=22;
   const assetKey=i===0?images[0]??'':roomy&&next<images.length?images[next++]:'';
   return {...f,assetKey,look:slideLook(colours,post.format==='carousel'&&i%2===1)};
  })};
 });
}

export function decideBrandLook(i:{kind:'website'|'article'|'call';category?:string;assets:Asset[];pageUrls:string[];productPageUrls?:string[];palette?:Palette;logoColours?:string[]}):BrandLook{
 if(i.kind!=='website')return {applied:false,label:'Standard look: website used for colours and fonts only',reason:'Not classified: in article and call packs the website supplies colours and fonts only, so no website images are used.'};
 const kind=classifyD2C(i);
 const candidates=kind.d2c?pickBrandImages(i.assets):[],images=candidates.length>=3?candidates:[];
 const photoReason=!kind.d2c?'Photos are used only for D2C websites.':images.length?`${images.length} website photos.`:`Only ${candidates.length} usable product or lifestyle photos found; 3 are needed.`;
 const found=brandColours(i.palette,i.logoColours);
 if(!found)return {applied:images.length>0,d2c:kind.d2c,label:'Standard white look: no brand colours found',reason:`${kind.reason} No usable website CSS or logo colour found. ${photoReason}`,colours:{primary:'#ffffff',secondary:'#ffffff',background:'#ffffff'},images};
 return {applied:true,d2c:kind.d2c,label:images.length?'Brand colours and photos applied':'Brand colours applied',reason:`${kind.reason} Colours ${found.primary} and ${found.secondary} from the ${found.source}. ${photoReason}`,colours:{primary:found.primary,secondary:found.secondary,background:found.background},images};
}
