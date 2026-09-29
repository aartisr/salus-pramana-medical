# SALUS Calculus & Statistical Specification (Pramana Engine v1)

> SALUS — The evidence behind every path to healing.

**Purpose:** This document defines the exact mathematical models, defaults, constraints, validation gates, and source-citation rules required to make SALUS mathematically rigorous, clinically interpretable, and auditable.

**Status:** Implementation-ready specification

---

## 1. Non-Negotiable Integrity Rules

1. No numeric output without uncertainty.
2. No recommendation without source-linked evidence records.
3. No source without verifiable digital identifiers (`PMID`, `DOI`, `NCT`, `CTRI`, `ICTRP`, `AYUSH`, `DHARA`).
4. No claim can be marked "high confidence" unless calibration and coverage targets pass.
5. If confidence gate fails, output must be `INSUFFICIENT_EVIDENCE`.

---

## 2. Mathematical Core

### 2.1 Study-Level Contribution

For each study $i$, contribution to intervention-condition credibility at time $t$ is:

$$
S_i(t) = w_{\text{grade},i} \cdot w_{\text{design},i} \cdot w_{\text{bias},i} \cdot w_{\text{recency},i}(t) \cdot f(n_i) \cdot p_i
$$

Where:
- $w_{\text{grade}}$: prior trust by evidence grade.
- $w_{\text{design}}$: method class (RCT, cohort, etc.).
- $w_{\text{bias}}$: risk-of-bias multiplier.
- $w_{\text{recency}}(t)$: time decay.
- $f(n)$: sample size transform.
- $p_i$: precision/reliability term from variance/CI.

### 2.2 Grade and Design Weights (Default v1)

| Category | Weight |
|---|---:|
| Grade A | 1.00 |
| Grade B | 0.60 |
| Grade C | 0.25 |

| Design type | Weight |
|---|---:|
| Systematic review/meta-analysis of RCTs | 1.00 |
| Multi-center randomized trial | 0.90 |
| Single-site randomized trial | 0.85 |
| Cohort/case-control | 0.70 |
| Open-label/interventional non-randomized | 0.60 |
| Mechanistic/preclinical | 0.35 |
| Historic textual consensus only | 0.20 |

### 2.3 Bias Multiplier (Default v1)

| Risk-of-bias assessment | Multiplier |
|---|---:|
| Low | 1.00 |
| Some concerns | 0.80 |
| High | 0.55 |
| Critical / unassessed | 0.40 |

### 2.4 Recency Decay (Continuous Time)

$$
w_{\text{recency}}(t) = e^{-\lambda \Delta t}, \qquad \lambda = \frac{\ln 2}{T_{1/2}}
$$

- $\Delta t$: years since publication or last verification.
- $T_{1/2}$: evidence half-life by domain.

Default $T_{1/2}$ values:
- Fast-moving pharmacotherapy: 6 years
- Chronic disease lifestyle interventions: 10 years
- Stable physiology/mechanism literature: 12 years

### 2.5 Sample Size Transform

$$
f(n)=\log(1+n)
$$

Rationale: monotone increasing, diminishing returns, robust to extreme $n$.

### 2.6 Precision Term

For each study estimate $\hat\theta_i$ with standard error $SE_i$:

$$
p_i = \frac{1}{SE_i^2 + \epsilon}
$$

with small stabilizer $\epsilon = 10^{-6}$.

If only confidence interval is available:

$$
SE_i \approx \frac{\text{CI}_{upper} - \text{CI}_{lower}}{2\cdot1.96}
$$

### 2.7 Pramana Raw and 0-100 Score

$$
\text{PramanaRaw}(t) = \sum_{i=1}^{N} S_i(t)
$$

Robust normalization (winsorized at p2/p98):

$$
\text{PramanaScore}(t)=100\cdot\frac{\text{clip}(\text{PramanaRaw}, q_{0.02}, q_{0.98}) - q_{0.02}}{q_{0.98}-q_{0.02}}
$$

