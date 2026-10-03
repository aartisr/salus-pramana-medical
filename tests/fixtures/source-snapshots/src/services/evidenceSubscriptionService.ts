/**
 * Service to manage peer-reviewed clinical evidence email subscriptions
 * Stores preferences locally with simulated backend registry polling.
 */

export interface EvidenceSubscription {
  id: string;
  email: string;
  queryOrCondition: string;
  conditionId?: string;
  systems: string[]; // e.g. ['Allopathy', 'Ayurveda', 'Siddha', 'Naturopathy']
  minEvidenceGrade: 'A' | 'B' | 'any';
  frequency: 'immediate' | 'weekly' | 'monthly';
  createdAt: number;
  status: 'active' | 'paused';
}

const STORAGE_KEY = 'salus_evidence_subscriptions_v1';

export function getSubscriptions(): EvidenceSubscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSubscriptions(subs: EvidenceSubscription[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  } catch (err) {
    console.error('Failed to save subscriptions', err);
  }
}

export function addSubscription(
  sub: Omit<EvidenceSubscription, 'id' | 'createdAt' | 'status'>
): EvidenceSubscription {
  const existing = getSubscriptions();
  
  // Deduplicate by email + query
  const trimmedEmail = sub.email.trim().toLowerCase();
  const trimmedQuery = sub.queryOrCondition.trim().toLowerCase();

  const filtered = existing.filter(
    (s) => !(s.email.toLowerCase() === trimmedEmail && s.queryOrCondition.toLowerCase() === trimmedQuery)
  );

  const newSub: EvidenceSubscription = {
    ...sub,
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: trimmedEmail,
    queryOrCondition: sub.queryOrCondition.trim(),
    createdAt: Date.now(),
    status: 'active',
  };

  filtered.unshift(newSub);
  saveSubscriptions(filtered);
  return newSub;
}

export function removeSubscription(id: string): void {
  const existing = getSubscriptions();
  const updated = existing.filter((s) => s.id !== id);
  saveSubscriptions(updated);
}
