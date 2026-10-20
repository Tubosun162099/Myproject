import Anthropic from "@anthropic-ai/sdk";
import { buildUserPrompt, SYSTEM_PROMPT } from "@/lib/prompt";
import type { JobPosting, Profile } from "@/lib/profile";

export const runtime = "nodejs";
export const maxDuration = 300;

// Strip whitespace and quotes that often get pasted in with the key.
const apiKey = process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, "");
const client = new Anthropic({ apiKey });

export async function POST(req: Request) {
  let body: { profile?: Profile; job?: JobPosting };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { profile, job } = body;
  if (!profile || !job || !job.jobDescription?.trim()) {
    return Response.json(
      { error: "A profile and a job description are required." },
      { status: 400 },
    );
  }

  if (!apiKey) {
    return Response.json(
      { error: "The server is not configured: set ANTHROPIC_API_KEY and restart." },
      { status: 500 },
    );
  }

  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 64000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(profile, job) }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("\n\n[The request could not be completed. Please review the inputs and try again.]"),
          );
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n[Output was cut short. Please try again.]"));
        }
        controller.close();
      } catch (err) {
        let message = "Something went wrong while generating the statement.";
        if (err instanceof Anthropic.AuthenticationError) {
          message =
            "Anthropic rejected the API key. Check ANTHROPIC_API_KEY in Vercel is a valid, active key starting with sk-ant-, then redeploy.";
        } else if (err instanceof Anthropic.PermissionDeniedError) {
          message =
            "The Anthropic account can't use this model. Check the account has billing set up and credit available.";
        } else if (err instanceof Anthropic.RateLimitError) {
          message = "Too many requests right now. Please wait a minute and try again.";
        } else if (err instanceof Anthropic.APIError) {
          message = `The AI service returned an error (${err.status ?? "unknown"}). Please try again.`;
        }
        console.error(err);
        controller.enqueue(encoder.encode(`\n\n[${message}]`));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
