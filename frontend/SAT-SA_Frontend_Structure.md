# SAT-SA Frontend Structure

## Supervisory Analytics Tool for SOC Assessment

### Frontend Information Architecture, Page Structure & Use-Case Mapping

---

## 1. Purpose

This document defines the final frontend structure for the SAT-SA prototype.

The structure is organized around two primary user experiences:

1. **Supervisory Dashboard** — for supervisors managing the CSE portfolio and deciding where supervisory attention should be focused.
2. **Examiner Workspace** — for examiners investigating individual findings, reviewing evidence, and making human decisions.

The frontend should behave as one coherent supervisory workflow rather than as a collection of disconnected dashboards.

### Core workflow

```text
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
  ↓
Verification
```

---

# 2. Two Primary Dashboard / Workspace Experiences

## Dashboard 1 — Supervisory Dashboard

### Primary user

**Supervisor / Senior Supervisor**

### Main question

> Where should the supervisor focus supervisory attention?

### Primary purpose

Provide a cross-CSE supervisory view showing:

- CSE portfolio status
- Priority signals
- Evidence readiness
- Execution gaps
- Negative-space candidates
- Historical trends
- Recommended samples
- Open remediation

The dashboard should not be a collection of unrelated statistics. Every metric should connect to a supervisory action.

---

## Dashboard 2 — Examiner Workspace

### Primary user

**Examiner**

### Main question

> What does this finding mean, what evidence supports it, and what should the examiner decide?

### Primary purpose

Provide the complete analytical reasoning chain:

```text
Finding
  ↓
Why Flagged
  ↓
Expected State
  ↓
Observed State
  ↓
Supporting Signals
  ↓
Evidence Timeline
  ↓
Source Evidence
  ↓
Provenance
  ↓
Examiner Decision
  ↓
Remediation
  ↓
Verification
```

The examiner remains the final decision-maker.

---

# 3. Complete Frontend Information Architecture

```text
SAT-SA
│
├── LOGIN
│
├── DASHBOARD 1 — SUPERVISORY OVERVIEW
│   │
│   ├── Priority Queue
│   ├── Signal Distribution
│   ├── Expected vs Observed
│   ├── Evidence Quality
│   ├── Historical Trend
│   └── Recommended Samples
│
├── SUPERVISION
│   │
│   ├── CSE Assessments
│   │    └── CSE Assessment Detail
│   │         ├── Capability Discrepancy
│   │         ├── Execution Gap
│   │         ├── Negative Space
│   │         ├── Process Analysis
│   │         ├── Evidence Quality
│   │         ├── Historical Signals
│   │         └── Findings
│   │
│   ├── Priority Queue
│   │
│   └── Supervisory Sampling
│
├── DASHBOARD 2 — EXAMINER WORKSPACE
│   │
│   ├── Findings
│   │    └── Finding Detail
│   │         ├── Why Flagged
│   │         ├── Expected vs Observed
│   │         ├── Supporting Signals
│   │         ├── Evidence Timeline
│   │         ├── Source Evidence
│   │         ├── Provenance
│   │         └── Examiner Decision
│   │
│   └── Evidence Explorer
│
├── ANALYTICS
│   ├── Execution Gaps
│   ├── Negative Space
│   ├── Process Analysis
│   ├── Evidence Quality
│   ├── Behavioural Analysis
│   ├── Coverage
│   └── Consistency
│
├── INTELLIGENCE
│   ├── Historical Intelligence
│   ├── Peer Comparison
│   └── Signal Discovery
│
├── ASSESSMENT
│   ├── Findings
│   ├── Evidence
│   ├── Remediation
│   └── Verification
│
└── GOVERNANCE
    ├── Audit
    └── Administration
```

---

# 4. Page-by-Page Structure

## Page 1 — Login

### User

All authorized users.

### Purpose

Establish the secure NCIIPC environment.

### UI

