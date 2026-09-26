# SAT-SA --- Frontend Prototype Scope & Implementation Plan

## Prototype Objective

This document defines exactly what should be built in the **SAT-SA
frontend prototype** for the NCIIPC supervisory assessment use case.

The prototype is **not** intended to implement the complete production
SAT-SA platform. It should instead make the core supervisory workflow
visible, interactive, explainable, and demonstrable to evaluators.

The frontend must communicate one central idea:

> **SAT-SA does not replace the SOC. It analyzes submitted operational
> evidence, identifies supervisory signals, prioritizes where human
> examination should focus, and keeps the final decision with the
> examiner.**

The final architecture defines the core flow as:

``` text
CSE / SOC Evidence
        ↓
Evidence Readiness
        ↓
Canonical Evidence
        ↓
Expected Model + Observed Model
        ↓
Expected vs Observed
        ↓
Supervisory Analytics
        ↓
Evidence Fusion
        ↓
Prioritization
        ↓
Supervisory Sampling
        ↓
Examiner Workspace
        ↓
Human Decision
        ↓
Finding / Remediation / Verification
```

The frontend prototype should make this flow demonstrable without
requiring every backend analytics engine to be production-ready.

------------------------------------------------------------------------

# 1. What We Are Building

## 1.1 Product

**SAT-SA --- Supervisory Analytics Tool for SOC Assessment**

## 1.2 Target Organization

**NCIIPC**

## 1.3 Target Environment

-   Secure government environment
-   Offline / air-gapped deployment
-   No cloud dependency
-   No external AI API
-   Human-in-the-loop assessment

The architecture explicitly defines supervisors, examiners, auditors,
and system administrators as the primary users. The frontend prototype
should primarily demonstrate the **Supervisor + Examiner** experience
because those roles expose the most important product capabilities.

------------------------------------------------------------------------

# 2. What the Prototype Must Prove

The prototype should allow a judge to understand these points within a
few minutes:

### 1. SAT-SA works above the SOC

It consumes submitted operational evidence rather than functioning as
another SIEM/SOAR.

### 2. It compares what should happen against what actually happened

``` text
EXPECTED
   ↓
Expected Process
Expected Evidence
Expected Timing
   ↓
VS
   ↓
OBSERVED
Actual Process
Actual Evidence
Actual Timing
```

### 3. It detects more than simple anomalies

The prototype should visibly demonstrate:

-   Execution Gap
-   Negative Space
-   Process Deviation
-   Investigation Signal
-   Behavioural Signal
-   Historical Recurrence
-   Peer Signal
-   Cross-Source Consistency
-   Coverage Gap
-   Metric Integrity
-   Capability Discrepancy

### 4. It fuses evidence

Multiple independent signals should contribute to a **Finding
Candidate**.

### 5. It prioritizes limited human attention

The system should demonstrate CSE → Control → Process → Case
prioritization and recommended sampling.

### 6. It keeps the human examiner in control

The system detects, explains, and prioritizes.

The examiner:

-   validates
-   rejects
-   qualifies
-   overrides
-   requests evidence
-   adds notes
-   triggers remediation

### 7. Every important result is traceable

The examiner should be able to move from:

``` text
Finding
 ↓
Why Flagged
 ↓
Expected
 ↓
Observed
 ↓
Signals
 ↓
Timeline
 ↓
Source Evidence
 ↓
Hash / Provenance
 ↓
Rule / Control Version
 ↓
Examiner Decision
```

This is one of the most important USP demonstrations.

------------------------------------------------------------------------

# 3. Prototype Philosophy

Do **not** build 12 disconnected pages that look like a generic
enterprise dashboard.

Instead, build a coherent supervisory workflow.

The prototype should feel like one application:

``` text
Login
  ↓
Supervisory Dashboard
  ↓
CSE Assessment
  ↓
Finding / Signal
  ↓
Evidence Drill-down
  ↓
Examiner Decision
  ↓
Sampling / Remediation
```

The most important pages should be highly polished.

Secondary pages can be lighter.

------------------------------------------------------------------------

# 4. Recommended Frontend Technology

The final architecture specifies:

  Layer             Technology
  ----------------- -----------------
  Frontend          React
  Language          TypeScript
  Build             Vite
  Styling           Tailwind CSS
  Components        shadcn/ui
  Charts            Recharts
  Tables            TanStack Table
  Backend           FastAPI
  API validation    Pydantic
  Structured DB     PostgreSQL
  Analytical data   Parquet
  Local analytics   DuckDB / Polars

For the prototype, the frontend should use:

``` text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
Recharts
TanStack Table
React Router
```

If the backend is not fully connected yet, use a **mock API/service
layer** rather than scattering hardcoded data directly throughout
components.

Recommended structure:

``` text
Frontend
   ↓
API Service Layer
   ↓
Mock API / FastAPI
```

This makes replacing mock data with the real backend straightforward.

------------------------------------------------------------------------

# 5. Prototype User Roles

The production architecture contains:

``` text
Senior Supervisor
Examiner
Auditor
System Administrator
```

For the first prototype, prioritize:

## Supervisor

Can view:

-   cross-CSE overview
-   CSE priorities
-   key supervisory indicators
-   historical trends
-   peer context
-   findings
-   remediation

## Examiner

Can:

