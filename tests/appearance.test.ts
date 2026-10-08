import {test} from 'node:test';
import assert from 'node:assert/strict';
import {contrastRatio,readableSwatch,fitImageBox,intersects,validColour} from '../convex/appearance';
import {appearanceContexts,appearanceReports,paintSlideImage,finishSlideImages,recordTextAppearance} from '../src/appearanceLayout';

test('contrast warning suggests the closest readable brand swatch without rejecting the selected colour',()=>{
 assert.equal(contrastRatio('#ffffff','#ffffff'),1);
 assert.ok(contrastRatio('#101010','#ffffff')>17);
 assert.equal(readableSwatch('#ffaaaa','#ffffff',['#ffaaaa','#aa1111','#101010','#ffffff']),'#aa1111');
 const canvas={} as HTMLCanvasElement,ctx={canvas} as CanvasRenderingContext2D;
 appearanceContexts.set(ctx,{colours:{heading:'#ffffff'},pending:[],textBounds:[]});appearanceReports.set(canvas,{text:{}});
 assert.equal(recordTextAppearance(ctx,'heading','#101010','#ffffff'),'#ffffff');
 assert.deepEqual(appearanceReports.get(canvas)?.text.heading,{background:'#ffffff',colour:'#ffffff'});
 assert.equal(validColour('red'),false);assert.equal(validColour('#ff307e'),true);
});
test('image sizing steps down to the largest preset clear of text and slide edges',()=>{
 const slot={x:80,y:165,width:920,height:710},headline={x:80,y:870,width:920,height:80};
 const fit=fitImageBox(slot,'Full',[headline]);assert.equal(fit.size,'L');assert.equal(intersects(fit.box,headline),false);
 assert.equal(fitImageBox(slot,'M',[]).size,'M');
 assert.throws(()=>fitImageBox(slot,'Full',[slot]),/no safe space/);
 const edge=fitImageBox({x:0,y:100,width:1080,height:1100},'Full',[]);assert.equal(edge.size,'L');assert.ok(edge.box.x>=80&&edge.box.y>=165&&edge.box.y+edge.box.height<=1180);
});
test('Fit keeps the whole image, Fill crops inside the same safe box, and resizing waits for text bounds',()=>{
 for(const mode of ['fit','fill'] as const){
  const drawn:number[][]=[],canvas={} as HTMLCanvasElement;
  const ctx={canvas,save(){},restore(){},beginPath(){},roundRect(){},clip(){},drawImage(_img:unknown,...numbers:number[]){drawn.push(numbers);}} as unknown as CanvasRenderingContext2D;
  appearanceReports.set(canvas,{text:{}});const state={colours:{},imageStyle:{size:'Full' as const,mode},pending:[] as (()=>void)[],textBounds:[] as {x:number;y:number;width:number;height:number}[]};appearanceContexts.set(ctx,state);
  paintSlideImage(ctx,{width:1000,height:500} as HTMLImageElement,{x:80,y:200,width:920,height:600},()=>{throw Error('old image path must not run');});
  assert.equal(drawn.length,0);finishSlideImages(ctx);assert.equal(drawn.length,1);
  const [, ,width,height]=drawn[0];assert.equal(width/height,2);
  if(mode==='fit'){assert.equal(width,920);assert.equal(height,460);}else{assert.equal(width,1200);assert.equal(height,600);}
  assert.equal(appearanceReports.get(canvas)?.imageStyle?.mode,mode);
 }
});

test('mid-grey backgrounds still receive a readable suggestion',()=>{const c=readableSwatch('#777777','#777777',['#777777','#ffffff','#101010']);assert.ok(c);assert.ok(contrastRatio(c!,'#777777')>=4.5);});
