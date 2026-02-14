/**
 * Hydration flicker verification script.
 *
 * Takes screenshots at fixed intervals after DOMContentLoaded for three pages.
 * Goal: verify that #main-content has visible content at every interval —
 * no blank/white flash during hydration.
 *
 * The 0ms delay means "screenshot immediately after DOMContentLoaded" —
 * this is the earliest point at which SSR content should be visible.
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = __dirname; // docs/screenshots/

const BASE = 'http://localhost:3002';

const PAGES = [
  { name: 'landing',     url: `${BASE}/en` },
  { name: 'korea-visa',  url: `${BASE}/en/korea/visa` },
  { name: 'taiwan-visa', url: `${BASE}/en/taiwan/visa` },
];

const DELAYS = [0, 100, 400, 1500];

async function capturePageAtIntervals(browser, page, delays) {
  const results = [];

  for (const delay of delays) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1280, height: 800 });

    // Navigate and wait for DOMContentLoaded (SSR HTML is parsed)
    await tab.goto(page.url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait the extra delay after DOMContentLoaded
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }

    const filePath = join(SCREENSHOT_DIR, `hydration-fix-${page.name}-${delay}ms.png`);
    await tab.screenshot({ path: filePath, fullPage: false });

    // Check if #main-content has text content
    let contentLength = 0;
    try {
      contentLength = await tab.evaluate(() => {
        const el = document.querySelector('#main-content');
        return el ? el.innerText.trim().length : 0;
      });
    } catch {
      contentLength = -1; // page not ready
    }

    // Also check for white background (hydration flicker indicator)
    let bgColor = '';
    try {
      bgColor = await tab.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
    } catch {
      bgColor = 'unknown';
    }

    const hasContent = contentLength > 0;
    const isWhite = bgColor === 'rgb(255, 255, 255)' || bgColor === 'rgba(0, 0, 0, 0)';
    const status = hasContent && !isWhite ? 'PASS' : !hasContent ? 'NO_CONTENT' : 'WHITE_BG';

    results.push({ delay, filePath, contentLength, bgColor, status });

    console.log(
      `  ${status.padEnd(11)} ${page.name} @ ${String(delay).padStart(5)}ms → ` +
      `content=${contentLength}, bg=${bgColor}`
    );

    await tab.close();
  }

  return results;
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  console.log('Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const allResults = [];

  for (const page of PAGES) {
    console.log(`\n=== ${page.name} (${page.url}) ===`);
    const results = await capturePageAtIntervals(browser, page, DELAYS);
    allResults.push({ page: page.name, results });
  }

  await browser.close();

  // Summary
  console.log('\n\n========== SUMMARY ==========');
  let hasFailure = false;
  for (const { page, results } of allResults) {
    for (const r of results) {
      if (r.status !== 'PASS') {
        hasFailure = true;
        console.log(`  WARN  ${page} @ ${r.delay}ms — ${r.status} (content=${r.contentLength}, bg=${r.bgColor})`);
      }
    }
  }

  if (!hasFailure) {
    console.log('  ALL PASS — No hydration flicker detected. Content visible at every interval.');
    console.log('  Background color is dark at all checkpoints (no white flash).');
  } else {
    console.log('\n  Some checkpoints had issues. Review screenshots for visual confirmation.');
  }

  console.log('\nScreenshots saved to:', SCREENSHOT_DIR);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
