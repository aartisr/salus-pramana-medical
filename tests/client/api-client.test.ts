import { describe, expect, it, vi } from 'vitest';
import { ApiError, evidenceQuery, requestJson } from '../../src/client/services/api-client';

describe('same-origin API client', () => {
  it('serializes the complete evidence filter contract', () => {
    expect(evidenceQuery({ conditionId: 'cond-1', includeDrafts: true, q: 'trial', limit: 10, cursor: '20' }))
      .toBe('?conditionId=cond-1&includeDrafts=true&q=trial&limit=10&cursor=20');
  });

  it('uses the shared /api boundary and preserves correlation errors', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(
      JSON.stringify({ error: 'Editor role required', correlationId: 'corr-7' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    ));

    await expect(requestJson('/conditions', {}, request)).rejects.toEqual(
      expect.objectContaining({ status: 403, endpoint: '/api/conditions', correlationId: 'corr-7' }),
    );
    expect(request).toHaveBeenCalledWith('/api/conditions', {});
  });
});