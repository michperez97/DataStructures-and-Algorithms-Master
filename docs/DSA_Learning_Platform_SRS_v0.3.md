# Software Requirements Specification (SRS)
## Project: DSA Learning Platform with Course Import & Style Profiles

**Version:** 0.4
**Date:** 2026-02-26 (America/New_York)
**Author:** Michel

---

## Change Log
- **v0.3 → v0.4:** Added Topic Explorer feature (FR-95 to FR-102) — browsable library of all DSA topics with on-demand content generation via Gemini.
- **v0.2 → v0.3:** Added missing entity schemas (Attempt, CourseStyleProfile, CourseDocParse, ReviewScheduleItem, Course, Module, Lesson, MistakeBankItem, MasteryScore, DerivedArtifact, AuditLogEntry). Resolved flashcard/review-set phantom feature. Clarified phase assignments for all FRs. Added missing MVP acceptance criteria. Quantified NFR-1. Added dashboard FR. Specified spaced repetition model. Completed Section 8 phase classification. Added technology stack reference.
- **v0.1 → v0.2:** Expanded requirements coverage (roles, accessibility, auditability, generation traceability, content governance, import/export, search, analytics, performance, offline + sync, extensibility).

---

## 1. Introduction

### 1.1 Purpose
This SRS defines requirements for a web application that provides a general Data Structures & Algorithms (DSA) learning platform and allows students to create course-specific experiences by importing instructor materials (announcements, quiz outlines, study guides). The system generates study plans and quizzes aligned to both canonical DSA content and course-specific style.

### 1.2 Scope
The system will:
- Provide a **canonical DSA curriculum** (topics, practice, quizzes).
- Support **user-created courses** (DSA and non-DSA topics) using the same learning engine.
- Support **imported courses** created from class materials, producing a **Course Style Profile (CourseDNA)** that influences generation and presentation.
- Deliver **local-first** offline capability with optional **remote sync**.
- Offer a **technical, modern UI** optimized for learning, code tracing, and dashboard workflows.

### 1.3 Definitions
- **CourseDoc:** Imported document (announcement/quiz info/study guide/notes).
- **CourseDNA / Style Profile:** Course-specific preferences derived from CourseDocs.
- **Derived Content:** Generated quizzes/cards/tasks produced from source docs.
- **Traceability:** Link from derived content back to source doc snippet(s).
- **Local-first:** Stored and functional offline by default.

### 1.4 Goals
- Reduce friction from “what should I study” by turning course materials into structured practice.
- Preserve trust by showing why generated content exists and where it came from.
- Provide a reusable learning platform beyond a single semester.

### 1.5 Non-Goals (MVP)
- OCR ingestion from images/PDFs (future).
- Real-time collaborative editing (future).
- Automatic LMS integrations (future).

---

## 2. Overall Description

### 2.1 Product Perspective
Standalone web application with:
- Learning Engine (courses, lessons, quizzes, attempts, review scheduling)
- Import & Extraction Pipeline (CourseDocs → metadata)
- Style Engine (CourseDNA)
- Generation Engine (templates for MVP; AI optional later)
- Storage Layer (local-first; optional remote)

### 2.2 User Classes & Roles
- **Student (Primary):** Uses courses, imports materials, practices.
- **Author (Optional):** Creates/edits canonical lessons and question banks.
- **Admin (Future/Remote):** Manages shared workspaces/courses.

### 2.3 Operating Environment
- Desktop web browsers (primary), responsive support for mobile.
- IndexedDB for local persistence.
- Optional remote backend with auth and database.

### 2.4 Technology Stack
| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React 19 + Vite | Local-first SPA; no SSR needed for MVP |
| Language | TypeScript (strict mode) | Project-wide type safety |
| Local Database | Dexie.js (IndexedDB) | Migration versioning, live queries, Dexie Cloud path for future sync |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS; copy-paste component primitives |
| Graph Visualization | React Flow | Interactive knowledge map rendering with custom nodes |
| Code Highlighting | Shiki | Syntax highlighting for code blocks and trace questions |
| Command Palette | cmdk | Keyboard-first command palette |
| State Management | Zustand | Lightweight global state; complements Dexie live queries |
| AI/LLM SDK | Vercel AI SDK (`ai`) | Provider-agnostic; structured output with Zod; streaming support |
| Default AI Provider | Google Gemini (`@ai-sdk/google`) | Gemini-3-Flash default; swappable via provider adapter |
| Schema Validation | Zod | Runtime validation for generation outputs and data schemas |
| Routing | React Router v7 | Client-side SPA routing |
| Testing | Vitest + React Testing Library | Vite-native test runner |

### 2.5 Constraints
- Must function offline for core learning flows.
- Must clearly separate **source** vs **derived** content.

### 2.6 Assumptions
- Users can copy/paste LMS text for announcements and quiz info.

---

## 3. System Features and Functional Requirements

### 3.1 Course Management
- **FR-1:** Create/read/update/delete (CRUD) Courses.
- **FR-2:** Courses shall support types: **Canonical**, **User-authored**, **Imported**.
- **FR-3:** Courses shall support Modules/Units and Lessons/Notes.
- **FR-4:** Courses shall store topic tags (e.g., Hashing, AVL, Graphs).
- **FR-5:** Courses shall support course-level settings (difficulty, schedule cadence, notation preferences).

### 3.2 Canonical DSA Curriculum
- **FR-6:** The system shall provide a built-in “DSA Canonical” course.
- **FR-7:** Canonical course shall include at least: complexity analysis, recurrences/master theorem, hashing, trees (BST/AVL/heap), graphs (BFS/DFS), sorting.

### 3.3 CourseDocs Import
- **FR-8:** Users shall add CourseDocs by pasting text (MVP).
- **FR-9:** CourseDocs shall have types: Announcement, Quiz Info, Study Guide, Notes, Other.
- **FR-10:** CourseDocs shall support metadata: posted date, effective week, due date(s), links, attachments placeholder.
- **FR-11:** Users shall edit and annotate CourseDocs after import.
- **FR-11.1:** For **Quiz Info** docs, the system shall allow the user to map the doc to a **Class Assessment** (e.g., “Quiz 3”) including coverage and format.

