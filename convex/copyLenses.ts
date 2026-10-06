import {v} from 'convex/values';
export const copyLensV=v.union(v.literal('auto'),v.literal('product'),v.literal('customer'),v.literal('market'),v.literal('guide'),v.literal('belief'));
export type CopyLens='auto'|'product'|'customer'|'market'|'guide'|'belief';
export const copyLenses:Array<{id:Exclude<CopyLens,'auto'>;label:string;description:string}>=[
 {id:'product',label:'Product voice',description:'What makes your offer different, and why it matters.'},
 {id:'customer',label:'Customer perspective',description:'Speak to your buyer’s situation, desire or hesitation.'},
 {id:'market',label:'Market perspective',description:'A shared category situation, grounded in your website.'},
 {id:'guide',label:'Helpful guide',description:'Explain a useful choice with concrete evidence.'},
 {id:'belief',label:'Brand belief',description:'A point of view backed by how your product is made.'},
];
export function copyLensGuidance(lens:CopyLens='auto'):string{
 const shared='Keep the same source brand voice, facts, visual identity and actual buyer. A perspective changes the argument, not the truth. Record speaker, addressee, reader situation, awareness hypothesis, desired reader response, proof and payoff in usefulInsight. Never invent first-person customer experience, attributed quotes, chat screenshots, market statistics or social consensus.';
 const rules:Record<CopyLens,string>={
 auto:'Choose the strongest perspective automatically for each complementary idea. Compare product desire/difference, customer recognition and a supported brand belief. Do not default every brand to educational checklists or FAQ retellings.',
 product:'The brand speaks about one product mechanism or deliberate choice and its practical or sensory significance. Translate features into a concrete buying reason. Demonstrate rather than list features.',
 customer:'Begin with the actual buyer’s recognizable situation, wish or objection, speaking directly to that buyer. Use source customer language if available. Customer perspective does not mean an invented customer is speaking: use second person or brand narration unless an exact, attributed source quote exists.',
 market:'Open with a recognizable category tension or shared occasion documented in the supplied website. Speak to a relevant group without claiming everyone behaves that way. Website-only evidence is not market research. No unsupported trends, consensus, competitor deficiencies or invented statistics. If broad evidence is absent, narrow to a supported conditional occasion and say so in planning notes.',
 guide:'The brand acts as a helpful guide. Give one useful distinction or decision rule from a demonstrated mechanism; explain why it matters to this buyer. Avoid generic advice and inflated expert credentials.',
 belief:'The brand states a distinctive belief or deliberate tradeoff documented by the source, then shows the product decision that proves it. No fabricated founder origin stories or imposed values. If no stated belief exists, use a documented product choice rather than inventing a manifesto.',
 };
 return 'COPY PERSPECTIVE: '+lens+'. '+rules[lens]+' '+shared;
}
