import { chromium } from 'playwright';

const baseUrl = process.env.SALUS_BASE_URL ?? 'http://127.0.0.1:5173';
const routes = [
  '/', '/scientific-audit', '/global-health-equity', '/cross-system-intelligence',
  '/ode-interaction-lab', '/clinical-workbench', '/ai-clinical-reasoning',
  '/architecture', '/calibration-governance', '/math', '/compare/cond-type2-diabetes',
  '/new', '/editor', '/auth/callback',
];
const viewports = [
  { name: 'mobile', width: 320, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
];

const browser = await chromium.launch({ headless: true });
const failures = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  let runtimeErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  for (const route of routes) {
    runtimeErrors = [];

    const response = await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main');
    const inspection = await page.evaluate(() => {
      const swatch = document.createElement('canvas');
      swatch.width = 1;
      swatch.height = 1;
      const swatchContext = swatch.getContext('2d', { willReadFrequently: true });
      const parseColor = (value) => {
        swatchContext.clearRect(0, 0, 1, 1);
        swatchContext.fillStyle = value;
        swatchContext.fillRect(0, 0, 1, 1);
        const [red, green, blue, alpha] = swatchContext.getImageData(0, 0, 1, 1).data;
        return [red, green, blue, alpha / 255];
      };
      const mix = (base, overlay) => {
        const alpha = overlay[3];
        return [
          overlay[0] * alpha + base[0] * (1 - alpha),
          overlay[1] * alpha + base[1] * (1 - alpha),
          overlay[2] * alpha + base[2] * (1 - alpha),
        ];
      };
      const luminance = ([red, green, blue]) => {
        const linear = [red, green, blue].map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      const contrast = (foreground, background) => {
        const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
        return (lighter + 0.05) / (darker + 0.05);
      };
      const background = (element) => {
        const layers = [];
        let hasGradient = false;
        for (let current = element; current; current = current.parentElement) {
          const style = getComputedStyle(current);
          hasGradient ||= style.backgroundImage !== 'none';
          const color = parseColor(style.backgroundColor);
          if (color && color[3] > 0) layers.unshift(color);
        }
        return { color: layers.reduce((result, layer) => mix(result, layer), [242, 246, 243]), hasGradient };
      };
      const directText = (element) => Array.from(element.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      );
      const candidates = [];
      for (const element of document.querySelectorAll('*')) {
        if (!directText(element) || !element.getClientRects().length) continue;
        const style = getComputedStyle(element);
        const foreground = parseColor(style.color);
        if (!foreground || foreground[3] === 0) continue;
        const backdrop = background(element);
        if (backdrop.hasGradient) continue;
        const ratio = contrast(foreground, backdrop.color);
        if (ratio < 4.5) {
          candidates.push({
            text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 90),
            className: element.className.toString().slice(0, 120),
            ratio: Number(ratio.toFixed(2)),
          });
        }
      }
      return {
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        contrastCandidates: candidates,
      };
    });

    if ((response && response.status() !== 200) || runtimeErrors.length || inspection.horizontalOverflow || inspection.contrastCandidates.length) {
      failures.push({ viewport: viewport.name, route, status: response?.status(), runtimeErrors, ...inspection });
    }
  }
  await page.close();
}

await browser.close();
if (failures.length) {
  const candidateCount = failures.reduce((total, failure) => total + failure.contrastCandidates.length, 0);
  console.error(`Visual QA found ${failures.length} route/viewport failures and ${candidateCount} contrast candidates.`);
  console.error(JSON.stringify(failures.slice(0, 12).map((failure) => ({
    ...failure,
    contrastCandidates: failure.contrastCandidates.slice(0, 8),
  })), null, 2));
  process.exitCode = 1;
} else {
  console.log(`Visual QA passed: ${routes.length} routes × ${viewports.length} viewports.`);
}
