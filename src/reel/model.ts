export type Word = { text: string; start: number; end: number };
export type ReelStyle = { font: string; size: number; text: string; highlight: string; position: 'lower'|'middle' };
export type ReelEditor = { words: Word[]; style: ReelStyle; hook: string; start: number; end: number; fit: 'fit'|'crop'; background?: string; cover?: {text:string; time:number; colour:string} };
export type ReelProject = { id: string; name: string; duration: number; phase: string; error: string|null; createdAt: number; updatedAt: number; version: number; exportVersion: number|null; coverVersion?: number; editor: ReelEditor; timings: Record<string,number>; progress: number|null };
export const defaultStyle: ReelStyle = {font:'Plus Jakarta Sans',size:64,text:'#ffffff',highlight:'#ff2782',position:'lower'};
export const fonts = ['Plus Jakarta Sans','Arial','Noto Sans Devanagari'] as const;
export function validateEditor(raw: unknown, duration: number, allowedFonts: readonly string[] = fonts): ReelEditor {
 const e=raw as ReelEditor;
 if(!e || !Array.isArray(e.words) || e.words.length>1500 || !e.style)throw new Error('The caption settings are incomplete.');
 if(!Number.isFinite(e.start)||!Number.isFinite(e.end)||e.start<0||e.end>duration+0.05||e.end-e.start<0.5)throw new Error('Choose a valid start and end inside the recording.');
 let previous=-1;
 const words=e.words.map(w=>{
  if(typeof w.text!=='string'||!w.text.trim()||w.text.length>80||!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<0||w.end>w.start+15||w.end<=w.start||w.end>duration+0.1||w.start<previous)throw new Error('Each word needs text and ordered timings inside the recording.');
  previous=w.start;return {text:w.text.trim(),start:w.start,end:w.end};
 });
 if(words.some(w=>w.start<e.start&&w.end>e.start||w.start<e.end&&w.end>e.end))throw new Error('Move the trim handle into a pause so it does not cut a word.');
 if(!allowedFonts.includes(e.style.font)||!Number.isFinite(e.style.size)||e.style.size<40||e.style.size>90||!/^#[\da-f]{6}$/i.test(e.style.text)||!/^#[\da-f]{6}$/i.test(e.style.highlight)||!['lower','middle'].includes(e.style.position))throw new Error('Choose a supported font, size and colour.');
 if(typeof e.hook!=='string'||e.hook.length>100||!['fit','crop'].includes(e.fit))throw new Error('Keep the opening line under 100 characters.');
 const background=e.background??'original';
 if(!backgrounds.some(b=>b.id===background))throw new Error('Choose a background from the list.');
 const cover=e.cover;
 if(cover&&(typeof cover.text!=='string'||cover.text.length>100||!Number.isFinite(cover.time)||cover.time<e.start||cover.time>=e.end||!/^#[\da-f]{6}$/i.test(cover.colour)))throw new Error('Choose a cover frame inside your trim, a headline under 100 characters and a valid colour.');
 return {background,...(cover?{cover:{...cover}}:{}),words,style:{...e.style},hook:e.hook.trim(),start:e.start,end:e.end,fit:e.fit};
}
export function captionGroups(words: Word[]): Word[][] {
 const groups:Word[][]=[];let chunk:Word[]=[];
 for(const w of words){
  if(chunk.length&&(chunk.length>=4||w.start-chunk.at(-1)!.end>0.5||chunk.map(x=>x.text).join(' ').length+w.text.length>30)){groups.push(chunk);chunk=[];}
  chunk.push(w);
  if(/[.!?।]$/.test(w.text)){groups.push(chunk);chunk=[];}
 }
 if(chunk.length)groups.push(chunk);return groups;
}
export function visibleWords(e:ReelEditor):Word[]{return e.words.filter(w=>w.start>=e.start&&w.end<=e.end).map(w=>({...w,start:w.start-e.start,end:w.end-e.start}));}
export function phraseAt(e:ReelEditor,time:number):Word[]{return captionGroups(visibleWords(e)).find(g=>time>=g[0].start&&time<g.at(-1)!.end)||[];}
export function assText(text:string){return text.replace(/[\\{}]/g,'').replace(/[\r\n]/g,' ');}
function assColour(hex:string){return '&H00'+hex.slice(5,7)+hex.slice(3,5)+hex.slice(1,3);}
function clock(s:number){const cs=Math.round(s*100);return `${Math.floor(cs/360000)}:${String(Math.floor(cs/6000)%60).padStart(2,'0')}:${String(Math.floor(cs/100)%60).padStart(2,'0')}.${String(cs%100).padStart(2,'0')}`;}
export function captionAss(e:ReelEditor):string {
 const s=e.style, y=s.position==='lower'?1400:1000;
 const head=`[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Caption,${s.font},${s.size},${assColour(s.text)},${assColour(s.highlight)},&H00141414,&H80000000,0,0,0,0,100,100,0,0,1,3,0,2,90,90,450,1\nStyle: Hook,${s.font},64,${assColour(s.text)},${assColour(s.text)},&H00141414,&H80000000,0,0,0,0,100,100,0,0,1,3,0,8,100,100,250,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
 const events:string[]=[];
 const add=(from:number,to:number,text:string,style='Caption')=>{if(to>from)events.push(`Dialogue: 0,${clock(from)},${clock(to)},${style},,0,0,0,,${text}`);};
 for(const g of captionGroups(visibleWords(e))){
  g.forEach((w,i)=>{
   const to=i<g.length-1?g[i+1].start:w.end;
   const text=g.map((x,j)=>`{\\c${assColour(j===i?s.highlight:s.text)}}${assText(x.text)}`).join(' ');
   add(w.start,to,`{\\pos(540,${y})}${text}`);
  });
 }
 if(e.hook)add(0,Math.min(3,e.end-e.start),assText(e.hook),'Hook');
 return head+events.join('\n')+'\n';
}
export function parseWhisper(json:unknown,duration:number):Word[]{
 const data=json as {transcription?:{text:string;offsets?:{from:number;to:number};tokens?:{text:string;offsets?:{from:number;to:number}}[]}[]};
 const words:Word[]=[];
 for(const segment of data.transcription??[]){
  for(const t of segment.tokens??[]){
   if(/^\[_/.test(t.text)||!t.text.trim())continue;
   const start=t.offsets&&t.offsets.from>=0?t.offsets.from/1000:(words.at(-1)?.end??(segment.offsets?.from??0)/1000);
   const end=Math.min(duration,t.offsets&&t.offsets.to>=0?t.offsets.to/1000:start);
   // Whisper tokens can be pieces of a word; whitespace starts a new word.
   if(/^\s/.test(t.text)||!words.length)words.push({text:t.text.trim(),start,end});
   else {const last=words.at(-1)!;last.text+=t.text;last.end=Math.max(last.end,end);}
  }
 }
 // Keep zero-duration words. Give them a short editable interval, rather than deleting speech.
 const timed:Word[]=[];
 for(const word of words){
  const start=Math.max(0,word.start,timed.at(-1)?.end??0),end=Math.min(duration,Math.max(word.end,start+0.04));
  if(end<=start){if(timed.length)timed.at(-1)!.text+=' '+word.text;continue;}
  timed.push({...word,start,end});
 }
 return timed;
}

export function validateUploadDuration(duration:number){
 if(!Number.isFinite(duration))throw new Error("Could not read this video’s length. Choose another MP4 or MOV.");
 if(duration<30||duration>90.1)throw new Error(`This video is ${duration.toFixed(1)} seconds long. Choose a recording between 30 and 90 seconds.`);
 return duration;
}

export const backgrounds=[{id:'original',label:'Original'},{id:'cream',label:'Warm studio'},{id:'rose',label:'Rose'},{id:'sage',label:'Sage'},{id:'lavender',label:'Lavender'},{id:'midnight',label:'Midnight'}];
// Suggest an exact transcript excerpt, prioritising a concrete problem or action over greetings.
export function recommendCover(e:ReelEditor){
 const words=e.words.filter(w=>w.start>=e.start&&w.end<=e.end);
 const start=Math.max(0,words.findIndex(w=>/^(testing|building|making|why|how|stop|start|struggling|save|बनाना|क्यों|कैसे)$/i.test(w.text)));
 let chunk=words.slice(start,start+8);const stop=chunk.findIndex((w,i)=>i>=4&&/^(and|but|so|because|और|लेकिन)$/i.test(w.text));if(stop>=0)chunk=chunk.slice(0,stop);let text=chunk.map(w=>w.text).join(' ');text=text.charAt(0).toUpperCase()+text.slice(1);
 if(text.length>90)text=text.slice(0,87)+'…';
 return {text,time:Math.min(e.end-.05,Math.max(e.start,(chunk[0]?.start??e.start)+.3)),colour:'#ffffff'};
}

export function sameVideoSettings(a:ReelEditor,b:ReelEditor){const {cover:ac,...av}=a;const {cover:bc,...bv}=b;return JSON.stringify(av)===JSON.stringify(bv);}