-   inspect findings
-   view expected vs observed
-   inspect supporting signals
-   inspect evidence
-   inspect timeline
-   review provenance
-   validate/reject/qualify/override
-   request additional evidence
-   add notes
-   trigger remediation

Auditor and Administrator pages can be represented as secondary
prototype screens.

------------------------------------------------------------------------

# 6. Core Navigation

Recommended sidebar:

``` text
SAT-SA
────────────────────

Overview

Supervision
  ├── CSE Assessments
  ├── Priority Queue
  └── Recommended Samples

Analytics
  ├── Execution Gaps
  ├── Negative Space
  ├── Process Analysis
  ├── Evidence Quality
  ├── Behavioural Analysis
  ├── Coverage
  └── Consistency

Assessment
  ├── Findings
  ├── Evidence
  ├── Remediation
  └── Verification

Intelligence
  ├── Historical Trends
  ├── Peer Comparison
  └── Signal Discovery

Governance
  ├── Audit
  └── Administration
```

For a 3--5 minute demo, the primary navigation should visually
emphasize:

``` text
Overview
CSE Assessments
Findings
Execution Gaps
Negative Space
Sampling
Remediation
```

------------------------------------------------------------------------

# 7. Page 1 --- Login

## Purpose

Establish the secure NCIIPC environment.

## UI

Show:

-   SAT-SA logo/name
-   NCIIPC context
-   Username
-   Password
-   MFA / verification indicator
-   Secure environment indicator
-   "Air-Gapped / Internal Deployment" status
-   Login button

Example:

``` text
┌────────────────────────────────────────────┐
│                 SAT-SA                     │
│ Supervisory Analytics Tool for SOC         │
│ Assessment                                  │
│                                            │
│  NCIIPC SECURE ENVIRONMENT                 │
│                                            │
│  Username  [____________________]          │
│  Password  [____________________]          │
│                                            │
│  MFA       ● Verified                      │
│                                            │
│  [ SIGN IN ]                               │
│                                            │
│  ● Offline Secure Deployment               │
└────────────────────────────────────────────┘
```

The goal is not to implement real authentication in the prototype. The
goal is to communicate the deployment model.

------------------------------------------------------------------------

# 8. Page 2 --- Supervisory Overview Dashboard

## This is the most important page.

The dashboard should immediately answer:

> **Where should the supervisor focus attention?**

## Top KPI cards

Recommended cards:

``` text
CSEs Assessed
24

Active Findings
17

High-Priority Signals
06

Evidence Readiness
92%

Execution Gaps
31

Negative Space
14

Samples Recommended
28

Open Remediation
09
```

Do not make the dashboard a collection of random statistics.

Every metric should connect to a supervisory action.

------------------------------------------------------------------------

# 9. Dashboard --- Priority Section

Create a large section:

### Supervisory Priority Queue

Example:

  CSE       Priority   Key Signal          Control   Status
  --------- ---------- ------------------- --------- -------------
  CSE-014   High       Execution Gap       CTRL-07   Review
  CSE-009   High       Negative Space      CTRL-12   Review
  CSE-021   Medium     Process Deviation   CTRL-04   Review
  CSE-003   Medium     Recurrence          CTRL-09   Remediation

Clicking a row should open the CSE Assessment.

------------------------------------------------------------------------

# 10. Dashboard --- Signal Distribution

Use a chart showing:

``` text
Execution Gap
Negative Space
Process Deviation
Investigation
Behavioural
Historical
Consistency
Coverage
Metric Integrity
```

Use a bar chart or compact horizontal visualization.

The purpose is to show that SAT-SA uses **multiple supervisory
signals**, not one black-box AI score.

------------------------------------------------------------------------

# 11. Dashboard --- Expected vs Observed

This should be a visually prominent card.

Example:

``` text
EXPECTED vs OBSERVED

Expected Investigation Completion      96%
Observed Investigation Completion      81%

Execution Gap                          15%

Expected Escalation Coverage           92%
Observed Escalation Coverage           71%

Negative Space                         08%
```

Click:

**"View Analysis →"**

This takes the examiner to the analytical view.

------------------------------------------------------------------------

# 12. Dashboard --- Evidence Quality

Show:

``` text
Evidence Readiness
██████████████████░░ 92%

Schema              100%
Completeness         94%
Relationships        89%
Timestamp Quality    97%
Coverage             86%
Cross-file Consistency 91%
```

Important states:

``` text
PRESENT
ABSENT_CONFIRMED
NOT_SUBMITTED
NOT_APPLICABLE
UNKNOWN
```

The UI must make clear:

> **Missing Evidence ≠ Confirmed Failure**

This distinction is explicitly required by the architecture.

------------------------------------------------------------------------

# 13. Dashboard --- Historical Trend

Show a simple trend:

``` text
Supervisory Signals

Jan ──╮
Feb ──╯╮
Mar ───╯╮
Apr ─────╯
May ──────
Jun ─────╮
Jul ─────╯
```

Allow the user to switch:

-   Execution Gaps
-   Negative Space
-   Process Deviations
-   Recurring Findings
-   Remediation Regression

------------------------------------------------------------------------

# 14. Dashboard --- Recommended Samples

Show:

``` text
28 Recommended Samples

Risk-based              8
Evidence-based          5
Coverage-based          4
Recurrence-based        3
Anomaly-based           3
Peer-based              2
Baseline / Random       3
```

