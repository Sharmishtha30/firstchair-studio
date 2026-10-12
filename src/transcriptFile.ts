import {unzipSync,strFromU8} from 'fflate';
import {callLimits} from '../convex/customerCall';
const entities:Record<string,string>={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
function decode(text:string){return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(all,code:string)=>code[0]==='#'?String.fromCodePoint(code[1]==='x'||code[1]==='X'?parseInt(code.slice(2),16):Number(code.slice(1))):entities[code.toLowerCase()]??all);}
// WebVTT cues become plain lines; <v Name> voice tags become "Name: text" so speakers survive.
export function vttText(source:string){
 const lines:string[]=[];
 for(const block of source.replace(/\r\n?/g,'\n').split(/\n{2,}/)){
  const rows=block.split('\n').map(r=>r.trim()).filter(Boolean);
  if(!rows.length||/^(WEBVTT|NOTE|STYLE|REGION)\b/.test(rows[0]))continue;
  const at=rows.findIndex(r=>r.includes('-->'));if(at<0)continue;
  const text=rows.slice(at+1).join(' ');if(!text)continue;
  const voice=text.match(/^<v(?:\.[^\s>]+)?\s+([^>]+)>/);
  const plain=decode(text.replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
  if(plain)lines.push(voice&&!/^[^:]{1,40}:/.test(plain)?voice[1].trim()+': '+plain:plain);
 }
 return lines.join('\n');
}
// Paragraph text from a .docx package's main document.
export function docxText(bytes:Uint8Array){
 let xml:string;
 try{const files=unzipSync(bytes,{filter:f=>f.name==='word/document.xml'});xml=strFromU8(files['word/document.xml']);}catch{throw new Error('This .docx file could not be opened.');}
 if(!xml)throw new Error('This .docx file has no document text.');
 return xml.split(/<\/w:p>/).map(paragraph=>{let text='';for(const m of paragraph.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<w:tab\/>|<w:br\/>/g))text+=m[1]!==undefined?decode(m[1]):m[0]==='<w:tab/>'?' ':'\n';return text.trim();}).filter(Boolean).join('\n');
}
export async function readTranscriptFile(file:File){
 if(file.size>callLimits.maxFileBytes)throw new Error('Use a transcript file under 5 MB.');
 const name=file.name.toLowerCase();
 if(name.endsWith('.docx'))return docxText(new Uint8Array(await file.arrayBuffer()));
 if(name.endsWith('.vtt'))return vttText(await file.text());
 if(name.endsWith('.txt'))return await file.text();
 throw new Error('Upload a .txt, .docx or .vtt transcript.');
}
