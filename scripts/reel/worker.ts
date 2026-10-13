import {createServer, type IncomingMessage, type ServerResponse} from 'node:http';
import {randomBytes} from 'node:crypto';
import {createReadStream,createWriteStream} from 'node:fs';
import {mkdir,readFile,writeFile,stat,rename,rm,readdir,copyFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import path from 'node:path';
import {ConvexHttpClient} from 'convex/browser';
import {api} from '../../convex/_generated/api';
import {captionAss,sameVideoSettings,validateUploadDuration,defaultStyle,parseWhisper,validateEditor,fonts,type ReelProject} from '../../src/reel/model';
const root=process.cwd(),data=path.join(root,'.reel-data'),ffmpeg=process.env.REEL_FFMPEG||'/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg',ffprobe=process.env.REEL_FFPROBE||'/opt/homebrew/bin/ffprobe';
await mkdir(data,{recursive:true});
const env=await readFile(path.join(root,'.env.local'),'utf8');
const convexUrl=env.match(/^VITE_CONVEX_URL=(.*)$/m)?.[1]?.trim();
if(!convexUrl||!['localhost','127.0.0.1'].includes(new URL(convexUrl).hostname))throw new Error('Reels use the local Convex deployment. Start npm run dev first.');
const client=new ConvexHttpClient(convexUrl);
const key=(await readFile(path.join(data,'worker-key'),'utf8')).trim();
let busy=false;
const put=async(p:ReelProject,expectedVersion?:number)=>{p.updatedAt=Date.now();await client.mutation(api.reelProjects.put,{key,id:p.id,project:p,...(expectedVersion===undefined?{}:{expectedVersion})});};
const get=async(id:string):Promise<ReelProject>=>{if(!/^[a-f0-9]{64}$/.test(id))throw new Error('This reel link is invalid.');const p=await client.query(api.reelProjects.get,{key,id});if(!p)throw new Error('This reel was not found on this Mac.');return p;};
const dir=(id:string)=>path.join(data,id);
function run(command:string,args:string[],onOutput?:(s:string)=>void,timeout=600000):Promise<string>{return new Promise((resolve,reject)=>{
 const proc=spawn(command,args,{cwd:root,stdio:['ignore','pipe','pipe']});let output='',errors='';
 const timer=setTimeout(()=>{proc.kill('SIGKILL');reject(new Error('This step timed out. Your recording and edits are kept; try again.'));},timeout);
 proc.stdout.on('data',b=>{output=(output+b.toString()).slice(-2000000);onOutput?.(b.toString());});
 proc.stderr.on('data',b=>{errors=(errors+b.toString()).slice(-12000);});
 proc.on('error',e=>{clearTimeout(timer);reject(new Error(`The local video tool could not start: ${e.message}`));});
 proc.on('exit',code=>{clearTimeout(timer);if(code===0)resolve(output);else {console.error(errors.slice(-1500));reject(new Error('The local video tool could not complete this step. Your recording is kept.'));}});
 });}
async function phase(p:ReelProject,name:string){p.phase=name;p.error=null;p.progress=null;await put(p);}
async function processVideo(p:ReelProject,language:string){const started=Date.now();try{
 await phase(p,'Checking video');
 const input=path.join(dir(p.id),'source');
 const info=JSON.parse(await run(ffprobe,['-v','error','-show_format','-show_streams','-of','json',input]));
 const duration=Number(info.format?.duration);
 validateUploadDuration(duration);
 if(!info.streams?.some((x:{codec_type:string})=>x.codec_type==='video')||!info.streams?.some((x:{codec_type:string})=>x.codec_type==='audio'))throw new Error('Choose a video with an audible speech track.');
 p.duration=duration;p.editor.end=duration;
 await phase(p,'Preparing video');const prep=Date.now();
 await run(ffmpeg,['-y','-i',input,'-map','0:v:0','-map','0:a:0','-vf',"scale=720:1280:force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1,fps=30",'-c:v','libx264','-preset','ultrafast','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart',path.join(dir(p.id),'preview.mp4')]);
 await run(ffmpeg,['-y','-i',input,'-map','0:a:0','-vn','-ar','16000','-ac','1','-c:a','pcm_s16le',path.join(dir(p.id),'speech.wav')]);
 p.timings.prepare=Date.now()-prep;await phase(p,'Transcribing on your Mac');const transcription=Date.now();
 await run(process.env.REEL_WHISPER||'/opt/homebrew/bin/whisper-cli',['-m',process.env.REEL_MODEL||path.join(data,'models','ggml-small.bin'),'-f',path.join(dir(p.id),'speech.wav'),'-l',language,'-ojf','-of',path.join(dir(p.id),'transcript'),'-t','4']);
 p.editor.words=parseWhisper(JSON.parse(await readFile(path.join(dir(p.id),'transcript.json'),'utf8')),duration);
 if(!p.editor.words.length)throw new Error('No timed speech was found. Try a clearer recording.');
 p.timings.transcribe=Date.now()-transcription;p.timings.toPreview=Date.now()-started;
 p.editor=validateEditor(p.editor,duration);await phase(p,'Ready to edit');
 }catch(e){p.phase='Needs attention';p.error=e instanceof Error?e.message:'Could not prepare this recording.';await put(p);}finally{busy=false;}}
async function render(p:ReelProject,cover=false){const started=Date.now();try{
 const editor=validateEditor(p.editor,p.duration,await allowedFonts(p.id));const version=p.version;
 const folder=dir(p.id),mask=path.join(folder,'person-mask.mkv');
 const replaced=editor.background&&editor.background!=='original';
 if(replaced){
  try{await stat(mask);}catch{
   await phase(p,'Separating you from the background');
   const temporary=path.join(folder,'person-mask-building.mkv');
   await run(path.join(data,'person-mask'),[path.join(folder,'preview.mp4'),temporary]);
   await rename(temporary,mask);
  }
 }
 await phase(p,cover?'Creating cover':'Exporting');
 const ass=path.join(folder,cover?'cover.ass':'captions.ass'),output=path.join(folder,cover?`cover-${version}.png`:`export-${version}.mp4`);
 if(cover&&!editor.cover)throw new Error('Choose your cover headline and frame first.');
 await writeFile(ass,cover?captionAss({...editor,words:[{text:editor.cover!.text,start:0,end:3}],start:0,end:3,hook:'',style:{...editor.style,size:90,position:'lower',text:editor.cover!.colour,highlight:editor.cover!.colour}}):captionAss(editor));
 const seek=cover?editor.cover!.time:editor.start;
 const fit=editor.fit==='crop'?'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920':'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black';
 const subtitle=`subtitles=filename='${ass}':fontsdir='${path.join(folder,'fonts')}'`;
 const inputs=['-y','-ss',String(seek),'-i',path.join(folder,'source')];
 let graph=`[0:v]${fit},setsar=1,fps=30,${subtitle}[out]`;
 if(replaced){
  inputs.push('-ss',String(seek),'-i',mask,'-loop','1','-i',path.join(root,'public/reel-backgrounds',editor.background+'.png'));
  // Mask is generated at 360x640; restore the original aspect before applying the same crop/fit as the video.
  const info=JSON.parse(await run(ffprobe,['-v','error','-show_streams','-of','json',path.join(folder,'preview.mp4')]));
  const v=info.streams.find((s:{codec_type:string})=>s.codec_type==='video');
  graph=`[0:v]${fit},setsar=1,fps=30[fg];[1:v]scale=${v.width}:${v.height},${fit},setsar=1,fps=30,format=gray[m];[fg][m]alphamerge[person];[2:v]setsar=1,fps=30[bg];[bg][person]overlay=shortest=1,${subtitle}[out]`;
 }
 const ending=cover?['-frames:v','1','-update','1',output]:['-t',String(editor.end-editor.start),'-map','0:a:0','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',output];
 await run(ffmpeg,[...inputs,'-filter_complex',graph,'-map','[out]',...ending]);
 if(cover){p.coverVersion=version;p.timings.cover=Date.now()-started;await phase(p,'Cover ready');}
 else{
  const info=JSON.parse(await run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',output]));
  const v=info.streams.find((s:{codec_type:string})=>s.codec_type==='video');
  if(v?.width!==1080||v?.height!==1920||Math.abs(Number(info.format.duration)-(editor.end-editor.start))>0.15)throw new Error('The export did not pass its size and duration checks.');
  p.exportVersion=version;p.timings.export=Date.now()-started;await phase(p,'Export ready');
 }
 }catch(e){p.phase='Needs attention';p.error=e instanceof Error?e.message:'Could not create this file. Your edits are kept.';await put(p);}finally{busy=false;}}
async function fontRecords(id:string):Promise<{font:string;file:string}[]>{try{return JSON.parse(await readFile(path.join(dir(id),'fonts.json'),'utf8'));}catch{return [];}}
async function allowedFonts(id:string){return [...fonts,...(await fontRecords(id)).map(f=>f.font)];}
async function receive(req:IncomingMessage,file:string,limit:number){let size=0;const counter=new Transform({transform(chunk,_enc,cb){size+=chunk.length;cb(size>limit?new Error('This file is too large.'):null,chunk);}});try{await pipeline(req,counter,createWriteStream(file,{mode:0o600}));}catch(e){await rm(file,{force:true});throw e;}if(!size)throw new Error('Choose a file first.');}
async function jsonBody(req:IncomingMessage){let b='';for await(const chunk of req){b+=chunk.toString();if(b.length>500000)throw new Error('The edit is too large.');}return JSON.parse(b);}
function json(res:ServerResponse,status:number,obj:unknown){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
async function sendFile(req:IncomingMessage,res:ServerResponse,file:string,download=false){const st=await stat(file);res.setHeader('Content-Type','video/mp4');res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');if(download)res.setHeader('Content-Disposition','attachment; filename="firstchair-reel.mp4"');
 const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);const start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),st.size-1):st.size-1;
 if(start>=st.size||end<start){res.writeHead(416,{'Content-Range':`bytes */${st.size}`});res.end();return;}
 res.setHeader('Content-Length',end-start+1);if(range){res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${st.size}`});}else res.writeHead(200);await pipeline(createReadStream(file,{start,end}),res);}
const safeOrigins=new Set(['http://localhost:5173','http://127.0.0.1:5173']);
const server=createServer(async(req,res)=>{try{
 if(!['127.0.0.1:5176','localhost:5176','localhost:5173','127.0.0.1:5173'].includes(req.headers.host||'')){json(res,403,{error:'Local access only.'});return;}
 if(req.method!=='GET'&&(!safeOrigins.has(req.headers.origin||'')||!req.headers['content-type'])){json(res,403,{error:'Open the local reel editor to make changes.'});return;}
 const url=new URL(req.url||'/', 'http://localhost:5176'),segments=url.pathname.split('/').filter(Boolean);
 if(segments[0]!=='api'||segments[1]!=='reels'){json(res,404,{error:'Not found'});return;}
 if(segments[2]==='health'){json(res,200,{ready:true,engine:'Local Whisper small',paidApi:false});return;}
 if(req.method==='POST'&&segments.length===2){
  if(busy){json(res,409,{error:'Your Mac is processing another reel. Let it finish first.'});return;}busy=true;
  const id=randomBytes(32).toString('hex'),folder=dir(id);await mkdir(path.join(folder,'fonts'),{recursive:true});
  await copyFile(path.join(root,'public/fonts/plus-jakarta-sans-700.ttf'),path.join(folder,'fonts/plus-jakarta.ttf'));
  await copyFile(path.join(root,'public/fonts/noto-sans-devanagari.ttf'),path.join(folder,'fonts/noto.ttf'));
  try{await receive(req,path.join(folder,'source'),250*1024*1024);}catch(e){busy=false;await rm(folder,{recursive:true,force:true});throw e;}
  const name=(url.searchParams.get('name')||'My reel').slice(0,100),language=url.searchParams.get('language')||'auto';
  if(!['auto','en','hi'].includes(language)){busy=false;throw new Error('Choose English, Hindi or automatic detection.');}
  const p:ReelProject={id,name,duration:0,phase:'Checking video',error:null,createdAt:Date.now(),updatedAt:Date.now(),version:1,exportVersion:null,editor:{words:[],style:{...defaultStyle},hook:'',start:0,end:0,fit:'fit'},timings:{},progress:null};
  try{await put(p);}catch(e){busy=false;throw e;}
  json(res,202,{project:p,fonts:await allowedFonts(id)});void processVideo(p,language);return;
 }
 const id=segments[2],p=await get(id);
 if(req.method==='GET'&&segments.length===3){json(res,200,{project:p,fonts:await allowedFonts(id)});return;}
 if(req.method==='GET'&&segments[3]==='preview'){await sendFile(req,res,path.join(dir(id),'preview.mp4'));return;}
 if(req.method==='GET'&&segments[3]==='download'){if(p.exportVersion===null||p.exportVersion!==p.version)throw new Error('Export the current edits first.');await sendFile(req,res,path.join(dir(id),`export-${p.exportVersion}.mp4`),true);return;}
 if(req.method==='GET'&&segments[3]==='cover'){if(p.coverVersion!==p.version)throw new Error('Create the cover for your current edits first.');res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-store',...(url.searchParams.has('download')?{'Content-Disposition':'attachment; filename=firstchair-cover.png'}:{})});await pipeline(createReadStream(path.join(dir(id),`cover-${p.version}.png`)),res);return;}
 if(req.method==='GET'&&segments[3]==='font'){const record=(await fontRecords(id))[Number(url.searchParams.get('index'))];if(!record)throw new Error('Font not found.');res.writeHead(200,{'Content-Type':'font/ttf'});await pipeline(createReadStream(path.join(dir(id),'fonts',record.file)),res);return;}
 if(req.method==='POST'&&['save','export','cover','retry','font'].includes(segments[3])){
  if(busy){json(res,409,{error:'Let the current video step finish before changing this reel.'});return;}
  if(segments[3]==='retry'){busy=true;json(res,202,{project:p});void processVideo(p,'auto');return;}
  if(!p.editor.words.length)throw new Error('Wait for the transcript before editing.');
  if(segments[3]==='font'){
   const file=`custom-${randomBytes(8).toString('hex')}.ttf`,target=path.join(dir(id),'fonts',file);
   await receive(req,target,10*1024*1024);const family=(await run('/opt/homebrew/bin/fc-scan',['--format','%{family[0]}',target])).trim();
   if(!family||family.length>80||!/^[\p{L}\p{N} ._-]+$/u.test(family)){await rm(target,{force:true});throw new Error('This font could not be read. Use a valid TTF or OTF font.');}
   const records=await fontRecords(id);if(records.length>=5){await rm(target,{force:true});throw new Error('This prototype supports five custom fonts per reel.');}
   if((await allowedFonts(id)).includes(family)){await rm(target,{force:true});throw new Error('This font is already available in the font menu.');}
   records.push({font:family,file});await writeFile(path.join(dir(id),'fonts.json'),JSON.stringify(records));json(res,200,{fonts:await allowedFonts(id)});return;
  }
  const body=await jsonBody(req);
  if(body.version!==p.version){json(res,409,{error:'This reel changed in another tab. Reload before saving.'});return;}
  const next=validateEditor(body.editor,p.duration,await allowedFonts(id));const previous=validateEditor(p.editor,p.duration,await allowedFonts(id));if(JSON.stringify(next)!==JSON.stringify(previous)){
   
   const exported=p.exportVersion===p.version;const oldVersion=p.version;p.version++;
   if(exported&&sameVideoSettings(previous,next)){await copyFile(path.join(dir(id),`export-${oldVersion}.mp4`),path.join(dir(id),`export-${p.version}.mp4`));p.exportVersion=p.version;}
  }p.editor=next;p.error=null;p.phase='Ready to edit';p.progress=null;await put(p,body.version);
  if(['export','cover'].includes(segments[3])){busy=true;json(res,202,{project:p,fonts:await allowedFonts(id)});void render(p,segments[3]==='cover');}else json(res,200,{project:p,fonts:await allowedFonts(id)});return;
 }
 json(res,404,{error:'Not found'});
 }catch(e){if(!res.headersSent)json(res,400,{error:e instanceof Error?e.message:'Could not complete this step.'});else res.destroy();}});
// Claim the port before touching saved jobs: a second worker must not interrupt the first.
busy=true;
await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(5176,'127.0.0.1',resolve);});
// Mark interrupted jobs recoverable; metadata stays in Convex and media stays on disk.
for(const entry of await readdir(data)){if(!/^[a-f0-9]{64}$/.test(entry))continue;try{const p=await get(entry);if(['Checking video','Preparing video','Transcribing on your Mac','Exporting','Separating you from the background','Creating cover'].includes(p.phase)){p.phase='Needs attention';p.error='The local worker stopped. Retry to continue with your saved recording.';await put(p);}}catch{/* A failed upload may have no Convex record. */}}
busy=false;console.log('Local reel worker ready. Open http://localhost:5173/reels');
server.on('error',e=>{console.error(e.message);process.exit(1);});
