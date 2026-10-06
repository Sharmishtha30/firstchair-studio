import type {SourcePage} from './creativeTypes';
export function brandContext(pages:Pick<SourcePage,'url'|'title'|'blocks'>[],sourceUrl:string){
 const entry=pages.find(p=>p.url===sourceUrl)??pages[0];
 return {entryPage:entry?{url:entry.url,title:entry.title,headings:entry.blocks.filter(b=>/^h[123]$/.test(b.kind)).slice(0,24),opening:entry.blocks.slice(0,12)}:null,
 supportingPages:pages.filter(p=>p!==entry).map(p=>({url:p.url,title:p.title,headings:p.blocks.filter(b=>/^h[123]$/.test(b.kind)).slice(0,12)})),
 rules:['Establish the brand identity and offering range from the entry page before choosing a campaign angle. Supporting-page length is not evidence of business priority.',
 'brand.offer and brand.audience describe the overall business at the submitted URL. The strategy mechanism, post audience and destination may focus on one relevant product without redefining the whole brand.',
 'Identify distinct offers and audience needs in the private strategy note, with their source pages. If the submitted URL itself is a product page, respect that narrower scope.',
 'Illustrative scenarios, sample applications and demo participants are not customer proof or the brand identity. Mark inferred audience motivations as hypotheses.']};
}
