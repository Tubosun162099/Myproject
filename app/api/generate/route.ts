import { buildUserPrompt, SYSTEM_PROMPT } from "@/lib/prompt";
import { emptyJob, emptyProfile, type JobPosting, type Profile } from "@/lib/profile";
import { describeError, hasKey, missingKeyMessage, selectProvider, streamStatement } from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  let body: { profile?: Profile; job?: JobPosting };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.profile || !body.job?.jobDescription?.trim()) {
    return Response.json(
      { error: "A profile and a job description are required." },
      { status: 400 },
    );
  }
  // Fill any missing fields so a partial request can't crash the prompt builder.
  const profile: Profile = { ...emptyProfile(), ...body.profile };
  const job: JobPosting = { ...emptyJob(), ...body.job };

  const provider = selectProvider();
  if (!provider || !hasKey(provider)) {
    return Response.json({ error: missingKeyMessage(provider) }, { status: 500 });
  }

  const abort = new AbortController();
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const text of streamStatement(
          provider,
          SYSTEM_PROMPT,
          buildUserPrompt(profile, job),
          abort.signal,
        )) {
          controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        if (!abort.signal.aborted) {
          console.error(err);
          controller.enqueue(encoder.encode(`\n\n[${describeError(provider, err)}]`));
        }
      }
      try {
        controller.close();
      } catch {
        // Already closed because the client disconnected.
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
