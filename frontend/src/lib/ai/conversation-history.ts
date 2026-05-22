export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export const MAX_CONVERSATION_HISTORY = 6;

/** Keep the last N user/assistant turns for Hugging Face context limits. */
export function trimConversationHistory(
  history: HistoryMessage[]
): HistoryMessage[] {
  return history.slice(-MAX_CONVERSATION_HISTORY);
}
