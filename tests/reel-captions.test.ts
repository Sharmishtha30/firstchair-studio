import test from 'node:test';
import assert from 'node:assert/strict';
import {captionAss,sameVideoSettings,recommendCover,validateUploadDuration,captionGroups,defaultStyle,parseWhisper,phraseAt,validateEditor,type ReelEditor} from '../src/reel/model';
const editor:ReelEditor={words:[{text:'Your',start:1,end:1.4},{text:'brand',start:1.5,end:2},{text:'matters.',start:2.1,end:2.8}],style:defaultStyle,hook:'Your voice, your brand',start:0.5,end:4,fit:'fit'};
test('Caption export subtracts trim time, highlights words, and preserves spaces between styles',()=>{const result=captionAss(editor);assert.match(result,/Dialogue: 0,0:00:00.50,0:00:01.00/);assert.match(result,/Your \{\\c&H00ffffff\}brand/);assert.match(result,/Your voice, your brand/);assert.match(result,/PlayResY: 1920/);assert.equal(phraseAt(editor,0.6)[0].text,'Your');});
test('Editing cannot trim through a spoken word or inject a rendering font',()=>{assert.throws(()=>validateEditor({...editor,start:1.2},5),/cut a word/);assert.throws(()=>validateEditor({...editor,style:{...defaultStyle,font:'Arial,Injected'}},5),/supported font/);assert.throws(()=>validateEditor({...editor,words:[{text:'word',start:3,end:2}]},5),/timings/);assert.equal(validateEditor(editor,5).words[1].text,'brand');});
test('Speech recognition token pieces join into words, not disconnected syllables',()=>{const input={transcription:[{tokens:[{text:' Found',offsets:{from:100,to:200}},{text:'er',offsets:{from:200,to:300}},{text:' voice',offsets:{from:400,to:600}},{text:'[_EOT_]',offsets:{from:600,to:700}}]}]};assert.deepEqual(parseWhisper(input,5),[{text:'Founder',start:.1,end:.3},{text:'voice',start:.4,end:.6}]);});
test('Long gaps create new phrases and literal caption text cannot inject ASS commands',()=>{assert.equal(captionGroups([{text:'Hi',start:0,end:1},{text:'again',start:2,end:3}]).length,2);assert.doesNotMatch(captionAss({...editor,hook:'{\\pos(1,1)}Hello\nthere'}),/\{\\pos\(1,1\)\}/);});

test('Zero-duration speech tokens remain in the captions with editable timing',()=>{const words=parseWhisper({transcription:[{tokens:[{text:' Running',offsets:{from:20,to:410}},{text:' a',offsets:{from:530,to:530}},{text:' small',offsets:{from:530,to:830}}]}]},4);assert.equal(words.map(w=>w.text).join(' '),'Running a small');assert.ok(words[1].end>words[1].start);assert.ok(words[2].start>=words[1].end);});

test("Upload duration explains why a short phone video is rejected",()=>{assert.throws(()=>validateUploadDuration(9.7815),/9.8 seconds.*30 and 90/);assert.equal(validateUploadDuration(30),30);assert.equal(validateUploadDuration(90),90);assert.throws(()=>validateUploadDuration(120),/120.0 seconds/);assert.throws(()=>validateUploadDuration(NaN),/Could not read/);});

test('Background and cover settings survive saves while unsafe assets and frames are rejected',()=>{
 const edited={...editor,background:'sage',cover:{text:'Your brand matters',time:2,colour:'#ffffff'}};
 assert.equal(validateEditor(edited,5).background,'sage');assert.deepEqual(validateEditor(edited,5).cover,edited.cover);
 assert.throws(()=>validateEditor({...edited,background:'../../secret'},5),/background/);
 assert.throws(()=>validateEditor({...edited,cover:{...edited.cover,time:5}},5),/cover frame/);
 assert.equal(validateEditor(editor,5).background,'original');
 const suggestion=recommendCover(editor);assert.equal(suggestion.text,'Your brand matters.');assert.ok(suggestion.time>=editor.start&&suggestion.time<editor.end);
});

test("Background changes require a new video but choosing or removing a thumbnail preserves it",()=>{const base=validateEditor({...editor,background:"midnight"},5);assert.equal(sameVideoSettings(base,{...base,background:"rose"}),false);const withCover={...base,cover:{text:"Your brand",time:2,colour:"#ffffff"}};assert.equal(sameVideoSettings(base,withCover),true);assert.equal(sameVideoSettings(withCover,base),true);assert.equal(validateEditor(base,5).background,"midnight");});