### 3.4 Extraction & Structuring
- **FR-12:** The system shall extract topics, dates, and action items from CourseDocs.
- **FR-13:** The system shall display extracted items for user review and correction.
- **FR-14:** The system shall maintain an internal normalized representation (“CourseDoc Parse”) with:
  - detected topics
  - detected tasks
  - detected due dates
  - detected quiz coverage statements

### 3.5 Course Style Profile (CourseDNA)
- **FR-15:** The system shall generate a Style Profile per course.
- **FR-16:** The Style Profile shall include:
  - terminology map (e.g., node↔vertex)
  - notation preference (O/Θ emphasis)
  - question-type weights (trace vs conceptual vs implementation)
  - difficulty level (1–5)
  - strictness rubric (lenient→strict)
- **FR-17:** Users shall override and lock specific style parameters.
- **FR-18:** Style changes shall affect future generation while preserving historical content.

### 3.6 Question Bank
- **FR-19:** The system shall support a per-course Question Bank.
- **FR-20:** Questions shall support types: MCQ, Short Answer, Trace, Big-O classification/simplification.
- **FR-21:** Questions shall support tags: topics, difficulty, format, source.
- **FR-22:** Questions shall support solutions: correct answer(s), explanation, references.

### 3.7 Generation
**Description:** Convert CourseDocs and topic libraries into derived learning materials.

**Functional Requirements**
- **FR-23:** The system shall generate derived content (quizzes and interactive lessons) from CourseDocs and topic libraries.
- **FR-24 (MVP):** Generation shall be template-based and deterministic.
- **FR-24.1:** The system shall support quiz difficulty presets: **Easy**, **Medium**, **Hard**.
- **FR-24.2:** Difficulty presets shall control generation parameters such as:
  - question difficulty distribution
  - presence of multi-step reasoning/trace items
  - time pressure recommendations (optional)
  - stricter distractors for MCQ
- **FR-24.3:** The system shall allow selecting difficulty when generating a quiz/interactive lesson.

- **FR-25 (Remote AI - v1):** The system shall support remote AI generation using **Gemini-3-Flash** as the default model.
- **FR-25.1:** The system shall allow configuring a generation provider endpoint/key when remote AI generation is enabled.
- **FR-26:** Generated items shall record provenance (source doc + snippet range).

#### 3.7.1 Course-Style Quiz Generation
**Description:** Imported courses should generate quizzes that match the instructor’s assessment style.

- **FR-26.0:** For **Imported** courses, quiz generation shall conform to the course’s **Style Profile (CourseDNA)**.
- **FR-26.0.1:** Course-style conformity shall include, at minimum:
  - terminology and notation preferences
  - preferred question formats (trace vs conceptual vs implementation)
  - typical quiz structure (e.g., mostly MCQ, mostly short answer, mixed)
  - strictness rubric (lenient→strict)
- **FR-26.0.2:** When difficulty is selected (Easy/Medium/Hard), the system shall apply difficulty **within** the boundaries of the course style (e.g., “Hard” increases complexity but preserves the instructor’s format preference).
- **FR-26.0.3:** The system shall learn/update quiz-style parameters using signals from uploaded quiz info and from user-entered/observed quiz formats.

#### 3.7.1.1 Style + Twist Mode
**Description:** Generate quizzes that preserve course style while introducing novelty so the learner does not memorize exact patterns.

- **FR-26.0.4:** The system shall provide a **Style + Twist** generation mode for Imported courses.
- **FR-26.0.5:** Style + Twist mode shall preserve the course quiz style (format mix, notation, strictness) while applying controlled transformations such as:
  - swapping values/inputs while keeping the same concept
  - changing surface story/context while preserving the underlying DS/algorithm
  - generating new edge cases (e.g., collisions, rotations, boundary conditions)
  - reordering steps in trace prompts or using different but equivalent code/pseudocode structures
  - introducing one additional constraint (e.g., time/space tradeoff choice)
- **FR-26.0.6:** The system shall allow selecting the twist intensity (Low/Medium/High) (optional for MVP).
- **FR-26.0.7:** The system shall prevent excessive drift: twist mode shall not change the core topic coverage beyond configured bounds.

#### 3.7.1.2 Class Quiz Linking
**Description:** Course-area quizzes should be tied to a specific real quiz/exam from the class.

- **FR-26.0.8:** The system shall support a **Class Assessment** entity (e.g., Quiz 1, Quiz 2, Midterm) within an Imported course.
- **FR-26.0.9:** Users shall be able to create or import a Class Assessment from CourseDocs (e.g., a "Quiz Info" doc) with fields such as name, date window, coverage, and format.
- **FR-26.0.10:** When generating a quiz inside the course area, the user shall be able to select a target Class Assessment (e.g., “Generate practice for Quiz 3”).
- **FR-26.0.11:** Generated quizzes shall store a reference to the target Class Assessment and display it in the UI (e.g., badge: “Practice for Quiz 3”).
- **FR-26.0.12:** The system shall prioritize topics and format weights based on the selected Class Assessment’s coverage and style.

#### 3.7.1.3 Generation Policy (Baseline Pack + On-Demand)
**Description:** Provide immediate value while avoiding unnecessary generation, cost, and noise.

- **FR-26.0.13:** For Imported courses, the system shall support a **Baseline Pack** of generated content for each Class Assessment.
- **FR-26.0.14:** The Baseline Pack shall be generated automatically when a Class Assessment is created or first selected (configurable), and shall include at minimum:
  - one **Diagnostic Quiz** (8–12 questions, mixed formats)
  - one **Practice Quiz** (10–15 questions, course-style)
  - one **Common Traps** set (≥5 items targeting likely mistakes)
  - optional: one short **Interactive Lesson** (5–8 steps)
- **FR-26.0.15:** The system shall allow users to disable auto-generation and instead trigger Baseline Pack creation manually.
- **FR-26.0.16:** The system shall support **On-Demand Generation** for additional practice beyond the Baseline Pack.
- **FR-26.0.17:** On-demand generation shall provide controls for:
  - difficulty (Easy/Medium/Hard)
  - style mode (Normal vs Style + Twist)
  - focus mode (Coverage-based vs Weak-Topics-based)
  - quantity (e.g., 5/10/20 questions)
- **FR-26.0.18:** The system shall avoid duplicate questions by tracking prior generated items for a given Class Assessment and using variation/twist to introduce novelty.
- **FR-26.0.19:** On-demand generation shall record metadata: target Class Assessment, difficulty, style mode, and generation parameters.

