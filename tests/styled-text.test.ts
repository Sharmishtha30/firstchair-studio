import {test} from 'node:test';
import assert from 'node:assert/strict';
import {styledRows} from '../src/styledText';
const measure=(text:string,styled:boolean)=>({width:text.length*10,right:text.length*10+(styled?9:0)});
test('italic overhang reserves a full plain space before the next word',()=>{
 for(const [text,phrase,next] of [["Like cocoa AND nuts in your protein bar?","cocoa AND nuts","in"],["Want fruit and cream in the same frozen bite?","fruit and cream","in"],["What happens before Maid2Clean accepts a cleaner?","before","Maid2Clean"]]){
 const rows=styledRows(text,phrase,1000,measure),runs=rows.flatMap(r=>r.runs);assert.equal(runs.map(r=>r.text).join(''),text);
 const n=runs.findIndex(r=>r.text===next),previous=runs[n-2];assert.equal(runs[n-1].text,' ');assert.ok(runs[n].x-(previous.x+measure(previous.text,true).right)>=10);
 }
});
test('styled wrapping preserves words and explicit paragraph boundaries',()=>{
 const rows=styledRows('Plain styled next\nAnother line','styled',120,measure);assert.deepEqual(rows.map(r=>r.runs.map(v=>v.text).join('')),['Plain','styled next','Another line']);assert.ok(rows.every(r=>r.width<=120));
});
test('punctuation stays attached and styles can end inside a word',()=>{
 const rows=styledRows('Read this. Then go.','this',1000,measure);assert.equal(rows[0].runs.map(r=>r.text).join(''),'Read this. Then go.');assert.equal(rows[0].runs.find(r=>r.text==='.')?.emphasised,false);
});
