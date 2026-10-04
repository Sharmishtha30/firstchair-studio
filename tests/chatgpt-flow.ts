import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { digest, random } from "../convex/chatgptSecurity";
const admin = (name: string, args: unknown) =>
  JSON.parse(
    execFileSync("npx", ["convex", "run", name, JSON.stringify(args)], {
      encoding: "utf8",
    }) || "null",
  );
const client = new ConvexHttpClient("http://127.0.0.1:3210");
const browser = random(),
  state = random(),
  binding = random();
const flow = {
  stateHash: await digest(state),
  bindingHash: await digest(binding),
  browserHash: await digest(browser),
  verifier: random(),
  nonce: random(),
  redirect: "http://127.0.0.1:3211/chatgpt/callback",
  expiresAt: Date.now() + 60000,
};
admin("chatgptStore:createFlow", flow);
assert.equal(
  admin("chatgptStore:consumeFlow", {
    stateHash: flow.stateHash,
    bindingHash: "wrong",
  }),
  null,
);
assert.deepEqual(
  admin("chatgptStore:consumeFlow", {
    stateHash: flow.stateHash,
    bindingHash: flow.bindingHash,
  }),
  flow,
);
assert.equal(
  admin("chatgptStore:consumeFlow", {
    stateHash: flow.stateHash,
    bindingHash: flow.bindingHash,
  }),
  null,
);
admin("chatgptStore:createFlow", {
  ...flow,
  stateHash: "expired-" + state,
  expiresAt: 0,
});
assert.equal(
  admin("chatgptStore:consumeFlow", {
    stateHash: "expired-" + state,
    bindingHash: flow.bindingHash,
  }),
  null,
);
console.log(
  "PASS: Local Convex rejects browser mismatch, expired callbacks and callback replay.",
);
assert.deepEqual(await client.action(api.chatgpt.connection, {}), {
  connected: false,
  email: null,
  model: null,
});
assert.equal(await client.action(api.writer.status, {}), "sample");
const ticket = random();
// Fixture identity is created through the local admin CLI, never through a public endpoint.
// This proves our own sign-in/session handling; it does NOT prove OpenAI consent or inference.
admin("chatgptStore:finish", {
  clientId: "oaiapp_test_fixture",
  subject: "local-auth-test",
  email: "auth-test@example.invalid",
  encrypted: "fixture-no-real-credentials",
  model: "fixture-model",
  ticketHash: await digest(ticket),
  browserHash: flow.browserHash,
});
assert.equal(
  admin("chatgptStore:redeem", {
    ticketHash: await digest(ticket),
    browserHash: "wrong",
  }),
  null,
);
const signedIn = await client.action(api.auth.signIn, {
  provider: "chatgpt",
  params: { ticket, browser },
});
assert.ok(signedIn.tokens?.token, "Convex session token issued");
client.setAuth(signedIn.tokens!.token);
assert.deepEqual(await client.action(api.chatgpt.connection, {}), {
  connected: true,
  email: "auth-test@example.invalid",
  model: "fixture-model",
});
assert.equal(await client.action(api.writer.status, {}), "ai");
assert.equal(
  admin("chatgptStore:redeem", {
    ticketHash: await digest(ticket),
    browserHash: flow.browserHash,
  }),
  null,
);
console.log(
  "PASS: Browser-bound ticket creates a verified Convex session and cannot be reused.",
);
await client.action(api.chatgpt.disconnect, {});
assert.deepEqual(await client.action(api.chatgpt.connection, {}), {
  connected: false,
  email: "auth-test@example.invalid",
  model: "fixture-model",
});
await client.action(api.auth.signOut, {});
client.clearAuth();
assert.equal(await client.action(api.writer.status, {}), "sample");
console.log(
  "PASS: Disconnect removes fixture credentials and sign-out returns to sample mode.",
);
const start = await fetch(
  "http://127.0.0.1:3211/chatgpt/start?browser=" + random(),
  { redirect: "manual" },
);
assert.equal(start.status, 303);
const authorization = new URL(start.headers.get("location")!);
assert.equal(authorization.origin, "https://auth.openai.com");
assert.equal(
  authorization.searchParams.get("client_id"),
  "dynamic_agent_client",
);
assert.equal(
  authorization.searchParams.get("redirect_uri"),
  "http://127.0.0.1:3211/chatgpt/callback",
);
assert.ok(start.headers.get("set-cookie")?.includes("HttpOnly"));
const invalid = await fetch(
  "http://127.0.0.1:3211/chatgpt/callback?state=wrong&code=wrong",
  { redirect: "manual" },
);
assert.equal(invalid.status, 303);
assert.ok(invalid.headers.get("location")?.includes("chatgpt_error"));
console.log(
  "PASS: HTTP sign-in redirects to the official OpenAI flow; forged callback returns a safe failure.",
);
console.log(
  "NOT TESTED: Real OpenAI account consent, plan allowance, live story generation or token refresh. These need the owner's sign-in.",
);