#### 3.7.1.4 Adaptive Generation (Mastery + Due Dates)
**Description:** Use performance signals to prioritize practice.

- **FR-26.0.20:** The system shall prioritize on-demand recommendations using:
  - Topic mastery signals (weak topics)
  - Selected Class Assessment coverage
  - Upcoming due dates (if present)
- **FR-26.0.21:** The system shall provide a "Generate for Weak Topics" action that creates practice sets weighted toward low-mastery topics while staying within assessment coverage bounds.

#### 3.7.2 Model Selection (Future)
- **FR-26.1 (Future):** The system shall provide a **Model Picker** allowing users (or admins) to select from supported models (e.g., Gemini variants or other providers) per course or per generation task.
- **FR-26.2 (Future):** The system shall persist the selected model and version used for each generation output.
- **FR-26.3 (Future):** The system shall support model-specific settings (e.g., temperature/creativity, max tokens) with safe defaults.

#### 3.7.3 Interactive Lesson Generation
**Description:** Generate interactive lessons on-the-fly that require the learner to solve steps.

- **FR-26.4:** The system shall support **Interactive Lessons** that consist of ordered steps (explanation → prompt → user response → feedback → next step).
- **FR-26.5:** Interactive lessons shall support at minimum:
  - **Concept Check** (short answer)
  - **Trace Mode** (step through code or operations)
  - **Multiple Choice**
  - **Fill-the-gap** (complete a recurrence, complete a table entry)
- **FR-26.6:** The system shall validate learner inputs using a rubric or expected-answer set and provide immediate feedback.
- **FR-26.7:** Interactive lessons generated by AI shall be stored as derived content with provenance to the initiating prompt/source (CourseDoc and/or topic).
- **FR-26.8:** The system shall allow users to regenerate an interactive lesson for the same topic with different difficulty.

### 3.8 Traceability & Trust
- **FR-27:** Every generated question shall link to its source CourseDoc.
- **FR-28:** Users shall be able to view “Generated From” for a question.
- **FR-29:** Users shall be able to regenerate content after editing the source.

#### 3.8.1 AI Safety, Quality, and Guardrails
**Description:** Ensure generated content is accurate, aligned to the course, and clearly labeled as derived.

- **FR-29.1:** The system shall clearly label AI-generated content as **Derived** and display the model name/version used.
- **FR-29.2:** The system shall require **provenance** for AI-generated items when generation is based on CourseDocs (each item must map to at least one supporting snippet).
- **FR-29.3:** If the system cannot establish adequate provenance, it shall either:
  - refuse to generate the item, or
  - generate it as “General DSA” content with an explicit disclaimer that it is not sourced from the course.
- **FR-29.4:** The system shall validate generation outputs against a **schema** (question type, answer field, explanation field, tags, difficulty) and reject/repair invalid outputs.
- **FR-29.5:** The system shall enforce **content constraints** for generated material:
  - no personally identifying information (PII) extraction from CourseDocs
  - no copying large verbatim blocks from course materials into generated outputs (only short excerpts for provenance)
  - no unsafe instructions (e.g., hacking exploitation steps) unless the course explicitly covers safe, defensive practice and the content is framed educationally
- **FR-29.6:** The system shall provide a user workflow to **report** a generated item as incorrect/low-quality.
- **FR-29.7:** The system shall allow users to **edit** generated questions and keep an audit trail of edits (local history).
- **FR-29.8:** The system shall support **deterministic fallback generation** (template mode) when remote AI is unavailable.
- **FR-29.9:** The system shall implement basic **quality checks** before publishing a generated quiz/lesson:
  - answer is non-empty and matches the question type
  - explanation references the correct concept
  - difficulty label within allowed range
  - topic tags present
- **FR-29.10:** The system shall provide a “Regenerate” option with controls for difficulty and format (trace vs conceptual) while preserving the original.

### 3.9 Quiz Runner
- **FR-30:** Users shall take quizzes consisting of multiple question items.
- **FR-31:** The system shall provide instant feedback mode and review-at-end mode.
- **FR-32:** The system shall show explanations and allow marking questions for later.

### 3.10 Attempts, Analytics, Mistake Bank, and Topic Mastery
**Description:** Track performance and estimate proficiency per topic.

**Functional Requirements**
- **FR-33:** The system shall record per-question attempts (answer, correctness, duration, timestamp).
- **FR-34:** The system shall maintain a Mistake Bank per course and per topic.
- **FR-35:** The system shall provide practice modes: Redo Missed, Topic Drill, Timed Quiz.
- **FR-36:** The system shall display progress by topic.

#### 3.10.1 Topic Mastery Tracking
- **FR-36.1:** The system shall maintain a **Topic Mastery Score** per user per course topic.
- **FR-36.2:** Topic mastery shall update based on attempt signals including:
  - correctness
  - recency (recent attempts weighted more)
  - difficulty of questions
  - time-to-answer (optional)
- **FR-36.3:** The system shall support mastery breakdown by **question type** (e.g., Trace vs Concept vs Big-O).
- **FR-36.4:** The system shall surface a "Weak Topics" list and use it to prioritize recommendations and spaced repetition.
- **FR-36.5 (v1):** The system shall allow users to view mastery history over time (trend chart).

### 3.11 Study Planning
- **FR-37:** The system shall provide a weekly view: due dates, tasks, recommended drills.
- **FR-38:** The system shall schedule spaced repetition reviews using a **Leitner-box model** for MVP: items move to longer intervals on correct recall (e.g., 1d → 3d → 7d → 14d → 30d) and reset to the shortest interval on incorrect recall.
- **FR-39:** The system shall allow users to set study targets (minutes/week, questions/day).

### 3.12 Search & Command Palette
- **FR-40:** The system shall provide search across courses, docs, and questions.
- **FR-41:** The system shall provide a command palette (keyboard-first navigation).

### 3.13 Import/Export & Portability
- **FR-42:** The system shall support exporting a course to a portable format (JSON/ZIP) (future-friendly; can be v1.1).
- **FR-43:** The system shall support importing an exported course.

### 3.14 Local-first & Offline
- **FR-44:** The system shall store all data locally by default.
- **FR-45:** The system shall operate offline for viewing and practicing.
- **FR-46:** The system shall queue background operations (e.g., generation requests) and retry when online (future).