- SAT-SA logo/name
- NCIIPC context
- User ID
- Password
- MFA / verification indicator
- Secure environment indicator
- Air-gapped / internal deployment status
- Sign In

### Prototype behavior

Real authentication is not required for the prototype.

The page should communicate the secure deployment model.

---

# 5. Dashboard 1 — Supervisory Overview

## Page 2 — Supervisory Overview Dashboard

### User

Supervisor / Senior Supervisor

### Main question

> Where should I focus attention?

### KPI cards

```text
CSEs Assessed
Active Findings
High-Priority Signals
Evidence Readiness
Execution Gaps
Negative Space
Samples Recommended
Open Remediation
```

### Main sections

#### A. Supervisory Priority Queue

```text
CSE
Priority
Key Signal
Control
Status
```

Example:

```text
CSE-014   HIGH      Execution Gap      CTRL-07   Review
CSE-009   HIGH      Negative Space     CTRL-12   Review
CSE-021   MEDIUM    Process Deviation  CTRL-04   Review
```

Clicking a row opens the CSE Assessment Detail.

#### B. Signal Distribution

Show:

- Execution Gap
- Negative Space
- Process Deviation
- Behavioural
- Historical
- Consistency
- Coverage

#### C. Expected vs Observed

Provide a cross-CSE supervisory comparison.

#### D. Evidence Quality

Show:

- Schema
- Completeness
- Relationships
- Timestamp Quality
- Coverage
- Cross-file Consistency

#### E. Historical Trend

Allow switching between:

- Execution Gaps
- Negative Space
- Process Deviations
- Recurring Findings
- Remediation Regression

#### F. Recommended Samples

Show:

- Risk-Based
- Evidence-Based
- Coverage-Based
- Recurrence-Based
- Anomaly-Based
- Peer-Based
- Baseline / Random

---

# 6. Supervision

## Page 3 — CSE Assessments

### Main use case

> Which CSEs require supervisory attention?

### Table

```text
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

### Filters

- Sector
- Assessment Period
- Priority
- Finding Type
- Evidence Readiness
- Remediation Status

### Interaction

Clicking a CSE opens **CSE Assessment Detail**.

---

# 7. CSE Assessment Detail

## Page 4 — CSE Assessment Detail

### Main use case

> What is happening with this particular CSE?

### Header

```text
CSE-014
Critical Infrastructure Entity

Assessment Period:
01 Aug 2026 — 31 Aug 2026

Assessment Status:
UNDER EXAMINATION
```

### KPI strip

```text
Evidence Readiness: 91%
Supervisory Priority: HIGH
Open Findings: 4
Recurring Signals: 2
Remediation: 1 Open
```

### Main analytical areas

- Capability Discrepancy
- Expected vs Observed
- Execution Gaps
- Negative Space
- Process Analysis
- Evidence Quality
- Historical Signals
- Findings

---

# 8. Capability Discrepancy

## Feature within CSE Assessment Detail

### Main use case

> Does the evidence support the capability being claimed?

### UI

```text
CLAIMED CAPABILITY
Investigation Capability: HIGH

OBSERVED CAPABILITY
Evidence-backed Investigation Depth: MEDIUM

Signals:
• Incomplete investigation steps
• Weak evidence coverage
• Low escalation behaviour
• Repeated shallow patterns

CAPABILITY DISCREPANCY
Requires Examiner Review
```

### Important rule

Do not display:

```text
Capability Failed
```

Use:

```text
Capability Discrepancy
Requires Examiner Review
```

This is a supervisory signal, not an automatic declaration of capability failure.

---

# 9. Execution Gap

## Page 5 — Execution Gap Analysis

### Main use case

> What should have happened but did not?

### Expected process

```text
Alert
 ↓
Case
 ↓
Investigation
 ↓
Escalation
 ↓
Closure
```

### Observed process

```text
Alert
 ↓
Case
 ↓
Investigation
 ↓
