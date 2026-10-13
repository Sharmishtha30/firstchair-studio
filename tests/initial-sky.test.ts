import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('first sky is available in the initial HTML without an image or app request',()=>{
 const html=readFileSync('index.html','utf8');
 const embedded=html.match(/--initial-sky:url\("data:image\/jpeg;base64,([^"\)]+)"\)/);
 assert.ok(embedded);
 assert.deepEqual(Buffer.from(embedded[1],'base64'),readFileSync('public/images/firstchair-sky-1.jpg'));
 assert.ok(html.indexOf('id="initial-sky"')<html.indexOf('<script'));
 assert.match(readFileSync('src/style.css','utf8'),/\.sky-background\{[^}]*var\(--initial-sky\)/);
});
