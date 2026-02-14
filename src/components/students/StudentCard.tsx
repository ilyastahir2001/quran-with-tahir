import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from './ProgressIndicator';
import { Phone } from 'lucide-react';
import type { Student } from '@/types/database';
import { cn } from '@/lib/utils';

// Country code to flag emoji mapping
const getCountryFlag = (countryCode?: string | null) => {
  if (!countryCode) return '🌍';
  const code = countryCode.toUpperCase();
  const flagOffset = 0x1F1E6;
  const asciiOffset = 0x41;
  const firstChar = code.charCodeAt(0) - asciiOffset + flagOffset;
  const secondChar = code.charCodeAt(1) - asciiOffset + flagOffset;
  return String.fromCodePoint(firstChar) + String.fromCodePoint(secondChar);
};

const getStatusColor = (status?: string | null) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-600 border-green-200';
    case 'inactive':
      return 'bg-red-500/10 text-red-600 border-red-200';
    case 'on_hold':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getLevelColor = (level?: string | null) => {
  switch (level) {
    case 'beginner':
      return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'intermediate':
      return 'bg-purple-500/10 text-purple-600 border-purple-200';
    case 'advanced':
      return 'bg-orange-500/10 text-orange-600 border-orange-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

interface StudentCardProps {
  student: Student;
  onCallClick?: (studentId: string) => void;
}

export function StudentCard({ student, onCallClick }: StudentCardProps) {
  const navigate = useNavigate();

  const initials = (student.full_name || '??')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/teacher/students/${student.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={student.avatar_url || undefined} alt={student.full_name || 'Student'} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {student.status === 'active' && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{student.full_name || 'Anonymous Student'}</h3>
              <span className="text-lg">{getCountryFlag(student.country_code)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <Badge
                variant="outline"
                className={cn('text-xs capitalize', getStatusColor(student.status))}
              >
                {student.status || 'Unknown'}
              </Badge>
              <Badge
                variant="outline"
                className={cn('text-xs capitalize', getLevelColor(student.course_level))}
              >
                {student.course_level || 'Beginner'}
              </Badge>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onCallClick?.(student.id);
            }}
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4">
          <ProgressIndicator
            currentJuzz={student.current_juzz || 1}
            surah={student.current_surah}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
