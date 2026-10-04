import { createOpenAI } from "@ai-sdk/openai";
import { resource, type Credentials } from "./chatgptSecurity";

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
              )
                throw new Error(
                  "ChatGPT did not finish the response. Try again.",
                );
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
export function planModel(credentials: Credentials) {
  return createOpenAI({
    apiKey: credentials.access_token,
    fetch: async (url, options) => {
      if (String(url) !== resource + "/responses")
        throw new Error("Unsupported ChatGPT plan endpoint.");
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(180000),
      });
      if (!response.ok) {
        // Avoid passing credentials or request details into the agent's error log.
        throw new Error(
          response.status === 401
            ? "Your ChatGPT connection needs renewing. Continue with ChatGPT again."
            : response.status === 429
              ? "Your ChatGPT plan allowance is temporarily unavailable. Try again later."
              : "ChatGPT could not complete this request. Try again.",
        );
      }
      if (!response.body) throw new Error("ChatGPT returned no response.");
      return new Response(completedStream(response.body), {
        status: response.status,
        headers: response.headers,
      });
    },
  }).responses(credentials.model);
}
