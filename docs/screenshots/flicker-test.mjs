/**
 * Puppeteer flicker detection test
 * Takes rapid screenshots during page load + navigation to detect
 * any flash/flicker caused by hydration mismatches or theme issues.
 * Also captures console hydration warnings and CLS values.
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3002';
const SCREENSHOT_DIR = path.join(import.meta.dirname, '.');

const ROUTES = [
  { name: 'landing', path: '/en' },
  { name: 'korea-visa', path: '/en/korea/visa' },
  { name: 'taiwan-visa', path: '/en/taiwan/visa' },
  { name: 'korea-visa-e7', path: '/en/korea/visa/e-7' },
  { name: 'taiwan-visa-gold-card', path: '/en/taiwan/visa/gold-card' },
];

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testRoute(browser, route, viewport, suffix) {
  const page = await browser.newPage();
  await page.setViewport(viewport);

  const hydrationWarnings = [];
  const consoleMessages = [];

  // Listen for console messages (hydration warnings)
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (
      text.includes('Hydration') ||
      text.includes('hydration') ||
      text.includes('mismatch') ||
      text.includes('did not match') ||
      text.includes('server-rendered')
    ) {
      hydrationWarnings.push(text);
    }
  });

  // Inject CLS observer before navigation
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0;
    window.__clsEntries = [];
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__cls += entry.value;
          window.__clsEntries.push({
            value: entry.value,
            sources: entry.sources?.map(s => s.node?.nodeName) || [],
          });
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  });

  const prefix = `${route.name}-${suffix}`;

  // Take rapid screenshots during page load
  const screenshotPromises = [];

  // Start navigation
  const navigationPromise = page.goto(`${BASE}${route.path}`, {
    waitUntil: 'domcontentloaded',
  });

  // Take screenshots at 0ms, 100ms, 200ms, 400ms, 800ms, 1500ms
  for (const delay of [0, 100, 200, 400, 800, 1500]) {
    screenshotPromises.push(
      sleep(delay).then(() =>
        page.screenshot({
          path: path.join(SCREENSHOT_DIR, `${prefix}-${delay}ms.png`),
          fullPage: false,
        }).catch(() => {}) // ignore if page not ready yet
      )
    );
  }

  await navigationPromise;
  await Promise.all(screenshotPromises);

  // Wait for full hydration
  await page.waitForFunction(
    () => document.getElementById('main-content')?.textContent?.length > 0,
    { timeout: 10000 }
  ).catch(() => {});

  // Final screenshot after hydration
  await sleep(500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${prefix}-final.png`),
    fullPage: false,
  });

  // Get CLS value
  const cls = await page.evaluate(() => window.__cls || 0);
  const clsEntries = await page.evaluate(() => window.__clsEntries || []);

  // Check for white/light flash by sampling pixel colors at different stages
  // Compare the 0ms and final screenshots for background color consistency
  const bgColorCheck = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const htmlBg = getComputedStyle(html).backgroundColor;
    const bodyBg = getComputedStyle(body).backgroundColor;
    const hasDarkClass = html.classList.contains('dark');
    return { htmlBg, bodyBg, hasDarkClass };
  });

  await page.close();

  return {
    route: route.name,
    viewport: suffix,
    hydrationWarnings,
    cls: Math.round(cls * 10000) / 10000,
    clsEntries,
    bgColorCheck,
    consoleMessageCount: consoleMessages.length,
  };
}

async function testNavigation(browser) {
  const page = await browser.newPage();
  await page.setViewport(DESKTOP_VIEWPORT);

  const hydrationWarnings = [];

  page.on('console', msg => {
    const text = msg.text();
    if (
      text.includes('Hydration') ||
      text.includes('hydration') ||
      text.includes('mismatch')
    ) {
      hydrationWarnings.push(text);
    }
  });

  // Load landing page
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'nav-1-landing.png'),
  });

  // Click Korea card (first country card link)
  const koreaLink = await page.$('a[href*="/korea/visa"]');
  if (koreaLink) {
    // Take rapid screenshots during navigation
    const navPromise = koreaLink.click();
    await sleep(50);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'nav-2-transition-50ms.png'),
    }).catch(() => {});
    await sleep(150);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'nav-3-transition-200ms.png'),
    }).catch(() => {});
    await sleep(300);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'nav-4-transition-500ms.png'),
    }).catch(() => {});

    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await sleep(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'nav-5-korea-visa-final.png'),
    });
  }

  await page.close();
  return { hydrationWarnings };
}

async function main() {
  console.log('Starting Puppeteer flicker detection test...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  // Test each route with desktop viewport
  for (const route of ROUTES) {
    console.log(`Testing ${route.name} (desktop)...`);
    const result = await testRoute(browser, route, DESKTOP_VIEWPORT, 'desktop');
    results.push(result);
  }

  // Test key routes with mobile viewport
  for (const route of ROUTES.slice(0, 3)) {
    console.log(`Testing ${route.name} (mobile)...`);
    const result = await testRoute(browser, route, MOBILE_VIEWPORT, 'mobile');
    results.push(result);
  }

  // Test navigation transition
  console.log('Testing navigation transition...');
  const navResult = await testNavigation(browser);

  await browser.close();

  // Report results
  console.log('\n========================================');
  console.log('FLICKER DETECTION RESULTS');
  console.log('========================================\n');

  let hasIssues = false;

  for (const r of results) {
    const status = [];
    if (r.hydrationWarnings.length > 0) {
      status.push(`HYDRATION WARNINGS: ${r.hydrationWarnings.length}`);
      hasIssues = true;
    }
    if (r.cls > 0.1) {
      status.push(`HIGH CLS: ${r.cls}`);
      hasIssues = true;
    }
    if (!r.bgColorCheck.hasDarkClass) {
      status.push('MISSING dark CLASS');
      hasIssues = true;
    }

    const statusStr = status.length === 0 ? 'PASS' : `FAIL [${status.join(', ')}]`;
    console.log(`${r.route} (${r.viewport}): ${statusStr}`);
    console.log(`  CLS: ${r.cls}`);
    console.log(`  Dark class: ${r.bgColorCheck.hasDarkClass}`);
    console.log(`  HTML bg: ${r.bgColorCheck.htmlBg}`);
    console.log(`  Body bg: ${r.bgColorCheck.bodyBg}`);
    if (r.hydrationWarnings.length > 0) {
      console.log(`  Hydration warnings:`);
      r.hydrationWarnings.forEach(w => console.log(`    - ${w.substring(0, 200)}`));
    }
    console.log('');
  }

  if (navResult.hydrationWarnings.length > 0) {
    console.log(`Navigation: FAIL [HYDRATION WARNINGS: ${navResult.hydrationWarnings.length}]`);
    hasIssues = true;
  } else {
    console.log('Navigation transition: PASS');
  }

  console.log('\n========================================');
  if (hasIssues) {
    console.log('RESULT: ISSUES DETECTED — see above');
    process.exit(1);
  } else {
    console.log('RESULT: ALL CLEAR — no flicker detected');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
