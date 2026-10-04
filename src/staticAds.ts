import type {Brand,Post} from '../convex/studioTypes';
export type StaticLayout='headline'|'comparison'|'note';
export async function drawStaticAd(post:Post,brand:Brand,layout:StaticLayout='comparison'){
 await Promise.all([400,600].map(w=>document.fonts.load(`${w} 40px "Brand Inter"`)));
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d')!;
 const ink='#0f0f12',pink='#ff307e';ctx.fillStyle='#fff';ctx.fillRect(0,0,1080,1350);ctx.textBaseline='top';
 function text(value:string,x:number,y:number,width:number,size:number,line:number,font='"Brand Inter"',colour=ink,style='400'){
  ctx.font=`${style} ${size}px ${font}`;ctx.fillStyle=colour;
  for(const para of value.split('\n')){let row='';for(const word of para.split(/\s+/)){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){ctx.fillText(row,x,y);y+=line;row=word;}else row=next;}ctx.fillText(row,x,y);y+=line;}return y;
 }
 const rule=(y:number)=>{ctx.strokeStyle='#e5e5e8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(76,y);ctx.lineTo(1004,y);ctx.stroke();};
 text("Founder's",76,62,500,38,46,'Georgia');ctx.font='400 38px Georgia';const offset=ctx.measureText("Founder's").width;text('Find',88+offset,62,400,38,46,'Georgia',pink,'italic');rule(136);
 const words=post.hook.split(/\s+/),last=words.length>=4?words.splice(-2).join(' '):'';
 let y=text(last?words.join(' '):post.hook,76,225,928,104,116,'Georgia');if(last)y=text(last,76,y,928,104,116,'Georgia',pink,'italic');
 const lines=post.frames[0].body.split('\n'),tail=lines.at(-1)??'',hasAction=/^(apply|explore|start|see|visit|join|try|learn|discover|get)\b/i.test(tail);
 const value=hasAction?lines.slice(0,-1).join('\n'):lines.join('\n');
 if(layout==='comparison'){
  const top=y+72;ctx.strokeStyle='#dedee3';ctx.lineWidth=1;ctx.strokeRect(76,top,448,210);ctx.strokeRect(556,top,448,210);
  text('Execution',100,top+28,390,43,55,'Georgia');text('Doing the work',100,top+101,375,29,41);
  text('Judgement',580,top+28,390,43,55,'Georgia');text('Deciding what work\nis worth doing',580,top+101,375,29,41);
  ctx.fillStyle=pink;ctx.fillRect(556,top,448,4);y=text(value,80,top+255,900,35,49);
 }else if(layout==='note'){
  const top=y+72;ctx.fillStyle='#fff3f7';ctx.fillRect(76,top,928,360);ctx.fillStyle=pink;ctx.fillRect(76,top,928,3);
  y=text(value,110,top+48,860,41,58);if(y>top+340)throw new Error('This copy is too long for the note layout.');
 }else{
  y=text(value,80,y+76,900,43,61);
  if(y<920){rule(980);text('Proof  /  Capability  /  Opportunity',80,1020,900,26,36);}
 }
 if(y>1080)throw new Error('The static-ad copy is too long for this layout.');
 if(hasAction){ctx.fillStyle=pink;ctx.fillRect(76,1110,928,92);text(tail,106,1136,870,32,42,'"Brand Inter"',ink,'600');}
 rule(1240);text(new URL(brand.sourceUrl).hostname,76,1271,900,27,36);
 return canvas;
}
