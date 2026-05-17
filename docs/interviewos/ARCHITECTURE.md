# ThinkRank InterviewOS Architecture

## Product north star

ThinkRank InterviewOS should feel like a recruiter-grade, pressure-aware, FAANG-style technical interview simulator, not a chatbot and not a coding practice site.

Non-negotiable rule:

- The frontend must never receive source problem metadata such as title, provider id, difficulty, topic tags, editorial notes, or sheet names.

## Target architecture

```text
React App
  -> API Gateway / Session Auth
  -> WebSocket Interview Orchestrator
      -> Voice Session Service
      -> Adaptive Interview Engine
      -> Integrity / Proctoring Service
      -> Coding Execution Service
      -> Evaluation Worker Queue
      -> Genome Update Worker
  -> PostgreSQL + pgvector
  -> Redis
  -> Object Storage
```

## Frontend architecture

Primary surfaces:

- Interview Lobby: device checks, persona selection, policy consent, network test.
- Live Interview Room: Monaco editor, timer, voice transcript, interviewer avatar/panel, webcam integrity widget.
- Integrity HUD: live status, warnings, verification badge, muted audit telemetry.
- Post-Interview Genome Dashboard: strengths, weakness clusters, confidence trend, optimization profile, roadmap.

Client modules:

- `features/interviewos/contracts.ts`: public-safe payload types only.
- `features/interviewos/socket/`: session transport, reconnection, heartbeat, backpressure handling.
- `features/interviewos/telemetry/`: tab visibility, typing cadence, camera frame metadata, mic state.
- `features/interviewos/editor/`: Monaco integration, execution timeline, snapshot buffering.
- `features/interviewos/report/`: genome graphs and interview outcomes.

## Backend architecture

Core services:

- API Gateway: auth, rate limits, signed upload URLs, session bootstrap.
- Interview Orchestrator: authoritative session state machine and next-question decisions.
- Problem Service: retrieves internal problems and sanitizes them before client delivery.
- Voice Service: STT/TTS session handling, interruption logic, transcript timeline.
- Evaluation Service: scores code, speech, reasoning, optimization, and debugging quality.
- Integrity Service: tab switching, focus loss, multi-face, gaze, head pose, inactivity, and typing anomalies.
- Genome Service: updates long-term skill vectors and learning roadmap recommendations.

## AI pipeline

1. Candidate joins session.
2. Orchestrator selects a hidden internal problem from `interview_problem_bank`.
3. Problem is transformed into `public_payload`.
4. Candidate voice and editor signals stream over WebSocket.
5. STT creates rolling transcripts.
6. Coding execution service runs tests and captures analytics.
7. Evaluation worker scores correctness, optimization, communication, confidence, and edge-case reasoning.
8. Integrity worker updates the `integrity_score`.
9. Adaptive engine decides whether to upgrade, hold, or downgrade challenge level.
10. Genome worker updates long-term candidate intelligence dimensions.

## Adaptive question engine logic

Decision inputs:

- last round correctness
- optimization score
- communication clarity
- edge-case coverage
- debugging behavior
- weak-topic history
- repeated pattern history
- integrity score

Decision outputs:

- next difficulty bucket
- whether to ask optimization follow-up
- whether to stay on topic or pivot
- whether to inject behavioral or stress probe
- whether to flag review or freeze the session

## Anti-cheat logic

Telemetry inputs:

- `visibilitychange` and blur/focus events
- blocked copy/paste attempts
- suspicious idle windows
- MediaPipe face count
- gaze-away duration
- head pose deviation
- abnormal typing burst detection
- audio device swaps

Integrity states:

- `verified`
- `review`
- `unverified`

Policy:

- Below 85: show internal review risk.
- Below 60: mark session `UNVERIFIED`.
- Below 40: freeze the session and require manual review or restart.

## Database design

Primary tables:

- `interview_problem_bank`
- `interviewer_persona_configs`
- `interview_sessions_v2`
- `interview_rounds`
- `interview_code_snapshots`
- `interview_voice_transcripts`
- `interview_behavioral_analytics`
- `interview_integrity_violations`
- `interview_evaluations`
- `interview_skill_genome_profiles`
- `interview_skill_genome_dimensions`

See [`backend/sql/interviewos_schema.sql`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/backend/sql/interviewos_schema.sql).

## API design

Bootstrap REST:

- `POST /api/interview-os/session/start`
- `POST /api/interview-os/session/end`
- `GET /api/interview-os/blueprint`
- `GET /api/interview-os/sample-problem`

Live WebSocket:

- `session.join`
- `session.ready`
- `audio.chunk`
- `editor.change`
- `integrity.signal`
- `problem.presented`
- `interviewer.speaking`
- `evaluation.round_complete`
- `report.ready`

## Deployment strategy

Recommended services:

- `frontend`: Vercel or CloudFront + S3
- `api-gateway`: Fly.io / Render / ECS / Railway
- `interview-orchestrator`: containerized Node service with sticky WebSocket support
- `python-analytics`: FastAPI workers behind an internal load balancer
- `redis`: managed Upstash / Elasticache
- `postgres`: Supabase or managed PostgreSQL with pgvector
- `object-storage`: S3 compatible bucket for session artifacts

## Docker architecture

Containers:

- `frontend`
- `backend-api`
- `interview-orchestrator`
- `python-analytics`
- `worker-evaluator`
- `worker-genome`
- `redis`
- `postgres`

## CI/CD plan

1. Run lint and type checks on every PR.
2. Run backend route tests and contract tests.
3. Run database migration validation.
4. Run frontend build and smoke tests.
5. Deploy preview environment.
6. Gate production deploy on manual approval for schema or prompt changes.

## Security best practices

- Keep hidden problem metadata server-side only.
- Use signed short-lived session tokens for WebSocket joins.
- Encrypt transcripts and sensitive behavioral telemetry at rest.
- Separate candidate-visible payloads from recruiter/internal payloads.
- Redact secrets and personally identifiable information from AI prompts.
- Store audit logs for integrity-score decisions.
- Use role-based access controls for recruiter/admin views.

## Future roadmap

- company-specific calibration datasets
- interviewer memory tuning per persona
- pair-programming simulation mode
- system design whiteboard mode
- multimodal confidence modeling
- human reviewer console
- benchmarked hiring scorecards
