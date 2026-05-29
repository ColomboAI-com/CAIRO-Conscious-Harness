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

Implemented ninth ACE linkage slice:

- Harness run requests can now carry optional ACE context: company, operator, tenant, priority, requested-by, and approval metadata.
- When ACE company context is supplied, Conscious Harness creates a linked `ACERuntimeTask` with `task_type="conscious_harness_run"`.
- Harness run persistence now stores explicit `harness_task_id`, `ace_task_id`, `ace_company_id`, `ace_operator_id`, and `tenant_id` fields.
- Added Alembic migration `042_conscious_harness_ace_linkage`.
- Harness run status updates now synchronize back to linked ACE runtime task status/result/error fields.
- Added optional SQLAlchemy-backed service coverage for ACE-linked run creation and completion.

Implemented tenth ACE-linked Command Center slice:

- Added ACE company, operator, and tenant context inputs to the Conscious Harness Command Center.
- Added an `Assign ACE-Linked Run` action that sends ACE context into the harness run API.
- Harness run cards now display linked ACE task IDs when present.
- The Command Center can now exercise standalone harness runs and ACE-attached harness runs from the same surface.

Implemented eleventh ODIL persistence slice:

- Added persistent ODIL document model and Alembic migration `043_conscious_harness_odil_documents`.
- ODIL ingest and convert endpoints now persist normalized document records when a DB session is available.
- Added `GET /api/v1/conscious-harness/odil/documents` for document history.
- ODIL document lookup now reads persisted records first and falls back to in-memory state.
- Command Center now displays persisted ODIL documents with converter, markdown size, workflows, entities, and token savings.
- Added optional SQLAlchemy-backed coverage for ODIL document persistence across service restarts.

Implemented twelfth Nango persistence slice:

- Added persistent Nango connection and webhook event models.
- Added Alembic migration `044_conscious_harness_nango_persistence`.
- Nango connection record/list endpoints now persist and read connection state when DB is available.
- Nango webhook intake now persists webhook events for later EIL processing.
- Command Center now displays persisted Nango connections with integration, connection id, provider config, and status.
- Added optional SQLAlchemy-backed coverage for Nango connection and webhook persistence.

Implemented thirteenth DCRS capability persistence slice:

- Added persistent Conscious Harness capability model and Alembic migration `045_conscious_harness_capabilities`.
- DCRS discover/list endpoints now persist and read capability records when DB is available.
- Nango connection recording now updates the persistent capability graph with connected integration capabilities.
- Overview now includes persisted available/connected capability counts.
- Command Center now loads the capability graph, displays DCRS/ODIL/Nango capabilities, and can trigger a DCRS discovery action.
- Added optional SQLAlchemy-backed coverage for capability persistence across service restarts.

Implemented fourteenth runtime state persistence slice:

- Added persistent Conscious Harness goal, task, and swarm models.
- Added Alembic migration `046_conscious_harness_runtime_state`.
- Goal creation, goal expansion, task creation, task status updates, swarm spawn, and swarm regeneration now persist when a DB session is available.
- Goal status, task events, swarm DNA, and fallback Kanban reads can now load persisted runtime state after restart.
- Overview now merges persisted active goals, running tasks, active swarms, token counters, and avoided frontier-call counts.
- Added optional SQLAlchemy-backed coverage for restart-safe goal/task/swarm state.

Implemented fifteenth execution memory persistence slice:

- Added persistent LHTK checkpoint and Conscious Harness security event models.
- Added Alembic migration `047_conscious_harness_execution_memory`.
- LHTK checkpoint create/list endpoints now persist and read checkpoint state when DB is available.
- Security risk scoring now persists actor, action, risk, approval requirement, metadata, and timestamp.
- Security audit reads now load persisted audit events after restart.
- Overview now merges persisted high/critical security alert counts.
- Added optional SQLAlchemy-backed coverage for restart-safe checkpoints and security audit events.

Implemented sixteenth execution memory Command Center slice:

- Command Center now loads persisted security audit events from `/security/audit`.
- Command Center now loads LHTK checkpoints for the current active harness task.
- Added a `Create LHTK Checkpoint` action that captures task state, active run count, approval pressure, sharpness, and entropy.
- Added LHTK Checkpoints and Security Audit panels for operator visibility.

Implemented seventeenth proactive recommendations slice:

- Added `GET /api/v1/conscious-harness/recommendations`.
- Recommendation synthesis now inspects persisted overview, approvals, harness runs, capabilities, security events, tasks, and ODIL documents.
- Recommendations rank approval review, security audit review, LHTK checkpointing, goal seeding, GitHub connection, ODIL grounding, and recovery swarm work.
- Command Center now displays ranked Runtime Recommendations as operator-ready next actions.
- Added backend service coverage for recommendation priority and action-type selection.

