import test from 'node:test';
import assert from 'node:assert/strict';
import {text} from '../src/artwork';
import {paintDesigned} from '../src/editorialArtwork';
import type {Post,Brand} from '../convex/studioTypes';
function context(){
 const draws:{value:string;font:string}[]=[];
 const ctx={canvas:{},font:'400 140px serif',fillStyle:'',textBaseline:'',globalAlpha:1,strokeStyle:'',lineWidth:1,
 measureText(value:string){const size=Number(this.font.match(/(\d+)px/)?.[1]??40);return {width:value.length*size*.65};},
 fillText(value:string){draws.push({value,font:this.font});},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
 return {ctx:ctx as unknown as CanvasRenderingContext2D,draws};
}
test('a long word that fits at readable size is reduced instead of rejected by height-only fitting',()=>{
 const {ctx,draws}=context();
 text(ctx,'Dessert-flavored coffee',80,215,920,140,475,'serif','#000');
 assert.ok(draws.length>0);for(const d of draws){assert.ok(ctx.measureText(d.value).width<=920);assert.ok(Number(d.font.match(/(\d+)px/)?.[1])>=40);}
 assert.throws(()=>text(ctx,'x'.repeat(100),80,215,920,140,475,'serif','#000'),/readable size/);
});
test('poster measurement handles an overwide word without weakening the 64px heading floor',async()=>{
 const {ctx,draws}=context();
 const post:Post={platform:'instagram',format:'carousel',hook:'Dessert-flavored coffee or canned latte?',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],destination:'https://example.com/',frames:[{heading:'Dessert-flavored coffee or canned latte?',body:'Check the product format.',design:{layout:'poster',surface:'primary',align:'left',imagePosition:'bottom',emphasis:'',takeaway:''}}]};
 const brand:Brand={name:'Coffee',audience:'Coffee buyers',offer:'Coffee',voice:'Direct',facts:[],sourceUrl:'https://example.com/'};
 await paintDesigned(ctx,post,brand,0,'serif','sans-serif',700);
 const heading=draws.filter(d=>d.value.includes('Dessert-flavored'));
 assert.equal(heading.length,1);assert.ok(Number(heading[0].font.match(/(\d+)px/)?.[1])>=64);
});
test('single-image split posts give the product a large uncropped area below readable copy',async()=>{
 const previous=globalThis.Image;
 class TestImage {width=600;height=800;crossOrigin='';onload?:()=>void;set src(_value:string){queueMicrotask(()=>this.onload?.());}}
 Object.defineProperty(globalThis,'Image',{value:TestImage,configurable:true,writable:true});
 try{
  const {ctx,draws}=context();const images:number[][]=[];ctx.drawImage=((_img:unknown,...box:number[])=>images.push(box)) as typeof ctx.drawImage;
  const brand:Brand={name:'Product',audience:'Buyers',offer:'A product',voice:'Direct',facts:[],sourceUrl:'https://example.com/',assets:[{key:'hero',url:'https://example.com/test-hero.png',originalUrl:'https://example.com/test-hero.png',width:600,height:800,alt:'Product photo',role:'product',pageUrl:'https://example.com/'}]};
  const post:Post={platform:'instagram',format:'static',hook:'A product worth seeing',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'A product worth seeing',body:'A useful detail.',assetKey:'hero',design:{layout:'split',surface:'paper',align:'left',imagePosition:'right',emphasis:'',takeaway:''}}]};
  await paintDesigned(ctx,post,brand,0,'sans-serif','sans-serif',600);
  const [x,y,w,h]=images[0].slice(-4);assert.ok(w>420,'product must exceed the old narrow column');assert.ok(h>600);assert.equal(w/h,600/800);assert.ok(x>=80&&x+w<=1000);assert.ok(y+h<=1175);
  for(const d of draws.filter(d=>d.value.includes('product')||d.value.includes('useful')))assert.ok(Number(d.font.match(/(\d+)px/)?.[1])>=40);
 }finally{Object.defineProperty(globalThis,'Image',{value:previous,configurable:true,writable:true});}
});

