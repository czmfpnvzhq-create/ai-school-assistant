# EduNexus — AI School Management System

Full-stack school management platform with role-based dashboards and a **secured AI assistant** that queries live PostgreSQL data via tool calling.

## Stack

| Layer | Tech |
|--------|------|
| Frontend | Next.js 14, React, Tailwind |
| Backend | NestJS, Prisma |
| Database | PostgreSQL |
| AI | Hugging Face (Qwen2.5-7B-Instruct) |

## Features

- **Roles:** Admin, Teacher, Student, Parent
- **Modules:** Students, Teachers, Classes, Attendance, Grades, Fees, Notices
- **AI Assistant:** Admin & Teacher only — natural language → database tools → grounded answers

## Quick Start

```bash
# Backend
cd backend
npm install
npx prisma db push
npx prisma db seed
npx ts-node update-demo.ts   # links demo accounts to seed data
npm run start:dev            # http://localhost:4000

# Frontend
cd frontend
npm install
# Copy .env.example → .env.local and set NEXT_PUBLIC_API_URL, JWT_SECRET, HUGGINGFACE_API_KEY
npm run dev                  # http://localhost:3000

# Verify Hugging Face token (after setting .env.local):
node scripts/validate-hf-token.mjs
```

### Hugging Face API key (required for AI chat)

1. Open [Hugging Face tokens](https://huggingface.co/settings/tokens) and create a **new** token.
2. **Fine-grained token:** enable **“Make calls to Inference Providers”** (or use a classic token with **Read**).
3. In `frontend/.env.local` set **without quotes**:
   `HUGGINGFACE_API_KEY=hf_your_new_token`
4. Remove duplicate `HUGGINGFACE_API_KEY` from `frontend/.env` if you use `.env.local`.
5. **Restart** `npm run dev` (env is only read at startup).

If the UI shows *“Invalid username or password”*, admin login is fine — the **HF token** is expired or revoked. Run `node scripts/validate-hf-token.mjs` until it prints `SUCCESS`.

### Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edunexus.com | admin123 |
| Teacher | teacher@edunexus.com | teacher123 |
| Student | student@edunexus.com | student123 |
| Parent | parent@edunexus.com | parent123 |

## Documentation

- **[PROJECT-MASTER-GUIDE.md](docs/PROJECT-MASTER-GUIDE.md)** — full project reference (read this to remember everything)
- [AI-ARCHITECTURE.md](docs/AI-ARCHITECTURE.md) — AI flow, security, tool matrix

## AI Assistant

**Try asking:**
- "How many students are absent today?"
- "What is the fee collection rate?" (admin)
- "List all recent notices"
- "Show me top 5 students in Class 10"

## Tests

```bash
cd frontend
node test-chat-auth.mjs   # verifies /api/chat returns 401 without token
```

## Portfolio highlights

- JWT-secured AI pipeline with role-based tool permissions
- Simulated function calling with structured JSON (no hallucinated student data)
- Stale-while-revalidate caching on dashboards
- Monorepo: NestJS API + Next.js App Router
