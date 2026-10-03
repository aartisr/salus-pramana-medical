import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const themePath = path.join(process.cwd(), 'src/index.css');

describe('central visual theme', () => {
  it('owns the semantic surface, text, accent, focus, and reduced-motion rules', async () => {
    const stylesheet = await readFile(themePath, 'utf8');

    for (const token of [
      '--color-slate-950',
      '--color-slate-900',
      '--color-slate-100',
      '--color-amber-400',
      '--color-indigo-400',
      '--color-emerald-400',
      '--color-rose-400',
    ]) {
      expect(stylesheet).toContain(token);
    }

    expect(stylesheet).toContain('color-scheme: light');
    expect(stylesheet).toContain('.theme-graph-dark');
    expect(stylesheet).toContain('.theme-workspace-dark');
    expect(stylesheet).toContain(':focus-visible');
    expect(stylesheet).toContain('prefers-reduced-motion: reduce');
    expect(stylesheet).toMatch(/\.text-white\s*\{\s*color:/);
  });
});
