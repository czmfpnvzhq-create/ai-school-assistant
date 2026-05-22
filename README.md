# EduNexus

**AI-powered school management** — multi-role dashboards, live PostgreSQL data, and an **agentic assistant** that calls real tools (not a ChatGPT wrapper).

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Hugging Face](https://img.shields.io/badge/AI-Qwen2.5--7B-yellow?style=flat-square)](https://huggingface.co/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

> **Live demo:** _Add your Vercel URL after deploy — see [DEPLOYMENT-FREE.md](docs/DEPLOYMENT-FREE.md)_

---

## Why this project stands out (top-tier portfolio)

Most “AI school apps” are chat UIs on top of static prompts. EduNexus is built like a **production SaaS**:

| Differentiator | What it proves |
|----------------|----------------|
| **Agentic tool loop** | Model plans → calls `get_top_students`, `get_attendance_report`, etc. → synthesizes grounded answers |
| **Zero hallucinated students** | AI only speaks from Prisma/PostgreSQL via NestJS tools |
| **4-role RBAC** | JWT on every route; per-role AI tool allowlists |
| **Streaming UX** | SSE status (`thinking`, `tool`) + streamed final reply |
| **Real school context** | Urdu names, PKR fees, Class 6–10 seed data |
| **Full stack ownership** | Next.js 14 App Router + NestJS API + Prisma + landing page |

**Ideal for:** Upwork portfolio, LinkedIn featured project, MERN→agentic career pivot story.

---

## Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edunexus.com | admin123 |
| Teacher | teacher@edunexus.com | teacher123 |
| Student | student@edunexus.com | student123 |
| Parent | parent@edunexus.com | parent123 |

**Try the AI (admin/teacher):**

- *“Who are the top students in Class 6 and what is their attendance this week?”*
- *“What is the fee collection rate?”*
- *“Find student Ahmed Raza”*

---

## Screenshots

_Add after deploy: `docs/screenshots/landing.png`, `dashboard.png`, `ai-assistant.png`_

| Landing | Admin dashboard | AI assistant |
|---------|-----------------|--------------|
| _pending_ | _pending_ | _pending_ |

---

## Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js 14, React 18, Tailwind, App Router |
| Backend | NestJS 11, Prisma, JWT, bcrypt |
| Database | PostgreSQL (Neon-compatible) |
| AI | Hugging Face Inference — Qwen2.5-7B-Instruct |
| Auth | JWT (`jose` middleware + cookie), role guards on `/tools/execute` |

---

## Architecture (high level)

```
Browser
  → Next.js (UI + /api/chat SSE)
       → Hugging Face (reasoning + tool JSON)
       → NestJS /tools/execute (JWT + role check)
            → Prisma → PostgreSQL
```

Details: [docs/AI-ARCHITECTURE.md](docs/AI-ARCHITECTURE.md) · Full reference: [docs/PROJECT-MASTER-GUIDE.md](docs/PROJECT-MASTER-GUIDE.md)

---

## Features

- **Roles:** Admin, Teacher, Student, Parent — scoped dashboards
- **Modules:** Students, Teachers, Classes, Attendance, Grades, Fees (PKR), Notices
- **AI Assistant:** Multi-step agent loop (up to 5 iterations), conversation memory, rate limiting
- **Reports:** Fee report card + PDF export (admin)
- **Landing page:** Marketing site at `/` with animated agentic chat demo

---

## Quick start (local)

### Prerequisites

- Node.js 18+
- PostgreSQL (or [Neon](https://neon.tech) connection string)

### 1. Backend

```bash
cd backend
cp .env.example .env   # then fill DATABASE_URL, JWT_SECRET
npm install
npx prisma db push
npx prisma db seed
npx ts-node update-demo.ts
npm run start:dev      # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
#      JWT_SECRET=(same as backend)
#      HUGGINGFACE_API_KEY=hf_...
npm install
npm run dev            # http://localhost:3000
```

### 3. Verify AI token

```bash
cd frontend
node scripts/validate-hf-token.mjs
```

**Hugging Face:** [Create token](https://huggingface.co/settings/tokens) with **Inference Providers** enabled. If chat shows *“Invalid username or password”*, the HF key is expired — not your login.

---

## Deploy free (first time? start here)

Simple step-by-step (GitHub + Vercel + Render + Neon): **[docs/DEPLOYMENT-FREE.md](docs/DEPLOYMENT-FREE.md)**

| Service | Hosts |
|---------|--------|
| Vercel | `frontend/` (Next.js + `/api/chat`) |
| Render | `backend/` (NestJS API) |
| Neon | PostgreSQL |

---

## Project structure

```
ai-school-assistant/
├── frontend/          # Next.js 14 — UI, landing, /api/chat
├── backend/           # NestJS — auth, CRUD, /tools/execute
├── docs/              # Architecture, deployment, master guide
└── README.md
```

---

## Security

- **Never commit** `.env` / `.env.local` (use `.env.example` only).
- If secrets were pushed to GitHub, **rotate** Neon password, HF token, and `JWT_SECRET`, then remove files from git history:

```bash
git rm --cached backend/.env frontend/.env frontend/.env.local
git commit -m "chore: stop tracking env files"
```

- `HUGGINGFACE_API_KEY` stays server-side on Vercel (not `NEXT_PUBLIC_*`).

---

## Tests

```bash
cd frontend
node test-chat-auth.mjs   # expects 401 without JWT
```

---

## Roadmap (portfolio + product)

- [ ] Live Vercel + Render URLs in README
- [ ] Screenshots + 90s demo video
- [ ] Playwright E2E (login + AI smoke)
- [ ] GitHub Actions CI (lint + build)
- [ ] Custom domain + Render always-on (paid) for client demos

---

## License

MIT — use for portfolio and learning. Demo data is fictional.

---

## Author

Built as a **full-stack + agentic AI** showcase. Connect on LinkedIn / Upwork and link this repo + live demo.
