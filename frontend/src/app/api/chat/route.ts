import { NextResponse } from "next/server";
import { getSystemPrompt, type AiUserContext } from "@/lib/prompts/system";
import {
  askAI,
  parseAIResponse,
  formatToolResult,
  streamAI,
  simulateStreamText,
} from "@/lib/ai/huggingface";
import { toolExecutor } from "@/lib/tools/executor";
import { verifyChatToken } from "@/lib/ai/verify-chat-token";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { encodeSseData } from "@/lib/ai/chat-sse";
import type { AiRole } from "@/lib/ai/tool-permissions";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  className?: string;
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

export async function POST(req: Request) {
  try {
    const user = await verifyChatToken(req.headers.get("authorization"));
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }

    const role = user.role.toUpperCase();
    if (role !== "ADMIN" && role !== "TEACHER") {
      return NextResponse.json(
        {
          error:
            "Forbidden: AI assistant is only available for admin and teacher roles",
        },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(user.id);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rate.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = (await req.json()) as ChatRequestBody;
    const { messages, className } = body;

    if (!messages?.length) {
      return NextResponse.json(
        { error: "Invalid request payload. Expected a non-empty messages array." },
        { status: 400 }
      );
    }

    const token = req.headers.get("authorization")!.split(" ")[1];
    const todayDate = new Date().toLocaleDateString("en-CA");

    const ctx: AiUserContext = {
      name: user.name,
      role: role as AiRole,
      className: role === "TEACHER" ? className : undefined,
    };

    const systemPrompt = getSystemPrompt(todayDate, ctx);
    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const stream = new ReadableStream({
      async start(controller) {
        const sendData = (payload: string) => {
          controller.enqueue(encodeSseData(payload));
        };

        const sendError = (message: string) => {
          sendData(JSON.stringify({ type: "error", message }));
          sendData("[DONE]");
          controller.close();
        };

        try {
          const timeoutAt = Date.now() + 60_000;

          const aiResponse = await Promise.race([
            askAI(fullMessages),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 60_000)
            ),
          ]);

          if (Date.now() > timeoutAt) {
            sendError("AI service request timed out. Please try again.");
            return;
          }

          const parsed = parseAIResponse(aiResponse);

          let toolCalledName: string | null = null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let toolArgsData: Record<string, any> | null = null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let toolResultData: any = null;

          let streamMessages = [...fullMessages];

          if (parsed.action === "tool_call" && parsed.tool) {
            toolCalledName = parsed.tool;
            toolArgsData = parsed.args || {};

            try {
              toolResultData = await toolExecutor(
                toolCalledName,
                toolArgsData,
                token
              );
            } catch (execError) {
              const err = execError as Error;
              toolResultData = {
                error: err.message || "Failed to execute tool.",
              };
            }

            const resultMessage = formatToolResult(
              toolCalledName,
              toolResultData
            );
            streamMessages.push({ role: "assistant", content: aiResponse });
            streamMessages.push({ role: "user", content: resultMessage });
          } else if (parsed.action === "direct_reply" && parsed.message) {
            sendData(
              JSON.stringify({
                type: "meta",
                toolCalled: null,
                toolArgs: null,
                toolResult: null,
              })
            );

            for await (const chunk of simulateStreamText(parsed.message)) {
              if (Date.now() > timeoutAt) {
                sendError("AI service request timed out. Please try again.");
                return;
              }
              sendData(chunk);
            }

            sendData("[DONE]");
            controller.close();
            return;
          } else {
            sendData(
              JSON.stringify({
                type: "meta",
                toolCalled: null,
                toolArgs: null,
                toolResult: null,
              })
            );

            for await (const chunk of simulateStreamText(
              "I could not understand that. Please try rephrasing."
            )) {
              sendData(chunk);
            }

            sendData("[DONE]");
            controller.close();
            return;
          }

          sendData(
            JSON.stringify({
              type: "meta",
              toolCalled: toolCalledName,
              toolArgs: toolArgsData,
              toolResult: toolResultData,
            })
          );

          for await (const chunk of streamAI(streamMessages)) {
            if (Date.now() > timeoutAt) {
              sendError("AI service request timed out. Please try again.");
              return;
            }
            if (chunk) sendData(chunk);
          }

          sendData("[DONE]");
          controller.close();
        } catch (error) {
          const err = error as Error;
          const message =
            err.message === "Timeout"
              ? "AI service request timed out. Please try again."
              : err.message || "AI service unavailable, try again";
          sendError(message);
        }
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "AI service unavailable, try again" },
      { status: 500 }
    );
  }
}
