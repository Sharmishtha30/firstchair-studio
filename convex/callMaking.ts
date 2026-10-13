import {anonymizePosts} from './callPrivacy';
import type {CallQuote} from './customerCall';
import {v} from 'convex/values';
import {z} from 'zod';
import type {Infer} from 'convex/values';
const insightV=v.object({text:v.string(),lineIds:v.array(v.string())});
const choiceV=v.object({options:v.array(v.string()),pick:v.number(),reason:v.string()});
const outlineV=v.object({admission:v.string(),situation:v.string(),middleTurn:v.string(),unmetNeed:v.string(),answer:v.string()});
export const callMakingV=v.object({
 version:v.literal(1),
 insights:v.optional(v.object({audience:v.string(),options:v.array(insightV),pick:v.number(),reason:v.string()})),
 concept:v.optional(choiceV),hooks:v.optional(choiceV),story:v.optional(outlineV),
 slides:v.optional(v.array(v.object({platform:v.string(),frames:v.array(v.object({heading:v.string(),body:v.string()}))}))),
 carousel:v.optional(v.array(v.object({platform:v.string(),layouts:v.array(v.string())}))),
});
export type CallMaking=Infer<typeof callMakingV>;
const reason=z.string().min(1).max(400).describe('One short sentence explaining why this option is strongest for the ideal customer.');
export function insightSchema(ids:string[]){return z.object({audience:z.string().min(1).describe('The brand ideal customer inferred from the website, not the interviewer.'),options:z.array(z.object({text:z.string().min(1).max(600),lineIds:z.array(z.enum(ids as [string,...string[]])).min(2).max(40)})).length(5),pick:z.number().int().min(1).max(5),reason});}
export const conceptSchema=z.object({options:z.array(z.string().min(1).max(400)).length(3),pick:z.number().int().min(1).max(3),reason});
export const hookSchema=z.object({options:z.array(z.string().min(1).max(120)).length(5),pick:z.number().int().min(1).max(5),reason});
export const callArcSchema=z.object({admission:z.string().describe('Surprising first-person admission that opens a question, without summarising the whole story.'),situation:z.string().describe('Concrete situation and actions that let the reader understand what happened. Name supporting customer line IDs.'),middleTurn:z.string().describe('A supported contrast or new meaning, with source IDs. If no reversal exists, say so and outline a short observation instead. Never invent a change of mind or outcome; a new job title alone is not a turn.'),unmetNeed:z.string().describe('The specific unresolved problem revealed by the turn, with source IDs. It must land before the brand.'),answer:z.string().describe('The exact website-supported mechanism that answers a customer-evidenced need. If none fits, explicitly say no product pitch and close on the supported observation. Do not invent a need, endorsement or outcome.')});
export function checkChoice(step:{options:unknown[];pick:number;reason:string},count:number){
 if(step.options.length!==count||!Number.isInteger(step.pick)||step.pick<1||step.pick>count||!step.reason.trim()||/[\r\n]/.test(step.reason))throw Error('A writing step needs every option, one valid pick and a one-line reason.');
}
export function checkHooks(step:{options:string[];pick:number;reason:string}){
 checkChoice(step,5);
 if(step.options.some(x=>/\bC\d+\b/.test(x)))throw Error('Hooks must be finished slide text without source sentence IDs. Keep references in the insight evidence only.');
 if(new Set(step.options.map(x=>x.trim().toLowerCase())).size!==5)throw Error('Write five different hooks.');
 if(step.options.some(x=>x.trim().split(/\s+/).length>=12))throw Error('Every hook must be under 12 words.');
}
export function checkChosenHook(posts:{format:string;frames:{heading:string;body:string;eyebrow?:string;items?:unknown[];design?:{takeaway:string}}[]}[],hook:string){
 for(const p of posts.filter(p=>p.format==='carousel')){const f=p.frames[0];if(!f||f.heading!==hook||f.body.trim()||f.eyebrow?.trim()||f.items?.length||f.design?.takeaway.trim())throw Error('Slide 1 must contain exactly the chosen hook, with no added body or labels.');}
}

// Keep the working object stable while an awaited model request saves progress.
// Replace only its sanitized fields; never swap out a pending assignment's target.
export function redactMakingInPlace(making:CallMaking,quotes:CallQuote[]){
 const {frames,...clean}=anonymizePosts([{...making,frames:[]}],quotes)[0];
 Object.assign(making,clean);
 return making;
}
