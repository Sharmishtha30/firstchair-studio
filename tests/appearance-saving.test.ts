import {test} from 'node:test';
import assert from 'node:assert/strict';
import {styleAppearance} from '../convex/studio';

const args={token:'fixture',platform:'instagram',format:'carousel',slide:0,colour:{field:'heading',value:'#FF307E'},image:{size:'M',mode:'fill'}};
function fixture(subject:string|null='owner|session',stage='Ready'){
 const pack={_id:'pack',userId:'owner',stage,editCount:1,posts:[{format:'carousel',platform:'instagram',frames:[{heading:'Keep this headline',body:'Keep this body',assetKey:'photo',textStyles:{heading:{font:'Lora',size:'S'}}}]},{format:'static',platform:'instagram',frames:[{heading:'Other creative',body:''}]}]};
 let patch:Record<string,any>|undefined;
 const chain={withIndex:()=>chain,unique:async()=>pack};
 const ctx={auth:{getUserIdentity:async()=>subject?{subject}:null},db:{query:()=>chain,patch:async(_id:string,value:Record<string,any>)=>{patch=value;}}};
 return {pack,ctx,getPatch:()=>patch};
}
const run=(ctx:unknown,value:unknown)=>(styleAppearance as unknown as {_handler:(ctx:unknown,args:unknown)=>Promise<null>})._handler(ctx,value);
test('appearance saves preserve text, font settings and exhausted rewrite allowance',async()=>{
 const f=fixture();await run(f.ctx,args);const patch=f.getPatch()!;
 assert.ok(patch);assert.equal('editCount' in patch,false);assert.equal(f.pack.editCount,1);
 assert.equal(patch.posts[0].frames[0].heading,'Keep this headline');assert.equal(patch.posts[0].frames[0].body,'Keep this body');
 assert.deepEqual(patch.posts[0].frames[0].textStyles,{heading:{font:'Lora',size:'S'}});
 assert.equal(patch.posts[0].frames[0].textColours.heading,'#ff307e');assert.deepEqual(patch.posts[0].frames[0].imageStyle,{size:'M',mode:'fill'});
 assert.equal(patch.posts[1],f.pack.posts[1]);
});
test('appearance changes reject signed-out users, other owners, invalid colours and missing slides',async()=>{
 for(const subject of [null,'someone-else|session']){const f=fixture(subject);await assert.rejects(run(f.ctx,args),/account that created/);assert.equal(f.getPatch(),undefined);}
 const f=fixture();await assert.rejects(run(f.ctx,{...args,colour:{field:'heading',value:'red'}}),/valid colour/);
 await assert.rejects(run(f.ctx,{...args,slide:99}),/Slide not found/);assert.equal(f.getPatch(),undefined);
 await assert.rejects(run(fixture('owner|session','Writing posts').ctx,args),/writing to finish/);
});