Implemented eighteenth executable recommendations slice:

- Runtime Recommendation cards now expose an action button.
- Command Center can execute allowlisted recommendation types: goal creation, LHTK checkpointing, Nango connection recording, and ODIL conversion.
- Review-only recommendation types remain routed through dedicated operator panels instead of mutating approvals directly.

Implemented nineteenth recommendation execution audit slice:

- Added persistent recommendation execution audit model and Alembic migration `048_conscious_harness_recommendation_executions`.
- Added backend-owned recommendation executor at `POST /api/v1/conscious-harness/recommendations/execute`.
- Added execution history read at `GET /api/v1/conscious-harness/recommendations/executions`.
- Command Center recommendation actions now route through the audited backend executor.
- Command Center now shows recent recommendation execution outcomes.
- Added optional SQLAlchemy-backed coverage for persisted recommendation execution history.

Implemented twentieth recommendation heartbeat slice:

- Added persistent recommendation heartbeat snapshot model and Alembic migration `049_conscious_harness_recommendation_heartbeats`.
- Added `POST /api/v1/conscious-harness/recommendations/heartbeat` to generate and persist proactive recommendation snapshots.
- Added `GET /api/v1/conscious-harness/recommendations/heartbeats` for heartbeat history.
- Command Center can now trigger a recommendation heartbeat and display recent heartbeat outcomes.
- Added optional SQLAlchemy-backed coverage for persisted heartbeat snapshots.

Implemented twenty-first scheduled heartbeat slice:

- Added configurable Conscious Harness heartbeat scheduler settings:
  - `CONSCIOUS_HARNESS_HEARTBEAT_ENABLED`
  - `CONSCIOUS_HARNESS_HEARTBEAT_INTERVAL_SECONDS`
  - `CONSCIOUS_HARNESS_HEARTBEAT_STARTUP_DELAY_SECONDS`
- Added background recommendation heartbeat loop using the backend BG DB session pool.
- Wired the loop into FastAPI startup behind the enable flag.
- Added scheduler sweep coverage to verify scheduled heartbeats persist snapshots.

Implemented twenty-second scheduler status visibility slice:

- Added `GET /api/v1/conscious-harness/recommendations/scheduler/status`.
- Scheduler status reports enablement, interval, startup delay, latest heartbeat, heartbeat count, and latest state.
- Command Center now displays scheduler status, cadence, startup delay, and heartbeat count in the Runtime Recommendations panel.
- Added backend service coverage for scheduler status shape.

Implemented twenty-third operator scheduler configuration slice:

- Added persistent Conscious Harness scheduler config model and Alembic migration `050_conscious_harness_scheduler_config`.
- Added `POST /api/v1/conscious-harness/recommendations/scheduler/config`.
- Scheduler status now merges persisted operator overrides with environment defaults.
- Background heartbeat manager now starts at backend startup and idles/runs based on persisted scheduler config.
- Command Center can enable/disable recommendation heartbeats and set interval/startup delay.
- Added optional SQLAlchemy-backed coverage for persisted scheduler configuration.

Implemented twenty-fourth readiness checklist slice:

- Added `GET /api/v1/conscious-harness/readiness`.
- Derived buildout readiness from persisted runtime state, ODIL documents, capability graph, governance, execution memory, recommendations, scheduler state, and harness runs.
- Command Center now displays a Buildout Readiness panel with score, status, and per-area checks.
- Added backend service coverage for readiness report shape and status values.

Implemented twenty-fifth launch runbook slice:

- Added `GET /api/v1/conscious-harness/launch/runbook`.
- Derived launch phases and operator actions from readiness blockers, readiness warnings, runtime recommendations, and scheduler state.
- Included markdown export content for launch review/checklist handoff.
- Command Center now displays launch phases, status, blocked action count, and top operator actions.
- Added backend service coverage for runbook status, actions, phases, and export content.

Implemented twenty-sixth executable launch actions slice:

- Added `POST /api/v1/conscious-harness/launch/actions/execute`.
- Added an allowlisted launch action executor for runtime seeding, ODIL grounding, capability discovery, governance gates, LHTK checkpoints, recommendation heartbeats, scheduler enablement, harness verification, and executable recommendations.
- Launch runbook actions now include executable metadata for the Command Center.
- Command Center launch action cards now expose Execute/Review controls.
- Added backend service coverage for executing an allowlisted launch action.

Implemented twenty-seventh launch execution audit slice:

- Added persistent Conscious Harness launch execution model and Alembic migration `051_conscious_harness_launch_executions`.
- Added `GET /api/v1/conscious-harness/launch/executions`.
- Launch action execution now writes running and terminal audit records with actor, action, result, error, and timing data.
- Command Center now displays recent launch execution history beneath the Launch Runbook actions.
- Added DB-backed backend service coverage for persisted launch execution history.

