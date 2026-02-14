import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export function PlaceholderPage({ title, description, icon: Icon = Construction }: PlaceholderPageProps) {
  const navigate = useNavigate();
  const { isStudent } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>
            {description || 'This page is under construction and will be available soon.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" onClick={() => navigate(isStudent ? '/student/dashboard' : '/teacher/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// All placeholder pages have been implemented in Phase 10:
// - LessonHistory -> src/pages/lessons/LessonHistory.tsx
// - ExaminerRemarks -> src/pages/lessons/ExaminerRemarks.tsx
// - Reminders -> src/pages/reminders/Reminders.tsx
// - Salary -> src/pages/salary/Salary.tsx
// - Deductions -> src/pages/salary/Deductions.tsx

// Moved to dedicated pages in Phase 9:
// - Tasks -> src/pages/tasks/Tasks.tsx
// - Complaints -> src/pages/complaints/Complaints.tsx
// - Suggestions -> src/pages/suggestions/Suggestions.tsx
// - FeedbackPage -> src/pages/feedback/Feedback.tsx
// - Improvement -> src/pages/improvement/Improvement.tsx
// - Rules -> src/pages/rules/Rules.tsx
// - Instruction -> src/pages/instructions/Instructions.tsx
// - Announcements -> src/pages/announcements/Announcements.tsx
