import { featureById } from './feature-registry';

export const routeByTab = {
  'research-home': featureById['research-home'].href,
  'nobel-dossier': featureById['nobel-dossier'].href,
  'health-equity': featureById['health-equity'].href,
  'intelligence-studio': featureById['intelligence-studio'].href,
  'ode-lab': featureById['ode-lab'].href,
  'diagnostic-workbench': featureById['diagnostic-workbench'].href,
  'ai-synthesis': featureById['ai-synthesis'].href,
  'code-architecture': featureById['code-architecture'].href,
  'calibration-drift': featureById['calibration-drift'].href,
} as const;

export const compatibilityRoutes = {
  math: '/math',
  comparison: '/compare/$conditionId',
  submission: '/new',
  editor: '/editor',
  authCallback: '/auth/callback',
} as const;

export const appRoutePaths = [...Object.values(routeByTab), ...Object.values(compatibilityRoutes)] as const;

export type TabId = keyof typeof routeByTab;
export type AppRoutePath = (typeof appRoutePaths)[number];