Implemented twenty-eighth launch evidence package slice:

- Added `GET /api/v1/conscious-harness/launch/evidence`.
- Evidence packages now bundle readiness, runbook, launch executions, recommendation executions, recommendation heartbeats, approvals, security events, harness runs, ODIL documents, capabilities, scheduler state, summary counts, and markdown handoff content.
- Command Center now exposes an Export Evidence control from the Launch Runbook panel.
- Added backend service coverage for evidence package summary, audit context, readiness, runbook, and markdown content.

Implemented twenty-ninth deployment preflight slice:

- Added `GET /api/v1/conscious-harness/launch/preflight`.
- Preflight now checks readiness score, required Conscious Harness migrations, launch audit trail, evidence package generation, scheduler state, integration credentials, webhook signing, OAuth secrets, capabilities, ODIL grounding, governance posture, and harness validation.
- Command Center now displays a Deployment Preflight panel with score, status, blockers/warnings, and top checks.
- Added backend service coverage for preflight status, score, evidence linkage, and check inventory.

Implemented thirtieth actionable preflight slice:

- Added `POST /api/v1/conscious-harness/launch/preflight/actions/execute`.
- Preflight checks now include executable metadata and distinguish safe automated fixes from manual secret/configuration reviews.
- Safe preflight actions reuse the audited launch action executor for scheduler enablement, ODIL grounding, capability seeding, governance gates, runtime seeding, launch audit generation, and harness validation.
- Command Center Deployment Preflight cards now expose Execute/Review controls.
- Added backend service coverage for executing a safe preflight fix.

Implemented thirty-first production launch profile slice:

- Added `GET /api/v1/conscious-harness/launch/profile`.
- Launch profile now derives local/staging/production mode from `CONSCIOUS_HARNESS_LAUNCH_PROFILE` and `APP_ENV`.
- Deployment preflight now includes profile metadata and promotes missing production secrets, disabled scheduler, missing governance, and missing harness validation from warnings to blockers in production mode.
- Command Center Deployment Preflight now displays launch profile and mode tags.
- Added backend service coverage for production-mode blockers when required launch controls/secrets are missing.

Implemented thirty-second deployment manifest slice:

- Added `GET /api/v1/conscious-harness/launch/manifest`.
- Deployment manifest now exports launch profile, preflight status, evidence id, required environment variables, required migrations, services, scheduler settings, launch commands, and markdown handoff content.
- Command Center Deployment Preflight now includes an Export Manifest control.
- Added backend service coverage for manifest env vars, migrations, services, commands, profile, and markdown content.

Implemented thirty-third release candidate gate slice:

- Added `GET /api/v1/conscious-harness/launch/release-candidate`.
- Release candidate gate now rolls up deployment manifest, preflight, evidence package, launch profile, blockers, and warnings into `demo-ready`, `alpha-ready`, or `blocked`.
- Command Center now displays a Release Candidate Gate panel with verdict, score, blockers, and criteria.
- Added backend service coverage for release candidate verdict, evidence linkage, manifest linkage, profile, and criteria.

Implemented thirty-fourth adapter readiness registry slice:

- Added `GET /api/v1/conscious-harness/launch/adapters`.
- Adapter readiness now distinguishes live, configured, modeled, software-fallback, registered, reference, and available modes for Nango, MarkItDown, Codex, Hermes, and ACE.
- Adapter registry derives readiness from persisted Nango connections, ODIL documents, harness runs, ACE linkage, capabilities, and launch environment.
- Command Center now displays Adapter Readiness with live count, ready count, status, modes, and evidence.
- Added backend service coverage for adapter readiness registry and Codex validation evidence.

Implemented thirty-fifth adapter smoke-test slice:

- Added `POST /api/v1/conscious-harness/launch/adapters/{adapter_id}/smoke-test`.
- Adapter smoke tests now run safe validation paths for Nango, MarkItDown/ODIL, Codex, Hermes reference capability, and ACE task-board availability.
- Command Center Adapter Readiness cards now expose Smoke Test controls.
- Added backend service coverage for allowlisted Nango, MarkItDown, and Codex smoke-test paths.

Implemented thirty-sixth adapter smoke-test history slice:

- Added the persistent `ch_adapter_smoke_tests` model and migration `052_conscious_harness_adapter_smoke_tests`.
- Added `GET /api/v1/conscious-harness/launch/adapters/smoke-tests` for persisted adapter smoke-test history.
- Adapter smoke tests now persist running and terminal results so history survives service restarts.
- Adapter readiness now returns each adapter's latest smoke test plus recent smoke-test history.
- Command Center now displays latest adapter smoke-test status and recent smoke-test history.
- Added backend service coverage for DB-backed smoke-test persistence and readiness hydration.