---

## 3. Meta-Analysis Backbone

### 3.1 Fixed-Effect Inverse-Variance Pooling

$$
\hat\theta_{FE} = \frac{\sum_i w_i \hat\theta_i}{\sum_i w_i}, \qquad w_i = \frac{1}{SE_i^2}
$$

### 3.2 Random-Effects Pooling

$$
\hat\theta_{RE} = \frac{\sum_i w_i^* \hat\theta_i}{\sum_i w_i^*}, \qquad w_i^* = \frac{1}{SE_i^2+\tau^2}
$$

Where $\tau^2$ is between-study variance (REML preferred).

### 3.3 Heterogeneity Metrics

- Cochran's $Q$ for heterogeneity test.
- $I^2$ for inconsistency proportion.
- Prediction interval required when $k\ge5$ studies:

$$
\hat\theta_{RE} \pm t_{k-1,0.975}\sqrt{\tau^2 + SE(\hat\theta_{RE})^2}
$$

---

## 4. Bayesian Confidence Gate

For clinically meaningful threshold $\theta_{min}$:

$$
P(\theta > \theta_{min} \mid D)
$$

Decision gate:
- `RECOMMEND` if $P(\theta > \theta_{min}\mid D) \ge \tau_{recommend}$
- `CONDITIONAL` if in gray zone
- `INSUFFICIENT_EVIDENCE` otherwise

Default thresholds:
- Clinician mode: $\tau_{recommend}=0.85$
- Public mode: $\tau_{recommend}=0.90$
- Gray zone lower bound: $0.65$

---

## 5. Dose-Response Utility Optimization

Let dose be $d$:

$$
U(d)=B(d)-\alpha R(d)-\beta C(d)
$$

- $B(d)$: benefit model (e.g., Emax/Hill)
- $R(d)$: adverse-risk model
- $C(d)$: adherence/cost burden

Optimal dose solves:

$$
\frac{dU}{dd}=0,\quad \frac{d^2U}{dd^2}<0
$$

With hard constraints:
- regulatory max dose
- known toxicity boundaries
- contraindicated co-medication combinations

If constrained optimum infeasible, choose best feasible boundary point.

---

## 6. Interaction Dynamics (ODE Safety Layer)

For two co-administered interventions:

$$
\frac{dC_1}{dt}=-k_1C_1-\beta C_1C_2,
\qquad
\frac{dC_2}{dt}=-k_2C_2
$$

Risk score over time:

$$
\text{Risk}(t)=h(C_1(t), C_2(t), x_{patient})
$$

Output required in UI:
- peak risk window
- time-to-peak
- interaction severity class
- evidence confidence for the interaction edge

---

## 7. Personalized Trajectory Model

State vector (e.g., HbA1c, SBP, CRP):

$$
\frac{dx}{dt}=F(x,t)+G(x,t)u(t)+\epsilon(t)
$$

Counterfactual policy simulation required:
1. allopathy-only
2. integrative care
3. lifestyle-first

Outputs:
- expected trajectory
- 50% and 95% uncertainty bands
- probability of crossing clinical targets by horizon $T$

---

## 8. Calibration and Efficacy Demonstration Protocol

### 8.1 Required Offline Validation

1. **Discrimination**
- AUROC for binary outcomes where applicable
- Concordance index for time-to-event endpoints

2. **Calibration**
- Calibration slope in [0.9, 1.1]
- Calibration intercept in [-0.05, 0.05]
- Brier score tracked by condition

3. **Interval reliability**
- 95% intervals empirical coverage: 92%-98%

4. **Ranking utility**
- Spearman correlation between Pramana ranking and independent review conclusions

5. **Decision usefulness**
- Net benefit via Decision Curve Analysis over clinician-relevant threshold range

### 8.2 Required Online Monitoring

- Drift detection on score distribution (PSI/KL divergence)
- Monthly re-calibration checks
- Alert when confidence gate pass rate changes by >10% week-over-week

