import { createOpenAI } from "@ai-sdk/openai";
import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { resource, type Credentials } from "./chatgptSecurity";

// Provider-side capacity errors; the writer may retry these a bounded number of times.
const transientCodes = new Set(["server_is_overloaded", "rate_limit_exceeded", "server_error"]);
export const chatgptBusy = "ChatGPT is temporarily busy. Try again.";

// A plan response must reach response.completed, even if partial JSON looks valid.
export function completedStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  let pending = "",
    completed = false;
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        pending += decoder.decode(chunk, { stream: true });
        let boundary: number;
        while ((boundary = pending.indexOf("\n")) !== -1) {
          const line = pending.slice(0, boundary).trim();
          pending = pending.slice(boundary + 1);
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data && data !== "[DONE]") {
              const event = JSON.parse(data);
              if (
                event.type === "response.completed" &&
                event.response?.status === "completed"
              )
                completed = true;
              if (
                ["response.failed", "response.incomplete", "error"].includes(
                  event.type,
                )
              ) {
                // Provider reason only, never request or response content.
                console.warn("ChatGPT stream ended early", {
                  type: event.type,
                  reason: event.response?.incomplete_details?.reason,
                  code: event.response?.error?.code ?? event.error?.code ?? event.code,
                  message: String(event.response?.error?.message ?? event.error?.message ?? event.message ?? "").slice(0, 200),
                });
                throw new Error(
                  event.type === "response.incomplete" && event.response?.incomplete_details?.reason === "max_output_tokens"
                    ? "The AI reply reached its size limit. Your input is saved."
                    : transientCodes.has(event.response?.error?.code ?? event.error?.code ?? event.code)
                      ? chatgptBusy
                      : "ChatGPT did not finish the response. Try again.",
                );
              }
            }
          }
        }
        controller.enqueue(chunk);
      },
      flush() {
        if (!completed)
          throw new Error("ChatGPT response was interrupted. Try again.");
      },
    }),
  );
}

function streamFailureCategory(error: unknown) {
  if (error instanceof SyntaxError) return "invalid_event_json";
  if (!(error instanceof Error)) return "stream_read_failed";
  if (/size limit/i.test(error.message)) return "output_limit";
  if (error.message === chatgptBusy) return "provider_busy";
  if (/did not finish/i.test(error.message)) return "provider_incomplete";
  if (/interrupted/i.test(error.message)) return "completion_event_missing";
  return "stream_read_failed";
}

function reportStreamFailure(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const result = await reader.read();
        if (result.done) controller.close();
        else controller.enqueue(result.value);
      } catch (error) {
        // Log only a fixed category; never include model output, headers or credentials.
        console.warn("ChatGPT response stream failed", {
          category: streamFailureCategory(error),
        });
        controller.error(error);
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    },
  });
}

export function planModel(credentials: Credentials, ctx: ActionCtx) {
  return createOpenAI({
    apiKey: credentials.access_token,
    fetch: async (url, options) => {
      if (String(url) !== resource + "/responses")
        throw new Error("Unsupported ChatGPT plan endpoint.");
      const rawBody = options?.body;
      if (typeof rawBody !== "string")
        throw new Error("ChatGPT request could not be prepared.");
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(rawBody);
      } catch {
        throw new Error("ChatGPT request could not be prepared.");
      }
      const requested = body.max_output_tokens;
      body.max_output_tokens =
        typeof requested === "number" ? Math.min(requested, 1500) : 1500;
      await ctx.runMutation(internal.openaiLimits.reserveCall, {});
      const response = await fetch(url, {
        ...options,
        body: JSON.stringify(body),
        signal: options?.signal ?? AbortSignal.timeout(120000),
      });
      if (!response.ok) {
        if(response.status===400){const details=await response.json().catch(()=>null);console.warn("Writer request rejected",{status:response.status,code:details?.error?.code,param:details?.error?.param,reason:String(details?.error?.message??"No format detail").replace(/Bearer\s+\S+/g,"[redacted]").slice(0,600)});}

        // Avoid passing credentials or request details into the agent's error log.
        throw new Error(
          response.status === 401
            ? "Your ChatGPT connection needs renewing. Continue with ChatGPT again."
            : response.status === 429
              ? "Your ChatGPT plan allowance is temporarily unavailable. Try again later."
              : response.status >= 500
                ? chatgptBusy
                : "ChatGPT could not complete this request. Try again.",
        );
      }
      if (!response.body) throw new Error("ChatGPT returned no response.");
      return new Response(reportStreamFailure(completedStream(response.body)), {
        status: response.status,
        headers: response.headers,
      });
    },
  }).responses(credentials.model);
}
