export type SafetyAlertLevel = "critical" | "warning" | "advisory";
export interface SafetyAlert { level: SafetyAlertLevel; code: string; text: string; source: string }
export interface SafetyProfile { egfr: number; pregnantOrLactating: boolean; interventionIds: string[] }

export const METFORMIN_CRITICAL_EGFR = 30;
export const METFORMIN_DOSE_REDUCTION_EGFR = 45;

export function evaluateSafety(profile: SafetyProfile): SafetyAlert[] {
  const selected = new Set(profile.interventionIds);
  const alerts: SafetyAlert[] = [];
  if (profile.egfr < METFORMIN_CRITICAL_EGFR) {
    if (selected.has("ev-metformin-1")) alerts.push({ level: "critical", code: "METFORMIN_RENAL_CONTRAINDICATION", text: "Metformin is contraindicated at eGFR below 30 mL/min due to elevated lactic acidosis risk.", source: "FDA Boxed Warning & UKPDS 34" });
    if (selected.has("ev-dash-diet-1") || selected.has("ev-potassium-1")) alerts.push({ level: "critical", code: "HIGH_POTASSIUM_RENAL_RISK", text: "High-potassium regimens are restricted in advanced renal failure due to hyperkalemia risk.", source: "Nephrology Clinical Guidelines" });
  } else if (profile.egfr < METFORMIN_DOSE_REDUCTION_EGFR && selected.has("ev-metformin-1")) {
    alerts.push({ level: "warning", code: "METFORMIN_RENAL_DOSE", text: "eGFR 30-44 mL/min requires a metformin dosage ceiling of 1000 mg/day.", source: "Clinical Pharmacology Advisory" });
  }
  if (profile.pregnantOrLactating && selected.has("ev-berberine-1")) alerts.push({ level: "critical", code: "BERBERINE_PREGNANCY", text: "Berberine is contraindicated in pregnancy or lactation due to neonatal kernicterus risk.", source: "Ayurvedic Pharmacopoeia & Reproductive Toxicology" });
  if (selected.has("ev-metformin-1") && selected.has("ev-berberine-1")) alerts.push({ level: "warning", code: "METFORMIN_BERBERINE_INTERACTION", text: "Additive glycemic reduction and transporter competition require a 2.5-hour stagger.", source: "SALUS Pramana ODE Solver Engine" });
  if (selected.has("ev-escitalopram-1") && selected.has("ev-ashwagandha-ksm66-1")) alerts.push({ level: "advisory", code: "ESCITALOPRAM_ASHWAGANDHA_SEDATION", text: "Monitor for daytime somnolence during initial co-administration.", source: "Neuropsychiatric Integrative Ledger" });
  return alerts;
}