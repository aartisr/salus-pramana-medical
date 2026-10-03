import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const stylesheetPath = path.join(root, 'src/index.css');

function luminance(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255);
  if (!channels || channels.length !== 3) throw new Error(`Expected six-digit hex color, received ${hex}`);
  const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function token(stylesheet: string, name: string) {
  const match = stylesheet.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Missing ${name}`);
  return match[1];
}

describe('light-surface contrast contract', () => {
  it('keeps primary, muted, and information-bearing accent text readable on the canvas', async () => {
    const stylesheet = await readFile(stylesheetPath, 'utf8');
    const canvas = token(stylesheet, '--color-slate-950');

    expect(contrastRatio(token(stylesheet, '--color-slate-100'), canvas)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(token(stylesheet, '--color-slate-400'), canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(token(stylesheet, '--color-amber-700'), canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(token(stylesheet, '--color-indigo-400'), canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(token(stylesheet, '--color-emerald-400'), canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(token(stylesheet, '--color-cyan-400'), canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(token(stylesheet, '--color-rose-400'), canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(token(stylesheet, '--color-teal-400'), canvas)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps interactive control boundaries visible on raised surfaces', async () => {
    const stylesheet = await readFile(stylesheetPath, 'utf8');
    expect(contrastRatio(token(stylesheet, '--color-control-border'), token(stylesheet, '--color-slate-900'))).toBeGreaterThanOrEqual(3);
  });

  it('keeps inverse labels readable on the solid action colours', async () => {
    const stylesheet = await readFile(stylesheetPath, 'utf8');
    for (const name of ['--color-indigo-600', '--color-emerald-600', '--color-teal-600', '--color-teal-700', '--color-rose-500']) {
      expect(contrastRatio('#ffffff', token(stylesheet, name))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('contains the conventional light compatibility theme used by forms and editorial routes', async () => {
    const stylesheet = await readFile(stylesheetPath, 'utf8');
    expect(stylesheet).toContain('.theme-compat-light');
    expect(stylesheet).toContain('--color-teal-700: #0f766e');
  });

  it('keeps navigation badges readable when their parent tab is selected', async () => {
    const header = await readFile(path.join(root, 'src/components/Header.tsx'), 'utf8');
    expect(header).toContain("bg-slate-900/90 text-indigo-300");
    expect(header).not.toContain("bg-indigo-700/80 text-indigo-100");
  });

  it('does not use an uncontrolled transparent yellow gradient for essential headline values', async () => {
    const [home, audit] = await Promise.all([
      readFile(path.join(root, 'src/components/ResearchHomepage.tsx'), 'utf8'),
      readFile(path.join(root, 'src/components/NobelEvaluationSuite.tsx'), 'utf8'),
    ]);

    expect(home).toContain('heading-accent');
    expect(audit).toContain('heading-accent');
    expect(`${home}\n${audit}`).not.toContain('via-yellow-200');
  });
});