This directly demonstrates the Supervisory Sampling Engine.

------------------------------------------------------------------------

# 15. Page 3 --- CSE Assessments

Display all CSEs.

Recommended columns:

``` text
CSE ID
Sector
Assessment Period
Evidence Readiness
Priority
Execution Gap
Negative Space
Process Deviation
Open Findings
Remediation
Status
```

Add filters:

-   Sector
-   Assessment period
-   Priority
-   Finding type
-   Evidence readiness
-   Remediation status

------------------------------------------------------------------------

# 16. CSE Assessment Detail Page

This page should tell the complete story of one CSE.

## Header

``` text
CSE-014
Critical Infrastructure Entity

Assessment Period:
01 Aug 2026 — 31 Aug 2026

Assessment Status:
UNDER EXAMINATION
```

Show:

``` text
Evidence Readiness: 91%
Supervisory Priority: HIGH
Open Findings: 4
Recurring Signals: 2
Remediation: 1 Open
```

------------------------------------------------------------------------

# 17. CSE Assessment --- Capability Discrepancy

This is an important USP.

Create a dedicated card:

### Capability Discrepancy

``` text
CLAIMED CAPABILITY
Investigation Capability: HIGH

OBSERVED CAPABILITY
Evidence-backed Investigation Depth: MEDIUM

Signals:
• Incomplete investigation steps
• Weak evidence coverage
• Low escalation behaviour
• Repeated shallow patterns

Capability Discrepancy
────────────────────────
Requires Examiner Review
```

Important wording:

**Do not display "Capability Failed".**

Display:

**"Capability Discrepancy --- Review Required"**

The architecture explicitly states that this is a supervisory signal and
not an automatic declaration of capability failure.

------------------------------------------------------------------------

# 18. Page 4 --- Execution Gap Analysis

This is one of the core USP pages.

## Header

``` text
Execution Gap Analysis

Question:
What should have happened but did not?
```

Show a visual comparison:

``` text
EXPECTED PROCESS
Alert
 ↓
Case
 ↓
Investigation
 ↓
Escalation
 ↓
Response
 ↓
Closure

OBSERVED PROCESS
Alert
 ↓
Case
 ↓
Investigation
 X Escalation
 ↓
Response
 ↓
Closure
```

Highlight the missing step.

------------------------------------------------------------------------

# 19. Execution Gap Table

Example:

  Case        Expected        Observed   Gap          Evidence
  ----------- --------------- ---------- ------------ -----------
  CASE-1042   Escalation      None       Missing      4 records
  CASE-1098   Investigation   Partial    Incomplete   6 records
  CASE-1130   Evidence        Missing    Missing      2 records

Clicking a case opens the evidence drill-down.

------------------------------------------------------------------------

# 20. Page 5 --- Negative Space Analysis

This should be a distinct page because it is one of the strongest
conceptual differentiators.

## Header

``` text
Negative Space Detection

Question:
What evidence should exist but does not?
```

Show:

``` text
Expected Evidence
        ↓
Expected Coverage
        ↓
Submitted Evidence
        ↓
Coverage Comparison
        ↓
Evidence State
        ↓
Negative Space Candidate
```

------------------------------------------------------------------------

# 21. Negative Space Visualization

Example:

``` text
Expected Monitoring Coverage

Critical Assets          100%
Expected Telemetry       100%
Observed Telemetry        78%

             ↓

22% Coverage Gap

             ↓

NEGATIVE SPACE CANDIDATE
```

Then immediately show:

``` text
Context Check

Possible causes:
○ Incomplete submission
○ Incorrect mapping
○ Asset change
○ Legitimate exception
○ Evidence genuinely missing

Status:
REQUIRES EXAMINER REVIEW
```

This demonstrates that SAT-SA does not make the simplistic assumption:

``` text
No evidence = failure
```

------------------------------------------------------------------------

# 22. Page 6 --- Process Analysis

Show the SOC process as an event flow.

``` text
ALERT
  ↓
CASE
  ↓
INVESTIGATION
  ↓
ACTION
  ↓
ESCALATION
  ↓
RESPONSE
  ↓
CLOSURE
```

Each node should show:

-   count
-   median duration
-   deviation indicator

Example:

``` text
Investigation
1,284 cases
Median: 42 min
Deviation: +18%
```

------------------------------------------------------------------------

# 23. Process Conformance Visualization

Use a visual comparison:

``` text
Expected Process          Observed Process

Alert                     Alert
  ↓                         ↓
Case                      Case
  ↓                         ↓
Investigation             Investigation
  ↓                         ↓
Escalation                [MISSING]
  ↓                         ↓
Response                  Response
  ↓                         ↓
Closure                   Closure
```

A "View PM4Py Analysis" badge can indicate the underlying process-mining
capability.

The prototype does not need to run PM4Py in the browser.

------------------------------------------------------------------------

# 24. Page 7 --- Findings

Create a central finding management page.

Tabs:

``` text
All
Execution Gap
Negative Space
Process
Behavioural
Historical
Consistency
Coverage
Metric
Capability
```

Each finding card should contain:

``` text
Finding ID
CSE
Control
Signal Type
Priority
Evidence Strength
Completeness
Uncertainty
Status
```

------------------------------------------------------------------------

# 25. Finding Card Design

