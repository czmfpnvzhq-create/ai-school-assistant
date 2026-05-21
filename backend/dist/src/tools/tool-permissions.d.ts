export declare const ALL_TOOLS: readonly ["get_students_by_class", "get_attendance_report", "add_student", "get_top_students", "get_class_summary", "get_fee_report", "get_notices"];
export type ToolName = (typeof ALL_TOOLS)[number];
export declare const ADMIN_TOOLS: ToolName[];
export declare const TEACHER_TOOLS: ToolName[];
export declare function isToolAllowedForRole(role: string, toolName: string): boolean;
