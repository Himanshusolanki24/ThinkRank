export type InterviewerPersona =
  | "google"
  | "amazon"
  | "startup_cto"
  | "cp_mentor";

export interface PublicProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface PublicInterviewProblem {
  prompt: string;
  constraints: string[];
  examples: PublicProblemExample[];
  starterCode?: Record<string, string>;
  inputFormat?: string;
  outputFormat?: string;
  notes?: string[];
}

export interface IntegrityTelemetryPayload {
  tabSwitches: number;
  copyPasteAttempts: number;
  hiddenWindowSeconds: number;
  multipleFaceFrames: number;
  gazeAwayFrames: number;
  suspiciousIdleSeconds: number;
  abnormalTypingBursts: number;
  audioDeviceChanges: number;
}

export interface InterviewOSBootstrapPayload {
  sessionId: string;
  persona: InterviewerPersona;
  publicProblem: PublicInterviewProblem;
  integrityScore: number;
  verificationStatus: "verified" | "review" | "unverified";
}

export interface InterviewOSSessionState {
  verificationStatus: "verified" | "review" | "unverified";
  integrityScore: number;
}

export interface InterviewOSSessionStartResponse {
  sessionId: string;
  persona: InterviewerPersona;
  roundIndex: number;
  publicProblem: PublicInterviewProblem;
  interviewState: InterviewOSSessionState;
}

export interface InterviewEvaluationPayload {
  score?: number;
  problemSolvingScore?: number;
  communicationScore?: number;
  optimizationScore?: number;
  confidenceScore?: number;
  edgeCaseScore?: number;
  debuggingScore?: number;
}

export interface InterviewOSSessionNextResponse {
  sessionId: string;
  roundIndex: number;
  adaptiveDecision: {
    performanceBand: "strong" | "mixed" | "weak";
    trajectory: "upgrade" | "hold" | "downgrade";
    nextDifficulty: "easy" | "medium" | "hard";
    shouldAskOptimizationFollowUp: boolean;
    shouldProbeEdgeCases: boolean;
    shouldInjectBehavioralProbe: boolean;
    shouldEscalateIntegrityReview: boolean;
    nextTopicStrategy: string;
    recommendedWeakTopic: string | null;
  };
  integrity: {
    integrityScore: number;
    status: "verified" | "review" | "unverified";
    requiresHumanReview: boolean;
    shouldFreezeSession: boolean;
  };
  nextProblem: PublicInterviewProblem;
  interviewerGuidance: {
    optimizationFollowUp: string;
    edgeCaseProbe: string;
    pressurePrompt: string;
  };
}

export const interviewOSSocketEvents = {
  clientToServer: [
    "session.join",
    "session.ready",
    "audio.chunk",
    "transcript.partial",
    "editor.change",
    "editor.run",
    "editor.submit",
    "presence.visibility",
    "presence.focus",
    "integrity.signal",
    "camera.frame.meta",
    "heartbeat",
  ],
  serverToClient: [
    "session.bootstrap",
    "problem.presented",
    "interviewer.speaking",
    "interviewer.interrupt",
    "transcript.final",
    "evaluation.partial",
    "evaluation.round_complete",
    "integrity.warning",
    "integrity.status",
    "session.timer",
    "session.complete",
    "report.ready",
  ],
} as const;
