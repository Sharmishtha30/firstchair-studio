import { action, httpAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";
import {
  buildAuthorization,
  checkPermission,
  validateIdentity,
  localConfig,
  random,
  digest,
  encrypt,
  decrypt,
  resource,
  tokenEndpoint,
  type Credentials,
} from "./chatgptSecurity";
function cookie(request: Request, name: string) {
  return (
    (request.headers.get("cookie") ?? "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(name + "="))
      ?.slice(name.length + 1) ?? ""
  );
}
function redirect(location: string, cookies: string[] = []) {
  const h = new Headers({
    location,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
  });
  cookies.forEach((c) => h.append("set-cookie", c));
  return new Response(null, { status: 303, headers: h });
}
const clearFlow =
  "call_reel_flow=; Path=/chatgpt; HttpOnly; SameSite=Lax; Max-Age=0";
export const start = httpAction(async (ctx, request) => {
  try {
    const config = localConfig(),
      url = new URL(request.url),
      browser = url.searchParams.get("browser") ?? "";
    if (!/^[A-Za-z0-9_-]{40,90}$/.test(browser))
      return new Response("Start sign-in from the Call to Reel page.", {
        status: 400,
      });
    const hostId = process.env.CHATGPT_HOST_ID;
    if (!hostId) throw new Error("Local sign-in setup is incomplete.");
    const state = random(),
      binding = random(),
      verifier = random(),
      nonce = random();
    const savedClient = url.searchParams.has("new")
      ? undefined
      : cookie(request, "call_reel_client");
    const clientId = savedClient?.startsWith("oaiapp_")
      ? savedClient
      : undefined;
    await ctx.runMutation(internal.chatgptStore.createFlow, {
      stateHash: await digest(state),
      bindingHash: await digest(binding),
      browserHash: await digest(browser),
      verifier,
      nonce,
      redirect: config.redirect,
      expiresAt: Date.now() + 600000,
      ...(clientId ? { clientId } : {}),
    });
    return redirect(
      buildAuthorization({
        state,
        nonce,
        challenge: await digest(verifier),
        redirect: config.redirect,
        hostId,
        clientId,
      }),
      [
        `call_reel_flow=${binding}; Path=/chatgpt; HttpOnly; SameSite=Lax; Max-Age=600`,
      ],
    );
  } catch {
    return new Response(
      "ChatGPT sign-in could not start. Make sure the local app is running.",
      { status: 503 },
    );
  }
});
export const callback = httpAction(async (ctx, request) => {
  const config = localConfig(),
    url = new URL(request.url);
  try {
    const state = url.searchParams.get("state") ?? "",
      binding = cookie(request, "call_reel_flow");
    if (!state || !binding) throw new Error("state");
    const flow = await ctx.runMutation(internal.chatgptStore.consumeFlow, {
      stateHash: await digest(state),
      bindingHash: await digest(binding),
    });
    if (!flow || url.searchParams.has("error")) throw new Error("state");
    const code = url.searchParams.get("code"),
      returnedClient = url.searchParams.get("client_id"),
      clientId = flow.clientId ?? returnedClient;
    if (
      !code ||
      !clientId?.startsWith("oaiapp_") ||
      (flow.clientId && returnedClient && returnedClient !== flow.clientId)
    )
      throw new Error("client");
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        code_verifier: flow.verifier,
        redirect_uri: flow.redirect,
        resource,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("exchange");
    const tokens = await response.json();
    if (
      typeof tokens.access_token !== "string" ||
      typeof tokens.refresh_token !== "string" ||
      typeof tokens.id_token !== "string" ||
      typeof tokens.scope !== "string" ||
      typeof tokens.expires_in !== "number"
    )
      throw new Error("tokens");
    checkPermission(tokens.scope);
    const identity = await validateIdentity(
      tokens.id_token,
      clientId,
      flow.nonce,
    );
    const modelsResponse = await fetch(resource + "/models", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      signal: AbortSignal.timeout(20000),
    });
    if (!modelsResponse.ok) throw new Error("models");
    const models = await modelsResponse.json();
    const catalog = Array.isArray(models.models)
      ? models.models.filter(
          (m: { slug?: string; visibility?: string }) =>
            m.visibility === "list" && typeof m.slug === "string",
        )
      : [];
    const chosen =
      catalog.find((m: { slug: string }) => m.slug === "gpt-6.1-sol") ??
      catalog[0];
    if (!chosen) throw new Error("models");
    const credentials: Credentials = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      id_token: tokens.id_token,
      scope: tokens.scope,
      clientId,
      subject: identity.sub!,
      email:
        typeof identity.email === "string" ? identity.email : "ChatGPT account",
      model: chosen.slug,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
    const ticket = random();
    await ctx.runMutation(internal.chatgptStore.finish, {
      clientId,
      subject: credentials.subject,
      email: credentials.email,
      encrypted: await encrypt(credentials),
      model: credentials.model,
      ticketHash: await digest(ticket),
      browserHash: flow.browserHash,
    });
    return redirect(
      config.app + "/#chatgpt_ticket=" + encodeURIComponent(ticket),
      [
        clearFlow,
        `call_reel_client=${clientId}; Path=/chatgpt; HttpOnly; SameSite=Lax; Max-Age=2592000`,
      ],
    );
  } catch {
    return redirect(
      config.app +
        "/#chatgpt_error=Sign-in%20did%20not%20complete.%20Try%20again%20and%20allow%20ChatGPT%20plan%20usage.",
      [clearFlow],
    );
  }
});
export const connection = action({
  args: {},
  returns: v.object({
    connected: v.boolean(),
    email: v.union(v.string(), v.null()),
    model: v.union(v.string(), v.null()),
  }),
  handler: async (
    ctx,
  ): Promise<{
    connected: boolean;
    email: string | null;
    model: string | null;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { connected: false, email: null, model: null };
    const c = await ctx.runQuery(internal.chatgptStore.get, { userId });
    return {
      connected: !!c?.encrypted,
      email: c?.email ?? null,
      model: c?.model ?? null,
    };
  },
});
export async function credentialsFor(ctx: ActionCtx): Promise<Credentials> {
  localConfig();
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Continue with ChatGPT to use your plan.");
  const c = await ctx.runQuery(internal.chatgptStore.get, { userId });
  if (!c?.encrypted)
    throw new ConvexError(
      "Your ChatGPT connection is unavailable. Sign in again.",
    );
  const credentials = await decrypt<Credentials>(c.encrypted);
  checkPermission(credentials.scope);
  if (credentials.expiresAt > Date.now() + 120000) return credentials;
  const lease = random();
  const locked = await ctx.runMutation(internal.chatgptStore.lock, {
    userId,
    lease,
  });
  if (!locked?.encrypted) throw new ConvexError("Continue with ChatGPT again.");
  try {
    const current = await decrypt<Credentials>(locked.encrypted);
    if (current.expiresAt > Date.now() + 120000) return current;
    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: current.clientId,
        refresh_token: current.refresh_token,
        resource,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error("refresh");
    const data = await res.json();
    if (
      typeof data.access_token !== "string" ||
      typeof data.refresh_token !== "string" ||
      typeof data.expires_in !== "number"
    )
      throw new Error("refresh");
    const next: Credentials = {
      ...current,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      scope: typeof data.scope === "string" ? data.scope : current.scope,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    checkPermission(next.scope);
    await ctx.runMutation(internal.chatgptStore.release, {
      userId,
      lease,
      encrypted: await encrypt(next),
    });
    return next;
  } catch {
    throw new ConvexError(
      "Your ChatGPT connection needs renewing. Continue with ChatGPT again.",
    );
  } finally {
    await ctx.runMutation(internal.chatgptStore.release, { userId, lease });
  }
}
export const disconnect = action({
  args: {},
  returns: v.object({ revoked: v.boolean() }),
  handler: async (ctx): Promise<{ revoked: boolean }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { revoked: true };
    const c = await ctx.runQuery(internal.chatgptStore.get, { userId });
    let revoked = true;
    if (c?.encrypted) {
      revoked = false;
      try {
        const cred = await decrypt<Credentials>(c.encrypted);
        const discovery = await (
          await fetch(
            "https://auth.openai.com/.well-known/openid-configuration",
            { signal: AbortSignal.timeout(15000) },
          )
        ).json();
        if (
          typeof discovery.revocation_endpoint === "string" &&
          discovery.revocation_endpoint.startsWith("https://auth.openai.com/")
        ) {
          const r = await fetch(discovery.revocation_endpoint, {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              token: cred.refresh_token,
              token_type_hint: "refresh_token",
              client_id: cred.clientId,
            }),
            signal: AbortSignal.timeout(15000),
          });
          revoked = r.ok;
        }
      } catch {}
      await ctx.runMutation(internal.chatgptStore.clear, { userId });
    }
    return { revoked };
  },
});
