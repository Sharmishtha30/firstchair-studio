// Read dimensions from file headers. No native image library runs in Convex.
export function imageInfo(bytes:Uint8Array):{mime:string;width:number;height:number}|undefined{
 const u32=(i:number)=>new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(i);
 if(bytes.length>24&&bytes[0]===137&&bytes[1]===80)return {mime:'image/png',width:u32(16),height:u32(20)};
 if(bytes.length>30&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'){
  const kind=String.fromCharCode(...bytes.slice(12,16));if(kind==='VP8X')return {mime:'image/webp',width:1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16),height:1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16)};
  if(kind==='VP8 '&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42)return {mime:'image/webp',width:(bytes[26]|bytes[27]<<8)&16383,height:(bytes[28]|bytes[29]<<8)&16383};
 }
 if(bytes[0]===255&&bytes[1]===216){for(let i=2;i+9<bytes.length;){if(bytes[i]!==255){i++;continue;}const marker=bytes[i+1],length=(bytes[i+2]<<8)+bytes[i+3];if([192,193,194].includes(marker))return {mime:'image/jpeg',width:(bytes[i+7]<<8)+bytes[i+8],height:(bytes[i+5]<<8)+bytes[i+6]};if(length<2)break;i+=2+length;}}
 return undefined;
}
