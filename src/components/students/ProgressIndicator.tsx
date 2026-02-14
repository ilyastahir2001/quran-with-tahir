import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  currentJuzz: number;
  totalJuzz?: number;
  surah?: string | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressIndicator({
  currentJuzz,
  totalJuzz = 30,
  surah,
  showLabel = true,
  size = 'md',
  className,
}: ProgressIndicatorProps) {
  const percentage = Math.round((currentJuzz / totalJuzz) * 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('space-y-1', className)}>
      <Progress value={percentage} className={cn(sizeClasses[size])} />
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Juzz {currentJuzz}/{totalJuzz}</span>
          <span>{percentage}%</span>
        </div>
      )}
      {surah && showLabel && (
        <p className="text-xs text-muted-foreground truncate">
          Current: {surah}
        </p>
      )}
    </div>
  );
}
