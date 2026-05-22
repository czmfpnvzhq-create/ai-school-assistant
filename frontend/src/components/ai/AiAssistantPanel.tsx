"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { AiQuickChips } from "@/components/ai/AiQuickChips";
import { Message } from "@/components/MessageBubble";
import { useAuthContext } from "@/lib/auth/AuthProvider";
import { API_BASE_URL } from "@/lib/config";
import { parseSseBuffer } from "@/lib/ai/chat-sse";
import type { ToolRunRecord } from "@/lib/ai/agent-loop";
import {
  trimConversationHistory,
  type HistoryMessage,
} from "@/lib/ai/conversation-history";
import type { AiRole } from "@/lib/ai/tool-permissions";

interface AiAssistantPanelProps {
  role: AiRole;
}

export function AiAssistantPanel({ role }: AiAssistantPanelProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<HistoryMessage[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<"thinking" | "tool" | null>(null);
  const [agentStatusTool, setAgentStatusTool] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [teacherClassName, setTeacherClassName] = useState<string | undefined>();

  useEffect(() => {
    if (role !== "TEACHER") return;

    const token = localStorage.getItem("edunexus_token");
    if (!token) return;

    fetch(`${API_BASE_URL}/dashboard/teacher-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.assignedClass?.name) {
          setTeacherClassName(data.assignedClass.name);
        }
      })
      .catch(() => {});
  }, [role]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationHistory([]);
    setError(null);
    setStreamingMessageId(null);
    setAgentStatus(null);
    setAgentStatusTool(undefined);
    setIsLoading(false);
  }, []);

  const handleSendMessage = async (content: string) => {
    setError(null);
    setIsLoading(true);
    setStreamingMessageId(null);
    setAgentStatus("thinking");
    setAgentStatusTool(undefined);

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content,
    };

    const historyWithUser: HistoryMessage[] = [
      ...conversationHistory,
      { role: "user", content },
    ];
    const payloadHistory = trimConversationHistory(historyWithUser);

    setMessages((prev) => [...prev, userMessage]);
    setConversationHistory(historyWithUser);

    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: payloadHistory,
          className: teacherClassName,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("text/event-stream")) {
        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "An unexpected API error occurred.");
        }
        const assistantMessage: Message = {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: data.reply ?? "",
          toolCalled: data.toolCalled,
          toolArgs: data.toolArgs,
          toolResult: data.toolResult,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setConversationHistory((prev) =>
          trimConversationHistory([
            ...prev,
            { role: "assistant", content: assistantMessage.content },
          ])
        );
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to start AI response stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantId: string | null = null;
      let finalContent = "";
      let metaToolsUsed: string[] = [];
      let metaToolResults: ToolRunRecord[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseBuffer(buffer, (event) => {
          if (event.type === "error") {
            throw new Error(event.message);
          }

          if (event.type === "status") {
            setAgentStatus(event.phase);
            setAgentStatusTool(event.tool);
            return;
          }

          if (event.type === "meta") {
            assistantId = Math.random().toString(36).substring(2, 9);
            setStreamingMessageId(assistantId);
            setIsLoading(false);
            setAgentStatus(null);
            setAgentStatusTool(undefined);

            metaToolsUsed = event.meta.toolsUsed ?? [];
            metaToolResults = event.meta.toolResults ?? [];

            const metaMessage: Message = {
              id: assistantId,
              role: "assistant",
              content: "",
              toolCalled: event.meta.toolCalled,
              toolArgs: event.meta.toolArgs,
              toolResult: event.meta.toolResult,
              toolsUsed: metaToolsUsed,
              toolResults: metaToolResults,
              iterations: event.meta.iterations,
            };
            setMessages((prev) => [...prev, metaMessage]);
            return;
          }

          if (event.type === "chunk" && assistantId) {
            finalContent += event.text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + event.text }
                  : m
              )
            );
            return;
          }

          if (event.type === "done") {
            setStreamingMessageId(null);
          }
        });
      }

      if (finalContent.trim()) {
        setConversationHistory((prev) =>
          trimConversationHistory([
            ...prev,
            { role: "assistant", content: finalContent },
          ])
        );
      }

      setStreamingMessageId(null);
      setAgentStatus(null);
      setAgentStatusTool(undefined);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to communicate with AI assistant."
      );
      setStreamingMessageId(null);
      setAgentStatus(null);
      setAgentStatusTool(undefined);
      setConversationHistory((prev) => prev.slice(0, -1));
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle =
    role === "ADMIN"
      ? `School-wide insights for ${user?.name ?? "Admin"}`
      : teacherClassName
      ? `${teacherClassName} · ${user?.name ?? "Teacher"}`
      : `Assistant for ${user?.name ?? "Teacher"}`;

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] min-h-[560px] max-h-[900px] animate-fade-in-up -mt-1">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
        <p className="text-sm text-slate-400">{subtitle}</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live data
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Multi-tool agent
          </span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 rounded-2xl border border-slate-800/80 bg-slate-950/40 overflow-hidden shadow-2xl shadow-black/20">
        <div className="flex flex-1 min-h-0 flex-col">
          <header className="h-12 shrink-0 border-b border-white/5 px-4 sm:px-5 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="font-medium">Chat</span>
              {messages.length > 0 && (
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                  {messages.length} message{messages.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {error && (
                <span
                  className="text-[10px] text-rose-400 max-w-[200px] truncate sm:max-w-xs"
                  title={error}
                >
                  {error}
                </span>
              )}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleNewChat}
                  disabled={isLoading || !!streamingMessageId}
                  className="text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-colors disabled:opacity-50"
                >
                  New chat
                </button>
              )}
            </div>
          </header>

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            streamingMessageId={streamingMessageId}
            agentStatus={agentStatus}
            agentStatusTool={agentStatusTool}
            userName={user?.name}
            role={role}
            onSelectQuery={handleSendMessage}
          />

          <div className="shrink-0 p-4 border-t border-white/5 bg-slate-950/60">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading || !!streamingMessageId}
              />
            </div>
          </div>
        </div>

        {messages.length === 0 && (
          <aside className="hidden lg:flex w-72 shrink-0 flex-col border-l border-white/5 bg-slate-900/30 p-5 overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Suggestions
            </h2>
            <AiQuickChips
              role={role}
              onSelect={handleSendMessage}
              disabled={isLoading || !!streamingMessageId}
              variant="grid"
            />
          </aside>
        )}
      </div>
    </div>
  );
}
