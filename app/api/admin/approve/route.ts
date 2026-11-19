import { revalidatePath } from "next/cache";
import { deny, explain, isAdmin, isKind, openai, setupProblem } from "@/lib/admin";
import { saveVideo } from "@/lib/videos";

export const maxDuration = 60;

/** Copies an approved video from OpenAI (where it expires) into permanent storage. */
export async function POST(req: Request) {
  if (!isAdmin(req)) return deny();
  const problem = setupProblem();
  if (problem) return Response.json({ error: problem }, { status: 503 });
  const { kind, id, job } = await req.json();
  if (!isKind(kind) || typeof id !== "string" || typeof job !== "string") {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  try {
    const res = await openai().videos.downloadContent(job);
    const url = await saveVideo(kind, id, job, await res.arrayBuffer());
    revalidatePath(`/${kind === "exercise" ? "exercises" : "equipment"}/${id}`);
    return Response.json({ url });
  } catch (err) {
    return Response.json({ error: explain(err) }, { status: 502 });
  }
}