Closure
```

### Result

```text
EXECUTION GAP
Missing: Escalation
```

### Required interactions

- Compare expected and observed
- Highlight missing/deviating steps
- Open supporting evidence
- Open related finding
- Navigate to Examiner Workspace

---

# 10. Negative Space

## Page 6 — Negative Space Analysis

### Main use case

> What evidence should exist but does not?

### Analysis flow

```text
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

### Possible context checks

```text
Incomplete Submission
Incorrect Mapping
Asset Change
Legitimate Exception
Evidence Genuinely Missing
```

### Final state

```text
Requires Examiner Review
```

### Important semantic rule

```text
Missing Evidence
       ≠
Confirmed Failure
```

---

# 11. Process Analysis

## Page 7 — Process Analysis

### Main use case

> Does the observed SOC workflow conform to the expected process?

### Process

```text
Alert
 ↓
Case
 ↓
Investigation
 ↓
Action
 ↓
Escalation
 ↓
Response
 ↓
Closure
```

### Metrics per node

- Count
- Median Duration
- Deviation Indicator

### Main comparison

```text
Expected Process
        vs
Observed Process
```

PM4Py can be used as the underlying production process-mining engine; it does not need to execute inside the browser for the prototype.

---

# 12. Evidence Quality

## Page 8 — Evidence Quality

### Main use case

> Can the submitted evidence be reliably used for supervisory analysis?

### Metrics

```text
Evidence Readiness       92%

Schema                   100%
Completeness              94%
Relationships             89%
Timestamp Quality         97%
Coverage                  86%
Cross-file Consistency    91%
```

### Evidence states

```text
PRESENT
ABSENT_CONFIRMED
NOT_SUBMITTED
NOT_APPLICABLE
UNKNOWN
```

The interface must distinguish missing evidence from confirmed failure.

---

# 13. Historical Intelligence

## Page 9 — Historical Intelligence

### Main use case

> Has this issue happened before?

### Recurrence view

```text
Finding Recurrence

CSE-014

2024  ●
2025  ●●
2026  ●●●
```

### Trend switches

- Execution Gaps
- Negative Space
- Process Deviations
- Remediation
- Control Drift

### Finding lifecycle

```text
First Occurrence
       ↓
Recurrence
       ↓
Remediation
       ↓
Verification
       ↓
Regression / Improvement
```

### Supported historical states

- First occurrence
- Recurrence
- Persistence
- Reopening
- Remediation regression
- Improvement
- Control change

---

# 14. Peer Comparison

## Page 10 — Peer Comparison

### Main use case

> How does this CSE compare with comparable entities?

### Example

```text
CSE-014

Comparable Cohort:
Critical Infrastructure / Sector A

CSE Metric:
Investigation Completion: 81%

Peer Baseline:
Investigation Completion: 94%

Deviation:
-13 percentage points

Context:
Comparable cohort only
```

### Rules

- Cohort-based
- Access-controlled
- No generic leaderboard

---

# 15. Supervisory Sampling

## Page 11 — Supervisory Sampling

### Main use case

> Which cases should receive examination attention?

### Header

```text
Supervisory Sampling Engine

28 Recommended Cases
```

### Methodology

```text
Risk-Based
Evidence-Based
Coverage-Based
Recurrence-Based
Anomaly-Based
Peer-Based
Baseline / Random
```

### Sampling table

```text
Case
CSE
Reason
Signals
Priority
Evidence Strength
Selected
```

### Example

```text
CASE-1042
CSE-014
Execution Gap + Recurrence
HIGH
HIGH
✓
```

### Primary action

```text
OPEN EXAMINATION QUEUE
```

---

# 16. Dashboard 2 — Examiner Workspace

## Page 12 — Findings

### User

Examiner

### Main use case

> Which supervisory signals require examination?

### Tabs

```text
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

### Finding information

```text
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

Clicking a finding opens the Examiner Workspace.

---

