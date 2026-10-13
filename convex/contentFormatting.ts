// Shared by generation and manual edits; visual fit is checked by the renderer.
export function checkSourceWordBudget(parts:string[],format:'carousel'|'static',slide:number){
 const count=parts.join(' ').trim().split(/\s+/).filter(Boolean).length,limit=format==='static'?25:40;
 if(count>limit)throw Error(`Shorten ${format} slide ${slide} to ${limit} visible words without dropping meaning or caveats.`);
}
