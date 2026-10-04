import { demoStories } from "./demoStories";
export type Insight = {
  angle: "pain" | "emotion" | "takeaway";
  painPoint: string;
  emotion: string;
  emotionBasis: "stated" | "inferred" | "not_present";
  story: string;
  evidence: string[];
};
export type Grounding = { text: string; sources: string[] };
export type Reel = {
  insight?: Insight;
  grounding?: Grounding[];
  title: string;
  script: string[];
  onScreen: string[];
  caption: string;
  sources: string[];
};
export const sampleTranscript = `Founder: What was frustrating before you tried us?
Customer: I used to spend every Friday chasing updates across five different spreadsheets.
Customer: By the time I found the right numbers, the meeting was already over.
Founder: What changed?
Customer: Now I open one page and know exactly what needs my attention.
Customer: I got my Friday afternoons back.
Customer: My team spends less time reporting and more time helping customers.
Founder: Anything else?
Customer: I wish we had made the switch sooner.`;
export function isConversationFiller(text: string): boolean {
  return /^(?:hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|okay|ok|yes|yeah|sure|nice to meet you|can you hear me|how are you|i(?:’|')?m (?:good|fine))(?:[.!?,\s]*)$/i.test(
    text.trim(),
  );
}
export function customerQuotes(transcript: string): string[] {
  const lines = transcript
    .trim()
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const speakerPattern = /^([^:]{1,40}):\s*(.*)$/;
  const labelled = lines.some((s) => speakerPattern.test(s));
  const quotes: string[] = [];
  let customer = false;
  for (const line of lines) {
    const speaker = labelled ? line.match(speakerPattern) : null;
    if (speaker) {
      customer = /^(customer|client|buyer|user|participant)$/i.test(
        speaker[1].trim(),
      );
      if (customer && speaker[2].trim()) quotes.push(speaker[2].trim());
    } else if (!labelled || customer)
      quotes.push(
        ...(labelled ? [line] : (line.match(/[^.!?]+[.!?]*/g) ?? [])),
      );
  }
  const substantive = quotes
    .map((s) => s.trim())
    .filter((s) => s && !isConversationFiller(s));
  if (substantive.length < 3)
    throw new Error(
      "Add at least three customer statements about their problem, feelings or experience. Greetings do not count. For a labelled call, start the customer’s turn with “Customer:”.",
    );
  return substantive;
}
export function validateReels(
  reels: Reel[],
  quotes: string[],
  count = 3,
): Reel[] {
  if (reels.length !== count)
    throw new Error(
      "The writer returned the wrong number of scripts. Please try again.",
    );
  for (const r of reels) {
    const lines = [...r.script, ...r.onScreen, r.caption];
    if (
      !r.script.length ||
      !r.onScreen.length ||
      !r.sources.length ||
      lines.some((s) => !s.trim() || isConversationFiller(s)) ||
      r.sources.some((s) => !quotes.includes(s))
    )
      throw new Error(
        "The writer returned empty content or sources outside the customer’s statements. Nothing was changed; please try again.",
      );
    if (
      r.insight &&
      (!r.insight.evidence.length ||
        r.insight.evidence.some(
          (q) => !quotes.includes(q) || !r.sources.includes(q),
        ))
    )
      throw new Error(
        "The writer’s insight is missing supporting customer evidence.",
      );
    if (r.grounding) {
      if (
        r.grounding.some(
          (g) =>
            !lines.includes(g.text) ||
            !g.sources.length ||
            g.sources.some(
              (q) => !quotes.includes(q) || !r.sources.includes(q),
            ),
        ) ||
        lines.some((line) => !r.grounding!.some((g) => g.text === line))
      )
        throw new Error(
          "A script line was missing its supporting customer quote. Please try again.",
        );
    } else if (lines.some((s) => !r.sources.includes(s))) {
      throw new Error(
        "The writer added words outside the customer’s statements without supporting evidence.",
      );
    }
  }
  return reels;
}
export function sampleReels(quotes: string[]): Reel[] {
  if (
    quotes.length === 6 &&
    quotes.every((q, i) => q === customerQuotes(sampleTranscript)[i])
  )
    return demoStories(quotes);
  throw new Error(
    "Sample mode cannot analyze this transcript. Add OPENAI_API_KEY to the active local Convex backend, or use the sample transcript to see example stories.",
  );
}

export function sampleRevision(
  reel: Reel,
  feedback: string,
  quotes: string[],
): Reel {
  const f = feedback.toLowerCase();
  if (/short|concise|tight/.test(f)) {
    const q = [...reel.sources].sort((a, b) => a.length - b.length)[0];
    return {
      ...reel,
      script: [q],
      onScreen: [q],
      caption: q,
      grounding: [{ text: q, sources: [q] }],
    };
  }
  if (/long|more detail/.test(f)) {
    const q = quotes.find((q) => !reel.sources.includes(q));
    if (q)
      return {
        ...reel,
        script: [...reel.script, q],
        sources: [...reel.sources, q],
        grounding: [
          ...(reel.grounding ??
            [...reel.script, ...reel.onScreen, reel.caption].map((text) => ({
              text,
              sources: [text],
            }))),
          { text: q, sources: [q] },
        ],
      };
  }
  const script = [...reel.script].reverse(),
    onScreen = [reel.script.at(-1)!],
    caption = reel.script[0];
  const lines = [...script, ...onScreen, caption];
  return {
    ...reel,
    script,
    onScreen,
    caption,
    ...(reel.grounding
      ? { grounding: reel.grounding.filter((g) => lines.includes(g.text)) }
      : {}),
  };
}
