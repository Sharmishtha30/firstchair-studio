import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient, useAction, useConvexAuth } from "convex/react";
import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import { api } from "../convex/_generated/api";
import {
  sampleTranscript,
  transcriptSpeakers,
  needsCustomerSpeaker,
  type Reel,
} from "../convex/content";
import "./style.css";
const url = import.meta.env.VITE_CONVEX_URL;
function errorMessage(e: unknown) {
  return e instanceof ConvexError
    ? String(e.data)
    : "Could not reach the writer. Make sure npm run dev is running, then try again.";
}
function App() {
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const disconnect = useAction(api.chatgpt.disconnect);
  const connection = useAction(api.chatgpt.connection);
  const welcome = useRef<HTMLDialogElement>(null);
  const [account, setAccount] = useState<string | null>(null);
  const generate = useAction(api.writer.generate),
    revise = useAction(api.writer.revise),
    status = useAction(api.writer.status);
  const [open, setOpen] = useState(location.hash === "#studio"),
    [transcript, setTranscript] = useState(""),
    [brand, setBrand] = useState("");
  const [customerSpeaker, setCustomerSpeaker] = useState("");
  const speakers = transcriptSpeakers(transcript);
  const chooseSpeaker = needsCustomerSpeaker(transcript);
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
    let active = true,
      pending = false;
    async function checkConnection() {
      if (pending) return;
      pending = true;
      try {
        const current = await status({});
        const account = await connection({});
        if (active) {
          setMode(current);
          setAccount(account.connected ? account.email : null);
        }
      } catch {
        if (active)
          setError("Could not reach Convex. Start the app with npm run dev.");
      } finally {
        pending = false;
      }
    }
    void checkConnection();
    const interval = window.setInterval(() => void checkConnection(), 15000);
    const focus = () => void checkConnection();
    const listener = () => setOpen(location.hash === "#studio");
    window.addEventListener("focus", focus);
    window.addEventListener("hashchange", listener);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", focus);
      window.removeEventListener("hashchange", listener);
    };
  }, [status, connection, isAuthenticated]);
  useEffect(() => {
    if (isLoading) return;
    const callback = new URLSearchParams(location.hash.slice(1));
    const ticket = callback.get("chatgpt_ticket"),
      failure = callback.get("chatgpt_error");
    if (!ticket && !failure) return;
    history.replaceState(null, "", "/#studio");
    setOpen(true);
    if (failure) {
      setError(failure);
      return;
    }
    const browser = sessionStorage.getItem("chatgpt_browser");
    if (!browser) {
      setError("Sign-in could not be verified. Continue with ChatGPT again.");
      return;
    }
    setNotice("Finishing ChatGPT connection…");
    void signIn("chatgpt", { ticket: ticket!, browser })
      .then((result) => {
        if (!result.signingIn) throw new Error("Sign-in was rejected.");
        sessionStorage.removeItem("chatgpt_browser");
        setNotice(
          "ChatGPT connected. Paste your call to find its pain, emotion and takeaway.",
        );
      })
      .catch(() =>
        setError("Sign-in did not finish. Continue with ChatGPT again."),
      );
  }, [signIn, isLoading]);
  useEffect(() => {
    if (
      account &&
      mode === "ai" &&
      !localStorage.getItem("chatgpt_welcome:" + account)
    )
      welcome.current?.showModal();
  }, [account, mode]);
  function dismissWelcome() {
    if (account) localStorage.setItem("chatgpt_welcome:" + account, "seen");
    welcome.current?.close();
  }
  function connect() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const browser = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    sessionStorage.setItem("chatgpt_browser", browser);
    sessionStorage.setItem(
      "call_reel_draft",
      JSON.stringify({ transcript, brand, customerSpeaker }),
    );
    location.assign("http://127.0.0.1:3211/chatgpt/start?browser=" + browser);
  }
  useEffect(() => {
    const draft = sessionStorage.getItem("call_reel_draft");
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setTranscript(d.transcript ?? "");
        setBrand(d.brand ?? "");
        setCustomerSpeaker(d.customerSpeaker ?? "");
      } catch {}
      sessionStorage.removeItem("call_reel_draft");
    }
  }, []);
  async function leave() {
    try {
      const { revoked } = await disconnect({});
      await signOut();
      setResult(null);
      setMode("sample");
      setAccount(null);
      setNotice(
        revoked
          ? "ChatGPT disconnected."
          : "Disconnected locally. Also remove Call to Reel in ChatGPT Settings to revoke access.",
      );
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await generate({
        transcript,
        brand,
        ...(chooseSpeaker ? { customerSpeaker } : {}),
      });
      setResult(r);
      // Connection status is checked independently from this run’s output mode.
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
      <dialog
        ref={welcome}
        className="welcome"
        onCancel={dismissWelcome}
        aria-labelledby="welcome-title"
      >
        <h2 id="welcome-title">You’re using your ChatGPT plan</h2>
        <p>
          Script writing and revisions use your plan’s allowance. You can manage
          usage in ChatGPT settings.
        </p>
        <button onClick={dismissWelcome}>Got it</button>
      </dialog>
      <header>
        <a className="wordmark" href="#" onClick={() => setOpen(false)}>
          <span className="mark">“</span> Call to Reel
        </a>
        <span className="header-note">
          {mode === "ai"
            ? "ChatGPT plan connected"
            : mode === "sample"
              ? "Sample mode · ChatGPT not connected"
              : "Checking AI connection…"}
        </span>
        {account ? (
          <button
            className="text-button"
            onClick={() => void leave()}
            disabled={busy || revision !== null}
          >
            Disconnect ChatGPT
          </button>
        ) : (
          <button className="secondary" onClick={connect} disabled={isLoading}>
            Continue with ChatGPT
          </button>
        )}
      </header>
      {mode === "sample" && (
        <div className="banner" role="status">
          <strong>Sample mode — demo stories only.</strong> Continue with
          ChatGPT to analyze your own call using your plan’s allowance. No API
          credits needed. “Use sample transcript” shows hand-written examples.
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
              {mode === "ai" && (
                <p className="hint">
                  Using ChatGPT plan ·{" "}
                  <a
                    href="https://chatgpt.com/settings/usage"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Manage usage
                  </a>
                </p>
              )}
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
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setCustomerSpeaker("");
                  setError("");
                }}
                placeholder="Customer: I used to spend every Friday chasing updates…"
                rows={10}
              />
              {chooseSpeaker && (
                <>
                  <label htmlFor="customer-speaker">
                    Which speaker is the customer?
                  </label>
                  <select
                    id="customer-speaker"
                    value={customerSpeaker}
                    onChange={(e) => setCustomerSpeaker(e.target.value)}
                    required
                    disabled={busy || revision !== null}
                  >
                    <option value="">Choose the customer</option>
                    {speakers.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className="hint">
                    Only this speaker’s words will become content.
                  </p>
                </>
              )}
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
                    {reel.insight ? (
                      <div className="story-insight">
                        <h4>
                          {
                            {
                              pain: "The pain point",
                              emotion: "The emotional moment",
                              takeaway: "The customer takeaway",
                            }[reel.insight.angle]
                          }
                        </h4>
                        <p>{reel.insight.story}</p>
                        <p className="hint">
                          <strong>Customer’s pain:</strong>{" "}
                          {reel.insight.painPoint}
                        </p>
                        <p className="hint">
                          <strong>
                            Emotion{" "}
                            {reel.insight.emotionBasis === "inferred"
                              ? "(interpretation, not stated)"
                              : reel.insight.emotionBasis === "not_present"
                                ? "(not explicitly stated)"
                                : "(stated by customer)"}
                            :
                          </strong>{" "}
                          {reel.insight.emotion}
                        </p>
                      </div>
                    ) : (
                      <p className="hint">
                        Quote draft only. Add the AI key to identify the pain
                        and emotional story in this call.
                      </p>
                    )}
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
    <ConvexAuthProvider client={new ConvexReactClient(url)}>
      <App />
    </ConvexAuthProvider>
  ) : (
    <main>
      <h1>Start your local workspace</h1>
      <p>Run npm run dev to start Convex and this app.</p>
    </main>
  ),
);
