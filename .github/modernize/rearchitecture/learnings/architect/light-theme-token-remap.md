# Light Theme Token Remap

SALUS preserves a light medical theme by remapping dark-named Tailwind tokens rather than by using semantically light utility names.

## What Happened

In SALUS Pramana task t2, components used classes such as `bg-slate-950` and `text-white`, while `src/index.css` remapped those tokens to light backgrounds and dark text.

## Takeaway

Preserve computed styles and the Tailwind 4 theme token map. Do not infer intended color from utility names or mechanically replace dark-named classes.

## History

- 2026-09-30 (salus-pramana-medical/t2): initial
