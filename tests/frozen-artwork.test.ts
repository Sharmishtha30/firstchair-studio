import test from 'node:test';
import assert from 'node:assert/strict';
import {paintFrozen} from '../src/frozenArtwork';
import type {Brand,Post} from '../convex/studioTypes';
async function render(primary:string,layout:'photo'|'note',call:boolean){
 const draws:{value:string;x:number;y:number;colour:string}[]=[];
 const ctx={canvas:{},font:'',fillStyle:'',textBaseline:'',fillRect(){},measureText(value:string){return {width:value.length*12};},fillText(value:string,x:number,y:number){draws.push({value,x,y,colour:this.fillStyle});}} as unknown as CanvasRenderingContext2D;
 const brand:Brand={name:'Example',audience:'Founders',offer:'Tools',voice:'Clear',facts:[],sourceUrl:'https://example.com',palette:{paper:'#ffffff',ink:'#101010',primary,accent:primary,note:''}};
 const post:Post={format:'carousel',hook:'A grounded thought',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'A grounded thought',body:'One useful detail.',eyebrow:'The moment',...(call?{quote:{id:'C1',text:'One useful detail.'}}:{}),design:{layout,surface:'primary',align:'center',imagePosition:'top',emphasis:'thought',takeaway:''}}]};
 await paintFrozen(ctx,post,brand,0,'Georgia','Arial',400);return draws;
}
test('approved output composition stays fixed despite requested alternate layout and brand colour',async()=>{
 const a=await render('#ff307e','photo',true),b=await render('#007766','note',true);
 assert.deepEqual(a.map(({value,x,y})=>({value,x,y})),b.map(({value,x,y})=>({value,x,y})));
 assert.equal(a.find(d=>d.value==='“')?.colour,'#ff307e');assert.equal(b.find(d=>d.value==='“')?.colour,'#007766');
 assert.equal(a.find(d=>d.value==='A grounded thought')?.y,360);
 assert.equal(a.find(d=>d.value==='Example')?.y,1215);
 assert.ok(a.some(d=>d.value==='1/1'));assert.ok(a.some(d=>d.value==='example.com'));
});
test('website-only output does not claim to come from a customer call',async()=>{
 const draws=await render('#007766','note',false);
 assert.ok(draws.some(d=>d.value==='example.com'));assert.ok(!draws.some(d=>/From an article|From your website/.test(d.value)));assert.ok(!draws.some(d=>d.value==='From a customer call'));
});
