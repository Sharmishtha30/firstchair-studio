export type Reel = { title: string; script: string[]; onScreen: string[]; caption: string; sources: string[] };
export const sampleTranscript = `Founder: What was frustrating before you tried us?
Customer: I used to spend every Friday chasing updates across five different spreadsheets.
Customer: By the time I found the right numbers, the meeting was already over.
Founder: What changed?
Customer: Now I open one page and know exactly what needs my attention.
Customer: I got my Friday afternoons back.
Customer: My team spends less time reporting and more time helping customers.
Founder: Anything else?
Customer: I wish we had made the switch sooner.`;
export function customerQuotes(transcript: string): string[] {
  const lines = transcript.trim().split(/\n+/).map(s => s.trim()).filter(Boolean);
  const labelled = lines.some(s => /^[^:]{1,40}:\s/.test(s));
  const quotes = labelled
    ? lines.filter(s => /^(customer|client|buyer|user|participant)\s*:/i.test(s)).map(s => s.replace(/^[^:]+:\s*/, ''))
    : lines.flatMap(s => s.match(/[^.!?]+[.!?]*/g) ?? []).map(s => s.trim());
  if (quotes.length < 3) throw new Error('Add at least three customer statements. For a labelled call, start customer lines with “Customer:”.');
  return quotes;
}
export function validateReels(reels: Reel[], quotes: string[], count = 3): Reel[] {
  if (reels.length !== count) throw new Error('The writer returned the wrong number of scripts. Please try again.');
  for (const r of reels) {
    const text = [...r.script, ...r.onScreen, r.caption, ...r.sources];
    if (!r.script.length || !r.onScreen.length || !r.sources.length || text.some(s => !s.trim() || !quotes.some(q => q.includes(s)))) {
      throw new Error('The writer added words outside the customer’s statements. Nothing was changed; please try again.');
    }
    if ([...r.script, ...r.onScreen, r.caption].some(s => !r.sources.some(q => q.includes(s)))) throw new Error('A script was missing its supporting customer quote. Please try again.');
  }
  return reels;
}
export function sampleReels(quotes: string[]): Reel[] {
  return [0,1,2].map((i) => {
    const selected = [quotes[i], quotes[(i + 3) % quotes.length]];
    return {title:['The everyday friction','The turning point','The customer’s takeaway'][i],script:selected,onScreen:[selected[0]],caption:selected[1],sources:selected};
  });
}
export function sampleRevision(reel: Reel, feedback: string, quotes: string[]): Reel {
  const f = feedback.toLowerCase();
  if (/short|concise|tight/.test(f)) {
    const q = [...reel.sources].sort((a,b)=>a.length-b.length)[0];
    return {...reel,script:[q],onScreen:[q],caption:q,sources:[q]};
  }
  if (/long|more detail/.test(f)) {
    const q = quotes.find(q => !reel.sources.includes(q));
    if (q) return {...reel,script:[...reel.script,q],sources:[...reel.sources,q]};
  }
  return {...reel,script:[...reel.script].reverse(),onScreen:[reel.script.at(-1)!],caption:reel.script[0]};
}
