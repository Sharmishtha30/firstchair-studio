import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {brandContext} from '../convex/brandContext';
import {inlineIllustrations} from '../convex/websiteDiagrams';

test('brand context separates entry-page identity from detailed product evidence without a domain special case',()=>{
 const pages=[{url:'https://example.org/',title:'Career platform',blocks:[{kind:'h1',text:'A career platform'},{kind:'h3',text:'Job Board'},{kind:'h3',text:'Practice'},{kind:'h3',text:'Membership'}]},{url:'https://example.org/practice',title:'Practice',blocks:Array.from({length:40},()=>({kind:'p',text:'A detailed simulation'}))}];
 const c=brandContext(pages,'https://example.org/');
 assert.equal(c.entryPage?.url,pages[0].url);assert.deepEqual(c.entryPage?.headings.map(h=>h.text),['A career platform','Job Board','Practice','Membership']);assert.equal(c.supportingPages.length,1);
 assert.match(c.rules.join(' '),/brand.offer/);assert.equal(brandContext([],pages[0].url).entryPage,null);
});
test('collects meaningful inline diagrams and icons but excludes hidden artwork and executable or external SVG resources',()=>{
 const $=load(`<main><section><h1>A connected system</h1><svg aria-hidden="true" viewBox="0 0 600 400"><title>Five parts</title><script>bad()</script><foreignObject>bad</foreignObject><image href="https://x.test/a"/><use href="https://x.test/b"/><path onclick="bad()" fill="url(https://x.test/c)" d="M0 0L10 10"/><text x="20" y="20">Opportunity</text></svg><svg width="24" height="24"><path/></svg><div hidden><svg viewBox="0 0 600 400"><path/></svg></div></section></main>`);
 const assets=inlineIllustrations($,'https://example.org/');assert.equal(assets.length,2);assert.match(assets[1].role,/brand icon/);assert.equal(assets[0].width,600);assert.match(assets[0].alt,/Five parts/);assert.match(assets[0].svg,/Opportunity/);assert.doesNotMatch(assets[0].svg,/script|foreignObject|<image|onclick|https:\/\/x/);
});

import {presentBrand} from '../convex/brandPresentation';
import {foundersBrand} from '../convex/foundersPack';
test('an unfinished draft retains observed website colours and typography without changing its copy',()=>{
 const draft={...foundersBrand,palette:undefined,style:undefined};
 const palette={paper:'#ffffff',ink:'#101010',primary:'#ff307e',accent:'#f5c518',note:'Observed CSS'};
 const shown=presentBrand(draft,{sitePalette:palette});
 assert.deepEqual(shown.palette,palette);assert.equal(shown.name,draft.name);assert.equal(draft.palette,undefined);
 assert.deepEqual(presentBrand(shown,{}).palette,palette);
});
