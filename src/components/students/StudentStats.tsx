import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, CalendarDays, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentStatsProps {
  total: number;
  active: number;
  withClassToday: number;
  avgProgress: number;
  isLoading?: boolean;
}

export function StudentStats({
  total,
  active,
  withClassToday,
  avgProgress,
  isLoading,
}: StudentStatsProps) {
  const stats = [
    {
      label: 'Total Students',
      value: total,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Active',
      value: active,
      icon: UserCheck,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Classes Today',
      value: withClassToday,
      icon: CalendarDays,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Avg Progress',
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-full mb-2" />
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color} mb-2`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
