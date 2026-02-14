import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Minus, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type SalaryRecord = Tables<'salary_records'>;

interface SalarySummaryProps {
  salary: SalaryRecord | undefined;
}

export function SalarySummary({ salary }: SalarySummaryProps) {
  if (!salary) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Current Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No salary record for this month yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Base Salary</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${Number(salary.base_salary).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {salary.classes_count ?? 0} classes this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bonus</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            +${Number(salary.bonus ?? 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Performance bonus</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deductions</CardTitle>
          <Minus className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -${Number(salary.total_deductions ?? 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Total deductions</p>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Salary</CardTitle>
          <Badge variant={salary.status === 'paid' ? 'default' : 'secondary'}>
            {salary.status ?? 'pending'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${Number(salary.net_salary ?? 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(salary.month), 'MMMM yyyy')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
