# Directive: Teacher Dashboard Privacy

## Goal

Restrict the teacher dashboard and all associated teacher portal routes to
Administrators only. Regular teachers and students should not be able to see or
access these pages.

## Context

The teacher dashboard is currently in a "Private" state. Access will be granted
publicly in a future feature release.

## Implementation Details (Layer 2 & 3 Integration)

- **Path Prefix**: `/teacher/*`
- **Validation**: Check `useAuth().isAdmin`.
- **Action on Unauthorized (Non-Admin)**:
  - If user has a student profile, redirect to `/student/dashboard`.
  - Otherwise, redirect to `/login`.
- **Navigation**:
  - Do not render `navigationItems` in `DashboardSidebar.tsx` unless `isAdmin`
    is true.
  - Display placeholder text "Portal is currently private" for non-admins to
    indicate state.

## Edge Cases

- **Legacy Routes**: Ensure legacy routes like `/teacher/classroom/:classId` are
  also covered by unified classroom logic or explicitly blocked if they bypass
  primary layout checks.
- **Direct URL Entry**: Even if navigation is hidden, the `DashboardLayout.tsx`
  must enforce redirects for direct URL entry.