### 3.15 Remote Sync (Optional)
- **FR-47:** The system shall support authentication for sync.
- **FR-48:** The system shall sync Courses, CourseDocs, Questions, Attempts, and Style Profiles.
- **FR-49:** The system shall handle conflicts (policy: last-write-wins + audit log) (future).

### 3.16 UI / UX Requirements (Technical + Modern)
- **FR-50:** The UI shall use a left sidebar + top bar layout.
- **FR-51:** The UI shall support dark mode and light mode.
- **FR-52:** The UI shall render code blocks in monospace with line numbers.
- **FR-53:** The UI shall display topic chips and document-type badges.
- **FR-54:** The UI shall support split views (source doc on one side, generated quiz on the other).

### 3.17 Accessibility
- **FR-55:** The UI shall be keyboard navigable.
- **FR-56:** The UI shall provide sufficient contrast and accessible focus states.
- **FR-57:** The UI shall provide ARIA labels for key interactive components.

### 3.18 Knowledge Maps (DSA Field Map + Class Map)
**Description:** Provide visual maps of topics and their prerequisites to guide learning and planning.

- **FR-58:** The system shall provide a global **DSA Knowledge Map** representing the broader DSA domain (topics, subtopics, and prerequisite relationships).
- **FR-59:** The system shall provide a **Course Knowledge Map** for each course that reflects the topics covered and the instructor/class emphasis.

#### 3.18.1 Two-Map Strategy
**Description:** Maintain a global map and a per-course map as distinct artifacts.

- **FR-59.1:** The Global DSA Knowledge Map and each Course Knowledge Map shall be stored as **separate maps** that can evolve independently.
- **FR-59.2:** Course maps shall be linkable to the global map using shared `topicTags` and/or explicit node links (implementation detail), but shall not require a strict one-to-one projection.
- **FR-59.3:** Course maps shall support course-specific nodes/edges (e.g., instructor-specific terminology, custom subtopics) that may not exist in the global map.

- **FR-60:** The Course Knowledge Map shall be generated/updated using signals from:
  - course Modules/Lessons
  - CourseDocs (announcements, quiz info, study guides)
  - Class Assessments coverage
  - user performance (topic mastery)
- **FR-61:** The system shall visually distinguish:
  - topics in the course vs topics not covered
  - mastered vs in-progress vs weak topics (based on mastery scores)
  - upcoming assessment coverage (e.g., highlight topics for “Quiz 3”)
- **FR-62:** The Knowledge Map shall support interactions:
  - zoom/pan
  - search and focus on a node
  - expand/collapse subtopics
  - click a topic to open its lesson, drills, and related CourseDocs
- **FR-63:** The system shall allow course authors/users to manually edit the Course Knowledge Map (add/remove nodes, edit relationships) with changes persisted.
- **FR-64:** The system shall support a "Recommended Path" view that orders topics based on prerequisites, due dates, and weak-topic signals.
- **FR-65:** The system shall allow filtering the map by:
  - topic category (e.g., Trees, Graphs)
  - assessment (e.g., Quiz 3)
  - question type mastery (Trace vs Concept)

#### 3.18.2 Topic Explorer
**Description:** Provide a browsable library of all DSA topics with on-demand content generation, complementing the visual Knowledge Map with a structured outline view.

| FR | Description | Phase |
|---|---|---|
| FR-95 | System shall provide a Topic Explorer page showing all DSA topics organized by category in an outline/tree view | MVP |
| FR-96 | System shall seed a comprehensive GlobalDSA taxonomy (~91 topics, 14 categories) with prerequisite edges on first load | MVP |
| FR-97 | Each topic shall display its content status: NotCovered (no content), Covered (content generated), or mastery-based status once practiced | MVP |
| FR-98 | User shall be able to search/filter topics by name and category | MVP |
| FR-99 | Clicking a topic shall open a detail page showing description, prerequisites, and any generated content (lessons + questions) | MVP |
| FR-100 | User shall be able to trigger on-demand content generation for any topic via Gemini, producing a lesson (6-8 steps) + 5 practice questions | v1 |
| FR-101 | Generated content shall be stored under the Canonical DSA course with topic tags linking back to the KnowledgeNode | v1 |
| FR-102 | Topic status shall update from NotCovered → Covered after successful generation | v1 |

### 3.19 Content Lifecycle & Versioning
**Description:** Manage updates to source materials and derived content over time.

- **FR-66:** The system shall version CourseDocs and preserve edit history (at minimum: previous raw text snapshots).
- **FR-67:** When a CourseDoc changes, the system shall mark dependent derived artifacts (quizzes, questions, lessons) as **Outdated**.
- **FR-68:** The system shall support regeneration policies:
  - regenerate as a **new version** (default)
  - optionally replace an existing derived set
- **FR-69 (v1):** The system shall allow users to view differences between CourseDoc versions (text diff).

### 3.20 Assessment Format Profiles & Rubrics
**Description:** Ensure generated practice mirrors the real assessment structure and grading style.

- **FR-70:** Each ClassAssessment shall have a **Format Profile** (question-type mix, typical length, time limit).
- **FR-71:** The system shall use the Format Profile as the default template when generating “Practice for Quiz X” artifacts.
- **FR-72:** Each ClassAssessment shall support a **Rubric** definition (e.g., strict vs partial credit rules for short answer/trace).
- **FR-73:** The Quiz Runner shall optionally score using the Rubric and present a breakdown consistent with the course style.

### 3.21 Mastery Model & Recommendation Rules
**Description:** Define how topic mastery is computed and used to drive recommendations.

- **FR-74:** The system shall represent mastery on a defined scale (e.g., 0–100) per topic and per question type.
- **FR-75:** Mastery updates shall incorporate correctness, recency decay, and difficulty weighting (configurable per course).
- **FR-76:** The system shall track confidence and require a minimum number of attempts before labeling a topic as Mastered.
- **FR-77:** Recommendations shall prioritize weak topics within the selected ClassAssessment coverage bounds.

### 3.22 Interactive Lesson Engine Specification
**Description:** Define the structure, validation, and remediation behavior for interactive lessons.

- **FR-78:** Interactive Lessons shall be composed of ordered **Lesson Steps** with a typed schema (Explain | Prompt | Check | Hint | Remediation | Summary).
- **FR-79:** The system shall support step validation strategies:
  - exact match / normalized match
  - set-of-answers match
  - rubric-based scoring (for trace/short answer)
