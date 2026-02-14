-- Migration: 002_virtual_sessions
-- Creates tables for the new virtual classroom feature:
--   class_sessions, session_participants, session_chats,
--   session_logs, moderation_events

-- ── class_sessions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'live'
    CHECK (status IN ('live', 'ended', 'cancelled')),
  livekit_room_name text NOT NULL,
  recording_url text,
  whiteboard_snapshot_url text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_class_sessions_class_id
  ON class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_status
  ON class_sessions(status);

-- ── session_participants ───────────────────────────
CREATE TABLE IF NOT EXISTS session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher', 'student')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  duration_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_participants_session
  ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user
  ON session_participants(user_id);

-- ── session_chats ─────────────────────────────────
CREATE TABLE IF NOT EXISTS session_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_chats_session
  ON session_chats(session_id);

-- ── session_logs ──────────────────────────────────
CREATE TABLE IF NOT EXISTS session_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  event text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_logs_session
  ON session_logs(session_id);

-- ── moderation_events ─────────────────────────────
CREATE TABLE IF NOT EXISTS moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  original_message text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_events_session
  ON moderation_events(session_id);

-- ── Row Level Security ────────────────────────────

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_events ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read their own session data
CREATE POLICY "Users can view sessions for their classes"
  ON class_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      LEFT JOIN teachers t ON t.id = c.teacher_id
      LEFT JOIN students s ON s.id = c.student_id
      WHERE c.id = class_sessions.class_id
        AND (t.user_id = auth.uid() OR s.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can view participants in their sessions"
  ON session_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_sessions cs
      JOIN classes c ON c.id = cs.class_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      LEFT JOIN students s ON s.id = c.student_id
      WHERE cs.id = session_participants.session_id
        AND (t.user_id = auth.uid() OR s.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can view chats in their sessions"
  ON session_chats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_sessions cs
      JOIN classes c ON c.id = cs.class_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      LEFT JOIN students s ON s.id = c.student_id
      WHERE cs.id = session_chats.session_id
        AND (t.user_id = auth.uid() OR s.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can view logs in their sessions"
  ON session_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_sessions cs
      JOIN classes c ON c.id = cs.class_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      LEFT JOIN students s ON s.id = c.student_id
      WHERE cs.id = session_logs.session_id
        AND (t.user_id = auth.uid() OR s.user_id = auth.uid())
    )
  );

-- Moderation events: only service_role can insert/read (handled by edge functions)
-- No public RLS policy needed; the default deny-all is correct.

-- Enable realtime for session_chats so the ChatBox component gets live updates
ALTER PUBLICATION supabase_realtime ADD TABLE session_chats;
