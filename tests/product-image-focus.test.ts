import test from 'node:test';import assert from 'node:assert/strict';
import {productImageFocus} from '../src/productImageFocus';
function pixels(w:number,h:number){return new Uint8ClampedArray(w*h*4).fill(255);}
function set(p:Uint8ClampedArray,w:number,x:number,y:number,rgba:number[]){p.set(rgba,(y*w+x)*4);}
test('uniform catalogue margins are framed out while the entire product and its distant shadow remain',()=>{
 const w=200,h=200,p=pixels(w,h);
 for(let y=85;y<=115;y++)for(let x=35;x<=165;x++)set(p,w,x,y,[100,90,80,255]);
 set(p,w,172,130,[230,230,230,255]);
 const f=productImageFocus(p,w,h);assert.ok(f.height<130);assert.ok(f.x<35&&f.x+f.width>172);assert.ok(f.y<85&&f.y+f.height>130);
});
test('uneven lifestyle backgrounds and edge-to-edge products retain the complete source frame',()=>{
 const p=pixels(100,100);set(p,100,99,99,[100,120,80,255]);assert.deepEqual(productImageFocus(p,100,100),{x:0,y:0,width:100,height:100});
 const all=new Uint8ClampedArray(100*100*4).fill(100);for(let i=3;i<all.length;i+=4)all[i]=255;assert.deepEqual(productImageFocus(all,100,100),{x:0,y:0,width:100,height:100});
});
test('transparent padding is removed without cropping the visible object',()=>{
 const p=new Uint8ClampedArray(100*100*4);for(let y=40;y<60;y++)for(let x=30;x<70;x++)set(p,100,x,y,[200,30,20,255]);const f=productImageFocus(p,100,100);assert.ok(f.x<=30&&f.x+f.width>=70&&f.y<=40&&f.y+f.height>=60);
});
