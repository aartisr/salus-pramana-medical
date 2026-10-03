import { describe, expect, it } from 'vitest';
import { featureActionRegistry, featureRegistry } from './feature-registry';
import { routeByTab } from './route-paths';

describe('feature registry contract', () => {
  it('gives every capability a unique discoverable identity and open action', () => {
    expect(new Set(featureRegistry.map((feature) => feature.id)).size).toBe(featureRegistry.length);
    expect(new Set(featureRegistry.map((feature) => feature.href)).size).toBe(featureRegistry.length);
    expect(featureRegistry.every((feature) => feature.actions.includes('open'))).toBe(true);
  });

  it('keeps all primary workstation navigation backed by a registered capability', () => {
    const registeredPaths = new Set(featureRegistry.map((feature) => feature.href));
    expect(Object.values(routeByTab).every((path) => registeredPaths.has(path))).toBe(true);
  });

  it('keeps non-route UI actions uniquely addressable', () => {
    expect(new Set(featureActionRegistry.map((action) => action.id)).size).toBe(featureActionRegistry.length);
  });
});
