import { createRemoteJWKSet, jwtVerify } from "jose";
export const issuer = "https://auth.openai.com";
export const resource = "https://api.openai.com/v1";
export const authorizeEndpoint = issuer + "/api/accounts/authorize";
export const tokenEndpoint = issuer + "/api/accounts/oauth/token";
export const scopes =
  "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct";
export function localConfig() {
  const backend = process.env.CONVEX_SITE_URL ?? "";
  const app = process.env.SITE_URL ?? "http://localhost:5173";
  if (
    !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(backend) ||
    !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(app)
  )
    throw new Error(
      "ChatGPT plan sign-in is available only in the local laptop setup.",
    );
  return {
    backend: backend.replace("localhost", "127.0.0.1"),
    app,
    redirect: backend.replace("localhost", "127.0.0.1") + "/chatgpt/callback",
  };
}
export async function digest(value: string) {
  return b64(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  );
}
export function b64(value: Uint8Array) {
  return btoa(String.fromCharCode(...value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export function random() {
  return b64(crypto.getRandomValues(new Uint8Array(32)));
}
export function buildAuthorization(flow: {
  state: string;
  nonce: string;
  challenge: string;
  redirect: string;
  hostId: string;
  clientId?: string;
}) {
  const url = new URL(authorizeEndpoint);
  url.search = new URLSearchParams({
    client_id: flow.clientId ?? "dynamic_agent_client",
    ...(!flow.clientId ? { agent_name_hint: "Call to Reel" } : {}),
    ext_agent_host_id: flow.hostId,
    response_type: "code",
    redirect_uri: flow.redirect,
    scope: scopes,
    resource,
    state: flow.state,
    nonce: flow.nonce,
    code_challenge_method: "S256",
    code_challenge: flow.challenge,
  }).toString();
  return url.toString();
}
export function checkCallback(
  flow: { expiresAt: number; stateHash: string; bindingHash: string },
  stateHash: string,
  bindingHash: string,
) {
  if (
    flow.expiresAt <= Date.now() ||
    flow.stateHash !== stateHash ||
    flow.bindingHash !== bindingHash
  )
    throw new Error(
      "Sign-in expired or could not be verified. Try Continue with ChatGPT again.",
    );
}
export function checkPermission(scope: string) {
  if (!scope.split(/\s+/).includes("chatgpt.tokens.use.direct"))
    throw new Error(
      "ChatGPT plan permission was not granted. Sign in again and allow this app to use your plan.",
    );
}
const jwks = createRemoteJWKSet(new URL(issuer + "/.well-known/jwks.json"));
export async function validateIdentity(
  idToken: string,
  clientId: string,
  nonce: string,
) {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer,
    audience: clientId,
    requiredClaims: ["sub", "exp", "iat"],
    clockTolerance: 5,
  });
  if (payload.nonce !== nonce || !payload.sub)
    throw new Error("ChatGPT identity could not be verified.");
  return payload;
}
async function key() {
  const raw = process.env.CHATGPT_TOKEN_KEY;
  if (!raw) throw new Error("The local credential encryption key is missing.");
  return crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}
export async function encrypt(value: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const bytes = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      await key(),
      new TextEncoder().encode(JSON.stringify(value)),
    ),
  );
  return JSON.stringify({
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...bytes)),
  });
}
export async function decrypt<T>(value: string): Promise<T> {
  const parsed = JSON.parse(value);
  const bytes = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Uint8Array.from(atob(parsed.iv), (c) => c.charCodeAt(0)),
    },
    await key(),
    Uint8Array.from(atob(parsed.data), (c) => c.charCodeAt(0)),
  );
  return JSON.parse(new TextDecoder().decode(bytes));
}
export type Credentials = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope: string;
  expiresAt: number;
  clientId: string;
  subject: string;
  email: string;
  model: string;
};