Example:

``` text
FND-2041

EXECUTION GAP
CSE-014
Investigation Control CTRL-07

Critical case closed without required escalation.

Evidence Strength       HIGH
Completeness             94%
Uncertainty              LOW

Supporting Signals
✓ Execution Gap
✓ Process Deviation
✓ Historical Recurrence
✓ Cross-Source Consistency

[ EXAMINE FINDING ]
```

------------------------------------------------------------------------

# 26. Page 8 --- Finding Detail / Examiner Workspace

This is the **most important interaction page after the dashboard**.

The examiner should be able to inspect the complete reasoning chain.

## Layout

### Left

Finding summary.

### Center

Expected vs Observed.

### Right

Decision panel.

### Bottom

Evidence and provenance.

------------------------------------------------------------------------

# 27. Finding Detail --- Reasoning Chain

Display:

``` text
WHY WAS THIS FLAGGED?

1. Expected State
   Escalation required for critical cases.

2. Observed State
   Case closed without escalation record.

3. Supporting Signals
   Execution Gap
   Process Deviation
   Historical Recurrence
   Consistency Issue

4. Evidence
   Alert
   Case
   Investigation
   Closure

5. Confidence Context
   Evidence Strength: HIGH
   Completeness: 94%
   Uncertainty: LOW
```

This is the strongest way to demonstrate explainability.

------------------------------------------------------------------------

# 28. Finding Detail --- Evidence Timeline

Show:

``` text
09:12  Alert Created
09:18  Case Opened
09:31  Investigation Started
10:04  Investigation Updated
10:16  Response Initiated
10:22  Case Closed

        ⚠ Expected Escalation Missing
```

The timeline should be interactive.

Clicking an event opens its source record.

------------------------------------------------------------------------

# 29. Finding Detail --- Source Evidence

Show source records:

``` text
SOURCE EVIDENCE

Alert Record
ALR-44218
[View]

Case Record
CASE-1042
[View]

Investigation Record
INV-1042
[View]

Closure Record
CLS-1042
[View]
```

------------------------------------------------------------------------

# 30. Finding Detail --- Provenance

Show:

``` text
Evidence Hash
SHA-256: 9b71...a82f

Submission
SUB-2026-0814

Source
CSE-014 SOC

Assessment Period
August 2026

Control Version
CTRL-07 v3.2

Rule Version
EXEC-GAP-1.4

Analytics Version
SAT-SA-0.9
```

This demonstrates evidence traceability and governance.

------------------------------------------------------------------------

# 31. Examiner Decision Panel

The prototype must visibly enforce human-in-the-loop.

Buttons:

``` text
[ VALIDATE ]
[ REJECT ]
[ QUALIFY ]
[ OVERRIDE ]
[ REQUEST EVIDENCE ]
```

Also:

``` text
Examiner Notes
[________________________________]

Decision Reason
[________________________________]

[ SAVE DECISION ]
```

The UI should clearly show:

``` text
SYSTEM
Detected
Explained
Prioritized

        ↓

HUMAN
Examines
Decides
```

------------------------------------------------------------------------

# 32. Page 9 --- Evidence Explorer

Allow the examiner to browse submitted evidence.

Categories:

``` text
Alerts
Cases
Investigations
Actions
Evidence
Escalations
Responses
Closures
Assets
Exceptions
Remediation
```

Include:

-   search
-   filters
-   date range
-   CSE
-   case ID
-   evidence type
-   source
-   status

------------------------------------------------------------------------

# 33. Evidence Explorer --- Evidence Status

Use explicit statuses:

``` text
PRESENT
ABSENT CONFIRMED
NOT SUBMITTED
NOT APPLICABLE
UNKNOWN
```

Use these states instead of only green/red indicators.

This reinforces the Negative Space logic.

------------------------------------------------------------------------

# 34. Page 10 --- Supervisory Sampling

This page should demonstrate another major USP.

## Header

``` text
Supervisory Sampling Engine

28 Recommended Cases
```

Show methodology:

``` text
Risk-Based          29%
Evidence-Based      18%
Coverage-Based      14%
Recurrence-Based    11%
Anomaly-Based       11%
Peer-Based           7%
Baseline / Random   10%
```

------------------------------------------------------------------------

# 35. Sampling Table

Columns:

``` text
Case
CSE
Reason
Signals
Priority
Evidence Strength
Selected
```

Example:

``` text
CASE-1042
CSE-014
Execution Gap + Recurrence
HIGH
HIGH
✓

CASE-1182
CSE-009
Negative Space
HIGH
MEDIUM
✓
```

Provide:

``` text
[ OPEN EXAMINATION QUEUE ]
```

------------------------------------------------------------------------

# 36. Page 11 --- Historical Intelligence

Show:

### Recurrence

``` text
Finding recurrence

CSE-014

2024  ●
2025  ●●
2026  ●●●
```

### Trend

Allow switching between:

-   execution gaps
-   negative space
-   process deviations
-   remediation
-   control drift

------------------------------------------------------------------------

# 37. Historical Finding Detail

Show:

``` text
FIRST OCCURRENCE
↓
RECURRENCE
↓
REMEDIATION
↓
VERIFICATION
↓
REGRESSION / IMPROVEMENT
```

The architecture specifically distinguishes:

