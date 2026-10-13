export function writerErrorMessage(message: string): string {
  if (/AI key not set/i.test(message)) return "AI key not set";
  if (/AI call limit reached/i.test(message))
    return "AI call limit reached. Try again later.";
  if (/insufficient_quota|quota|billing|credits/i.test(message))
    return "OpenAI rejected the request because API credit or quota is unavailable. Check your OpenAI API billing. Your existing scripts are unchanged.";
  if (/incorrect api key|invalid api key|authentication|401/i.test(message))
    return "OpenAI did not accept the API key. Check OPENAI_API_KEY in Convex environment variables. Your existing scripts are unchanged.";
  return "The AI writer could not complete this request. Try again; your existing scripts are unchanged.";
}
