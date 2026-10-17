import test from 'node:test';
import assert from 'node:assert/strict';
import {editCarousel,slideNumberLabel,requireCarouselEdit} from '../convex/carouselEdits';
import type {Post} from '../convex/studioTypes';
const posts=():Post[]=>[
 {format:'carousel',platform:'instagram',hook:'First',pain:'',emotion:'',caption:'Caption',altText:'Alt',sourceFacts:['Fact'],frames:[{heading:'First',body:'One',slideNumber:9},{heading:'Second',body:'Two',quote:{id:'q',text:'Exact customer words',speaker:'Customer'} as any},{heading:'Third',body:'Three',slideNumber:8}]},
 {format:'static',platform:'instagram',hook:'Static',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'Static',body:'Body'}]},
];
test('deleting a slide renumbers the remaining slides and preserves their copy and quotes',()=>{
 const before=posts(),after=editCarousel(before,'instagram',0,{kind:'delete'});
 assert.equal(after[0].hook,'Second');assert.equal(after[0].frames.length,2);
 assert.equal(slideNumberLabel(after[0],0),'1/2');assert.equal(slideNumberLabel(after[0],1),'2/2');
 assert.deepEqual(after[0].frames[0].quote,before[0].frames[1].quote);assert.equal(after[1],before[1]);assert.equal(before[0].frames.length,3);
 const one=editCarousel(after,'instagram',1,{kind:'delete'});assert.equal(slideNumberLabel(one[0],0),'1/1');
 assert.throws(()=>editCarousel(one,'instagram',0,{kind:'delete'}),/Keep at least one/);
});
test('custom slide numbers persist without changing ordering, copy or the other slides',()=>{
 const before=posts(),after=editCarousel(before,'instagram',1,{kind:'number',number:12});
 assert.equal(slideNumberLabel(after[0],1),'12/3');assert.equal(after[0].frames[1].body,'Two');assert.equal(after[0].frames[0],before[0].frames[0]);
 for(const n of [0,-1,1.5,100,NaN])assert.throws(()=>editCarousel(before,'instagram',1,{kind:'number',number:n}),/1 to 99/);
});
test('an uploaded image adds to a text slide or replaces a photo without changing copy or colours',()=>{
 const before=posts();before[0].frames[1].assetKey='old-photo';
 for(const slide of [0,1]){const after=editCarousel(before,'instagram',slide,{kind:'photo',assetKey:'upload-new'});assert.equal(after[0].frames[slide].assetKey,'upload-new');assert.equal(after[0].frames[slide].uploadedPhoto,true);assert.deepEqual(after[0].frames[slide].quote,before[0].frames[slide].quote);assert.equal(after[0].frames[slide].body,before[0].frames[slide].body);assert.equal(after[1],before[1]);}
});
test('edits reject missing slides, the wrong owner, unfinished packs and stale page versions',()=>{
 for(const slide of [-1,.5,3])assert.throws(()=>editCarousel(posts(),'instagram',slide,{kind:'delete'}),/Slide not found/);
 const pack={userId:'owner',stage:'Ready',updatedAt:7,posts:posts()};
 assert.doesNotThrow(()=>requireCarouselEdit(pack,'owner',7));
 assert.throws(()=>requireCarouselEdit(pack,'other',7),/account/);
 assert.throws(()=>requireCarouselEdit({...pack,stage:'Writing'},'owner',7),/finish/);
 assert.throws(()=>requireCarouselEdit(pack,'owner',6),/changed/);
});

test('uploaded images are size and format checked before storage',async()=>{
 const {slideUploadInfo}=await import('../convex/carouselEdits');
 const {readFileSync}=await import('node:fs');
 assert.equal(slideUploadInfo(readFileSync('tests/fixtures/seedream-image.jpg')).mime,'image/jpeg');
 assert.throws(()=>slideUploadInfo(new Uint8Array(2_000_001)),/2 MB/);
 assert.throws(()=>slideUploadInfo(new TextEncoder().encode('<svg/>')),/could not be read/);
});

test('a manually shortened carousel stays editable without relaxing generation limits',async()=>{
 const {checkPosts}=await import('../convex/studioTypes');
 const p={...posts()[0],sourceKind:'website' as const,frames:[posts()[0].frames[0]]};
 assert.throws(()=>checkPosts([p],['Fact'],1),/wrong number/);
 assert.doesNotThrow(()=>checkPosts([p],['Fact'],1,[],true));
});

test('both saved artwork styles paint the custom number in the footer',async()=>{
 const {paintBrand}=await import('../src/brandArtwork');const {paintFrozen}=await import('../src/frozenArtwork');
 for(const paint of [paintBrand,paintFrozen]){
  const drawn:string[]=[];const ctx={canvas:{},font:'',fillStyle:'',textBaseline:'',measureText(value:string){return {width:value.length*12};},fillText(value:string){drawn.push(value);},fillRect(){}} as unknown as CanvasRenderingContext2D;
  const post=posts()[0];post.frames[0].slideNumber=17;post.frames[0].look={background:'#ffffff',text:'#000000',heading:'#000000',accent:'#000000'} as any;
  await paint(ctx,post,{name:'Brand',audience:'',offer:'',voice:'',facts:[],sourceUrl:'https://example.com'},0,'Inter','Inter',600);
  assert.ok(drawn.includes('17/3'));assert.ok(!drawn.includes('1/3'));
 }
});
