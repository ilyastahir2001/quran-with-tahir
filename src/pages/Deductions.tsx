import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useSalary } from '@/hooks/useSalary';
import { DeductionCard } from '@/components/salary/DeductionCard';
import { DeductionCardSkeleton } from '@/components/skeletons/DeductionCardSkeleton';

type DeductionFilter = 'all' | 'pending' | 'reviewed';

export default function Deductions() {
  const { deductions, deductionStats, isLoading, requestReview } = useSalary();
  const [activeTab, setActiveTab] = useState('all');

  const filteredDeductions = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return deductions.filter(d => !d.review_status);
      case 'reviewed':
        return deductions.filter(d => d.review_status);
      default:
        return deductions;
    }
  }, [deductions, activeTab]);

  const handleRequestReview = (id: string) => {
    requestReview.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deductions</h1>
          <p className="text-muted-foreground">View your deduction history and request reviews</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DeductionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deductions</h1>
        <p className="text-muted-foreground">View your deduction history and request reviews</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${deductionStats.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {deductionStats.count} deduction{deductionStats.count !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deductionStats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">Awaiting admin response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unreviewed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deductions.filter(d => !d.review_requested && !d.review_status).length}
            </div>
            <p className="text-xs text-muted-foreground">No review requested yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Deduction List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({deductions.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Not Reviewed ({deductions.filter(d => !d.review_status).length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({deductions.filter(d => d.review_status).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredDeductions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Minus className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No deductions found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {activeTab === 'all' 
                  ? "You don't have any deductions. Keep up the good work!"
                  : `No ${activeTab} deductions found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDeductions.map(deduction => (
                <DeductionCard
                  key={deduction.id}
                  deduction={deduction}
                  onRequestReview={handleRequestReview}
                  isUpdating={requestReview.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