-   first occurrence
-   recurrence
-   persistence
-   reopening
-   remediation regression
-   improvement
-   control change

The UI should reflect these states.

------------------------------------------------------------------------

# 38. Page 12 --- Peer Comparison

This should demonstrate CSE behavioural segmentation.

Do not simply create a generic leaderboard.

Show:

``` text
CSE-014

Comparable Cohort:
Critical Infrastructure / Sector A

CSE Metric
Investigation Completion: 81%

Peer Baseline
Investigation Completion: 94%

Deviation
-13 percentage points

Context:
Comparable cohort only
```

Add:

``` text
Peer comparison is access-controlled and cohort-based.
```

------------------------------------------------------------------------

# 39. Page 13 --- Remediation

Show lifecycle:

``` text
Finding
  ↓
Remediation Action
  ↓
CSE Response
  ↓
Evidence Submitted
  ↓
Verification
  ↓
Closed / Reopened
```

Statuses:

``` text
OPEN
IN PROGRESS
SUBMITTED
UNDER VERIFICATION
CLOSED
REOPENED
```

------------------------------------------------------------------------

# 40. Remediation Detail

Show:

``` text
Finding:
FND-2041

Required Action:
Implement escalation evidence for critical cases.

CSE Response:
Submitted revised workflow evidence.

Verification:
Pending

Evidence:
3 documents
2 process records

[ START VERIFICATION ]
```

Do not allow "Closed" to appear as automatically verified merely because
a status field changed.

------------------------------------------------------------------------

# 41. Page 14 --- Audit

This can be a simpler prototype page.

Show:

``` text
Timestamp
User
Action
Target
Result
Control Version
Rule Version
Evidence Reference
```

Example:

``` text
20:14:03
examiner_07
Validated Finding
FND-2041
SUCCESS
EXEC-GAP-1.4
SUB-2026-0814
```

This demonstrates accountability.

------------------------------------------------------------------------

# 42. Administration

For prototype purposes, show:

``` text
Users
Roles
CSE Access
Control Library
Rule Versions
Model Versions
System Health
Security Configuration
```

The page can be mostly static.

------------------------------------------------------------------------

# 43. Prototype Data Model

The frontend should use a coherent demo dataset.

Minimum entities:

``` text
CSE
Assessment
Control
Submission
Alert
Case
Investigation
Evidence
Escalation
Response
Closure
Finding
Signal
Sample
Remediation
Verification
HistoricalRecord
PeerCohort
AuditEvent
```

------------------------------------------------------------------------

# 44. Recommended Demo Dataset

Use approximately:

``` text
8 CSEs
4 sectors
6 assessment periods
20 controls
250 alerts
100 cases
70 investigations
40 findings
25 execution gaps
15 negative-space candidates
12 process deviations
8 recurring findings
10 remediation records
20 recommended samples
```

The exact numbers do not matter.

**Consistency matters more than realism.**

Every dashboard number should reconcile with the detailed pages.

------------------------------------------------------------------------

# 45. Mock Data Relationships

The data should follow:

``` text
CSE
 ↓
Assessment
 ↓
Submission
 ↓
Alert
 ↓
Case
 ↓
Investigation
 ↓
Action / Evidence
 ↓
Escalation
 ↓
Response
 ↓
Closure
```

Then:

``` text
Assessment
 ↓
Expected Model
 ↓
Observed Model
 ↓
Signals
 ↓
Finding Candidate
 ↓
Human Decision
 ↓
Remediation
 ↓
Verification
```

This should be reflected in the frontend state and routes.

------------------------------------------------------------------------

# 46. API Abstraction

Do not write:

``` typescript
const findings = [...]
```

inside every page.

Use:

``` text
src/
├── api/
│   ├── client.ts
│   ├── dashboard.ts
│   ├── cses.ts
│   ├── findings.ts
│   ├── evidence.ts
│   ├── sampling.ts
│   └── remediation.ts
```

For the prototype these functions can return mock data.

Later:

``` text
Mock API
   ↓
FastAPI
   ↓
PostgreSQL / Analytics
```

The page components should not need to change.

------------------------------------------------------------------------

# 47. Recommended Frontend Folder Structure

``` text
src/
│
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── layout.tsx
│
├── pages/
│   ├── Login/
│   ├── Dashboard/
│   ├── CSEAssessments/
│   ├── CSEDetail/
│   ├── Findings/
│   ├── FindingDetail/
│   ├── ExecutionGaps/
│   ├── NegativeSpace/
│   ├── ProcessAnalysis/
│   ├── Evidence/
│   ├── Sampling/
│   ├── Historical/
│   ├── PeerComparison/
│   ├── Remediation/
│   ├── Audit/
│   └── Administration/
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── dashboard/
│   ├── charts/
│   ├── findings/
│   ├── evidence/
│   ├── process/
│   ├── sampling/
│   └── remediation/
│
├── api/
│   ├── client.ts
│   ├── dashboard.ts
│   ├── cses.ts
│   ├── findings.ts
│   ├── evidence.ts
│   ├── sampling.ts
│   └── remediation.ts
│
├── data/
│   └── mock/
│
├── types/
│   ├── cse.ts
│   ├── finding.ts
│   ├── evidence.ts
│   ├── sampling.ts
│   └── remediation.ts
│
└── utils/
```

------------------------------------------------------------------------

# 48. Reusable Components

