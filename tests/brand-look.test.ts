import test from 'node:test';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {classifyD2C,pickBrandImages,brandColours,slideLook,applyBrandLook,decideBrandLook,isPhoto} from '../convex/brandLook';
import {logoColours} from '../convex/logoColours';
import {contrastRatio} from '../convex/appearance';
import type {Post} from '../convex/studioTypes';

// Shapes from the 16 October farmley.com website read.
const photo=(key:string,alt:string,url:string,width=1200,height=1200,role='product')=>({key,alt,role,width,height,originalUrl:'https://www.farmley.com/cdn/shop/files/'+url});
const farmley=[
 {key:'diagram-0',alt:'Website diagram',role:'brand icon',width:24,height:24},
 photo('image-2','Media card image','Date_bites_stack_d39491a2-7d21-40c4-8978-df26ba8ce122.png',1200,704),
 photo('image-3','Media card image','Date_stack_of_4_27cc646d-021e-4405-ba7f-b82fff85ee1e.png',1080,634),
 photo('image-4','Media card image','Mixes_e08e6f1e-681c-4293-a117-9afef441a16e.png',1200,704),
 photo('image-5','Media card image','Mixes_8f2fcca1-19f0-44f0-b2a4-e51a68d0e4e9.png',1080,634),
 photo('image-10','Peri Peri Snack Mix','PartyMix325g-04_1.png'),
 photo('image-11','Peri Peri Snack Mix','PartyMix_325g-01_1.png'),
 photo('image-12','7-in-1 Trail Mix','40280372_4.jpg'),
 photo('image-14','Trail Mix (200g) + Berry Mix (200g)','Combo.jpg'),
];
const farmleyPages=['https://www.farmley.com/','https://www.farmley.com/products/peri-peri-party-mix','https://www.farmley.com/products/7-in-1-trail-mix-160-g'];
const neutral={paper:'#ffffff',ink:'#000000',primary:'#121212',accent:'#121212',note:'',observed:['#ffffff','#000000','#121212']};

test('a consumer brand with product pages and photos is D2C; a software site is not',()=>{
 assert.equal(classifyD2C({category:'D2C brand',assets:farmley,pageUrls:farmleyPages}).d2c,true);
 assert.match(classifyD2C({category:'D2C brand',assets:farmley,pageUrls:farmleyPages}).reason,/^D2C brand: category "D2C brand", 8 product images, 2 product pages\.$/);
 assert.equal(classifyD2C({category:'SaaS',assets:[photo('image-0','Dashboard screenshot','dash.png',1600,900,'editorial')],pageUrls:['https://www.trupeer.ai/','https://www.trupeer.ai/pricing']}).d2c,false);
});

test('brand images are real photos, one per product, products with names first',()=>{
 const picked=pickBrandImages(farmley);
 assert.deepEqual(picked.slice(0,3),['image-10','image-12','image-14']);
 assert.ok(!picked.includes('image-11'),'second shot of the same product is skipped');
 assert.ok(!picked.includes('image-5'),'second crop of the same file is skipped');
 assert.ok(picked.length>=3&&picked.length<=6);
 assert.equal(isPhoto(farmley[0]),false);
});

test('neutral CSS remains valid brand styling and the logo supplies colours when CSS is absent',()=>{
 assert.deepEqual(brandColours(neutral,[]),{primary:'#121212',secondary:'#ffffff',background:'#ffffff',source:'website CSS'});
 const c=brandColours(undefined,['#172c4b','#ffcf45'])!;
 assert.deepEqual([c.primary,c.secondary,c.source],['#172c4b','#ffcf45','logo']);
 assert.equal(brandColours({...neutral,primary:'#ff307e'},['#172c4b'])!.source,'website CSS');
 // subko.coffee: cream page and black type, no saturated colour.
 assert.deepEqual(brandColours({...neutral,paper:'#fff8f2',primary:'#fff8f2',accent:'#fff8f2',observed:['#ffffff','#000000','#fff8f2']},[]),{primary:'#fff8f2',secondary:'#000000',background:'#fff8f2',source:'website CSS'});
});

