import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ClassTimerProps {
  startTime?: Date;
  className?: string;
}

export function ClassTimer({ startTime, className = '' }: ClassTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
      <Clock className="h-4 w-4" />
      <span className="font-mono text-lg">{formatTime(elapsed)}</span>
    </div>
  );
}
