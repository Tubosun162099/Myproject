import "server-only";
import OpenAI from "openai";
import { timingSafeEqual } from "node:crypto";

/** Checks the admin password sent from the private /admin page. */
export function isAdmin(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  const given = req.headers.get("x-admin-password") ?? "";
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const deny = () => Response.json({ error: "Wrong admin password." }, { status: 401 });

export function setupProblem(): string | null {
  if (!process.env.ADMIN_PASSWORD) return "ADMIN_PASSWORD is not set in Vercel.";
  if (!process.env.OPENAI_API_KEY) return "OPENAI_API_KEY is not set in Vercel.";
  if (!process.env.BLOB_READ_WRITE_TOKEN) return "Video storage (Vercel Blob) is not connected yet. You can generate and preview videos, but Approve won't work until it is.";
  return null;
}

export const openai = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const VIDEO_MODEL = process.env.VIDEO_MODEL || "sora-2";

/** Turns OpenAI errors into a plain sentence for the admin page. */
export function explain(err: unknown): string {
  if (err instanceof OpenAI.APIError) {
    console.error("OpenAI error", err.status, err.requestID, err.message);
    if (err.status === 404) return "OpenAI couldn't find the video model for this key (404). Usually this means video generation (Sora) isn't enabled for this OpenAI account or project. See the connection check above.";
    if (err.status === 401) return "OpenAI rejected the API key. Check OPENAI_API_KEY in Vercel.";
    if (err.status === 429) return "OpenAI says you are out of credit or sending too many requests. Check billing on platform.openai.com.";
    if (err.status === 403) return "This OpenAI account doesn't have access to video generation yet.";
    return `OpenAI error (${err.status}): ${err.message}`;
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

export const isKind = (k: unknown): k is "exercise" | "equipment" => k === "exercise" || k === "equipment";
