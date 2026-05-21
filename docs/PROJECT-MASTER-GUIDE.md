# EduNexus — Complete Project Master Guide

**Read this document before interviews, client calls, portfolio updates, or when you return to the project after a break.**

This is your single source of truth for the **AI School Assistant** monorepo (branded **EduNexus** in the UI).

---

## Table of contents

1. [What this project is](#1-what-this-project-is)
2. [Tech stack](#2-tech-stack)
3. [Repository structure](#3-repository-structure)
4. [How to run locally](#4-how-to-run-locally)
5. [Environment variables](#5-environment-variables)
6. [Database & Prisma](#6-database--prisma)
7. [Authentication & security](#7-authentication--security)
8. [User roles & demo accounts](#8-user-roles--demo-accounts)
9. [Backend API (NestJS)](#9-backend-api-nestjs)
10. [Frontend (Next.js)](#10-frontend-nextjs)
11. [AI Assistant (agentic part)](#11-ai-assistant-agentic-part)
12. [AI tools reference](#12-ai-tools-reference)
13. [Key files cheat sheet](#13-key-files-cheat-sheet)
14. [Common bugs & fixes](#14-common-bugs--fixes)
15. [How to add a new AI tool](#15-how-to-add-a-new-ai-tool)
16. [Performance optimizations already done](#16-performance-optimizations-already-done)
17. [Portfolio & freelancing pitch](#17-portfolio--freelancing-pitch)
18. [Roadmap ideas (top 5%)](#18-roadmap-ideas-top-5)

---

## 1. What this project is

**EduNexus** is a **full-stack school management system** for a single school (demo: Pakistani school context).

| Piece | Purpose |
|--------|---------|
| **Admin** | Manage students, teachers, classes, attendance, grades, fees, notices; school-wide stats |
| **Teacher** | Attendance, grades, notices for their class; AI assistant (no fees / no add student) |
| **Student** | View own grades, attendance, notices |
| **Parent** | View linked child’s grades, attendance, fees, notices |
| **AI Assistant** | Admin & Teacher ask questions in natural language → **real database queries** via tools → grounded answers + PDF for fees |

**Important distinction for clients:** The AI does **not** invent student data. It calls **tools** that run **Prisma queries** on PostgreSQL. That is **agentic AI** / **tool calling**, not a generic ChatGPT wrapper.

**Your stack story (1 year MERN → agentic):** Next.js + NestJS + PostgreSQL + Hugging Face + JWT + role-based tools.

---

## 2. Tech stack

| Layer | Technology | Version / notes |
|--------|------------|-----------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind | Port **3000** |
| Backend | NestJS, Prisma | Port **4000** |
| Database | PostgreSQL (e.g. Neon cloud) | `DATABASE_URL` |
| Auth | JWT (`jsonwebtoken` backend, `jose` frontend), bcrypt passwords | Same `JWT_SECRET` both sides |
| AI | Hugging Face Inference API — `InferenceClient`, models like **Qwen2.5-7B-Instruct** | Key only on **frontend** server (`/api/chat`) |
| PDF | jsPDF + jspdf-autotable | Fee report download from AI UI |

**Not MERN:** There is no Express and no MongoDB. You use **NestJS** (similar role to Express) and **PostgreSQL** (stronger for relational school data).

---

## 3. Repository structure

```
ai-school-assistant/
├── backend/                 # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma    # DB models
│   │   └── seed.ts          # Demo data (classes, students, 30 days attendance, etc.)
│   ├── update-demo.ts       # Links demo logins to real student/teacher rows
│   └── src/
│       ├── auth/            # login, register, JWT guard
│       ├── dashboard/       # role-specific stats endpoints
│       ├── students/        # CRUD + detail with grades/attendance/fees
│       ├── teachers/        # CRUD
│       ├── classes/         # CRUD
│       ├── attendance/      # mark + reports
│       ├── grades/          # enter grades + reports
│       ├── fees/            # list + mark paid
│       ├── notices/         # CRUD
│       └── tools/           # AI tool execution (executeTool)
│
├── frontend/                # Next.js app
│   ├── src/app/             # Pages (App Router)
│   ├── src/components/      # UI (chat, dashboard, parent, AI)
│   ├── src/lib/             # API client, auth, AI, prompts, PDF
│   └── src/app/api/chat/    # Next.js API route → Hugging Face
│
└── docs/
    ├── AI-ARCHITECTURE.md
    └── PROJECT-MASTER-GUIDE.md   # ← this file
```

---

## 4. How to run locally

### First-time setup

```bash
# Terminal 1 — Backend
cd backend
npm install
npx prisma db push
npx prisma db seed
npx ts-node update-demo.ts
npm run start:dev
# → http://127.0.0.1:4000

# Terminal 2 — Frontend
cd frontend
npm install
# Create .env.local (see section 5)
npm run dev
# → http://localhost:3000
```

### Every day

1. Start **backend** first (frontend calls it).
2. Start **frontend**.
3. Login at `/login`.

### Verify AI token

```bash
cd frontend
node scripts/validate-hf-token.mjs
```

Must print `SUCCESS` before AI chat works.

---

## 5. Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon or local) |
| `JWT_SECRET` | Signs login tokens — **must match frontend** |
| `PORT` | Optional, default `4000` |

### Frontend (`frontend/.env.local` — preferred)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Sometimes duplicated for Prisma in frontend scripts; main DB is backend |
| `JWT_SECRET` | Verifies JWT in `/api/chat` and middleware |
| `HUGGINGFACE_API_KEY` | `hf_...` — **no quotes**, renew if expired |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:4000` (use 127.0.0.1 on Windows to avoid DNS lag) |

**Never commit real keys to GitHub.** Use `.env.example` as template.

---

## 6. Database & Prisma

### Models (tables)

| Model | What it stores |
|-------|----------------|
| **User** | Login accounts (ADMIN, TEACHER, STUDENT, PARENT) — separate from Teacher table |
| **Class** | Class 6, 7, 8, 10 + head teacher name string |
| **Student** | Name, class, gradeAvg, parentEmail, phone, address |
| **Teacher** | Staff record linked to optional `classId` |
| **Attendance** | Per student per day: `present` \| `absent` \| `late` |
| **Grade** | Per student per subject + score + examDate |
| **Fee** | amount, paid boolean, dueDate, paidAt |
| **Notice** | title, content, postedBy |

### Relationships you must remember

- One **Student** → one **Class**
- One **Student** → many **Attendance**, **Grade**, **Fee**
- **User** (login) is NOT the same as **Student** (record). Demo student login is linked via `update-demo.ts` to student "Muhammad Hamza".
- **Parent** login sees child data where `student.parentEmail` = parent’s email (`parent@edunexus.com` after update-demo).

### Seed data (`prisma/seed.ts`)

- **4 classes:** Class 6, 7, 8, 10
- **10 students per class** (40 total) — includes **Ahmed Raza** in Class 6 (not "Ahmad")
- **30 school days** of attendance per student (Sundays excluded)
- **5 subjects** per student: English, Math, Science, Urdu, Islamiyat
- **1 fee** per student (~60% paid)
- **5 notices**
- **4 demo users:** admin, teacher, student, parent

### `update-demo.ts` (run after seed)

| Action | Why |
|--------|-----|
| Student user name → Muhammad Hamza | Student dashboard matches a real row |
| Muhammad Hamza’s `parentEmail` → parent@edunexus.com | Parent portal has data |
| First teacher row email → teacher@edunexus.com | Teacher dashboard + AI class context |

---

## 7. Authentication & security

### Login flow

1. User submits email/password on `/login`.
2. Frontend `POST /auth/login` → NestJS validates bcrypt hash.
3. Backend returns **JWT** + user payload `{ id, name, email, role }`.
4. Frontend stores:
   - `localStorage`: `edunexus_token`, `edunexus_user`
   - **Cookie:** `token=...` (for Next.js middleware on `/dashboard/*`)

### Request auth

- Dashboard pages: middleware checks cookie JWT (`jose` verify).
- API calls to NestJS: `Authorization: Bearer <token>` from localStorage.
- AI chat: `POST /api/chat` with Bearer token; `verifyChatToken` in `lib/ai/verify-chat-token.ts`.

### Role protection

| Area | Rule |
|------|------|
| Sidebar links | Built per role in `Sidebar.tsx` |
| NestJS modules | Controllers use `JwtAuthGuard` where needed |
| AI `/api/chat` | Only **ADMIN** and **TEACHER** |
| AI tools `/tools/execute` | `isToolAllowedForRole()` — teachers cannot use `get_fee_report` or `add_student` |

### AI rate limit

- **20 requests per minute per user** (`lib/ai/rate-limit.ts`, in-memory).

---

## 8. User roles & demo accounts

| Role | Email | Password | Main routes |
|------|-------|----------|-------------|
| Admin | admin@edunexus.com | admin123 | `/dashboard/admin/*` |
| Teacher | teacher@edunexus.com | teacher123 | `/dashboard/teacher/*` |
| Student | student@edunexus.com | student123 | `/dashboard/student/*` |
| Parent | parent@edunexus.com | parent123 | `/dashboard/parent/*` |

### What each role can do in the UI

**Admin:** Full CRUD modules + AI + fee reports + all stats.

**Teacher:** Dashboard, attendance, grades, notices, AI (class-scoped hints in prompt).

**Student:** Own grades, attendance, notices.

**Parent:** Child’s grades, attendance, fees, notices (child linked by `parentEmail`).

---

## 9. Backend API (NestJS)

Base URL: `http://127.0.0.1:4000`

### Auth

| Method | Path | Body |
|--------|------|------|
| POST | `/auth/login` | `{ email, password }` |
| POST | `/auth/register` | `{ name, email, password, role }` |

### Dashboard (stats for home pages)

| Method | Path | Role |
|--------|------|------|
| GET | `/dashboard/admin-stats` | Admin KPIs, charts data |
| GET | `/dashboard/teacher-stats` | Teacher class + stats |
| GET | `/dashboard/student-stats` | Student personal stats |
| GET | `/dashboard/parent-stats` | Child grades, attendance, fees |

### CRUD modules

| Prefix | Examples |
|--------|----------|
| `/students` | GET list, GET `:id` (full profile), POST, PUT, DELETE |
| `/teachers` | GET, POST, PUT, DELETE |
| `/classes` | GET, POST, PUT, DELETE |
| `/attendance` | GET, POST, GET `report` |
| `/grades` | GET, POST, GET `report` |
| `/fees` | GET, PUT `:id/pay` |
| `/notices` | GET, POST, DELETE |

### AI tools (used by chat only)

| Method | Path | Body |
|--------|------|------|
| POST | `/tools/execute` | `{ toolName, toolArgs }` + Bearer JWT |

Implementation: `backend/src/tools/tools.service.ts` → `executeTool()` switch per tool name.

---

## 10. Frontend (Next.js)

### Important routes

| Path | Page |
|------|------|
| `/` | Landing redirect |
| `/login`, `/register` | Auth |
| `/dashboard/admin` | Admin home |
| `/dashboard/admin/students` | Student list |
| `/dashboard/admin/students/[id]` | Student detail |
| `/dashboard/admin/ai-assistant` | **AI chat (admin)** |
| `/dashboard/teacher/ai-assistant` | **AI chat (teacher)** |
| `/dashboard/chat` | Redirects to role-specific AI URL |
| `/dashboard/parent/grades` | Parent child grades |
| `/dashboard/parent/attendance` | Parent attendance |
| `/dashboard/parent/fees` | Parent fees |

### Core frontend patterns

| Pattern | File |
|---------|------|
| Auth state | `lib/auth/AuthProvider.tsx` — loads localStorage in `useEffect` (fixes hydration) |
| API + cache | `lib/api/client.ts` — `apiGet` with TTL, deduped in-flight |
| Config | `lib/config.ts` — `API_BASE_URL` |
| Hydration-safe UI | `lib/hooks/useMounted.ts` — sidebar placeholder until mount |

### AI UI components

| Component | Role |
|-----------|------|
| `AiAssistantPanel.tsx` | Main chat page wrapper |
| `ChatWindow.tsx` | Messages + empty state + quick chips |
| `ChatInput.tsx` | Send box |
| `MessageBubble.tsx` | User vs AI layout |
| `FeeReportCard.tsx` | Visual fee summary + PDF button |
| `DataSourceDetails.tsx` | Collapsed raw tool JSON (debug) |

---

## 11. AI Assistant (agentic part)

### End-to-end flow (memorize this for interviews)

```
1. User types question in browser (Admin/Teacher)
2. Frontend POST /api/chat
   - Headers: Authorization Bearer JWT
   - Body: { messages: [...], className? }  // className for teachers
3. route.ts validates JWT, role, rate limit
4. Builds system prompt (getSystemPrompt) with role + tool list + today's date
5. askAI() → Hugging Face chatCompletion
6. Model returns JSON like:
   {"action":"tool_call","tool":"get_fee_report","args":{}}
7. parseAIResponse() extracts JSON
8. toolExecutor() → POST backend /tools/execute with same JWT
9. Prisma runs query → returns real data
10. formatToolResult() added as user message; second askAI() call
11. Model returns plain English answer
12. Frontend shows reply + FeeReportCard if fee tool + optional "Show source data"
```

### Why fee questions work but name lookup failed before

- **Fee:** tool `get_fee_report` existed.
- **"Ahmad Raza":** no tool existed; seed name is **Ahmed Raza**. Now tool `get_student_by_name` exists.

### System prompt rules (`lib/prompts/system.ts`)

- Never answer school data from memory — **must call a tool**.
- Tool call = **only JSON**, no extra text.
- After tool result = friendly summary, no raw JSON to user.
- Teachers: cannot add students or fee reports.

### Hugging Face notes

- Key in `frontend/.env.local` only (server-side route).
- Errors: expired token, invalid token → run `validate-hf-token.mjs`.
- Client: `InferenceClient` in `lib/ai/huggingface.ts`, tries multiple models.

---

## 12. AI tools reference

| Tool name | Admin | Teacher | Args | Returns |
|-----------|:-----:|:-------:|------|---------|
| `get_students_by_class` | ✓ | ✓ | `class_name` | List of students in class |
| `get_student_by_name` | ✓ | ✓ | `name` | Full profile OR multiple matches |
| `get_attendance_report` | ✓ | ✓ | `date`, `status?`, `class_name?` | Attendance rows |
| `get_top_students` | ✓ | ✓ | `class_name`, `limit` | Top by gradeAvg |
| `get_class_summary` | ✓ | ✓ | `class_name` | Count + average grade |
| `get_notices` | ✓ | ✓ | `{}` | Last 5 notices |
| `get_fee_report` | ✓ | — | `{}` | Collection %, amounts, counts |
| `add_student` | ✓ | — | `name`, `class_name` | Creates student |

**Permissions duplicated in:**

- `backend/src/tools/tool-permissions.ts`
- `frontend/src/lib/ai/tool-permissions.ts`

**Definitions / docs:**

- `frontend/src/lib/tools/definitions.ts`

### Example questions → tool

| User asks | Tool |
|-----------|------|
| Fee collection rate? | `get_fee_report` |
| Show Ahmed Raza data | `get_student_by_name` |
| Absent today? | `get_attendance_report` + today's date |
| Top 5 in Class 10 | `get_top_students` |
| List Class 8 students | `get_students_by_class` |
| Add Ali to Class 7 | `add_student` (admin only) |

---

## 13. Key files cheat sheet

| If you need to… | Open this file |
|-----------------|----------------|
| Change AI personality / rules | `frontend/src/lib/prompts/system.ts` |
| Add DB query for AI | `backend/src/tools/tools.service.ts` |
| Allow tool for role | `backend/src/tools/tool-permissions.ts` + frontend copy |
| Change chat API behavior | `frontend/src/app/api/chat/route.ts` |
| Change HF models / retries | `frontend/src/lib/ai/huggingface.ts` |
| Fee PDF | `frontend/src/lib/reports/fee-report-pdf.ts` |
| Admin dashboard numbers | `backend/src/dashboard/dashboard.service.ts` |
| Parent portal data | same file → `getParentStats()` |
| Login | `backend/src/auth/auth.service.ts`, `frontend/src/app/(auth)/login/page.tsx` |
| Seed data | `backend/prisma/seed.ts` |
| Link demo accounts | `backend/update-demo.ts` |
| Sidebar menu | `frontend/src/components/dashboard/Sidebar.tsx` |
| Route protection | `frontend/src/middleware.ts` |

---

## 14. Common bugs & fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| AI: Invalid username or password | Bad/expired `HUGGINGFACE_API_KEY` | New token on HF, update `.env.local`, restart `npm run dev` |
| AI 401 | No token / wrong JWT_SECRET | Login again; sync JWT_SECRET backend + frontend |
| AI 403 | Student/Parent opened AI | Only Admin/Teacher |
| Student name not found | Typo (Ahmed vs Ahmad) or backend not restarted | Use **Ahmed Raza**; restart backend after tool changes |
| Parent portal empty | Did not run `update-demo.ts` | Run after seed |
| Hydration error | localStorage in SSR | Already fixed via AuthProvider + useMounted |
| Slow admin dashboard | Cold DB | Admin stats cached 60s server-side + frontend apiGet TTL |
| `schema.prisma` wrong content | File was overwritten | Use `backend/prisma/schema.prisma` (restored from Prisma client) |

---

## 15. How to add a new AI tool

**Example:** `get_teacher_list`

1. **Backend** `tools.service.ts` — add `case "get_teacher_list":` with Prisma query.
2. **Backend** `tool-permissions.ts` — add to `ALL_TOOLS` and `ADMIN_TOOLS` / `TEACHER_TOOLS`.
3. **Frontend** `lib/ai/tool-permissions.ts` — same lists.
4. **Frontend** `lib/tools/definitions.ts` — description + params.
5. **Frontend** `lib/prompts/system.ts` — add line in tool list + usage rule.
6. **Optional:** `formatToolResult` hint in `huggingface.ts`.
7. **Restart backend** + test in AI Assistant.
8. Update `docs/AI-ARCHITECTURE.md` table.

---

## 16. Performance optimizations already done

| Area | What |
|------|------|
| Backend admin stats | Parallel Prisma queries, 60s in-memory cache |
| Backend | `compression` gzip |
| Frontend dashboards | Removed double auth spinner; middleware handles auth |
| Frontend API | `apiGet` memory cache + in-flight deduplication |
| Frontend charts | Recharts lazy-loaded (`AdminAttendanceChart`) |
| Middleware | Narrow matcher — only `/dashboard/*` and `/api/chat` |

---

## 17. Portfolio & freelancing pitch

### One-line pitch

> Full-stack school ERP with four role-based portals and a secured AI assistant that answers from live PostgreSQL data via tool calling—not hallucinations.

### Stack to say aloud

Next.js 14 · NestJS · Prisma · PostgreSQL · JWT · Hugging Face Inference · TypeScript · Tailwind

### Proof points for Upwork/LinkedIn

1. **Multi-role SaaS** (Admin / Teacher / Student / Parent)
2. **Agentic AI** with 8 tools + RBAC on tools
3. **PDF export** from AI fee report
4. **Realistic seed** (40 students, 30 days attendance)
5. **Security:** JWT, rate limit, server-side HF key

### What to show in demo video

1. Login as admin
2. Dashboard KPIs
3. AI: fee question → answer + PDF
4. AI: "Show data for Ahmed Raza"
5. Parent portal grades (parent login)

### Do NOT put in public repo

- `.env` / `.env.local` with real `DATABASE_URL`, `JWT_SECRET`, `HUGGINGFACE_API_KEY`

---

## 18. Roadmap ideas (top 5%)

**High impact next:**

- [ ] Deploy live demo (Vercel + Railway/Render)
- [ ] Playwright E2E: login → AI → PDF
- [ ] README architecture diagram + 90s Loom video
- [ ] Student profile card in AI UI (like fee card)
- [ ] Audit log (admin actions)
- [ ] Timetable module
- [ ] Email fee reminder (mock or Resend)
- [ ] OpenAPI / Swagger on NestJS
- [ ] More write tools (mark fee paid via AI with confirm step)

**Positioning:** You are not "an AI chatbot developer" — you are a **full-stack developer who integrates AI agents with existing databases securely**.

---

## Quick reference card (print this)

```
PORTS:     Frontend 3000 | Backend 4000
ADMIN:     admin@edunexus.com / admin123
AI URL:    /dashboard/admin/ai-assistant
HF CHECK:  node frontend/scripts/validate-hf-token.mjs
SEED:      npx prisma db seed && npx ts-node update-demo.ts
AI FLOW:   User → /api/chat → HF → tool → /tools/execute → Prisma → HF → UI
CLASS 6:   Ahmed Raza is a seeded student name
```

---

*Last updated: reflects project state including `get_student_by_name`, fee PDF, and UI refresh. Keep this file updated when you add modules or tools.*
