import { getToolsForRole, type AiRole } from "@/lib/ai/tool-permissions";

export interface AiUserContext {
  name: string;
  role: AiRole;
  className?: string;
}

function buildRoleIntro(ctx: AiUserContext): string {
  if (ctx.role === "ADMIN") {
    return `You are assisting admin ${ctx.name} who manages the whole school.`;
  }
  const classPart = ctx.className
    ? ` who teaches ${ctx.className}`
    : " (class assignment not found — ask admin if class-specific data is needed)";
  return `You are assisting teacher ${ctx.name}${classPart}.`;
}

/**
 * Generates the system prompt for role-aware AI tool calling.
 */
export function getSystemPrompt(todayDate: string, ctx: AiUserContext): string {
  const tools = getToolsForRole(ctx.role);
  const toolList = tools
    .map((t) => {
      switch (t) {
        case "get_students_by_class":
          return "- get_students_by_class(class_name)";
        case "get_student_by_name":
          return "- get_student_by_name(name) — use when user asks about a specific student by name (partial name OK)";
        case "get_attendance_report":
          return "- get_attendance_report(date, status?, class_name?) — use today's date if user does not specify a date";
        case "add_student":
          return "- add_student(name, class_name)";
        case "get_top_students":
          return "- get_top_students(class_name, limit)";
        case "get_class_summary":
          return "- get_class_summary(class_name)";
        case "get_fee_report":
          return "- get_fee_report() — no parameters";
        case "get_notices":
          return "- get_notices() — no parameters";
        default:
          return `- ${t}`;
      }
    })
    .join("\n");

  const teacherHint =
    ctx.role === "TEACHER" && ctx.className
      ? `\nWhen the teacher asks about "my class" or "my students", use class_name: "${ctx.className}".`
      : "";

  const adminOnlyNote =
    ctx.role === "TEACHER"
      ? "\nYou cannot add students or access fee reports. If asked, explain that only admins can do that."
      : "";

  return `${buildRoleIntro(ctx)}

You help manage student records, attendance, grades, fees, and notices.

You have access to these database tools:
${toolList}

Today's date is: ${todayDate}${teacherHint}${adminOnlyNote}

STRICT RULES:
1. You must NEVER answer questions about students, classes, attendance, grades, fees, or notices from your own memory. Always call a tool first.

2. When you need to call a tool, respond with ONLY this JSON format and nothing else:
   {"action": "tool_call", "tool": "tool_name_here", "args": {"param": "value"}}

3. For tools with no parameters, use empty args: {"action": "tool_call", "tool": "get_fee_report", "args": {}}

4. When you receive a tool result, respond with a friendly plain-text executive summary based only on that data. Use clear paragraphs and bullet points when helpful. Format money as USD (e.g. $130,000). Never show raw JSON, field names, or "System Protocol" text to the user.

   For get_fee_report results:
   - totalFees = total number of fee records (not a dollar amount)
   - collectedAmount / pendingAmount = dollar totals
   - Mention collection rate, collected vs pending amounts, and how many records are still pending
   - Example tone: "Fee collection is at 65%. You have collected $130,000 with $70,000 still outstanding across 14 unpaid records (40 fee records in total)."

5. If a user request does not match any tool, respond with:
   {"action": "direct_reply", "message": "your reply here"}

6. After adding a student, always confirm the name and class.

7. For attendance questions without a date, use today's date (${todayDate}).

8. When the user asks for a specific student by name (e.g. "Ahmed Raza", "data for Ahmad"), always call get_student_by_name with that name. Do not guess class or grades. If multiple matches are returned, list them and ask which student they mean.

Available classes are: Class 6, Class 7, Class 8, Class 10`;
}
