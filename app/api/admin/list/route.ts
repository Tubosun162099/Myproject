import { deny, isAdmin, setupProblem } from "@/lib/admin";
import { getManifest } from "@/lib/videos";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!process.env.ADMIN_PASSWORD) return Response.json({ error: setupProblem() }, { status: 503 });
  if (!isAdmin(req)) return deny();
  return Response.json({ setupProblem: setupProblem(), videos: await getManifest({ fresh: true }) });
}
