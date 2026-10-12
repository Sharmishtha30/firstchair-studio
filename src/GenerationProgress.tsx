import {completedProgress,generationSteps,callGenerationSteps,generationStepLabels} from '../convex/onboarding';
export function GenerationProgress({completed,withCall=false}:{completed?:string[];withCall?:boolean}){
 const steps=withCall?callGenerationSteps:generationSteps,percent=completedProgress(completed,steps);
 return <div className="generation-progress-details">
  <div className="generation-progress-row">
   <div className="generation-progress generation-progress-segments" role="progressbar" aria-label="Completed generation steps" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent}% — ${steps.filter(s=>completed?.includes(s)).length} of ${steps.length} steps complete`}>
    {steps.map(step=><span key={step} className={completed?.includes(step)?'complete':''} title={generationStepLabels[step]}/>)}
   </div>
   <span className="generation-percentage" aria-hidden="true">{percent}%</span>
  </div>
  <ol className="generation-step-list">{steps.map((step,i)=><li key={step} className={completed?.includes(step)?'complete':''}><span aria-hidden="true">{completed?.includes(step)?'✓':i+1}</span>{generationStepLabels[step]}</li>)}</ol>
 </div>;
}
