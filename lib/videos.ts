import "server-only";
import { list, put } from "@vercel/blob";

/** Approved demo videos, saved once and shown to everyone. */
export type VideoKind = "exercise" | "equipment";
export type SavedVideo = { url: string; approvedAt: string };
export type VideoManifest = Record<VideoKind, Record<string, SavedVideo>>;

const MANIFEST = "videos/manifest.json";
const empty = (): VideoManifest => ({ exercise: {}, equipment: {} });

export const storageReady = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Reads the saved-video list. Never throws: a missing store just means no videos yet. */
export async function getManifest(opts: { fresh?: boolean } = {}): Promise<VideoManifest> {
  if (!storageReady()) return empty();
  try {
    const { blobs } = await list({ prefix: MANIFEST, limit: 1 });
    const blob = blobs.find((b) => b.pathname === MANIFEST);
    if (!blob) return empty();
    const res = await fetch(`${blob.url}?v=${new Date(blob.uploadedAt).getTime()}`, opts.fresh
      ? { cache: "no-store" }
      : { next: { revalidate: 60 } });
    if (!res.ok) return empty();
    return { ...empty(), ...(await res.json()) };
  } catch {
    return empty();
  }
}

export async function getVideo(kind: VideoKind, id: string) {
  return (await getManifest())[kind][id]?.url;
}

async function saveManifest(m: VideoManifest) {
  await put(MANIFEST, JSON.stringify(m), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

export async function saveVideo(kind: VideoKind, id: string, jobId: string, mp4: ArrayBuffer) {
  const file = await put(`videos/${kind}/${id}-${jobId}.mp4`, mp4, {
    access: "public",
    contentType: "video/mp4",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  const m = await getManifest({ fresh: true });
  m[kind][id] = { url: file.url, approvedAt: new Date().toISOString() };
  await saveManifest(m);
  return file.url;
}

export async function removeVideo(kind: VideoKind, id: string) {
  const m = await getManifest({ fresh: true });
  delete m[kind][id];
  await saveManifest(m);
}
