import { VIDEO_MODEL, deny, explain, isAdmin, isKind, openai, setupProblem } from "@/lib/admin";
import { buildPrompt } from "@/lib/videoPrompt";

export async function POST(req: Request) {
  if (!isAdmin(req)) return deny();
  const problem = setupProblem();
  if (problem) return Response.json({ error: problem }, { status: 503 });
  const { kind, id } = await req.json();
  const prompt = isKind(kind) && typeof id === "string" ? buildPrompt(kind, id) : null;
  if (!prompt) return Response.json({ error: "Unknown exercise or machine." }, { status: 400 });
  try {
    const job = await openai().videos.create({ model: VIDEO_MODEL, prompt, seconds: "8", size: "1280x720" });
    return Response.json({ job: job.id, status: job.status, progress: job.progress });
  } catch (err) {
    return Response.json({ error: explain(err) }, { status: 502 });
  }
}
