import type {Brand,Post} from '../convex/studioTypes';
export function colours(brand:Brand){const p=brand.palette??{paper:'#ffffff',ink:'#101010',primary:'#253e62',accent:'#253e62',note:'Neutral fallback'};return p;}
function luminance(hex:string){return hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);}
export function foreground(background:string){return luminance(background)>.3?'#101010':'#ffffff';}
export function lines(ctx:CanvasRenderingContext2D,value:string,width:number){const result:string[]=[];for(const para of value.split('\n')){let row='';for(const word of para.split(/\s+/)){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){result.push(row);row=word;}else row=next;}result.push(row);}return result;}
export function text(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,width:number,size:number,maxHeight:number,font:string,colour:string,weight=400){
 let rows:string[]=[],line=0;for(let s=size;s>=Math.min(size,26);s-=2){ctx.font=`${weight} ${s}px ${font}`;rows=lines(ctx,value,width);line=s*1.25;if(rows.length*line<=maxHeight)break;}
 if(rows.length*line>maxHeight||rows.some(row=>ctx.measureText(row).width>width))throw new Error('This copy cannot fit the artwork. Shorten this piece through feedback.');ctx.fillStyle=colour;ctx.textBaseline='top';for(const row of rows){ctx.fillText(row,x,y);y+=line;}return y;
}
const logos=new Map<string,Promise<HTMLImageElement>>();
async function logo(url:string){let request=logos.get(url);if(!request){request=new Promise((resolve,reject)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=reject;i.src=url;});logos.set(url,request);}return request;}
export async function header(ctx:CanvasRenderingContext2D,brand:Brand,ink:string){
 if(brand.style?.logoUrl){try{const img=await logo(brand.style.logoUrl);const factor=Math.min(460/img.width,70/img.height);ctx.drawImage(img,76,58,img.width*factor,img.height*factor);return;}catch{/* Verified text fallback, never a generated logo. */}}
 text(ctx,brand.name,76,64,850,32,80,brand.style?.headline==='serif'?'Georgia':'"Brand Inter"',ink,brand.style?.weight??600);
}
export async function renderArtwork(post:Post,brand:Brand,index=0,layout=post.layout??'headline'){
 await Promise.all([400,600].map(w=>document.fonts.load(`${w} 40px "Brand Inter"`)));
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const ctx=c.getContext('2d')!,p=colours(brand),ink=foreground(p.paper),font=brand.style?.headline==='serif'?'Georgia':'"Brand Inter"',weight=brand.style?.headline==='serif'?400:600;
 ctx.fillStyle=p.paper;ctx.fillRect(0,0,1080,1350);await header(ctx,brand,ink);
 const rule=(y:number)=>{ctx.strokeStyle=ink;ctx.globalAlpha=.15;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(76,y);ctx.lineTo(1004,y);ctx.stroke();ctx.globalAlpha=1;};rule(152);
 if(post.format==='carousel')text(ctx,`${String(index+1).padStart(2,'0')} / ${post.frames.length}`,76,185,800,24,36,'"Brand Inter"',ink);
 const f=post.frames[index];let end=text(ctx,f.heading,76,255,928,brand.style?.headline==='serif'?100:86,340,font,ink,weight);
 const parts=f.body.split('\n'),tail=parts.at(-1)??'',cta=/^(apply|explore|start|see|visit|join|try|learn|discover|get|shop|browse|book|find|read|check|choose)\b/i.test(tail)&&parts.length>1;const value=cta?parts.slice(0,-1).join('\n'):f.body;
 if(layout==='comparison'&&post.format==='static'&&value.split('\n').length===2){
  const pair=value.split('\n'),top=end+60;ctx.strokeStyle=ink;ctx.globalAlpha=.2;ctx.strokeRect(76,top,448,330);ctx.strokeRect(556,top,448,330);ctx.globalAlpha=1;ctx.fillStyle=p.primary;ctx.fillRect(556,top,448,4);
  text(ctx,pair[0],104,top+40,390,38,245,'"Brand Inter"',ink);text(ctx,pair[1],584,top+40,390,38,245,'"Brand Inter"',ink);
 }else if(layout==='note'){
  const top=end+60;ctx.strokeStyle=p.primary;ctx.lineWidth=2;ctx.strokeRect(76,top,928,370);text(ctx,value,110,top+40,860,42,285,'"Brand Inter"',ink);
 }else{text(ctx,value,80,end+65,900,42,350,'"Brand Inter"',ink);ctx.fillStyle=p.primary;ctx.fillRect(80,1040,150,5);}
 if(cta){ctx.fillStyle=p.primary;ctx.fillRect(76,1110,928,88);text(ctx,tail,104,1133,870,31,45,'"Brand Inter"',foreground(p.primary),600);}
 rule(1240);text(ctx,new URL(brand.sourceUrl).hostname,76,1272,780,25,36,'"Brand Inter"',ink);
 if(post.format==='carousel'&&index<post.frames.length-1)text(ctx,'SWIPE →',835,1272,190,24,36,'"Brand Inter"',ink,600);
 return c;
}
