#!/usr/bin/env node
// Visual regression harness for anuragbuildsthings.com.
//
// Usage:
//   node scripts/visual-regression.mjs baseline   # capture baseline PNGs
//   node scripts/visual-regression.mjs diff       # capture current + pixel-diff vs baseline
//
// Assumes `quarto preview` is already serving the site on BASE_URL.
// Default matches the current `quarto preview` port; override via BASE_URL env var.
// Exit code 1 on any page exceeding FAIL_PIXEL_THRESHOLD diff pixels.

import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- config ----------
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:7110';

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'post', path: '/posts/augmentations-are-the-model.html' },
  { name: '404',  path: '/does-not-exist' },
  {
    name: 'palette',
    path: '/',
    // Open the command palette (⌘K) and type a query so we exercise:
    // overlay, input, scope tabs, post/section/action items, <em> highlights,
    // and the selected-row state. Capture viewport-only (palette is fixed-position).
    fullPage: false,
    setup: async (page) => {
      // palette.js wires ⌘K -> open. Use Meta on mac-like chromium.
      await page.keyboard.press('Meta+k');
      // Wait for the overlay to flip data-open=true
      await page.waitForSelector('#cmd-palette[data-open="true"]', { timeout: 5000 });
      // Give focus a tick, then type a query that should yield posts + sections.
      await page.waitForTimeout(100);
      await page.keyboard.type('learning', { delay: 10 });
      // Wait for the filter/render to settle
      await page.waitForTimeout(200);
    },
  },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'mobile',  width: 390,  height: 844 },
];

const PIXELMATCH_THRESHOLD = 0.1; // per-pixel color tolerance
const FAIL_PIXEL_THRESHOLD = 50;  // page-level fail limit (diff pixels)
const POST_NAV_WAIT_MS     = 500; // extra settle time after networkidle (fonts, palette, etc.)

// ---------- paths ----------
const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const BASELINE_DIR = path.join(REPO_ROOT, '.regression-baseline');
const DIFF_DIR     = path.join(REPO_ROOT, '.regression-diff');

