# Software Design Specification (SDS)
## Project: DSA Learning Platform with Course Import and Style Profiles

**Version:** 0.3
**Date:** 2026-02-26 (America/New_York)
**Source of Truth:** `DSA_Learning_Platform_SRS_v0.3.md`

---

## Change Log
- **v0.2 → v0.3:** Added Topic Explorer Service (Section 4.13) — browsable DSA taxonomy with on-demand content generation.
- **v0.1 → v0.2:** Added technology stack. Added LLM/AI generation architecture with Vercel AI SDK. Defined mastery formula variables. Specified event system architecture. Specified search index (MiniSearch) and knowledge map rendering (React Flow). Added error handling strategy. Clarified FR-42/FR-43 deferral. Aligned model naming to SRS. Traced design-inferred entities. Updated traceability matrix for FR-93/FR-94.
- **v0.1:** Initial software design derived from SRS v0.2; defines architecture, components, data model, interfaces, workflows, quality controls, and traceability.

---

## 1. Purpose and Scope

This SDS translates the SRS into an implementable design for a local-first web platform that supports:
- Canonical DSA learning
- Imported course workflows (CourseDocs -> extraction -> Class Assessments -> generated practice)
- Course style adaptation (CourseDNA)
- Quiz and interactive lesson delivery
- Analytics, mastery tracking, and knowledge maps
- Optional remote sync and remote AI generation

This SDS covers MVP and v1 design paths and explicitly separates future-only features where needed.

---

## 2. Design Drivers

### 2.1 Architectural Drivers
- Local-first reliability and offline operation are mandatory (FR-44 to FR-46, NFR-3, NFR-4).
- Provenance and trust for generated content are mandatory (FR-27 to FR-29.10).
- Deterministic template generation is required for MVP; remote AI is optional v1 (FR-24, FR-25, FR-29.8).
- Clear source vs derived separation is mandatory (FR-8 to FR-11, FR-23, FR-66 to FR-68, NFR-8).

### 2.2 Quality Attribute Priorities
1. Correctness and trustability of generated content
2. Offline-first durability and performance
3. Extensibility for new generators and question types
4. Usability and rapid import-to-practice flow

---

## 3. System Architecture

### 3.1 Technology Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | React 19 + Vite | SPA shell, component model, HMR dev server |
| Language | TypeScript (strict) | All application and test code |
| Local Database | Dexie.js | IndexedDB wrapper with typed tables, migrations, live queries |
| Styling | Tailwind CSS + shadcn/ui | Utility CSS + accessible component primitives |
| Graph Visualization | React Flow | Knowledge map rendering with custom node components |
| Code Highlighting | Shiki | Syntax highlighting in quiz prompts, trace questions, lessons |
| Command Palette | cmdk | Keyboard-first command palette overlay |
| State Management | Zustand | Lightweight stores for UI state; Dexie live queries for data state |
| AI/LLM SDK | Vercel AI SDK (`ai`) | Provider-agnostic structured generation; streaming; tool use |
| Default AI Provider | `@ai-sdk/google` (Gemini-3-Flash) | Default remote generation provider (v1) |
| Schema Validation | Zod | Runtime validation for generation outputs, API contracts, form inputs |
| Routing | React Router v7 | Client-side SPA routing |
| Testing | Vitest + React Testing Library | Unit, integration, and component tests |

### 3.2 High-Level View

The system is organized as a modular client application plus optional remote services.

1. **Client App (Primary Runtime)**
- UI Layer (React + React Flow + shadcn/ui)
- Application Services (course, import, generation orchestration, quiz, analytics)
- Domain Engines (extraction, style profiling, template generation, mastery, recommendation)
- Local Data Layer (Dexie.js over IndexedDB with typed repository adapters)
- Offline Queue and Sync Adapter

2. **Optional Remote Services (v1+)**
- Auth service
- Sync API
- Generation API (Gemini-3-Flash default provider via Vercel AI SDK)
- Shared storage service (if sync-enabled)

3. **Storage**
- Local IndexedDB (via Dexie.js) as default source of truth for MVP
- Remote persistence only for sync-enabled courses

### 3.3 Deployment Modes

1. **Mode A: Local-only (MVP default)**
- No remote dependencies
- All entities and generated artifacts stored locally
- Template generator only