# 17. Finding / Examiner Workspace

## Page 13 — Finding Detail / Examiner Workspace

### Main use case

> Why was this finding flagged, what evidence supports it, and what should the examiner decide?

### Reasoning chain

```text
Finding
 ↓
Why Flagged
 ↓
Expected State
 ↓
Observed State
 ↓
Supporting Signals
 ↓
Timeline
 ↓
Source Evidence
 ↓
Evidence Hash / Provenance
 ↓
Control / Rule Version
 ↓
Examiner Decision
```

### Recommended layout

```text
┌───────────────────────────────────────────────────────────────┐
│ FINDING FND-2041                         HIGH                  │
├──────────────┬───────────────────────────┬────────────────────┤
│ FINDING      │ EXPECTED vs OBSERVED      │ DECISION           │
│              │                           │                    │
│ Why flagged  │ Expected                 │ Validate            │
│              │       ↓                   │ Reject              │
│ Signals      │ Observed                 │ Qualify             │
│              │       ↓                   │ Override            │
│ Evidence     │ Gap                      │ Request Evidence    │
├──────────────┴───────────────────────────┴────────────────────┤
│ EVIDENCE TIMELINE                                             │
│                                                               │
│ Alert → Case → Investigation → [Gap] → Closure                │
├───────────────────────────────────────────────────────────────┤
│ SOURCE EVIDENCE                                               │
├───────────────────────────────────────────────────────────────┤
│ PROVENANCE                                                    │
│ SHA-256 | Source | Submission | Control | Rule | Analytics    │
└───────────────────────────────────────────────────────────────┘
```

---

# 18. Evidence Explorer

## Page 14 — Evidence Explorer

### Main use case

> What underlying evidence supports the signal?

### Evidence categories

```text
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

### Filters

- CSE
- Case
- Evidence
- Source
- Status
- Date

### Evidence states

```text
PRESENT
ABSENT_CONFIRMED
NOT_SUBMITTED
NOT_APPLICABLE
UNKNOWN
```

Evidence Explorer should be accessible both globally and contextually from a finding.

---

# 19. Examiner Decision

## Feature inside Examiner Workspace

This should be a major decision panel rather than necessarily a separate route.

### Actions

```text
[ VALIDATE ]

[ REJECT ]

[ QUALIFY ]

[ OVERRIDE ]

[ REQUEST ADDITIONAL EVIDENCE ]
```

### Examiner notes

```text
Examiner Notes
[____________________________]

Reason
[____________________________]
```

### Decision metadata

```text
Decision
Examiner
Timestamp
```

### Human-in-the-loop boundary

```text
System Detects
      ↓
System Explains
      ↓
System Prioritizes
      ↓
Human Examines
      ↓
Human Decides
```

---

# 20. Remediation & Verification

## Page 15 — Remediation & Verification

### Main use case

> What happened after the finding was identified?

### Lifecycle

```text
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

### Statuses

```text
OPEN
IN PROGRESS
SUBMITTED
UNDER VERIFICATION
CLOSED
REOPENED
```

### Rule

A status change to `CLOSED` must not automatically imply that verification occurred.

---

# 21. Governance

## Page 16 — Audit

### Main use case

> Who did what, when, and against which evidence?

### Table

```text
Timestamp
User
Action
Target
Result
Control Version
Rule Version
Evidence Reference
```

### Example

```text
20:14:03
examiner_07
Validated Finding
FND-2041
SUCCESS
EXEC-GAP-1.4
SUB-2026-0814
```

---

## Page 17 — Administration

### Main user

Administrator

### Sections

```text
Users
Roles
CSE Access
Control Library
Rule Versions
Model Versions
System Health
Security Configuration
```

For the prototype, this page can be mostly static.

---

# 22. Sidebar Structure

The final sidebar should be:

