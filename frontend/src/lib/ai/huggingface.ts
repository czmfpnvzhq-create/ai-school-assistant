import { InferenceClient } from "@huggingface/inference";
import { assertHfApiKey, getHfApiKey } from "./get-hf-api-key";

/** Try auto router first, then hf-inference for the same model. */
const CHAT_MODELS: Array<{ model: string; provider?: "hf-inference" }> = [
  { model: "Qwen/Qwen2.5-7B-Instruct" },
  { model: "Qwen/Qwen2.5-7B-Instruct", provider: "hf-inference" },
  { model: "meta-llama/Llama-3.2-3B-Instruct" },
  { model: "meta-llama/Llama-3.2-3B-Instruct", provider: "hf-inference" },
];

type ChatMessage = { role: string; content: string };

function createClient() {
  const accessToken = assertHfApiKey();
  return new InferenceClient(accessToken);
}

function mapHfError(err: Error): Error {
  const msg = err.message.toLowerCase();

  if (msg.includes("expired")) {
    return new Error(
      "Hugging Face API token has expired. Create a new token at https://huggingface.co/settings/tokens, update HUGGINGFACE_API_KEY in frontend/.env.local (no quotes), then restart npm run dev."
    );
  }

  if (
    msg.includes("invalid username or password") ||
    msg.includes("invalid credentials") ||
    msg.includes("unauthorized")
  ) {
    return new Error(
      "Hugging Face rejected the API token (invalid or revoked). Create a NEW token at https://huggingface.co/settings/tokens — use a Fine-grained token with “Make calls to Inference Providers”, or a classic token with Read access. Paste it as HUGGINGFACE_API_KEY=hf_... in frontend/.env.local with NO quotes, then restart npm run dev."
    );
  }

  if (!getHfApiKey()) {
    return new Error(
      "Hugging Face API key is missing. Set HUGGINGFACE_API_KEY in frontend/.env.local and restart the dev server."
    );
  }

  return err;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Streams the final assistant reply token-by-token via Hugging Face chatCompletionStream.
 * Falls back to askAI + word simulation if streaming is unavailable.
 */
export async function* streamAI(
  messages: ChatMessage[],
  retries = 2
): AsyncGenerator<string> {
  const client = createClient();
  let lastError: Error | null = null;

  for (const { model, provider } of CHAT_MODELS) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        let yielded = false;
        const hfStream = client.chatCompletionStream({
          model,
          provider,
          messages: messages as Parameters<
            InferenceClient["chatCompletionStream"]
          >[0]["messages"],
          max_tokens: 500,
          temperature: 0.1,
        });

        for await (const chunk of hfStream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            yielded = true;
            yield delta;
          }
        }

        if (yielded) return;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = mapHfError(err);
        console.error(
          `[HF stream] ${model} attempt ${attempt}/${retries} failed:`,
          err.message
        );

        const lower = err.message.toLowerCase();
        if (lower.includes("loading") && attempt < retries) {
          await sleep(8000);
          continue;
        }

        if (
          lower.includes("invalid") ||
          lower.includes("expired") ||
          lower.includes("unauthorized")
        ) {
          break;
        }
      }
    }
  }

  const full = await askAI(messages, retries);
  yield* simulateStreamText(full);
}

/** Simulates streaming when HF stream is unavailable or for direct_reply text. */
export async function* simulateStreamText(
  text: string,
  delayMs = 30
): AsyncGenerator<string> {
  const parts = text.split(/(\s+)/).filter((p) => p.length > 0);
  for (const part of parts) {
    yield part;
    await sleep(delayMs);
  }
}

/**
 * Non-streaming call — used for tool-calling decision pass only.
 */
export async function askAI(
  messages: ChatMessage[],
  retries = 2
): Promise<string> {
  const client = createClient();
  let lastError: Error | null = null;

  for (const { model, provider } of CHAT_MODELS) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await client.chatCompletion({
          model,
          provider,
          messages: messages as Parameters<
            InferenceClient["chatCompletion"]
          >[0]["messages"],
          max_tokens: 500,
          temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (content) return content;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = mapHfError(err);
        console.error(
          `[HF] ${model} attempt ${attempt}/${retries} failed:`,
          err.message
        );

        const lower = err.message.toLowerCase();
        if (lower.includes("loading") && attempt < retries) {
          await sleep(8000);
          continue;
        }

        if (
          lower.includes("invalid") ||
          lower.includes("expired") ||
          lower.includes("unauthorized")
        ) {
          break;
        }
      }
    }
  }

  throw (
    lastError ??
    new Error("AI service is currently unavailable. Please try again later.")
  );
}

export interface AIResponsePayload {
  action: "tool_call" | "direct_reply";
  tool?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: Record<string, any>;
  message?: string;
}

export function parseAIResponse(text: string): AIResponsePayload {
  const trimmed = text.trim();

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && "action" in parsed) {
      return parsed as AIResponsePayload;
    }
  } catch {
    // continue
  }

  try {
    const jsonRegex = /\{[\s\S]*?"action"[\s\S]*?\}/g;
    const matches = trimmed.match(jsonRegex);
    if (matches) {
      for (const match of matches) {
        try {
          const parsed = JSON.parse(match);
          if (parsed && typeof parsed === "object" && "action" in parsed) {
            return parsed as AIResponsePayload;
          }
        } catch {
          // continue
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    action: "direct_reply",
    message: text,
  };
}

export function formatToolResult(toolName: string, result: unknown): string {
  const hints: Record<string, string> = {
    get_fee_report:
      "Note: totalFees is the COUNT of fee records; collectedAmount and pendingAmount are in USD.",
    get_student_by_name:
      "If one student object is returned, summarize class, gradeAvg, attendance rate, recent grades, and fee status. If multipleMatches, list names and classes only.",
  };
  const hint = hints[toolName] ? `\n${hints[toolName]}` : "";
  return `Tool result for ${toolName}: ${JSON.stringify(result)}${hint}
Write a polished executive summary for the user (no JSON, no technical labels).`;
}
