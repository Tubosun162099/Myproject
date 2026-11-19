"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { equipment, exercises } from "@/lib/data";

type Kind = "exercise" | "equipment";
type Saved = Record<Kind, Record<string, { url: string; approvedAt: string }>>;
type Job = { job: string; status: string; progress: number; error?: string | null };

const PASS_KEY = "geem:admin";
const JOBS_KEY = "geem:jobs";
const keyOf = (k: Kind, id: string) => `${k}:${id}`;

const load = <T,>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const store = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [saved, setSaved] = useState<Saved>({ exercise: {}, equipment: {} });
  const [setupProblem, setSetupProblem] = useState<string | null>(null);
  const [check, setCheck] = useState<{ ok: boolean; message: string; keyHint?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<Kind>("exercise");
  const [onlyMissing, setOnlyMissing] = useState(true);

  const call = useCallback(
    async (path: string, init: RequestInit = {}, pass = password) => {
      const res = await fetch(path, {
        ...init,
        headers: { "content-type": "application/json", "x-admin-password": pass, ...(init.headers ?? {}) },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      return body;
    },
    [password],
  );

  const signIn = useCallback(
    async (pass: string) => {
      setError(null);
      try {
        const body = await call("/api/admin/list", {}, pass);
        setSaved(body.videos);
        setSetupProblem(body.setupProblem);
        setPassword(pass);
        setAuthed(true);
        store(PASS_KEY, pass);
        setCheck({ ok: false, message: "Checking your OpenAI connection…" });
        call("/api/admin/check", {}, pass)
          .then(setCheck)
          .catch((e) => setCheck({ ok: false, message: (e as Error).message }));
      } catch (e) {
        setError((e as Error).message);
        setAuthed(false);
      }
    },
    [call],
  );

  useEffect(() => {
    setJobs(load(JOBS_KEY, {}));
    const pass = load<string>(PASS_KEY, "");
    if (pass) signIn(pass);
  }, [signIn]);

  useEffect(() => store(JOBS_KEY, jobs), [jobs]);

  // Poll jobs that are still being generated.
  useEffect(() => {
    if (!authed) return;
    const pending = Object.entries(jobs).filter(([, j]) => j.status === "queued" || j.status === "in_progress");
    if (!pending.length) return;
    const t = setTimeout(async () => {
      for (const [k, j] of pending) {
        try {
          const s = await call(`/api/admin/status?job=${encodeURIComponent(j.job)}`);
          setJobs((all) => ({ ...all, [k]: { ...j, ...s } }));
        } catch (e) {
          setJobs((all) => ({ ...all, [k]: { ...j, status: "failed", error: (e as Error).message } }));
        }
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [jobs, authed, call]);

  const act = async (k: string, fn: () => Promise<void>) => {
    setBusy((b) => ({ ...b, [k]: true }));
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy((b) => ({ ...b, [k]: false }));
    }
  };

  const generate = (kind: Kind, id: string) =>
    act(keyOf(kind, id), async () => {
      const j = await call("/api/admin/generate", { method: "POST", body: JSON.stringify({ kind, id }) });
      setJobs((all) => ({ ...all, [keyOf(kind, id)]: j }));
    });

  const approve = (kind: Kind, id: string, job: string) =>
    act(keyOf(kind, id), async () => {
      const { url } = await call("/api/admin/approve", { method: "POST", body: JSON.stringify({ kind, id, job }) });
      setSaved((s) => ({ ...s, [kind]: { ...s[kind], [id]: { url, approvedAt: new Date().toISOString() } } }));
      setJobs(({ [keyOf(kind, id)]: _, ...rest }) => rest);
    });

  const discard = (kind: Kind, id: string) => setJobs(({ [keyOf(kind, id)]: _, ...rest }) => rest);

  const remove = (kind: Kind, id: string) =>
    act(keyOf(kind, id), async () => {
      if (!confirm("Remove this approved video? People will see 'coming soon' again.")) return;
      await call("/api/admin/remove", { method: "POST", body: JSON.stringify({ kind, id }) });
      setSaved((s) => {
        const next = { ...s[kind] };
        delete next[id];
        return { ...s, [kind]: next };
      });
    });

  const items = useMemo(() => {
    const all = tab === "exercise" ? exercises : equipment;
    return all.filter((x) => !onlyMissing || !saved[tab][x.id] || jobs[keyOf(tab, x.id)]);
  }, [tab, onlyMissing, saved, jobs]);

  const doneCount = (k: Kind) => Object.keys(saved[k]).length;

  if (!authed) {
    return (
      <form
        className="admin-login"
        onSubmit={(e) => {
          e.preventDefault();
          signIn(password);
        }}
      >
        <label className="search">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Admin password"
            autoComplete="current-password"
          />
        </label>
        <button className="btn btn--ink" type="submit">Sign in</button>
        {error && <p className="notice">{error}</p>}
      </form>
    );
  }

  return (
    <>
      {check && (
        <p className="notice">
          <strong>OpenAI: </strong>
          {check.message}
          {check.keyHint && <span className="sub"> (key {check.keyHint})</span>}
        </p>
      )}
      {setupProblem && <p className="notice">{setupProblem}</p>}
      {error && error !== setupProblem && <p className="notice">{error}</p>}

      <div className="tabs" role="tablist">
        {(["exercise", "equipment"] as Kind[]).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} className="tab" onClick={() => setTab(k)}>
            {k === "exercise" ? "Exercises" : "Machines"}
            <span className="tab-count">
              {doneCount(k)}/{k === "exercise" ? exercises.length : equipment.length}
            </span>
          </button>
        ))}
      </div>

      <label className="check">
        <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
        Only show ones without a video
      </label>

      <div className="list">
        {items.map((x) => {
          const k = keyOf(tab, x.id);
          const job = jobs[k];
          const approved = saved[tab][x.id];
          const working = job && (job.status === "queued" || job.status === "in_progress");
          return (
            <div key={x.id} className="admin-item">
              <div className="admin-head">
                <div className="text">
                  <div className="title">{x.name}</div>
                  <div className="sub">
                    {working
                      ? `Generating… ${job.progress ?? 0}%`
                      : job?.status === "completed"
                        ? "Ready to review"
                        : job?.status === "failed"
                          ? `Failed: ${job.error ?? "unknown error"}`
                          : approved
                            ? "Approved"
                            : "No video yet"}
                  </div>
                </div>
                {!job && !approved && (
                  <button className="btn" disabled={busy[k]} onClick={() => generate(tab, x.id)}>
                    {busy[k] ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Generate
                  </button>
                )}
                {!job && approved && (
                  <>
                    <button className="btn" disabled={busy[k]} onClick={() => generate(tab, x.id)}>
                      <RotateCcw size={16} /> Redo
                    </button>
                    <button className="btn btn--icon" disabled={busy[k]} onClick={() => remove(tab, x.id)} aria-label="Remove video">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                {working && <Loader2 size={18} className="spin" aria-hidden="true" />}
                {job?.status === "failed" && (
                  <button className="btn" onClick={() => generate(tab, x.id)}>
                    <RotateCcw size={16} /> Try again
                  </button>
                )}
              </div>

              {working && (
                <div className="bar" aria-hidden="true"><i style={{ width: `${Math.max(4, job.progress ?? 0)}%` }} /></div>
              )}

              {job?.status === "completed" && (
                <>
                  <div className="video">
                    <video
                      src={`/api/admin/preview?job=${encodeURIComponent(job.job)}&key=${encodeURIComponent(password)}`}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                  <p className="sub">Check the form carefully. Only approve if the technique is correct.</p>
                  <div className="admin-actions">
                    <button className="btn btn--ink" disabled={busy[k]} onClick={() => approve(tab, x.id, job.job)}>
                      {busy[k] ? <Loader2 size={16} className="spin" /> : <Check size={16} />} Approve
                    </button>
                    <button className="btn" disabled={busy[k]} onClick={() => generate(tab, x.id)}>
                      <RotateCcw size={16} /> Try again
                    </button>
                    <button className="btn" disabled={busy[k]} onClick={() => discard(tab, x.id)}>Discard</button>
                  </div>
                </>
              )}

              {!job && approved && (
                <div className="video">
                  <video src={approved.url} controls muted loop playsInline preload="metadata" />
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && <p className="empty">Everything here has an approved video.</p>}
      </div>
    </>
  );
}
