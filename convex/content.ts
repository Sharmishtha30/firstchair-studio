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
export function customerQuotes(transcript: string): string[] {
  const lines = transcript
    .trim()
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const labelled = lines.some((s) => /^[^:]{1,40}:\s/.test(s));
  const quotes = labelled
    ? lines
        .filter((s) => /^(customer|client|buyer|user|participant)\s*:/i.test(s))
        .map((s) => s.replace(/^[^:]+:\s*/, ""))
    : lines
        .flatMap((s) => s.match(/[^.!?]+[.!?]*/g) ?? [])
        .map((s) => s.trim());
  if (quotes.length < 3)
    throw new Error(
      "Add at least three customer statements. For a labelled call, start customer lines with “Customer:”.",
    );
  return quotes;
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
      lines.some((s) => !s.trim()) ||
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
  return [0, 1, 2].map((i) => {
    const selected = [
      quotes[i],
      quotes[(i + (quotes.length === 3 ? 1 : 3)) % quotes.length],
    ];
    return {
      title: [
        "The everyday friction",
        "The turning point",
        "The customer’s takeaway",
      ][i],
      script: selected,
      onScreen: [selected[0]],
      caption: selected[1],
      sources: selected,
    };
  });
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