```text
SAT-SA
────────────────────────

OVERVIEW
  Overview

SUPERVISION
  CSE Assessments
  Priority Queue
  Sampling

ANALYTICS
  Execution Gaps
  Negative Space
  Process Analysis
  Evidence Quality
  Behavioural Analysis
  Coverage
  Consistency

ASSESSMENT
  Findings
  Evidence
  Remediation
  Verification

INTELLIGENCE
  Historical Intelligence
  Peer Comparison
  Signal Discovery

GOVERNANCE
  Audit
  Administration
```

---

# 23. Demo-First Navigation

For a 3–5 minute demonstration, visually emphasize:

```text
Overview
CSE Assessments
Findings
Execution Gaps
Negative Space
Sampling
Remediation
```

The remaining pages can remain available through the sidebar without receiving the same visual emphasis.

---

# 24. Route Structure

Recommended React route organization:

```text
/
├── /login
│
├── /overview
│
├── /supervision
│   ├── /cses
│   ├── /cses/:cseId
│   ├── /priority
│   └── /sampling
│
├── /analytics
│   ├── /execution-gaps
│   ├── /negative-space
│   ├── /process
│   ├── /evidence-quality
│   ├── /behavioural
│   ├── /coverage
│   └── /consistency
│
├── /assessment
│   ├── /findings
│   ├── /findings/:findingId
│   ├── /evidence
│   ├── /remediation
│   └── /verification
│
├── /intelligence
│   ├── /historical
│   ├── /peer
│   └── /signals
│
└── /governance
    ├── /audit
    └── /administration
```

---

# 25. Feature-to-Use-Case Mapping

| Feature | Primary User | Main Use Case | Destination |
|---|---|---|---|
| Supervisory KPIs | Supervisor | Understand overall state | Dashboard |
| Priority Queue | Supervisor | Allocate attention | Dashboard / Priority |
| CSE Assessment | Supervisor | Inspect CSE | CSE Detail |
| Capability Discrepancy | Supervisor/Examiner | Compare claimed vs observed capability | CSE Detail |
| Execution Gap | Supervisor/Examiner | Detect missing process execution | Execution Gap |
| Negative Space | Supervisor/Examiner | Detect expected but missing evidence | Negative Space |
| Process Analysis | Supervisor/Examiner | Analyze workflow conformance | Process Analysis |
| Evidence Quality | Supervisor/Examiner | Assess evidence usability | Evidence Quality |
| Historical Intelligence | Supervisor | Identify recurrence | Historical |
| Peer Comparison | Supervisor | Compare against cohort | Peer |
| Sampling | Supervisor | Select high-value cases | Sampling |
| Findings | Examiner | Review candidate signals | Findings |
| Expected vs Observed | Examiner | Understand analytical discrepancy | Examiner Workspace |
| Signal Fusion | Examiner | Understand why flagged | Examiner Workspace |
| Evidence Timeline | Examiner | Reconstruct event sequence | Examiner Workspace |
| Evidence Explorer | Examiner | Inspect source evidence | Evidence |
| Provenance | Examiner/Auditor | Verify traceability | Examiner Workspace |
| Examiner Decision | Examiner | Make human decision | Examiner Workspace |
| Remediation | Examiner/Supervisor | Track corrective action | Remediation |
| Verification | Examiner | Confirm remediation evidence | Verification |
| Audit | Auditor | Review system actions | Audit |
| Administration | Administrator | Manage platform configuration | Administration |

---

# 26. Two-Workspace Model

## Supervisor

```text
                 SUPERVISOR
                     │
                     ▼
          SUPERVISORY DASHBOARD
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
         CSE       PRIORITY    SIGNALS
          │          │          │
          └──────────┼──────────┘
                     ▼
                CSE DETAIL
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
 Execution Gap  Negative Space  History
       │             │             │
       └─────────────┼─────────────┘
                     ▼
                 SAMPLING
```

## Examiner

