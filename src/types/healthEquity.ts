export type WHORegion =
  | 'South-East Asia'
  | 'African Region'
  | 'Western Pacific'
  | 'Americas'
  | 'Eastern Mediterranean'
  | 'European Region';

export type EquityMetricKey =
  | 'gheiScore'
  | 'uhcIndex'
  | 'traditionalRelianceRate'
  | 'outOfPocketCostPct'
  | 'physicianDensity'
  | 'avertedInteractionsPerYear'
  | 'salusDALYReduction';

export interface CountryHealthEquityProfile {
  id: string; // ISO 3-digit numeric code for TopoJSON matching (e.g. "356")
  isoCode: string; // ISO-3 alpha (e.g. "IND")
  name: string;
  region: WHORegion;
  populationMillions: number;
  coordinates: [number, number]; // [longitude, latitude]
  
  // Core Accessibility & Equity Metrics
  gheiScore: number; // 0 - 100 Global Health Equity Index (Composite)
  uhcIndex: number; // 0 - 100 Universal Health Coverage Effective Index
  traditionalRelianceRate: number; // % of population relying on Traditional & Complementary Medicine (e.g. 78%)
  outOfPocketCostPct: number; // % of total health expenditure paid out-of-pocket (catastrophic expense indicator)
  physicianDensity: number; // Medical doctors per 10,000 population
  preventableHerbDrugIncidents: number; // Annual adverse herb-drug reactions per 100k population
  avertedInteractionsPerYear: number; // Projected adverse incidents averted through SALUS ODE / Pramana
  salusDALYReduction: number; // Annual DALYs averted per 100k via integrative evidence deployment
  annualCostSavingsMillionsUSD: number; // Economic savings from reducing duplicate/ineffective polypharmacy
  
  // Traditional Medicine Infrastructure
  traditionalSystems: string[];
  nationalIntegrativePolicy: 'Fully Integrated & Regulated' | 'Partially Regulated' | 'Unregulated / Folk Consensus' | 'Nascent Policy';
  primaryBurdenDisease: string;
  disparityHighlights: string;
  salusPramanaDeploymentStatus: 'Active Pilot' | 'National Registry Integration' | 'High Priority Deployment' | 'Global Partner Hub';
}

export interface GlobalHealthEquitySummary {
  globalAverageGHEI: number;
  totalPopulationRelyingOnTraditionalMedBillions: number;
  totalAnnualHerbDrugCollisionsGlobal: number;
  projectedAnnualDALYsSavedViaSalusMillions: number;
  projectedAnnualCostSavingsBillionsUSD: number;
  totalActiveRegistriesFederated: number;
  liveEvidenceTelemetryEvents: number;
}
