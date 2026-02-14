import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { lazy, Suspense } from "react";

// Virtual Classroom (new)
const VirtualClass = lazy(() => import("./pages/classes/VirtualClass"));

// Auth Pages
import Login from "./pages/auth/Login";
import MFAVerify from "./pages/auth/MFAVerify";
import SecuritySettings from "./pages/SecuritySettings";
// ... imports ...

// Admin Pages
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminPagePlaceholder } from "./pages/admin/AdminPlaceholder";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminTeacherDetail from './pages/admin/TeacherDetail';
import AdminStudents from './pages/admin/AdminStudents';
import AdminClasses from './pages/admin/AdminClasses';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSalaries from './pages/admin/AdminSalaries';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from "./pages/admin/AdminSettings";
import TeacherApprovals from "./pages/admin/TeacherApprovals";
import AdminLogs from "./pages/admin/Logs";
import AdminExams from "./pages/admin/Exams";
import AdminPerformance from "./pages/admin/AdminPerformance";
import AdminMonitor from "./pages/admin/AdminMonitor";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ResendVerification from "./pages/auth/ResendVerification";

// Dashboard Layouts
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { StudentLayout } from "./components/layout/StudentLayout";

// Public Pages
import Landing from "./pages/Landing";
import VerifyCertificate from "./pages/public/VerifyCertificate";
import HolyQuran from "./pages/public/HolyQuran";
import Programs from "./pages/public/Programs";
import AboutUs from "./pages/public/AboutUs";
import Testimonials from "./pages/public/Testimonials";
import Pricing from "./pages/public/Pricing";
import Contact from "./pages/public/Contact";

// Main Pages (Teacher)
import Dashboard from "./pages/Dashboard";
import TodayClasses from "./pages/TodayClasses";
import ClassRoom from "./pages/ClassRoom";
import Students from "./pages/Students";
import Classes from "./pages/Classes";
import Attendance from "./pages/Attendance";
import ClassSchedule from "./pages/ClassSchedule";
import StudentProfile from "./pages/StudentProfile";
import TeacherProfile from "./pages/TeacherProfile";
import AddLesson from "./pages/AddLesson";

// Phase 9: Communication & Tasks
import Tasks from "./pages/Tasks";
import Complaints from "./pages/Complaints";
import Suggestions from "./pages/Suggestions";
import Feedback from "./pages/Feedback";
import Announcements from "./pages/Announcements";
import Improvement from "./pages/Improvement";
import Rules from "./pages/Rules";
import Instructions from "./pages/Instructions";

// Phase 10: Remaining Pages
import LessonHistory from "./pages/LessonHistory";
import ExaminerRemarks from "./pages/ExaminerRemarks";
import Reminders from "./pages/Reminders";
import Salary from "./pages/Salary";
import Deductions from "./pages/Deductions";
import ConnectionRequests from "./pages/ConnectionRequests";
import FindStudents from "./pages/FindStudents";
import TeacherLeaveRequests from "./pages/teacher/LeaveRequests";
import TeacherMessages from "./pages/teacher/Messages";
import AdminLeaveApprovals from "./pages/admin/AdminLeaveApprovals";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import FindTutors from "./pages/FindTutors";
import StudentTodayClasses from "./pages/student/TodayClasses";
import MyTeacher from "./pages/student/MyTeacher";
import MyClasses from "./pages/student/MyClasses";
import MySchedule from "./pages/student/MySchedule";
import StudentLessons from "./pages/student/Lessons";
import MyProgress from "./pages/student/MyProgress";
import StudentAttendance from "./pages/student/Attendance";
import StudentMessages from "./pages/student/Messages";
import StudentRequests from "./pages/student/Requests";
import StudentAnnouncements from "./pages/student/Announcements";
import StudentProfile2 from "./pages/student/Profile";
import StudentSettings from "./pages/student/Settings";
import StudentClassRoom from "./pages/student/StudentClassRoom";
import StudentExams from "./pages/student/StudentExams";
import ParentPortal from "./pages/parent/ParentPortal";
import ClassAuditLogs from "./pages/parent/ClassAuditLogs";
import StudentHelp from "./pages/Help";
import DesignSystem from "./pages/DesignSystem";
import AITutor from "./pages/student/AITutor";