```text
                  EXAMINER
                     │
                     ▼
              FINDINGS QUEUE
                     │
                     ▼
            EXAMINER WORKSPACE
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
 Expected vs      Signals       Evidence
 Observed          Fusion        Timeline
       │             │             │
       └─────────────┼─────────────┘
                     ▼
                 Provenance
                     │
                     ▼
             HUMAN DECISION
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Remediation            Request Evidence
          │
          ▼
      Verification
```

---

# 27. Priority of Implementation

## P0 — Build First

```text
1. Login
2. Supervisory Dashboard
3. CSE Assessments
4. CSE Assessment Detail
5. Findings
6. Examiner Workspace
7. Expected vs Observed
8. Execution Gap
9. Negative Space
10. Evidence Timeline
11. Evidence Provenance
12. Examiner Decision
```

## P1 — Strong Prototype

```text
13. Sampling
14. Remediation
15. Verification
16. Process Analysis
17. Historical Intelligence
18. Peer Comparison
19. Evidence Quality
20. Capability Discrepancy
```

## P2 — Secondary

```text
21. Behavioural Analysis
22. Coverage
23. Consistency
24. Signal Discovery
25. Audit
26. Administration
```

---

# 28. What Should NOT Become Separate Dashboard Pages

The following should primarily be **components/features inside larger workflows**:

```text
Priority Queue
Signal Distribution
Expected vs Observed
Capability Discrepancy
Evidence Timeline
Provenance
Examiner Decision
Historical Signals
Signal Breakdown
```

For example:

```text
CSE Detail
 ├── Capability Discrepancy
 ├── Execution Gap
 ├── Negative Space
 ├── Process Analysis
 ├── Evidence Quality
 └── Historical Signals
```

and:

```text
Examiner Workspace
 ├── Why Flagged
 ├── Expected vs Observed
 ├── Signal Breakdown
 ├── Evidence Timeline
 ├── Source Evidence
 ├── Provenance
 └── Decision Panel
```

This prevents the application from becoming unnecessarily fragmented.

---

# 29. Final Page Count

### Core evaluation prototype

**15 major screens**

```text
01 Login
02 Supervisory Dashboard
03 CSE Assessments
04 CSE Assessment Detail
05 Execution Gap
06 Negative Space
07 Process Analysis
08 Evidence Quality
09 Historical Intelligence
10 Peer Comparison
11 Sampling
12 Findings
13 Examiner Workspace
14 Evidence Explorer
15 Remediation & Verification
```

### Governance

```text
16 Audit
17 Administration
```

### Additional analytical routes

```text
18 Behavioural Analysis
19 Coverage
20 Consistency
21 Signal Discovery
```

Therefore:

> **21 possible functional routes, but only 2 primary dashboard/workspace experiences.**

The application should visually revolve around those two experiences rather than presenting 21 equal-weight pages.

---

# 30. Final Product Model

```text
                         SAT-SA
                           │
                         LOGIN
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      SUPERVISOR WORKFLOW       EXAMINER WORKFLOW
              │                         │
              ▼                         ▼
      SUPERVISORY DASHBOARD     FINDINGS / WORKSPACE
              │                         │
              ▼                         ▼
       CSE ASSESSMENT             FINDING ANALYSIS
              │                         │
       ┌──────┼──────┐            ┌─────┼─────┐
       ▼      ▼      ▼            ▼     ▼     ▼
      Gap   Negative Process     E/O  Signals Evidence
             Space   Analysis
       │      │      │            │     │     │
       └──────┼──────┘            └─────┼─────┘
              │                         │
              ▼                         ▼
          SAMPLING                 PROVENANCE
              │                         │
              └────────────┬────────────┘
                           ▼
                    HUMAN DECISION
                           │
                           ▼
                     REMEDIATION
                           │
                           ▼
                     VERIFICATION
```

## Core design principle

**SAT-SA identifies, explains and prioritizes supervisory signals; the human examiner reviews the evidence and makes the final decision.**

That principle should remain visible throughout the frontend.
