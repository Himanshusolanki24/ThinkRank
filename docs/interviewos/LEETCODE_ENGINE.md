# Adaptive LeetCode Interview Engine

## What this adds

ThinkRank InterviewOS now has a dedicated backend path for live LeetCode-backed interview rounds while still hiding platform metadata from the candidate.

Core modules:

- [`backend/src/interviewos/services/leetCodeGraphQLClient.js`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/backend/src/interviewos/services/leetCodeGraphQLClient.js)
- [`backend/src/interviewos/services/questionIntelligenceService.js`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/backend/src/interviewos/services/questionIntelligenceService.js)
- [`backend/src/interviewos/services/adaptiveLeetCodeInterviewService.js`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/backend/src/interviewos/services/adaptiveLeetCodeInterviewService.js)
- [`backend/src/interviewos/services/interviewMemoryService.js`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/backend/src/interviewos/services/interviewMemoryService.js)

## Live flow

1. `POST /api/interview-os/session/start`
2. Backend creates a session and loads per-user question history.
3. Backend fetches a random non-paid LeetCode easy question from GraphQL.
4. Backend normalizes the question and strips all hidden metadata.
5. Frontend receives only:
   - prompt
   - constraints
   - examples
   - function signature
   - starter code
6. After the round, frontend posts evaluation plus integrity telemetry to `POST /api/interview-os/session/next`.
7. Adaptive engine chooses the next difficulty and question using performance plus weak-topic history.

## Hidden metadata architecture

Fetched internal fields include:

- title
- titleSlug
- questionId
- difficulty
- topic tags
- company tag stats

Candidate-visible payload excludes all of them through [`publicProblemView.js`](/Users/himanshusolanki/Desktop/Mark/ThinkRank/backend/src/interviewos/contracts/publicProblemView.js).

## Redis caching strategy

Current implementation:

- in-process memory cache for normalized questions
- optional persistent storage in `interview_problem_bank`

Recommended production upgrade:

1. Use Redis key `interviewos:leetcode:question:<titleSlug>` for normalized question payloads.
2. Use Redis set `interviewos:user:<userId>:asked` for recent repetition avoidance.
3. Use Redis TTL of 24 hours for detailed question payloads.
4. Use a background warmer to prefetch question lists by difficulty.

## Adaptive algorithm

Inputs:

- problem solving score
- optimization score
- communication score
- integrity score
- weak-topic history
- repetition history

Rules:

- strong round -> increase difficulty
- weak round -> decrease difficulty
- mixed round -> hold difficulty
- if weak topic detected, bias next random selection toward that topic
- if integrity drops, preserve decision context for review

## WebSocket design

Recommended events:

- `session.join`
- `session.ready`
- `editor.change`
- `editor.run`
- `editor.submit`
- `integrity.signal`
- `problem.presented`
- `evaluation.round_complete`
- `integrity.warning`

## Anti-cheat logic

Front-end secure IDE policies should:

- block copy
- block paste
- block cut
- detect tab switching
- detect visibility loss
- detect suspicious idle windows

Back-end integrity scoring should combine those signals with webcam analytics before final verification status is set.
