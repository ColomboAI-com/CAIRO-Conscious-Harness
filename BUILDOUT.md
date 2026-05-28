# CAIRO Conscious Harness Buildout Tracker

This tracker captures the implementation path for the full CAIRO Conscious Harness buildout across `cairo-ui`, `cairo-backend`, Autonomous Companies, Hermes, MarkItDown, Nango, and Codex-style swarm execution.

## Current Build Slice

Implemented first vertical slice:

- Backend: additive `/api/v1/conscious-harness` API namespace in `cairo-backend`.
- Backend: in-process Conscious Harness control-plane service for goals, tasks, swarms, LHTK checkpoints, ODIL document ingest, DCRS capability discovery, harness registry, efficiency routing, and security risk scoring.
- Frontend: new `/harness` and `/command-center` route in `cairo-ui`.
- Frontend: sidebar entry for Conscious Harness.
- Frontend: Command Center page showing runtime loop, model routing policy, system cards, Hermes-style Kanban visibility, and 72-hour automation track.

Implemented second backend integration slice:

- Fixed runtime serialization for slot-based Conscious Harness dataclasses.
- Added ODIL conversion contract at `/api/v1/conscious-harness/odil/convert`.
- Extended ODIL ingest to track source URI, MIME type, markdown preview, markdown length, converter, and estimated token savings.
- Added Nango-style connect-session contract at `/api/v1/conscious-harness/nango/connect`.
- Added Nango connection registry and webhook intake endpoints:
  - `GET /api/v1/conscious-harness/nango/connections`
  - `POST /api/v1/conscious-harness/nango/connections`
  - `POST /api/v1/conscious-harness/nango/webhook`
- Added webhook events into the runtime activity feed.

Implemented third frontend integration slice:

- Wired the Command Center to load live overview data plus `/tasks/kanban`.
- Added interactive automation controls:
  - seed goal + expand tasks + set first task running + spawn execution swarm,
  - run ODIL conversion,
  - create a Nango connect session,
  - record a GitHub connection and webhook sync event,
  - score a high-risk autonomous action.
- Replaced static Kanban counts with backend task-board counts.
- Kept a fallback preview state so the page remains useful when the backend is not reachable.

Implemented fourth stabilization slice:

- Committed and pushed both `cairo-ui` and `cairo-backend` feature branches.
- Fixed `cairo-ui` typecheck blockers by adding missing system config keys and repairing the PreviewPanel download merge issue.
- Added ACE-aware Conscious Harness read paths:
  - `/overview` now attempts to count real ACE companies, goals, runtime tasks, operators, approvals, capability gaps, and audit activity.
  - `/tasks/kanban` now attempts to read `ACERuntimeTask` rows and map them into Harness Kanban columns.
  - Both endpoints fall back to in-memory state when ACE tables or DB access are unavailable.

Implemented fifth meta-harness execution slice:

- Added governed harness run tracking for Codex, Hermes, OpenClaw, and future adapters.
- Added task assignment, run status updates, active run metrics, and recent activity feed entries.
- Added harness benchmark scoring with success rate, latency, cost, trust score updates, and trusted/shadow-mode recommendations.
- Exposed new backend contracts:
  - `POST /api/v1/conscious-harness/harness/{harness_id}/run`
  - `GET /api/v1/conscious-harness/harness/runs`
  - `POST /api/v1/conscious-harness/harness/runs/{run_id}/status`
  - `POST /api/v1/conscious-harness/harness/{harness_id}/benchmark`
- Added Command Center controls for assigning a Codex harness run and benchmarking Codex.
- Added backend service coverage for the meta-harness run and benchmark lifecycle.

Implemented sixth governance slice:

- Added approval requests for high-risk or explicitly gated harness runs.
- High-risk harness runs now enter `waiting_approval` instead of executing immediately.
- Approval decisions move harness runs into `running` when approved or block/fail them when rejected.
- Exposed new governance contracts:
  - `GET /api/v1/conscious-harness/approvals`
  - `POST /api/v1/conscious-harness/approvals/{approval_id}/decision`
- Added Command Center control for exercising the approval gate.
- Added backend service coverage for high-risk harness approval flow.

Implemented seventh operator visibility slice:

- Command Center now loads live harness runs from `/api/v1/conscious-harness/harness/runs`.
- Command Center now loads live approvals from `/api/v1/conscious-harness/approvals`.
- Added an Approval Queue panel with approve/reject actions for pending high-risk runs.
- Added a Harness Runs panel with run status, capability, risk level, and a complete-run action.
- Changed the approval control from auto-approve to queue-first operator review.

Implemented eighth persistence foundation slice:

