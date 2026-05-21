"use client";

import React from "react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  // This layout simply renders its children; the parent DashboardLayout provides the overall UI.
  return <>{children}</>;
}
