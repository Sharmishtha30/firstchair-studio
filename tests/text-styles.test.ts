import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fittingCandidates,updateTextStyle,textPixels} from '../convex/textStyles';
import {text} from '../src/artwork';
import {styledContexts} from '../src/textStyleLayout';

test('style updates affect only the requested creative, slide and text field',()=>{
 const frame={heading:'Headline',body:'Body',textStyles:{body:{font:'Lora' as const,size:'S' as const}}};
 const posts=[{format:'carousel',platform:'instagram',frames:[frame,frame]},{format:'static',platform:'instagram',frames:[frame]}];
 const result=updateTextStyle(posts,{format:'carousel',platform:'instagram',slide:1,field:'heading',style:{font:'Manrope',size:'L'}});
 assert.equal(result[0].frames[0],frame);assert.equal(result[1],posts[1]);assert.deepEqual(result[0].frames[1].textStyles,{body:frame.textStyles.body,heading:{font:'Manrope',size:'L'}});
 assert.equal(result[0].frames[1].heading,'Headline');assert.equal(posts[0].frames[1],frame);
 assert.throws(()=>updateTextStyle(posts,{format:'carousel',platform:'instagram',slide:0.5,field:'body',style:{font:'Inter',size:'S'}}),/Slide not found/);
});
test('fitting tries largest presets first and never increases a requested size',()=>{
 const choices=fittingCandidates({heading:{font:'Inter',size:'XL'},body:{font:'Lora',size:'M'}});
 assert.deepEqual(choices[0],{heading:{font:'Inter',size:'XL'},body:{font:'Lora',size:'M'}});
 assert.equal(choices.length,8);assert.ok(choices.every(c=>['S','M'].includes(c.body!.size)));
 assert.deepEqual(choices.at(-1),{heading:{font:'Inter',size:'S'},body:{font:'Lora',size:'S'}});
});
test('styled text uses exact presets, rejects overflow and leaves unrelated text alone',()=>{
 const draws:string[]=[];const ctx={canvas:{},font:'',fillStyle:'',textBaseline:'',measureText(value:string){return {width:value.length*Number(this.font.match(/(\d+)px/)?.[1])*.6};},fillText(){draws.push(this.font);}} as unknown as CanvasRenderingContext2D;
 styledContexts.set(ctx,{styles:{heading:{font:'Lora',size:'XL'}},fonts:{heading:'Creative Lora'}});
 assert.throws(()=>text(ctx,'A headline that is far too long for one line',80,220,920,80,100,'Inter','#000',600,40,true,'heading'),/fit/);
 styledContexts.set(ctx,{styles:{heading:{font:'Lora',size:'S'}},fonts:{heading:'Creative Lora'}});
 text(ctx,'Headline',80,220,920,80,100,'Inter','#000',600,40,true,'heading');
 assert.equal(draws[0],`600 ${textPixels.heading.S}px Creative Lora`);
 text(ctx,'Footer',80,1200,920,28,40,'Inter','#000',400,28);
 assert.equal(draws[1],'400 28px Inter');
});

test('designed slides use separate headline and body styles without restyling the footer',async()=>{
 const {paintDesigned}=await import('../src/editorialArtwork');
 const draws:{value:string;font:string}[]=[];
 const ctx={canvas:{},font:'',fillStyle:'',textBaseline:'',globalAlpha:1,strokeStyle:'',lineWidth:1,
 measureText(value:string){const size=Number(this.font.match(/(\d+)px/)?.[1]??40);return {width:value.length*size*.5};},
 fillText(value:string){draws.push({value,font:this.font});},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}} as unknown as CanvasRenderingContext2D;
 styledContexts.set(ctx,{styles:{heading:{font:'Lora',size:'L'},body:{font:'Manrope',size:'M'}},fonts:{heading:'Lora',body:'Manrope'}});
 await paintDesigned(ctx,{format:'static',hook:'Hello',pain:'',emotion:'',caption:'',altText:'',sourceFacts:[],frames:[{heading:'Hello',body:'A useful detail',design:{layout:'poster',surface:'paper',align:'left',imagePosition:'bottom',emphasis:'',takeaway:''}}]}, {name:'Brand',audience:'',offer:'',voice:'',facts:[],sourceUrl:'https://example.com'},0,'Brand heading','Brand body',600);
 assert.equal(draws.find(d=>d.value==='Hello')?.font,'600 104px Lora');
 assert.equal(draws.find(d=>d.value==='A useful detail')?.font,'400 44px Manrope');
 assert.equal(draws.find(d=>d.value==='example.com')?.font,'400 26px Brand body');
});
