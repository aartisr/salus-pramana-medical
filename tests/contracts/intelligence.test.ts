import { describe, expect, it, vi } from 'vitest';
import { createApp, type IntelligenceServices } from '../../src/server/app/create-app';
import { repositoryFixture, request, testConfig } from '../server/server-test-kit';

function services(): IntelligenceServices {
  return {
    computeCondition: (conditionId, rows, mode) => ({ conditionId, mode, decision: 'RECOMMEND', evidenceCount: rows.length, uncertainty: { explanation: 'base' } }),
    computeEvidence: (evidenceId) => evidenceId === 'ev-1' ? { evidence: { evidenceId }, mode: 'public' } : null,
    computeGates: () => ({ goNoGo: false, gates: { coverage: { status: 'insufficient-data' } } }),
    simulateInteraction: vi.fn((_a, _b, _warning, _sizeA, _sizeB, hours) => ({ hours, peakRiskScore: 1, timePoints: [] })),
    simulateTrajectory: vi.fn((_evidence, hours) => ({ hours, peakConcentration: 1, trajectoryPoints: [] })),
    optimizeDose: () => ({ recommendations: [{ estimatedEfficacy: 1 }], optimizedDoseIndex: 0 }),
  };
}

describe('six intelligence endpoint contracts', () => {
  it('returns condition intelligence with strict governance downgrade and fail-closed computation', async () => {
    const app = createApp({ config: testConfig, repositories: repositoryFixture().repositories, intelligence: services() });
    const response = await request(app, '/intelligence/condition/cond-1?mode=clinician&strictGates=true');
    await expect(response.json()).resolves.toMatchObject({ conditionId: 'cond-1', mode: 'clinician', decision: 'INSUFFICIENT_EVIDENCE', governance: { strictModeApplied: true, goNoGo: false } });
    const failing = services(); failing.computeCondition = () => { throw new Error('compute'); };
    const closed = await request(createApp({ config: testConfig, repositories: repositoryFixture().repositories, intelligence: failing, now: () => new Date('2026-09-30T07:00:00Z') }), '/intelligence/condition/cond-1');
    expect(closed.status).toBe(200);
    await expect(closed.json()).resolves.toMatchObject({ decision: 'INSUFFICIENT_EVIDENCE', evidenceCount: 0 });
  });

  it('returns evidence detail, 404, and governance gate report', async () => {
    const app = createApp({ config: testConfig, repositories: repositoryFixture().repositories, intelligence: services() });
    expect((await request(app, '/intelligence/evidence/ev-1')).status).toBe(200);
    expect((await request(app, '/intelligence/evidence/missing')).status).toBe(404);
    const gates = await request(app, '/intelligence/gates/cond-1');
    await expect(gates.json()).resolves.toMatchObject({ goNoGo: false, gates: { coverage: { status: 'insufficient-data' } } });
  });

  it('validates interaction pair and clamps interaction and trajectory hours', async () => {
    const intelligence = services();
    const app = createApp({ config: testConfig, repositories: repositoryFixture().repositories, intelligence });
    expect((await request(app, '/intelligence/interaction/cond-1')).status).toBe(400);
    const interaction = await request(app, '/intelligence/interaction/cond-1?interventionA=Metformin&interventionB=Other&hours=999');
    await expect(interaction.json()).resolves.toMatchObject({ conditionId: 'cond-1', timeline: { hours: 168 } });
    const trajectory = await request(app, '/intelligence/trajectory/ev-1?hours=1');
    await expect(trajectory.json()).resolves.toMatchObject({ evidenceId: 'ev-1', trajectory: { hours: 6 } });
    expect((await request(app, '/intelligence/trajectory/missing')).status).toBe(404);
  });

  it('returns dose optimization and 404 for unknown evidence', async () => {
    const app = createApp({ config: testConfig, repositories: repositoryFixture().repositories, intelligence: services() });
    const response = await request(app, '/intelligence/dose-optimizer/ev-1');
    await expect(response.json()).resolves.toMatchObject({ optimizedDoseIndex: 0 });
    expect((await request(app, '/intelligence/dose-optimizer/missing')).status).toBe(404);
  });
});