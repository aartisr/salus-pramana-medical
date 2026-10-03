# SALUS Pramana Medical: Evidence Infrastructure for Integrative Care

<div align="center">

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](https://opensource.org/licenses/Apache-2.0)
[![Traceable Sources](https://img.shields.io/badge/Sources-Registry--linked-10b981?style=for-the-badge)](https://pubmed.ncbi.nlm.nih.gov)
[![Transparent Models](https://img.shields.io/badge/Models-Inspectable%20RK4-6366f1?style=for-the-badge)](https://github.com/aartisr/salus-pramana-medical)
[![Author](https://img.shields.io/badge/Author-Aarti%20S%20Ravikumar-38bdf8?style=for-the-badge)](https://ai-aarti.com)

**"The evidence behind every path to healing."**
*A transparent, open-source workspace for examining allopathic, Ayurvedic, Siddha, and naturopathic evidence with the same commitment to safety, provenance, and uncertainty.*

[Repository](https://github.com/aartisr/salus-pramana-medical) • [Author's Portfolio](https://ai-aarti.com) • [Mathematical Specification](#-formal-mathematical-specification) • [Author's Letter to the Community](#-authors-letter-to-the-global-community) • [Source allowlist](#-centralized-registry-allowlist--citation-verification) • [Contributing](#-contribute-to-a-safer-evidence-commons)

</div>

---

## 💌 Author's Letter to the Global Community

Dear clinicians, traditional practitioners, researchers, patients, caregivers, and advocates,

I built SALUS Pramana around a reality that is easy to overlook in clinical software: people do not experience health care as separate, neatly labeled systems. A person may leave a clinic with a prescription, call a family member about a home remedy, and seek guidance from a Vaidya or another trusted practitioner—all in the same week. Their clinicians deserve to know that full story, and patients deserve to discuss it without being dismissed.

Traditional, complementary, and integrative medicine is used by billions of people worldwide. The World Health Organization’s current strategy calls for integration that is safe, effective, people-centred, evidence-based, and culturally respectful. That is not a request to lower the bar for evidence. It is a request to build tools that make the bar visible—and apply it fairly. [WHO Global Traditional Medicine Strategy 2025–2034](https://www.who.int/westernpacific/publications/i/item/9789240113176)

The gap is practical, not abstract. A patient may hesitate to mention a botanical preparation because they expect a dismissive response. A clinician may not have the time or tools to evaluate potential interactions. Meanwhile, online health claims can travel much faster than the research needed to support or challenge them. In that space, uncertainty must be named plainly; a confident interface is not a substitute for evidence.

I created **SALUS Pramana** to make a more careful conversation possible: one in which cultural knowledge is treated with respect, clinical claims remain open to scrutiny, and safety comes before persuasion.

```
                                      THE HUMAN REALITY
                     ┌─────────────────────────────────────────────────┐
                     │  People commonly combine multiple care systems   │
                     │  and deserve transparent, safety-first evidence  │
                     └────────────────────────┬────────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     │       The real-world information divide          │
                     ├────────────────────────┬────────────────────────┤
                     │  Modern Allopathic EHRs │  Opaque Wellness Apps  │
                     │  • May omit remedies   │  • Claims outrun data  │
                     │  • Limited context     │  • Sources are unclear │
                     │  • Fragmented records  │  • Safety is uneven    │
                     └────────────────────────┬────────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     │          SALUS PRAMANA: THE COMMON BRIDGE       │
                     │  Traceable evidence • Interaction modelling     │
                     │  Open methods • Respect for patient context     │
                     └─────────────────────────────────────────────────┘
```

SALUS is not a diagnostic service, a replacement for clinical judgment, or an authority that turns incomplete evidence into certainty. It is an **open-source evidence workspace** designed to make its reasoning inspectable. It records source provenance, distinguishes evidence strength from popularity, models selected interaction scenarios with fourth-order Runge–Kutta methods, and makes missing evidence visible instead of silently filling the gap.

I care deeply about access, but access without accountability is not enough. This project is open source so that its assumptions, formulas, and data pathways can be inspected, challenged, and improved. It is intended to be useful in a rural health post in Tamil Nadu, a clinic in Nairobi, a community hospital in Boston, or a district dispensary in Kerala—not by pretending those settings are identical, but by making the work adaptable and auditable.

This repository is dedicated to every physician, Vaidya, researcher, caregiver, and patient who asks the difficult but necessary question: *What do we actually know, how do we know it, and what should we do when we do not know enough?*

With profound gratitude and dedication to human health,
**Aarti S Ravikumar**
*Pioneer Charter School of Science II*
*Lead Architect, SALUS Pramana Medical System*
*GitHub: [@aartisr](https://github.com/aartisr)*

---

## 🏛️ The six commitments of the SALUS Charter

| Pillar | Principle | What SALUS commits to |
| :--- | :--- | :--- |
| **1** | **Epidemiological Reality** | Built for how patients actually heal: concurrent multi-system regimens rather than idealized single-drug silos. |
| **2** | **Strict Evidence Hierarchy** | No false equivalence: Grade A Multi-Center RCTs > Grade B Controlled Trials > Grade C Consensus Monographs. |
| **3** | **White-Box Auditability** | Scores expose their component terms, source records, and assumptions for review. |
| **4** | **Dynamical Pharmacokinetics** | Uses fourth-order Runge–Kutta (RK4) models to explore configured concentration curves and interaction timing; results are decision support, not dosing instructions. |
| **5** | **Safety-Gated Governance** | Surfaces missing registry identifiers as `INSUFFICIENT_EVIDENCE` and applies explicit calibration gates. |
| **6** | **Global Scientific Commons** | Keeps methods and core software open for adaptation, review, and collaboration across settings. |

---

## 🔬 Formal Mathematical Specification

SALUS Pramana makes its current scoring and modelling assumptions explicit in deterministic, inspectable formulations. These models are research tools; they do not establish clinical efficacy or replace prospective validation.

### 1. Pramana Dynamic Evidence Calculus
For any clinical indication $C$ and intervention $T$, each indexed study $i$ yields a time-decayed evidentiary contribution $S_i(t)$:

$$S_i(t) = w_{\text{grade},i} \cdot w_{\text{design},i} \cdot w_{\text{bias},i} \cdot \exp(-\lambda_k \cdot \Delta t_i) \cdot \ln(1 + n_i) \cdot \left[ \frac{1}{\text{SE}_i^2 + \epsilon} \right]$$

- **$w_{\text{grade},i}$**: Evidence Prior Tier — Grade A ($1.00$), Grade B ($0.60$), Grade C ($0.25$).
- **$w_{\text{design},i}$**: Study Methodology Class — Meta-Analysis ($1.00$), Multi-Center RCT ($0.90$), Cohort ($0.70$), Preclinical In-Vitro ($0.35$).
- **$w_{\text{bias},i}$**: Cochrane RoB2 Risk of Bias Multiplier — Low ($1.00$), Some Concerns ($0.80$), High ($0.55$), Critical ($0.40$).
- **$\exp(-\lambda_k \Delta t_i)$**: Continuous Temporal Half-Life Decay ($T_{1/2} = 6$ years, $\lambda = \frac{\ln 2}{6} \approx 0.1155$).
- **$\ln(1 + n_i)$**: Logarithmic Sample Size Scaler preventing mega-trials from drowning replicated smaller trials.
- **$\frac{1}{\text{SE}_i^2 + \epsilon}$**: Fisher Information Precision Weighting ($\epsilon = 10^{-6}$).

The normalized composite **Pramana Index** $\mathcal{P}(C, T) \in [0, 100]$ is computed asymptotically:

$$\mathcal{P}(C, T) = 100 \cdot \left( 1 - \exp\left( - \frac{\sum_{i=1}^M S_i(t)}{\kappa} \right) \right) \quad (\kappa = 3500)$$

---

### 2. Coupled 4th-Order Runge-Kutta (RK4) Pharmacokinetic Solver
When an allopathic drug and a botanical extract share metabolic clearance enzymes (e.g., CYP3A4, CYP2C9, P-glycoprotein), their coupled plasma concentrations $\mathbf{c}(t) = [c_1(t), c_2(t)]^T$ are solved dynamically:

$$\begin{cases} \dfrac{dc_1(t)}{dt} = -k_1 c_1(t) - \beta \, c_1(t) c_2(t) \\[8pt] \dfrac{dc_2(t)}{dt} = -k_2 c_2(t) \end{cases}$$

The classical RK4 step ($h = 0.25\text{ hr}$) computes intermediate velocity vectors:

$$\begin{aligned}
\mathbf{k}_1 &= f(t_n, \mathbf{c}_n) \\
\mathbf{k}_2 &= f\left(t_n + \frac{h}{2}, \mathbf{c}_n + \frac{h}{2}\mathbf{k}_1\right) \\
\mathbf{k}_3 &= f\left(t_n + \frac{h}{2}, \mathbf{c}_n + \frac{h}{2}\mathbf{k}_2\right) \\
\mathbf{k}_4 &= f(t_n + h, \mathbf{c}_n + h\mathbf{k}_3) \\
\mathbf{c}_{n+1} &= \mathbf{c}_n + \frac{h}{6}(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4)
\end{aligned}$$

#### Modelled therapeutic-staggering objective
For its configured model assumptions, SALUS computes the administration delay $\tau^*$ that minimizes the metabolic-overlap integral:

$$\tau^* = \arg\min_{\tau \ge 0} \int_0^\infty c_1(t) \cdot c_2(t - \tau) \cdot \mathbb{I}(t \ge \tau) \, dt \quad \Longrightarrow \quad \tau^* = \frac{\ln(k_1 / k_2)}{k_1 - k_2} + \delta_{\text{buffer}}$$

---

### 3. Shannon epistemic-entropy framework
Let $\Theta$ be the discrete diagnosis or therapeutic-response space. Integrating independent, relevant traditional observations with modern biomarkers can reduce clinical diagnostic entropy:

$$H(\Theta) = -\sum_{k=1}^K P(\theta_k) \log_2 P(\theta_k)$$

$$I(\Theta; \mathcal{E}_{\text{Allopathy}}, \mathcal{E}_{\text{Traditional}}) = H(\Theta) - H(\Theta \mid \mathcal{E}_{\text{Allopathy}}, \mathcal{E}_{\text{Traditional}}) \ge I(\Theta; \mathcal{E}_{\text{Allopathy}})$$

*The framework expresses a design hypothesis: when independently obtained, relevant evidence is integrated carefully, uncertainty can be reduced. Its clinical usefulness depends on the quality, relevance, and independence of the underlying evidence.*

---

## 🌐 Centralized Registry Allowlist & Citation Verification

SALUS is designed to prioritize traceable, recognized sources and to flag records that do not meet its provenance requirements. The allowlist includes the following core sources; implementations should be reviewed regularly as registry policies and coverage evolve:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CENTRALIZED REGISTRY DOMAIN ALLOWLIST                   │
├──────────────────────────┬──────────────────────────────────────────────┤
│ Registry / Database      │ Official Verified Endpoint                   │
├──────────────────────────┼──────────────────────────────────────────────┤
│ PubMed / NCBI            │ https://pubmed.ncbi.nlm.nih.gov              │
│ Cochrane Library         │ https://www.cochranelibrary.com              │
│ Ministry of AYUSH Portal │ https://ayush.gov.in                         │
│ CTRI (ICMR India)        │ https://ctri.nic.in                          │
│ ClinicalTrials.gov (NIH) │ https://clinicaltrials.gov                   │
│ WHO ICTRP International  │ https://trialsearch.who.int                  │
│ Digital Object ID (DOI)  │ https://doi.org                              │
│ Nature / ScienceDirect   │ https://www.sciencedirect.com                │
└──────────────────────────┴──────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Installation

SALUS is engineered in TypeScript, React, Vite, and Tailwind CSS. Its evidence and interaction tools run from openly inspectable source; optional integrations, such as authentication and AI-assisted synthesis, require their own configuration.

### 1. Clone the Repository
```bash
git clone https://github.com/aartisr/salus-pramana-medical.git
cd salus-pramana-medical
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Workstation
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build Production Distribution
```bash
npm run build
```

---

## 🧭 Interactive Workstation Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SALUS PRAMANA WORKSTATION                       │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. Research Home         │ Hero search, Pramana calculus sandbox       │
│ 2. Scientific Audit      │ 10-dimension dossier & UpToDate benchmark   │
│ 3. Global Health Equity  │ Interactive D3 world map & DALY savings     │
│ 4. Cross-System Studio   │ Multi-system comparative clinical ledgers   │
│ 5. ODE Simulation Lab    │ 4th-order Runge-Kutta interaction kinetics  │
│ 6. Clinical Workbench    │ eGFR, contraindication scan & Hill dosing   │
│ 7. AI Clinical Reasoning │ Gemini grounded in strict registry records  │
│ 8. Calibration Hub       │ Brier score verification (< 0.025)          │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### Application Structure

```text
src/
├── app/         # TanStack Router, Query client, shared state, shell, boundaries
├── routes/      # One lazy route adapter per workstation URL
├── components/  # Existing research screens, charts, modals, and shared UI
├── data/        # Versioned evidence, evaluation, and health-equity datasets
├── services/    # Pure calculus, ODE, export, subscription, and persistence logic
└── types/       # Shared medical and health-equity TypeScript contracts
```

The route adapters are intentionally thin. Domain behavior stays in `services/`, source datasets stay in `data/`, reusable presentation stays in `components/`, and cross-route concerns stay in `app/`.

The root `src/` tree is the complete active implementation. It is compiled, tested, and deployed as a self-contained application.

| Workstation | Route |
| :--- | :--- |
| Research Institute Home | `/` |
| Scientific Audit | `/scientific-audit` |
| Global Health Equity | `/global-health-equity` |
| Cross-System Intelligence | `/cross-system-intelligence` |
| ODE Interaction Lab | `/ode-interaction-lab` |
| Clinical Workbench | `/clinical-workbench` |
| AI Clinical Reasoning | `/ai-clinical-reasoning` |
| Repository & Math Architecture | `/architecture` |
| Calibration & Governance | `/calibration-governance` |

TanStack Router provides typed navigation, deep links, intent preloading, scroll restoration, and route-level code splitting. TanStack Query is configured once in `src/app/query-client.ts` for asynchronous server state as integrations expand.

---

## ⚡ Deployment on Vercel

SALUS deploys to Vercel as a Vite single-page application with a Node.js function for `/api/*`. The frontend can be deployed immediately; production API use requires the environment variables documented in [the Vercel deployment guide](docs/VERCEL_DEPLOYMENT.md), including a production persistence adapter.

### 1. Deploy with Vercel CLI
```bash
npm i -g vercel
vercel
```

### 2. Deploy via GitHub Integration
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **Import Project**.
3. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add the required environment variables from the [deployment guide](docs/VERCEL_DEPLOYMENT.md).
5. Click **Deploy**, then verify `/api/health` and a deep link such as `/clinical-workbench`.

---

## 🤝 Contribute to a safer evidence commons

We welcome physicians, Vaidyas, Siddha practitioners, pharmacognosists, data scientists, and healthcare advocates. The most valuable contributions are specific, sourced, and willing to be reviewed.

- **Found a new clinical trial?** Submit a PR to `src/data/salusRepositoryData.ts` with a valid `PMID`, `CTRI`, or other approved registry identifier, plus the source link.
- **Report an interaction?** Open an Issue with the source, population, intervention details, and pharmacokinetic parameters where available ($k_1, k_2, \beta$).
- **Questions or partnerships?** Reach out via [GitHub Discussions](https://github.com/aartisr/salus-pramana-medical/discussions).

---

<div align="center">

**SALUS Pramana Medical** • Authored with care by [**Aarti S Ravikumar**](https://ai-aarti.com)
*Pioneer Charter School of Science II*
*Licensed under the Apache 2.0 Open Source License.*

</div>
