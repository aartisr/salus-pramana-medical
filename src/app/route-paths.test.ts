import { describe, expect, it } from 'vitest';
import { appRoutePaths, compatibilityRoutes, routeByTab } from './route-paths';

describe('workstation route contract', () => {
  it('defines one unique absolute route for every production tab', () => {
    const paths = Object.values(routeByTab);

    expect(paths).toHaveLength(9);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((path) => path.startsWith('/'))).toBe(true);
  });

  it('keeps the research institute at the canonical root route', () => {
    expect(routeByTab['research-home']).toBe('/');
  });

  it('defines all fourteen lazy application routes without replacing root workstations', () => {
    expect(routeByTab).toHaveProperty('calibration-drift', '/calibration-governance');
    expect(compatibilityRoutes).toEqual({
      math: '/math',
      comparison: '/compare/$conditionId',
      submission: '/new',
      editor: '/editor',
      authCallback: '/auth/callback',
    });
    expect(appRoutePaths).toHaveLength(14);
    expect(new Set(appRoutePaths).size).toBe(appRoutePaths.length);
  });
});