2. **Mode B: Hybrid (v1)**
- Local-first remains primary
- Optional remote generation for quizzes/interactive lessons
- Optional bidirectional sync for selected data scopes

### 3.4 Module Boundaries (NFR-9)

1. `learning-core`
- Course lifecycle, modules/lessons, question bank, quiz sessions

2. `import-extraction`
- CourseDoc ingestion, parse normalization, confidence scoring, review workflow

3. `style-engine`
- CourseDNA inference, user overrides, lock enforcement

4. `generation-engine`
- Deterministic template generation
- Style + Twist transformation logic
- Remote generation adapter and validation pipeline

5. `assessment-engine`
- ClassAssessment, format profile, rubric-based scoring

6. `mastery-engine`
- Topic mastery updates, weak-topic detection, recommendations, spaced repetition

7. `map-engine`
- Global/Course map storage, rendering data prep, path recommendations

8. `sync-engine`
- Change log, queue, scope-aware payload construction, conflict policy

9. `ui-shell`
- Navigation, command palette, search, accessibility behaviors, themes

---

## 4. Component Design

### 4.1 Course and Content Service (FR-1 to FR-7)

Responsibilities:
- CRUD for courses/modules/lessons
- Course typing: `Canonical | UserAuthored | Imported`
- Course-level settings (difficulty defaults, cadence, notation preferences)
- Canonical DSA seeded content bootstrap

Key interfaces:
- `createCourse(input): Course`
- `updateCourseSettings(courseId, settings): Course`
- `listCourseTopics(courseId): TopicTag[]`
- `seedCanonicalCourseIfMissing(): void`

### 4.2 CourseDoc Import and Extraction Service (FR-8 to FR-14, FR-88 to FR-90)

Pipeline:
1. Ingest raw pasted text with metadata.
2. Normalize text (trim, section split, timestamp normalization).
3. Run detectors:
- topic detector (keyword and alias dictionary + map links)
- date/due detector
- task/action detector
- assessment coverage detector (for Quiz Info docs)
4. Produce `CourseDocParse` with per-item confidence.
5. Flag low-confidence items as `NeedsReview`.
6. Persist review edits and final accepted parse.

Key interfaces:
- `importCourseDoc(input): CourseDoc`
- `extractCourseDocParse(docId): CourseDocParse`
- `applyParseCorrections(docId, corrections): CourseDocParse`
- `mapDocToAssessment(docId, assessmentId): CourseDoc`

### 4.3 Class Assessment Service (FR-11.1, FR-26.0.8 to FR-26.0.12, FR-70 to FR-73)

Responsibilities:
- Create/manage assessments (`Quiz | Exam | Lab | Other`)
- Attach coverage tags and weights
- Attach `AssessmentFormatProfile` and optional `AssessmentRubric`
- Expose coverage constraints to generation and recommendation

Key interfaces:
- `createAssessment(input): ClassAssessment`
- `updateCoverage(assessmentId, coverage): ClassAssessment`
- `setFormatProfile(assessmentId, profile): AssessmentFormatProfile`
- `setRubric(assessmentId, rubric): AssessmentRubric`

### 4.4 Style Engine (CourseDNA) (FR-15 to FR-18, FR-26.0 to FR-26.0.3)

Responsibilities:
- Infer style profile from CourseDocs and observed quiz formats
- Merge inferred profile with user overrides
- Lock parameters when user requests lock
- Apply style profile at generation time only for new artifacts

Profile schema:
- terminology map
- notation preference
- question-type mix weights
- difficulty baseline (1-5)
- strictness baseline

Key interfaces:
- `recomputeStyleProfile(courseId): CourseStyleProfile`
- `setStyleOverride(courseId, patch, lockFields[]): CourseStyleProfile`
- `resolveEffectiveStyle(courseId): CourseStyleProfile`

### 4.5 Generation Engine (FR-23 to FR-26.8, FR-29.1 to FR-29.10)

Subcomponents:
1. **Generation Orchestrator**
- Routes requests to deterministic templates (MVP) or remote provider (v1).

2. **Template Generator**
- Deterministic output from templates and parameterized seeds.
- Supports difficulty presets and target formats.

3. **Style + Twist Transformer**
- Applies controlled novelty while preserving style/coverage boundaries.
- Enforces twist drift bounds using coverage constraints.

