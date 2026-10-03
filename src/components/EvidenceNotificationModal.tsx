import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Check,
  X,
  Mail,
  Filter,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { medicalConditions } from '../data/salusRepositoryData';
import {
  getSubscriptions,
  addSubscription,
  removeSubscription,
  EvidenceSubscription,
} from '../services/evidenceSubscriptionService';
import confetti from 'canvas-confetti';

interface EvidenceNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSearchQuery?: string;
}

export const EvidenceNotificationModal: React.FC<EvidenceNotificationModalProps> = ({
  isOpen,
  onClose,
  currentSearchQuery = '',
}) => {
  const [email, setEmail] = useState<string>('');
  const [targetTopic, setTargetTopic] = useState<string>('');
  const [selectedSystems, setSelectedSystems] = useState<string[]>([
    'Allopathy',
    'Ayurveda',
    'Siddha',
    'Naturopathy',
  ]);
  const [minGrade, setMinGrade] = useState<'A' | 'B' | 'any'>('B');
  const [frequency, setFrequency] = useState<'immediate' | 'weekly' | 'monthly'>('weekly');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<EvidenceSubscription[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTargetTopic(currentSearchQuery.trim() || 'Type 2 Diabetes Mellitus');
      setIsSuccess(false);
      setErrorMsg(null);
      setSubscriptions(getSubscriptions());
    }
  }, [isOpen, currentSearchQuery]);

  if (!isOpen) return null;

  const toggleSystem = (sys: string) => {
    if (selectedSystems.includes(sys)) {
      if (selectedSystems.length > 1) {
        setSelectedSystems(selectedSystems.filter((s) => s !== sys));
      }
    } else {
      setSelectedSystems([...selectedSystems, sys]);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid academic or professional email address.');
      return;
    }

    if (!targetTopic.trim()) {
      setErrorMsg('Please specify a condition or treatment keyword to monitor.');
      return;
    }

    const newSub = addSubscription({
      email: email.trim(),
      queryOrCondition: targetTopic.trim(),
      systems: selectedSystems,
      minEvidenceGrade: minGrade,
      frequency,
    });

    setSubscriptions(getSubscriptions());
    setIsSuccess(true);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#6366f1', '#38bdf8'],
    });
  };

  const handleDeleteSub = (id: string) => {
    removeSubscription(id);
    setSubscriptions(getSubscriptions());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg sm:text-xl font-cinzel">
                  Evidence Alert Surveillance
                </h3>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono font-bold">
                  Registry Live
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Subscribe to automated alerts when new peer-reviewed trials (PubMed, CTRI, Cochrane) are indexed.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-cinzel">
                Surveillance Alert Activated!
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                You will receive alerts at <strong className="text-amber-300 font-mono">{email}</strong> whenever new
                peer-reviewed evidence matching <strong className="text-white">"{targetTopic}"</strong> is registered with
                SALUS Pramana.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="rounded bg-slate-900 px-2.5 py-1 border border-slate-800">
                Frequency: <span className="text-emerald-300 uppercase">{frequency}</span>
              </span>
              <span className="rounded bg-slate-900 px-2.5 py-1 border border-slate-800">
                Min Grade: <span className="text-amber-300">Grade {minGrade === 'any' ? 'All' : minGrade}</span>
              </span>
              <span className="rounded bg-slate-900 px-2.5 py-1 border border-slate-800">
                Systems: <span className="text-indigo-300">{selectedSystems.join(', ')}</span>
              </span>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setIsSuccess(false)}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 text-xs font-semibold border border-slate-700 transition"
              >
                Create Another Alert
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-semibold transition shadow-lg shadow-emerald-600/30"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Target Query / Condition */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 flex items-center justify-between">
                <span>1. Clinical Topic or Condition to Monitor</span>
                {currentSearchQuery && (
                  <span className="text-[10px] text-amber-400">Prefilled from search</span>
                )}
              </label>
              <input
                type="text"
                value={targetTopic}
                onChange={(e) => setTargetTopic(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Metformin, Berberine, Hypertension, Ashwagandha..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-sans"
                required
              />

              {/* Preset condition quick chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-500">Suggested:</span>
                {medicalConditions.slice(0, 4).map((cond) => (
                  <button
                    key={cond.conditionId}
                    type="button"
                    onClick={() => setTargetTopic(cond.standardName)}
                    className={`rounded px-2 py-0.5 text-[10px] font-mono transition border ${
                      targetTopic.toLowerCase() === cond.standardName.toLowerCase()
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    {cond.standardName}
                  </button>
                ))}
              </div>
            </div>

            {/* Medical System Traditions Scope */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                2. Medical Traditions to Include
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Allopathy', label: 'Allopathy', color: 'border-blue-500/40 text-blue-300' },
                  { id: 'Ayurveda', label: 'Ayurveda', color: 'border-amber-500/40 text-amber-300' },
                  { id: 'Siddha', label: 'Siddha', color: 'border-teal-500/40 text-teal-300' },
                  { id: 'Naturopathy', label: 'Naturopathy', color: 'border-emerald-500/40 text-emerald-300' },
                ].map((sys) => {
                  const isChecked = selectedSystems.includes(sys.id);
                  return (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => toggleSystem(sys.id)}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-mono transition border ${
                        isChecked
                          ? `bg-slate-900 ${sys.color} shadow-sm`
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                      }`}
                    >
                      <span className="font-semibold">{sys.label}</span>
                      {isChecked ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rigor & Evidence Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-300">
                  3. Minimum Evidence Grade
                </label>
                <select
                  value={minGrade}
                  onChange={(e) => setMinGrade(e.target.value as 'A' | 'B' | 'any')}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none font-mono"
                >
                  <option value="A">Grade A only (Double-blind multi-center RCTs)</option>
                  <option value="B">Grade A & B (Rigorous peer-reviewed trials)</option>
                  <option value="any">All Indexed Registries (Broad surveillance)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-300">
                  4. Notification Cadence
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'immediate' | 'weekly' | 'monthly')}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none font-mono"
                >
                  <option value="immediate">Immediate / Daily Digest (As registered)</option>
                  <option value="weekly">Weekly Evidence Briefing (Mondays)</option>
                  <option value="monthly">Monthly Systematic Meta-Review</option>
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                5. Email Address for Alert Delivery
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="physician@hospital.org or researcher@university.edu"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-sans"
                  required
                />
              </div>
            </div>

            {/* Privacy note */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Zero marketing. Transparent open-science evidence registry surveillance.</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Unsubscribe anytime</span>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2 text-xs font-bold transition shadow-lg shadow-amber-500/20"
              >
                <BellRing className="h-4 w-4" />
                <span>Activate Evidence Alert</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Subscriptions in This Browser */}
        {subscriptions.length > 0 && (
          <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
              Active Browser Subscriptions ({subscriptions.length})
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-mono"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white font-semibold truncate">"{sub.queryOrCondition}"</span>
                    <span className="text-slate-400 text-[11px]">→ {sub.email}</span>
                    <span className="text-amber-400/80 text-[10px] uppercase">({sub.frequency})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSub(sub.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                    title="Remove this alert subscription"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
