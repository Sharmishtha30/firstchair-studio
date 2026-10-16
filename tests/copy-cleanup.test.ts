import test from 'node:test';
import assert from 'node:assert/strict';
import {stripEvidenceRefs,attributeDanglingQuotes,staticQuoteIssue,type ContentDraft} from '../convex/contentPolicy';

const f=(heading:string,body='',bullets:string[]=[])=>({heading,body,label:'',bullets,emphasis:'',evidenceIds:[0]});
const pack=(carousel:ReturnType<typeof f>[],stat:ReturnType<typeof f>):ContentDraft=>({carousel,static:stat,caption:'',staticCaption:'',altText:'',staticAltText:''});

// Shapes from the 16 October farmley.com run.
test('evidence references never reach visible slide text',()=>{
 const {draft,removed}=stripEvidenceRefs(pack([
  f('Snacks made from real nuts','150+ products, zero adulteration. (evidence: 3)'),
  f('Quality checks','',['1. Ensure: adulteration free product','2. Source: Roasted Almond product page (evidence 161)','3. Roast: in small batches [evidence 12, 14]']),
  f('Range','Mixes and dates. Sources: product pages.'),
 ],f('Roasted, not fried (Evidence ID 4)')));
 assert.equal(draft.carousel[0].body,'150+ products, zero adulteration.');
 assert.deepEqual(draft.carousel[1].bullets,['1. Ensure: adulteration free product','2. Roast: in small batches']);
 assert.equal(draft.carousel[2].body,'Mixes and dates.');
 assert.equal(draft.static.heading,'Roasted, not fried');
 assert.equal(removed,5);
 assert.doesNotMatch([...draft.carousel,draft.static].flatMap(s=>[s.heading,s.body,...s.bullets]).join(" "),/evidence/i);
 // Ordinary words are left alone.
 assert.equal(stripEvidenceRefs(pack([f('The evidence is clear','Source of protein: 12 g per pack.')],f('A'))).draft.carousel[0].body,'Source of protein: 12 g per pack.');
});

// Shapes from the 16 October website + call run.
test('a dangling "— a customer" becomes a quote that says who said it',()=>{
 const out=attributeDanglingQuotes(pack([f('Meetings ended before I found numbers','By the time I found the right numbers, the meeting was already over — a customer'),f('Why it mattered','It saved hours, a customer.')],f('Back','Done.')));
 assert.equal(out.carousel[0].body,'“By the time I found the right numbers, the meeting was already over,” a customer said.');
 assert.equal(out.carousel[1].body,'“It saved hours,” a customer said.');
 for(const body of ['“I wish we had made the switch sooner,” a customer said.','We built this for the customer.','Done.'])
  assert.equal(attributeDanglingQuotes(pack([f('H',body)],f('S'))).carousel[0].body,body);
});

test('the call static has its own line, not a quote the carousel already uses',()=>{
 const carousel=[f('“I used to spend every Friday chasing updates”'),f('I got my Friday afternoons back','One page replaced five spreadsheets.'),f('They wished they had switched sooner','“I wish we had made the switch sooner,” a customer said.')];
 assert.match(staticQuoteIssue(pack(carousel,f('“I got my Friday afternoons back,” a customer said')))!.message,/slide 2/);
 assert.match(staticQuoteIssue(pack(carousel,f('“I wish we had made the switch sooner,” a customer said')))!.message,/slide 3/);
 assert.match(staticQuoteIssue(pack(carousel,f('“One page shows what needs attention,” a customer said')))!.message,/only a quote/);
 assert.equal(staticQuoteIssue(pack(carousel,f('Five spreadsheets became one page','“Now I open one page and know what needs my attention,” a customer said.'))),undefined);
});

// Shape from the second 16 October website + call run: an unquoted, attributed static repeating slide 3.
test('an attributed quote without quotation marks still counts',()=>{
 const carousel=[f('One page shows what needs attention'),f('Got my Friday afternoons back','A customer said: “I got my Friday afternoons back.”')];
 assert.match(staticQuoteIssue(pack(carousel,f('I got my Friday afternoons back — a customer said')))!.message,/slide 2/);
 assert.match(staticQuoteIssue(pack(carousel,f('A customer said: reporting takes minutes now')))!.message,/only a quote/);
 assert.equal(staticQuoteIssue(pack(carousel,f('Five spreadsheets became one page: “reporting takes minutes now,” a customer said'))),undefined);
 // From the third run: a body that is only the attribution.
 assert.equal(attributeDanglingQuotes(pack([f('“I used to spend every Friday chasing updates…”','— a customer')],f('S'))).carousel[0].body,'— a customer said.');
 assert.equal(staticQuoteIssue(pack(carousel,f('Five spreadsheets became one page','Reporting now takes minutes, a customer said.'))),undefined);
});
