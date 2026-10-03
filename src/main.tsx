import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient, useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../convex/_generated/api";
import { sampleTranscript, type Reel } from "../convex/content";
import "./style.css";
const url = import.meta.env.VITE_CONVEX_URL;
function errorMessage(e: unknown) {
  return e instanceof ConvexError
    ? String(e.data)
    : "Could not reach the writer. Make sure npm run dev is running, then try again.";
}
function App() {
  const generate = useAction(api.writer.generate),
    revise = useAction(api.writer.revise),
    status = useAction(api.writer.status);
  const [open, setOpen] = useState(location.hash === "#studio"),
    [transcript, setTranscript] = useState(""),
    [brand, setBrand] = useState("");
  const [mode, setMode] = useState<"sample" | "ai" | null>(null),
    [result, setResult] = useState<{
      token: string;
      mode: "sample" | "ai";
      reels: Reel[];
    } | null>(null);
  const [busy, setBusy] = useState(false),
    [revision, setRevision] = useState<number | null>(null),
    [feedback, setFeedback] = useState(["", "", ""]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(() => {
    status({})
      .then(setMode)
      .catch(() =>
        setError("Could not reach Convex. Start the app with npm run dev."),
      );
    const listener = () => setOpen(location.hash === "#studio");
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await generate({ transcript, brand });
      setResult(r);
      setMode(r.mode);
      setFeedback(["", "", ""]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function update(i: number) {
    if (!result) return;
    setRevision(i);
    setError("");
    setNotice("");
    try {
      const reel = await revise({
        token: result.token,
        index: i,
        feedback: feedback[i],
      });
      setResult({
        ...result,
        reels: result.reels.map((r, j) => (j === i ? reel : r)),
      });
      setFeedback(feedback.map((f, j) => (j === i ? "" : f)));
      setNotice(`Script ${i + 1} revised. The other two are unchanged.`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setRevision(null);
    }
  }
  return (
    <>
      <header>
        <a className="wordmark" href="#" onClick={() => setOpen(false)}>
          <span className="mark">“</span> Call to Reel
        </a>
        <span className="header-note">Your customers have the words.</span>
      </header>
      {mode === "sample" && (
        <div className="banner" role="status">
          <strong>Sample mode</strong> — These are simple quote arrangements,
          not AI-written scripts. Brand voice is not applied. Revisions shorten,
          expand, or reorder quotes.
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {!open ? (
        <main className="landing">
          <div className="intro">
            <p className="small">From conversation to content</p>
            <h1>
              Good stories start
              <br />
              with listening.
            </h1>
            <p className="explanation">
              Turn one customer call into three Instagram reel scripts, in your
              brand’s voice, grounded in their words.
            </p>
            <button
              onClick={() => {
                location.hash = "studio";
                setOpen(true);
              }}
            >
              Create my scripts
            </button>
            <p className="fine">
              Text in. Scripts, on-screen text and captions out.
            </p>
          </div>
          <div className="quote-art" aria-hidden="true">
            <div className="call-paper">
              <span>A customer said</span>
              <p>“I got my Friday afternoons back.”</p>
              <div className="wave">▂ ▅ ▃ ▆ ▂ ▇ ▄ ▃ ▆ ▂ ▅ ▃ ▂ ▅ ▇ ▃</div>
            </div>
            <div className="reel-paper">
              <span>Your next reel</span>
              <p>
                I got my Friday
                <br />
                afternoons back.
              </p>
              <div className="paper-footer">A real customer story.</div>
            </div>
          </div>
        </main>
      ) : (
        <main className="studio">
          <div className="studio-heading">
            <h1>
              Let the customer
              <br />
              do the talking.
            </h1>
            <p>
              One call. Three angles. Every line comes from a customer
              statement.
            </p>
          </div>
          <div className="workspace">
            <form onSubmit={submit}>
              <h2>Start with the conversation</h2>
              <label htmlFor="transcript">Customer call transcript</label>
              <p className="hint">
                For calls with speaker labels, use “Customer:” for customer
                lines and “Founder:” for yours. Unlabelled text is treated as
                customer speech.
              </p>
              <textarea
                id="transcript"
                required
                minLength={30}
                maxLength={30000}
                value={transcript}
                disabled={busy || revision !== null}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Customer: I used to spend every Friday chasing updates…"
                rows={10}
              />
              <label htmlFor="brand">Short brand note</label>
              <textarea
                id="brand"
                required
                minLength={3}
                maxLength={1200}
                value={brand}
                disabled={busy || revision !== null}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="We sound calm and direct. Short sentences. No hype."
                rows={3}
              />
              <div className="form-actions">
                <button
                  disabled={busy || revision !== null || mode === null}
                  type="submit"
                >
                  {busy
                    ? "Writing your scripts…"
                    : result
                      ? "Generate three new scripts"
                      : "Generate three scripts"}
                </button>
                <button
                  className="text-button"
                  type="button"
                  disabled={busy || revision !== null}
                  onClick={() => {
                    setTranscript(sampleTranscript);
                    setBrand(
                      "Calm, direct, practical. Short sentences. No hype.",
                    );
                  }}
                >
                  Use sample transcript
                </button>
              </div>
              <p className="fine">
                Transcripts and scripts are saved in your Convex database. This
                page keeps your current session until you refresh. Generating
                again replaces the scripts shown here.
              </p>
            </form>
            <section className="results" aria-label="Reel scripts">
              <div className="results-heading">
                <h2>Your three reels</h2>
                <span>
                  {result
                    ? `${result.mode === "sample" ? "Sample" : "AI"} output`
                    : "Ready when you are"}
                </span>
              </div>
              {notice && (
                <p className="notice" role="status">
                  {notice}
                </p>
              )}
              {!result ? (
                <div className="empty">
                  <span className="empty-quote">“</span>
                  <h3>The best line is already in your call.</h3>
                  <p>
                    Paste the transcript and a short note about your voice. Your
                    scripts will appear here.
                  </p>
                </div>
              ) : (
                result.reels.map((reel, i) => (
                  <article key={i}>
                    <div className="reel-heading">
                      <h3>
                        {i + 1}. {reel.title}
                      </h3>
                      <button
                        className="text-button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              `Script\n${reel.script.join("\n")}\n\nOn-screen text\n${reel.onScreen.join("\n")}\n\nCaption\n${reel.caption}`,
                            );
                            setNotice(`Script ${i + 1} copied.`);
                          } catch {
                            setError(
                              "Copy was blocked by your browser. Select the text and copy it manually.",
                            );
                          }
                        }}
                      >
                        Copy script
                      </button>
                    </div>
                    <h4>Spoken script</h4>
                    <p className="script">
                      {reel.script.map((s, j) => (
                        <React.Fragment key={j}>
                          {s}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                    <h4>On-screen text</h4>
                    <p>{reel.onScreen.join("\n")}</p>
                    <h4>Caption</h4>
                    <p>{reel.caption}</p>
                    <details>
                      <summary>Customer quotes behind this script</summary>
                      {reel.sources.map((s, j) => (
                        <blockquote key={j}>{s}</blockquote>
                      ))}
                    </details>
                    <label htmlFor={`feedback-${i}`}>
                      Feedback for this script
                    </label>
                    <textarea
                      id={`feedback-${i}`}
                      maxLength={1200}
                      value={feedback[i]}
                      disabled={busy || revision !== null}
                      onChange={(e) =>
                        setFeedback(
                          feedback.map((f, j) =>
                            j === i ? e.target.value : f,
                          ),
                        )
                      }
                      placeholder={
                        result.mode === "sample"
                          ? "Try “make it shorter” or “add more detail”. Other feedback reorders quotes."
                          : "E.g. Open with the time-saving moment. Make it shorter."
                      }
                      rows={2}
                    />
                    <button
                      className="secondary"
                      disabled={
                        busy ||
                        revision !== null ||
                        feedback[i].trim().length < 3
                      }
                      onClick={() => update(i)}
                    >
                      {revision === i ? "Revising…" : "Revise this script"}
                    </button>
                  </article>
                ))
              )}
            </section>
          </div>
        </main>
      )}
      <footer>Made from customer words. Review before posting.</footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  url ? (
    <ConvexProvider client={new ConvexReactClient(url)}>
      <App />
    </ConvexProvider>
  ) : (
    <main>
      <h1>Start your local workspace</h1>
      <p>Run npm run dev to start Convex and this app.</p>
    </main>
  ),
);
