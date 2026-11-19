import { VIDEO_MODEL, deny, explain, isAdmin, openai } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Asks OpenAI whether the key works and which video models this account can use. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  if (!process.env.OPENAI_API_KEY) return Response.json({ ok: false, message: "OPENAI_API_KEY is not set in Vercel." });
  const key = process.env.OPENAI_API_KEY;
  const keyHint = `${key.slice(0, 8)}…${key.slice(-4)}`;
  try {
    const ids: string[] = [];
    for await (const m of openai().models.list()) ids.push(m.id);
    const video = ids.filter((id) => id.startsWith("sora")).sort();
    const ok = video.includes(VIDEO_MODEL);
    return Response.json({
      ok,
      keyHint,
      model: VIDEO_MODEL,
      videoModels: video,
      message: ok
        ? `Connected. Your account can use ${VIDEO_MODEL}.`
        : video.length
          ? `Connected, but ${VIDEO_MODEL} isn't available to this account. Available: ${video.join(", ")}. Set VIDEO_MODEL in Vercel to one of these.`
          : `The key works (${ids.length} models visible), but this account has no access to any Sora video model. Video generation needs to be enabled on the OpenAI account or project this key belongs to.`,
    });
  } catch (err) {
    console.error("OpenAI check failed", err);
    return Response.json({ ok: false, keyHint, message: explain(err) });
  }
}
