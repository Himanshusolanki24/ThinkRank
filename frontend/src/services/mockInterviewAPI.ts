/**
 * Mock Interview API client
 */
import { API_BASE_URL } from "@/lib/api";

const BASE = `${API_BASE_URL}/api/mock-interview`;

export interface InterviewQuestion {
  title: string;
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  difficulty: string;
  category: string;
  testCases: { input: any; expected: any }[];
}

export interface AIPersona {
  name: string;
  company: string;
}

export interface ConversationMessage {
  role: "ai" | "user" | "system";
  content: string;
  type: string;
  timestamp: number;
}

export interface CodeReview {
  correctness: { score: number; issues: string[] };
  timeComplexity: { detected: string; optimal: string; score: number };
  spaceComplexity: { detected: string; optimal: string; score: number };
  codeQuality: { score: number; issues: string[] };
  edgeCases: { handled: string[]; missing: string[]; score: number };
  optimization: { suggestions: string[]; score: number };
  overallScore: number;
  feedback: string;
  interviewerComment: string;
}

export interface InterviewReport {
  overall_score: number;
  communication_score: number;
  dsa_score: number;
  code_quality_score: number;
  problem_solving_score: number;
  optimization_score: number;
  confidence_score: number;
  interview_readiness: number;
  feedback_summary: string;
  strengths: string[];
  weaknesses: string[];
  improvement_areas: string[];
  recommended_topics: string[];
  recommended_leetcode: string[];
  study_plan: Record<string, string>;
}

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data.data;
}

export const mockInterviewAPI = {
  startSession: (config: { userId?: string; companyStyle: string; difficulty: string; language: string }) =>
    request("/start", { method: "POST", body: JSON.stringify(config) }),

  sendMessage: (sessionId: string, message: string, code?: string) =>
    request("/message", { method: "POST", body: JSON.stringify({ sessionId, message, code }) }),

  runCode: (sessionId: string, code: string, language: string, customInput?: string) =>
    request("/run", { method: "POST", body: JSON.stringify({ sessionId, code, language, customInput }) }),

  submitCode: (sessionId: string, code: string, language: string) =>
    request("/submit", { method: "POST", body: JSON.stringify({ sessionId, code, language }) }),

  nextQuestion: (sessionId: string) =>
    request("/next-question", { method: "POST", body: JSON.stringify({ sessionId }) }),

  endSession: (sessionId: string) =>
    request("/end", { method: "POST", body: JSON.stringify({ sessionId }) }),

  getHint: (sessionId: string) =>
    request("/hint", { method: "POST", body: JSON.stringify({ sessionId }) }),

  reportIntegrity: (sessionId: string, event: string) =>
    request("/integrity", { method: "POST", body: JSON.stringify({ sessionId, event }) }),

  getPersonas: () => request("/personas"),

  enhanceProblem: (problemText: string) =>
    request("/enhance-problem", { method: "POST", body: JSON.stringify({ problemText }) }),
};