test('exports load distinct website headline and body faces instead of rendering all copy in the display face',async()=>{
 const originals={document:globalThis.document,FontFace:globalThis.FontFace};const loaded:{name:string;source:string}[]=[];
 const {ctx,draws}=context();const canvas={width:0,height:0,getContext:()=>ctx};
 class TestFontFace {constructor(public family:string,public source:string,_options:unknown){}async load(){loaded.push({name:this.family,source:this.source});return this;}}
 Object.defineProperty(globalThis,'document',{configurable:true,value:{fonts:{load:async()=>[],ready:Promise.resolve(),add:()=>{}},createElement:()=>canvas}});
 Object.defineProperty(globalThis,'FontFace',{configurable:true,value:TestFontFace});
 try{
  const {renderArtwork}=await import('../src/artwork');
  const brand:Brand={name:'Font test',audience:'Buyers',offer:'Paper tools',voice:'Direct',facts:[],sourceUrl:'https://example.com/',style:{headline:'serif',weight:400,sourceFont:'Display',bodyFont:'Text',fontName:'Display',regularUrl:'https://example.com/display.woff2',semiboldUrl:'https://example.com/display-bold.woff2',bodyRegularUrl:'https://example.com/text.woff2',bodySemiboldUrl:'https://example.com/text-bold.woff2',note:''}};
  const post:Post={platform:'instagram',format:'static',hook:'Headline',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'Headline',body:'Supporting body copy.',design:{layout:'poster',surface:'paper',align:'left',imagePosition:'bottom',emphasis:'',takeaway:''}}]};
  await renderArtwork(post,brand);
  const display=loaded.find(f=>f.source.includes('/display.'))!,body=loaded.find(f=>f.source.includes('/text.'))!;
  assert.ok(display&&body);assert.notEqual(display.name,body.name);
  assert.ok(draws.find(d=>d.value==='Headline')?.font.includes(display.name));
  assert.ok(draws.find(d=>d.value==='Supporting body copy.')?.font.includes(body.name));
 }finally{for(const [key,value]of Object.entries(originals))Object.defineProperty(globalThis,key,{configurable:true,value});}
});

test('product-first layout reserves a large undistorted product image before compact copy',async()=>{const previous=globalThis.Image;class ProductImage{width=600;height=800;crossOrigin='';onload?:()=>void;set src(_value:string){queueMicrotask(()=>this.onload?.());}}Object.defineProperty(globalThis,'Image',{value:ProductImage,configurable:true});try{const {ctx,draws}=context();const images:number[][]=[];ctx.drawImage=((_img:unknown,...box:number[])=>images.push(box)) as typeof ctx.drawImage;const brand:Brand={name:'Brand',audience:'Buyers',offer:'Bottle',voice:'Clear',facts:[],sourceUrl:'https://example.com/',assets:[{key:'bottle',url:'https://example.com/product-first.png',originalUrl:'https://example.com/product-first.png',width:600,height:800,alt:'Bottle',role:'product',pageUrl:'https://example.com/'}]};const post:Post={platform:'instagram',format:'static',hook:'Daily ritual',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'Daily ritual',body:'Keep it simple.',assetKey:'bottle',design:{layout:'product',surface:'paper',align:'center',imagePosition:'top',emphasis:'',takeaway:''}}]};await paintDesigned(ctx,post,brand,0,'sans-serif','sans-serif',600);const [x,y,w,h]=images[0].slice(-4);assert.equal(h,710);assert.equal(w/h,600/800);assert.ok(y+h<885);assert.ok(x>=80&&x+w<=1000);assert.equal(draws.filter(d=>d.value==='Daily ritual').length,1,'centered copy is drawn once; erasing a prior draw can leave font artifacts');}finally{Object.defineProperty(globalThis,'Image',{value:previous,configurable:true});}});

test('a carousel keeps source cream and teal instead of filling a slide with its CTA colour',async()=>{const {ctx}=context();const fills:string[]=[];ctx.fillRect=(()=>fills.push(String(ctx.fillStyle))) as typeof ctx.fillRect;const brand:Brand={name:'Service',audience:'Families',offer:'Classes',voice:'Clear',facts:[],sourceUrl:'https://example.com/',palette:{paper:'#fcf9f3',ink:'#0f3d3e',primary:'#f3943b',accent:'#f3943b',note:''}};const post:Post={platform:'instagram',format:'carousel',hook:'Start here',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'Start here',body:'One useful detail',design:{layout:'poster',surface:'primary',align:'left',imagePosition:'bottom',emphasis:'',takeaway:''}}]};await paintDesigned(ctx,post,brand,0,'sans-serif','sans-serif',600);assert.equal(fills[0],'#fcf9f3');});