- **FR-80:** The system shall support hinting and remediation rules (e.g., hint after N attempts, remediation step after repeated failures).
- **FR-81:** Interactive Lessons shall support branching based on correctness (optional for MVP, required for v1).

### 3.23 Privacy Modes & Sync Scope
**Description:** Control what data is stored/synced and protect course content.

- **FR-82:** The system shall provide per-course privacy settings: Local-only (default) vs Sync-enabled.
- **FR-83:** When sync is enabled, the system shall allow selecting sync scope:
  - source CourseDocs
  - derived content only
  - attempts/mastery only
- **FR-84:** The system shall allow exporting and deleting all data for a course (data portability + user control).

### 3.24 Exam Simulation Mode
**Description:** Provide realistic practice that mimics in-class quiz/exam constraints.

- **FR-85:** The system shall provide an Exam Mode with configurable time limit and question count.
- **FR-86:** Exam Mode shall support restricted feedback (e.g., review only at end) and optional navigation constraints.
- **FR-87:** Exam Mode shall produce a score report by topic and question type consistent with the assessment rubric.

### 3.25 Import Quality & Review Workflow
**Description:** Keep imports accurate and manageable.

- **FR-88:** The system shall assign confidence scores to extracted topics/dates/tasks.
- **FR-89:** Extracted items below a confidence threshold shall be flagged as **Needs Review**.
- **FR-90:** The system shall provide a fast correction UI for extracted items (edit topic tags, fix dates, map to ClassAssessment).

### 3.26 Analytics & Insights
**Description:** Provide actionable learning insights while respecting privacy.

- **FR-91:** The system shall provide analytics views including:
  - weak topics and trends
  - time-on-task by topic
  - question-type weaknesses (trace vs concept)
- **FR-92:** The system shall detect “stuck” patterns (e.g., repeated failures) and recommend an interactive lesson or foundational drill.

### 3.27 Dashboard
**Description:** Provide an at-a-glance overview of the learner's current state across all courses.

- **FR-93:** The system shall provide a dashboard with the following panels:
  - **This Week:** scheduled reviews and study tasks for the current week
  - **Due Soon:** upcoming Class Assessment dates across all courses
  - **Recommended Practice:** prioritized drills based on weak topics and assessment proximity
  - **Recent Imports:** recently added CourseDocs with extraction status
- **FR-94:** The dashboard shall update panels reactively when underlying data changes (e.g., new import, completed quiz).

---

## 4. External Interface Requirements

### 4.1 User Interface
- Dashboard panels: This Week, Due Soon, Recommended Practice, Recent Imports.
- Course tabs: This Week, Docs, Quiz Bank, Mistakes, Style Profile.
- Quiz runner: question view + review mode.

### 4.2 Software Interfaces
- Local storage interface (IndexedDB/Dexie).
- Optional remote backend interfaces: Auth, Database, Generation API.

---

## 5. Nonfunctional Requirements

### 5.1 Performance
- **NFR-1:** Local navigation queries shall complete in under 100ms and page transitions shall complete in under 200ms for typical datasets (up to 10,000 questions).
- **NFR-2:** Quiz interactions should respond within 200ms on modern hardware (best-effort).

### 5.2 Reliability
- **NFR-3:** Local data must persist across reloads and restarts.
- **NFR-4:** Offline usage shall not cause data loss.

### 5.3 Security & Privacy
- **NFR-5:** Local-first mode shall not transmit CourseDocs off-device unless enabled.
- **NFR-6:** Remote sync shall use HTTPS and secure storage.

### 5.4 Usability
- **NFR-7:** Import-to-quiz flow should be achievable in under 2 minutes for a typical announcement.
- **NFR-8:** The system shall clearly label source vs derived content.

### 5.5 Maintainability & Extensibility
- **NFR-9:** Modular separation: Learning Engine, Import, Style, Generation, Storage, UI.
- **NFR-10:** New question types and generators should be addable without redesign.

### 5.6 Observability (Optional)
- **NFR-11:** The system shall support basic client logs for debugging generation/extraction issues.

---

## 6. Data Requirements (High-Level)

### 6.1 Entities
- User (optional local profile)
- Course
- Module
- Lesson
- CourseDoc
- CourseDocVersion
- CourseDocParse
- **ClassAssessment** (e.g., Quiz 1, Quiz 2, Midterm)
- **AssessmentFormatProfile**
- **AssessmentRubric**
- CourseStyleProfile
- **InteractiveLesson**
- **LessonStep**
- **KnowledgeMap** (DSA global map and per-course map)
- **KnowledgeNode** (topic/subtopic)
- **KnowledgeEdge** (prerequisite/related-to link)
- Question
- QuizSession
- Attempt
- **MistakeBankItem**
- **MasteryScore**
- **DerivedArtifact**
- **ArtifactDependency**
- ReviewScheduleItem
- **GenerationJob**
- **AuditLogEntry**

### 6.2 Key Relationships
- Course → many Modules, Lessons, CourseDocs, ClassAssessments, Questions, QuizSessions, MasteryScores.
- CourseDoc → many CourseDocVersions; one CourseDocParse; many derived Questions via ArtifactDependency; optional linkage to a ClassAssessment when CourseDoc type = QuizInfo.
- ClassAssessment → has one FormatProfile and optional Rubric; has many DerivedArtifacts targeting it.
- InteractiveLesson → may target a topic and/or a ClassAssessment; consists of ordered LessonSteps.
- Question → optional provenance to CourseDoc snippet; optional reference to a target ClassAssessment.
- DerivedArtifact → links to source CourseDoc(s) via ArtifactDependency; version chain via parentArtifactId.
- QuizSession → many Attempts; optional target ClassAssessment.
- Attempt → may produce MistakeBankItem entries; triggers MasteryScore updates.
- MasteryScore → one per (course, topicTag, questionType) combination.

### 6.3 Data Requirements (Detailed)

#### 6.3.0 KnowledgeMap / KnowledgeNode / KnowledgeEdge
**Description:** Represents a topic graph for the global DSA field and for each course.

**KnowledgeMap Required Fields**
- `mapId` (unique)
- `scope` (GlobalDSA | Course)
- `courseId` (nullable; required when scope = Course)
- `name` (e.g., “DSA Field Map”, “COP3530 Map”)
- `version` (optional)
- `createdAt`, `updatedAt`

