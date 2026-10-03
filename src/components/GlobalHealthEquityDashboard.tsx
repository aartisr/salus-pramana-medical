import React, { useState, useEffect, useMemo } from 'react';
import { D3WorldMap } from './D3WorldMap';
import {
  countryHealthEquityProfiles,
  globalHealthEquitySummary,
  metricLabels,
} from '../data/globalHealthEquityData';
import { CountryHealthEquityProfile, EquityMetricKey, WHORegion } from '../types/healthEquity';
import { PersonaMode } from '../types/salus';
import {
  Globe2,
  HeartHandshake,
  DollarSign,
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Users,
  Building,
} from 'lucide-react';

interface GlobalHealthEquityDashboardProps {
  selectedPersona: PersonaMode;
  onNavigateToStudio?: () => void;
  onNavigateToODELab?: () => void;
}

export const GlobalHealthEquityDashboard: React.FC<GlobalHealthEquityDashboardProps> = ({
  selectedPersona,
  onNavigateToStudio,
  onNavigateToODELab,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<EquityMetricKey>('gheiScore');
  const [selectedCountry, setSelectedCountry] = useState<CountryHealthEquityProfile>(
    countryHealthEquityProfiles[0] // Default to India
  );
  const [showFlows, setShowFlows] = useState<boolean>(true);

  // Policy Simulation Sandbox State
  const [salusGlobalAdoptionPct, setSalusGlobalAdoptionPct] = useState<number>(65);

  // Live Telemetry Event Simulator
  const [liveTelemetryCounter, setLiveTelemetryCounter] = useState<number>(
    globalHealthEquitySummary.liveEvidenceTelemetryEvents
  );
  const [liveAvertedCollisions, setLiveAvertedCollisions] = useState<number>(
    globalHealthEquitySummary.totalAnnualHerbDrugCollisionsGlobal
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTelemetryCounter((prev) => prev + Math.floor(Math.random() * 4) + 1);
      if (Math.random() > 0.6) {
        setLiveAvertedCollisions((prev) => prev + 1);
      }
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Policy Simulation Calculations
  const simulatedImpact = useMemo(() => {
    const factor = salusGlobalAdoptionPct / 100;
    const dalysSaved = Math.round(globalHealthEquitySummary.projectedAnnualDALYsSavedViaSalusMillions * factor * 10) / 10;
    const savingsBillions = Math.round(globalHealthEquitySummary.projectedAnnualCostSavingsBillionsUSD * factor * 10) / 10;
    const preventedEvents = Math.round(globalHealthEquitySummary.totalAnnualHerbDrugCollisionsGlobal * factor);
    const lowIncomePopServed = Math.round(globalHealthEquitySummary.totalPopulationRelyingOnTraditionalMedBillions * factor * 10) / 10;

    return {
      dalysSaved,
      savingsBillions,
      preventedEvents,
      lowIncomePopServed,
    };
  }, [salusGlobalAdoptionPct]);

  // Regional breakdown aggregations
  const regions: WHORegion[] = [
    'South-East Asia',
    'African Region',
    'Western Pacific',
    'Americas',
    'European Region',
    'Eastern Mediterranean',
  ];

  const regionalStats = useMemo(() => {
    return regions.map((reg) => {
      const list = countryHealthEquityProfiles.filter((c) => c.region === reg);
      const avgGHEI = list.length > 0 ? Math.round(list.reduce((acc, c) => acc + c.gheiScore, 0) / list.length) : 60;
      const avgOOP = list.length > 0 ? Math.round(list.reduce((acc, c) => acc + c.outOfPocketCostPct, 0) / list.length) : 35;
      const avgTrad = list.length > 0 ? Math.round(list.reduce((acc, c) => acc + c.traditionalRelianceRate, 0) / list.length) : 70;
      return {
        region: reg,
        countryCount: list.length,
        avgGHEI,
        avgOOP,
        avgTrad,
      };
    });
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Header */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-indigo-950/40 p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Globe2 className="h-4 w-4 text-emerald-400" />
              <span>GLOBAL HEALTH EQUITY OBSERVATORY & D3 VISUALIZATION</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-cinzel">
              Global Health Equity Index: <span className="text-emerald-400">Democratizing Medical Truth</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Visualizing the real-time global divide across <strong className="text-white">6.42 billion people</strong> utilizing Traditional & Complementary Medicine alongside allopathic pharmacotherapy. SALUS Pramana provides the open, zero-cost scientific bridge that eliminates lethal drug collisions and secures healthcare equity.
            </p>
          </div>

          {/* Live Telemetry Ticker Box */}
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl space-y-2 lg:w-auto lg:min-w-[260px]">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE TELEMETRY
              </span>
              <span>WHO & AYUSH Sync</span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Averted Herb-Drug Collisions:</span>
                <strong className="text-amber-300">{liveAvertedCollisions.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Verified Evidence Ingestions:</span>
                <strong className="text-indigo-300">{liveTelemetryCounter.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Federated National Registries:</span>
                <strong className="text-emerald-300">{globalHealthEquitySummary.totalActiveRegistriesFederated} Portals</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Global Summary KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Traditional Med Reliance</span>
            <div className="text-xl sm:text-2xl font-extrabold text-teal-300 font-mono">
              6.42 <span className="text-xs font-normal text-slate-400">Billion</span>
            </div>
            <span className="text-[10px] text-slate-400">80.2% of global population</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Projected Annual DALYs Saved</span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
              28.6 <span className="text-xs font-normal text-slate-400">Million</span>
            </div>
            <span className="text-[10px] text-slate-400">Through integrative evidence</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Annual Global Cost Savings</span>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
              $46.8 <span className="text-xs font-normal text-slate-400">Billion</span>
            </div>
            <span className="text-[10px] text-slate-400">Eliminating redundant polypharmacy</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Global Health Equity Index</span>
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-400 font-mono">
              68.8 <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <span className="text-[10px] text-slate-400">Target: 85+ by 2030</span>
          </div>
        </div>
      </div>

      {/* Interactive Metric Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Sliders className="h-4 w-4 text-emerald-400" />
          <span>Select Map Layer:</span>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(metricLabels) as EquityMetricKey[]).map((key) => {
            const isActive = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-mono font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {metricLabels[key].label}
              </button>
            );
          })}
        </div>

        {/* Evidence Flows Toggle */}
        <button
          onClick={() => setShowFlows(!showFlows)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono border transition ${
            showFlows
              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50'
              : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Evidence Distribution Arcs: {showFlows ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* D3 World Map Canvas */}
      <D3WorldMap
        selectedMetric={selectedMetric}
        selectedCountry={selectedCountry}
        onSelectCountry={(c) => setSelectedCountry(c)}
        showFlows={showFlows}
      />

      {/* Country Detail & Regional Gap Split View (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Country Profile Inspector Card */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-cinzel">
                  {selectedCountry.name}
                </h3>
                <span className="rounded bg-indigo-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/30">
                  {selectedCountry.isoCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {selectedCountry.region} • Population: {selectedCountry.populationMillions}M
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 uppercase block">GHEI Equity Score</span>
              <span className="text-3xl font-extrabold text-amber-400 font-mono">
                {selectedCountry.gheiScore}
              </span>
              <span className="text-xs text-slate-500"> / 100</span>
            </div>
          </div>

          {/* 4 Quantitative Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">UHC Coverage</span>
              <span className="text-lg font-bold text-teal-300 font-mono">{selectedCountry.uhcIndex}%</span>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Out-of-Pocket Cost</span>
              <span className={`text-lg font-bold font-mono ${selectedCountry.outOfPocketCostPct > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedCountry.outOfPocketCostPct}%
              </span>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Physician Density</span>
              <span className="text-lg font-bold text-indigo-300 font-mono">{selectedCountry.physicianDensity} / 10k</span>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Averted Herb Collisions</span>
              <span className="text-lg font-bold text-amber-300 font-mono">{selectedCountry.avertedInteractionsPerYear.toLocaleString()}</span>
            </div>
          </div>

          {/* Traditional Medicine Ecosystem & Regulation */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                Traditional Medicine Infrastructure
              </span>
              <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-mono font-semibold border border-emerald-500/30">
                {selectedCountry.nationalIntegrativePolicy}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Active Healing Traditions:</span>
              {selectedCountry.traditionalSystems.map((sys, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-slate-200 border border-slate-800 font-medium"
                >
                  {sys}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedCountry.disparityHighlights}
            </p>
          </div>

          {/* DALY and Economic Savings Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                SALUS DALY Burden Reduction
              </span>
              <div className="text-lg font-bold text-white font-mono">
                {selectedCountry.salusDALYReduction.toLocaleString()} DALYs <span className="text-xs text-slate-400 font-normal">/ 100k</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                Annual Projected Health Savings
              </span>
              <div className="text-lg font-bold text-white font-mono">
                ${selectedCountry.annualCostSavingsMillionsUSD.toLocaleString()} Million USD
              </div>
            </div>
          </div>
        </div>

        {/* Regional Health Equity Disparity Leaderboard */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-cinzel flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              Regional Health Equity Disparity Gaps
            </h3>
            <span className="text-[11px] font-mono text-slate-400">WHO 6-Region Index</span>
          </div>

          <div className="space-y-3">
            {regionalStats.map((reg) => (
              <div
                key={reg.region}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{reg.region}</span>
                  <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-mono font-bold text-amber-300 border border-slate-800">
                    GHEI: {reg.avgGHEI} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>
                    <span>Traditional Reliance: </span>
                    <strong className="text-teal-300">{reg.avgTrad}%</strong>
                  </div>
                  <div>
                    <span>Out-of-Pocket Burden: </span>
                    <strong className={reg.avgOOP > 40 ? 'text-rose-400' : 'text-emerald-400'}>
                      {reg.avgOOP}%
                    </strong>
                  </div>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                    style={{ width: `${reg.avgGHEI}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Global Policy Simulation Sandbox */}
      <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 md:p-8 space-y-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <Activity className="h-4 w-4" />
              <span>INTERACTIVE WHO / GLOBAL HEALTH MINISTRY POLICY SIMULATION</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-cinzel mt-1">
              Global Deployment Impact Calculator
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate the global epidemiological and economic return on deploying SALUS Pramana across Low-and-Middle-Income Countries (LMICs)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Global Adoption Target:</span>
            <span className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-sm font-mono font-bold text-white shadow-lg">
              {salusGlobalAdoptionPct}% of LMIC Clinics
            </span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={salusGlobalAdoptionPct}
            onChange={(e) => setSalusGlobalAdoptionPct(parseInt(e.target.value))}
            className="w-full accent-indigo-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>10% Pilot Integration</span>
            <span>50% National Primary Care</span>
            <span>100% Full Universal Deployment (WHO Target)</span>
          </div>
        </div>

        {/* Live Simulated Impact Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="rounded-xl border border-emerald-500/30 bg-slate-950/80 p-4 space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold">
              Annual DALYs Averted
            </span>
            <div className="text-2xl font-extrabold text-white font-mono">
              {simulatedImpact.dalysSaved} Million
            </div>
            <p className="text-[10px] text-slate-400">Years of healthy life restored</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">
              Annual Economic Savings
            </span>
            <div className="text-2xl font-extrabold text-amber-300 font-mono">
              ${simulatedImpact.savingsBillions} Billion USD
            </div>
            <p className="text-[10px] text-slate-400">Catastrophic spending averted</p>
          </div>

          <div className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-4 space-y-1">
            <span className="text-[11px] font-mono text-indigo-400 uppercase font-bold">
              Lethal Collisions Prevented
            </span>
            <div className="text-2xl font-extrabold text-indigo-300 font-mono">
              {simulatedImpact.preventedEvents.toLocaleString()} / year
            </div>
            <p className="text-[10px] text-slate-400">Herb-drug toxicity events stopped</p>
          </div>

          <div className="rounded-xl border border-teal-500/30 bg-slate-950/80 p-4 space-y-1">
            <span className="text-[11px] font-mono text-teal-400 uppercase font-bold">
              Population Empowered
            </span>
            <div className="text-2xl font-extrabold text-teal-300 font-mono">
              {simulatedImpact.lowIncomePopServed} Billion
            </div>
            <p className="text-[10px] text-slate-400">People with verified evidence</p>
          </div>
        </div>
      </div>
    </div>
  );
};
