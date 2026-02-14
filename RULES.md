# Coding Guardrails & Quality Rules

To the AI Assistant: **READ THIS BEFORE MAKING ANY CHANGES.**

The primary goal is to maintain the stability of the **Quran with Tahir**
platform.

### 1. Pre-Change Analysis

Before modifying any file, you MUST:

- Check for global impact (e.g., changing a shared hook or context).
- Compare the new logic against the `system_reference.md` snapshot.
- If a change might affect Login, Signup, or Roles, **YOU MUST WARN THE USER
  FIRST**.

### 2. Regression Reporting

If a change is likely to break something or changes a core behavior:

- Report what the behavior **was** before.
- Report what the behavior **will be** after.
- Explain **why** the change is necessary.

### 3. Handling Errors

- Do not let "temporary" errors remain. Ensure `tsc` (TypeScript compiler) and
  `lint` pass before finishing.
- If a complex issue persists (like the past Login/Role issues), do not guess.
  Research the `AuthContext.tsx` logic thoroughly.

### 4. Directives

- **NEVER** remove existing RLS policies unless replacing them with more secure
  ones.
- **NEVER** bypass the `AuthService` state management for User/Profile data.
- **ALWAYS** follow the "Vibe Coding" principle of making it better, but never
  breaking the foundational "Gold" state.
