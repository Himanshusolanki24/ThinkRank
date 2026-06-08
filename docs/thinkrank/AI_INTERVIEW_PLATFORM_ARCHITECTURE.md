# ThinkRank AI Interview Platform Architecture

## Goal
Build ThinkRank as a recruiter-grade interview operating system that combines:

- Google Meet style interview rooms
- AI interviewer and recruiter copilots
- live transcription and analytics
- collaborative coding rounds
- anti-cheating and integrity monitoring
- replay, reporting, and candidate ranking

This architecture is designed around the current repository, which already contains:

- `frontend/src/pages/MockInterview.tsx`
- `frontend/src/components/mock-interview/*`
- `backend/src/routes/mockInterviewRoutes.js`
- `backend/src/recruitos/sockets/interviewSocket.js`
- `backend/src/services/mockInterviewAI.js`

The target system extends those modules into a production-ready platform.

---

## Product Surfaces

### Candidate
- join scheduled interview room
- practice mock interviews
- see transcript, coding panel, and AI guidance
- review past sessions and feedback

### Recruiter
- schedule interviews
- join live rooms
- watch candidate coding and speaking behavior
- review post-interview report and replay
- compare candidates and add notes

### AI Services
- ask and adapt questions
- transcribe voice in real time
- evaluate confidence, clarity, speed, and communication
- review code and execution behavior
- generate summary, ranking, and hiring recommendation

---

## High-Level System

```text
Browser (Candidate / Recruiter)
  ├─ Next.js / React UI
  ├─ WebRTC media
  ├─ Socket.IO realtime client
  ├─ Zustand state
  └─ Monaco collaborative editor

API Gateway / App Server
  ├─ Express REST APIs
  ├─ JWT auth middleware
  ├─ Socket.IO signaling + events
  ├─ interview orchestration layer
  └─ background job producers

Core Services
  ├─ Interview Room Service
  ├─ Transcript Service
  ├─ AI Analysis Service
  ├─ Coding Session Service
  ├─ Recording Service
  ├─ Recruiter Review Service
  └─ Integrity Monitoring Service

Infrastructure
  ├─ PostgreSQL
  ├─ Redis
  ├─ S3-compatible object storage
  ├─ Judge0
  ├─ Deepgram / Whisper
  ├─ OpenAI / Mistral
  ├─ TURN/STUN
  └─ observability stack
```

---

## Recommended Frontend Structure

The current repo is Vite-based. If you migrate to Next.js, use this structure:

```text
frontend/
  src/
    app/
      (marketing)/
      auth/
      dashboard/
      recruiter/
      candidate/
      interview/
        [roomId]/
          page.tsx
      api/
    components/
      interview-room/
        VideoGrid.tsx
        ActiveSpeakerStage.tsx
        ControlsToolbar.tsx
        ParticipantTile.tsx
        ScreenShareTile.tsx
      transcript/
        TranscriptPanel.tsx
        TranscriptMessage.tsx
      ai/
        AIInsightPanel.tsx
        ConfidenceMeter.tsx
        FillerWordTracker.tsx
        FollowUpPromptCard.tsx
      coding/
        CollaborativeEditor.tsx
        CodingConsole.tsx
        TestCasePanel.tsx
      dashboards/
        RecruiterDashboard.tsx
        CandidateDashboard.tsx
        ReplayPlayer.tsx
      shared/
        GlassCard.tsx
        AnimatedMetric.tsx
        StatusPill.tsx
    features/
      auth/
      mock-interview/
      recruiter/
      coding/
      transcript/
      ai-analysis/
      anti-cheat/
    stores/
      useInterviewRoomStore.ts
      useTranscriptStore.ts
      useAIInsightStore.ts
      useCodingStore.ts
    services/
      api/
      sockets/
      webrtc/
      media/
    lib/
      auth.ts
      env.ts
      logger.ts
      analytics.ts
```

### Core Interview Layout

```text
Left   -> Video grid / participant stage
Center -> Active interview and coding workspace
Right  -> Transcript + AI insights + integrity alerts
Bottom -> Meet-like controls toolbar
```

### Frontend State with Zustand

Use isolated stores:

- `useInterviewRoomStore`
  - participants
  - local media state
  - active speaker
  - connection quality
  - raised hands
- `useTranscriptStore`
  - transcript entries
  - interim transcript
  - speaker map
- `useAIInsightStore`
  - confidence score
  - communication score
  - technical score
  - filler words
  - follow-up question
- `useCodingStore`
  - source code
  - language
  - execution state
  - test cases
  - collaboration cursors

---

## Recommended Backend Structure

