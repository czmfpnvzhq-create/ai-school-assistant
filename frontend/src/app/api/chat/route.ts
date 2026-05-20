import { NextResponse } from "next/server";
import { getSystemPrompt } from "@/lib/prompts/system";
import { askAI, parseAIResponse, formatToolResult } from "@/lib/ai/huggingface";
import { toolExecutor } from "@/lib/tools/executor";

/**
 * Interface representing a standard chat message.
 */
interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  // Flag this route to execute dynamically on every request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second gateway timeout

  try {
    // 1. Parse request body
    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: "Invalid request payload. Expected a non-empty messages array." },
        { status: 400 }
      );
    }

    // 2. Load today's date and inject it into the school assistant system prompt
    // We format as YYYY-MM-DD in local time
    const todayDate = new Date().toLocaleDateString("en-CA");
    const systemPrompt = getSystemPrompt(todayDate);

    // Prepend the system prompt to the messages list
    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Create a 60-second Promise timeout race to enforce step requirements
    const routeExecutionPromise = (async () => {
      // 3. Call askAI to prompt the model
      const aiResponse = await askAI(fullMessages);

      // 4. Parse the AI response to extract simulated tool calls
      const parsed = parseAIResponse(aiResponse);

      let finalReply = "";
      let toolCalledName: string | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let toolArgsData: Record<string, any> | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let toolResultData: any = null;

      // 5. Check if the AI wants to run a database query (simulated tool call)
      if (parsed.action === "tool_call" && parsed.tool) {
        toolCalledName = parsed.tool;
        toolArgsData = parsed.args || {};

        console.log("🤖 AI wants to call tool:", toolCalledName, toolArgsData);

        // Execute the database query inside a try/catch.
        // If it fails, we return the error content back to the AI so it can explain the issue to the user.
        try {
          toolResultData = await toolExecutor(toolCalledName, toolArgsData);
        } catch (execError) {
          const err = execError as Error;
          toolResultData = { error: err.message || "Failed to execute tool query." };
        }

        // Format the database result for the model
        const resultMessage = formatToolResult(toolCalledName, toolResultData);

        // Push the conversation trace (both AI's tool request and database result) into chat history
        fullMessages.push({ role: "assistant", content: aiResponse });
        fullMessages.push({ role: "user", content: resultMessage });

        // Prompt the AI once more to translate the structured data into a friendly reply
        finalReply = await askAI(fullMessages);
      } else if (parsed.action === "direct_reply" && parsed.message) {
        // 6. Direct plain text reply
        finalReply = parsed.message;
      } else {
        finalReply = "I could not understand that. Please try rephrasing.";
      }

      // 7. Return the final structured JSON payload
      return {
        reply: finalReply,
        toolCalled: toolCalledName,
        toolArgs: toolArgsData,
        toolResult: toolResultData,
      };
    })();

    // Race the route execution against a 60-second timeout reject
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 60000)
    );

    const resultPayload = await Promise.race([routeExecutionPromise, timeoutPromise]);
    clearTimeout(timeoutId);

    return NextResponse.json(resultPayload);
  } catch (error) {
    clearTimeout(timeoutId);
    const err = error as Error;
    console.error("❌ Error inside School Assistant Chat API Route:", err);

    // 8. Graceful error handling envelopes
    if (err.message === "Timeout") {
      return NextResponse.json(
        { error: "AI service request timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "AI service unavailable, try again" },
      { status: 500 }
    );
  }
}
