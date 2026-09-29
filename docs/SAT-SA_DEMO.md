# SAT-SA: End-to-End Supervisory Demonstration Walkthrough

This script provides an exact, step-by-step walkthrough for demonstrating the core supervisory assessment lifecycle on the SAT-SA prototype.

---

## Demonstration Narrative: Grid Outage Incident Investigation

**Regulated Entity**: Western Grid Operations (`CSE-014`)  
**Mandated Standard**: Continuous Security Monitoring & Outbound Escalation (`CTRL-07`)  
**Scenario**: High-priority SCADA substation PLC boundary alarm (`EV-1042` / `ALR-44218`) was triaged locally and contained on an internal console, but the mandatory Tier-2 outbound regulatory escalation packet was never dispatched within the statutory 15-minute SLA. The Execution Gap Engine detected this discrepancy, synthesized a candidate finding, and initiated the post-finding remediation and verification cycle.

---

## Step 1: Authentication & Enclave Access
1. Open the SAT-SA application in the browser at `http://localhost:5173/login`.
2. Select **Lead Supervisor** or enter:
   - **Username**: `lead_supervisor`
   - **Password**: `Supervisor@2026!`
3. Click **Authenticate & Enter Enclave**.
4. Confirm successful redirect to `/overview`.

---

## Step 2: Supervisory Portfolio Overview
1. On the **Overview** dashboard (`/overview`), observe the dynamic KPI cards:
   - **Portfolio Health Score**: Reflects live aggregate scores across regulated CSE cohorts.
   - **High-Risk Entities**: Identifies entities with critical control gaps.
   - **Active Gaps & Discrepancies**: Quantified across the 10 analytical engines.
2. In the **High-Priority Findings Feed**, note the prominent entry for `CSE-014` regarding the escalation omission.

---

## Step 3: Critical Sector Entity Drilldown
1. Click **CSE Directory** in the navigation sidebar (`/supervision/cses`).
2. Filter or search for **`CSE-014`** (Western Grid Operations).
3. Click on the entity card to enter the **CSE Detail Workspace** (`/supervision/cses/CSE-014`).
4. Review the entity's readiness score, claimed vs. observed capabilities, and open findings.

---

## Step 4: Analytical Engines & Signal Detection
1. Click **Analysis Hub** in the sidebar (`/analysis`).
2. Observe all 10 autonomous analytical engines in the directory, showing live signal counts.
3. Click on the **Execution Gap Engine** row (`/analysis/execution-gap`).
4. In the signal table, locate signal **`SIG-2004`**:
   - **Title**: Mandatory Tier-2 Regulatory SOAR Escalation Dispatch Omission
   - **Expected**: Outbound dispatch within 15 minutes of grid outage classification.
   - **Observed**: Local containment without outbound dispatch record.
   - **Evidence Link**: Linked to `EV-1042`.

---

## Step 5: Evidence Vault Verification
1. Navigate to **Evidence Explorer** (`/evidence`).
2. Search for **`EV-1042`**.
3. Click **Inspect** to open the Evidence Drawer:
   - Verify the cryptographic SHA-256 digest: `3d9eb591d0964d6d2ac4e63a1808a3b7e1aadf01db104428569ba26fab6d8a11`.
   - Inspect the OCSF canonical mapping (`ALERT` / `SCADA Boundary Alert`).
   - Review the immutable provenance trail and custody timestamps.

---

## Step 6: Finding Adjudication (Human-in-the-Loop)
1. Navigate to **Review Queue** (`/review`).
2. Open Finding **`FND-021`** (Unrecorded Regulatory Escalation Token - CASE-1042).
3. Review the **Examiner Workspace**:
   - Inspect the **Why Flagged** algorithmic rationale.
   - Compare **Expected State vs. Observed State**.
   - Review the supporting evidence list.
4. Click **Validate Finding**:
   - Enter examiner justification notes: *"Confirmed missing dispatch record ESC-221"*.
   - Submit the decision. The finding updates to `VALIDATED`.
5. Click **Formally Qualify (Sec 70B)**:
   - Promotes the finding to statutory status `QUALIFIED`.

---

## Step 7: Remediation Mandate
1. Navigate to **Remediation** (`/remediation`).
2. In the Open Mandates tab, open **`RM-008`**:
   - **Title**: Remediation Mandate for CASE-1042 Regulatory Escalation Protocol.
   - **Owner**: CSE-014 Operations.
   - **Artifacts**: Identifies present artifacts (`EV-1042`) and missing mandatory proof (`ESC-221`).
3. Demonstrate artifact submission:
   - Provide the cryptographic hash of the corrective telemetry file.
   - Observe evidence progress updating in real time.

---

## Step 8: Supervisory Verification
1. Switch to the **Verification Records** tab in the Remediation workspace.
2. Open Verification Record **`VR-004`**:
   - Review the statutory verification checklist gates:
     - Gate 1: Documentary Verification (Verified).
     - Gate 2: Technical Retest (Verified).
     - Gate 3: Evidence Requirement (Pending).
3. Toggle Gate 3 to **Verified** upon reviewing corrective telemetry.
4. Click **Seal Verification** to record the cryptographic SHA-256 seal.

---

## Step 9: Governance & Cryptographic Audit Ledger
1. Navigate to **Governance Hub** (`/governance`).
2. On the **Audit Ledger** tab:
   - Note the immutable audit event generated for each prior step (`VALIDATE`, `QUALIFY`, `REMEDIATION_SUBMIT`, `VERIFICATION_SEAL`).
   - Verify the recording of the examiner badge, cryptographic hash, and before/after states.

---

## Step 10: Multi-Layer Knowledge Graph
1. Navigate to **Graph** (`/graph`).
2. Observe the interactive node-link visualization:
   - Locate the relational chain: **`CSE-014` → `CTRL-07` → `EV-1042` → `SIG-2004` → `FND-021` → `RM-008` → `VR-004`**.
   - Use the category and status filters to isolate specific graph layers.
