import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completeDirection,needsDirection,directionKeys,validDirectionAnswer,directionGuidance,detectCategory,onboardingCategories,appendStage,onboardingEstimateMinutes} from '../convex/onboarding';
const answers={goal:'buy',focus:'Our course',category:'Education',topic:'Interview preparation',tone:'Warm and friendly',promotion:'balanced'};
test('new onboarding blocks writing until every validated answer is saved and committed',()=>{
 assert.equal(completeDirection(answers),true);
 for(const key of directionKeys){const partial={...answers};delete (partial as Record<string,string>)[key];assert.equal(needsDirection({onboardingRequested:true,onboardingVersion:2,directionAnswers:partial,onboarding:{}}),true,key);}
 assert.equal(needsDirection({onboardingRequested:true,onboardingVersion:2,directionAnswers:answers}),true);
 assert.equal(needsDirection({onboardingRequested:true,onboardingVersion:2,directionAnswers:answers,onboarding:answers}),false);
 assert.equal(needsDirection({onboardingRequested:true,onboarding:{goal:'buy'}}),false,'existing completed packs stay usable');
});
test('fixed categories reject invented categories and every answer feeds generation',()=>{
 assert.equal(onboardingCategories.length,10);assert.equal(validDirectionAnswer('category','Team size'),false);
 assert.equal(validDirectionAnswer('promotion',''),false);assert.equal(validDirectionAnswer('focus',' '.repeat(3)),false);
 const guidance=directionGuidance(answers)!;for(const key of directionKeys){assert.equal(guidance[key].answer,answers[key]);assert.ok(guidance[key].use.length>20);}
 assert.match(directionGuidance({...answers,promotion:'advice'})!.promotion.use,/advice/);
 assert.match(directionGuidance({...answers,promotion:'offer'})!.promotion.use,/Lead with the actual offer/);
});
test('category suggestions use page evidence with Other as the honest fallback',()=>{
 assert.equal(detectCategory('Courses, learning, students and education'),'Education');
 assert.equal(detectCategory('Mac mini, laptops and wearables'),'Consumer tech and wearables');
 assert.equal(detectCategory('unknown'),'Other');
});
test('progress logs record actual stage changes once and estimate uses measured average',()=>{
 const first=appendStage(undefined,'Reading website',100);assert.deepEqual(appendStage(first,'Reading website',200),first);
 assert.deepEqual(appendStage(first,'Writing platform drafts',300),[...first,{stage:'Writing platform drafts',startedAt:300}]);
 assert.equal(onboardingEstimateMinutes,7);
});

import {reviewNeedsRewrite} from '../convex/copyPolicy';
test('review rejects a draft that ignores an approved answer',()=>{assert.equal(reviewNeedsRewrite({supported:true,useful:true,publishable:true,directionFollowed:false}),true);});
