"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  emptyEmployer,
  emptyJob,
  emptyPreviousRole,
  emptyProfile,
  isProfileComplete,
  type Employer,
  type JobPosting,
  type PreviousRole,
  type Profile,
} from "@/lib/profile";

const PROFILE_KEY = "nhs-statement.profile.v1";
const JOB_KEY = "nhs-statement.job.v1";

type Tab = "profile" | "statement";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode); the app still works for this session.
  }
}

const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

function TextArea(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  tall?: boolean;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {props.label}
        {props.hint && <small>{props.hint}</small>}
      </label>
      <textarea
        id={id}
        className={props.tall ? "tall" : undefined}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

function TextInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <input
        id={id}
        type="text"
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [job, setJob] = useState<JobPosting>(emptyJob);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const p = load(PROFILE_KEY, emptyProfile());
    if (!p.employers?.length) p.employers = [emptyEmployer()];
    setProfile(p);
    const j = load(JOB_KEY, emptyJob()) as JobPosting & {
      previousTitle?: string;
      previousWorkplace?: string;
    };
    // Carry over the single previous role saved by older versions.
    if (j.previousTitle !== undefined || j.previousWorkplace !== undefined) {
      j.previousRoles = [{ title: j.previousTitle ?? "", workplace: j.previousWorkplace ?? "" }];
    }
    delete j.previousTitle;
    delete j.previousWorkplace;
    setJob(j);
    if (isProfileComplete(p)) setTab("statement");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save(JOB_KEY, job);
  }, [job, loaded]);

  const updateProfile = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setSavedAt(null);
  };

  const updateEmployer = (i: number, patch: Partial<Employer>) =>
    updateProfile(
      "employers",
      profile.employers.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    );

  const saveProfile = () => {
    save(PROFILE_KEY, profile);
    setSavedAt(new Date().toLocaleTimeString("en-GB"));
  };

  const updateJob = <K extends keyof JobPosting>(key: K, value: JobPosting[K]) =>
    setJob((j) => ({ ...j, [key]: value }));

  const updatePreviousRole = (i: number, patch: Partial<PreviousRole>) =>
    updateJob(
      "previousRoles",
      job.previousRoles.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );

  async function generate() {
    setError(null);
    setOutput("");
    setCopied(false);
    setGenerating(true);
    save(PROFILE_KEY, profile);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, job }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((o) => o + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output.trim());
    setCopied(true);
  };

  const download = () => {
    const blob = new Blob([output.trim()], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const name = [job.jobTitle, job.trust].filter(Boolean).join(" - ") || "statement";
    a.download = `Supporting statement - ${name}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const words = countWords(output);
  const profileReady = isProfileComplete(profile);
  const canGenerate = profileReady && job.jobDescription.trim() !== "" && !generating;

  return (
    <main className="container">
      <header>
        <h1>NHS Supporting Statement Builder</h1>
        <p>
          Save your nursing profile once, then paste any job description to get a tailored,
          ATS-optimised 1,200 to 1,500 word supporting statement.
        </p>
      </header>

      <details className="card how" open={!profileReady}>
        <summary>How it works</summary>
        <ol>
          <li>
            <strong>Build your profile once.</strong> Add the hospitals you have worked at, your
            years of experience, qualifications, CPD, equipment, achievements, skills and areas of
            expertise. It is saved in this browser and you can edit it any time.
          </li>
          <li>
            <strong>Add the job.</strong> For each application, paste the job description, person
            specification and Trust values from NHS Jobs, Trac or Jobtrain.
          </li>
          <li>
            <strong>Tell us your previous roles.</strong> Enter each job title you held and where
            you worked. Your statement names these roles exactly as you write them.
          </li>
          <li>
            <strong>Optional: add an earlier statement.</strong> If you have already written a
            supporting statement for this job, paste it in. Its best examples and details are
            folded into the new one.
          </li>
          <li>
            <strong>Get your statement.</strong> You receive a 1,200 to 1,500 word statement with a
            strong opening, a detailed CAR (Context, Action, Result) example for every person
            specification point, the job&apos;s keywords for ATS screening, the Trust&apos;s values
            woven in, and a confident closing. Read it through, make sure every example reflects
            your own experience, then copy or download it.
          </li>
        </ol>
      </details>

      <div className="tabs" role="tablist">
        <button
          className="tab"
          role="tab"
          aria-selected={tab === "profile"}
          onClick={() => setTab("profile")}
        >
          1. My profile
        </button>
        <button
          className="tab"
          role="tab"
          aria-selected={tab === "statement"}
          onClick={() => setTab("statement")}
        >
          2. Write a statement
        </button>
      </div>

      {tab === "profile" && (
        <>
          <section className="card">
            <h2>About you</h2>
            <p className="hint">Your profile is saved in this browser. You can edit it at any time.</p>
            <div className="grid">
              <TextInput
                label="Full name"
                value={profile.fullName}
                onChange={(v) => updateProfile("fullName", v)}
              />
              <TextInput
                label="NMC registration"
                value={profile.nmcRegistered}
                placeholder="e.g. UK Registered Adult Nurse (NMC PIN held)"
                onChange={(v) => updateProfile("nmcRegistered", v)}
              />
            </div>
          </section>

          <section className="card">
            <h2>Work experience</h2>
            <p className="hint">
              Add each hospital you have worked at and how long you were there. Your role and
              department here keep your examples true to work you have done. The job title named
              in each statement is the one you enter for that application.
            </p>
            {profile.employers.map((e, i) => (
              <div className="employer" key={i}>
                <div className="employer-head">
                  <strong>Employer {i + 1}</strong>
                  {profile.employers.length > 1 && (
                    <button
                      className="btn link"
                      onClick={() =>
                        updateProfile(
                          "employers",
                          profile.employers.filter((_, idx) => idx !== i),
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid">
                  <TextInput
                    label="Hospital name"
                    value={e.hospital}
                    placeholder="e.g. University of Ilorin Teaching Hospital"
                    onChange={(v) => updateEmployer(i, { hospital: v })}
                  />
                  <TextInput
                    label="Location"
                    value={e.location}
                    placeholder="e.g. Ilorin, Nigeria"
                    onChange={(v) => updateEmployer(i, { location: v })}
                  />
                  <TextInput
                    label="Years of experience"
                    value={e.years}
                    placeholder="e.g. Over 2 years"
                    onChange={(v) => updateEmployer(i, { years: v })}
                  />
                  <TextInput
                    label="Your role"
                    value={e.role}
                    placeholder="e.g. Staff Nurse"
                    onChange={(v) => updateEmployer(i, { role: v })}
                  />
                  <TextInput
                    label="Department / setting"
                    value={e.department}
                    placeholder="e.g. Accident & Emergency"
                    onChange={(v) => updateEmployer(i, { department: v })}
                  />
                </div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={e.current}
                    onChange={(ev) => updateEmployer(i, { current: ev.target.checked })}
                  />
                  I currently work here
                </label>
              </div>
            ))}
            <button
              className="btn secondary"
              onClick={() => updateProfile("employers", [...profile.employers, emptyEmployer()])}
            >
              + Add another employer
            </button>
          </section>

          <section className="card">
            <h2>Qualifications & development</h2>
            <p className="hint">
              List everything. Only the items relevant to each job are used in that statement.
            </p>
            <TextArea
              label="Qualifications & certifications"
              hint="One per line"
              value={profile.qualifications}
              placeholder={
                "Bachelor Degree in Nursing Science\nUK Registered Adult Nurse\nBasic Life Support/CPR\nAdvanced Cardiovascular Life Support\nILS\nIntravenous Accreditation\nInfection Prevention and Control"
              }
              onChange={(v) => updateProfile("qualifications", v)}
            />
            <TextArea
              label="Continuous Professional Development (CPD)"
              hint="Comma separated or one per line"
              value={profile.cpd}
              placeholder="Duty of care, Equality and diversity, Safeguarding adults, Safeguarding children, Manual handling, Phlebotomy & venepuncture…"
              onChange={(v) => updateProfile("cpd", v)}
            />
          </section>

          <section className="card">
            <h2>Experience in detail</h2>
            <TextArea
              label="Equipment used"
              value={profile.equipment}
              placeholder="e.g. Cardiac monitors, defibrillators, infusion pumps, ECG machines, nebulisers, glucometers…"
              onChange={(v) => updateProfile("equipment", v)}
            />
            <TextArea
              label="Key achievements"
              hint="Include numbers where you have them; these become the results in your examples"
              value={profile.achievements}
              placeholder="e.g. Led a hand hygiene audit that raised compliance from 70% to 95%…"
              onChange={(v) => updateProfile("achievements", v)}
            />
            <TextArea
              label="Skills"
              value={profile.skills}
              placeholder="e.g. Triage, NEWS2 and deteriorating patient escalation, cannulation, medication administration…"
              onChange={(v) => updateProfile("skills", v)}
            />
            <TextArea
              label="Areas of expertise"
              value={profile.expertise}
              placeholder="e.g. Emergency and acute care, sepsis management, wound care, patient education…"
              onChange={(v) => updateProfile("expertise", v)}
            />
          </section>

          <div className="actions">
            <button className="btn" onClick={saveProfile}>
              Save profile
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                saveProfile();
                setTab("statement");
              }}
            >
              Save & continue →
            </button>
            {savedAt && <span className="saved">Saved at {savedAt}</span>}
          </div>
        </>
      )}

      {tab === "statement" && (
        <>
          {!profileReady && (
            <div className="notice">
              Please complete your profile first: name, at least one hospital with years of
              experience, and your qualifications.
            </div>
          )}

          <section className="card">
            <h2>The job</h2>
            <p className="hint">
              Paste the full job description and person specification from NHS Jobs, Trac or
              Jobtrain.
            </p>
            <div className="grid">
              <TextInput
                label="Job title"
                value={job.jobTitle}
                placeholder="e.g. Accident & Emergency Staff Nurse"
                onChange={(v) => updateJob("jobTitle", v)}
              />
              <TextInput
                label="Trust / employer"
                value={job.trust}
                placeholder="e.g. Royal Surrey NHS Foundation Trust"
                onChange={(v) => updateJob("trust", v)}
              />
              <TextInput
                label="Department"
                value={job.department}
                placeholder="e.g. Emergency Department"
                onChange={(v) => updateJob("department", v)}
              />
            </div>
            <TextArea
              label="Job description *"
              tall
              value={job.jobDescription}
              onChange={(v) => updateJob("jobDescription", v)}
            />
            <TextArea
              label="Person specification"
              hint="Essential and desirable criteria. Every point will be addressed."
              tall
              value={job.personSpecification}
              onChange={(v) => updateJob("personSpecification", v)}
            />
            <TextArea
              label="Trust values / behavioural framework"
              value={job.trustValues}
              placeholder="e.g. Patient-centred, Collaborative, Fair, Accountable, Empowered"
              onChange={(v) => updateJob("trustValues", v)}
            />
          </section>

          <section className="card">
            <h2>Your previous roles</h2>
            <p className="hint">
              Each job title you held and where you worked, most recent first. Your statement names
              these roles exactly as you enter them.
            </p>
            {job.previousRoles.map((r, i) => (
              <div className="employer" key={i}>
                <div className="employer-head">
                  <strong>Role {i + 1}</strong>
                  {job.previousRoles.length > 1 && (
                    <button
                      className="btn link"
                      onClick={() =>
                        updateJob(
                          "previousRoles",
                          job.previousRoles.filter((_, idx) => idx !== i),
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid">
                  <TextInput
                    label="Previous job title"
                    value={r.title}
                    placeholder="e.g. Staff Nurse"
                    onChange={(v) => updatePreviousRole(i, { title: v })}
                  />
                  <TextInput
                    label="Where you worked"
                    value={r.workplace}
                    placeholder="e.g. University of Ilorin Teaching Hospital"
                    onChange={(v) => updatePreviousRole(i, { workplace: v })}
                  />
                </div>
              </div>
            ))}
            <button
              className="btn secondary"
              style={{ marginBottom: 14 }}
              onClick={() => updateJob("previousRoles", [...job.previousRoles, emptyPreviousRole()])}
            >
              + Add another role
            </button>
            <TextArea
              label="Earlier supporting statement for this job (optional)"
              hint="If you have already written one for this job, paste it here and its best material will be used"
              tall
              value={job.existingStatement}
              onChange={(v) => updateJob("existingStatement", v)}
            />
            <div className="actions">
              <button className="btn" disabled={!canGenerate} onClick={generate}>
                {generating ? "Writing your statement…" : "Write my supporting statement"}
              </button>
              {generating && (
                <button className="btn secondary" onClick={() => abortRef.current?.abort()}>
                  Stop
                </button>
              )}
              <button
                className="btn link"
                disabled={generating}
                onClick={() => {
                  setJob(emptyJob());
                  setOutput("");
                }}
              >
                Clear job
              </button>
            </div>
          </section>

          {(output || generating || error) && (
            <section className="card">
              <h2>Your supporting statement</h2>
              {error && <p className="error">{error}</p>}
              <div className="output">{output || (generating ? "Reading the job and planning your statement…" : "")}</div>
              <div className="actions" style={{ marginTop: 12 }}>
                <span className={`meta ${words >= 1200 && words <= 1500 ? "good" : ""}`}>
                  {words.toLocaleString("en-GB")} words
                </span>
                <button className="btn secondary" disabled={!output || generating} onClick={copy}>
                  {copied ? "Copied ✓" : "Copy"}
                </button>
                <button className="btn secondary" disabled={!output || generating} onClick={download}>
                  Download .txt
                </button>
                <button className="btn secondary" disabled={!canGenerate} onClick={generate}>
                  Regenerate
                </button>
              </div>
              {output && !generating && (
                <p className="meta" style={{ marginTop: 12 }}>
                  Read it through before submitting and adjust any example so it accurately
                  reflects your own experience. You may be asked about each one at interview.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
