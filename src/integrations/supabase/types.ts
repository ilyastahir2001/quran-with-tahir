export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          requirement_type: string
          requirement_value: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          requirement_type: string
          requirement_value: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          requirement_type?: string
          requirement_value?: number
          title?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          target_resource: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_resource?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_resource?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          role: Database["public"]["Enums"]["admin_role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          role: Database["public"]["Enums"]["admin_role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["admin_role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_sessions: {
        Row: {
          accuracy_score: number | null
          audio_url: string | null
          created_at: string
          feedback_data: Json | null
          id: string
          student_id: string | null
          surah_id: number
        }
        Insert: {
          accuracy_score?: number | null
          audio_url?: string | null
          created_at?: string
          feedback_data?: Json | null
          id?: string
          student_id?: string | null
          surah_id: number
        }
        Update: {
          accuracy_score?: number | null
          audio_url?: string | null
          created_at?: string
          feedback_data?: Json | null
          id?: string
          student_id?: string | null
          surah_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_activity_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      annotations: {
        Row: {
          ayah_id: number
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          visibility: string
        }
        Insert: {
          ayah_id: number
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          visibility?: string
        }
        Update: {
          ayah_id?: number
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_ayah_id_fkey"
            columns: ["ayah_id"]
            isOneToOne: false
            referencedRelation: "ayahs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          published_at: string | null
          target_role: Database["public"]["Enums"]["app_role"] | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          published_at?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          published_at?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          title?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          class_id: string
          created_at: string
          id: string
          note: string | null
          recorded_at: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          teacher_id: string
          updated_by: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          note?: string | null
          recorded_at?: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          teacher_id: string
          updated_by?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          note?: string | null
          recorded_at?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          teacher_id?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      ayahs: {
        Row: {
          ayah_number: number
          id: number
          juz: number
          page: number | null
          sajda: boolean | null
          surah_id: number
          text_ar: string
        }
        Insert: {
          ayah_number: number
          id?: never
          juz: number
          page?: number | null
          sajda?: boolean | null
          surah_id: number
          text_ar: string
        }
        Update: {
          ayah_number?: number
          id?: never
          juz?: number
          page?: number | null
          sajda?: boolean | null
          surah_id?: number
          text_ar?: string
        }
        Relationships: [
          {
            foreignKeyName: "ayahs_surah_id_fkey"
            columns: ["surah_id"]
            isOneToOne: false
            referencedRelation: "surahs"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          ayah_id: number
          created_at: string | null
          id: string
          label: string | null
          user_id: string
        }
        Insert: {
          ayah_id: number
          created_at?: string | null
          id?: string
          label?: string | null
          user_id: string
        }
        Update: {
          ayah_id?: number
          created_at?: string | null
          id?: string
          label?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_ayah_id_fkey"
            columns: ["ayah_id"]
            isOneToOne: false
            referencedRelation: "ayahs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          class_id: string
          event: Database["public"]["Enums"]["call_event"]
          id: string
          metadata: Json | null
          room_id: string | null
          room_url: string | null
          student_id: string
          teacher_id: string
          timestamp: string
        }
        Insert: {
          class_id: string
          event: Database["public"]["Enums"]["call_event"]
          id?: string
          metadata?: Json | null
          room_id?: string | null
          room_url?: string | null
          student_id: string
          teacher_id: string
          timestamp?: string
        }
        Update: {
          class_id?: string
          event?: Database["public"]["Enums"]["call_event"]
          id?: string
          metadata?: Json | null
          room_id?: string | null
          room_url?: string | null
          student_id?: string
          teacher_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_type: string
          created_at: string
          exam_id: string | null
          grading_id: string | null
          id: string
          issue_date: string
          metadata: Json | null
          student_id: string
          title: string
          updated_at: string
          verification_code: string
        }
        Insert: {
          certificate_type: string
          created_at?: string
          exam_id?: string | null
          grading_id?: string | null
          id?: string
          issue_date?: string
          metadata?: Json | null
          student_id: string
          title: string
          updated_at?: string
          verification_code: string
        }
        Update: {
          certificate_type?: string
          created_at?: string
          exam_id?: string | null
          grading_id?: string | null
          id?: string
          issue_date?: string
          metadata?: Json | null
          student_id?: string
          title?: string
          updated_at?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_grading_id_fkey"
            columns: ["grading_id"]
            isOneToOne: false
            referencedRelation: "exam_grading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          call_room_id: string | null
          call_room_url: string | null
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          is_recovery: boolean | null
          lesson_added: boolean | null
          notes: string | null
          recovery_for_class_id: string | null
          scheduled_date: string
          start_time: string
          status: Database["public"]["Enums"]["class_status"] | null
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          call_room_id?: string | null
          call_room_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          is_recovery?: boolean | null
          lesson_added?: boolean | null
          notes?: string | null
          recovery_for_class_id?: string | null
          scheduled_date: string
          start_time: string
          status?: Database["public"]["Enums"]["class_status"] | null
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          call_room_id?: string | null
          call_room_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          is_recovery?: boolean | null
          lesson_added?: boolean | null
          notes?: string | null
          recovery_for_class_id?: string | null
          scheduled_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["class_status"] | null
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_recovery_for_class_id_fkey"
            columns: ["recovery_for_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          admin_response: string | null
          attachments: string[] | null
          created_at: string
          description: string
          id: string
          status: Database["public"]["Enums"]["complaint_status"] | null
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          attachments?: string[] | null
          created_at?: string
          description: string
          id?: string
          status?: Database["public"]["Enums"]["complaint_status"] | null
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          attachments?: string[] | null
          created_at?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["complaint_status"] | null
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          created_at: string
          id: string
          initiated_by_role: string | null
          message: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["connection_status"]
          student_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiated_by_role?: string | null
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          student_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initiated_by_role?: string | null
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      deductions: {
        Row: {
          amount: number
          created_at: string
          deduction_date: string
          id: string
          reason: string
          review_requested: boolean | null
          review_status: string | null
          salary_record_id: string | null
          teacher_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deduction_date?: string
          id?: string
          reason: string
          review_requested?: boolean | null
          review_status?: string | null
          salary_record_id?: string | null
          teacher_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deduction_date?: string
          id?: string
          reason?: string
          review_requested?: boolean | null
          review_status?: string | null
          salary_record_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deductions_salary_record_id_fkey"
            columns: ["salary_record_id"]
            isOneToOne: false
            referencedRelation: "salary_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deductions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deductions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_grading: {
        Row: {
          completed_at: string | null
          exam_id: string | null
          examiner_feedback: string | null
          fluency_score: number | null
          id: string
          is_passed: boolean | null
          memorization_score: number | null
          mistakes_json: Json | null
          tajweed_score: number | null
          total_score: number | null
        }
        Insert: {
          completed_at?: string | null
          exam_id?: string | null
          examiner_feedback?: string | null
          fluency_score?: number | null
          id?: string
          is_passed?: boolean | null
          memorization_score?: number | null
          mistakes_json?: Json | null
          tajweed_score?: number | null
          total_score?: number | null
        }
        Update: {
          completed_at?: string | null
          exam_id?: string | null
          examiner_feedback?: string | null
          fluency_score?: number | null
          id?: string
          is_passed?: boolean | null
          memorization_score?: number | null
          mistakes_json?: Json | null
          tajweed_score?: number | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_grading_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          juz_number: number | null
          preferred_date: string | null
          status: Database["public"]["Enums"]["exam_request_status"]
          student_id: string | null
          surah_name: string | null
          teacher_id: string | null
          type: Database["public"]["Enums"]["exam_type"]
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          juz_number?: number | null
          preferred_date?: string | null
          status?: Database["public"]["Enums"]["exam_request_status"]
          student_id?: string | null
          surah_name?: string | null
          teacher_id?: string | null
          type?: Database["public"]["Enums"]["exam_type"]
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          juz_number?: number | null
          preferred_date?: string | null
          status?: Database["public"]["Enums"]["exam_request_status"]
          student_id?: string | null
          surah_name?: string | null
          teacher_id?: string | null
          type?: Database["public"]["Enums"]["exam_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      examiner_remarks: {
        Row: {
          created_at: string
          examiner_id: string | null
          id: string
          lesson_id: string | null
          remarks_text: string
          student_id: string
          tags: string[] | null
          teacher_id: string | null
          teacher_response: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          examiner_id?: string | null
          id?: string
          lesson_id?: string | null
          remarks_text: string
          student_id: string
          tags?: string[] | null
          teacher_id?: string | null
          teacher_response?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          examiner_id?: string | null
          id?: string
          lesson_id?: string | null
          remarks_text?: string
          student_id?: string
          tags?: string[] | null
          teacher_id?: string | null
          teacher_response?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examiner_remarks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_remarks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_remarks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_remarks_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_remarks_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          examiner_id: string | null
          id: string
          meeting_link: string | null
          request_id: string | null
          scheduled_at: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          examiner_id?: string | null
          id?: string
          meeting_link?: string | null
          request_id?: string | null
          scheduled_at: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          examiner_id?: string | null
          id?: string
          meeting_link?: string | null
          request_id?: string | null
          scheduled_at?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_examiner_id_fkey"
            columns: ["examiner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "exam_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          from_type: string | null
          from_user_id: string | null
          id: string
          message: string
          rating: number | null
          subject: string | null
          teacher_id: string
          teacher_response: string | null
        }
        Insert: {
          created_at?: string
          from_type?: string | null
          from_user_id?: string | null
          id?: string
          message: string
          rating?: number | null
          subject?: string | null
          teacher_id: string
          teacher_response?: string | null
        }
        Update: {
          created_at?: string
          from_type?: string | null
          from_user_id?: string | null
          id?: string
          message?: string
          rating?: number | null
          subject?: string | null
          teacher_id?: string
          teacher_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      improvements: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          evidence_url: string | null
          examiner_id: string | null
          id: string
          is_completed: boolean | null
          required_action: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description: string
          evidence_url?: string | null
          examiner_id?: string | null
          id?: string
          is_completed?: boolean | null
          required_action?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          evidence_url?: string | null
          examiner_id?: string | null
          id?: string
          is_completed?: boolean | null
          required_action?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "improvements_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "improvements_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      instructions: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          id: string
          is_active: boolean | null
          order_index: number | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          due_date: string
          id: string
          notes: string | null
          paid_at: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          due_date: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      juzs: {
        Row: {
          end_ayah: number
          end_surah: number
          juz_number: number
          start_ayah: number
          start_surah: number
        }
        Insert: {
          end_ayah: number
          end_surah: number
          juz_number: number
          start_ayah: number
          start_surah: number
        }
        Update: {
          end_ayah?: number
          end_surah?: number
          juz_number?: number
          start_ayah?: number
          start_surah?: number
        }
        Relationships: []
      }
      lessons: {
        Row: {
          ayah_from: number | null
          ayah_to: number | null
          class_id: string | null
          comments: string | null
          course_level: string | null
          created_at: string
          ethics: string | null
          fundamental_islam: string | null
          id: string
          images: string[] | null
          is_quick_lesson: boolean | null
          juzz: number | null
          memorization_ayah_from: number | null
          memorization_ayah_to: number | null
          memorization_surah: string | null
          method: string | null
          page_from: number | null
          page_to: number | null
          quran_completed: boolean | null
          quran_subject: string | null
          rating_concentration: number | null
          rating_progress: number | null
          rating_revision: number | null
          student_id: string
          surah: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          ayah_from?: number | null
          ayah_to?: number | null
          class_id?: string | null
          comments?: string | null
          course_level?: string | null
          created_at?: string
          ethics?: string | null
          fundamental_islam?: string | null
          id?: string
          images?: string[] | null
          is_quick_lesson?: boolean | null
          juzz?: number | null
          memorization_ayah_from?: number | null
          memorization_ayah_to?: number | null
          memorization_surah?: string | null
          method?: string | null
          page_from?: number | null
          page_to?: number | null
          quran_completed?: boolean | null
          quran_subject?: string | null
          rating_concentration?: number | null
          rating_progress?: number | null
          rating_revision?: number | null
          student_id: string
          surah?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          ayah_from?: number | null
          ayah_to?: number | null
          class_id?: string | null
          comments?: string | null
          course_level?: string | null
          created_at?: string
          ethics?: string | null
          fundamental_islam?: string | null
          id?: string
          images?: string[] | null
          is_quick_lesson?: boolean | null
          juzz?: number | null
          memorization_ayah_from?: number | null
          memorization_ayah_to?: number | null
          memorization_surah?: string | null
          method?: string | null
          page_from?: number | null
          page_to?: number | null
          quran_completed?: boolean | null
          quran_subject?: string | null
          rating_concentration?: number | null
          rating_progress?: number | null
          rating_revision?: number | null
          student_id?: string
          surah?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          payload: Json | null
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          payload?: Json | null
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          payload?: Json | null
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      payment_plans: {
        Row: {
          amount: number
          billing_period: Database["public"]["Enums"]["billing_period"] | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          amount?: number
          billing_period?: Database["public"]["Enums"]["billing_period"] | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_period?: Database["public"]["Enums"]["billing_period"] | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          method: string | null
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          language_pref: string | null
          metadata: Json | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          language_pref?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          language_pref?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_ayahs: {
        Row: {
          ayah_global: number
          ayah_number: number
          created_at: string | null
          id: number
          surah_name: string
          surah_number: number
          text_ar: string
          translation_en: string | null
        }
        Insert: {
          ayah_global: number
          ayah_number: number
          created_at?: string | null
          id?: number
          surah_name: string
          surah_number: number
          text_ar: string
          translation_en?: string | null
        }
        Update: {
          ayah_global?: number
          ayah_number?: number
          created_at?: string | null
          id?: number
          surah_name?: string
          surah_number?: number
          text_ar?: string
          translation_en?: string | null
        }
        Relationships: []
      }
      realtime_messages: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          recipient: string
          sender: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          recipient: string
          sender: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          recipient?: string
          sender?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean | null
          remind_at: string
          repeat_type: string | null
          student_id: string | null
          teacher_id: string
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          remind_at: string
          repeat_type?: string | null
          student_id?: string | null
          teacher_id: string
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          remind_at?: string
          repeat_type?: string | null
          student_id?: string | null
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedule_requests: {
        Row: {
          class_id: string
          created_at: string
          id: string
          preferred_times: Json
          reason: string | null
          responded_at: string | null
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          preferred_times: Json
          reason?: string | null
          responded_at?: string | null
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          preferred_times?: Json
          reason?: string | null
          responded_at?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_requests_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      rules_documents: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          id: string
          is_active: boolean | null
          pdf_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          pdf_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          pdf_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      salary_records: {
        Row: {
          base_salary: number
          bonus: number | null
          classes_count: number | null
          created_at: string
          id: string
          month: string
          net_salary: number | null
          notes: string | null
          status: string | null
          teacher_id: string
          total_deductions: number | null
          updated_at: string
        }
        Insert: {
          base_salary?: number
          bonus?: number | null
          classes_count?: number | null
          created_at?: string
          id?: string
          month: string
          net_salary?: number | null
          notes?: string | null
          status?: string | null
          teacher_id: string
          total_deductions?: number | null
          updated_at?: string
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          classes_count?: number | null
          created_at?: string
          id?: string
          month?: string
          net_salary?: number | null
          notes?: string | null
          status?: string | null
          teacher_id?: string
          total_deductions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_records_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_records_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      student_feedback: {
        Row: {
          class_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number | null
          student_id: string
        }
        Insert: {
          class_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          student_id: string
        }
        Update: {
          class_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_feedback_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      student_learning_choice: {
        Row: {
          choice: string
          contract_id: string | null
          created_at: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          choice: string
          contract_id?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          choice?: string
          contract_id?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_learning_choice_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_learning_choice_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_learning_choice_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      student_settings: {
        Row: {
          accessibility_mode: string | null
          created_at: string
          id: string
          low_bandwidth_mode: boolean | null
          notification_prefs: Json | null
          student_id: string
          timezone: string | null
          updated_at: string
          video_pref: boolean | null
        }
        Insert: {
          accessibility_mode?: string | null
          created_at?: string
          id?: string
          low_bandwidth_mode?: boolean | null
          notification_prefs?: Json | null
          student_id: string
          timezone?: string | null
          updated_at?: string
          video_pref?: boolean | null
        }
        Update: {
          accessibility_mode?: string | null
          created_at?: string
          id?: string
          low_bandwidth_mode?: boolean | null
          notification_prefs?: Json | null
          student_id?: string
          timezone?: string | null
          updated_at?: string
          video_pref?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "student_settings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_settings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          accessibility_mode: string | null
          avatar_url: string | null
          country: string | null
          country_code: string | null
          course_level: string | null
          created_at: string
          current_juzz: number | null
          current_streak: number | null
          current_surah: string | null
          duration_minutes: number | null
          email: string | null
          full_name: string
          id: string
          is_parent_account: boolean | null
          language_pref: string | null
          last_activity_date: string | null
          longest_streak: number | null
          notes: string | null
          parent_id: string | null
          phone: string | null
          progress_percentage: number | null
          schedule_days: string[] | null
          schedule_time: string | null
          status: string | null
          teacher_id: string | null
          teacher_selection_mode: string | null
          timezone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accessibility_mode?: string | null
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          course_level?: string | null
          created_at?: string
          current_juzz?: number | null
          current_streak?: number | null
          current_surah?: string | null
          duration_minutes?: number | null
          email?: string | null
          full_name: string
          id?: string
          is_parent_account?: boolean | null
          language_pref?: string | null
          last_activity_date?: string | null
          longest_streak?: number | null
          notes?: string | null
          parent_id?: string | null
          phone?: string | null
          progress_percentage?: number | null
          schedule_days?: string[] | null
          schedule_time?: string | null
          status?: string | null
          teacher_id?: string | null
          teacher_selection_mode?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accessibility_mode?: string | null
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          course_level?: string | null
          created_at?: string
          current_juzz?: number | null
          current_streak?: number | null
          current_surah?: string | null
          duration_minutes?: number | null
          email?: string | null
          full_name?: string
          id?: string
          is_parent_account?: boolean | null
          language_pref?: string | null
          last_activity_date?: string | null
          longest_streak?: number | null
          notes?: string | null
          parent_id?: string | null
          phone?: string | null
          progress_percentage?: number | null
          schedule_days?: string[] | null
          schedule_time?: string | null
          status?: string | null
          teacher_id?: string | null
          teacher_selection_mode?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          admin_response: string | null
          created_at: string
          description: string
          id: string
          status: Database["public"]["Enums"]["complaint_status"] | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description: string
          id?: string
          status?: Database["public"]["Enums"]["complaint_status"] | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["complaint_status"] | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      surahs: {
        Row: {
          ayah_count: number
          id: number
          name_ar: string
          name_en: string | null
          order_index: number
          revelation_place: string | null
        }
        Insert: {
          ayah_count: number
          id: number
          name_ar: string
          name_en?: string | null
          order_index: number
          revelation_place?: string | null
        }
        Update: {
          ayah_count?: number
          id?: number
          name_ar?: string
          name_en?: string | null
          order_index?: number
          revelation_place?: string | null
        }
        Relationships: []
      }
      system_configs: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          is_public: boolean | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          is_public?: boolean | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          is_public?: boolean | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_by: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_personal: boolean | null
          proof_url: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_personal?: boolean | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_personal?: boolean | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          active: boolean | null
          assigned_at: string | null
          assigned_by: string | null
          contract_id: string | null
          id: string
          source: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          active?: boolean | null
          assigned_at?: string | null
          assigned_by?: string | null
          contract_id?: string | null
          id?: string
          source: string
          student_id: string
          teacher_id: string
        }
        Update: {
          active?: boolean | null
          assigned_at?: string | null
          assigned_by?: string | null
          contract_id?: string | null
          id?: string
          source?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_leave_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_leave_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_leave_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payout_status"]
          teacher_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payout_status"]
          teacher_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payout_status"]
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_payouts_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_payouts_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_student_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sender_type: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sender_type: string
          student_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sender_type?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_student_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_student_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_student_messages_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_student_messages_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          bio: string | null
          created_at: string
          employee_id: string | null
          hire_date: string | null
          id: string
          is_profile_hidden: boolean | null
          is_verified: boolean | null
          profile_id: string | null
          salary_base: number | null
          specializations: string[] | null
          status: string | null
          teaching_hours_per_week: number | null
          updated_at: string
          user_id: string
          verification_notes: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          is_profile_hidden?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          salary_base?: number | null
          specializations?: string[] | null
          status?: string | null
          teaching_hours_per_week?: number | null
          updated_at?: string
          user_id: string
          verification_notes?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          is_profile_hidden?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          salary_base?: number | null
          specializations?: string[] | null
          status?: string | null
          teaching_hours_per_week?: number | null
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          invoice_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          processed_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          student_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          invoice_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          invoice_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles_cleanup_backup: {
        Row: {
          backed_up_at: string | null
          created_at: string | null
          id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          backed_up_at?: string | null
          created_at?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          backed_up_at?: string | null
          created_at?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      verse_metadata: {
        Row: {
          ayah_id: number
          meta: Json
        }
        Insert: {
          ayah_id: number
          meta?: Json
        }
        Update: {
          ayah_id?: number
          meta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "verse_metadata_ayah_id_fkey"
            columns: ["ayah_id"]
            isOneToOne: true
            referencedRelation: "ayahs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_dashboard_stats: {
        Row: {
          monthly_lessons: number | null
          today_classes: number | null
          total_students: number | null
          total_teachers: number | null
        }
        Relationships: []
      }
      students_public: {
        Row: {
          avatar_url: string | null
          country: string | null
          course_level: string | null
          current_juzz: number | null
          current_surah: string | null
          full_name: string | null
          id: string | null
          language_pref: string | null
          status: string | null
          teacher_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          course_level?: string | null
          current_juzz?: number | null
          current_surah?: string | null
          full_name?: string | null
          id?: string | null
          language_pref?: string | null
          status?: string | null
          teacher_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          course_level?: string | null
          current_juzz?: number | null
          current_surah?: string | null
          full_name?: string | null
          id?: string | null
          language_pref?: string | null
          status?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          full_name: string | null
          id: string | null
          specializations: string[] | null
          status: string | null
          teaching_hours_per_week: number | null
        }
        Relationships: []
      }
      v_my_admin_roles: {
        Row: {
          created_at: string | null
          metadata: Json | null
          role: Database["public"]["Enums"]["admin_role_type"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          metadata?: Json | null
          role?: Database["public"]["Enums"]["admin_role_type"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          metadata?: Json | null
          role?: Database["public"]["Enums"]["admin_role_type"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      daily_maintenance: { Args: never; Returns: undefined }
      delete_user_completely: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      get_admin_roles: { Args: never; Returns: string[] }
      get_student_id: { Args: { _user_id: string }; Returns: string }
      get_student_id_safe: { Args: { _user_id: string }; Returns: string }
      get_teacher_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_teacher_approved: { Args: { p_teacher_id: string }; Returns: boolean }
      is_user_approved_teacher: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      search_ayahs_arabic: {
        Args: { limit_count?: number; query_text: string }
        Returns: {
          ayah_number: number
          id: number
          juz: number
          page: number
          rank: number
          surah_id: number
          text_ar: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      get_chat_user_details: {
        Args: { target_id: string }
        Returns: {
          id: string
          full_name: string
          avatar_url: string
          role: string
        }[]
      }
      get_chat_users_details: {
        Args: { target_ids: string[] }
        Returns: {
          id: string
          full_name: string
          avatar_url: string
          role: string
        }[]
      }
    }
    Enums: {
      admin_role_type:
      | "super_admin"
      | "support_admin"
      | "finance_admin"
      | "moderator"
      app_role: "admin" | "teacher" | "student"
      attendance_status: "present" | "absent" | "late" | "leave" | "no_answer"
      billing_period: "monthly" | "quarterly" | "yearly" | "one_time"
      call_event:
      | "initiated"
      | "ringing"
      | "accepted"
      | "rejected"
      | "failed"
      | "connected"
      | "disconnected"
      | "timeout"
      class_status:
      | "scheduled"
      | "in_progress"
      | "completed"
      | "missed"
      | "no_answer"
      | "cancelled"
      | "on_leave"
      complaint_status: "open" | "under_review" | "resolved" | "closed"
      connection_status: "pending" | "accepted" | "rejected"
      exam_request_status:
      | "pending"
      | "approved"
      | "rejected"
      | "scheduled"
      | "completed"
      exam_type: "hifz" | "nazra" | "tajweed_test"
      notification_type:
      | "class_reminder"
      | "admin_message"
      | "task_assignment"
      | "announcement"
      | "feedback"
      | "system"
      payment_method: "stripe" | "paypal" | "bank_transfer" | "cash" | "other"
      payment_status:
      | "pending"
      | "completed"
      | "failed"
      | "refunded"
      | "cancelled"
      payout_status: "pending" | "paid" | "failed" | "cancelled"
      task_status: "pending" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      admin_role_type: [
        "super_admin",
        "support_admin",
        "finance_admin",
        "moderator",
      ],
      app_role: ["admin", "teacher", "student"],
      attendance_status: ["present", "absent", "late", "leave", "no_answer"],
      billing_period: ["monthly", "quarterly", "yearly", "one_time"],
      call_event: [
        "initiated",
        "ringing",
        "accepted",
        "rejected",
        "failed",
        "connected",
        "disconnected",
        "timeout",
      ],
      class_status: [
        "scheduled",
        "in_progress",
        "completed",
        "missed",
        "no_answer",
        "cancelled",
        "on_leave",
      ],
      complaint_status: ["open", "under_review", "resolved", "closed"],
      connection_status: ["pending", "accepted", "rejected"],
      exam_request_status: [
        "pending",
        "approved",
        "rejected",
        "scheduled",
        "completed",
      ],
      exam_type: ["hifz", "nazra", "tajweed_test"],
      notification_type: [
        "class_reminder",
        "admin_message",
        "task_assignment",
        "announcement",
        "feedback",
        "system",
      ],
      payment_method: ["stripe", "paypal", "bank_transfer", "cash", "other"],
      payment_status: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      payout_status: ["pending", "paid", "failed", "cancelled"],
      task_status: ["pending", "in_progress", "completed"],
    },
  },
} as const
