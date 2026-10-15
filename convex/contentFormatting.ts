// Shared by generation and manual edits; visual fit is checked by the renderer.
export function checkSourceWordBudget(parts:string[],format:'carousel'|'static',slide:number){
 const count=parts.join(' ').trim().split(/\s+/).filter(Boolean).length,limit=format==='static'?25:40;
 if(count>limit)throw Error(`Shorten ${format} slide ${slide} to ${limit} visible words without dropping meaning or caveats.`);
}

// Collect every oversized frame before spending the single formatting repair.
// Returning only failing frame numbers keeps valid copy out of the rewrite.
export function oversizedSourceCorrections(draft:{carousel:Array<{label:string;heading:string;body:string;bullets:string[]}>;static:{label:string;heading:string;body:string;bullets:string[]}}){
 const corrections:Array<{slideNumbers:number[];fix:string}>=[];
 for(const [index,frame] of [...draft.carousel,draft.static].entries()){
  const isStatic=index===draft.carousel.length;
  try{checkSourceWordBudget([frame.label,frame.heading,frame.body,...frame.bullets],isStatic?'static':'carousel',index+1);}catch{
   corrections.push({slideNumbers:[isStatic?0:index+1],fix:`Rewrite this as a shorter complete thought, targeting ${isStatic?15:25} words TOTAL across heading, body, label and bullets. Preserve its qualifications; remove redundant heading text. Do not join words or cut a sentence off.`});
  }
 }
 return corrections;
}

// Generation budgets per outline role. Stricter than the manual-edit ceilings above:
// one idea per slide, few words, and lists where the source has a sequence or example.
export type SlideRole='cover'|'point'|'steps'|'example'|'takeaway';
type Shape={heading:number;body:number;bullets:[number,number];bulletWords:number};
export const roleShapes:Record<SlideRole|'static',Shape>={
 cover:{heading:10,body:14,bullets:[0,0],bulletWords:0},
 point:{heading:8,body:20,bullets:[0,3],bulletWords:10},
 steps:{heading:8,body:8,bullets:[2,4],bulletWords:9},
 example:{heading:8,body:14,bullets:[2,4],bulletWords:10},
 takeaway:{heading:10,body:16,bullets:[0,0],bulletWords:0},
 static:{heading:10,body:14,bullets:[0,0],bulletWords:0},
};
export const generatedWordLimit={carousel:32,static:20};
const words=(text:string)=>text.trim().split(/\s+/).filter(Boolean).length;
type ShapedFrame={label:string;heading:string;body:string;bullets:string[]};
export function shapeProblems(frame:ShapedFrame,role:SlideRole|'static'):string[]{
 const shape=roleShapes[role],problems:string[]=[],bullets=frame.bullets.filter(b=>b.trim());
 if(words(frame.heading)>shape.heading)problems.push(`heading has ${words(frame.heading)} words; use at most ${shape.heading}`);
 if(words(frame.body)>shape.body)problems.push(`body has ${words(frame.body)} words; use at most ${shape.body}`);
 if(bullets.length<shape.bullets[0])problems.push(`a ${role} slide needs ${shape.bullets[0]}–${shape.bullets[1]} short bullets`);
 if(bullets.length>shape.bullets[1])problems.push(shape.bullets[1]?`use at most ${shape.bullets[1]} bullets`:`a ${role} slide has no bullets; use heading and body`);
 for(const [i,b] of bullets.entries())if(words(b)>shape.bulletWords&&shape.bulletWords)problems.push(`bullet ${i+1} has ${words(b)} words; use at most ${shape.bulletWords}`);
 if(role==='point'&&bullets.length&&frame.body.trim())problems.push('use either one body sentence or bullets, not both');
 if(role==='example'&&bullets.some(b=>!/^[^:]{1,40}:\s*\S/.test(b)))problems.push('write each example bullet as "Label: value"');
 const total=words([frame.label,frame.heading,frame.body,...bullets].join(' ')),limit=role==='static'?generatedWordLimit.static:generatedWordLimit.carousel;
 if(total>limit)problems.push(`${total} visible words in total; use at most ${limit}`);
 return problems;
}
// Example rows are independent, so an over-long example keeps its first rows (at least two) instead of failing.
// Steps are never trimmed: dropping one would change the sequence.
export function trimExampleRows<T extends {carousel:ShapedFrame[]}>(draft:T,roles:SlideRole[]):T{
 return {...draft,carousel:draft.carousel.map((frame,i)=>{
  if(roles[i]!=='example')return frame;
  // Trim only past the hard 40-word ceiling (the density budget gets its own repair), and drop the
  // optional lesson line before any row, so a table stays whole and the body never cites a cut row.
  const bullets=frame.bullets.filter(b=>b.trim()),over=(body:string)=>words([frame.label,frame.heading,body,...bullets].join(' '))>40;
  const body=over(frame.body)?'':frame.body;
  while(bullets.length>2&&over(body))bullets.pop();
  return bullets.length===frame.bullets.length&&body===frame.body?frame:{...frame,body,bullets};
 })};
}
// One correction per failing frame, naming only what to change, so valid slides are kept.
export function shapeCorrections(draft:{carousel:ShapedFrame[];static:ShapedFrame},roles:SlideRole[]){
 const corrections:Array<{slideNumbers:number[];fix:string}>=[];
 for(const [index,frame] of [...draft.carousel,draft.static].entries()){
  const isStatic=index===draft.carousel.length,role=isStatic?'static':roles[index]??'point';
  const problems=shapeProblems(frame,role);
  if(problems.length)corrections.push({slideNumbers:[isStatic?0:index+1],fix:`This ${role} slide is too dense: ${problems.join('; ')}. Keep the single key idea and its essential qualification; cut everything else. Do not join words or cut a sentence off.`});
 }
 return corrections;
}