4. **Remote Provider Adapter (Vercel AI SDK)**
- Built on Vercel AI SDK (`ai`) with `@ai-sdk/google` as default provider.
- Default model: Gemini-3-Flash (v1).
- Uses `generateObject()` with Zod schemas to produce typed, validated generation output directly from the LLM.
- Provider swapping requires only changing the model parameter — no engine changes needed (supports future Model Picker FR-26.1).
- Streaming via `streamObject()` available for interactive lesson generation.
- Handles endpoint/key config via provider-specific environment variables.

5. **Output Guardrail Pipeline**
- Schema validation (type, answer key, explanation, tags, difficulty)
- Quality checks (non-empty answer, concept match, allowed difficulty)
- Provenance enforcement
- PII/safety and verbatim-copy checks
- Fallback strategy:
  - if remote unavailable -> deterministic template fallback
  - if provenance missing -> reject or label as General DSA with disclaimer

6. **Dedup and Variation Service**
- Avoid near-duplicate prompts per `(courseId, targetAssessmentId)`.
- Uses normalized prompt signatures and recent generation index.

Key interfaces:
- `generateQuiz(request): GeneratedQuizArtifact`
- `generateInteractiveLesson(request): InteractiveLesson`
- `regenerateArtifact(artifactId, options): ArtifactVersion`
- `createBaselinePack(assessmentId, config): BaselinePack`

### 4.6 Baseline Pack and On-Demand Policy (FR-26.0.13 to FR-26.0.21)

Policy:
- Baseline pack is generated on assessment create or first select (configurable).
- Baseline composition minimum:
  - Diagnostic quiz (8-12)
  - Practice quiz (10-15)
  - Common traps set (>=5)
  - Optional short interactive lesson (5-8 steps)
- On-demand generation exposes:
  - difficulty
  - style mode
  - focus mode (coverage vs weak topics)
  - quantity

### 4.7 Quiz Runner and Scoring Service (FR-30 to FR-32, FR-73, FR-85 to FR-87)

Responsibilities:
- Run sessions in `Practice | Timed | RedoMissed | TopicDrill | Exam`
- Feedback policies:
  - `Instant`
  - `EndOnly`
- Mark for review and explanation reveal logic
- Optional rubric-aligned scoring breakdown by topic/type

Key interfaces:
- `startQuizSession(input): QuizSession`
- `submitAnswer(sessionId, questionId, answer): AttemptEvaluation`
- `completeSession(sessionId): QuizReport`

### 4.8 Attempts, Mistake Bank, Mastery, Recommendations (FR-33 to FR-39, FR-74 to FR-77, FR-91 to FR-92)

Responsibilities:
- Persist attempts with timing and correctness
- Populate mistake bank
- Update mastery per topic and question type
- Maintain weak-topic list and trend snapshots
- Generate recommendations weighted by:
  - weak topics
  - selected assessment coverage
  - due-date urgency

Mastery update baseline formula (configurable):
```
delta = (correct ? +1 : -1) * difficultyWeight * recencyWeight * confidenceWeight
newScore = clamp(oldScore + k * delta, 0, 100)
```

Defaults:
- `k` (learning rate): 5.0 — controls how aggressively scores change per attempt
- `difficultyWeight`: Easy=0.8, Medium=1.0, Hard=1.2
- `recencyWeight`: exponential decay `e^(-daysSinceAttempt / 30)` — attempts older than ~90 days contribute minimally
- `confidenceWeight`: 1.0 (reserved for future self-report confidence signal; always 1.0 for MVP)
- Minimum attempt threshold: 5 attempts required before status can reach `Mastered`
- `Mastered` threshold: score >= 80 AND attemptCount >= minimum threshold
- `Weak` threshold: score < 40

### 4.9 Knowledge Map Service (FR-58 to FR-65)

Responsibilities:
- Maintain Global DSA map and per-course map as separate artifacts
- Link by `topicTags` or explicit cross-map references
- Update course map coverage and mastery decorations
- Support node interactions and filtering for UI
- Compute recommended path using prerequisite graph + due dates + weakness

Rendering implementation:
- Built with **React Flow** using custom node components.
- Each `KnowledgeNode` renders as a custom React Flow node displaying: title, mastery status badge (color-coded), topic category chip, and assessment coverage indicator.
- `KnowledgeEdge` types (Prerequisite, Related) rendered with distinct line styles (solid vs dashed).
- Layout computed using dagre (hierarchical) for prerequisite graphs or elkjs for more complex layouts.
- Interactions: zoom/pan (built-in), node click → detail panel, search → fitView to node, expand/collapse via grouped nodes.
- Minimap enabled for orientation in large graphs.

