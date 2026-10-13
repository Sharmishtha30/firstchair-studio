import {extractPalette} from '../convex/brandPalette';
import {matchedWebsiteColours} from '../convex/websiteColours';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {websiteBrandEvidence} from '../convex/websiteBrandEvidence';
import {inlineIllustrations} from '../convex/websiteDiagrams';
test('retains quoted testimonial attribution and distinct heading/body declarations',()=>{
 const $=load('<main><h1 class="hero">A useful product</h1><p style="font-size:18px">For real people.</p><figure><blockquote>Fits into my daily routine.</blockquote><figcaption>Jamie, website customer quote</figcaption></figure></main>');
 const b=websiteBrandEvidence($,'.hero{font-family:Brand Display;font-size:64px;letter-spacing:-2px}p{font-family:Brand Text;line-height:1.5}');
 assert.ok(b.some(x=>x.kind.includes('testimonial')&&x.text.includes('Jamie')));
 assert.ok(b.some(x=>x.text.includes('font-size: 64px')&&x.text.includes('Brand Display')));
 assert.ok(b.some(x=>x.text.includes('Brand Text')&&x.text.includes('font-size: 18px')));
});
test('imports a small brand icon and strips active SVG content',()=>{
 const $=load('<main><svg width="24" height="24"><script>alert(1)</script><path d="M0 0L24 24" onclick="bad()"/></svg></main>');
 const [a]=inlineIllustrations($,'https://example.com/');assert.match(a.role,/brand icon/);assert.ok(!a.svg.includes('script'));assert.ok(!a.svg.includes('onclick'));
});

import {primaryInlineLogo} from '../convex/websiteIdentity';
test('the home-linked inline header wordmark is retained safely, never a partner logo',()=>{
 const $=load('<header><a href="/partners"><svg width="120" height="40"><text>Partner</text></svg></a><a href="/"><svg viewBox="0 0 74 24"><script>alert(1)</script><path d="M0 0 L10 10" fill="#212121" fill-rule="evenodd" onclick="bad()"/></svg></a></header>');
 const logo=primaryInlineLogo($,'https://example.com/');assert.ok(logo?.includes('fill-rule="evenodd"'));assert.ok(logo?.includes('viewBox="0 0 74 24"'));assert.ok(!/script|onclick|Partner/.test(logo!));
 assert.equal(primaryInlineLogo(load('<header><a href="https://partner.example/"><svg width="70" height="24"><text>Partner</text></svg></a></header>'),'https://example.com/'),undefined);
});

test('palette separates matched background and text roles from decorative frequency',async()=>{const {matchedWebsiteColourRoles}=await import('../convex/websiteColours');const $=load('<body><main><h1>Brand</h1><a class="cta">Shop now</a><section class="promo"></section></main></body>');const css='body{background:#fff7ed;color:#174f49}.cta{background:#eaad32;color:#174f49}.promo{background:#aabbff}';const roles=matchedWebsiteColourRoles($,css);const palette=extractPalette(css,[],matchedWebsiteColours($,css),roles)!;assert.equal(palette.paper,'#fff7ed');assert.equal(palette.ink,'#174f49');assert.equal(palette.primary,'#eaad32');});

test('transparent backgrounds cannot become a black brand canvas',async()=>{const {matchedWebsiteColourRoles}=await import('../convex/websiteColours');const roles=matchedWebsiteColourRoles(load('<body><main><h1>Brand</h1></main></body>'),'body{background:rgba(0,0,0,0);color:#000000}');assert.equal(roles.paper,undefined);assert.equal(roles.ink,'#000000');});

test('observed neutral action colours override unrelated vivid CSS colours',async()=>{
 const {matchedWebsiteColourRoles}=await import('../convex/websiteColours');
 for(const button of ['#ffffff','#000000']){
  const $=load('<body><main><h1>Brand</h1><a class="cta">Shop now</a><section class="promo"></section></main></body>');
  const css=`body{background:#ece9e2;color:#000000}.cta{background:${button};color:#000000}.promo{background:#110d4a}`;
  const p=extractPalette(css,[],matchedWebsiteColours($,css),matchedWebsiteColourRoles($,css))!;
  assert.equal(p.primary,button);assert.equal(p.paper,'#ece9e2');assert.equal(p.ink,'#000000');
 }
});

import {requireBrandEvidence,readableBrandInk,contrast} from '../convex/brandAcceptance';
test('matched muted brand colours never fall back to unused vivid rules',()=>{
 const p=extractPalette('.unused{color:#ff307e}.actual{color:#0a192f}',[],['#64748b','#ffffff','#000000','#0a192f'])!;
 assert.equal(p.primary,'#0a192f');requireBrandEvidence(p);
 assert.equal(extractPalette('.unused{color:#ff307e}',[],[]),undefined);
 assert.throws(()=>requireBrandEvidence({...p,primary:'#ff307e'}),/evidence/);
});
test('matched role colours retain evidence and light brand headings stay readable',()=>{
 const p=extractPalette('',[],['#ffffff'],{primary:'#ffdd00',paper:'#ffffff',ink:'#101010'})!;
 requireBrandEvidence(p);assert.ok(p.observed?.includes('#ffdd00'));assert.ok(contrast(readableBrandInk(p),p.paper)>=4.5);
});
