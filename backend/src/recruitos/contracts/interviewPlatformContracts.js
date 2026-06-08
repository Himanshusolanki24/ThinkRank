const SOCKET_NAMESPACE = "/api/recruit-os/session";

const SOCKET_EVENTS = {
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_STATE: "room:state",
  PARTICIPANT_JOINED: "participant:joined",
  PARTICIPANT_LEFT: "participant:left",
  PARTICIPANT_UPDATED: "participant:updated",
  WEBRTC_OFFER: "webrtc:offer",
  WEBRTC_ANSWER: "webrtc:answer",
  WEBRTC_ICE_CANDIDATE: "webrtc:ice-candidate",
  TRANSCRIPT_CHUNK: "transcript:chunk",
  TRANSCRIPT_PARTIAL: "transcript:partial",
  TRANSCRIPT_FINAL: "transcript:final",
  AI_INSIGHT: "ai:insight",
  AI_FOLLOWUP: "ai:followup",
  CODING_CHANGE: "coding:change",
  CODING_CURSOR: "coding:cursor",
  CODING_RUN: "coding:run",
  CODING_EXECUTION: "coding:execution",
  INTEGRITY_EVENT: "integrity:event",
  INTEGRITY_ALERT: "integrity:alert",
  SCREEN_START: "screen:start",
  SCREEN_STOP: "screen:stop",
  HAND_RAISE: "hand:raise",
  NETWORK_QUALITY: "network:quality",
};

const REST_ROUTES = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  ROOMS: {
    ROOT: "/api/interview-rooms",
    JOIN: "/api/interview-rooms/:roomId/join",
    LEAVE: "/api/interview-rooms/:roomId/leave",
  },
  SESSIONS: {
    START: "/api/interview-sessions/start",
    END: "/api/interview-sessions/:sessionId/end",
    REPORT: "/api/interview-sessions/:sessionId/report",
    TRANSCRIPT: "/api/interview-sessions/:sessionId/transcript",
    FEEDBACK: "/api/interview-sessions/:sessionId/ai-feedback",
  },
  CODING: {
    ROOT: "/api/coding-sessions",
    RUN: "/api/coding-sessions/:codingSessionId/run",
    SUBMIT: "/api/coding-sessions/:codingSessionId/submit",
  },
};

const ROOM_ROLES = {
  CANDIDATE: "candidate",
  RECRUITER: "recruiter",
  OBSERVER: "observer",
  AI: "ai",
};

module.exports = {
  SOCKET_NAMESPACE,
  SOCKET_EVENTS,
  REST_ROUTES,
  ROOM_ROLES,
};
