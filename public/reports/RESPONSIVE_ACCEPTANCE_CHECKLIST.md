# Responsive Acceptance Checklist

Updated: 2026-07-04

Purpose:

- Validate SALUS UI fidelity and usability across phone, tablet, and desktop.
- Detect overflow, clipped controls, unreadable text, and keyboard-occlusion
  issues early.

## Test Matrix

Use these viewport presets in DevTools:

- 320 x 568 (small phone baseline)
- 360 x 800 (modern Android)
- 390 x 844 (iPhone 12/13/14)
- 768 x 1024 (tablet portrait)
- 1024 x 768 (tablet landscape)
- 1280 x 800 (desktop baseline)

Routes to test:

- /
- /new
- /compare/cond-type2-diabetes

## Global Pass Criteria

1. No horizontal page scroll on any route.
2. All interactive controls are reachable and not visually clipped.
3. Text remains readable without zoom at all listed widths.
4. Touch targets are comfortably tappable (target minimum 40px visual height).
5. No essential action is hidden behind browser chrome or safe-area insets.

## Route-Level Checklist

### Dashboard (/)

1. Header nav wraps cleanly on 320 width.
2. Condition, goal, and persona controls fit without overlap.
3. Instant Answer banner text wraps without truncation.
4. Top intervention cards stack cleanly and remain readable.
5. Benefit vs Safety chart remains legible:

- Points visible
- Tooltip visible
- Compact list visible on small viewport

1. Advanced table toggle is usable and not clipped.
2. If advanced table is opened, horizontal scroll stays inside table container
   only.

### New Evidence (/new)

1. Form inputs do not trigger horizontal overflow.
2. On mobile keyboard open, sticky action bar remains visible.
3. Submit button remains reachable without awkward scrolling.
4. Form message state does not overlap controls.

### Comparison (/compare/:conditionId)

1. System columns collapse to one-column layout on mobile.
2. Grade badges remain visible and aligned.
3. Source links do not overflow container bounds.

## Orientation Checks

Run on 390 x 844:

1. Portrait: verify all above criteria.
2. Landscape: verify nav wrapping, chart readability, and no clipped action
   buttons.

## Accessibility Spot Checks

1. Keyboard tab reaches all key controls on each route.
2. Focus ring remains visible on buttons/selects/links.
3. Contrast for warning and risk labels remains readable.

## Screenshot Capture Guidance

Capture before/after (or baseline/current) screenshots for audit trail.

Naming convention:

- responsive-<route>-<viewport>-<orientation>-<state>.png

Examples:

- responsive-dashboard-320x568-portrait-default.png
- responsive-dashboard-320x568-portrait-advanced-table-open.png
- responsive-new-390x844-portrait-keyboard-open.png
- responsive-compare-360x800-portrait.png

Recommended capture set:

1. Dashboard at 320 x 568 (default)
2. Dashboard at 320 x 568 (advanced table open)
3. New Evidence at 390 x 844 (keyboard open while editing summary)
4. Comparison at 360 x 800
5. Dashboard at 1280 x 800 (reference desktop)

## Regression Gate

Ship only if all below are true:

1. No horizontal page overflow at 320 width.
2. No blocked primary action on /new while keyboard is open.
3. No chart content overlap or unreadable labels at 320 and 360 widths.
4. Lint, test, and build are green.