Path heuristic:
`priority = prereqReadiness + dueDateUrgency + weaknessBoost`

### 4.10 Content Lifecycle and Versioning (FR-66 to FR-69)

Responsibilities:
- CourseDoc version snapshots on edit
- Dependency graph from source docs to derived artifacts
- Outdated marking when source changes
- Regeneration as new version by default
- Optional replace-in-place for selected artifacts

### 4.11 Search and Command Palette (FR-40, FR-41)

Responsibilities:
- Local indexed search over courses/docs/questions/lessons
- Keyboard command routing for common actions
- Offline-capable search index refresh after writes

Search implementation:
- Full-text search powered by **MiniSearch** (lightweight, zero-dependency, in-memory search library).
- Indexed fields: course name, doc rawText, question prompt, lesson title, topic tags.
- Index is built on app startup from Dexie data and incrementally updated on write operations.
- Search results ranked by relevance score with optional filtering by entity type and course.
- Target: < 150ms for indexed queries across up to 10,000 documents.

Command palette implementation:
- Built with **cmdk** library.
- Registered commands: navigate to course/doc/quiz, create new course, start quiz, open settings.
- Keyboard shortcut: `Cmd+K` (macOS) / `Ctrl+K` (other).

### 4.12 Privacy and Sync Service (FR-47 to FR-49, FR-82 to FR-84)

Responsibilities:
- Per-course privacy mode:
  - LocalOnly (default)
  - SyncEnabled
- Per-course sync scope:
  - source docs
  - derived content
  - attempts/mastery
- Outbound payload construction based on scope
- Conflict policy for v1: last-write-wins + audit entries

### 4.13 Topic Explorer Service (FR-95 to FR-102)

#### 4.13.1 GlobalDSA Taxonomy Seeding
- On first load, the system seeds a `KnowledgeMap` with `scope: "GlobalDSA"` containing ~91 `KnowledgeNode` entries across 14 categories.
- Categories: Complexity Analysis, Arrays & Strings, Linked Lists, Stacks & Queues, Hash Tables, Trees, Heaps & Priority Queues, Graphs, Sorting, Searching, Dynamic Programming, Greedy Algorithms, Divide and Conquer, Recursion & Backtracking.
- Each node has a deterministic `nodeId` (derived from slug), `topicTags`, `description`, `category`, and initial `status: "NotCovered"`.
- Prerequisite edges (~100 edges) are seeded as `KnowledgeEdge` entries with `type: "Prerequisite"`.
- Seeding is idempotent: checks for existence of the GlobalDSA map before inserting.

#### 4.13.2 Topic Content Generation
- Users can trigger on-demand content generation for any topic via the Gemini REST API.
- Generation produces: one `InteractiveLesson` (6-8 steps) + 5 `Question` records.
- Follows the same Gemini API call pattern as the extraction service (Section 4.2): `responseMimeType: "application/json"`, Zod schema validation.
- Generated content is stored under the Canonical DSA course (resolved at runtime via `db.courses.where("type").equals("Canonical").first()`).
- InteractiveLesson.steps stores JSON-stringified step objects (compatible with existing `string[]` schema).
- Topic tags link content back to the originating `KnowledgeNode`.

#### 4.13.3 Status Tracking
- `KnowledgeNode.status` transitions from `"NotCovered"` to `"Covered"` upon successful content generation.
- Regeneration: if content already exists, existing records are deleted before generating new ones.

#### 4.13.4 UI Components
- Topic Explorer page (`/explorer`): categorized outline with search/filter, progress summary.
- Topic Detail page (`/explorer/:nodeId`): description, prerequisite links, content tabs (Lesson | Practice Questions), generation button.

---

## 5. Data Design

### 5.1 Storage Strategy

Primary local database: IndexedDB with typed repositories and migration versioning.

Core principles:
- Separate source and derived entities
- Append-only audit/events for sensitive operations
- All write operations timestamped and versioned

### 5.2 Logical Schema

All collections below correspond to entities defined in SRS Section 6.1 and 6.3. Collections marked with `*` are **design-inferred** — they were introduced in this SDS to satisfy SRS requirements (e.g., FR-66 versioning, FR-29.7 audit trail, FR-46 offline queue) and have been traced back to the SRS in v0.3.

