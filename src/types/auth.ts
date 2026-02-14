import { User, Session } from '@supabase/supabase-js';
import type { Profile, Teacher, Student, AppRole, StudentAchievement } from './database';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  teacher: Teacher | null;
  student: Student | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  isLoading: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isParent: boolean;
  linkedChildren: Student[];
  activeChild: Student | null;
  achievements: StudentAchievement[];
  hasTeacherRecord: boolean;
  hasStudentRecord: boolean;
  setActiveChild: (child: Student | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; mfaRequired?: boolean; factorId?: string }>;
  signUp: (email: string, password: string, fullName: string, role?: 'teacher' | 'student' | 'parent', country?: string, language?: string) => Promise<{ error: Error | null }>;
  displayName: string;
  displayEmail: string;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