Build these first:

``` text
AppShell
Sidebar
Topbar
Breadcrumbs

KpiCard
PriorityCard
SignalCard
StatusBadge
EvidenceBadge

ExpectedObservedCard
SignalBreakdown
EvidenceStrength
UncertaintyIndicator

Timeline
ProcessFlow
EvidenceTable
FindingCard
FindingDrawer

DecisionPanel
ProvenancePanel
HashDisplay

TrendChart
BarChart
DonutChart

DataTable
FilterBar
SearchBar

EmptyState
LoadingState
ErrorState
```

------------------------------------------------------------------------

# 49. Design Language

The product should look like a **secure government supervisory analytics
platform**, not a consumer SaaS dashboard.

Recommended characteristics:

-   dark or dark-neutral professional interface
-   high information density
-   strong hierarchy
-   restrained accent colors
-   clear status semantics
-   compact tables
-   readable charts
-   minimal decorative elements
-   strong typography
-   consistent spacing
-   accessible contrast

Avoid:

-   excessive gradients
-   giant decorative cards
-   flashy AI visuals
-   excessive animations
-   chatbot-first UI
-   generic "AI magic" labels
-   unnecessary 3D graphics

------------------------------------------------------------------------

# 50. Status Semantics

Use consistent meanings.

### Priority

``` text
CRITICAL
HIGH
MEDIUM
LOW
```

### Evidence

``` text
PRESENT
ABSENT CONFIRMED
NOT SUBMITTED
NOT APPLICABLE
UNKNOWN
```

### Finding

``` text
CANDIDATE
UNDER REVIEW
VALIDATED
QUALIFIED
REJECTED
OVERRIDDEN
```

### Remediation

``` text
OPEN
IN PROGRESS
SUBMITTED
UNDER VERIFICATION
CLOSED
REOPENED
```

------------------------------------------------------------------------

# 51. The Most Important USP Components

If development time is limited, prioritize these.

## USP 1 --- Expected vs Observed

Must be highly visible.

``` text
Expected
   VS
Observed
```

## USP 2 --- Negative Space

Show evidence that should exist but does not.

``` text
Expected Evidence
       ↓
Coverage Gap
       ↓
Negative Space Candidate
```

## USP 3 --- Execution Gap

Show:

``` text
Expected Process
       VS
Observed Process
```

## USP 4 --- Evidence Fusion

Show multiple signals converging into one finding candidate.

``` text
Execution Gap
Negative Space
Process Deviation
Historical Recurrence
Consistency
Coverage
        ↓
Evidence Fusion
        ↓
Finding Candidate
```

## USP 5 --- Explainability

Every finding must answer:

``` text
What happened?
What was expected?
Why flagged?
What evidence supports it?
How strong is the evidence?
What uncertainty exists?
Which rule/model produced it?
Who decided?
```

## USP 6 --- Human-in-the-loop

Make examiner decisions interactive.

``` text
SYSTEM
Detect → Explain → Prioritize

HUMAN
Examine → Decide
```

## USP 7 --- Supervisory Sampling

Show how limited human review is allocated.

## USP 8 --- Historical Recurrence

Show that repeated issues matter.

## USP 9 --- Peer Benchmarking

Show comparable cohort context rather than raw rankings.

## USP 10 --- Evidence Provenance

Show source record, hash, submission, rule version and analytics
version.

------------------------------------------------------------------------

# 52. What Should NOT Be Overbuilt

Do not spend prototype time implementing:

-   production-grade LDAP
-   real MFA
-   complete air-gap networking
-   full malware scanning
-   real cryptographic custody infrastructure
-   production Parquet pipelines
-   complete OCSF ingestion
-   full PM4Py pipeline
-   full ML training
-   local LLM
-   Kubernetes
-   ClickHouse
-   Kafka/Redpanda

These belong to the full architecture.

The final architecture itself identifies ClickHouse, Redpanda/Kafka,
Kubernetes and local LLM as optional technologies and explicitly states
they are **not required for the core prototype**.

The prototype should represent these concepts visually where useful, but
not waste time implementing them.

------------------------------------------------------------------------

# 53. What Can Be Mocked

It is acceptable to mock:

``` text
CSE data
Evidence records
Expected Model
Observed Model
Analytics signals
Process deviation
Peer baselines
Historical data
Sampling recommendations
Finding candidates
Remediation states
```

But the mock data must behave as if it comes from the architecture.

For example:

``` text
Execution Gap
   ↓
Finding
   ↓
Evidence
   ↓
Examiner Decision
```

should be a real interactive flow in the frontend.

------------------------------------------------------------------------

# 54. What Should NOT Be Fake

Avoid fake interactions such as:

``` text
Click button
↓
Nothing happens
```

The following should actually work in the prototype:

-   navigation
-   filtering
-   search
-   opening CSE details
-   opening findings
-   expected vs observed drill-down
-   evidence timeline
-   evidence source details
-   finding decision
-   adding notes
-   changing finding status
-   opening remediation
-   opening recommended sample
-   dashboard → detail navigation

------------------------------------------------------------------------

# 55. Demo Story

The prototype should support one controlled story.

## Step 1 --- Login

Enter SAT-SA secure environment.

## Step 2 --- Dashboard

Show:

