export interface ChatStreamMeta {
  toolCalled: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolArgs: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolResult: any | null;
}

export type ChatStreamEvent =
  | { type: "meta"; meta: ChatStreamMeta }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

/** Encode one SSE event line for the chat API. */
export function encodeSseData(payload: string): Uint8Array {
  return new TextEncoder().encode(`data: ${payload}\n\n`);
}

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
          message?: string;
          toolCalled?: string | null;
          toolArgs?: Record<string, unknown> | null;
          toolResult?: unknown;
        };

        if (parsed.type === "error") {
          onEvent({
            type: "error",
            message: parsed.message ?? "Stream error",
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
