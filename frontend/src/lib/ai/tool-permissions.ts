export const ADMIN_TOOLS = [
  "get_students_by_class",
  "get_student_by_name",
  "get_attendance_report",
  "add_student",
  "get_top_students",
  "get_class_summary",
  "get_fee_report",
  "get_notices",
] as const;

export const TEACHER_TOOLS = [
  "get_students_by_class",
  "get_student_by_name",
  "get_attendance_report",
  "get_top_students",
  "get_class_summary",
  "get_notices",
] as const;

export type AiRole = "ADMIN" | "TEACHER";

export function getToolsForRole(role: AiRole): readonly string[] {
  return role === "ADMIN" ? ADMIN_TOOLS : TEACHER_TOOLS;
}