Main collections/tables:
- `users` (optional local profile)
- `courses`
- `modules`
- `lessons`
- `course_docs`
- `course_doc_versions`
- `course_doc_parses`
- `class_assessments`
- `assessment_format_profiles`
- `assessment_rubrics`
- `course_style_profiles`
- `questions`
- `interactive_lessons`
- `lesson_steps`
- `quiz_sessions`
- `attempts`
- `mistake_bank_items`
- `review_schedule_items`
- `mastery_scores`
- `mastery_history`
- `knowledge_maps`
- `knowledge_nodes`
- `knowledge_edges`
- `derived_artifacts`
- `artifact_dependencies`
- `generation_jobs`
- `sync_queue`
- `audit_log`

### 5.3 Required Keys and Indexes

1. `courses`
- PK: `courseId`
- Indexes: `type`, `updatedAt`

2. `course_docs`
- PK: `docId`
- Indexes: `courseId`, `type`, `mappedAssessmentId`, `updatedAt`

3. `questions`
- PK: `questionId`
- Indexes: `courseId`, `targetAssessmentId`, `difficulty`, `topicTags[*]`, `type`, `sourceDocId`

4. `quiz_sessions`
- PK: `sessionId`
- Indexes: `courseId`, `targetAssessmentId`, `mode`, `createdAt`

5. `attempts`
- PK: `attemptId`
- Indexes: `sessionId`, `questionId`, `courseId`, `topicTags[*]`, `timestamp`

6. `knowledge_nodes`
- PK: `nodeId`
- Indexes: `mapId`, `topicTags[*]`, `category`, `status`

7. `derived_artifacts`
- PK: `artifactId`
- Indexes: `courseId`, `artifactType`, `targetAssessmentId`, `status`, `version`, `createdAt`

8. `artifact_dependencies`
- PK: `dependencyId`
- Indexes: `sourceDocId`, `artifactId`

### 5.4 Entity Constraints

- Global map requires `courseId = null`; course map requires non-null `courseId`.
- Knowledge edges must remain intra-map.
- `mappedAssessmentId` allowed only for CourseDoc `type=QuizInfo`.
- Generated artifacts require provenance metadata except allowed General DSA fallback path.
- Topic coverage tags must resolve to known tags for the course context.

### 5.5 Versioning Model

1. `course_doc_versions`
- Snapshot raw text and metadata per edit
- Linked by `docId`, monotonically increasing `versionNo`

2. `derived_artifacts`
- Version chain with `parentArtifactId`
- `status`: `Active | Outdated | Superseded | Archived`

3. Update behavior
- Source doc edit marks dependent active artifacts as `Outdated`
- Regeneration creates new artifact version by default

---

## 6. Interface Design

### 6.1 Internal Service Contracts

Design pattern:
- Command handlers perform writes and emit domain events.
- Query handlers return projection models for UI.
- Events are dispatched via an **in-memory event bus** (synchronous within the same transaction boundary, asynchronous for side-effects like mastery recalculation and map updates).
- The event bus uses a simple publish/subscribe pattern implemented as a Zustand middleware or standalone `EventEmitter` class — no external pub/sub infrastructure for MVP.
- Events are **fire-and-forget** for side-effects; they are not persisted as an event store. The `audit_log` table records sensitive operations separately for traceability.
- Dexie live queries handle UI reactivity — the event bus coordinates cross-service side-effects only.

Representative commands:
- `ImportCourseDocCommand`
- `CreateClassAssessmentCommand`
- `GenerateBaselinePackCommand`
- `GenerateOnDemandQuizCommand`
- `SubmitQuizAnswerCommand`
- `RegenerateArtifactCommand`

Representative events:
- `CourseDocImported`
- `CourseDocParseReviewed`
- `ClassAssessmentCreated`
- `ArtifactGenerated`
- `ArtifactGenerationFailed`
- `QuizSessionCompleted`
- `MasteryUpdated`
- `SourceDocChangedArtifactsOutdated`

### 6.2 Optional Remote APIs (v1+)

1. Auth
- `POST /api/v1/auth/session`
- `DELETE /api/v1/auth/session`

2. Sync
- `POST /api/v1/sync/push`
- `POST /api/v1/sync/pull`
- `POST /api/v1/sync/conflicts/resolve`

