import { deny, explain, isAdmin, openai } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Streams a finished, not-yet-approved video so it can be reviewed. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  // <video> can't send headers, so the preview link carries the password as a query value.
  const headers = new Headers(req.headers);
  headers.set("x-admin-password", url.searchParams.get("key") ?? "");
  if (!isAdmin(new Request(req.url, { headers }))) return deny();
  const job = url.searchParams.get("job");
  if (!job) return Response.json({ error: "Missing job." }, { status: 400 });
  try {
    const res = await openai().videos.downloadContent(job);
    return new Response(res.body, { headers: { "content-type": "video/mp4", "cache-control": "private, no-store" } });
  } catch (err) {
    return Response.json({ error: explain(err) }, { status: 502 });
  }
}
