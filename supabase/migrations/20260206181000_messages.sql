-- ==========================================
-- Messaging & Chat Module
-- ==========================================
-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 2. Indexes for Performance
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, recipient_id);
-- 3. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- 4. Policies
-- View: Users can see messages they sent OR received
CREATE POLICY "Users can view their conversations" ON public.messages FOR
SELECT USING (
        auth.uid() = sender_id
        OR auth.uid() = recipient_id
        OR public.is_admin(auth.uid())
    );
-- Insert: Users can send messages to anyone (spam protection handled by UI/Rate limits mostly, simplified here)
-- In a stricter app, checks would act on teacher-student relationships
CREATE POLICY "Users can send messages" ON public.messages FOR
INSERT WITH CHECK (auth.uid() = sender_id);
-- Update: Sender can edit? Receiver can mark read
CREATE POLICY "Recipient can mark read" ON public.messages FOR
UPDATE USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
-- 5. Realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE public.messages;