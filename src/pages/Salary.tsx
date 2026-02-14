import React from 'react';
import { DollarSign } from 'lucide-react';
import { useSalary } from '@/hooks/useSalary';
import { SalarySummary } from '@/components/salary/SalarySummary';
import { SalaryCard } from '@/components/salary/SalaryCard';
import { SalaryCardSkeleton, SalarySummarySkeleton } from '@/components/skeletons/SalaryCardSkeleton';

export default function Salary() {
  const { salaryRecords, currentSalary, isLoading } = useSalary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salary</h1>
          <p className="text-muted-foreground">View your salary records and payment history</p>
        </div>
        <SalarySummarySkeleton />
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Payment History</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SalaryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Salary</h1>
        <p className="text-muted-foreground">View your salary records and payment history</p>
      </div>

      {/* Current Month Summary */}
      <SalarySummary salary={currentSalary} />

      {/* Salary History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Payment History</h2>
        
        {salaryRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No salary records</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Your salary records will appear here once processed.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {salaryRecords.map(salary => (
              <SalaryCard key={salary.id} salary={salary} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
