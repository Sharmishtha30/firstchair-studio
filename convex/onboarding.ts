// Shared by the form, persistence gate, writer and reviewer.
export const onboardingCategories=['D2C brand','Education','Health and wellness','SaaS','Consumer tech and wearables','Services or agency','Food and beverage','Fashion and beauty','Finance','Other'] as const;
export type OnboardingCategory=typeof onboardingCategories[number];
export const directionKeys=['goal','focus','category','topic','tone'] as const;
export type DirectionKey=typeof directionKeys[number];
export type DirectionAnswers=Partial<Record<DirectionKey,string>>;
export const onboardingAverageMs=427148; // 4 completed current-onboarding runs, measured 7 Oct 2026; includes retries.
export const onboardingEstimateMinutes=5; // Product estimate requested by the owner; measured baseline above is retained.
export function validDirectionAnswer(key:DirectionKey|'promotion',value:string){
 if(!value.trim()||value.length>600)return false;
 if(key==='goal')return ['understand','enquire','buy'].includes(value);
 if(key==='category')return onboardingCategories.includes(value as OnboardingCategory);
 if(key==='promotion')return ['advice','balanced','offer'].includes(value);
 return true;
}
export function completeDirection(answers?:DirectionAnswers){return !!answers&&directionKeys.every(key=>validDirectionAnswer(key,answers[key]??''));}
export function needsDirection(pack:{onboardingRequested?:boolean;onboardingVersion?:number;onboarding?:unknown;directionAnswers?:DirectionAnswers}){
 return !!pack.onboardingRequested&&(pack.onboardingVersion===2?!pack.onboarding||!completeDirection(pack.directionAnswers):!pack.onboarding);
}
export function nextDirectionStep(answers?:DirectionAnswers){const i=directionKeys.findIndex(k=>!validDirectionAnswer(k,answers?.[k]??''));return i<0?directionKeys.length-1:i;}
export function categoryProfile(category?:string){return ({'D2C brand':'consumer-products','Education':'education-career','Health and wellness':'fitness-program','SaaS':'software','Consumer tech and wearables':'consumer-products','Services or agency':'professional-services','Food and beverage':'food','Fashion and beauty':'fashion','Finance':'professional-services','Other':'other'} as Record<string,string>)[category??''];}
export function detectCategory(text:string):OnboardingCategory{
 const rules:Array<[OnboardingCategory,RegExp]>=[
 ['Food and beverage',/\b(coffee|chocolate|snacks?|beverages?|restaurant|bakery|ingredients|food)\b/gi],
 ['Fashion and beauty',/\b(skincare|cosmetics?|makeup|clothing|fashion|apparel|shoes?|serum|garments?)\b/gi],
 ['Education',/\b(learning|courses?|students?|education|interviews?|career|upskilling|training|school)\b/gi],
 ['Health and wellness',/\b(wellness|health|fitness|therapy|mental health|nutrition|yoga|healthcare)\b/gi],
 ['SaaS',/\b(software|saas|api|dashboard|integrations?|automate|automation)\b/gi],
 ['Consumer tech and wearables',/\b(smartphones?|laptops?|headphones?|wearables?|smartwatch|iphone|macbook|mac mini|airpods|electronics)\b/gi],
 ['Finance',/\b(banking|finance|financial|insurance|investing|loans?|payments?|accounting)\b/gi],
 ['Services or agency',/\b(agency|consulting|consultancy|services|clients|advisory)\b/gi],
 ['D2C brand',/\b(shop|cart|shipping|buy|products?|store)\b/gi]];
 const ranked=rules.map(([category,re])=>({category,score:(text.match(re)??[]).length})).sort((a,b)=>b.score-a.score);
 return ranked[0].score?ranked[0].category:'Other';
}
export function directionGuidance(direction?:{goal:string;focus:string;category?:string;topic?:string;tone:string;promotion?:string}){
 if(!direction)return undefined;
 return {
  goal:{answer:direction.goal,use:direction.goal==='buy'?'Lead towards the supported purchase destination.':direction.goal==='enquire'?'Help the buyer evaluate fit and use a verified enquiry next action.':'Explain a useful distinction; use a gentle discovery next action.'},
  focus:{answer:direction.focus,use:'Keep the selected product, programme or service central in both posts and choose images of that actual offer. Choose for me means select from the inspected website.'},
  category:{answer:direction.category??'Infer from website',use:'Use this confirmed business category to select the buyer context, content pattern and imagery. Health/finance claims require source evidence; never assume a health programme is a physical product. Fashion and beauty may use garment or skincare imagery as appropriate to the actual offer.'},
  topic:{answer:direction.topic??'Choose for me',use:'Build two complementary ideas within this topic, not an unrelated homepage summary. Choose for me means use the strongest supported topic for the selected focus and goal.'},
  tone:{answer:direction.tone||'Match the website',use:'Apply this tone to headings, supporting copy, captions and closing lines. Match the website means follow the observed brand voice.'},
  ...(direction.promotion?{promotion:{answer:direction.promotion,use:direction.promotion==='advice'?'Lead with useful source-backed advice; show the actual offer where it explains the point and use a gentle relevant closing action.':direction.promotion==='offer'?'Lead with the actual offer, real product or service imagery, a supported buying reason and a direct goal-aligned action.':'Balance a useful insight with the actual offer; connect source-backed value to a goal-aligned next action.'}}:{}),
  rule:'Apply ALL supplied decisions in planning, copy and applicable image/layout choices. These are creative instructions, not proof of claims. Do not change brand colours or typography based on tone. Review every decision before approval.'
 };
}
export function progressMessage(stage:string){
 const messages:Record<string,string>={
 'Reading the website':'Reading your website','Reading website':'Reading your website','Reading related pages':'Reading your website pages',
 'Picking brand colours':'Picking your brand colours','Loading website fonts':'Loading your website fonts','Collecting brand imagery':'Collecting your website images',
 'Website reading complete':'Website reading complete','Confirm your direction':'Website ready — finish your answers','Preparing writer':'Preparing to write your posts',
 'Inspecting website imagery and choosing useful angles':'Choosing your story and images','Writing posts':'Preparing to write your posts','Writing platform drafts':'Writing your slides and static posts',
 'Checking draft structure':'Checking the post structure','Refining the creative':'Refining your posts','Checking content and design structure':'Checking claims against your site',
 'Improving the idea and its payoff':'Improving your posts from the review','Checking improved drafts':'Checking the revised post structure',
 'Loading saved sample':'Loading the saved sample','Reading your customer call':'Pulling quotes from your customer call','Reading your whole call':'Reading your whole customer call','Choose your story':'Pick the stories to write','Ready':'Your posts are ready'
 };
 return messages[stage]??stage;
}
export function appendStage(history:{stage:string;startedAt:number}[]|undefined,stage:string,now:number){const previous=history??[];return previous.at(-1)?.stage===stage?previous:[...previous,{stage,startedAt:now}].slice(-100);}

// Only explicit successful completion events count. No clock or stage-start inference.
export const generationSteps=['website','colours','assets','plan','drafts','review'] as const;
// Packs with a customer call add one step; website-only packs keep the six above.
export const callGenerationSteps=['website','colours','assets','call','plan','drafts','review'] as const;
export type GenerationStep=typeof callGenerationSteps[number];
export function completedProgress(completed?:string[],steps:readonly GenerationStep[]=generationSteps){return Math.round(steps.filter(step=>completed?.includes(step)).length/steps.length*100);}
export function recordCompletion(completed:string[]|undefined,step?:string){return step?[...new Set([...(completed??[]),step])]:completed;}

export const generationStepLabels:Record<GenerationStep,string>={website:'Website read',colours:'Colours picked',assets:'Fonts collected',call:'Whole call read',plan:'Source story written',drafts:'Slides and statics written',review:'Claims and direction checked'};
