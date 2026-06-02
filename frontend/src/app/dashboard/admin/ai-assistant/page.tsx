"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/dashboard/admin/ai-assistant/loading";

const AiAssistantPanel = dynamic(() => import("@/components/ai/AiAssistantPanel"), {
  ssr: false,
  loading: () => <Loading />,
});

export default function AdminAiAssistantPage() {
  return <AiAssistantPanel role="ADMIN" />;
}
