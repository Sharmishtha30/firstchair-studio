import { test } from "node:test";
import assert from "node:assert/strict";
import { finishedObject } from "../convex/streamResult";
test("the writer drains the lazy stream before awaiting its object", async () => {
  let resolve!: (value: { story: string }) => void;
  const object = new Promise<{ story: string }>((r) => (resolve = r));
  let read = false;
  const stream = {
    object,
    fullStream: (async function* () {
      read = true;
      yield { type: "text-delta", textDelta: "supported story" };
      resolve({ story: "supported story" });
    })(),
  };
  assert.deepEqual(await finishedObject(stream), { story: "supported story" });
  assert.equal(read, true);
});
test("an invalid streamed object is rejected instead of leaving the writer waiting", async () => {
  let reject!: (error: Error) => void;
  const object = new Promise<never>((_, r) => (reject = r));
  const stream = {
    object,
    fullStream: (async function* () {
      yield { type: "text-delta" };
      reject(new Error("incomplete story"));
    })(),
  };
  await assert.rejects(finishedObject(stream), /incomplete story/);
});

import { streamObject } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";
test("a real SDK structured stream completes through the writer's reader", async () => {
  const model = new MockLanguageModelV4({
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "text-start", id: "text" });
          controller.enqueue({
            type: "text-delta",
            id: "text",
            delta: '{"story":"Only the customer’s supported experience."}',
          });
          controller.enqueue({ type: "text-end", id: "text" });
          controller.enqueue({
            type: "finish",
            finishReason: { unified: "stop", raw: "stop" },
            usage: {
              inputTokens: {
                total: 10,
                noCache: 10,
                cacheRead: 0,
                cacheWrite: 0,
              },
              outputTokens: { total: 10, text: 10, reasoning: 0 },
            },
          });
          controller.close();
        },
      }),
      warnings: [],
    }),
  });
  const result = streamObject({
    model,
    schema: z.object({ story: z.string() }),
    prompt: "Find the supported story.",
    maxRetries: 0,
  });
  assert.deepEqual(await finishedObject(result), {
    story: "Only the customer’s supported experience.",
  });
});

import { waitForWriter, WriterWaitError } from "../src/writerWait";
test("the page stops waiting when a writer request never settles", async () => {
  await assert.rejects(
    waitForWriter(new Promise<never>(() => {}), 5),
    WriterWaitError,
  );
  assert.equal(
    await waitForWriter(Promise.resolve("finished"), 100),
    "finished",
  );
});