``` text
24 CSEs
17 Findings
6 High-Priority Signals
31 Execution Gaps
14 Negative Space Candidates
28 Recommended Samples
```

## Step 3 --- Select CSE-014

Show:

``` text
Priority: HIGH
Evidence Readiness: 91%
Capability Discrepancy: REVIEW
```

## Step 4 --- Open Finding

Example:

``` text
Critical case closed without required escalation.
```

## Step 5 --- Show Expected vs Observed

``` text
EXPECTED
Investigation → Escalation → Response → Closure

OBSERVED
Investigation → Response → Closure
```

## Step 6 --- Show Supporting Signals

``` text
Execution Gap
Process Deviation
Historical Recurrence
Cross-Source Consistency
```

## Step 7 --- Show Evidence Timeline

``` text
Alert
Case
Investigation
Response
Closure
```

Highlight missing escalation.

## Step 8 --- Show Provenance

``` text
SHA-256
Submission ID
Source
Control Version
Rule Version
```

## Step 9 --- Human Decision

Click:

``` text
VALIDATE
```

or:

``` text
REQUEST EVIDENCE
```

## Step 10 --- Show Remediation

``` text
Finding
 ↓
Remediation
 ↓
Verification
```

## Step 11 --- Show Sampling

Return to:

``` text
Recommended Samples
```

Demonstrate that the system prioritizes a limited review set.

This completes the story:

``` text
Evidence
 ↓
Analytics
 ↓
Signal
 ↓
Explanation
 ↓
Priority
 ↓
Human Review
 ↓
Finding
 ↓
Remediation
```

------------------------------------------------------------------------

# 56. Evaluation-Focused Feature Mapping

  Evaluation Need           Frontend Feature
  ------------------------- -------------------------------------
  Problem relevance         Supervisory dashboard
  Innovation                Expected vs Observed
  Negative-space concept    Negative Space page
  Technical depth           Process analysis + evidence model
  Explainability            Finding drill-down
  Human-in-the-loop         Examiner decision panel
  Feasibility               Clean API/data architecture
  Offline deployment        Secure environment indicators
  Evidence traceability     Provenance panel
  Impact                    Supervisory priority queue
  Usability                 Single examiner workflow
  Analytics                 Signal dashboard
  Sampling                  Supervisory Sampling Engine
  Historical intelligence   Recurrence/trend view
  Peer analysis             Cohort comparison
  Security                  RBAC/ABAC/audit representation
  Governance                Rule/control/model versioning
  Remediation               Remediation + verification workflow

------------------------------------------------------------------------

# 57. The Single Most Important Screen

If only one screen can be made extremely polished, make it:

## Finding / Examiner Workspace

It should contain:

``` text
┌─────────────────────────────────────────────────────────┐
│ Finding FND-2041                        HIGH PRIORITY    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ WHY FLAGGED?                                            │
│ Critical case closed without required escalation.      │
│                                                         │
├──────────────────────┬──────────────────────────────────┤
│ EXPECTED             │ OBSERVED                         │
│ Investigation        │ Investigation                    │
│ Escalation           │ ❌ Escalation missing            │
│ Response             │ Response                         │
│ Closure              │ Closure                          │
├──────────────────────┴──────────────────────────────────┤
│ SUPPORTING SIGNALS                                      │
│ ✓ Execution Gap  ✓ Process Deviation                   │
│ ✓ Historical     ✓ Consistency                          │
├─────────────────────────────────────────────────────────┤
│ TIMELINE                                                │
│ Alert → Case → Investigation → Response → Closure      │
├─────────────────────────────────────────────────────────┤
│ EVIDENCE                                                │
│ Alert | Case | Investigation | Closure                  │
├─────────────────────────────────────────────────────────┤
│ PROVENANCE                                              │
│ SHA-256 | Submission | Control | Rule | Analytics      │
├─────────────────────────────────────────────────────────┤
│ EXAMINER DECISION                                       │
│ [VALIDATE] [REJECT] [QUALIFY] [OVERRIDE]               │
│ [REQUEST EVIDENCE]                                      │
│ Notes: _________________________________                 │
└─────────────────────────────────────────────────────────┘
```

This single screen communicates most of the SAT-SA USP.

------------------------------------------------------------------------

# 58. MVP vs Full Prototype

## MVP --- Must Have

Build these first:

``` text
1. Login
2. Dashboard
3. CSE Assessment
4. CSE Detail
5. Findings
6. Finding Detail
7. Execution Gap
8. Negative Space
9. Evidence Timeline
10. Examiner Decision
11. Sampling
12. Remediation
```

## Strong Prototype --- Add

``` text
13. Process Analysis
14. Historical Trends
15. Peer Comparison
16. Evidence Explorer
17. Audit
18. Capability Discrepancy
19. Evidence Quality
20. Signal Breakdown
```

## Production --- Later

``` text
Real authentication
Real OCSF ingestion
Real evidence intake
Real PostgreSQL
Real Parquet
Real analytics
PM4Py
NetworkX
Offline ML
Full audit infrastructure
Air-gapped deployment controls
Backup/recovery
```

------------------------------------------------------------------------

# 59. Frontend Development Order

Do not build pages randomly.

Follow this order:

## Phase 1 --- Foundation

``` text
React + TypeScript + Vite
Tailwind
shadcn/ui
Routing
App Shell
Sidebar
Topbar
Theme
Mock API layer
Types
```