import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import { MaintenanceOverlay } from "./components/system/MaintenanceOverlay";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RealtimeProvider>
        <BrowserRouter>
          <MaintenanceOverlay />
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" />
            <Analytics />
            <SpeedInsights />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/verify/:code" element={<VerifyCertificate />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/design-system" element={<DesignSystem />} />
              <Route path="/verify-mfa" element={<MFAVerify />} />
              <Route path="/holy-quran" element={<HolyQuran />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />

              {/* Onboarding - Optional Flow */}
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Video Classrooms (outside dashboard layouts) */}
              {/* New Virtual Classroom (unified for teacher & student) - also handling legacy routes */}
              <Route path="/virtual-class/:classId" element={
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading classroom…</div>}>
                  <VirtualClass />
                </Suspense>
              } />

              {/* Legacy Routes - kept for backward compatibility */}
              <Route path="/teacher/classroom/:classId" element={
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading classroom…</div>}>
                  <VirtualClass />
                </Suspense>
              } />
              <Route path="/student/classroom/:classId" element={
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading classroom…</div>}>
                  <VirtualClass />
                </Suspense>
              } />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="approvals" element={<TeacherApprovals />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="teachers/:id" element={<AdminTeacherDetail />} /> {/* Added TeacherDetail route */}
                <Route path="students" element={<AdminStudents />} />
                <Route path="students/:id" element={<StudentProfile />} />
                <Route path="classes" element={<AdminClasses />} />
                <Route path="schedule" element={<AdminSchedule />} /> {/* Updated AdminSchedule */}
                <Route path="payments" element={<AdminPayments />} />
                <Route path="salaries" element={<AdminSalaries />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="analytics" element={<AdminPagePlaceholder title="Analytics" />} />
                <Route path="logs" element={<AdminLogs />} />
                <Route path="performance" element={<AdminPerformance />} />
                <Route path="monitor" element={<AdminMonitor />} />
                <Route path="exams" element={<AdminExams />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="leave-approvals" element={<AdminLeaveApprovals />} />
              </Route>

              {/* Protected Teacher Dashboard Routes */}
              <Route path="/teacher" element={<DashboardLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="today-classes" element={<TodayClasses />} />
                <Route path="classes" element={<Classes />} />
                <Route path="schedule" element={<ClassSchedule />} />
                <Route path="students" element={<Students />} />
                <Route path="students/:id" element={<StudentProfile />} />
                <Route path="find-students" element={<FindStudents />} />
                <Route path="connection-requests" element={<ConnectionRequests />} />
                <Route path="profile" element={<TeacherProfile />} />

                {/* Lessons Sub-routes */}
                <Route path="lessons/add" element={<AddLesson />} />
                <Route path="lessons/history" element={<LessonHistory />} />
                <Route path="lessons/examiner" element={<ExaminerRemarks />} />

                <Route path="attendance" element={<Attendance />} />
                <Route path="reminder" element={<Reminders />} />

                {/* Phase 9: Communication & Tasks */}
                <Route path="tasks" element={<Tasks />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="suggestions" element={<Suggestions />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="improvement" element={<Improvement />} />
                <Route path="rules" element={<Rules />} />
                <Route path="instruction" element={<Instructions />} />

                {/* Phase 10: Salary & Deductions */}
                <Route path="salary" element={<Salary />} />
                <Route path="deductions" element={<Deductions />} />
                <Route path="leave-requests" element={<TeacherLeaveRequests />} />
                <Route path="messages" element={<TeacherMessages />} />

                {/* New Teacher Routes */}
                <Route path="performance" element={<AdminPagePlaceholder title="My Performance" />} />
                <Route path="exams" element={<AdminPagePlaceholder title="Teacher Exams Portal" />} />
                <Route path="security" element={<SecuritySettings />} />
              </Route>

              {/* Protected Student Dashboard Routes */}
              <Route element={<StudentLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/today" element={<StudentTodayClasses />} />
                <Route path="/student/find-tutors" element={<FindTutors />} />
                {/* Alias for better navigation */}
                <Route path="/find-tutors" element={<FindTutors />} />
                <Route path="/student/my-teacher" element={<MyTeacher />} />
                <Route path="/student/classes" element={<MyClasses />} />
                <Route path="/student/schedule" element={<MySchedule />} />
                <Route path="/student/lessons" element={<StudentLessons />} />
                <Route path="/student/progress" element={<MyProgress />} />
                <Route path="/student/attendance" element={<StudentAttendance />} />
                <Route path="/student/messages" element={<StudentMessages />} />
                <Route path="/student/requests" element={<StudentRequests />} />
                <Route path="/student/exams" element={<StudentExams />} />
                <Route path="/student/announcements" element={<StudentAnnouncements />} />
                <Route path="/student/profile" element={<StudentProfile2 />} />
                <Route path="/student/settings" element={<StudentSettings />} />
                <Route path="/student/help" element={<StudentHelp />} />

                {/* Parent Specific Routes */}
                <Route path="/student/audit-logs" element={<ClassAuditLogs />} />
                <Route path="/student/ai-tutor" element={<AITutor />} />
                <Route path="/student/security" element={<SecuritySettings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </RealtimeProvider>
    </AuthProvider>
  </QueryClientProvider >
);

export default App;