### 8.3 Minimum Efficacy Criteria for Production Rollout

All must pass for two consecutive validation windows:
- AUROC >= 0.72 (or task-appropriate equivalent)
- Calibration slope in [0.9,1.1]
- 95% interval coverage >= 92%
- No critical safety rule violations in dose/interaction engines

---

## 9. Honesty-by-Construction Source Policy

### 9.1 Citation Requirements

Every intervention card must show:
- source identifiers (`PMID`/`DOI`/registry id)
- direct URL
- last verification date
- model version used to compute score

### 9.2 Prohibited Outputs

System must reject generation of:
- unsupported causal claims
- equivalency claims across grades (A vs B/C)
- recommendations with missing uncertainty
- references without resolvable identifiers

### 9.3 Allowlisted Source Domains

- pubmed.ncbi.nlm.nih.gov
- doi.org
- clinicaltrials.gov
- trialsearch.who.int
- ctri.nic.in
- ayush.gov.in
- cochrane.org
- cochranelibrary.com
- bmj.com / bmjopen.bmj.com

---

## 10. Implementation Mapping

### 10.1 Data Model Additions (`packages/domain/src/index.ts`)

Add fields to `treatmentEvidenceSchema`:
- `publicationDate: string` (ISO date)
- `riskOfBias: "low" | "some_concerns" | "high" | "critical"`
- `effectEstimate?: number`
- `effectStdError?: number`
- `confidenceIntervalLower?: number`
- `confidenceIntervalUpper?: number`
- `pramanaContribution?: number`
- `pramanaScore?: number`
- `modelVersion?: string`

### 10.2 API Endpoints (`services/api/src/app.ts`)

Add:
- `GET /score/:conditionId/:intervention` -> score + uncertainty + citation list
- `GET /trajectory/:conditionId` -> scenario trajectories + intervals
- `GET /interaction-risk` -> ODE-based interaction timeline

### 10.3 Compute Jobs (`services/ingestion` or `services/scoring`)

Nightly scheduled jobs:
- recalculate recency factors
- recompute score normalization quantiles
- refresh calibration diagnostics
- emit audit artifact JSON to S3

---

## 11. Governance & Reproducibility

- Every score response must include `modelVersion` and `dataSnapshotId`.
- Every production model change requires:
  1. version bump,
  2. changelog entry,
  3. backtest report,
  4. sign-off by clinical and statistical reviewers.

---

## 12. Source References (Real, Public, Citable)

1. Oxford CEBM Levels of Evidence (official):
   - https://www.cebm.ox.ac.uk/resources/levels-of-evidence/ocebm-levels-of-evidence
2. Cochrane Handbook v6.5, Chapter 10 (meta-analysis, heterogeneity, Bayesian methods):
   - https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10
3. NCBI Entrez E-utilities Help (official API/programmatic interface):
   - https://www.ncbi.nlm.nih.gov/books/NBK25501/
4. ClinicalTrials.gov Data API (official):
   - https://clinicaltrials.gov/data-api/about-api
5. WHO ICTRP Trial Search Portal (official):
   - https://trialsearch.who.int/

Additional cited statistical classics:
- DerSimonian R, Laird N. Controlled Clinical Trials (1986).
- Higgins JPT, Thompson SG. Stat Med (2002) on $I^2$.
- Riley RD, Higgins JPT, Deeks JJ. BMJ (2011) on random-effects interpretation.

---

## 13. Release Milestones for Math Stack

### Milestone M1 (2 weeks)
- Recency decay + score normalization + uncertainty in API response.
- Validation: calibration and coverage baseline.

### Milestone M2 (4 weeks)
- Bayesian confidence gate + dose-response optimizer.
- Validation: decision-curve net benefit and safety constraints.

### Milestone M3 (6 weeks)
- ODE interaction timeline + trajectory simulator.
- Validation: retrospective agreement with known interaction timing and outcome trends.

---

## 14. Final Principle

**If the system cannot show the equation, uncertainty, and source, it must not show the claim.**
