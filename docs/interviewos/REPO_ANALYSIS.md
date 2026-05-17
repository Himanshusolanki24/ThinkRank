# ThinkRank Repo Analysis

## Current state

ThinkRank already contains the foundations of a strong interview intelligence product:

- `frontend/`: React 18 + TypeScript + Tailwind + shadcn/ui app with interview pages and premium visual language.
- `backend/`: Express API with interview start/submit flows, AI-backed evaluation, Supabase integration, and question-bank helpers.
- `coding_signals/`: Python service for multi-platform coding analytics.

## What exists today

- Skill genome and dashboard UX are already present.
- Interview flows exist at [`frontend/src/pages/Interview.tsx`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/frontend/src/pages/Interview.tsx) and [`frontend/src/pages/TechnicalInterview.tsx`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/frontend/src/pages/TechnicalInterview.tsx).
- Backend interview routes exist at [`backend/src/routes/interviewRoutes.js`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/backend/src/routes/interviewRoutes.js).
- There is already a hidden-topic style structured question bank, but the current frontend still receives topic and difficulty metadata directly.

## Gaps against InterviewOS vision

- No real-time WebSocket session orchestration.
- No voice pipeline integration.
- No secure anti-cheat telemetry service.
- No backend-only problem payload sanitizer enforcing metadata secrecy.
- No formal integrity score engine.
- No microservice-oriented session/event architecture.
- No production-grade Interview Genome schema for long-term adaptive intelligence.

## Upgrade strategy

Instead of replacing the current app, InterviewOS should become the next architecture layer:

1. Keep the current React UI shell and premium visuals.
2. Preserve the current Express backend as the API gateway.
3. Add `interviewos/` domain modules for adaptive orchestration and hidden metadata enforcement.
4. Move live session behavior to WebSocket-first flows.
5. Introduce Python analytics workers for gaze, pose, face count, and typing telemetry.
6. Store long-term genome dimensions in PostgreSQL + pgvector.

## Setup added in this pass

- Backend InterviewOS scaffolding route group: `/api/interview-os/*`
- Hidden metadata sanitizer contract
- Personality profiles
- Adaptive decision engine
- Integrity score engine
- WebSocket event contract
- Prompt-library skeleton
- Production database schema draft
- Frontend-safe InterviewOS TypeScript contracts
