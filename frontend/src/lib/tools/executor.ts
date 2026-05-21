import { API_BASE_URL } from "../config";

/**
 * Executes a database tool via the secured NestJS backend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function toolExecutor(
  toolName: string,
  toolArgs: Record<string, any>,
  authToken: string
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/tools/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ toolName, toolArgs }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        (data as { message?: string }).message ||
        (data as { error?: string }).error ||
        res.statusText;
      return { error: msg };
    }

    return data;
  } catch (error) {
    const err = error as Error;
    console.error(`[ToolExecutor] Error delegating to NestJS:`, err);
    return {
      error: err.message || "An internal error occurred during tool execution.",
    };
  }
}
