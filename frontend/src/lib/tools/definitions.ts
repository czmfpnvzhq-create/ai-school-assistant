export const toolDefinitions = {
  get_students_by_class: {
    description: "Get all students enrolled in a specific class",
    params: { class_name: "string (required) - e.g. Class 6, Class 7" }
  },
  get_attendance_report: {
    description: "Get attendance records filtered by date and optionally by status or class",
    params: {
      date: "string (required) - format YYYY-MM-DD",
      status: "string (optional) - absent | present | late",
      class_name: "string (optional)"
    }
  },
  add_student: {
    description: "Add a new student to the database",
    params: {
      name: "string (required)",
      class_name: "string (required)"
    }
  },
  get_top_students: {
    description: "Get top N students ranked by grade average in a class",
    params: {
      class_name: "string (required)",
      limit: "number (required, default 5)"
    }
  },
  get_class_summary: {
    description: "Get total student count and average grade for a class",
    params: { class_name: "string (required)" }
  }
} as const;

export type ToolName = keyof typeof toolDefinitions;

// TypeScript argument types for each tool

export interface GetStudentsByClassArgs {
  class_name: string;
}

export interface GetAttendanceReportArgs {
  date: string; // Format YYYY-MM-DD
  status?: "present" | "absent" | "late";
  class_name?: string;
}

export interface AddStudentArgs {
  name: string;
  class_name: string;
}

export interface GetTopStudentsArgs {
  class_name: string;
  limit: number;
}

export interface GetClassSummaryArgs {
  class_name: string;
}
