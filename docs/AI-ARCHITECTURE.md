# EduNexus AI Assistant Architecture

## Flow

```
User (Admin/Teacher UI)
    → POST /api/chat  [JWT required, rate limited]
        → Hugging Face (Qwen2.5-7B-Instruct)
        → JSON tool_call parsed
        → POST /tools/execute  [JWT + role guard]
            → Prisma → PostgreSQL
        → Second HF call with tool result
    → SSE stream of final reply (token-by-token) + tool metadata in UI
```

## Security

| Layer | Protection |
|--------|------------|
| `/api/chat` | Bearer JWT, ADMIN/TEACHER only, 20 req/min per user, SSE response |
| `/tools/execute` | Bearer JWT, role-based tool allowlist |
| Teachers | Cannot call `add_student` or `get_fee_report` |

## Tools

| Tool | Admin | Teacher | Description |
|------|:-----:|:-------:|-------------|
| `get_students_by_class` | ✓ | ✓ | List students in a class |
| `get_student_by_name` | ✓ | ✓ | Student profile by name (grades, attendance, fees) |
| `get_attendance_report` | ✓ | ✓ | Attendance by date/status/class |
| `get_top_students` | ✓ | ✓ | Top N by grade average |
| `get_class_summary` | ✓ | ✓ | Count + average grade |
| `get_notices` | ✓ | ✓ | Last 5 notices |
| `get_fee_report` | ✓ | — | Collection rate & totals |
| `add_student` | ✓ | — | Create student record |

## Routes

- Admin: `/dashboard/admin/ai-assistant`
- Teacher: `/dashboard/teacher/ai-assistant`
- Legacy `/dashboard/chat` redirects by role

## Environment

- `HUGGINGFACE_API_KEY` — required for chat
- `JWT_SECRET` — must match frontend and backend
