// Virtual Classroom Types

export type UserRole = 'teacher' | 'student';

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

export type SessionStatus = 'scheduled' | 'live' | 'ended';

// ── Database Row Types ────────────────────────────

export interface ClassSession {
  id: string;
  class_id: string;
  status: SessionStatus;
  livekit_room_name: string | null;
  recording_url: string | null;
  whiteboard_snapshot_url: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  left_at: string | null;
  duration_seconds: number | null;
}

export interface SessionChat {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  is_blocked: boolean;
  created_at: string;
}

export interface ModerationEvent {
  id: string;
  session_id: string;
  user_id: string;
  original_message: string;
  reason: string;
  created_at: string;
}

export interface SessionLog {
  id: string;
  session_id: string;
  event: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── API Payloads ──────────────────────────────────

export interface CreateSessionPayload {
  class_id: string;
}

export interface CreateSessionResponse {
  session_id: string;
  livekit_token: string;
  livekit_url: string;
  room_name: string;
}

export interface JoinSessionPayload {
  session_id: string;
}

export interface JoinSessionResponse {
  livekit_token: string;
  livekit_url: string;
  room_name: string;
  session: ClassSession;
}

export interface SendMessagePayload {
  session_id: string;
  message: string;
}

export interface SendMessageResponse {
  chat: SessionChat;
}

export interface RecordingPayload {
  session_id: string;
}

export interface RecordingResponse {
  egress_id?: string;
  status: string;
}

export interface GetSessionResponse {
  session: ClassSession;
  participants: SessionParticipant[];
}

// ── Video Provider Adapter ────────────────────────

export interface VideoTrackInfo {
  trackSid: string;
  participantId: string;
  kind: 'audio' | 'video';
  stream?: MediaStream;
}

export interface VideoParticipantInfo {
  identity: string;
  sid: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  tracks: VideoTrackInfo[];
}

export interface DataChannelMessage {
  senderId: string;
  payload: string;
  topic?: string;
}

export type VideoProviderEventMap = {
  participantJoined: (p: VideoParticipantInfo) => void;
  participantLeft: (p: VideoParticipantInfo) => void;
  trackSubscribed: (track: VideoTrackInfo) => void;
  trackUnsubscribed: (track: VideoTrackInfo) => void;
  connectionStateChanged: (state: ConnectionStatus) => void;
  dataReceived: (msg: DataChannelMessage) => void;
  activeSpeakerChanged: (speakers: string[]) => void;
};

export interface VideoProviderAdapter {
  connect(url: string, token: string): Promise<void>;
  disconnect(): void;
  setMicEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  getLocalVideoStream(): MediaStream | null;
  getRemoteVideoStream(participantId: string): MediaStream | null;
  sendData(payload: string, topic?: string): void;
  on<K extends keyof VideoProviderEventMap>(
    event: K,
    handler: VideoProviderEventMap[K]
  ): void;
  off<K extends keyof VideoProviderEventMap>(
    event: K,
    handler: VideoProviderEventMap[K]
  ): void;
}
