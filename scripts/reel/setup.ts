import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import path from 'node:path';
const folder=path.join(process.cwd(),'.reel-data');await mkdir(folder,{recursive:true});
const env=await readFile('.env.local','utf8');if(!/^CONVEX_DEPLOYMENT=local:/m.test(env))throw new Error('Run npm run dev with the local Convex deployment first.');
let key:string;try{key=(await readFile(path.join(folder,'worker-key'),'utf8')).trim();}catch{key=randomBytes(32).toString('hex');await writeFile(path.join(folder,'worker-key'),key,{mode:0o600});}
await new Promise<void>((resolve,reject)=>{const proc=spawn('npx',['convex','env','set','REEL_LOCAL_WORKER_KEY'],{stdio:['pipe','pipe','pipe']});proc.stdin.end(key+'\n');proc.on('error',reject);proc.on('exit',code=>code===0?resolve():reject(new Error('Could not configure the local Convex worker.')));});
console.log('Local reel storage is configured. No paid API has been enabled.');

await new Promise<void>((resolve,reject)=>{const proc=spawn("swiftc",["scripts/reel/person-mask.swift","-o",path.join(folder,"person-mask")],{stdio:"inherit"});proc.on("error",reject);proc.on("exit",code=>code===0?resolve():reject(new Error("Could not build the local background tool.")));});
