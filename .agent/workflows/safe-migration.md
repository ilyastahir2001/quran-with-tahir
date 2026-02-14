---
description: safely apply database migrations and verify RLS
---

# Safe Migration Workflow

This workflow ensures that any DDL or DML changes to Supabase/Firebase are safe
and don't leak data.

1. Pre-Migration Check:
   - Verify if any RLS (Row Level Security) policies exist for the target
     tables.
   - Use `mcp_supabase-mcp-server_get_advisors` to check for security
     vulnerabilities before applying changes.

2. Dry Run / Schema Analysis:
   - Check if the project ID is correct and consistent with
     `supabase_list_projects`.
   - Draft the SQL query in a temporary `.sql` file for model verification.

3. Execution Guard:
   - Use `apply_migration` ONLY for DDL (CREATE/ALTER).
   - Use `execute_sql` ONLY for read-only checks or single DML rows.

4. Post-Migration Verification:
   - Run a `SELECT` count or a specific profile check to ensure data integrity
     is maintained.
   - Re-run `get_advisors` (security) to ensure no policies were accidentally
     dropped.