**KnowledgeNode Required Fields**
- `nodeId` (unique)
- `mapId` (FK)
- `title` (e.g., “Hash Tables”, “Linear Probing”)
- `topicTags[]` (for linking to questions/lessons)

**KnowledgeNode Optional Fields**
- `description`
- `category` (e.g., Arrays, Trees, Graphs)
- `resources` (links)
- `status` (NotCovered | Covered | InProgress | Mastered | Weak) (derived or stored)

**KnowledgeEdge Required Fields**
- `edgeId` (unique)
- `mapId` (FK)
- `fromNodeId` (FK)
- `toNodeId` (FK)
- `type` (Prerequisite | Related)

**Constraints**
- A GlobalDSA map shall have `courseId = null`.
- A Course map shall have `courseId` set.
- KnowledgeEdges shall reference nodes within the same map.
- Course map nodes may be linked to GlobalDSA nodes via shared `topicTags` (implementation detail).

#### 6.3.1 ClassAssessment
**Description:** Represents a real assessment in the student’s class (e.g., “Quiz 3”).

**Required Fields**
- `assessmentId` (unique)
- `courseId` (FK)
- `name` (e.g., “Quiz 3”, “Midterm”)
- `type` (Quiz | Exam | Lab | Other)
- `dateWindow` (optional: open/close timestamps)
- `coverage` (topic tags + optional weights)
- `formatProfile` (expected structure: question type mix, typical length, time limit)
- `sourceDocIds` (0..n CourseDocs that describe the assessment)

**Constraints**
- A ClassAssessment shall belong to exactly one Course.
- Imported courses may have zero or more ClassAssessments.
- Coverage tags must be valid topic tags for that course.

#### 6.3.2 CourseDoc
**Required Fields**
- `docId` (unique)
- `courseId` (FK)
- `type` (Announcement | QuizInfo | StudyGuide | Notes | Other)
- `rawText`
- `createdAt`, `updatedAt`

**Optional Fields**
- `postedAt`
- `dueAt`
- `links[]`
- `mappedAssessmentId` (FK to ClassAssessment; allowed when type = QuizInfo)

#### 6.3.3 Question
**Required Fields**
- `questionId` (unique)
- `courseId` (FK)
- `type` (MCQ | ShortAnswer | Trace | BigO)
- `prompt`
- `answerKey` (structure depends on type)
- `explanation`
- `topicTags[]`
- `difficulty` (Easy | Medium | Hard)

**Provenance / Targeting Fields**
- `sourceDocId` (optional)
- `sourceSnippet` (optional: start/end offsets or line ranges)
- `targetAssessmentId` (optional: links a practice question to a specific ClassAssessment)
- `generationMeta` (optional: model name/version, parameters, template id)

#### 6.3.4 QuizSession
**Required Fields**
- `sessionId` (unique)
- `courseId` (FK)
- `questionIds[]`
- `mode` (Practice | Timed | RedoMissed | TopicDrill | Exam)
- `createdAt`, `completedAt` (optional)

**Optional Fields**
- `targetAssessmentId` (FK to ClassAssessment)
- `difficulty` (Easy | Medium | Hard)
- `styleMode` (Normal | StylePlusTwist)
- `timeLimitSeconds` (optional)
- `feedbackPolicy` (Instant | EndOnly)

#### 6.3.5 AssessmentFormatProfile
**Required Fields**
- `formatProfileId` (unique)
- `assessmentId` (FK)
- `questionTypeMix` (e.g., {MCQ:0.7, Trace:0.2, ShortAnswer:0.1})
- `typicalQuestionCount`

**Optional Fields**
- `timeLimitSeconds`
- `notes`

#### 6.3.6 AssessmentRubric
**Required Fields**
- `rubricId` (unique)
- `assessmentId` (FK)
- `strictness` (Lenient | Standard | Strict)

**Optional Fields**
- `partialCreditRules` (structured)
- `scoringNotes`

#### 6.3.7 InteractiveLesson
**Required Fields**
- `lessonId` (unique)
- `courseId` (FK)
- `title`
- `topicTags[]`
- `steps[]` (ordered list of LessonStep IDs)

**Optional Fields**
- `targetAssessmentId` (optional)
- `difficulty` (Easy | Medium | Hard)
- `sourceDocId` + `sourceSnippet` (optional provenance)
- `generationMeta` (optional)

#### 6.3.8 LessonStep
**Required Fields**
- `stepId` (unique)
- `lessonId` (FK)
- `type` (Explain | Prompt | Check | Hint | Remediation | Summary)
- `content`

**Optional Fields**
- `expectedAnswer` / `answerSet` / `rubric`
- `maxAttemptsBeforeHint`
- `branchOnIncorrect` (optional)

#### 6.3.9 Course
**Description:** A learning container — canonical, user-authored, or imported from class materials.

**Required Fields**
- `courseId` (unique)
- `name`
- `type` (Canonical | UserAuthored | Imported)
- `createdAt`, `updatedAt`

**Optional Fields**
- `description`
- `topicTags[]` (course-level topic scope)
- `difficultyDefault` (Easy | Medium | Hard)
- `cadence` (e.g., weekly, biweekly)
- `notationPreference` (e.g., BigO | BigTheta)
- `privacyMode` (LocalOnly | SyncEnabled; default: LocalOnly)

#### 6.3.10 Module
**Description:** A grouping unit within a course (e.g., "Week 3: Trees").

**Required Fields**
- `moduleId` (unique)
- `courseId` (FK)
- `name`
- `sortOrder` (integer)

**Optional Fields**
- `description`
- `topicTags[]`

#### 6.3.11 Lesson
**Description:** A single learning unit within a module.

**Required Fields**
- `lessonId` (unique)
- `moduleId` (FK)
- `courseId` (FK)
- `title`
- `content` (markdown/structured text)
- `sortOrder` (integer)

**Optional Fields**
- `topicTags[]`
- `estimatedMinutes`

#### 6.3.12 CourseDocParse
**Description:** Normalized extraction output from a CourseDoc.

**Required Fields**
- `parseId` (unique)
- `docId` (FK)
- `detectedTopics[]` (each with label, confidence score, source span)
- `detectedTasks[]` (each with description, confidence score)
- `detectedDueDates[]` (each with date, label, confidence score)
- `detectedCoverageStatements[]` (each with text, mapped topics, confidence score)
- `status` (Pending | Reviewed | Accepted)
- `createdAt`, `updatedAt`

