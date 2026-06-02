// page.tsx – Server Component that renders the client dashboard

import TeacherDashboardClient from "./components/TeacherDashboardClient";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const revalidate = 0; // always fresh

export default function TeacherDashboardPage({
  params,
}: {
  params: { classId: string };
}) {
  return (
    <RequireAuth>
      <TeacherDashboardClient classId={params.classId} />
    </RequireAuth>
  );
}

