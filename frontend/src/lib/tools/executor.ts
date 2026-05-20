import { API_BASE_URL } from "../config";

/**
 * Executes a simulated database tool/function call with safe, clean JSON returns.
 * Delegates executing the query to the NestJS backend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function toolExecutor(toolName: string, toolArgs: Record<string, any>): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/tools/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toolName, toolArgs }),
    });

    if (!res.ok) {
      throw new Error(`NestJS backend error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    const err = error as Error;
    console.error(`[ToolExecutor] Error delegating to NestJS:`, err);
    return { error: err.message || "An internal error occurred during tool execution delegation." };
  }
}
