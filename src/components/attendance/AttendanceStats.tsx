import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  leave: number;
  no_answer: number;
}

interface AttendanceStatsProps {
  stats?: AttendanceStats;
  isLoading?: boolean;
}

export function AttendanceStats({ stats, isLoading }: AttendanceStatsProps) {
  const statItems = [
    { label: 'Present', value: stats?.present ?? 0, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Absent', value: stats?.absent ?? 0, icon: XCircle, color: 'text-red-500' },
    { label: 'Late', value: stats?.late ?? 0, icon: Clock, color: 'text-yellow-500' },
    { label: 'Leave', value: stats?.leave ?? 0, icon: Calendar, color: 'text-blue-500' },
    { label: 'No Answer', value: stats?.no_answer ?? 0, icon: XCircle, color: 'text-muted-foreground' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {statItems.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
