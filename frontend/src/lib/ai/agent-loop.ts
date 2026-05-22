import {
  askAI,
  parseAIResponse,
  parseAllToolCalls,
  isToolCallOnlyResponse,
  type AIResponsePayload,
} from "./huggingface";
import { toolExecutor } from "@/lib/tools/executor";

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ToolRunRecord {
  tool: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>;
  result: unknown;
}

export interface AgentLoopResult {
  finalAnswer: string;
  toolResults: ToolRunRecord[];
  iterations: number;
}

export interface AgentLoopCallbacks {
  onThinking?: () => void;
  onToolStart?: (tool: string, iteration: number) => void;
}

const MAX_ITERATIONS = 5;

function toolCallKey(tool: string, args: Record<string, unknown>): string {
  return `${tool}:${JSON.stringify(args)}`;
}

function isValidToolCall(
  parsed: AIResponsePayload
): parsed is AIResponsePayload & { tool: string; args: Record<string, unknown> } {
  return (
    parsed.action === "tool_call" &&
    typeof parsed.tool === "string" &&
    parsed.tool.trim().length > 0
  );
}

function toFinalAnswer(parsed: AIResponsePayload, raw: string): string {
  if (isToolCallOnlyResponse(raw)) {
    return "";
  }
  if (parsed.action === "direct_reply" && parsed.message?.trim()) {
    return parsed.message.trim();
  }
  if (parseAllToolCalls(raw).length > 0) {
    return "";
  }
  return raw.trim();
}

async function executeToolCall(
  tool: string,
  args: Record<string, unknown>,
  token: string,
  seenToolCalls: Set<string>,
  toolResultsCollected: ToolRunRecord[],
  callbacks?: AgentLoopCallbacks,
  iteration?: number
): Promise<string | null> {
  const key = toolCallKey(tool, args);
  if (seenToolCalls.has(key)) {
    return `You already called ${tool} with the same arguments.`;
  }
  seenToolCalls.add(key);

  callbacks?.onToolStart?.(tool, iteration ?? toolResultsCollected.length + 1);

  let toolResult: unknown;
  try {
    toolResult = await toolExecutor(tool, args, token);
  } catch (execError) {
    toolResult = {
      error:
        execError instanceof Error
          ? execError.message
          : "Failed to execute tool.",
    };
  }

  toolResultsCollected.push({ tool, args, result: toolResult });
  return `Tool result for ${tool}: ${JSON.stringify(toolResult)}`;
}

/**
 * Multi-step agent loop: call tools until the model returns a plain-text final answer.
 * Handles multiple tool_call JSON blobs in one model response (balanced-brace parse).
 */
export async function runAgentLoop(
  userMessages: ChatMessage[],
  systemPrompt: string,
  token: string,
  callbacks?: AgentLoopCallbacks
): Promise<AgentLoopResult> {
  const conversationMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...userMessages.filter((m) => m.role === "user" || m.role === "assistant"),
  ];
  const toolResultsCollected: ToolRunRecord[] = [];
  const seenToolCalls = new Set<string>();

  callbacks?.onThinking?.();

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let aiResponse: string;

    try {
      aiResponse = await askAI(conversationMessages);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "AI request failed.";
      return {
        finalAnswer: `I could not complete that request: ${msg}`,
        toolResults: toolResultsCollected,
        iterations: iteration + 1,
      };
    }

    const toolCalls = parseAllToolCalls(aiResponse);

    if (toolCalls.length > 0) {
      conversationMessages.push({ role: "assistant", content: aiResponse });

      const resultLines: string[] = [];
      for (const call of toolCalls) {
        const line = await executeToolCall(
          call.tool,
          call.args ?? {},
          token,
          seenToolCalls,
          toolResultsCollected,
          callbacks,
          iteration + 1
        );
        if (line) resultLines.push(line);
      }

      conversationMessages.push({
        role: "user",
        content: `${resultLines.join("\n\n")}
If you need more data to fully answer the question, respond with ONLY one tool_call JSON object for the next tool.
If you have all the data you need, give your final comprehensive answer in plain text (no JSON).`,
      });
      continue;
    }

    const parsed = parseAIResponse(aiResponse);

    if (isValidToolCall(parsed)) {
      conversationMessages.push({ role: "assistant", content: aiResponse });
      const line = await executeToolCall(
        parsed.tool.trim(),
        parsed.args ?? {},
        token,
        seenToolCalls,
        toolResultsCollected,
        callbacks,
        iteration + 1
      );
      if (line) {
        conversationMessages.push({
          role: "user",
          content: `${line}
If you need more data to fully answer the question, respond with ONLY one tool_call JSON object for the next tool.
If you have all the data you need, give your final comprehensive answer in plain text (no JSON).`,
        });
      }
      continue;
    }

    const finalAnswer = toFinalAnswer(parsed, aiResponse);
    if (finalAnswer) {
      return {
        finalAnswer,
        toolResults: toolResultsCollected,
        iterations: iteration + 1,
      };
    }

    conversationMessages.push({
      role: "user",
      content:
        "Do not return raw JSON to the user. Call one tool at a time, or give your final plain-text answer now.",
    });
  }

  conversationMessages.push({
    role: "user",
    content:
      "You have reached the tool call limit. Summarize everything you found so far in one comprehensive plain-text answer for the user. Do not use JSON.",
  });

  try {
    const finalResponse = await askAI(conversationMessages);
    const finalParsed = parseAIResponse(finalResponse);
    let finalAnswer = toFinalAnswer(finalParsed, finalResponse);

    if (!finalAnswer && toolResultsCollected.length > 0) {
      finalAnswer =
        "I gathered the requested school data but could not format a summary. Please try asking again.";
    }

    return {
      finalAnswer,
      toolResults: toolResultsCollected,
      iterations: MAX_ITERATIONS,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "AI request failed.";
    return {
      finalAnswer: `I reached the tool limit. Here is what I could gather before stopping: ${msg}`,
      toolResults: toolResultsCollected,
      iterations: MAX_ITERATIONS,
    };
  }
}

/** Pick last fee report for UI card (backward compatible meta). */
export function getLastFeeToolRun(
  toolResults: ToolRunRecord[]
): ToolRunRecord | null {
  for (let i = toolResults.length - 1; i >= 0; i--) {
    if (toolResults[i].tool === "get_fee_report") return toolResults[i];
  }
  return null;
}
