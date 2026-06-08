export type RoomRole = "candidate" | "recruiter" | "observer" | "ai";

export interface InterviewParticipant {
  id: string;
  displayName: string;
  role: RoomRole;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  connectionQuality: "good" | "fair" | "poor";
}

export interface TranscriptEntry {
  id: string;
  sessionId: string;
  speakerId?: string;
  speakerLabel: string;
  speakerType: "candidate" | "recruiter" | "ai";
  text: string;
  startedMs?: number;
  endedMs?: number;
  confidence?: number;
  fillerWordCount?: number;
  sentimentScore?: number;
}

export interface AIInsight {
  sessionId: string;
  timestampMs: number;
  confidenceScore: number;
  communicationScore: number;
  technicalScore: number;
  engagementScore?: number;
  sentimentScore?: number;
  speakingSpeedWpm?: number;
  followUpQuestion?: string;
  summary?: string;
}

export interface CodingExecutionResult {
  status: "queued" | "running" | "accepted" | "wrong_answer" | "runtime_error" | "compile_error";
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  passedCount?: number;
  totalCount?: number;
}

export interface CodingSessionState {
  id: string;
  sessionId: string;
  language: string;
  code: string;
  visibleTests: Array<{ input: unknown; expected: unknown }>;
  hiddenTestsCount: number;
  lastExecution?: CodingExecutionResult;
}

export interface IntegrityEventPayload {
  sessionId: string;
  eventType:
    | "tab_switch"
    | "camera_absent"
    | "multiple_faces"
    | "background_noise"
    | "copy_paste"
    | "window_blur";
  severity: "low" | "medium" | "high";
  details?: Record<string, unknown>;
}

export interface InterviewRoomState {
  roomId: string;
  sessionId?: string;
  participants: InterviewParticipant[];
  transcript: TranscriptEntry[];
  aiInsights: AIInsight[];
  coding?: CodingSessionState;
  integrityEvents: IntegrityEventPayload[];
}