3. Generation
- `POST /api/v1/generation/quiz`
- `POST /api/v1/generation/interactive-lesson`

### 6.3 Generation Request Contract

```json
{
  "courseId": "c_123",
  "targetAssessmentId": "a_3",
  "mode": "Baseline|OnDemand",
  "difficulty": "Easy|Medium|Hard",
  "styleMode": "Normal|StylePlusTwist",
  "focusMode": "Coverage|WeakTopics",
  "quantity": 10,
  "twistIntensity": "Low|Medium|High",
  "sourceDocIds": ["d_1", "d_8"]
}
```

Response:
- Generated items
- Provenance mapping list
- Validation summary
- Generation metadata (template id or model/version)

### 6.4 Provider Adapter Contract

Provider abstraction (wraps Vercel AI SDK):
- `generateStructured(prompt, zodSchema, config): ProviderResult` — maps to `generateObject()` from `ai` package
- `streamStructured(prompt, zodSchema, config): AsyncIterable<PartialResult>` — maps to `streamObject()` for interactive lessons

The Zod schema passed to `generateObject()` defines the exact output shape (question type, answer key, explanation, tags, difficulty), enforcing FR-29.4 at the SDK level.

ProviderResult normalized to:
- `rawOutput`
- `structuredItems` (typed by Zod schema — zero manual parsing)
- `modelName`
- `modelVersion`
- `tokenUsage` (from `usage` field in AI SDK response)
- `latencyMs`

Provider configuration:
- Provider selection via `@ai-sdk/google` (default), `@ai-sdk/openai`, `@ai-sdk/anthropic`, or any Vercel AI SDK-compatible provider.
- Credentials stored in user settings (localStorage for MVP; encrypted remote config for v1).
- Model selection passed as `model` parameter to the AI SDK — supports future Model Picker (FR-26.1) without adapter changes.

---

## 7. Core Workflows

### 7.1 Import to Baseline Pack

1. User imports CourseDoc (text paste).
2. Extraction pipeline creates parse with confidence.
3. User reviews and corrects low-confidence items.
4. User creates/maps ClassAssessment.
5. Baseline policy triggers generation.
6. Guardrail pipeline validates outputs.
7. Artifacts stored with provenance and labeled `Practice for Quiz X`.

### 7.2 On-Demand Generation with Style + Twist

1. User selects assessment + controls (difficulty/style/focus/quantity).
2. Effective style profile resolved (inferred + overrides + locks).
3. Candidate question plans generated from coverage/misconceptions.
4. Twist transformer applies bounded novelty.
5. Dedup service rejects near duplicates.
6. Final artifacts saved with generation metadata and provenance.

### 7.3 Quiz Attempt to Mastery Update

1. Session starts with configured mode and feedback policy.
2. Each answer submission evaluated and persisted.
3. Mistake bank updates for incorrect or low-confidence responses.
4. Mastery engine updates scores and trend history.
5. Knowledge map statuses recomputed (weak/in-progress/mastered).
6. Recommendation list updated.

### 7.4 Source Update and Outdated Artifacts

1. CourseDoc edit creates a new source version.
2. Dependency table identifies affected derived artifacts.
3. Affected artifacts marked `Outdated`.
4. UI shows outdated badges and regeneration actions.
5. Regeneration creates new artifact version chain.

### 7.5 Offline Queue and Sync

1. Mutations are committed locally immediately.
2. If sync-enabled and offline, mutation record enters `sync_queue`.
3. On reconnect, queue is pushed in order.
4. Pull phase retrieves remote changes.
5. Conflict resolution applies policy and logs audit records.

---

## 8. UI and Interaction Design

### 8.1 Layout and Navigation (FR-50 to FR-54)
- Left sidebar for course/navigation context.
- Top bar for search, command palette, theme, and quick actions.
- Split-view workspace for source vs generated artifacts.

### 8.2 Core Screens
- Dashboard: This Week, Due Soon, Recommended Practice, Recent Imports
- Course Home: modules, coverage, assessment focus
- Docs Workspace: source docs, parse review panel, mapping panel
- Assessment Workspace: baseline pack and on-demand controls
- Quiz Runner: prompt area, review flags, feedback mode switch
- Mistake Bank and Mastery: weak topics, trends, drill actions
- Knowledge Maps: global and course map views with filters
- Topic Explorer: categorized outline view of all DSA topics with search/filter, topic detail with on-demand content generation

