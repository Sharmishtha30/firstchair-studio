import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildAuthorization,
  checkCallback,
  checkPermission,
  digest,
  encrypt,
  decrypt,
  random,
} from "../convex/chatgptSecurity";
import { completedStream, planModel } from "../convex/chatgptModel";
import { streamObject } from "ai";
import { z } from "zod";

test("ChatGPT registration requests plan permission, loopback callback and PKCE", async () => {
  const verifier = random();
  const url = new URL(
    buildAuthorization({
      state: random(),
      nonce: random(),
      challenge: await digest(verifier),
      redirect: "http://127.0.0.1:3211/chatgpt/callback",
      hostId: "urn:uuid:test",
    }),
  );
  assert.equal(url.origin, "https://auth.openai.com");
  assert.equal(url.searchParams.get("client_id"), "dynamic_agent_client");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.ok(
    url.searchParams.get("scope")?.includes("chatgpt.tokens.use.direct"),
  );
  assert.equal(url.searchParams.get("resource"), "https://api.openai.com/v1");
  checkPermission(url.searchParams.get("scope")!);
  assert.throws(() => checkPermission("openid profile email"));
  const returning = new URL(
    buildAuthorization({
      state: random(),
      nonce: random(),
      challenge: await digest(verifier),
      redirect: "http://127.0.0.1:3211/chatgpt/callback",
      hostId: "urn:uuid:test",
      clientId: "oaiapp_test",
    }),
  );
  assert.equal(returning.searchParams.get("client_id"), "oaiapp_test");
});
test("sign-in rejects expired state and a different browser", () => {
  const flow = {
    expiresAt: Date.now() + 60000,
    stateHash: "state",
    bindingHash: "browser",
  };
  checkCallback(flow, "state", "browser");
  assert.throws(() => checkCallback(flow, "other", "browser"));
  assert.throws(() => checkCallback(flow, "state", "other"));
  assert.throws(() =>
    checkCallback({ ...flow, expiresAt: 0 }, "state", "browser"),
  );
});
test("credentials are encrypted and tampered ciphertext is rejected", async () => {
  process.env.CHATGPT_TOKEN_KEY = Buffer.from(
    crypto.getRandomValues(new Uint8Array(32)),
  ).toString("base64");
  const fixture = {
    access_token: "fixture-only-not-a-real-token",
    refresh_token: "fixture-refresh",
  };
  const encrypted = await encrypt(fixture);
  assert.ok(!encrypted.includes(fixture.access_token));
  assert.deepEqual(await decrypt(encrypted), fixture);
  const tampered = JSON.parse(encrypted);
  tampered.data = "A" + tampered.data.slice(1);
  // Flip a byte deterministically (rather than possibly replacing A with A).
  const bytes = Buffer.from(tampered.data, "base64");
  bytes[0] ^= 255;
  tampered.data = bytes.toString("base64");
  await assert.rejects(decrypt(JSON.stringify(tampered)));
});
function body(events: unknown[]) {
  return new Response(
    events.map((e) => "data: " + JSON.stringify(e) + "\n\n").join(""),
  ).body!;
}
test("partial, failed and interrupted AI output cannot be accepted", async () => {
  await new Response(
    completedStream(
      body([{ type: "response.completed", response: { status: "completed" } }]),
    ),
  ).text();
  await assert.rejects(
    new Response(
      completedStream(body([{ type: "response.incomplete" }])),
    ).text(),
  );
  await assert.rejects(
    new Response(completedStream(body([{ type: "response.failed" }]))).text(),
  );
  await assert.rejects(
    new Response(
      completedStream(
        body([{ type: "response.output_text.delta", delta: "{}" }]),
      ),
    ).text(),
  );
});
test("the writer's SDK sends supported streaming plan requests with no API key", async () => {
  const original = globalThis.fetch;
  let captured: Record<string, any> | undefined;
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), "https://api.openai.com/v1/responses");
    const headers = new Headers(options?.headers);
    assert.equal(headers.get("authorization"), "Bearer fixture-plan-token");
    captured = JSON.parse(String(options?.body));
    // Stop before inference. This test checks the actual SDK's request shape.
    return new Response("", { status: 429 });
  };
  try {
    const model = planModel({
      access_token: "fixture-plan-token",
      refresh_token: "fixture",
      id_token: "fixture",
      scope: "chatgpt.tokens.use.direct",
      expiresAt: Date.now() + 60000,
      clientId: "oaiapp_test",
      subject: "test",
      email: "test",
      model: "gpt-6.1-sol",
    });
    const stream = streamObject({
      model,
      schema: z.object({ story: z.string() }),
      system: "Only grounded stories.",
      prompt: "Customer: I feel anxious before reviews.",
      maxRetries: 0,
      providerOptions: {
        openai: { store: false, systemMessageMode: "developer" },
      },
    });
    await assert.rejects(stream.object);
    assert.ok(captured);
    assert.equal(captured.store, false);
    assert.equal(captured.stream, true);
    assert.ok(captured.input.every((i: any) => i.role !== "system"));
    for (const key of [
      "background",
      "conversation",
      "max_output_tokens",
      "max_tool_calls",
      "metadata",
      "moderation",
      "multi_agent",
      "prompt",
      "prompt_cache_retention",
      "safety_identifier",
      "temperature",
      "top_logprobs",
      "top_p",
      "truncation",
      "user",
      "previous_response_id",
    ])
      assert.ok(!(key in captured), "Unsupported field: " + key);
  } finally {
    globalThis.fetch = original;
  }
});
