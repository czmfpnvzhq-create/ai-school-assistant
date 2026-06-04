import { NextResponse } from 'next/server';

// Tell Vercel the maximum time this route is allowed to run.
// Hobby (free) tier cap is 60 s — keep internal timeout ≤ this.
export const maxDuration = 60;
import { getCache, setCache, getCacheKey } from '@/lib/ai/cache';
import { verifyChatToken } from '@/lib/ai/verify-chat-token';
import type { AiUserContext } from '@/lib/prompts/system';
import { runAgentLoop, getLastFeeToolRun, type ChatMessage } from '@/lib/ai/agent-loop';
import { getSystemPrompt } from '@/lib/prompts/system';
import { simulateStreamText } from '@/lib/ai/huggingface';
import { encodeSseData, SSE_RESPONSE_HEADERS } from '@/lib/ai/chat-sse';
import { trimConversationHistory } from '@/lib/ai/conversation-history';
import type { AiRole } from '@/lib/ai/tool-permissions';
import { checkRateLimit } from '@/lib/ai/rate-limit';

interface ChatRequestBody {
  messages: ChatMessage[];
  className?: string;
}

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
    // Compute cache key based on messages (excluding system prompts)
    const cacheKey = getCacheKey(messages);
    const cachedAnswer = getCache(cacheKey);
    if (cachedAnswer) {
      // Stream cached answer quickly
      const stream = new ReadableStream({
        async start(controller) {
          const sendData = (payload: string) => controller.enqueue(encodeSseData(payload));
          // Send meta placeholder (no tool usage)
          sendData(JSON.stringify({ type: "meta", toolCalled: null, toolArgs: null, toolResult: null, toolResults: [], toolsUsed: [], iterations: 0 }));
          // Stream the cached answer text
          for await (const chunk of simulateStreamText(cachedAnswer)) {
            sendData(chunk);
          }
          sendData("[DONE]");
          controller.close();
        },
      });
      return new Response(stream, { headers: SSE_RESPONSE_HEADERS });
    }

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

    // Client sends user/assistant only — system prompt is added server-side in runAgentLoop
    const history = trimConversationHistory(
      messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    );

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

        sendData(JSON.stringify({ type: "status", phase: "thinking" }));

        try {
          const timeoutAt = Date.now() + 58_000; // Must be < Vercel 60 s cap

          const agentResult = await Promise.race([
            runAgentLoop(history, systemPrompt, token, {
              onThinking: () => {
                sendData(JSON.stringify({ type: "status", phase: "thinking" }));
              },
              onToolStart: (tool, iteration) => {
                sendData(
                  JSON.stringify({
                    type: "status",
                    phase: "tool",
                    tool,
                    iteration,
                  })
                );
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 58_000) // Must be < Vercel 60 s cap
            ),
          ]);

          if (Date.now() > timeoutAt) {
            sendError("AI service request timed out. Please try again.");
            return;
          }

          const toolsUsed = agentResult.toolResults.map((t) => t.tool);
          const lastFee = getLastFeeToolRun(agentResult.toolResults);

          sendData(
            JSON.stringify({
              type: "meta",
              toolCalled: lastFee?.tool ?? toolsUsed[toolsUsed.length - 1] ?? null,
              toolArgs: lastFee?.args ?? agentResult.toolResults.at(-1)?.args ?? null,
              toolResult:
                lastFee?.result ?? agentResult.toolResults.at(-1)?.result ?? null,
              toolResults: agentResult.toolResults,
              toolsUsed,
              iterations: agentResult.iterations,
            })
          );

          const answerText =
              agentResult.finalAnswer.trim() ||
              "I retrieved the school data but could not generate a summary. Please try again.";
            // Cache the answer for future requests
            setCache(cacheKey, answerText);
            for await (const chunk of simulateStreamText(answerText)) {
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

    return new Response(stream, { headers: SSE_RESPONSE_HEADERS });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "AI service unavailable, try again" },
      { status: 500 }
    );
  }
}
