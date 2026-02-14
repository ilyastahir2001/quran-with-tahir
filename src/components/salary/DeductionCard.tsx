import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Deduction = Tables<'deductions'>;

interface DeductionCardProps {
  deduction: Deduction;
  onRequestReview: (id: string) => void;
  isUpdating?: boolean;
}

const reviewStatusConfig = {
  pending: {
    label: 'Review Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

export function DeductionCard({ deduction, onRequestReview, isUpdating }: DeductionCardProps) {
  const reviewStatus = deduction.review_status as keyof typeof reviewStatusConfig | null;
  const statusConfig = reviewStatus ? reviewStatusConfig[reviewStatus] : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <Card className="border-red-200/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">{deduction.reason}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(deduction.deduction_date), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-red-600 font-bold">
              <DollarSign className="h-4 w-4" />
              <span>{Number(deduction.amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pt-2 border-t">
          {statusConfig && StatusIcon ? (
            <Badge className={statusConfig.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          ) : deduction.review_requested ? (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Review Requested
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">No review requested</span>
          )}

          {!deduction.review_requested && !deduction.review_status && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRequestReview(deduction.id)}
              disabled={isUpdating}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Request Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