```text
backend/
  src/
    app.js
    server.js
    config/
      env.js
      db.js
      redis.js
      ai.js
    modules/
      auth/
        auth.controller.js
        auth.service.js
        auth.repository.js
        auth.routes.js
        auth.validation.js
      users/
      interview-rooms/
        room.controller.js
        room.service.js
        room.repository.js
        room.routes.js
      interview-sessions/
      transcripts/
      ai-feedback/
      coding-sessions/
      recordings/
      recruiter-notes/
      rankings/
    realtime/
      socketServer.js
      namespaces/
        interview.namespace.js
      handlers/
        room.handler.js
        signaling.handler.js
        transcript.handler.js
        coding.handler.js
        integrity.handler.js
    services/
      ai/
        llm.service.js
        questionGenerator.service.js
        summary.service.js
        sentiment.service.js
      speech/
        transcription.service.js
        tts.service.js
      media/
        recording.service.js
        storage.service.js
      coding/
        judge0.service.js
      integrity/
        antiCheat.service.js
    workers/
      transcript.worker.js
      ai-analysis.worker.js
      recording.worker.js
    shared/
      middleware/
      utils/
      constants/
      contracts/
```

### Architectural Principles

- module boundaries around business domains
- repositories isolated from controllers
- realtime handlers separate from REST
- background AI work offloaded to queues
- Redis for ephemeral room/session state
- PostgreSQL for source of truth

---

## PostgreSQL Domain Model

Core tables:

- `users`
- `interview_rooms`
- `interview_room_participants`
- `interview_sessions`
- `transcripts`
- `ai_feedback`
- `coding_sessions`
- `coding_events`
- `recordings`
- `recruiter_notes`
- `candidate_rankings`
- `integrity_events`
- `resume_profiles`

Use the SQL file:

- [thinkrank_interview_platform.sql](/Users/himanshusolanki/Desktop/Mark/ThinkRank/backend/sql/thinkrank_interview_platform.sql)

---

## Authentication and RBAC

### Auth stack
- JWT access token
- refresh token rotation
- bcrypt password hashing
- httpOnly refresh cookie
- optional magic link / OAuth later

### Roles
- `candidate`
- `recruiter`
- `admin`
- `ai_observer`

### Access rules
- candidate can only join assigned room
- recruiter can only access rooms they created or were invited to
- admin can audit all sessions
- AI service tokens are service-to-service only

---

## REST API Surface

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Interview Rooms
- `POST /api/interview-rooms`
- `GET /api/interview-rooms/:roomId`
- `PATCH /api/interview-rooms/:roomId`
- `POST /api/interview-rooms/:roomId/join`
- `POST /api/interview-rooms/:roomId/leave`

### Interview Sessions
- `POST /api/interview-sessions/start`
- `POST /api/interview-sessions/:sessionId/end`
- `GET /api/interview-sessions/:sessionId`
- `GET /api/interview-sessions/:sessionId/report`

### Transcript
- `GET /api/interview-sessions/:sessionId/transcript`
- `GET /api/interview-sessions/:sessionId/transcript/export`

### AI Feedback
- `GET /api/interview-sessions/:sessionId/ai-feedback`
- `POST /api/interview-sessions/:sessionId/ai-followup`

### Coding
- `POST /api/coding-sessions`
- `POST /api/coding-sessions/:codingSessionId/run`
- `POST /api/coding-sessions/:codingSessionId/submit`
- `GET /api/coding-sessions/:codingSessionId/events`

### Recruiter
- `GET /api/recruiter/dashboard`
- `GET /api/recruiter/candidates/:candidateId`
- `POST /api/recruiter/notes`
- `GET /api/recruiter/compare`

---

## Socket.IO Namespaces and Events

Namespace:

- `/api/recruit-os/session`

Rooms:

- `room:<roomId>`
- `session:<sessionId>`

### Client -> Server
- `room:join`
- `room:leave`
- `participant:state`
- `webrtc:offer`
- `webrtc:answer`
- `webrtc:ice-candidate`
- `screen:start`
- `screen:stop`
- `transcript:chunk`
- `coding:change`
- `coding:cursor`
- `coding:run`
- `integrity:event`
- `hand:raise`

### Server -> Client
- `room:state`
- `participant:joined`
- `participant:left`
- `participant:updated`
- `webrtc:offer`
- `webrtc:answer`
- `webrtc:ice-candidate`
- `transcript:partial`
- `transcript:final`
- `ai:insight`
- `ai:followup`
- `coding:sync`
- `coding:execution`
- `integrity:alert`
- `network:quality`

---

## WebRTC Flow