**Optional Fields**
- `reviewerNotes`

**Constraints**
- Exactly one parse per CourseDoc (re-extraction overwrites).

#### 6.3.13 CourseDocVersion
**Description:** A snapshot of CourseDoc raw text at a point in time.

**Required Fields**
- `versionId` (unique)
- `docId` (FK)
- `versionNo` (monotonically increasing integer)
- `rawText` (snapshot)
- `createdAt`

**Optional Fields**
- `changeNote`

#### 6.3.14 CourseStyleProfile
**Description:** Course-specific style preferences inferred from CourseDocs and user overrides.

**Required Fields**
- `profileId` (unique)
- `courseId` (FK)
- `terminologyMap` (structured: e.g., `{ "node": "vertex", "edge": "arc" }`)
- `notationPreference` (BigO | BigTheta | Mixed)
- `questionTypeWeights` (e.g., `{ MCQ: 0.5, Trace: 0.3, ShortAnswer: 0.1, BigO: 0.1 }`)
- `difficultyBaseline` (1–5)
- `strictnessBaseline` (Lenient | Standard | Strict)
- `createdAt`, `updatedAt`

**Optional Fields**
- `lockedFields[]` (list of field names locked by user)
- `inferenceSource` (list of docIds used for inference)

**Constraints**
- One profile per course.
- Locked fields are not overwritten by re-inference.

#### 6.3.15 Attempt
**Description:** A single answer submission for a question within a quiz session.

