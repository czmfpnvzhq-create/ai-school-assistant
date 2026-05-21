export const toolDefinitions = {
  get_students_by_class: {
    description: "Get all students enrolled in a specific class",
    params: { class_name: "string (required) - e.g. Class 6, Class 7" },
  },
  get_student_by_name: {
    description:
      "Look up one student by full or partial name — returns class, grades, attendance summary, and fees",
    params: { name: "string (required) - e.g. Ahmed Raza" },
  },
  get_attendance_report: {
    description: "Get attendance records filtered by date and optionally by status or class",
    params: {
      date: "string (required) - format YYYY-MM-DD, default to today if omitted by user",
      status: "string (optional) - absent | present | late",
      class_name: "string (optional)",
    },
  },
  add_student: {
    description: "Add a new student to the database (admin only)",
    params: {
      name: "string (required)",
      class_name: "string (required)",
    },
  },
  get_top_students: {
    description: "Get top N students ranked by grade average in a class",
    params: {
      class_name: "string (required)",
      limit: "number (required, default 5)",
    },
  },
  get_class_summary: {
    description: "Get total student count and average grade for a class",
    params: { class_name: "string (required)" },
  },
  get_fee_report: {
    description: "Get school-wide fee collection summary (admin only)",
    params: {},
  },
  get_notices: {
    description: "Get the last 5 school notices with title and date",
    params: {},
  },
} as const;

export type ToolName = keyof typeof toolDefinitions;

export interface GetStudentsByClassArgs {
  class_name: string;
}

export interface GetStudentByNameArgs {
  name: string;
}

export interface GetAttendanceReportArgs {
  date: string;
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
