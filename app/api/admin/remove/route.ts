import { revalidatePath } from "next/cache";
import { deny, isAdmin, isKind } from "@/lib/admin";
import { removeVideo } from "@/lib/videos";

export async function POST(req: Request) {
  if (!isAdmin(req)) return deny();
  const { kind, id } = await req.json();
  if (!isKind(kind) || typeof id !== "string") return Response.json({ error: "Bad request." }, { status: 400 });
  await removeVideo(kind, id);
  revalidatePath(`/${kind === "exercise" ? "exercises" : "equipment"}/${id}`);
  return Response.json({ ok: true });
}
