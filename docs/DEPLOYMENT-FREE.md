# Simple guide — GitHub + free online deploy (first time)

**Time:** about 1–2 hours · **Cost:** $0

You will use 4 free websites:

| Website | What it does |
|---------|----------------|
| **GitHub** | Stores your code |
| **Neon** | Database (students, grades, etc.) |
| **Render** | Backend API (NestJS) |
| **Vercel** | Website people open in the browser (Next.js) |

You also need a **Hugging Face** API key for the AI chat (free).

---

## Before you start

1. Project runs on your PC (`npm run dev` frontend + `npm run start:dev` backend).
2. Open these in your browser and sign up (free):
   - [github.com](https://github.com)
   - [neon.tech](https://neon.tech)
   - [render.com](https://render.com)
   - [vercel.com](https://vercel.com)
   - [huggingface.co](https://huggingface.co)

3. Open **Notepad** and keep it open. You will paste 3 secrets there (do **not** put them on GitHub).

---

# PART 1 — Put your code on GitHub

### Step 1 — Open terminal in the project folder

In VS Code / Cursor: **Terminal → New Terminal**, then:

```powershell
cd C:\Users\PMLS\Desktop\WebDev\ai-school-assistant
```

### Step 2 — Stop uploading password files

Run once:

```powershell
git rm --cached backend/.env
git rm --cached frontend/.env
```

If it says “did not match”, that’s OK — continue.

### Step 3 — Save everything to Git

```powershell
git add .
git status
```

**Important:** In the list, you must **NOT** see `backend/.env` or `frontend/.env`.  
If you do, run:

```powershell
git reset backend/.env frontend/.env
```

Then commit:

```powershell
git commit -m "feat: EduNexus landing page, AI assistant, and docs"
```

### Step 4 — Send code to GitHub

```powershell
git push
```

If it asks for login, use GitHub Desktop or sign in with the browser popup.

Your repo: `https://github.com/czmfpnvzhq-create/ai-school-assistant`

**Part 1 done** when you see your latest files on GitHub in the browser.

---

# PART 2 — Write down 3 secrets (Notepad)

You need these for Render and Vercel. **Same values you use locally** (from `backend/.env` and `frontend/.env.local`) — or create new ones.

### Secret 1 — `DATABASE_URL`

1. Go to [console.neon.tech](https://console.neon.tech)
2. Open your project → **Connection string** → copy it  
3. Paste in Notepad as: `DATABASE_URL=postgresql://...`

### Secret 2 — `JWT_SECRET`

Any long random text (at least 32 characters).  
Example: `myEduNexusSecret2025ChangeThisToSomethingRandom`

Use the **same** text on Render **and** Vercel.

### Secret 3 — `HUGGINGFACE_API_KEY`

1. [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. **New token** → enable **Inference** / **Inference Providers**
3. Copy token starting with `hf_...`

---

# PART 3 — Put database tables on Neon (one time)

On your PC, in terminal:

```powershell
cd C:\Users\PMLS\Desktop\WebDev\ai-school-assistant\backend
npx prisma db push
npx prisma db seed
npx ts-node update-demo.ts
```

(Uses your local `.env` `DATABASE_URL` — should be the same Neon database.)

**Part 3 done** when these commands finish without errors.

---

# PART 4 — Deploy backend on Render

### Step 1

Go to [dashboard.render.com](https://dashboard.render.com) → **Sign up** (use “Sign in with GitHub”).

### Step 2

Click **New +** → **Web Service** → connect **ai-school-assistant** repo.

### Step 3 — Fill the form

| Field | What to type |
|-------|----------------|
| Name | `edunexus-api` (any name is fine) |
| Region | Pick closest to you |
| Branch | your main branch |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm run start:prod` |
| Instance Type | **Free** |

### Step 4 — Environment variables

Click **Environment** → add these **one by one** (copy from Notepad):

| Key | Value |
|-----|--------|
| `DATABASE_URL` | your Neon connection string |
| `JWT_SECRET` | your secret from Part 2 |
| `NODE_ENV` | `production` |

Click **Create Web Service** and wait (~5–10 min) until status is **Live**.

### Step 5 — Copy your API URL

At the top you will see something like:

`https://edunexus-api.onrender.com`

Copy it to Notepad. You need it for Vercel.

**Note:** Free Render sleeps when nobody uses it. First login after a while may take **30–60 seconds** — that’s normal.

---

# PART 5 — Deploy website on Vercel

### Step 1

Go to [vercel.com](https://vercel.com) → **Sign up** with GitHub.

### Step 2

**Add New…** → **Project** → import **ai-school-assistant**.

### Step 3 — Project settings

| Field | What to type |
|-------|----------------|
| Framework | Next.js (auto) |
| Root Directory | Click **Edit** → choose `frontend` |

### Step 4 — Environment variables

Before clicking Deploy, open **Environment Variables** and add:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | your Render URL from Part 4 (example: `https://edunexus-api.onrender.com`) — **no** `/` at the end |
| `JWT_SECRET` | **exact same** as Render |
| `HUGGINGFACE_API_KEY` | your `hf_...` token |

### Step 5

Click **Deploy** and wait (~2–5 min).

You get a URL like: `https://ai-school-assistant.vercel.app`

**That is your live demo link.**

---

# PART 6 — Test that it works

1. Open your **Vercel URL** in the browser → landing page should load.
2. Click **Get Started** or **Login**.
3. Login: `admin@edunexus.com` / `admin123`
4. Open **AI Assistant** and ask: *“How many students are in Class 6?”*

If login works but AI fails → check `HUGGINGFACE_API_KEY` on Vercel and redeploy.

If login fails / network error → check `NEXT_PUBLIC_API_URL` matches your Render URL exactly.

---

# PART 7 — Update README (optional, 2 minutes)

Open `README.md`, find **Live demo**, and paste your Vercel URL.

Then on your PC:

```powershell
cd C:\Users\PMLS\Desktop\WebDev\ai-school-assistant
git add README.md
git commit -m "docs: add live demo URL"
git push
```

---

## Quick fixes (only 4 problems)

| Problem | Fix |
|---------|-----|
| AI says “Invalid username or password” | New Hugging Face token → update on Vercel → **Redeploy** |
| Dashboard empty / network error | Wrong `NEXT_PUBLIC_API_URL` — must be Render URL, no trailing slash |
| Login works, AI says 401 | `JWT_SECRET` different on Vercel vs Render — make them identical |
| Render very slow first time | Free plan was sleeping — wait 60 seconds and try again |

---

## Checklist — tick when done

- [ ] Code pushed to GitHub (no `.env` files in the repo)
- [ ] Neon database seeded
- [ ] Render backend **Live** + URL copied
- [ ] Vercel deployed + 3 env vars set
- [ ] Login + AI tested on live URL
- [ ] README updated with live link

---

## What’s next (portfolio, later)

- Take 3 screenshots (landing, dashboard, AI chat)
- Short screen recording (Loom, 1 minute)
- Share GitHub + live link on LinkedIn / Upwork

More detail: [GITHUB-AND-PORTFOLIO-PLAN.md](./GITHUB-AND-PORTFOLIO-PLAN.md)
