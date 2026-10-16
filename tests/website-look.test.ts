import test from 'node:test';
import assert from 'node:assert/strict';
import {brandColours,decideBrandLook,applyBrandLook,slideLook,allowsBrandPhotos,brandHighlight} from '../convex/brandLook';
import {defaultWebsitePalette} from '../convex/brandPalette';
import {contrastRatio} from '../convex/appearance';
import type {Post} from '../convex/studioTypes';

const palette={primary:'#174f49',accent:'#eaad32',paper:'#fff7ed',ink:'#101010',observed:['#174f49','#eaad32','#fff7ed','#101010'],note:'Website CSS'};
const photos=Array.from({length:3},(_,i)=>({key:'image-'+i,role:'product',width:1000,height:1000,alt:'Product '+i}));

test('non-D2C websites get their colours with no photos, even when website images exist',()=>{
 const look=decideBrandLook({kind:'website',category:'Education',pageUrls:['https://school.example/'],assets:photos.slice(0,1),palette});
 assert.equal(look.applied,true);
 assert.equal(look.colours?.primary,palette.primary);
 assert.deepEqual(look.images,[]);
 assert.match(look.reason,/Not a D2C brand/);
 assert.equal(allowsBrandPhotos(look),false);
});

test('D2C colours do not depend on collecting three usable photos',()=>{
 const look=decideBrandLook({kind:'website',category:'D2C brand',pageUrls:['https://shop.example/products/serum'],assets:[],palette});
 assert.equal(look.applied,true);
 assert.equal(look.colours?.primary,palette.primary);
 assert.deepEqual(look.images,[]);
});

test('The Ordinary keeps its black and white action palette instead of an unrelated pink accent',()=>{
 const colours=brandColours({primary:'#000000',paper:'#ffffff',ink:'#212529',accent:'#dc049b',observed:['#ffffff','#212529','#22121f','#dc049b','#fce9f5','#000000'],note:'Website CSS'},[]);
 assert.equal(colours?.primary,'#000000');
 assert.equal(colours?.secondary,'#ffffff');
 assert.equal(colours?.source,'website CSS');
});

test('site CSS wins, logo is next, and invented default colours never become brand colours',()=>{
 assert.equal(brandColours(palette,['#ff307e'])?.primary,palette.primary);
 assert.equal(brandColours(defaultWebsitePalette,['#172c4b','#ffcf45'])?.primary,'#172c4b');
 assert.equal(brandColours(defaultWebsitePalette,[]),undefined);
 assert.equal(brandColours({...palette,observed:[]},[]) ,undefined);
 const fallback=decideBrandLook({kind:'website',category:'SaaS',assets:[],pageUrls:[],palette:defaultWebsitePalette});
 assert.equal(fallback.applied,false);
 assert.match(fallback.label,/Standard white look/);
});

test('D2C photos still appear on the white fallback when no website or logo colour is usable',()=>{
 const look=decideBrandLook({kind:'website',category:'D2C brand',assets:photos,pageUrls:[],palette:defaultWebsitePalette});
 assert.equal(look.applied,true);
 assert.equal(look.colours?.primary,'#ffffff');
 assert.deepEqual(look.images,photos.map(p=>p.key));
 assert.equal(allowsBrandPhotos(look),true);
});

test('photo controls respect D2C status and remain compatible with older saved brand looks',()=>{
 const base={applied:true,label:'Brand look applied',reason:'Saved before explicit classification'};
 assert.equal(allowsBrandPhotos({...base,images:['image-0']}),true);
 assert.equal(allowsBrandPhotos({...base,images:[]}),false);
 assert.equal(allowsBrandPhotos({...base,d2c:false,images:['image-0']}),false);
});

test('colour-only styling preserves copy and quotes and removes website photo references',()=>{
 const quote={id:'C1',text:'This works for me.',privateSpans:[]};
 const frame={heading:'Exact heading',body:'Exact body',quote,assetKey:'image-0',items:[{label:'Real name',detail:'Real detail'}]};
 const posts=[{format:'carousel',frames:[frame,frame]},{format:'static',frames:[frame]}] as unknown as Post[];
 const changed=applyBrandLook(posts,{primary:'#174f49',secondary:'#fff7ed'},[]);
 for(const post of changed)for(const f of post.frames){assert.equal(f.assetKey,'');assert.deepEqual(f.quote,quote);assert.equal(f.heading,frame.heading);assert.equal(f.body,frame.body);assert.deepEqual(f.items,frame.items);}
 assert.equal(posts[0].frames[0].assetKey,'image-0');
});

test('every heading and body retains 4.5:1 contrast including middle-grey brand colours',()=>{
 for(let grey=0;grey<=255;grey++)for(const alternate of [false,true]){
  const look=slideLook({primary:'#'+grey.toString(16).padStart(2,'0').repeat(3),secondary:'#ffffff'},alternate);
  assert.ok(contrastRatio(look.text,look.background)>=4.5,JSON.stringify(look));
  assert.ok(contrastRatio(look.heading,look.background)>=4.5,JSON.stringify(look));
  const highlight=brandHighlight('Exact source phrase',look.accent);
  assert.ok(contrastRatio(highlight.colour,highlight.background)>=4.5,JSON.stringify(highlight));
  assert.equal(highlight.phrase,'Exact source phrase');
 }
});

test('article and call packs retain their existing styling decision',()=>{
 for(const kind of ['article','call'] as const)assert.equal(decideBrandLook({kind,category:'D2C brand',assets:photos,pageUrls:[],palette}).applied,false);
});
