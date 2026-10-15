import test from 'node:test';
import assert from 'node:assert/strict';
import {oversizedSourceCorrections} from '../convex/contentFormatting';
const frame=(words:number)=>({label:'',heading:'',body:Array(words).fill('word').join(' '),bullets:[] as string[]});
test('one repair targets every oversized carousel frame and static, preserving valid frames',()=>{
 const draft={carousel:[frame(40),frame(41),frame(5),frame(52)],static:frame(26)};
 const before=structuredClone(draft);
 assert.deepEqual(oversizedSourceCorrections(draft).map(c=>c.slideNumbers),[[2],[4],[0]]);
 assert.deepEqual(draft,before);
});
test('all visible fields count together and limits remain inclusive',()=>{
 const draft={carousel:[{...frame(35),heading:'one two three',label:'four',bullets:['five six']}],static:frame(25)};
 assert.deepEqual(oversizedSourceCorrections(draft).map(c=>c.slideNumbers),[[1]]);
 assert.deepEqual(oversizedSourceCorrections({carousel:[frame(40)],static:frame(25)}),[]);
});
