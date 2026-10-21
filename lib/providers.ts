import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Strip whitespace and quotes that often get pasted in with a key.
const cleanKey = (v: string | undefined) => v?.trim().replace(/^["']|["']$/g, "") || undefined;

const anthropicKey = cleanKey(process.env.ANTHROPIC_API_KEY);
const openaiKey = cleanKey(process.env.OPENAI_API_KEY);
const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5.5";

export type ProviderName = "anthropic" | "openai";

// AI_PROVIDER picks one explicitly; otherwise use whichever key is set,
// preferring Anthropic when both are.
export function selectProvider(): ProviderName | null {
  const forced = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (forced === "anthropic" || forced === "openai") return forced;
  if (anthropicKey) return "anthropic";
  if (openaiKey) return "openai";
  return null;
}

export function missingKeyMessage(provider: ProviderName | null): string {
  if (provider === "anthropic") return "AI_PROVIDER is anthropic but ANTHROPIC_API_KEY is not set.";
  if (provider === "openai") return "AI_PROVIDER is openai but OPENAI_API_KEY is not set.";
  return "The server is not configured: set ANTHROPIC_API_KEY or OPENAI_API_KEY and redeploy.";
}

export function hasKey(provider: ProviderName): boolean {
  return provider === "anthropic" ? !!anthropicKey : !!openaiKey;
}

/** Streams statement text. A trailing "[...]" notice is yielded for non-fatal endings. */
export async function* streamStatement(
  provider: ProviderName,
  system: string,
  user: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  if (provider === "anthropic") {
    const client = new Anthropic({ apiKey: anthropicKey });
    const stream = client.beta.messages.stream(
      {
        model: "claude-opus-5-5",
        max_tokens: 64000,
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system,
        messages: [{ role: "user", content: user }],
      },
      { signal },
    );
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      yield "\n\n[The request could not be completed. Please review the inputs and try again.]";
    } else if (final.stop_reason === "max_tokens") {
      yield "\n\n[Output was cut short. Please try again.]";
    }
    return;
  }

  const client = new OpenAI({ apiKey: openaiKey });
  const stream = client.responses.stream(
    {
      model: OPENAI_MODEL,
      instructions: system,
      input: user,
      reasoning: { effort: "medium" },
      max_output_tokens: 32000,
    },
    { signal },
  );
  for await (const event of stream) {
    if (event.type === "response.output_text.delta") yield event.delta;
  }
  const final = await stream.finalResponse();
  if (final.status === "incomplete") {
    yield final.incomplete_details?.reason === "max_output_tokens"
      ? "\n\n[Output was cut short. Please try again.]"
      : "\n\n[The request could not be completed. Please review the inputs and try again.]";
  }
}

/** A user-facing explanation for a failed request. Never includes key contents. */
export function describeError(provider: ProviderName, err: unknown): string {
  if (provider === "anthropic") {
    const key = anthropicKey ?? "";
    if (err instanceof Anthropic.AuthenticationError) {
      return key.startsWith("sk-ant-")
        ? `Anthropic rejected the API key. It has the right format (sk-ant-…, ${key.length} characters) but is not active: it may have been deleted, copied incompletely, or belong to a different account. Create a new key, update ANTHROPIC_API_KEY in Vercel, then redeploy.`
        : "The ANTHROPIC_API_KEY in Vercel is not an Anthropic key: Anthropic keys start with sk-ant-. Create one at console.anthropic.com, update the variable in Vercel, then redeploy.";
    }
    if (err instanceof Anthropic.PermissionDeniedError) {
      return "The Anthropic account can't use this model. Check the account has billing set up and credit available.";
    }
    if (err instanceof Anthropic.RateLimitError) {
      return "Too many requests right now. Please wait a minute and try again.";
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return "Couldn't reach Anthropic. Please try again in a moment.";
    }
    if (err instanceof Anthropic.APIError) {
      return `The AI service returned an error (${err.status ?? "unknown"}). Please try again.`;
    }
  } else {
    const key = openaiKey ?? "";
    if (err instanceof OpenAI.AuthenticationError) {
      return key.startsWith("sk-")
        ? `OpenAI rejected the API key. It has the right format (sk-…, ${key.length} characters) but is not active: it may have been deleted, copied incompletely, or belong to a different account. Create a new key, update OPENAI_API_KEY in Vercel, then redeploy.`
        : "The OPENAI_API_KEY in Vercel is not an OpenAI key: OpenAI keys start with sk-. Create one at platform.openai.com, update the variable in Vercel, then redeploy.";
    }
    if (err instanceof OpenAI.RateLimitError) {
      return err.code === "insufficient_quota"
        ? "The OpenAI account has no credit left. Add credit under Billing at platform.openai.com, then try again."
        : "Too many requests right now. Please wait a minute and try again.";
    }
    if (err instanceof OpenAI.PermissionDeniedError || err instanceof OpenAI.NotFoundError) {
      return `The OpenAI account can't use the model "${OPENAI_MODEL}". Check billing at platform.openai.com, or set OPENAI_MODEL in Vercel to a model the account can use.`;
    }
    if (err instanceof OpenAI.APIConnectionError) {
      return "Couldn't reach OpenAI. Please try again in a moment.";
    }
    if (err instanceof OpenAI.APIError) {
      return `The AI service returned an error (${err.status ?? "unknown"}). Please try again.`;
    }
  }
  return "Something went wrong while generating the statement.";
}