test('every brand card keeps text at 4.5:1 or better',()=>{
 for(const [primary,secondary] of [['#172c4b','#ffcf45'],['#ff307e','#ffffff'],['#2e7d32','#a5d6a7'],['#f5c518','#101010'],['#7c3aed','#ede9fe']])
  for(const alternate of [false,true]){const look=slideLook({primary,secondary},alternate);
   assert.ok(contrastRatio(look.text,look.background)>=4.5,`${look.text} on ${look.background}`);
   assert.ok(contrastRatio(look.heading,look.background)>=4.5,`${look.heading} on ${look.background}`);}
});

test('cover and static carry the first photo; short slides take the next ones; lists stay text-only',()=>{
 const frame=(heading:string,body='',items:{label:string;detail:string}[]=[])=>({heading,body,items,composition:'editorial' as const});
 const posts=[{format:'carousel',sourceKind:'website',frames:[frame('Snacks made from real nuts'),frame('Peri Peri Party Mix','Roasted, not fried.'),frame('Range','',[{label:'',detail:'1. Mixes'},{label:'',detail:'2. Dates'}]),frame('Trail Mix','Seven ingredients.')]},{format:'static',sourceKind:'website',frames:[frame('Roasted, not fried')]}] as unknown as Post[];
 const [carousel,stat]=applyBrandLook(posts,{primary:'#172c4b',secondary:'#ffcf45'},['image-10','image-12','image-14']);
 assert.deepEqual(carousel.frames.map(f=>f.assetKey),['image-10','image-12','','image-14']);
 assert.equal(stat.frames[0].assetKey,'image-10');
 assert.deepEqual(carousel.frames.map(f=>f.look!.background),['#172c4b','#ffcf45','#172c4b','#ffcf45']);
});

test('each path names itself on screen and gives its reason',()=>{
 const base={category:'D2C brand',assets:farmley,pageUrls:farmleyPages,palette:neutral};
 assert.equal(decideBrandLook({kind:'website',...base,logoColours:['#172c4b','#ffcf45']}).label,'Brand colours and photos applied');
 assert.equal(decideBrandLook({kind:'website',...base,assets:farmley.slice(0,2)}).label,'Brand colours applied');
 assert.equal(decideBrandLook({kind:'website',...base,palette:undefined,logoColours:[]}).label,'Standard white look: no brand colours found');
 assert.equal(decideBrandLook({kind:'website',...base,category:'SaaS',assets:[],pageUrls:[]}).label,'Brand colours applied');
 assert.equal(decideBrandLook({kind:'call',...base}).applied,false);
});

test('logo colours are read from a PNG, largest area first, ignoring white and transparent pixels',()=>{
 // 10x10 RGBA: 60 navy pixels, 30 yellow, 10 transparent white.
 const rows:number[]=[];for(let y=0;y<10;y++){rows.push(0);for(let x=0;x<10;x++){const i=y*10+x;rows.push(...(i<60?[23,44,75,255]:i<90?[255,207,69,255]:[255,255,255,0]));}}
 const chunk=(type:string,data:Buffer)=>{const b=Buffer.alloc(12+data.length);b.writeUInt32BE(data.length,0);b.write(type,4,'ascii');data.copy(b,8);return b;};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(10,0);ihdr.writeUInt32BE(10,4);ihdr[8]=8;ihdr[9]=6;
 const png=Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(Buffer.from(rows))),chunk('IEND',Buffer.alloc(0))]);
 assert.deepEqual(logoColours(new Uint8Array(png),''),['#172c4b','#ffcf45']);
 assert.deepEqual(logoColours(new Uint8Array(),'<svg><path fill="#ffcf45"/><path fill="#ffffff"/></svg>'),['#ffcf45']);
});
