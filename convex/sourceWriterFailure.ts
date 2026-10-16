// Only the source writer's accuracy/privacy rejection uses this prefix.
export function isAccuracyPrivacyFailure(message:string){return message.includes('The source-based story needs attention:');}

// Extract only known safe messages; SDK errors can contain private request bodies.
export function sourceWriterFailure(error:unknown):string {
 let current=error;
 for(let depth=0;depth<8 && current instanceof Error;depth++){
  if(('finishReason' in current && current.finishReason==='length') || /size limit/.test(current.message))return 'The AI reply reached its size limit. Your input is saved; retry the writing step.';
  if(/temporarily busy/.test(current.message))return 'ChatGPT is temporarily busy. Your input is saved; retry the writing step.';
  if(/did not finish|interrupted/.test(current.message))return 'The AI response stopped before it finished. Your input is saved; retry the writing step.';
  current=current.cause;
 }
 return error instanceof Error?error.message:'The writer could not finish. Your input is saved.';
}