**Required Fields**
- `attemptId` (unique)
- `sessionId` (FK)
- `questionId` (FK)
- `courseId` (FK)
- `answer` (user's response; structure depends on question type)
- `correct` (boolean)
- `timestamp`

**Optional Fields**
- `durationMs` (time from question display to submission)
- `topicTags[]` (denormalized from question for query efficiency)
- `difficulty` (denormalized from question)
- `confidence` (user self-report; future)

#### 6.3.16 MistakeBankItem
**Description:** A record of a question the user answered incorrectly, used for targeted review.

**Required Fields**
- `mistakeId` (unique)
- `courseId` (FK)
- `questionId` (FK)
- `attemptId` (FK)
- `topicTags[]`
- `createdAt`

**Optional Fields**
- `resolvedAt` (set when user answers correctly in a later session)
- `reviewCount` (number of times practiced via Redo Missed)

**Constraints**
- A question may appear in the mistake bank multiple times (one per incorrect attempt) or be deduplicated to track only the latest miss per question (implementation decision).

#### 6.3.17 MasteryScore
**Description:** Tracks proficiency per topic and question type for a course.

**Required Fields**
- `masteryId` (unique)
- `courseId` (FK)
- `topicTag` (string)
- `score` (0–100)
- `status` (NotStarted | InProgress | Weak | Mastered)
- `attemptCount` (total attempts for this topic)
- `lastAttemptAt`
- `updatedAt`

**Optional Fields**
- `questionTypeBreakdown` (e.g., `{ MCQ: 85, Trace: 40, BigO: 70 }`)
- `trend` (Improving | Stable | Declining; derived from recent history)

**Constraints**
- Status shall not be `Mastered` until `attemptCount` exceeds a configurable minimum threshold.

#### 6.3.18 ReviewScheduleItem
**Description:** A scheduled spaced-repetition review for a topic or question set.

**Required Fields**
- `reviewId` (unique)
- `courseId` (FK)
- `topicTag` (string)
- `nextReviewAt` (timestamp)
- `interval` (current interval in days)
- `box` (Leitner box number: 1–5)
- `createdAt`

**Optional Fields**
- `questionIds[]` (specific questions to review; if empty, system selects from topic)
- `lastReviewedAt`
- `consecutiveCorrect` (streak count)

#### 6.3.19 DerivedArtifact
**Description:** Tracks a generated content item (quiz, interactive lesson) and its lifecycle.

**Required Fields**
- `artifactId` (unique)
- `courseId` (FK)
- `artifactType` (Quiz | InteractiveLesson | CommonTraps | DiagnosticQuiz)
- `status` (Active | Outdated | Superseded | Archived)
- `version` (integer)
- `createdAt`

**Optional Fields**
- `targetAssessmentId` (FK; links to ClassAssessment)
- `parentArtifactId` (FK; previous version in the chain)
- `generationMeta` (model name/version, template id, parameters)
- `label` (e.g., "Practice for Quiz 3")

#### 6.3.20 ArtifactDependency
**Description:** Links a derived artifact to the source CourseDoc(s) it was generated from.

**Required Fields**
- `dependencyId` (unique)
- `artifactId` (FK)
- `sourceDocId` (FK)

**Optional Fields**
- `sourceSnippet` (start/end offsets)

#### 6.3.21 GenerationJob
**Description:** Records a generation request and its outcome for auditability and deduplication.

**Required Fields**
- `jobId` (unique)
- `courseId` (FK)
- `requestType` (BaselinePack | OnDemand | Regeneration)
- `status` (Pending | InProgress | Completed | Failed)
- `createdAt`, `completedAt`

**Optional Fields**
- `targetAssessmentId` (FK)
- `parameters` (difficulty, styleMode, focusMode, quantity, twistIntensity)
- `resultArtifactIds[]` (artifacts produced)
- `errorMessage` (if failed)
- `provider` (Template | model name)

#### 6.3.22 AuditLogEntry
**Description:** Append-only record of sensitive operations for traceability and debugging.

**Required Fields**
- `entryId` (unique)
- `action` (GenerationRequested | GenerationCompleted | GenerationFailed | ContentEdited | ContentReported | SyncConflictResolved | PrivacyModeChanged | DataDeleted)
- `entityType` (e.g., Question, CourseDoc, QuizSession)
- `entityId`
- `timestamp`

**Optional Fields**
- `previousValue` (snapshot or diff)
- `newValue`
- `metadata` (structured; e.g., model version, conflict details)

---

## 7. Constraints and Assumptions

### 7.1 Constraints
- MVP: text paste import; no OCR.
- Must be usable offline.

### 7.2 Assumptions
- LMS content is accessible to copy/paste.

---

## 8. MVP vs Future Enhancements

### MVP
- Canonical DSA course (FR-6, FR-7)
- Custom and imported courses (FR-1 to FR-5)
- Text paste CourseDocs with extraction and review (FR-8 to FR-14, FR-88 to FR-90)
- Class Assessments with format profiles (FR-26.0.8 to FR-26.0.12, FR-70, FR-71)
- CourseDNA style profile inference and overrides (FR-15 to FR-18)
- Deterministic template generation + baseline packs (FR-23, FR-24, FR-26.0.13 to FR-26.0.19)
- On-demand generation with difficulty and Style+Twist (FR-26.0.4 to FR-26.0.7, FR-26.0.16 to FR-26.0.17)
- Quiz runner with instant and end-only feedback (FR-30 to FR-32)
- Attempts, mistake bank, topic mastery tracking (FR-33 to FR-36.4)
- Spaced repetition with Leitner-box model (FR-38)
- Study planning: weekly view, study targets (FR-37, FR-39)
- Knowledge maps: global DSA and per-course with mastery overlays (FR-58 to FR-65)
- Content versioning and outdated marking (FR-66 to FR-68)
- Search and command palette (FR-40, FR-41)
- Dashboard with This Week, Due Soon, Recommended Practice, Recent Imports (FR-93, FR-94)
- Accessibility: keyboard nav, contrast, ARIA labels (FR-55 to FR-57)
- Technical modern UI with dark/light mode (FR-50 to FR-54)
- Local-first offline operation (FR-44, FR-45)
- Analytics: weak topics, time-on-task, stuck-pattern detection (FR-91, FR-92)
- Mastery-driven recommendations (FR-74 to FR-77)
- Privacy: local-only default (FR-82)
- Topic Explorer: browsable topic library with status, search, and detail pages (FR-95 to FR-99)

### v1
- Remote AI generation with Gemini-3-Flash (FR-25, FR-25.1)
- AI guardrails, schema validation, provenance enforcement (FR-29.1 to FR-29.10)
- Interactive lesson generation and engine (FR-26.4 to FR-26.8, FR-78 to FR-81)
- Exam simulation mode with rubric scoring (FR-85 to FR-87, FR-72, FR-73)
- Mastery history trend charts (FR-36.5)
- CourseDoc version diff view (FR-69)
- Adaptive generation from mastery + due dates (FR-26.0.20, FR-26.0.21)
- Remote sync with conflict handling (FR-47 to FR-49)
- Sync scope controls (FR-83)
- Background operation queuing (FR-46)
- Topic Explorer: on-demand content generation via Gemini with status updates (FR-100 to FR-102)

### Future
- Model Picker with per-course/per-task selection (FR-26.1 to FR-26.3)
- OCR and PDF imports
- Import/export round-trip (FR-42, FR-43)
- Data portability and deletion (FR-84)
- Collaboration/roster
- Coding sandbox + tests
- Advanced conflict resolution policies

---

## 9. Acceptance Criteria

### 9.1 MVP Acceptance Criteria (Definition of Done)
- A user can create a course and see it listed on the dashboard.
- A user can view the **Global DSA Knowledge Map** and click a topic node to open related lessons/drills.
- A user can view a **Course Knowledge Map** for an Imported course that highlights covered topics vs not covered.
- A user can paste an announcement as a CourseDoc, and the system extracts at least one topic tag and (if present) one due date/action item.
- The user can review/edit extracted topics/dates/tasks.
- The user can create a **Class Assessment** (e.g., “Quiz 3”) and map a Quiz Info CourseDoc to it.
- The system can generate a quiz from the CourseDoc using template mode (minimum 10 questions) and save it to the course Question Bank.
- Each generated question links back to the originating CourseDoc (provenance shown in UI).
- The system can generate a **Baseline Pack** for a selected Class Assessment (Diagnostic + Practice + Common Traps) and label it "Practice for Quiz X".
- The user can generate additional on-demand practice for that Class Assessment using difficulty (Easy/Medium/Hard) and style mode (Normal/Style+Twist).
- The user can take the quiz, receive feedback, and have attempts recorded.
- Missed questions appear in the Mistake Bank and can be practiced via “Redo Missed.”
- Topic mastery scores update after quiz completion and "Weak Topics" are shown.
- The Course Knowledge Map reflects mastery states (e.g., weak vs mastered) using the topic mastery signals.
- The app remains usable offline for viewing courses and running saved quizzes.
- The dashboard displays This Week, Due Soon, Recommended Practice, and Recent Imports panels that update when data changes.
- The user can search across courses, docs, and questions and receive results within 150ms.
- The command palette opens via keyboard shortcut and provides navigation to common actions.
- Extracted items below the confidence threshold are flagged as "Needs Review" and the user can correct them using a fast inline editing UI.
- Spaced repetition schedules reviews using increasing intervals; correctly recalled items advance to longer intervals and incorrect items reset.
- The user can set study targets (minutes/week, questions/day) and see progress toward them in the weekly view.
- The UI is fully keyboard navigable with visible focus states, sufficient contrast, and ARIA labels on interactive components.
- The system detects "stuck" patterns (repeated failures on a topic) and surfaces a recommendation.
- User can navigate to `/explorer` and see all DSA topics grouped by category.
- User can search and filter topics.
- Clicking a topic shows its detail page with prerequisites and content status.

### 9.2 v1 Acceptance Criteria (Remote AI Enabled)
- The user can enable remote generation and configure provider credentials.
- Remote generation uses **Gemini-3-Flash** by default and stores model/version with outputs.
- Interactive lessons can be generated on-the-fly for a topic and require step-by-step solving.
- The system enforces schema validation, provenance rules, and derived-content labeling for AI outputs.
- The system supports Style + Twist mode and prevents drift outside assessment coverage bounds.
- The system supports Exam Mode with end-only feedback and rubric-aligned scoring.
- User can generate content for a topic and see it appear immediately.

### 9.3 Future Acceptance Criteria
- Model Picker supports selecting from multiple models/providers and persists selection per course or task.
- Remote sync supports multi-device usage with conflict handling policy.
- Import/export works round-trip for a course (export → import reproduces structure and content).
- CourseDoc version diff view is available and outdated derived artifacts are clearly flagged.
- Privacy sync scope supports selecting which data types sync (source vs derived vs attempts).
- Analytics includes stuck-pattern detection and recommended remediation lessons.
