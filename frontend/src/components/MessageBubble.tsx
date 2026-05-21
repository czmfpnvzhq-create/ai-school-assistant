import React from "react";
import { FeeReportCard } from "@/components/ai/FeeReportCard";
import { DataSourceDetails } from "@/components/ai/DataSourceDetails";
import type { FeeReportData } from "@/lib/reports/fee-report-pdf";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalled?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolArgs?: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolResult?: any | null;
}

interface MessageBubbleProps {
  message: Message;
  userName?: string;
  isStreaming?: boolean;
}

function isFeeReportResult(
  toolName: string | null | undefined,
  result: unknown
): result is FeeReportData {
  if (toolName !== "get_fee_report" || !result || typeof result !== "object") {
    return false;
  }
  const r = result as Record<string, unknown>;
  return (
    typeof r.collectionRatePercent === "number" &&
    typeof r.collectedAmount === "number"
  );
}

function AssistantAvatar() {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-900/40 border border-indigo-400/20 shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.456 2.456z"
        />
      </svg>
    </div>
  );
}

function StreamingCursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 ml-0.5 align-middle bg-indigo-400 animate-pulse"
      aria-hidden
    />
  );
}

export function MessageBubble({
  message,
  userName,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const showFeeCard =
    !isUser && isFeeReportResult(message.toolCalled, message.toolResult);

  if (isUser) {
    return (
      <div className="flex w-full justify-end animate-fade-in-up">
        <div className="flex max-w-[min(85%,32rem)] flex-col items-end gap-1.5">
          <span className="text-[10px] font-medium text-slate-500 px-1">You</span>
          <div className="px-4 py-3 rounded-2xl rounded-tr-md bg-indigo-600 text-white text-sm leading-relaxed shadow-lg shadow-indigo-900/25 border border-indigo-500/30">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start gap-3 animate-fade-in-up">
      <AssistantAvatar />
      <div className="flex flex-col gap-2 min-w-0 flex-1 max-w-3xl">
        <span className="text-[10px] font-medium text-slate-500">
          EduNexus AI
        </span>

        <div className="rounded-2xl rounded-tl-md border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-4 py-3.5 text-sm text-slate-200 leading-relaxed shadow-sm">
          <div className="ai-message-prose whitespace-pre-wrap break-words">
            {message.content || (isStreaming ? "" : "…")}
            {isStreaming && <StreamingCursor />}
          </div>
        </div>

        {showFeeCard && !isStreaming && (
          <FeeReportCard data={message.toolResult} userName={userName} />
        )}

        {message.toolCalled && (
          <DataSourceDetails
            toolName={message.toolCalled}
            toolArgs={message.toolArgs ?? null}
            toolResult={message.toolResult ?? null}
          />
        )}
      </div>
    </div>
  );
}
