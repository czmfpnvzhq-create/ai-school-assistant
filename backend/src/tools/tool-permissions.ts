export const ALL_TOOLS = [
  'get_students_by_class',
  'get_student_by_name',
  'get_attendance_report',
  'add_student',
  'get_top_students',
  'get_class_summary',
  'get_fee_report',
  'get_notices',
] as const;

export type ToolName = (typeof ALL_TOOLS)[number];

/** Admin can use every tool */
export const ADMIN_TOOLS: ToolName[] = [...ALL_TOOLS];

/** Teacher: read-only school tools (no fees, no add student) */
export const TEACHER_TOOLS: ToolName[] = [
  'get_students_by_class',
  'get_student_by_name',
  'get_attendance_report',
  'get_top_students',
  'get_class_summary',
  'get_notices',
];

export function isToolAllowedForRole(role: string, toolName: string): boolean {
  const normalized = role?.toUpperCase();
  if (normalized === 'ADMIN') {
    return ADMIN_TOOLS.includes(toolName as ToolName);
  }
  if (normalized === 'TEACHER') {
    return TEACHER_TOOLS.includes(toolName as ToolName);
  }
  return false;
}
