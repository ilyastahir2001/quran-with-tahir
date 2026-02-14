# Project Setup & Health Check

Run this at the start of any major task to ensure the environment is healthy and
reduce configuration-related errors.

1. Environment Variable Audit:
   - Verify `.env` or `.env.local` contains:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Ensure no production keys are accidentally hardcoded in the codebase.

2. Dependency Sync:
   - If `package.json` was recently modified, ensure dependencies are up to
     date.

```bash
npm install
```

3. Type Safety Check:
   - Ensure the latest Supabase types are generated. // turbo

```bash
npx supabase gen types typescript --project-id elnydgvbykbgcrxgqwky > src/integrations/supabase/types.ts
```

4. Build Verification:
   - Ensure the project builds successfully before making complex changes.

```bash
npm run build
```
