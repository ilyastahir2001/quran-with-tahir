# Contributing to Quran With Tahir

Welcome to the Quran With Tahir project! Please read this guide carefully before
making any changes.

---

## ⚠️ CRITICAL RULES — READ FIRST

> **🚫 NEVER push directly to `main` branch.** **🚫 NEVER merge anything to
> `main` without explicit written approval from the project owner
> (@ilyastahir2001).**
>
> All changes MUST go through a separate branch → Preview URL → Pull Request →
> Owner approval → Merge.
>
> **Breaking this rule may cause damage to the live website.**

---

## 🔄 Development Workflow (Fork + PR Model)

### Step 1: Fork the Repository

1. Go to
   [github.com/ilyastahir2001/quran-with-tahir](https://github.com/ilyastahir2001/quran-with-tahir)
2. Click **"Fork"** (top right corner)
3. This creates your own copy of the repo

### Step 2: Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/quran-with-tahir.git
cd quran-with-tahir
```

### Step 3: Set Up Upstream Remote

```bash
git remote add upstream https://github.com/ilyastahir2001/quran-with-tahir.git
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Then fill in your values (ask project owner for Supabase keys)
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

---

## 🌿 Branch Naming Convention

Always create a new branch for your work. Use descriptive names:

| Type      | Format                      | Example                     |
| --------- | --------------------------- | --------------------------- |
| Feature   | `feature/short-description` | `feature/student-dashboard` |
| Bug Fix   | `fix/short-description`     | `fix/login-error`           |
| UI Change | `ui/short-description`      | `ui/navbar-redesign`        |
| Hotfix    | `hotfix/short-description`  | `hotfix/payment-crash`      |

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name
```

---

## 📤 Submitting Changes (Pull Request)

### 1. Commit Your Changes

```bash
git add .
git commit -m "feat: add student dashboard page"
```

**Commit Message Format:**

- `feat:` — new feature
- `fix:` — bug fix
- `ui:` — UI/design change
- `refactor:` — code cleanup
- `docs:` — documentation update

### 2. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

1. Go to your fork on GitHub
2. Click **"Compare & pull request"**
3. Set base repository to `ilyastahir2001/quran-with-tahir` → `main`
4. Write a clear description of your changes
5. **Add screenshots** if you changed anything visual
6. Submit the PR

### 4. Wait for Review

- The project owner will review your PR
- You may get feedback or change requests
- **DO NOT merge yourself** — only the project owner merges

---

## 🔄 Keeping Your Fork Updated

Before starting new work, always sync with the main repo:

```bash
git checkout main
git pull upstream main
git push origin main
```

Then create your new branch from the updated `main`.

---

## 🖥️ Preview Deployments (Vercel)

- Every PR automatically gets a **Vercel Preview URL**
- Use this URL to test your changes before requesting review
- Share the preview URL in your PR description
- The live website is NOT affected by preview deployments

---

## 🛠️ Tech Stack

| Technology        | Purpose                           |
| ----------------- | --------------------------------- |
| **Vite**          | Build tool & dev server           |
| **React 18**      | UI framework                      |
| **TypeScript**    | Type-safe JavaScript              |
| **Tailwind CSS**  | Styling                           |
| **shadcn/ui**     | UI components                     |
| **Supabase**      | Backend (auth, database, storage) |
| **React Router**  | Client-side routing               |
| **Framer Motion** | Animations                        |
| **React Query**   | Data fetching                     |

---

## 📁 Project Structure

```text
src/
├── components/       # Reusable UI components
│   ├── landing/      # Landing page components
│   ├── layout/       # Layout components (sidebar, header)
│   ├── ui/           # shadcn UI components
│   └── video/        # Video call components
├── pages/            # Page components (routes)
│   ├── admin/        # Admin dashboard pages
│   ├── public/       # Public facing pages
│   └── ...           # Other pages
├── hooks/            # Custom React hooks
├── integrations/     # Supabase client & types
├── lib/              # Utility functions
└── App.tsx           # Main app with routes
```

---

## 🔐 Environment Variables

See `.env.example` for all required variables. Ask the project owner for:

- Supabase project credentials
- Any API keys needed

**NEVER commit real API keys to git.**

---

## ❓ Questions?

Contact the project owner: **@ilyastahir2001**
