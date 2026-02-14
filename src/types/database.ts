import { Json } from '@/integrations/supabase/types';
export type { Json };

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export type TeacherStatus = 'active' | 'pending' | 'approved' | 'rejected' | string;

export type AppRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface ProfileMetadata {
  approval_status?: TeacherStatus;
  avatar_config?: Json;
  [key: string]: Json | undefined;
}

export interface Profile {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  country: string | null;
  language_pref: string | null;
  created_at: string;
  updated_at: string | null;
  metadata: ProfileMetadata | Json;
  role?: AppRole;
}

export interface Teacher {
  id: string;
  user_id: string | null;
  profile_id: string | null;
  employee_id: string | null;
  bio: string | null;
  specializations: string[] | null;
  hourly_rate: number;
  salary_base: number | null;
  status: TeacherStatus;
  teaching_hours_per_week: number | null;
  hire_date: string | null;
  is_verified: boolean | null;
  is_profile_hidden: boolean | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
  availability_status: AvailabilityStatus;
  profile?: Profile;
}

export interface Student {
  id: string;
  user_id: string | null;
  teacher_id: string | null;
  parent_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  country_code: string | null;
  country: string | null;
  language_pref: string | null;
  course_level: string | null;
  duration_minutes: number | null;
  schedule_days: string[] | null;
  schedule_time: string | null;
  timezone: string | null;
  progress_percentage: number | null;
  current_surah: string | null;
  current_juzz: number | null;
  status: string | null;
  notes: string | null;
  accessibility_mode: string | null;
  is_parent_account: boolean | null;
  current_streak: number | null;
  longest_streak: number | null;
  last_activity_date: string | null;
  teacher_selection_mode: 'academy' | 'self' | null | string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface RulesDocument {
  id: string;
  title: string;
  content: string | null;
  pdf_url: string | null;
  category: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Instruction {
  id: string;
  title: string;
  content: string;
  category: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed' | null;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  teacher_id: string;
  subject: string;
  description: string;
  attachments: string[] | null;
  status: 'open' | 'under_review' | 'resolved' | 'closed' | null;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  teacher_id: string;
  from_user_id: string | null;
  from_type: string | null;
  subject: string | null;
  message: string;
  rating: number | null;
  teacher_response: string | null;
  created_at: string;
}

export interface Improvement {
  id: string;
  teacher_id: string;
  examiner_id: string | null;
  title: string;
  description: string;
  required_action: string | null;
  is_completed: boolean | null;
  evidence_url: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ClassStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'no_answer' | 'cancelled' | 'on_leave';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'no_answer';

export interface Attendance {
  id: string;
  class_id: string;
  teacher_id: string;
  student_id: string;
  status: AttendanceStatus;
  note: string | null;
  recorded_at: string;
  updated_by: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  student_id: string;
  scheduled_date: string;
  start_time: string;
  actual_start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  status: ClassStatus;
  call_room_id: string | null;
  call_room_url: string | null;
  is_recovery: boolean | null;
  recovery_for_class_id: string | null;
  actual_end_time: string | null;
  notes: string | null;
  cancellation_reason?: ClassCancellationReason | null;
  lesson_added: boolean | null;
  created_at: string;
  updated_at: string;
  // Join fields
  teacher?: Teacher;
  student?: Student;
}

export interface TodayClass extends Class {
  student: Student;
}

export interface Lesson {
  id: string;
  class_id: string | null;
  teacher_id: string;
  student_id: string;
  course_level: string | null;
  quran_subject: string | null;
  surah: string | null;
  juzz: number | null;
  page_from: number | null;
  page_to: number | null;
  ayah_from: number | null;
  ayah_to: number | null;
  memorization_surah: string | null;
  memorization_ayah_from: number | null;
  memorization_ayah_to: number | null;
  fundamental_islam: string | null;
  ethics: string | null;
  comments: string | null;
  method: string | null;
  quran_completed: boolean | null;
  rating_concentration: number | null;
  rating_revision: number | null;
  rating_progress: number | null;
  images: string[] | null;
  is_quick_lesson: boolean;
  created_at: string;
  updated_at: string;
  // Join fields
  student?: Student | null;
  class?: Class | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'class_reminder' | 'admin_message' | 'task_assignment' | 'announcement' | 'feedback' | 'system';
  title: string;
  message: string | null;
  payload: Json;
  read: boolean;
  created_at: string;
}

export interface ExaminerRemark {
  id: string;
  student_id: string;
  lesson_id: string | null;
  teacher_id: string | null;
  examiner_id: string | null;
  remarks_text: string;
  tags: string[] | null;
  teacher_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryRecord {
  id: string;
  teacher_id: string;
  month: string; // Changed to match DB 'date' format
  base_salary: number;
  classes_count: number | null;
  bonus: number | null;
  total_deductions: number | null;
  net_salary: number | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  billing_period: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  student_id: string;
  plan_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  due_date: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  invoice_id: string | null;
  student_id: string;
  amount: number;
  currency: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_method: 'stripe' | 'paypal' | 'bank_transfer' | 'cash' | 'other' | null;
  transaction_reference: string | null;
  processed_at: string | null;
  created_at: string;
  student?: Student;
  invoice?: Invoice;
}

export interface Payment {
  id: string;
  student_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_method: string | null;
  metadata: Json;
  created_at: string;
}

// ==========================================
// New Features: System Settings
// ==========================================

export interface SystemSetting {
  key: string;
  value: Json;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  updated_by: string | null;
}

// ==========================================
// New Features: Messaging
// ==========================================

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  attachment_url: string | null;
  is_read: boolean | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  recipient?: Profile;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  old_data: Json;
  new_data: Json;
  changed_by: string | null;
  created_at: string;
}

export type ClassCancellationReason = 'student_absent' | 'teacher_absent' | 'technical_issue' | 'other';

export interface ConnectionRequest {
  id: string;
  student_id: string;
  teacher_id: string;
  status: ConnectionStatus;
  message: string | null;
  created_at: string;
  responded_at: string | null;
  initiated_by_role: 'student' | 'teacher' | null;
  student?: Student;
  teacher?: Teacher;
}

export interface RescheduleRequest {
  id: string;
  class_id: string;
  student_id: string;
  preferred_times: Json;
  reason: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
  class?: Class;
  student?: Student;
}

export interface DashboardStats {
  todayClassesCount: number;
  completedThisWeek: number;
  averageRating: number;
  pendingTasks: number;
  missedClassesCount: number;
  totalClasses: number;
  totalHours: number;
  monthlyClasses: number;
  attendanceRate: number;
}



export interface AdminAuditLog {
  id: string;
  action: string;
  admin_id: string | null;
  created_at: string;
  details: Json | null;
  ip_address: string | null;
  target_resource: string | null;
}

export type AvailabilityStatus = 'online' | 'busy' | 'away' | 'offline';

export interface Task {
  id: string;
  teacher_id: string;
  assigned_by: string | null;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | null;
  due_date: string | null;
  is_personal: boolean | null;
  proof_url: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
