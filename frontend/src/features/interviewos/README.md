## InterviewOS frontend setup

This folder defines the frontend-safe contracts for the next-generation interview experience.

Rules:
- Never render hidden problem metadata on the client.
- Only consume `PublicInterviewProblem` payloads from the backend.
- Integrity and webcam telemetry should stream over WebSocket, not batched REST polling.
- Voice, transcript, editor, and anti-cheat events should share the same session timeline.
