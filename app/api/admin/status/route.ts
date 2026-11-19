import { deny, explain, isAdmin, openai } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  const job = new URL(req.url).searchParams.get("job");
  if (!job) return Response.json({ error: "Missing job." }, { status: 400 });
  try {
    const v = await openai().videos.retrieve(job);
    return Response.json({
      status: v.status,
      progress: v.progress,
      error: v.error?.message ?? null,
    });
  } catch (err) {
    return Response.json({ error: explain(err) }, { status: 502 });
  }
}