### 8.3 Accessibility (FR-55 to FR-57)
- Keyboard-first interactions for primary actions
- Focus-visible states and contrast-safe tokens
- ARIA labels and landmarks for interactive regions

---

## 9. Security, Privacy, and Safety

### 9.1 Privacy Boundaries
- Local-only mode never transmits CourseDocs externally.
- Sync and remote generation require explicit user enablement.
- Sync scope is enforced per course settings.

### 9.2 Content Safety and Guardrails
- PII pattern filters during extraction and generation publishing.
- Verbatim-copy limiter for generated content from source docs.
- Unsafe instruction filtering unless explicitly in approved educational context.
- All AI outputs labeled as `Derived` with model/version metadata.

### 9.3 Auditability
- Audit log records:
  - generation requests and outcomes
  - user edits to generated content
  - sync conflict resolutions
  - privacy mode and scope changes

### 9.4 Error Handling Strategy

General approach:
- All service-layer operations return typed result objects (`Result<T, E>` pattern) rather than throwing exceptions, ensuring errors are handled explicitly at call sites.
- UI displays errors via a toast notification system (non-blocking) for recoverable errors and inline error states for form/input validation failures.

Specific error scenarios:

| Scenario | Behavior |
|----------|----------|
| Extraction fails (unparseable text) | Show partial parse with all items flagged `NeedsReview`; log to `IMPORT` category |
| Generation guardrail rejects output | Show user-facing message identifying the rejection reason (e.g., "Missing provenance"); offer retry or template fallback |
| Remote AI provider unavailable | Automatic fallback to deterministic template generation (FR-29.8); toast notification informing user |
| Remote AI provider returns invalid schema | Reject output; log validation errors; offer retry with same or different parameters |
| IndexedDB storage quota exceeded | Block write with user-facing warning; suggest exporting and deleting old courses (FR-84) |
| Dexie migration failure | Block app startup with recovery instructions; preserve existing data |
| Sync conflict (v1) | Apply last-write-wins policy; log to audit; surface conflict count in sync status indicator |
| Search index corruption | Rebuild index from Dexie data on next query failure; transparent to user |

---

## 10. Performance and Reliability Design

### 10.1 Performance Budgets
- Local navigation query target: <100 ms for normal datasets.
- Quiz interaction target: <=200 ms evaluation path on modern hardware.
- Search query target: <150 ms for indexed local queries.

### 10.2 Reliability Tactics
- Atomic local write transactions for command handlers.
- Idempotent generation job records to avoid duplicate artifacts.
- Retry/backoff strategy for queued sync and remote generation requests.
- Deterministic fallback generator when remote provider unavailable.

### 10.3 Capacity Targets (Initial)
- 1,000 to 10,000 questions per local profile
- 100+ CourseDocs per course
- 50+ assessments per course
- Historical attempts retained indefinitely unless user purges

---

## 11. Observability

Client-side diagnostics (opt-in):
- extraction confidence distribution
- generation validation failures
- provider latency/failure rates
- sync queue depth and conflict counts

Log categories:
- `IMPORT`
- `GENERATION`
- `QUIZ`
- `MASTERY`
- `SYNC`
- `SECURITY`

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Extractors and confidence scoring
- Style profile merge and lock precedence
- Template generation determinism
- Mastery update math
- Dedup signature calculations

### 12.2 Integration Tests
- Import -> parse review -> assessment mapping
- Baseline pack generation and provenance persistence
- Quiz session completion with mastery and mistake bank updates
- Source edit -> outdated marking -> regeneration version chain
- Offline queue replay and conflict handling

### 12.3 End-to-End Acceptance Scenarios
- Cover SRS Section 9 MVP criteria directly
- Additional v1 scenarios for remote generation and exam mode

---

## 13. FR/NFR Traceability Matrix

### 13.1 Functional Requirements Coverage

