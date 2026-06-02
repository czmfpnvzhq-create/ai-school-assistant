"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/dashboard/teacher/ai-assistant/loading";

const AiAssistantPanel = dynamic(() => import("@/components/ai/AiAssistantPanel"), {
  ssr: false,
  loading: () => <Loading />, // show skeleton while loading
});

export default function TeacherAiAssistantPage() {
  return <AiAssistantPanel role="TEACHER" />;
}