- Added SQLAlchemy models for Conscious Harness runs, approvals, and benchmarks.
- Added Alembic migration `041_conscious_harness_persistence`.
- Registered Conscious Harness models with backend database initialization.
- Harness run, approval, and benchmark APIs now persist to DB when a session is available.
- List/status/decision endpoints read persisted state first and fall back to in-memory state.
- Overview now includes persisted pending approval and active harness run counts.
- Added restart-style service coverage for persisted run and approval state, skipped only when local SQLAlchemy is unavailable.

## Swarm Findings

### Frontend

Use CAIRO's existing shell, router, sidebar, chat workspace, preview panel, scheduled task UI, and Autonomous Companies workspace. Do not replace the app shell.

Existing surfaces:

- Command entry: `src/renderer/pages/guid`
- Chat + agent workspace: `src/renderer/pages/conversation`
- Company Kanban: `src/renderer/pages/autonomous-companies/TaskBoard.tsx`
- Browser/preview: `src/renderer/pages/conversation/preview`
- Autonomous Companies: `src/renderer/pages/autonomous-companies`
- Settings/integrations/usage/security: `src/renderer/pages/settings`

Lowest-risk next UI steps:

1. Add wrapper pages for Kanban, Memory, Efficiency, Security, Browser, and Harness Control.
2. Reuse company task board and company workspace; do not duplicate Autonomous Companies.
3. Treat Terminal as a later phase: start with terminal logs before true PTY.
4. Borrow Hermes Desktop UX patterns, especially Kanban visibility, queued turn UX, typed preload boundaries, and session-stable streaming.

### Backend

Use the existing ACE backend as the backbone.

Existing systems:

- Scheduled jobs: `src/cairo/routers/scheduled_jobs.py`
- AC companies/operators: `src/cairo/ac/routers/*`
- Task board: `src/cairo/ac/routers/tasks_board.py`
- ACE models: `src/cairo/ac/models/ace_models.py`
- Event Intelligence Layer: `src/cairo/ac/eil/event_bus.py`
- Memory: `src/cairo/routers/memory*.py` and `src/cairo/ac/ace_runtime/memory_runtime.py`
- Governance/security: middleware, `structured_approval_service.py`, ACE governance runtime, kill switch, audit logs

Lowest-risk next backend steps:

1. Replace in-memory Conscious Harness state with ACE-backed read models.
2. Extend goals and task board using `ACEGoal` and `ACERuntimeTask`.
3. Model swarms as coordination over existing operators/tasks.
4. Add ODIL and LHTK as policy/service layers before DB-heavy migrations.
5. Add Nango as an integration provider beside existing Composio routes.
6. Add audit logs and approval gates to all high-risk runtime mutations.

### Hermes Agent

Borrow:

- Turn lifecycle hooks: pre/post LLM, output transform, memory prefetch, diagnostics.
- Provider-based memory manager with `prefetch_all`, `sync_all`, turn/session hooks, and compression hooks.
- Todo/task state tool with full-list replacement/merge semantics.
- Background task visibility and child-session execution.
- Bounded delegation with max fan-out, max depth, role selection, and heartbeat propagation.

### MarkItDown

Borrow:

- `MarkItDown().convert(source).markdown` as the core local conversion path.
- `StreamInfo` hints for extension, mimetype, charset, filename, URL, and local path.
- Converter registration with priority ordering for CAIRO-specific converters.
- Optional MCP mode: `python -m markitdown_mcp --http --host 127.0.0.1 --port 3001`.
- Plugin support behind explicit feature flags.

Current implementation status:

- ODIL service uses a local software-normalizer path for provided content.
- If `markitdown` is installed and `source_uri` is provided, the service attempts `MarkItDown().convert(source_uri).markdown`.
- If MarkItDown is unavailable, conversion gracefully falls back to a source-headed markdown envelope.

### Nango

Borrow:

- Connect Session handshake with short-lived token and connect link.
- Embedded Connect UI event model: ready, session token, connect, error, close.
- Sync ergonomics: checkpoints, batch saves, model-backed records.
- Sandboxed runner separation for sync, action, webhook, and event handlers.
- Webhook delivery discipline: signatures, retry policy, circuit breaker, and stable JSON.

Current implementation status:

- Connect-session creation is modeled locally with short-lived `session_token`, `connect_link`, end user, organization, allowed integrations, tags, expiry, and status.
- Connections can be recorded into the Conscious Harness capability graph.
- Webhooks are accepted into a runtime event log for later EIL processing.

## Automation Strategy

Use multi-agent execution for bounded slices with disjoint write scopes:

- Frontend worker: wrapper pages and navigation.
- Backend worker: ACE-backed read models and routes.
- ODIL worker: MarkItDown service and document ingest pipeline.
- Nango worker: connect-session abstraction and provider registry.
- Verification worker: targeted backend and frontend test/lint passes.

The environment still requires user approval for network, install, push, and sandbox-escape operations. Batch approvals by command category whenever possible.
