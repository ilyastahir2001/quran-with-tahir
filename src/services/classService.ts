// Class Service — Supabase wrapper for virtual classroom operations

import { supabase } from '@/integrations/supabase/client';
import type {
  ClassSession,
  SessionParticipant,
  SessionChat,
  CreateSessionPayload,
  CreateSessionResponse,
  JoinSessionPayload,
  JoinSessionResponse,
  SendMessagePayload,
  SendMessageResponse,
  RecordingPayload,
  RecordingResponse,
  GetSessionResponse,
} from '@/types/virtual';

// ── Edge Function Calls ───────────────────────────

async function invokeEdge<T>(fnName: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fnName, {
    body,
  });
  if (error) throw new Error(`Edge function ${fnName} failed: ${error.message}`);
  return data as T;
}

export const classService = {
  // ── Sessions ────────────────────────────────────

  async createSession(payload: CreateSessionPayload): Promise<CreateSessionResponse> {
    return invokeEdge<CreateSessionResponse>('create-session', payload);
  },

  async joinSession(payload: JoinSessionPayload): Promise<JoinSessionResponse> {
    return invokeEdge<JoinSessionResponse>('join-session', payload);
  },

  async endSession(sessionId: string): Promise<void> {
    await invokeEdge('end-session', { session_id: sessionId });
  },

  async getSession(sessionId: string): Promise<GetSessionResponse> {
    return invokeEdge<GetSessionResponse>('get-session', { session_id: sessionId });
  },

  // ── Chat ────────────────────────────────────────

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
    return invokeEdge<SendMessageResponse>('send-message', payload);
  },

  async getChatHistory(sessionId: string): Promise<SessionChat[]> {
    const { data, error } = await supabase
      .from('session_chats')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as SessionChat[];
  },

  // ── Recording ───────────────────────────────────

  async startRecording(payload: RecordingPayload): Promise<RecordingResponse> {
    return invokeEdge<RecordingResponse>('start-recording', payload);
  },

  async stopRecording(payload: RecordingPayload): Promise<RecordingResponse> {
    return invokeEdge<RecordingResponse>('stop-recording', payload);
  },

  // ── Participants ────────────────────────────────

  async getParticipants(sessionId: string): Promise<SessionParticipant[]> {
    const { data, error } = await supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as SessionParticipant[];
  },

  // ── Active Session Lookup ───────────────────────

  async getActiveSession(classId: string): Promise<ClassSession | null> {
    const { data, error } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('class_id', classId)
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as ClassSession | null;
  },

  // ── Session History ─────────────────────────────

  async getSessionHistory(classId: string): Promise<ClassSession[]> {
    const { data, error } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as ClassSession[];
  },

  // ── Whiteboard ──────────────────────────────────

  async saveWhiteboardSnapshot(
    sessionId: string,
    blob: Blob,
  ): Promise<string> {
    const filename = `whiteboards/${sessionId}/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('class-recordings')
      .upload(filename, blob, { contentType: 'image/png', upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('class-recordings')
      .getPublicUrl(filename);

    // Also update the session record
    await supabase
      .from('class_sessions')
      .update({ whiteboard_snapshot_url: urlData.publicUrl } as Record<string, unknown>)
      .eq('id', sessionId);

    return urlData.publicUrl;
  },
};
