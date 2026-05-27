# CAIRO Conscious Harness Buildout Tracker

This tracker captures the implementation path for the full CAIRO Conscious Harness buildout across `cairo-ui`, `cairo-backend`, Autonomous Companies, Hermes, MarkItDown, Nango, and Codex-style swarm execution.

## Current Build Slice

Implemented first vertical slice:

- Backend: additive `/api/v1/conscious-harness` API namespace in `cairo-backend`.
- Backend: in-process Conscious Harness control-plane service for goals, tasks, swarms, LHTK checkpoints, ODIL document ingest, DCRS capability discovery, harness registry, efficiency routing, and security risk scoring.
- Frontend: new `/harness` and `/command-center` route in `cairo-ui`.
- Frontend: sidebar entry for Conscious Harness.
- Frontend: Command Center page showing runtime loop, model routing policy, system cards, Hermes-style Kanban visibility, and 72-hour automation track.

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

### Nango

Borrow:

- Connect Session handshake with short-lived token and connect link.
- Embedded Connect UI event model: ready, session token, connect, error, close.
- Sync ergonomics: checkpoints, batch saves, model-backed records.
- Sandboxed runner separation for sync, action, webhook, and event handlers.
- Webhook delivery discipline: signatures, retry policy, circuit breaker, and stable JSON.

## Automation Strategy

Use multi-agent execution for bounded slices with disjoint write scopes:

- Frontend worker: wrapper pages and navigation.
- Backend worker: ACE-backed read models and routes.
- ODIL worker: MarkItDown service and document ingest pipeline.
- Nango worker: connect-session abstraction and provider registry.
- Verification worker: targeted backend and frontend test/lint passes.

The environment still requires user approval for network, install, push, and sandbox-escape operations. Batch approvals by command category whenever possible.

