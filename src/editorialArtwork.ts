import type {Brand,Post} from '../convex/studioTypes';
import {colours,foreground,header,loadImage,lines,text} from './artwork';

// Only bounded declarative layouts are accepted. Model output never executes code.
export async function paintDesigned(ctx:CanvasRenderingContext2D,post:Post,brand:Brand,index:number,font:string,bodyFont:string,weight:number){
 const f=post.frames[index],d=f.design!,p=colours(brand),background=d.surface==='primary'?p.primary:d.surface==='ink'?p.ink:p.paper;let ink=foreground(background);
 const lum=(hex:string)=>hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 const contrast=(a:string,b:string)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 if(d.surface==='paper'&&contrast(p.ink,background)>=4.5)ink=p.ink;
 const accent=d.surface==='paper'&&contrast(p.primary,background)>=3?p.primary:ink;
 ctx.fillStyle=background;ctx.fillRect(0,0,1080,1350);
 await header(ctx,{...brand,palette:{...p,paper:background}},ink);
 const mark=(y:number)=>{ctx.globalAlpha=.24;ctx.strokeStyle=ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(80,y);ctx.lineTo(1000,y);ctx.stroke();ctx.globalAlpha=1;};
 if(post.format==='carousel')text(ctx,`${String(index+1).padStart(2,'0')} / ${post.frames.length}`,850,84,150,28,40,bodyFont,ink,600,28);
 mark(165);
 const metric=(value:string,w:number,size:number,min:number,max:number,family=bodyFont,bold=400)=>{let rows:string[]=[],used=size;for(let s=size;s>=min;s-=2){used=s;ctx.font=`${bold} ${s}px ${family}`;rows=lines(ctx,value,w);if(rows.length*s*1.14<=max)break;}const h=rows.length*used*1.14;if(h>max||rows.some(r=>ctx.measureText(r).width>w))throw Error('Shorten this slide for readable type: “'+value.slice(0,85)+'”.');return {h,size:used};};
 const draw=(value:string,x:number,y:number,w:number,size:number,min:number,max:number,family=bodyFont,colour=ink,bold=400,center=false,emphasis='')=>{
  if(!value.trim())return y;const m=metric(value,w,size,min,max,family,bold);
  // Record the exact same safe bounds used by downloads.
  text(ctx,value,x,y,w,m.size,m.h+1,family,colour,bold,m.size);
  if(center||emphasis&&value.includes(emphasis)){
   ctx.fillStyle=background;ctx.fillRect(x,y,w,m.h+4);ctx.font=`${bold} ${m.size}px ${family}`;ctx.textBaseline='top';
   const rows=lines(ctx,value,w),normal=value.replace(/\s+/g,' ').trim(),phrase=emphasis.replace(/\s+/g,' ').trim(),phraseStart=phrase?normal.indexOf(phrase):-1,phraseEnd=phraseStart+phrase.length;let offset=y,cursor=0;
   for(const row of rows){let xx=center?x+(w-ctx.measureText(row).width)/2:x;const at=phraseStart>=0?Math.max(0,phraseStart-cursor):-1,until=Math.min(row.length,phraseEnd-cursor),selected=until>at?row.slice(at,until):'';
    if(at>=0&&selected){const before=row.slice(0,at),after=row.slice(until);ctx.fillStyle=colour;ctx.fillText(before,xx,offset);xx+=ctx.measureText(before).width;ctx.fillStyle=accent;const normalWidth=ctx.measureText(selected).width;ctx.font=`italic ${bold} ${m.size}px ${family}`;if(ctx.measureText(row.slice(until)).width+ctx.measureText(selected).width+xx>x+w)ctx.font=`${bold} ${m.size}px ${family}`;ctx.fillText(selected,xx,offset);xx+=ctx.measureText(selected).width||normalWidth;ctx.font=`${bold} ${m.size}px ${family}`;ctx.fillStyle=colour;ctx.fillText(after,xx,offset);}else{ctx.fillStyle=colour;ctx.fillText(row,xx,offset);}offset+=m.size*1.14;cursor+=row.length+1;
   }
  }return y+m.h;
 };
 const asset=f.assetKey?brand.assets?.find(a=>a.key===f.assetKey):undefined;
 const photo=async(x:number,y:number,w:number,h:number)=>{if(!asset)throw Error('Choose a verified website image for this composition.');if(h<150)throw Error('This photo needs more space. Shorten the text.');const img=await loadImage(asset.url),scale=Math.min(w/img.width,h/img.height);ctx.drawImage(img,x+(w-img.width*scale)/2,y+(h-img.height*scale)/2,img.width*scale,img.height*scale);};
 const centered=d.align==='center',top=f.eyebrow?260:215,takeawayHeight=d.takeaway?metric(d.takeaway,920,54,44,220,font,weight).h+28:0;
 if(f.eyebrow)draw(f.eyebrow,80,205,920,28,28,40,bodyFont,ink,600,centered);
 const title=(x:number,y:number,w:number,size:number,max:number)=>draw(f.heading,x,y,w,size,64,max,font,ink,weight,centered,d.emphasis);
 const takeaway=(y:number,max=220)=>{if(!d.takeaway)return y;mark(y);return draw(d.takeaway,80,y+28,920,54,44,max,font,ink,weight,centered);};
 if(d.layout==='photo'&&!asset)throw Error('This photo composition needs a verified website image.');
 if((d.layout==='photo'||d.layout==='poster'&&asset)&&asset){
  if(d.imagePosition==='top'){
   const hm=metric(f.heading,920,92,64,280,font,weight),bm=metric(f.body,920,44,40,180),photoH=Math.min(490,1175-top-hm.h-bm.h-takeawayHeight-110);await photo(80,top,920,photoH);const end=title(80,top+photoH+42,920,92,280);const b=draw(f.body,80,end+26,920,44,40,180,bodyFont,ink,400,centered);if(d.takeaway)takeaway(b+30);
  }else{
   const end=title(80,top,920,102,310),b=draw(f.body,80,end+30,920,44,40,200,bodyFont,ink,400,centered),imageTop=b+42;
   const reserved=takeawayHeight?takeawayHeight+25:0;await photo(80,imageTop,920,1175-imageTop-reserved);if(d.takeaway)takeaway(1175-takeawayHeight);
  }
 }else if(d.layout==='split'){
  const bottom=takeawayHeight?1175-takeawayHeight-35:1175;
  const itemMin=(f.items??[]).slice(0,2).map(item=>metric(item.label,415,44,44,1000,font,weight).h+35+metric(item.detail,415,40,40,1000).h);
  const minimumColumn=Math.max(0,...itemMin),introMin=metric(f.body,920,40,40,1000).h;
  const cap=asset?260:Math.min(300,bottom-top-45-introMin-42-minimumColumn);
  const end=title(80,top,920,96,cap),start=end+45;
  if(asset){const h=bottom-start;draw(f.body,80,start,445,44,40,h,bodyFont);await photo(580,start,420,h);if(d.takeaway)takeaway(1175-takeawayHeight);}
  else if((f.items??[]).length>=2){
   const intro=draw(f.body,80,start,920,44,40,Math.min(140,bottom-start-42-minimumColumn)),yy=intro+42;
   ctx.globalAlpha=.25;ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(540,yy);ctx.lineTo(540,bottom);ctx.stroke();ctx.globalAlpha=1;
   f.items!.slice(0,2).forEach((item,i)=>{const x=i?585:80,detailMin=metric(item.detail,415,40,40,1000).h;const labelEnd=draw(item.label,x,yy,415,60,44,Math.min(190,bottom-yy-35-detailMin),font,i?accent:ink,weight);draw(item.detail,x,labelEnd+35,415,44,40,bottom-labelEnd-35,bodyFont);});if(d.takeaway)takeaway(1175-takeawayHeight);
  }else{const endBody=draw(f.body,80,start,920,48,40,bottom-start);if(d.takeaway)takeaway(endBody+50,220);}
 }else if(d.layout==='list'&&f.items?.length){
  const numbered=f.composition==='process',x=numbered?205:80,w=numbered?795:920;
  const measures=f.items.map(item=>({label:metric(item.label.replace(/^\d+[.)]\s*/,''),w,40,40,1000,bodyFont,600).h,detail:metric(item.detail,w,40,40,1000).h})),bodyMin=metric(f.body,920,40,40,1000).h,headingMin=metric(f.heading,920,64,64,1000,font,weight).h;
  const comfortable=measures.reduce((a,m)=>a+18+m.label+10+m.detail+20,0)+bodyMin+headingMin+26+38+(takeawayHeight?takeawayHeight+25:0)<=1180-top;
  const reserved=takeawayHeight?takeawayHeight+(comfortable?25:8):0;
  const pad=comfortable?18:8,gap=comfortable?10:6,tail=comfortable?20:8,bodyGap=comfortable?26:20,listGap=comfortable?38:20;
  const rowMin=measures.map(m=>pad+m.label+gap+m.detail+tail),totalRows=rowMin.reduce((a,h)=>a+h,0);
  const end=title(80,top,920,88,Math.min(260,1180-top-bodyGap-bodyMin-listGap-totalRows-reserved));
  const b=draw(f.body,80,end+bodyGap,920,44,40,Math.min(150,1180-end-bodyGap-listGap-totalRows-reserved)),start=b+listGap,extra=(1180-start-reserved-totalRows)/f.items.length;
  let yy=start;f.items.forEach((item,i)=>{const y=yy,rowH=rowMin[i]+extra;yy+=rowH;mark(y);if(numbered)draw(String(i+1).padStart(2,'0'),80,y+pad,95,46,40,64,bodyFont,accent,600);
   const detailMin=measures[i].detail,label=draw(item.label.replace(/^\d+[.)]\s*/,''),x,y+pad,w,48,40,rowH-pad-gap-detailMin-tail,bodyFont,ink,600);draw(item.detail,x,label+gap,w,44,40,rowH-(label-y)-tail,bodyFont);
  });if(d.takeaway)takeaway(1180-takeawayHeight);
 }else{
  const poster=d.layout==='poster',end=title(80,top,920,poster?128:102,poster?475:330);
  const bodyTop=end+(poster?58:38),bodyMax=Math.min(poster?260:460,1175-bodyTop-(takeawayHeight?takeawayHeight+55:0));
  const b=draw(f.body,80,bodyTop,920,poster?48:46,40,bodyMax,bodyFont,ink,400,centered);
  if(asset&&d.imagePosition==='right'&&!f.body){await photo(80,b+40,920,1140-b-40);}else if(d.takeaway)takeaway(Math.max(b+55,1175-takeawayHeight));
 }
 mark(1210);draw(new URL(post.destination??brand.sourceUrl).hostname.replace(/^www\./,''),80,1250,700,26,26,38,bodyFont,ink);
 if(post.format==='carousel'&&index<4)draw('Swipe →',850,1250,150,26,26,38,bodyFont,ink,600);
}
