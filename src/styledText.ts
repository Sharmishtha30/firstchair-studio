export type StyledRun={text:string;emphasised:boolean;x:number};
export type StyledRow={runs:StyledRun[];width:number};
export type RunMetric={width:number;right?:number};
// Spaces are their own runs. Italic ink can overhang its advance width;
// reserve that ink before the following space so adjacent words cannot collide.
export function styledRows(value:string,emphasis:string,width:number,measure:(text:string,emphasised:boolean)=>RunMetric):StyledRow[]{
 const normal=value.replace(/[^\S\n]+/g,' ').trim(),phrase=emphasis.replace(/\s+/g,' ').trim();
 const start=phrase?normal.indexOf(phrase):-1,end=start+phrase.length;
 const rows:StyledRow[]=[];let row:StyledRow={runs:[],width:0},offset=0,pendingSpace=false;
 const push=()=>{if(row.runs.length)rows.push(row);row={runs:[],width:0};pendingSpace=false;};
 for(const token of normal.matchAll(/\n| +|[^\s]+/g)){
  const word=token[0];offset=token.index;
  if(word==='\n'){push();continue;}if(/^ +$/.test(word)){pendingSpace=true;continue;}
  const cuts=[0,word.length,...[start-offset,end-offset].filter(n=>n>0&&n<word.length)].sort((a,b)=>a-b);
  const parts=cuts.slice(0,-1).map((n,i)=>{const text=word.slice(n,cuts[i+1]),emphasised=start>=0&&offset+n>=start&&offset+n<end,m=measure(text,emphasised);return {text,emphasised,advance:Math.max(m.width,m.right??m.width)};});
  const wordWidth=parts.reduce((sum,p)=>sum+p.advance,0),space=pendingSpace&&row.runs.length?measure(' ',false).width:0;
  if(row.runs.length&&row.width+space+wordWidth>width)push();
  else if(space){row.runs.push({text:' ',emphasised:false,x:row.width});row.width+=space;}
  for(const p of parts){row.runs.push({text:p.text,emphasised:p.emphasised,x:row.width});row.width+=p.advance;}
  pendingSpace=false;
 }push();return rows;
}
export function paintStyledRows(ctx:CanvasRenderingContext2D,rows:StyledRow[],x:number,y:number,width:number,lineHeight:number,normalFont:string,emphasisFont:string,colour:string,accent:string,center=false){
 ctx.textBaseline='top';for(const row of rows){const left=center?x+(width-row.width)/2:x;if(row.runs.every(r=>!r.emphasised)){ctx.font=normalFont;ctx.fillStyle=colour;ctx.fillText(row.runs.map(r=>r.text).join(''),left,y);y+=lineHeight;continue;}for(const run of row.runs){ctx.font=run.emphasised?emphasisFont:normalFont;ctx.fillStyle=run.emphasised?accent:colour;ctx.fillText(run.text,left+run.x,y);}y+=lineHeight;}return y;
}
