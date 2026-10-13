import {hiddenBrandHeaders} from './artwork';
import {appearanceContexts,recordTextAppearance,paintSlideImage} from './appearanceLayout';
import {textOverride} from './textStyleLayout';
import type {TextField} from '../convex/textStyles';
import {styledRows,paintStyledRows} from './styledText';
import {productImageFocus,type ImageFocus} from './productImageFocus';
import type {Brand,Post} from '../convex/studioTypes';
import {colours,foreground,header,loadImage,lines,text} from './artwork';

const focusCache=new WeakMap<HTMLImageElement,ImageFocus>();
function imageFocus(img:HTMLImageElement,product:boolean):ImageFocus{
 const full={x:0,y:0,width:img.width,height:img.height};if(!product||typeof document==='undefined')return full;
 const cached=focusCache.get(img);if(cached)return cached;
 try{const sample=document.createElement('canvas'),scale=Math.min(1,320/Math.max(img.width,img.height));sample.width=Math.round(img.width*scale);sample.height=Math.round(img.height*scale);const ctx=sample.getContext('2d',{willReadFrequently:true});if(!ctx)return full;ctx.drawImage(img,0,0,sample.width,sample.height);const f=productImageFocus(ctx.getImageData(0,0,sample.width,sample.height).data,sample.width,sample.height);const focus={x:f.x/scale,y:f.y/scale,width:f.width/scale,height:f.height/scale};focusCache.set(img,focus);return focus;}catch{return full;}
}
// Only bounded declarative layouts are accepted. Model output never executes code.
export async function paintDesigned(ctx:CanvasRenderingContext2D,post:Post,brand:Brand,index:number,font:string,bodyFont:string,weight:number){
 const f=post.frames[index],originalDesign=f.design!,d=brand.style?.headingEmphasis?{...originalDesign,layout:originalDesign.layout==='note'?'essay' as const:originalDesign.layout,emphasis:originalDesign.emphasis||f.heading.split(/\s+/).slice(-Math.min(4,Math.ceil(f.heading.split(/\s+/).length/2))).join(' ')}:originalDesign,p=colours(brand),background=post.format==='carousel'||brand.strategy?.visualPriority==='product'?p.paper:d.surface==='primary'?p.primary:d.surface==='ink'?p.ink:d.surface==='accent'?p.accent:p.paper;let ink=foreground(background);
 const lum=(hex:string)=>hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 const contrast=(a:string,b:string)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 if((d.surface==='paper'||post.format==='carousel'||brand.strategy?.visualPriority==='product')&&contrast(p.ink,background)>=4.5)ink=p.ink;
 const accent=(d.surface==='paper'||post.format==='carousel'||brand.strategy?.visualPriority==='product')&&contrast(p.primary,background)>=3?p.primary:ink;
 ctx.fillStyle=background;ctx.fillRect(0,0,1080,1350);
 // Publisher colour is visual identity, independent of optional copy emphasis or logo colour.

 await header(ctx,{...brand,palette:{...p,paper:background}},post.frames.some(frame=>frame.quote)?accent:ink,font);
 const decoration=brand.assets?.find(a=>a.role==='brand decoration'&&(/\.svg(?:[?#]|$)/i.test(a.originalUrl)||a.key.startsWith('diagram-')));
 if(decoration&&!hiddenBrandHeaders.has(ctx)&&d.layout!=='note'){const markImage=await loadImage(decoration.url);const scale=Math.min(55/markImage.width,55/markImage.height);ctx.drawImage(markImage,935,1180,markImage.width*scale,markImage.height*scale);}
 const mark=(y:number)=>{ctx.globalAlpha=.24;ctx.strokeStyle=ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(80,y);ctx.lineTo(1000,y);ctx.stroke();ctx.globalAlpha=1;};
 if(post.format==='carousel')text(ctx,`${String(index+1).padStart(2,'0')} / ${post.frames.length}`,850,84,150,28,40,bodyFont,ink,600,28);
 const editorialChrome=d.layout==='essay'||d.layout==='list'||d.layout==='split';
 if(editorialChrome)mark(165);
 const metric=(value:string,w:number,size:number,min:number,max:number,family=bodyFont,bold=400,emphasis='',field?:TextField)=>{const override=textOverride(ctx,field);if(override){size=override.size;min=size;family=override.font??family;if(override.font)bold=override.weight;}let rows:string[]=[],used=size;for(let s=size;s>=min;s-=2){used=s;ctx.font=`${bold} ${s}px ${family}`;rows=styledRows(value,emphasis,w,(text,styled)=>{ctx.font=`${styled?'italic ':''}${bold} ${s}px ${family}`;const m=ctx.measureText(text);return {width:m.width,right:m.actualBoundingBoxRight};}).map(row=>row.runs.map(run=>run.text).join(''));ctx.font=`${bold} ${s}px ${family}`;if(rows.length*s*1.14<=max&&rows.every(r=>ctx.measureText(r).width<=w))break;}const h=rows.length*used*1.14;if(h>max||rows.some(r=>ctx.measureText(r).width>w))throw Error('Shorten this '+d.layout+' slide for readable type: “'+value.slice(0,85)+'”.');return {h,size:used};};
 const draw=(value:string,x:number,y:number,w:number,size:number,min:number,max:number,family=bodyFont,colour=ink,bold=400,center=false,emphasis='',backing=background,field?:TextField)=>{
  const override=textOverride(ctx,field);if(override){size=override.size;min=size;family=override.font??family;if(override.font)bold=override.weight;}
  const custom=field?appearanceContexts.get(ctx)?.colours[field]:undefined;colour=recordTextAppearance(ctx,field,colour,d.layout==='note'?p.paper:backing);
  if(!value.trim())return y;const m=metric(value,w,size,min,max,family,bold,emphasis);
  // Record the exact same safe bounds used by downloads.
  text(ctx,value,x,y,w,m.size,m.h+1,family,colour,bold,m.size,!(center||emphasis&&value.includes(emphasis)));
  if(center||emphasis&&value.includes(emphasis)){
   ctx.font=`${bold} ${m.size}px ${family}`;ctx.textBaseline='top';
   const rows=styledRows(value,emphasis,w,(value,styled)=>{ctx.font=`${styled?'italic ':''}${bold} ${m.size}px ${family}`;const metric=ctx.measureText(value);return {width:metric.width,right:metric.actualBoundingBoxRight};});
   paintStyledRows(ctx,rows,x,y,w,m.size*1.14,`${bold} ${m.size}px ${family}`,`italic ${bold} ${m.size}px ${family}`,colour,custom??accent,center);

  }return y+m.h;
 };
 const measureField=(field:TextField)=>(...a:Parameters<typeof metric>)=>metric(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],field);
 const drawField=(field:TextField)=>(...a:Parameters<typeof draw>)=>draw(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9],a[10],a[11],a[12],field);
 const headingMetric=measureField('heading'),bodyMetric=measureField('body'),headingDraw=drawField('heading'),bodyDraw=drawField('body');
 const asset=f.assetKey?brand.assets?.find(a=>a.key===f.assetKey):undefined;
 const photo=async(x:number,y:number,w:number,h:number)=>{if(!asset)throw Error('Choose a verified website image for this composition.');if(h<150)throw Error('This photo needs more space. Shorten the text.');const img=await loadImage(asset.url);paintSlideImage(ctx,img,{x,y,width:w,height:h},()=>{const focus=imageFocus(img,asset.role==='product'),scale=Math.min(w/focus.width,h/focus.height);const xx=x+(w-focus.width*scale)/2,yy=y+(h-focus.height*scale)/2,ww=focus.width*scale,hh=focus.height*scale;const shape=asset.role==='product'?'square':brand.style?.imageShape;if(shape&&shape!=='square'){ctx.save();ctx.beginPath();if(shape==='circle'){const size=Math.min(ww,hh);ctx.arc(x+w/2,y+h/2,size/2,0,Math.PI*2);}else ctx.roundRect(xx,yy,ww,hh,Math.min(ww,hh)*.06);ctx.clip();}ctx.drawImage(img,focus.x,focus.y,focus.width,focus.height,xx,yy,ww,hh);if(shape&&shape!=='square')ctx.restore();return {x:xx,y:yy,width:ww,height:hh};},asset.role==='product'?'square':brand.style?.imageShape);};
 const eyebrow=f.eyebrow?.trim()===brand.name.trim()?'':f.eyebrow;
 const imageHero=!!asset&&(d.layout==='photo'||d.layout==='poster'||d.layout==='split'&&!(f.items?.length));
 const centered=d.align==='center',top=eyebrow?260:imageHero?175:215,takeawayHeight=d.takeaway?metric(d.takeaway,920,54,44,220,font,weight).h+28:0;
 if(eyebrow)draw(eyebrow,80,d.layout==='diagram'?145:205,920,28,28,40,bodyFont,ink,600,centered);
 const title=(x:number,y:number,w:number,size:number,max:number)=>headingDraw(f.heading,x,y,w,size,64,max,font,ink,weight,centered,d.emphasis);
 const takeaway=(y:number,max=220)=>{if(!d.takeaway)return y;if(/^(?:book|explore|shop|try|discover|join|browse|order|visit)\b/i.test(d.takeaway)){const m=metric(d.takeaway,800,40,40,max,bodyFont,600),buttonWidth=Math.min(920,Math.max(300,...lines(ctx,d.takeaway,800).map(row=>ctx.measureText(row).width+80))),buttonX=(1080-buttonWidth)/2;ctx.fillStyle=p.primary;if(brand.style?.actionRadius){ctx.beginPath();ctx.roundRect(buttonX,y,buttonWidth,m.h+40,Math.min((m.h+40)/2,brand.style.actionRadius*3));ctx.fill();}else ctx.fillRect(buttonX,y,buttonWidth,m.h+40);return draw(d.takeaway,buttonX+40,y+20,buttonWidth-80,40,40,max,bodyFont,contrast(p.ink,p.primary)>=4.5?p.ink:foreground(p.primary),600,true,'',p.primary);}mark(y);return draw(d.takeaway,80,y+28,920,54,44,max,font,ink,weight,centered);};
 if(d.layout==='note'){
  // Ruled brand-authored note: no fake sender, app chrome or customer identity.
  ctx.fillStyle=p.paper;ctx.fillRect(80,190,920,995);ink=foreground(p.paper);
  ctx.globalAlpha=.18;ctx.strokeStyle=ink;ctx.lineWidth=1;
  for(let y=440;y<1150;y+=74){ctx.beginPath();ctx.moveTo(115,y);ctx.lineTo(965,y);ctx.stroke();}ctx.globalAlpha=1;
  const end=headingDraw(f.heading,120,245,840,92,64,255,font,ink,weight,false,d.emphasis,p.paper);
  const b=bodyDraw(f.body,120,Math.max(455,end+55),840,52,40,460,bodyFont,ink);
  if(d.takeaway)draw(d.takeaway,120,Math.max(1000,b+42),840,48,40,150,font,ink,weight);
 }else if(d.layout==='diagram'){
  const items=f.items??[];if(items.length<2||items.length>4)throw Error('Choose 2–4 connected steps for this diagram.');
  const bottom=d.takeaway?1035:1170,gap=18,diagramTop=185;
  const measures=items.map(item=>({label:metric(item.label,745,40,40,1000,font,weight).h,detail:metric(item.detail,745,40,40,1000).h}));
  const minimumBoxes=measures.map(m=>16+m.label+8+m.detail+12);
  const bodyHeight=bodyMetric(f.body,920,40,40,130).h;
  const required=minimumBoxes.reduce((sum,h)=>sum+h,0)+gap*(items.length-1);
  const headingCap=Math.min(240,bottom-diagramTop-bodyHeight-54-required);
  const end=title(80,diagramTop,920,96,headingCap),b=bodyDraw(f.body,80,end+22,920,44,40,bodyHeight),start=b+32;
  const extra=(bottom-start-required)/items.length;
  let nextY=start;
  items.forEach((item,i)=>{
   const y=nextY,boxHeight=minimumBoxes[i]+extra;nextY+=boxHeight+gap;
   ctx.strokeStyle=ink;ctx.globalAlpha=.35;ctx.lineWidth=2;if(brand.style?.cardRadius){ctx.beginPath();ctx.roundRect(80,y,920,boxHeight,brand.style.cardRadius*2);ctx.stroke();}else ctx.strokeRect(80,y,920,boxHeight);ctx.globalAlpha=1;
   draw(String(i+1).padStart(2,'0'),105,y+16,90,42,40,60,bodyFont,ink,600);
   const labelEnd=draw(item.label,220,y+16,745,48,40,boxHeight-16-8-measures[i].detail-12,font,ink,weight);
   draw(item.detail,220,labelEnd+8,745,40,40,boxHeight-(labelEnd-y)-20,bodyFont);
   if(i<items.length-1){const yy=y+boxHeight;ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(540,yy);ctx.lineTo(540,yy+gap-5);ctx.moveTo(533,yy+gap-12);ctx.lineTo(540,yy+gap-5);ctx.lineTo(547,yy+gap-12);ctx.stroke();}
  });if(d.takeaway){mark(1070);draw(d.takeaway,80,1090,920,44,40,100,bodyFont,ink,400,centered);}
 }else if(d.layout==='photo'&&!asset)throw Error('This photo composition needs a verified website image.');
 if(d.layout==='note'||d.layout==='diagram'){/* rendered above */}
 else if(d.layout==='product'){
  if(!asset)throw Error('Product layout needs a supplied image.');
  if(f.heading.length>36||f.body.length>24||f.heading.length+f.body.length>60||d.takeaway.length>28||f.items?.length||eyebrow)throw Error('Shorten product copy so the product stays the focus.');
  // Fixed visual area: copy cannot consume the product's space. Contain keeps the whole item.
  const imageTop=d.imagePosition==='top'?165:385;
  await photo(80,imageTop,920,710);
  const copyTop=d.imagePosition==='top'?885:170;
  const hm=headingMetric(f.heading,920,64,64,165,font,weight),bm=bodyMetric(f.body,920,40,40,95);
  if(hm.h+(f.body?16+bm.h:0)>220)throw Error('Product copy occupies too much space. Use a shorter headline or move the body to the caption.');
  const end=headingDraw(f.heading,80,copyTop,920,64,64,165,font,ink,weight,centered,d.emphasis);
  bodyDraw(f.body,80,end+16,920,40,40,95,bodyFont,ink,400,centered);
  if(d.takeaway)takeaway(1130,60);
 }else if(imageHero&&asset){
  if(d.imagePosition==='top'){
   const hm=headingMetric(f.heading,920,92,64,350,font,weight),bm=bodyMetric(f.body,920,44,40,180),photoH=Math.min(660,1175-top-hm.h-bm.h-takeawayHeight-110);await photo(80,top,920,photoH);const end=title(80,top+photoH+42,920,92,350);const b=bodyDraw(f.body,80,end+26,920,44,40,180,bodyFont,ink,400,centered);if(d.takeaway)takeaway(b+30);
  }else{
   const end=title(80,top,920,92,350),b=bodyDraw(f.body,80,end+24,920,44,40,180,bodyFont,ink,400,centered),imageTop=b+42;
   const reserved=takeawayHeight?takeawayHeight+25:0;await photo(80,imageTop,920,1175-imageTop-reserved);if(d.takeaway)takeaway(1175-takeawayHeight);
  }
 }else if(d.layout==='split'){
  const bottom=takeawayHeight?1175-takeawayHeight-35:1175;
  const itemMin=(f.items??[]).slice(0,2).map(item=>metric(item.label,415,44,44,1000,font,weight).h+35+metric(item.detail,415,40,40,1000).h);
  const minimumColumn=Math.max(0,...itemMin),introMin=bodyMetric(f.body,920,40,40,1000).h;
  const cap=asset?260:Math.min(300,bottom-top-45-introMin-42-minimumColumn);
  const end=title(80,top,920,96,cap),start=end+45;
  if(asset){const h=bottom-start;bodyDraw(f.body,80,start,445,44,40,h,bodyFont);await photo(580,start,420,h);if(d.takeaway)takeaway(1175-takeawayHeight);}
  else if((f.items??[]).length>=2){
   const intro=bodyDraw(f.body,80,start,920,44,40,Math.min(140,bottom-start-42-minimumColumn)),yy=intro+42;
   ctx.globalAlpha=.25;ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(540,yy);ctx.lineTo(540,bottom);ctx.stroke();ctx.globalAlpha=1;
   f.items!.slice(0,2).forEach((item,i)=>{const x=i?585:80,detailMin=metric(item.detail,415,40,40,1000).h;const labelEnd=draw(item.label,x,yy,415,60,44,Math.min(190,bottom-yy-35-detailMin),font,i?accent:ink,weight);draw(item.detail,x,labelEnd+35,415,44,40,bottom-labelEnd-35,bodyFont);});if(d.takeaway)takeaway(1175-takeawayHeight);
  }else{const endBody=bodyDraw(f.body,80,start,920,48,40,bottom-start);if(d.takeaway)takeaway(endBody+50,220);}
 }else if(d.layout==='list'&&f.items?.length){
  const numbered=f.composition==='process',x=numbered?205:80,w=numbered?795:920;
  const measures=f.items.map(item=>({label:metric(item.label.replace(/^\d+[.)]\s*/,''),w,40,40,1000,bodyFont,600).h,detail:metric(item.detail,w,40,40,1000).h})),bodyMin=bodyMetric(f.body,920,40,40,1000).h,headingMin=headingMetric(f.heading,920,64,64,1000,font,weight).h;
  const comfortable=measures.reduce((a,m)=>a+18+m.label+10+m.detail+20,0)+bodyMin+headingMin+26+38+(takeawayHeight?takeawayHeight+25:0)<=1180-top;
  const reserved=takeawayHeight?takeawayHeight+(comfortable?25:8):0;
  const pad=comfortable?18:8,gap=comfortable?10:6,tail=comfortable?20:8,bodyGap=comfortable?26:20,listGap=comfortable?38:20;
  const rowMin=measures.map(m=>pad+m.label+gap+m.detail+tail),totalRows=rowMin.reduce((a,h)=>a+h,0);
  const end=title(80,top,920,88,Math.min(260,1180-top-bodyGap-bodyMin-listGap-totalRows-reserved));
  const b=bodyDraw(f.body,80,end+bodyGap,920,44,40,Math.min(150,1180-end-bodyGap-listGap-totalRows-reserved)),start=b+listGap,extra=(1180-start-reserved-totalRows)/f.items.length;
  let yy=start;f.items.forEach((item,i)=>{const y=yy,rowH=rowMin[i]+extra;yy+=rowH;mark(y);if(numbered)draw(String(i+1).padStart(2,'0'),80,y+pad,95,46,40,64,bodyFont,accent,600);
   const detailMin=measures[i].detail,label=draw(item.label.replace(/^\d+[.)]\s*/,''),x,y+pad,w,48,40,rowH-pad-gap-detailMin-tail,bodyFont,ink,600);draw(item.detail,x,label+gap,w,44,40,rowH-(label-y)-tail,bodyFont);
  });if(d.takeaway)takeaway(1180-takeawayHeight);
 }else{
  const poster=d.layout==='poster';
  // A poster is a composed focal point, not an essay with a larger title.
  // Measure the complete block before centring so long text cannot hit the footer.
  const titleMeasure=headingMetric(f.heading,920,poster?140:102,64,poster?475:330,font,weight);
  const bodyMeasure=bodyMetric(f.body,920,poster?48:46,40,poster?260:460);
  const blockHeight=titleMeasure.h+(f.body.trim()?58+bodyMeasure.h:0)+(takeawayHeight?55+takeawayHeight:0);
  const titleTop=poster?Math.max(top,top+(1175-top-blockHeight)/2):top;
  const end=title(80,titleTop,920,poster?140:102,poster?475:330);
  const bodyTop=end+(poster?58:38),bodyMax=Math.min(poster?260:460,1175-bodyTop-(takeawayHeight?takeawayHeight+55:0));
  const b=bodyDraw(f.body,80,bodyTop,920,poster?48:46,40,bodyMax,bodyFont,ink,400,centered);
  if(asset&&d.imagePosition==='right'&&!f.body){await photo(80,b+40,920,1140-b-40);}else if(d.takeaway)takeaway(Math.max(b+55,1175-takeawayHeight));
 }
 if(editorialChrome)mark(1210);if(!hiddenBrandHeaders.has(ctx))draw(new URL(post.destination??brand.sourceUrl).hostname.replace(/^www\./,''),80,1250,700,26,26,38,bodyFont,ink);
 if(post.format==='carousel'&&index<post.frames.length-1)draw('Swipe →',850,1250,150,26,26,38,bodyFont,ink,600);
}