// ---------- helpers ----------
function shotName(pageName, viewportName) {
  return `${pageName}-${viewportName}.png`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function captureAll(outDir) {
  await ensureDir(outDir);

  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
      // Belt-and-suspenders: emulate reduced-motion at media level too.
      // (newContext's reducedMotion already does this, but some sites key off
      // emulateMedia specifically.)
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: 'reduce' });

      for (const p of PAGES) {
        const url = BASE_URL.replace(/\/$/, '') + p.path;
        const outPath = path.join(outDir, shotName(p.name, vp.name));

        // 404 routes legitimately return a non-200; don't throw on that.
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        } catch (err) {
          // Some networkidle flaps — fall back to domcontentloaded.
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        }

        // Stop any CSS smooth-scroll animations and suppress the hero rotator.
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
              scroll-behavior: auto !important;
            }
          `,
        });

        // Wait a touch for fonts + palette-include scripts to settle.
        await page.waitForTimeout(POST_NAV_WAIT_MS);
        try {
          await page.evaluate(() => document.fonts && document.fonts.ready);
        } catch (_) { /* no-op */ }

        // Optional per-page setup (e.g., open the command palette).
        if (typeof p.setup === 'function') {
          await p.setup(page);
        }

        await page.screenshot({
          path: outPath,
          fullPage: p.fullPage !== false, // default true; palette uses false
          animations: 'disabled',
        });
        console.log(`  captured ${p.name}/${vp.name} -> ${path.relative(REPO_ROOT, outPath)}`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

async function loadPng(p) {
  const buf = await fs.readFile(p);
  return PNG.sync.read(buf);
}

async function diffOne(baselinePath, currentPath, diffPath) {
  let baseline, current;
  try {
    baseline = await loadPng(baselinePath);
  } catch (err) {
    return { error: `missing baseline: ${path.relative(REPO_ROOT, baselinePath)}` };
  }
  try {
    current = await loadPng(currentPath);
  } catch (err) {
    return { error: `missing current: ${path.relative(REPO_ROOT, currentPath)}` };
  }

  // Width must match (viewport is fixed); height can differ by a few px
  // on fullPage screenshots due to sub-pixel rounding. Crop both to min-height.
  if (baseline.width !== current.width) {
    await fs.writeFile(diffPath, PNG.sync.write(current));
    return {
      error: `width mismatch baseline ${baseline.width} vs current ${current.width}`,
      diffPixels: baseline.width * baseline.height,
      totalPixels: baseline.width * baseline.height,
    };
  }
  let heightNote = '';
  if (baseline.height !== current.height) {
    const delta = Math.abs(baseline.height - current.height);
    const maxAllowed = 8; // tolerate small fullPage height drift
    if (delta > maxAllowed) {
      await fs.writeFile(diffPath, PNG.sync.write(current));
      return {
        error: `height mismatch baseline ${baseline.height} vs current ${current.height} (delta ${delta}px > ${maxAllowed})`,
        diffPixels: baseline.width * Math.max(baseline.height, current.height),
        totalPixels: baseline.width * Math.max(baseline.height, current.height),
      };
    }
    // Crop both to min-height
    const minH = Math.min(baseline.height, current.height);
    heightNote = ` height-cropped baseline:${baseline.height}->cur:${current.height}->min:${minH}`;
    const cropPng = (src, h) => {
      const out = new PNG({ width: src.width, height: h });
      src.data.copy(out.data, 0, 0, src.width * h * 4);
      return out;
    };
    baseline = cropPng(baseline, minH);
    current  = cropPng(current, minH);
  }

  const { width, height } = baseline;
  const diffImg = new PNG({ width, height });
  const diffPixels = pixelmatch(
    baseline.data,
    current.data,
    diffImg.data,
    width,
    height,
    { threshold: PIXELMATCH_THRESHOLD }
  );

  if (diffPixels > 0) {
    await fs.writeFile(diffPath, PNG.sync.write(diffImg));
  }

  return { diffPixels, totalPixels: width * height, note: heightNote };
}

async function runBaseline() {
  console.log(`[baseline] capturing against ${BASE_URL}`);
  await captureAll(BASELINE_DIR);
  console.log(`[baseline] done. PNGs in ${path.relative(REPO_ROOT, BASELINE_DIR)}/`);
}

async function runDiff() {
  console.log(`[diff] capturing current against ${BASE_URL}`);
  const currentDir = path.join(DIFF_DIR, 'current');
  const diffOutDir = path.join(DIFF_DIR, 'diff');
  await ensureDir(currentDir);
  await ensureDir(diffOutDir);
  await captureAll(currentDir);

  const rows = [];
  let worstDiff = 0;

  for (const vp of VIEWPORTS) {
    for (const p of PAGES) {
      const name = shotName(p.name, vp.name);
      const basePath = path.join(BASELINE_DIR, name);
      const curPath  = path.join(currentDir, name);
      const diffPath = path.join(diffOutDir, name);
      const res = await diffOne(basePath, curPath, diffPath);
      if (res.error) {
        rows.push({
          page: p.name,
          viewport: vp.name,
          diffPixels: res.diffPixels ?? 'n/a',
          diffPct: 'n/a',
          note: res.error,
        });
        if (typeof res.diffPixels === 'number') worstDiff = Math.max(worstDiff, res.diffPixels);
        continue;
      }
      const pct = (res.diffPixels / res.totalPixels) * 100;
      const status = res.diffPixels > FAIL_PIXEL_THRESHOLD ? `FAIL (>${FAIL_PIXEL_THRESHOLD})` : 'ok';
      rows.push({
        page: p.name,
        viewport: vp.name,
        diffPixels: res.diffPixels,
        diffPct: pct.toFixed(4) + '%',
        note: status + (res.note || ''),
      });
      worstDiff = Math.max(worstDiff, res.diffPixels);
    }
  }

  // Summary table.
  console.log('');
  console.log('Visual regression summary');
  console.log('-------------------------');
  const pad = (s, n) => String(s).padEnd(n);
  console.log(
    pad('page', 8) + pad('viewport', 10) + pad('diff_px', 10) + pad('diff_pct', 12) + 'note'
  );
  for (const r of rows) {
    console.log(
      pad(r.page, 8) +
      pad(r.viewport, 10) +
      pad(r.diffPixels, 10) +
      pad(r.diffPct, 12) +
      r.note
    );
  }
  console.log('');
  console.log(`Diff images (if any) under ${path.relative(REPO_ROOT, diffOutDir)}/`);

  if (worstDiff > FAIL_PIXEL_THRESHOLD) {
    console.error(`\n[diff] FAIL: at least one page exceeded ${FAIL_PIXEL_THRESHOLD} diff pixels (worst=${worstDiff})`);
    process.exit(1);
  }
  console.log('[diff] PASS');
}

// ---------- entry ----------
const cmd = process.argv[2];
try {
  if (cmd === 'baseline') {
    await runBaseline();
  } else if (cmd === 'diff') {
    await runDiff();
  } else {
    console.error('Usage: node scripts/visual-regression.mjs <baseline|diff>');
    process.exit(2);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
