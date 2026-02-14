-- ==========================================
-- Teacher Dashboard - Complete Database Schema
-- ==========================================

-- 1. Create ENUM types for status fields
CREATE TYPE public.class_status AS ENUM ('scheduled', 'in_progress', 'completed', 'missed', 'no_answer', 'cancelled');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'leave', 'no_answer');
CREATE TYPE public.call_event AS ENUM ('initiated', 'ringing', 'accepted', 'rejected', 'failed', 'connected', 'disconnected', 'timeout');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE public.complaint_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE public.notification_type AS ENUM ('class_reminder', 'admin_message', 'task_assignment', 'announcement', 'feedback', 'system');

-- 2. Create user_roles table (SECURITY: roles separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  country TEXT,
  language_pref TEXT DEFAULT 'english',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create teachers table
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
  salary_base DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  specializations TEXT[],
  bio TEXT,
  teaching_hours_per_week INTEGER DEFAULT 0,
  hire_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  country TEXT,
  country_code TEXT,
  language_pref TEXT DEFAULT 'english',
  course_level TEXT DEFAULT 'beginner',
  duration_minutes INTEGER DEFAULT 30,
  schedule_days TEXT[],
  schedule_time TIME,
  timezone TEXT DEFAULT 'UTC',
  progress_percentage INTEGER DEFAULT 0,
  current_surah TEXT,
  current_juzz INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  notes TEXT,
  parent_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  accessibility_mode TEXT DEFAULT 'standard',
  is_parent_account BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration_minutes INTEGER DEFAULT 30,
  status class_status DEFAULT 'scheduled',
  call_room_id TEXT,
  call_room_url TEXT,
  is_recovery BOOLEAN DEFAULT false,
  recovery_for_class_id UUID REFERENCES public.classes(id),
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  notes TEXT,
  lesson_added BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  course_level TEXT,
  quran_subject TEXT,
  surah TEXT,
  juzz INTEGER,
  page_from INTEGER,
  page_to INTEGER,
  ayah_from INTEGER,
  ayah_to INTEGER,
  memorization_surah TEXT,
  memorization_ayah_from INTEGER,
  memorization_ayah_to INTEGER,
  fundamental_islam TEXT,
  ethics TEXT,
  comments TEXT,
  method TEXT,
  quran_completed BOOLEAN DEFAULT false,
  rating_concentration INTEGER CHECK (rating_concentration >= 1 AND rating_concentration <= 5),
  rating_revision INTEGER CHECK (rating_revision >= 1 AND rating_revision <= 5),
  rating_progress INTEGER CHECK (rating_progress >= 1 AND rating_progress <= 5),
  images TEXT[],
  is_quick_lesson BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status attendance_status NOT NULL,
  note TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Create call_logs table
CREATE TABLE public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  event call_event NOT NULL,
  room_id TEXT,
  room_url TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Create salary_records table
CREATE TABLE public.salary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  classes_count INTEGER DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, month)
);

