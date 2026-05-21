"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth/AuthProvider";

/** Legacy route — redirects to role-specific AI assistant */
export default function LegacyChatRedirect() {
  const router = useRouter();
  const { user, hydrated } = useAuthContext();

  useEffect(() => {
    if (!hydrated) return;
    const role = user?.role?.toLowerCase();
    if (role === "admin") router.replace("/dashboard/admin/ai-assistant");
    else if (role === "teacher") router.replace("/dashboard/teacher/ai-assistant");
    else router.replace("/login");
  }, [hydrated, user, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}
