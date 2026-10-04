import { action } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { internal, components } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  customerQuotes,
  sampleReels,
  sampleRevision,
  validateReels,
  type Reel,
} from "./content";
import { reelV, modeV } from "./validators";
import {
  storyInstructions,
  analysisInstructions,
  validateInsights,
  reviewInstructions,
  requireSupported,
  type ReviewItem,
} from "./story";
const insightSchema = z.object({
  angle: z.enum(["pain", "emotion", "takeaway"]),
  painPoint: z.string(),
  emotion: z.string(),
  emotionBasis: z.enum(["stated", "inferred", "not_present"]),
  story: z.string(),
  evidence: z.array(z.string()).min(1),
});
const schema = z.object({
  reels: z.array(
    z.object({
      title: z.string(),
      insight: insightSchema,
      grounding: z.array(
        z.object({ text: z.string(), sources: z.array(z.string()) }),
      ),
      script: z.array(z.string()),
      onScreen: z.array(z.string()),
      caption: z.string(),
      sources: z.array(z.string()),
    }),
  ),
});
async function write(
  ctx: ActionCtx,
  quotes: string[],
  brand: string,
  feedback?: string,
  previous?: Reel,
): Promise<Reel[]> {
  const analyst = new Agent(components.agent, {
    name: "Customer insight analyst",
    languageModel: openai("gpt-4.1-mini"),
    instructions: analysisInstructions,
  });
  const analysis = await analyst.generateObject(
    ctx,
    {},
    {
      schema: z.object({
        hasSubstantiveInsight: z.boolean(),
        insights: z.array(insightSchema),
      }),
      prompt: JSON.stringify({
        customerStatements: quotes,
        requestedAngles: previous
          ? [previous.insight?.angle ?? "pain"]
          : ["pain", "emotion", "takeaway"],
        feedback,
      }),
      maxRetries: 1,
    },
  );
  if (!analysis.object.hasSubstantiveInsight)
    throw new Error(
      "The writer found no substantive customer insight. Add statements about a real problem, feeling, consequence or experience.",
    );
  validateInsights(analysis.object.insights, quotes, previous ? 1 : 3);
  const agent = new Agent(components.agent, {
    name: "Customer story strategist",
    languageModel: openai("gpt-4.1-mini"),
    instructions: storyInstructions,
  });
  const result = await agent.generateObject(
    ctx,
    {},
    {
      schema,
      prompt: JSON.stringify({
        customerStatements: quotes,
        selectedInsights: analysis.object.insights,
        brandNote: brand,
        feedback,
        previous,
        count: previous ? 1 : 3,
      }),
      maxRetries: 1,
    },
  );
  const reels = validateReels(result.object.reels, quotes, previous ? 1 : 3);
  for (const reel of reels) {
    const picked = analysis.object.insights.find(
      (i) => i.angle === reel.insight?.angle,
    );
    if (
      !picked ||
      reel.insight!.evidence.some((q) => !picked.evidence.includes(q))
    )
      throw new Error(
        "The writer changed the selected customer insight without supporting evidence.",
      );
  }
  if (!previous && new Set(reels.map((r) => r.insight?.angle)).size !== 3)
    throw new Error("The writer did not provide three distinct story angles.");
  const items: ReviewItem[] = reels.flatMap((r, i) => [
    ...r.grounding!.map((g, j) => ({
      id: `${i}.line.${j}`,
      text: g.text,
      evidence: g.sources,
    })),
    { id: `${i}.title`, text: r.title, evidence: r.sources },
    {
      id: `${i}.pain`,
      text: r.insight!.painPoint,
      evidence: r.insight!.evidence,
    },
    {
      id: `${i}.emotion`,
      text: `${r.insight!.emotionBasis}: ${r.insight!.emotion}`,
      evidence: r.insight!.evidence,
    },
    { id: `${i}.story`, text: r.insight!.story, evidence: r.insight!.evidence },
  ]);
  const reviewer = new Agent(components.agent, {
    name: "Customer story fact checker",
    languageModel: openai("gpt-4.1-mini"),
    instructions: reviewInstructions,
  });
  const review = await reviewer.generateObject(
    ctx,
    {},
    {
      schema: z.object({
        checks: z.array(
          z.object({
            id: z.string(),
            supported: z.boolean(),
            reason: z.string(),
          }),
        ),
      }),
      prompt: JSON.stringify({ items }),
      maxRetries: 1,
    },
  );
  requireSupported(items, review.object.checks);
  return reels;
}
function length(value: string, min: number, max: number, label: string) {
  if (value.trim().length < min || value.length > max)
    throw new Error(`${label} must be between ${min} and ${max} characters.`);
}
function fail(error: unknown): never {
  const message = error instanceof Error ? error.message : "";
  if (
    /Add at least|Sample mode|must be between|writer|supporting|session|script changed|Feedback|index/.test(
      message,
    )
  )
    throw new ConvexError(message);
  throw new ConvexError(
    "The AI writer could not complete this request. Check the server’s OPENAI_API_KEY and try again. Your existing scripts are unchanged.",
  );
}
export const status = action({
  args: {},
  returns: modeV,
  handler: async () => (process.env.OPENAI_API_KEY ? "ai" : "sample"),
});
export const generate = action({
  args: { transcript: v.string(), brand: v.string() },
  returns: v.object({ token: v.string(), mode: modeV, reels: v.array(reelV) }),
  handler: async (ctx, args) => {
    try {
      length(args.transcript, 30, 30000, "Transcript");
      length(args.brand, 3, 1200, "Brand note");
      const quotes = customerQuotes(args.transcript);
      const mode = process.env.OPENAI_API_KEY
        ? ("ai" as const)
        : ("sample" as const);
      const reels = validateReels(
        mode === "ai"
          ? await write(ctx, quotes, args.brand)
          : sampleReels(quotes),
        quotes,
      );
      const token = crypto.randomUUID();
      await ctx.runMutation(internal.runs.save, {
        ...args,
        token,
        reels,
        mode,
      });
      return { token, mode, reels };
    } catch (e) {
      return fail(e);
    }
  },
});
export const revise = action({
  args: { token: v.string(), index: v.number(), feedback: v.string() },
  returns: reelV,
  handler: async (ctx, args): Promise<Reel> => {
    try {
      length(args.feedback, 3, 1200, "Feedback");
      if (!Number.isInteger(args.index) || args.index < 0 || args.index > 2)
        throw new Error("Invalid script index.");
      const run = await ctx.runQuery(internal.runs.get, { token: args.token });
      if (!run) throw new Error("This session is unavailable. Generate again.");
      const quotes = customerQuotes(run.transcript);
      const previous = run.reels[args.index];
      if (run.mode === "ai" && !process.env.OPENAI_API_KEY)
        throw new Error("The AI key is no longer configured.");
      const reel =
        run.mode === "sample"
          ? sampleRevision(previous, args.feedback, quotes)
          : (await write(ctx, quotes, run.brand, args.feedback, previous))[0];
      validateReels([reel], quotes, 1);
      await ctx.runMutation(internal.runs.replace, {
        token: args.token,
        index: args.index,
        reel,
        previous,
      });
      return reel;
    } catch (e) {
      return fail(e);
    }
  },
});
