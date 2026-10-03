import { describe, expect, it } from 'vitest';
import { mathReportLinks } from '../../src/client/features/math/MathCompatibilityPage';

describe('math compatibility corpus', () => {
  it('links formal math, architecture, validation, and machine-readable context', () => {
    expect(mathReportLinks.length).toBeGreaterThanOrEqual(8);
    expect(mathReportLinks.some(([label]) => label.includes('Calculus'))).toBe(true);
    expect(mathReportLinks.some(([label]) => label.includes('Validation'))).toBe(true);
    expect(mathReportLinks.some(([, href]) => href === '/llms-full.txt')).toBe(true);
  });
});