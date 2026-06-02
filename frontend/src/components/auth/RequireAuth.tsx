"use client";

import { useAuthContext } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, hydrated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !token) {
      // Not authenticated -> redirect to login page
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  // While checking or redirecting, render nothing
  if (!hydrated || !token) {
    return null;
  }
  return <>{children}</>;
}
