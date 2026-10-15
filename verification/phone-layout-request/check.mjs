import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import {ConvexHttpClient} from 'convex/browser';
import {readFileSync} from 'node:fs';
const url=process.env.CHECK_CONVEX_URL??readFileSync('.env.local','utf8').match(/^VITE_CONVEX_URL=(.+)$/m)[1].trim().replace(/^"|"$/g,'');
const origin=process.env.CHECK_ORIGIN??'http://localhost:5173';
const {tokens}=await new ConvexHttpClient(url).action('auth:signIn',{provider:'anonymous'});
const browser = await chromium.launch({headless:true});
try {
 for (const width of [390,1440]) {
  const page = await browser.newPage({viewport:{width,height:900}});
  await page.addInitScript(({tokens,url})=>{const ns=url.replace(/[^a-zA-Z0-9]/g,'');localStorage.setItem('__convexAuthJWT_'+ns,tokens.token);localStorage.setItem('__convexAuthRefreshToken_'+ns,tokens.refreshToken);},{tokens,url});
  await page.goto(origin);
  await page.getByText('Private browser session',{exact:true}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const metrics = await page.evaluate(()=>{
   const input=document.querySelector('#website'), style=getComputedStyle(input);
   const c=document.createElement('canvas').getContext('2d');c.font=style.font;
   const r=input.getBoundingClientRect(), button=document.querySelector('.url-row button').getBoundingClientRect();
   const label=document.querySelector('.visitor-session').getBoundingClientRect();
   const link=document.querySelector('.landing-examples');
   return {placeholder:input.placeholder,needed:c.measureText(input.placeholder).width,available:input.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),input:{x:r.x,y:r.y,width:r.width,bottom:r.bottom},button:{x:button.x,y:button.y,width:button.width},label:{left:label.left,right:label.right},scroll:document.documentElement.scrollWidth,viewport:innerWidth,tap:link.getBoundingClientRect().height,font:getComputedStyle(link).fontSize};
  });
  assert.ok(metrics.available>=metrics.needed);
  console.log(`PASS ${width}px: full "${metrics.placeholder}" placeholder visible; text ${metrics.needed.toFixed(2)}px, available ${metrics.available}px.`);
  assert.ok(metrics.label.left>=0 && metrics.label.right<=width);
  console.log(`PASS ${width}px: Private browser session label is inside header viewport; left ${metrics.label.left.toFixed(2)}px, right ${metrics.label.right.toFixed(2)}px.`);
  assert.equal(metrics.scroll,width);
  console.log(`PASS ${width}px: no horizontal scroll; document ${metrics.scroll}px, viewport ${width}px.`);
  if(width===390){assert.ok(metrics.button.y>=metrics.input.bottom);console.log(`PASS 390px: input row and button are stacked; button width ${metrics.button.width}px.`);assert.ok(metrics.tap>=44);}
  console.log(`PASS ${width}px: See examples tap area ${metrics.tap}px high; text size ${metrics.font}.`);
  await page.screenshot({path:`verification/phone-layout-request/${width}.png`,fullPage:true});
  if(width===1440){
   const desktop=await page.locator('.landing-group').boundingBox();
   await page.evaluate(()=>{for(const sheet of document.styleSheets){for(let i=sheet.cssRules.length-1;i>=0;i--){const rule=sheet.cssRules[i];if(rule.conditionText==='(max-width: 600px)'&&rule.cssText.includes('grid-template-columns: 44px'))sheet.deleteRule(i);}}});
   assert.deepEqual(await page.locator('.landing-group').boundingBox(),desktop);
   console.log('PASS 1440px: landing group position and size unchanged with phone-fix rules removed.');
  }
  const input=page.getByPlaceholder('Add your website here');
  await input.click();await input.fill('https://example.com/phone-layout-check');
  assert.equal(await input.inputValue(),'https://example.com/phone-layout-check');
  assert.ok(await input.evaluate(e=>document.activeElement===e));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  console.log(`PASS ${width}px: focused input accepts and retains typed URL; no horizontal scroll while focused.`);
  await page.screenshot({path:`verification/phone-layout-request/${width}-focused.png`,fullPage:true});
  await page.getByRole('link',{name:'See examples',exact:true}).click();
  await page.locator('.sample-page').waitFor();
  await page.locator('.sample-pair img').first().waitFor();
  assert.ok(await page.locator('.sample-pair img').count()>0);
  console.log(`PASS ${width}px: See examples opens the examples gallery with sample images.`);
  await page.close();
 }
} finally {await browser.close();}