Implemented thirty-seventh launch drill runner slice:

- Added the persistent `ch_launch_drills` model and migration `053_conscious_harness_launch_drills`.
- Added `GET /api/v1/conscious-harness/launch/drills` and `POST /api/v1/conscious-harness/launch/drills`.
- Launch drills now run executable preflight actions, adapter smoke tests, refreshed preflight, adapter readiness, and release-candidate gate generation as one rehearsal report.
- Drill reports persist status, verdict, profile, preflight status, adapter status, release-candidate linkage, full report JSON, and errors.
- Command Center Release Candidate Gate now exposes a Run Drill control and recent drill history.
- Added backend service coverage for in-memory launch drills and DB-backed drill persistence.

Implemented thirty-eighth scheduled launch drill slice:

- Added an autonomous launch drill scheduler loop beside the recommendation heartbeat loop.
- Added `GET /api/v1/conscious-harness/launch/drills/scheduler/status` and `POST /api/v1/conscious-harness/launch/drills/scheduler/config`.
- Launch drill scheduler config now persists in the existing scheduler config table under the `launch_drill` key.
- Launch drill sweeps now run as `launch-drill-scheduler` and persist full drill reports.
- Command Center Release Candidate Gate now exposes launch drill scheduler status, cadence inputs, and enable/disable controls.
- Added backend service coverage for launch drill scheduler status, config persistence, and scheduled sweep persistence.

Implemented thirty-ninth Nango live-mode hardening slice:

- Added `GET /api/v1/conscious-harness/nango/status` for Nango credential readiness.
- Nango adapter readiness now distinguishes `live`, `configured`, and `simulated` modes from credential shape and persisted connections.
- Nango smoke tests now include credential status, live readiness, and explicit simulated/configured/live mode reporting.
- Launch drills now summarize live, configured, and simulated adapter counts.
- Command Center now displays Nango credential status, adapter credential detail, and drill live/simulated counts.
- Added backend service coverage for Nango simulated mode without a secret and live mode with a configured secret.

Implemented fortieth Hermes runner hardening slice:

- Added `GET /api/v1/conscious-harness/hermes/status` for Hermes runner readiness.
- Hermes adapter readiness now distinguishes `reference`, `local`, and `live` modes from runner configuration.
- Hermes smoke tests now emit runner status, live readiness, and explicit reference/local/live mode reporting.
- Launch drills now summarize local and reference adapter counts in addition to live/configured/simulated counts.
- Command Center adapter cards now display Hermes runner detail and drill local/reference counts.
- Added backend service coverage for Hermes reference mode by default plus local and live runner modes.

Implemented forty-first ACE adapter linkage hardening slice:

- Added `GET /api/v1/conscious-harness/ace/status` for Autonomous Companies runtime linkage readiness.
- ACE adapter readiness now distinguishes `available`, `linked`, and `live` modes from active ACE companies, board tasks, and linked harness runs.
- ACE smoke tests now emit runner status, live readiness, board task count, and explicit available/linked/live mode reporting.
- Launch drills now summarize linked and available adapter counts.
- Command Center drill cards now display linked/available adapter counts, and ACE adapter cards reuse runner readiness detail.
- Added backend service coverage for ACE available mode by default and live mode through ACE runtime task linkage.

Implemented forty-second end-to-end launch validation slice:

- Added `GET /api/v1/conscious-harness/launch/validation` for current ship/no-ship launch validation.
- Added `POST /api/v1/conscious-harness/launch/validation` to run a fresh launch drill and return a final validation report.
- Launch validation now composes launch drill, deployment preflight, release candidate gate, adapter readiness, smoke-test history, and launch evidence.
- Validation reports include decision, blockers, warnings, criteria, release candidate linkage, evidence linkage, and launch summary counts.
- Command Center Release Candidate Gate now exposes Validate Launch and displays decision, blocker count, adapter readiness, and smoke-test count.
- Added backend service coverage for fresh validation and latest-drill validation snapshots.

Implemented forty-third launch validation audit-history slice:

- Added persistent `ch_launch_validations` records for launch validation decisions.
- Added `GET /api/v1/conscious-harness/launch/validations` for recent validation history.
- Validation reports now persist decision, status, drill linkage, release candidate linkage, evidence linkage, blocker count, warning count, and full report JSON.
- Deployment preflight now tracks the `054_conscious_harness_launch_validations` migration requirement.
- Command Center Release Candidate Gate now shows recent validation history cards with decision, blockers, warnings, drill linkage, and timestamp.
- Added backend service coverage for persisted launch validation history across service restarts.

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
