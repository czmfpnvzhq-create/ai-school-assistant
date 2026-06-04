import { HfInference } from "@huggingface/inference";

// Initialize Hugging Face Inference client with the API Key
const apiKey = process.env.HUGGINGFACE_API_KEY;

if (!apiKey) {
  console.warn("Warning: HUGGINGFACE_API_KEY is not defined in the environment.");
}

export const hf = new HfInference(apiKey);

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Generates an AI completion using Mistral-7B-Instruct-v0.3.
 * 
 * @param messages List of conversation messages (system, user, assistant).
 * @param temperature Sampling temperature (0.0 to 1.0).
 * @param maxTokens Maximum number of generated tokens.
 */
export async function generateSchoolAssistantResponse(
  messages: ChatMessage[],
  temperature: number = 0.5, // lower temperature for more deterministic output
  maxTokens: number = 150 // reduce token budget to speed up response
) {
  // Abort after 30 seconds – prevents the UI from waiting minutes
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: messages as any,
      max_tokens: maxTokens,
      temperature: temperature,
      // Pass the abort signal to the underlying fetch (HfInference uses fetch under the hood)
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return {
      success: true,
      text: response.choices[0]?.message?.content || "",
      usage: response.usage,
    };
  } catch (error) {
    clearTimeout(timeout);
    const err = error as Error;
    // If the request was aborted, give a friendly timeout message
    if (err.name === "AbortError") {
      console.warn("Hugging Face request timed out after 30s");
      return {
        success: false,
        text: "The AI service is taking longer than expected. Please try again in a moment.",
        error: "Timeout",
      };
    }
    console.error("Hugging Face API call failed:", err);
    return {
      success: false,
      text: "I am having trouble connecting to the AI system at the moment. Please try again later.",
      error: err.message || String(err),
    };
  }
}