-- 11. Create deductions table
CREATE TABLE public.deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_record_id UUID REFERENCES public.salary_records(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  deduction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_requested BOOLEAN DEFAULT false,
  review_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  payload JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Create examiner_remarks table
CREATE TABLE public.examiner_remarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  examiner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  remarks_text TEXT NOT NULL,
  tags TEXT[],
  teacher_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  due_date DATE,
  is_personal BOOLEAN DEFAULT false,
  proof_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Create reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  remind_at TIMESTAMPTZ NOT NULL,
  repeat_type TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  attachments TEXT[],
  status complaint_status DEFAULT 'open',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Create suggestions table
CREATE TABLE public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status complaint_status DEFAULT 'open',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  from_type TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  teacher_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Create improvements table
CREATE TABLE public.improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  examiner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_action TEXT,
  is_completed BOOLEAN DEFAULT false,
  evidence_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Create announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  target_role app_role,
  is_active BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Create announcement_reads table
CREATE TABLE public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- 22. Create rules_documents table
CREATE TABLE public.rules_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  pdf_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. Create instructions table
CREATE TABLE public.instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- SECURITY: Enable RLS on all tables
-- ==========================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examiner_remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SECURITY DEFINER FUNCTIONS
-- ==========================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's teacher_id
CREATE OR REPLACE FUNCTION public.get_teacher_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.teachers WHERE user_id = _user_id LIMIT 1
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- user_roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- teachers policies
CREATE POLICY "Teachers can view own record" ON public.teachers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update own record" ON public.teachers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all teachers" ON public.teachers
  FOR ALL USING (public.is_admin(auth.uid()));

-- students policies
CREATE POLICY "Teachers can view their students" ON public.students
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can update their students" ON public.students
  FOR UPDATE USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all students" ON public.students
  FOR ALL USING (public.is_admin(auth.uid()));

-- classes policies
CREATE POLICY "Teachers can view their classes" ON public.classes
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can update their classes" ON public.classes
  FOR UPDATE USING (teacher_id = public.get_teacher_id(auth.uid()));

CREATE POLICY "Teachers can insert classes" ON public.classes
  FOR INSERT WITH CHECK (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all classes" ON public.classes
  FOR ALL USING (public.is_admin(auth.uid()));

-- lessons policies
CREATE POLICY "Teachers can view their lessons" ON public.lessons
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can manage their lessons" ON public.lessons
  FOR ALL USING (teacher_id = public.get_teacher_id(auth.uid()));

-- attendance policies
CREATE POLICY "Teachers can view their attendance" ON public.attendance
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can manage their attendance" ON public.attendance
  FOR ALL USING (teacher_id = public.get_teacher_id(auth.uid()));

-- call_logs policies
CREATE POLICY "Teachers can view their call logs" ON public.call_logs
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can insert call logs" ON public.call_logs
  FOR INSERT WITH CHECK (teacher_id = public.get_teacher_id(auth.uid()));

-- salary_records policies
CREATE POLICY "Teachers can view their salary" ON public.salary_records
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all salaries" ON public.salary_records
  FOR ALL USING (public.is_admin(auth.uid()));

-- deductions policies
CREATE POLICY "Teachers can view their deductions" ON public.deductions
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can request review" ON public.deductions
  FOR UPDATE USING (teacher_id = public.get_teacher_id(auth.uid()))
  WITH CHECK (teacher_id = public.get_teacher_id(auth.uid()));

CREATE POLICY "Admins can manage all deductions" ON public.deductions
  FOR ALL USING (public.is_admin(auth.uid()));

-- notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- examiner_remarks policies
CREATE POLICY "Teachers can view remarks for their students" ON public.examiner_remarks
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can respond to remarks" ON public.examiner_remarks
  FOR UPDATE USING (teacher_id = public.get_teacher_id(auth.uid()));

CREATE POLICY "Admins can manage all remarks" ON public.examiner_remarks
  FOR ALL USING (public.is_admin(auth.uid()));

-- tasks policies
CREATE POLICY "Teachers can view their tasks" ON public.tasks
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can manage their tasks" ON public.tasks
  FOR ALL USING (teacher_id = public.get_teacher_id(auth.uid()));

CREATE POLICY "Admins can manage all tasks" ON public.tasks
  FOR ALL USING (public.is_admin(auth.uid()));

-- reminders policies
CREATE POLICY "Teachers can manage their reminders" ON public.reminders
  FOR ALL USING (teacher_id = public.get_teacher_id(auth.uid()));

-- complaints policies
CREATE POLICY "Teachers can view their complaints" ON public.complaints
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (teacher_id = public.get_teacher_id(auth.uid()));

CREATE POLICY "Admins can manage all complaints" ON public.complaints
  FOR ALL USING (public.is_admin(auth.uid()));

-- suggestions policies
CREATE POLICY "Teachers can view their suggestions" ON public.suggestions
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can create suggestions" ON public.suggestions
  FOR INSERT WITH CHECK (teacher_id = public.get_teacher_id(auth.uid()));

CREATE POLICY "Admins can manage all suggestions" ON public.suggestions
  FOR ALL USING (public.is_admin(auth.uid()));

-- feedback policies
CREATE POLICY "Teachers can view their feedback" ON public.feedback
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can respond to feedback" ON public.feedback
  FOR UPDATE USING (teacher_id = public.get_teacher_id(auth.uid()));

CREATE POLICY "Admins can manage all feedback" ON public.feedback
  FOR ALL USING (public.is_admin(auth.uid()));

-- improvements policies
CREATE POLICY "Teachers can view their improvements" ON public.improvements
  FOR SELECT USING (teacher_id = public.get_teacher_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Teachers can update their improvements" ON public.improvements
  FOR UPDATE USING (teacher_id = public.get_teacher_id(auth.uid()));

CREATE POLICY "Admins can manage all improvements" ON public.improvements
  FOR ALL USING (public.is_admin(auth.uid()));

-- announcements policies
CREATE POLICY "Authenticated users can view active announcements" ON public.announcements
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (public.is_admin(auth.uid()));

-- announcement_reads policies
CREATE POLICY "Users can manage their reads" ON public.announcement_reads
  FOR ALL USING (auth.uid() = user_id);

-- rules_documents policies
CREATE POLICY "Authenticated users can view rules" ON public.rules_documents
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage rules" ON public.rules_documents
  FOR ALL USING (public.is_admin(auth.uid()));

-- instructions policies
CREATE POLICY "Authenticated users can view instructions" ON public.instructions
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage instructions" ON public.instructions
  FOR ALL USING (public.is_admin(auth.uid()));

-- ==========================================
-- TRIGGERS for updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_salary_records_updated_at BEFORE UPDATE ON public.salary_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_complaints_updated_at BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_suggestions_updated_at BEFORE UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_examiner_remarks_updated_at BEFORE UPDATE ON public.examiner_remarks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_improvements_updated_at BEFORE UPDATE ON public.improvements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_rules_documents_updated_at BEFORE UPDATE ON public.rules_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_instructions_updated_at BEFORE UPDATE ON public.instructions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- TRIGGER: Auto-create profile on signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- INDEXES for performance
-- ==========================================
CREATE INDEX idx_classes_teacher_date ON public.classes(teacher_id, scheduled_date);
CREATE INDEX idx_classes_student_date ON public.classes(student_id, scheduled_date);
CREATE INDEX idx_classes_status ON public.classes(status);
CREATE INDEX idx_lessons_teacher ON public.lessons(teacher_id);
CREATE INDEX idx_lessons_student ON public.lessons(student_id);
CREATE INDEX idx_attendance_class ON public.attendance(class_id);
CREATE INDEX idx_call_logs_class ON public.call_logs(class_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_tasks_teacher ON public.tasks(teacher_id, status);
CREATE INDEX idx_salary_teacher_month ON public.salary_records(teacher_id, month);

-- ==========================================
-- ENABLE REALTIME for key tables
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;