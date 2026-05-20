import { HfInference } from "@huggingface/inference";

// Initialize Hugging Face Inference client with the API Key
const apiKey = process.env.HUGGINGFACE_API_KEY;

if (!apiKey) {
  console.warn("Warning: HUGGINGFACE_API_KEY is not defined in the environment.");
}

export const hf = new HfInference(apiKey);

/**
 * Sends a conversation chat history to the Hugging Face Inference API
 * using the Mistral-7B-Instruct-v0.3 model with strict prompt formatting.
 * 
 * @param messages List of conversation messages (system, user, assistant).
 */
export async function askAI(messages: { role: string; content: string }[], retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await hf.chatCompletion({
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: messages,
        max_tokens: 500,
        temperature: 0.1, // Set to 0.1 for high determinism in simulated tool calling
      });

      return (response.choices[0]?.message?.content || "").trim();
    } catch (error) {
      const err = error as Error;
      console.error(`[Attempt ${attempt}/${retries}] Hugging Face Inference call failed:`, err.message);
      
      const errorMessage = err.message?.toLowerCase() || "";
      // If error indicates the model is cold starting/loading, wait 10s and retry
      if (errorMessage.includes("loading") && attempt < retries) {
        console.log("Hugging Face model is cold starting. Waiting 10 seconds before retrying...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
        continue;
      }
      
      if (attempt === retries) {
        throw new Error("AI service is currently busy or warming up. Please try again in a few moments.");
      }
      
      throw err;
    }
  }
  throw new Error("AI service request failed.");
}

/**
 * Parsed structure of the AI response.
 */
export interface AIResponsePayload {
  action: "tool_call" | "direct_reply";
  tool?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: Record<string, any>;
  message?: string;
}

/**
 * Resiliently extracts and parses the JSON action-response envelope returned by the AI.
 * 
 * @param text The raw output text returned by the model.
 */
export function parseAIResponse(text: string): AIResponsePayload {
  const trimmed = text.trim();

  // 1. Try to parse the entire text block directly as JSON
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && "action" in parsed) {
      return parsed as AIResponsePayload;
    }
  } catch {
    // Proceed to extraction regex
  }

  // 2. Use regex to search for standard JSON objects in the response (handles markdown wrappers or intro text)
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
          // Keep searching other matches
        }
      }
    }
  } catch {
    // Ignore regex faults
  }

  // 3. Fall back to returning the raw response as a direct reply
  return {
    action: "direct_reply",
    message: text,
  };
}

/**
 * Formats a database execution result so the AI can parse and respond in plain text.
 * 
 * @param toolName The name of the executed database tool.
 * @param result The JSON results returned from the database execution layer.
 */
export function formatToolResult(toolName: string, result: unknown): string {
  return `Tool result for ${toolName}: ${JSON.stringify(result)}
Now provide a friendly response to the user based only on this data.`;
}
