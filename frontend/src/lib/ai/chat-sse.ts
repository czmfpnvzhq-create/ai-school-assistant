import type { ToolRunRecord } from "./agent-loop";

export interface ChatStreamMeta {
  toolCalled: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolArgs: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolResult: any | null;
  toolResults?: ToolRunRecord[];
  toolsUsed?: string[];
  iterations?: number;
}

export type ChatStreamEvent =
  | { type: "status"; phase: "thinking" | "tool"; tool?: string; iteration?: number }
  | { type: "meta"; meta: ChatStreamMeta }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

/** Encode one SSE event line for the chat API. */
export function encodeSseData(payload: string): Uint8Array {
  return new TextEncoder().encode(`data: ${payload}\n\n`);
}

/** Standard SSE response headers for Next.js App Router streaming. */
export const SSE_RESPONSE_HEADERS: Record<string, string> = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

/** Parse SSE buffer from /api/chat stream. */
export function parseSseBuffer(
  buffer: string,
  onEvent: (event: ChatStreamEvent) => void
): string {
  const lines = buffer.split("\n");
  const remainder = lines.pop() ?? "";

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6);

    if (payload === "[DONE]") {
      onEvent({ type: "done" });
      continue;
    }

    if (payload.startsWith("{")) {
      try {
        const parsed = JSON.parse(payload) as {
          type?: string;
          phase?: "thinking" | "tool";
          tool?: string;
          iteration?: number;
          message?: string;
          toolCalled?: string | null;
          toolArgs?: Record<string, unknown> | null;
          toolResult?: unknown;
          toolResults?: ToolRunRecord[];
          toolsUsed?: string[];
          iterations?: number;
        };

        if (parsed.type === "error") {
          onEvent({
            type: "error",
            message: parsed.message ?? "Stream error",
          });
          continue;
        }

        if (parsed.type === "status" && parsed.phase) {
          onEvent({
            type: "status",
            phase: parsed.phase,
            tool: parsed.tool,
            iteration: parsed.iteration,
          });
          continue;
        }

        if (parsed.type === "meta") {
          onEvent({
            type: "meta",
            meta: {
              toolCalled: parsed.toolCalled ?? null,
              toolArgs: (parsed.toolArgs as ChatStreamMeta["toolArgs"]) ?? null,
              toolResult: parsed.toolResult ?? null,
              toolResults: parsed.toolResults,
              toolsUsed: parsed.toolsUsed,
              iterations: parsed.iterations,
            },
          });
          continue;
        }
      } catch {
        onEvent({ type: "chunk", text: payload });
      }
      continue;
    }

    onEvent({ type: "chunk", text: payload });
  }

  return remainder;
}
