# Quality Guard Workflow

This workflow helps ensure that all changes meet the project's quality
standards, specifically focusing on the recent auth resilience and UI
consistency fixes.

1. Run standard lint check to catch any "any" types or unhandled nulls. // turbo

```bash
npm run lint
```

2. Verify Auth State management:
   - Check `AuthContext.tsx` for any removal of the `isFetchingRef` concurrency
     guard.
   - Ensure `AuthService.ts` timeouts remain at 5s.

3. Verify UI Fallbacks:
   - Search for any remaining hardcoded "Teacher" or "Student" strings in
     `src/pages` or `src/components`.

```bash
grep -r "Teacher" src/pages --exclude-dir=node_modules | grep -v "Profile"
```

4. Responsive Design Check:
   - If UI changes were made, use the browser tool to verify 400px (mobile) and
     1200px (desktop) layouts.

5. Verification Proof:
   - Ensure a screenshot or video of the change is attached to `walkthrough.md`.
