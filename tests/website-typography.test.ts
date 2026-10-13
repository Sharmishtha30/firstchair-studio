import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {websiteTypography} from '../convex/websiteTypography';
test('preserves a real text wordmark and heading italic treatment',()=>{
 const html='<header><a href="/">Example <span class="accent">Studio</span></a></header><h1>Make <span class="accent">your mark</span></h1>';
 assert.deepEqual(websiteTypography(load(html),'.accent{font-style:italic;color:#ff307e}'),{wordmarkText:'Example Studio',wordmarkAccent:'Studio',headingEmphasis:true});
});
test('does not invent emphasis from unused CSS or a different link',()=>{
 assert.deepEqual(websiteTypography(load('<header><a href="/">Example</a></header><h1>Plain heading</h1><a href="/other"><em>Other</em></a>'),'.unused{font-style:italic}'),{});
});