| SRS Requirement Group | SDS Sections / Components |
|---|---|
| FR-1 to FR-7 Course management and canonical curriculum | 4.1, 5.2 (`courses/modules/lessons`) |
| FR-8 to FR-14 Import and extraction | 4.2, 7.1, 12.1, 12.2 |
| FR-15 to FR-18 CourseDNA style profile | 4.4, 7.2 |
| FR-19 to FR-22 Question bank model | 4.1, 5.2 (`questions`), 6.1 |
| FR-23 to FR-26.8 Generation and interactive lessons | 4.5, 4.6, 6.3, 7.1, 7.2 |
| FR-27 to FR-29.10 Traceability, guardrails, trust | 4.5, 5.4, 9.2, 9.3 |
| FR-30 to FR-32 Quiz runner | 4.7, 7.3, 8.2 |
| FR-33 to FR-36.5 Attempts, mastery, mistake bank | 4.8, 7.3, 5.2 (`attempts/mastery`) |
| FR-37 to FR-39 Study planning | 4.8, 8.2 dashboard panels |
| FR-40 to FR-41 Search and command palette | 4.11, 8.1 |
| FR-42 to FR-43 Import/export portability | **Deferred to Future phase.** Data model supports export (all entities are JSON-serializable via Dexie). Implementation of export/import UI and ZIP packaging is not designed in this version. |
| FR-44 to FR-46 Local-first and offline | 3.2 Mode A, 5.1, 7.5 |
| FR-47 to FR-49 Remote sync | 4.12, 6.2, 7.5 |
| FR-50 to FR-57 UI and accessibility | 8.1 to 8.3 |
| FR-58 to FR-65 Knowledge maps | 4.9, 5.2 (`knowledge_*`), 8.2 |
| FR-66 to FR-69 Lifecycle/versioning | 4.10, 5.5, 7.4 |
| FR-70 to FR-73 Assessment profiles and rubric scoring | 4.3, 4.7 |
| FR-74 to FR-77 Mastery and recommendation rules | 4.8, 7.3 |
| FR-78 to FR-81 Interactive lesson engine | 4.5, 5.2 (`interactive_lessons/lesson_steps`) |
| FR-82 to FR-84 Privacy modes and sync scope | 4.12, 9.1 |
| FR-85 to FR-87 Exam simulation mode | 4.7, 8.2 |
| FR-88 to FR-90 Import quality workflow | 4.2, 7.1 |
| FR-91 to FR-92 Analytics and stuck-pattern detection | 4.8, 8.2, 11 |
| FR-93 to FR-94 Dashboard | 8.2, Dexie live queries for reactive panel updates |
| FR-95 to FR-102 Topic Explorer | SDS Section 4.13, Data: knowledge_maps, knowledge_nodes, knowledge_edges, interactive_lessons, questions |

### 13.2 Nonfunctional Requirements Coverage

| NFR | Design Coverage |
|---|---|
| NFR-1, NFR-2 Performance | 10.1 budgets, indexed local query design in 5.3 |
| NFR-3, NFR-4 Reliability | 5.1 storage strategy, 10.2 reliability tactics |
| NFR-5, NFR-6 Security and privacy | 9.1 privacy boundaries, 6.2 sync/auth endpoints |
| NFR-7, NFR-8 Usability and clarity | 8 UI flows, 4.2 import pipeline, 9.2 derived labeling |
| NFR-9, NFR-10 Maintainability/extensibility | 3.3 module boundaries, 4.5 provider abstraction |
| NFR-11 Observability | 11 diagnostics and logging |

---

## 14. Implementation Phasing

### 14.1 MVP Phase
- Local-only architecture and data schema
- Import/extraction + review workflow
- ClassAssessment + baseline pack deterministic generation
- Quiz runner, attempts, mistake bank, mastery, weak-topic recommendations
- Knowledge map rendering and mastery overlays
- Outdated marking and basic regeneration flow

### 14.2 v1 Phase
- Remote generation adapter via Vercel AI SDK (Gemini-3-Flash default)
- Guardrail hardening and model metadata persistence
- Sync/auth service integration with scope controls
- Exam mode and rubric scoring enhancements

### 14.3 Future Phase
- Model picker and per-task model settings
- Advanced conflict resolution policies
- OCR/PDF ingestion
- Course export/import round-trip and richer diff UI

---

## 15. Open Design Decisions

1. Exact extraction confidence model (rule-based vs hybrid ML-assisted) for MVP.
2. Prompt template catalog format and versioning strategy.
3. Whether mastery history is event-sourced only or stored as periodic snapshots plus events.
4. Privacy model for remote generation payload minimization when source docs are restricted.
5. Granularity of dedup similarity threshold tuning for Style + Twist mode.
