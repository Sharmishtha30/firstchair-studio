import {isFillerRow,type ContentDraft} from './contentPolicy';
type RowRepair={row:string;evidenceIds:number[]};
type RowRequest={slideNumber:number;rowIndex:number;row:string;frame:ContentDraft['static']};
// Rows get their own four attempts. Never rewrite a heading, quote, other row or other slide.
export async function repairFillerRows(draft:ContentDraft,rewrite:(request:RowRequest)=>Promise<RowRepair>):Promise<ContentDraft>{
 const result={...draft,carousel:[...draft.carousel]};
 for(const [index,frame] of [...draft.carousel,draft.static].entries()){
  if(!frame.bullets.some(isFillerRow))continue;
  const slideNumber=index===draft.carousel.length?0:index+1,bullets:string[]=[],evidenceIds=new Set(frame.evidenceIds);
  for(const [rowIndex,original] of frame.bullets.entries()){
   if(!isFillerRow(original)){bullets.push(original);continue;}
   const quotes=Array.from(original.matchAll(/“[^”]+”|"[^"\n]+"|‘.*?’(?!\w)|(?<!\w)'.*?'(?!\w)/g),match=>match[0]);
   let row=original,repaired=false;
   for(let attempt=0;attempt<4;attempt++){
    const candidate=await rewrite({slideNumber,rowIndex,row,frame});
    if(!quotes.every(quote=>candidate.row.includes(quote)))continue;
    row=candidate.row.trim();
    if(isFillerRow(row))continue;
    if(row){bullets.push(row);candidate.evidenceIds.forEach(id=>evidenceIds.add(id));}
    repaired=true;break;
   }
   if(!repaired&&quotes.length){
    // A real quote needs no invented detail. Remove only its placeholder label.
    const quotedRow=original.slice(original.indexOf(':')+1).trim();
    bullets.push(quotes.every(quote=>quotedRow.includes(quote))?quotedRow:original);
   }
   // A non-quoted row still carrying filler after four attempts is omitted.
  }
  const repairedFrame={...frame,bullets,evidenceIds:[...evidenceIds]};
  if(slideNumber===0)result.static=repairedFrame;else result.carousel[index]=repairedFrame;
 }
 return result;
}
