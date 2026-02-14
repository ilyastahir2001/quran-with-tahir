import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Briefcase, TrendingUp, Minus, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type SalaryRecord = Tables<'salary_records'>;

interface SalaryCardProps {
  salary: SalaryRecord;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  paid: {
    label: 'Paid',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
};

export function SalaryCard({ salary }: SalaryCardProps) {
  const status = (salary.status ?? 'pending') as keyof typeof statusConfig;
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">
              {format(new Date(salary.month), 'MMMM yyyy')}
            </h3>
          </div>
          <Badge className={config.className}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Base:</span>
            <span className="font-medium">${Number(salary.base_salary).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Classes:</span>
            <span className="font-medium">{salary.classes_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Bonus:</span>
            <span className="font-medium text-green-600">
              +${Number(salary.bonus ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-red-500" />
            <span className="text-muted-foreground">Deductions:</span>
            <span className="font-medium text-red-600">
              -${Number(salary.total_deductions ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Net Salary</span>
          <span className="text-lg font-bold text-primary">
            ${Number(salary.net_salary ?? 0).toFixed(2)}
          </span>
        </div>

        {salary.notes && (
          <p className="text-xs text-muted-foreground pt-2 border-t">
            {salary.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