```text
1. Candidate enters room with JWT
2. API validates room access
3. Socket.IO joins room namespace
4. Client gets local media
5. Offerer creates RTCPeerConnection
6. SDP offer sent via Socket.IO signaling
7. Answerer returns SDP answer
8. ICE candidates exchanged
9. Media streams attached to participant tiles
10. Optional screen share creates additional track
```

### Best practices
- use TURN for NAT traversal
- use separate peer connections per remote participant for smaller rooms
- prefer SFU integration later for scale
- monitor bitrate, packet loss, and RTT
- degrade UI quality when network is poor

### Scale recommendation
- P2P for mock interviews / 1:1 / 1:2
- SFU migration path for panel interviews
  - LiveKit
  - mediasoup
  - Janus

---

## AI Processing Pipeline

```text
Audio stream
  -> speech segmentation
  -> real-time transcription
  -> transcript normalization
  -> LLM prompt assembly
  -> score generation
  -> follow-up question generation
  -> live dashboard update
  -> final report synthesis
```

### Inputs
- transcript chunks
- speaking pace
- pause density
- code changes
- code execution results
- room integrity events

### AI outputs
- technical score
- communication score
- confidence score
- filler word count
- engagement estimate
- follow-up prompt
- final recruiter summary
- hire / no-hire recommendation

### Model responsibilities
- transcription: Deepgram or Whisper
- structured analysis: OpenAI or Mistral
- TTS reply: Deepgram / ElevenLabs / OpenAI voice
- moderation/guardrails: safety filter layer before recruiter display

---

## Live Coding Round Design

### Requirements
- Monaco editor
- collaborative editing
- multi-language support
- Judge0 execution
- visible and hidden test cases
- recruiter live watch mode
- AI code review

### Realtime model
- socket-based operational events first
- migrate to CRDT if collaboration depth increases

Events:
- `coding:change`
- `coding:cursor`
- `coding:selection`
- `coding:run`
- `coding:result`

### Judge0 Flow
- frontend submits code and language
- backend stores execution request
- backend calls Judge0
- result normalized
- AI review triggered
- output + score pushed over socket

---

## Recording and Replay

Record:

- webcam audio/video
- screen share
- transcript
- coding changes
- AI feedback timeline

### Storage
- object storage for media artifacts
- PostgreSQL metadata rows
- signed URLs for secure playback

### Replay Player
- synchronized timeline
- transcript scrub
- code playback
- recruiter note overlays

---

## Smart Anti-Cheating

### Signals
- tab switch
- screen blur / hidden visibility
- no camera feed
- multiple face detection
- absence from frame
- background noise spikes
- copy/paste bursts
- code coming too fast from clipboard

### Processing
- raw events stored in `integrity_events`
- session severity score updated in Redis/PostgreSQL
- recruiter alert panel receives realtime updates

---

## Deployment Architecture

### Frontend
- Vercel or self-hosted Next.js

### Backend
- containerized Node.js service
- horizontal autoscaling
- separate Socket.IO sticky sessions

### Infra
- PostgreSQL managed instance
- Redis managed cache
- S3-compatible storage
- TURN/STUN service
- background worker deployment

### Production topology

```text
CDN
  -> Next.js frontend
  -> API load balancer
      -> Express API pods
      -> Socket.IO pods with sticky sessions
      -> Worker pods
  -> PostgreSQL
  -> Redis
  -> Object storage
  -> Judge0
  -> AI providers
```

---

## Security Standards

- JWT validation on every protected route
- signed room join tokens
- input validation with Zod or Joi
- rate limiting on auth and AI endpoints
- encrypted recording URLs
- audit logs for recruiter access
- prompt injection hardening on transcript and resume content
- service-side AI API access only

---

## Immediate Build Plan for This Repo

### Phase 1
- replace in-memory session state with PostgreSQL + Redis
- normalize Socket.IO event contracts
- persist transcript, integrity, and coding events
- add recruiter view for live session

### Phase 2
- add JWT room join flow
- add real WebRTC video tiles
- add live transcript panel and AI insight stream
- add recording metadata and replay endpoints

### Phase 3
- add recruiter dashboard comparison tools
- add candidate ranking engine
- add resume parser and personalized question generation

---

## Recommended Next Code Tasks

1. Replace mock session `Map()` in `mockInterviewRoutes.js` with repository-backed session service.
2. Introduce database tables from the new SQL schema.
3. Add shared socket contracts for candidate, recruiter, and AI observer roles.
4. Break `MockInterview.tsx` into `room`, `transcript`, `insights`, and `coding` feature modules.
5. Add recruiter live room UI and room role authorization.
