# Database Optimization Workflow

Use this workflow to identify and fix performance bottlenecks, like the slow
queries that caused the initial "Roles fetch timeout" issue.

1. Analysis with Index Advisor:
   - Identify slow queries from logs or user reports.
   - Run the query through Supabase's `index_advisor`:

```sql
SELECT * FROM index_advisor('YOUR_SLOW_QUERY_HERE');
```

2. Verification of Current Indices:
   - Check existing indices on the target table to avoid duplicates:

```sql
SELECT * FROM pg_indexes WHERE tablename = 'table_name';
```

3. Implementation:
   - Apply suggested indices using the `safe-migration` workflow.
   - Use descriptive names: `idx_table_column_purpose` (e.g.,
     `idx_profiles_user_id_auth`).

4. Verification:
   - Re-run the slow query via `execute_sql` and verify the execution time is
     under 100ms.
   - Check `mcp_supabase-mcp-server_get_advisors` (performance) for any new
     recommendations.