## Phase 2 --- Core Dashboard

``` text
Dashboard
KPI cards
Priority queue
Signal distribution
Expected vs Observed
Evidence readiness
Historical trend
Recommended samples
```

## Phase 3 --- Core USP

``` text
CSE Detail
Execution Gap
Negative Space
Capability Discrepancy
Process Analysis
```

## Phase 4 --- Examiner Workflow

``` text
Findings
Finding Detail
Evidence Timeline
Evidence Explorer
Provenance
Decision Panel
```

## Phase 5 --- Supervisory Lifecycle

``` text
Sampling
Historical
Peer Comparison
Remediation
Verification
```

## Phase 6 --- Governance

``` text
Audit
Administration
Rule versions
Control versions
Model versions
```

------------------------------------------------------------------------

# 60. Definition of Done for the Prototype

The frontend is ready for evaluation when a judge can perform the
following without explanation:

### Dashboard

-   Understand what SAT-SA does
-   Identify high-priority CSEs
-   See execution gaps
-   See negative-space candidates
-   See evidence readiness

### CSE Assessment

-   Open a CSE
-   Understand its supervisory context
-   See capability discrepancy
-   See historical signals

### Finding

-   Open a finding
-   See why it was flagged
-   Compare expected and observed
-   Inspect supporting signals
-   Inspect timeline
-   Inspect source evidence
-   Inspect provenance

### Human-in-the-loop

-   Validate a finding
-   Reject/qualify/override
-   Request additional evidence
-   Add examiner notes

### Sampling

-   See recommended cases
-   Understand why each case was selected

### Remediation

-   Follow finding → remediation → verification

If all of these work, the prototype demonstrates the central SAT-SA
concept.

------------------------------------------------------------------------

# 61. Final Prototype Architecture

``` text
                    SAT-SA FRONTEND
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
  SUPERVISORY UI                    EXAMINER UI
        │                                 │
        ▼                                 ▼
  Dashboard                         Finding Workspace
  CSE Priorities                    Expected vs Observed
  Trends                            Evidence Timeline
  Peer Context                      Signal Breakdown
  Sampling                          Provenance
        │                                 │
        └──────────────┬──────────────────┘
                       ▼
                API SERVICE LAYER
                       │
                       ▼
                    FastAPI
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    PostgreSQL     Analytics       Evidence
        │              │              │
        │              ▼              │
        │      Expected / Observed    │
        │      Signal Generation      │
        │      Fusion / Sampling      │
        │              │              │
        └──────────────┴──────────────┘
                       │
                       ▼
                 HUMAN DECISION
                       │
              ┌────────┴────────┐
              ▼                 ▼
          Finding          Remediation
                                  │
                                  ▼
                              Verification
```

------------------------------------------------------------------------

# 62. Final Rule for the Prototype

The prototype should never communicate:

> "AI found a problem."

It should communicate:

> **"SAT-SA identified a supervisory signal from evidence, explained the
> expected-versus-observed discrepancy, showed the supporting evidence,
> prioritized the case for examination, and left the final decision to
> the human examiner."**

That is the core product story.

------------------------------------------------------------------------

# 63. Final Priority List

If development time becomes constrained, implement in this exact order:

``` text
P0
✓ App Shell
✓ Dashboard
✓ CSE Assessment
✓ Finding Detail
✓ Expected vs Observed
✓ Execution Gap
✓ Negative Space
✓ Evidence Timeline
✓ Evidence Provenance
✓ Examiner Decision

P1
✓ Sampling
✓ Remediation
✓ Historical Recurrence
✓ Capability Discrepancy
✓ Process Analysis
✓ Evidence Quality

P2
✓ Peer Comparison
✓ Behavioural Analysis
✓ Metric Integrity
✓ Audit
✓ Administration
✓ Signal Discovery

P3
→ Real backend analytics
→ Real OCSF mapping
→ Real PM4Py
→ Real ML
→ Real evidence ingestion
→ Production security infrastructure
```

------------------------------------------------------------------------

# 64. Final Deliverable

The frontend prototype should ultimately demonstrate this single
end-to-end loop:

``` text
                 CSE / SOC EVIDENCE
                         │
                         ▼
                 EVIDENCE READINESS
                         │
                         ▼
                 EXPECTED MODEL
                         │
                         ├──────────────┐
                         │              │
                         ▼              ▼
                  EXPECTED STATE   OBSERVED STATE
                         │              │
                         └──────┬───────┘
                                ▼
                       EXPECTED vs OBSERVED
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
        EXECUTION GAP     NEGATIVE SPACE    PROCESS DEVIATION
              │                 │                 │
              └─────────────────┼─────────────────┘
                                ▼
                         EVIDENCE FUSION
                                │
                                ▼
                       SUPERVISORY PRIORITY
                                │
                                ▼
                       RECOMMENDED SAMPLE
                                │
                                ▼
                       EXAMINER WORKSPACE
                                │
                                ▼
                         HUMAN DECISION
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                 Finding      Reject     Request Evidence
                    │
                    ▼
               REMEDIATION
                    │
                    ▼
               VERIFICATION
                    │
                    ▼
             HISTORICAL INTELLIGENCE
```

## The frontend's job is to make this architecture visible, understandable, and interactive.

The backend can be progressively integrated behind the same interfaces
later.
