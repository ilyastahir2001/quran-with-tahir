import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
  maxStars?: number;
  disabled?: boolean;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
  value,
  onChange,
  label,
  maxStars = 5,
  disabled = false,
  readOnly = false,
  size = 'md',
}: StarRatingProps) {
  const handleClick = (starValue: number) => {
    if (disabled || readOnly) return;
    // Toggle off if clicking the same star
    onChange?.(value === starValue ? 0 : starValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (disabled || readOnly) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(starValue);
    }
  };

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const starSize = sizeClasses[size];

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-0.5" role="group" aria-label={label}>
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= value;

          if (readOnly) {
            return (
              <Star
                key={starValue}
                className={cn(
                  starSize,
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-muted-foreground"
                )}
              />
            );
          }

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => handleClick(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              disabled={disabled}
              className={cn(
                "p-0.5 rounded transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:scale-110 active:scale-95"
              )}
              aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
              aria-pressed={isFilled}
            >
              <Star
                className={cn(
                  starSize,
                  "transition-colors",
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-muted-foreground hover:text-amber-300"
                )}
              />
            </button>
          );
        })}
        {value > 0 && !readOnly && (
          <span className="ml-2 text-sm text-muted-foreground">
            {value}/{maxStars}
          </span>
        )}
      </div>
    </div>
  );
}
