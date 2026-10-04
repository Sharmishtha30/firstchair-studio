import {seedanceBase} from './seedanceRequest';
export type TaskState={done:false}|{done:true;url:string};
export async function createTask(key:string,body:unknown,fetcher:typeof fetch=fetch):Promise<string>{
 const response=await fetcher(seedanceBase,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`Seedance rejected the video request (HTTP ${response.status}). Check model access and BytePlus credits.`);
 const data=await response.json();if(typeof data.id!=='string'||!data.id.length)throw new Error('Seedance returned no task ID.');return data.id;
}
export async function taskState(key:string,id:string,fetcher:typeof fetch=fetch):Promise<TaskState>{
 const response=await fetcher(seedanceBase+'/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error(`Seedance status check failed (HTTP ${response.status}).`);
 const data=await response.json();if(['failed','cancelled','expired'].includes(data.status))throw new Error('Seedance did not produce a completed video.');
 if(['queued','running'].includes(data.status))return {done:false};
 if(data.status!=='succeeded')throw new Error('Seedance returned an unrecognised task status.');
 if(typeof data.content?.video_url!=='string')throw new Error('Seedance returned no video URL.');
 const url=new URL(data.content.video_url);
 if(url.protocol!=='https:'||url.username||url.password||!['volces.com','bytepluses.com'].some(domain=>url.hostname.endsWith('.'+domain)))throw new Error('Seedance returned an unexpected video host.');
 return {done:true,url:url.href};
}
export async function downloadVideo(url:string,fetcher:typeof fetch=fetch):Promise<Blob>{
 const response=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!response.ok||!response.body)throw new Error('The generated video could not be downloaded.');
 const max=25_000_000;if(Number(response.headers.get('content-length'))>max)throw new Error('Generated video exceeds the 25 MB storage limit.');
 const reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error('Generated video exceeds the 25 MB storage limit.');chunks.push(value);}}finally{await reader.cancel();}
 if(size<1000)throw new Error('Generated video file is incomplete.');return new Blob(chunks as BlobPart[],{type:'video/mp4'});
}
