export async function beforeDeadline<T>(operation:Promise<T>,deadline:number):Promise<T>{
 const remaining=deadline-Date.now();
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([operation,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Website took too long to respond.')),Math.max(0,remaining));})]);}
 finally{if(timer)clearTimeout(timer);}
}
