// SoT Snapshot Freshness Checker
// Checks all extracted snapshots for staleness based on next_review date.
// Usage: node --experimental-strip-types scripts/check-snapshot-freshness.ts
//
// Statuses:
//   OK       — next_review is 7+ days away
//   WARNING  — next_review is within 7 days
//   STALE    — next_review has passed
//   MISSING  — EN visa JSON exists but no matching snapshot

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, basename, relative } from 'path';

const SOT_ROOT = join(process.cwd(), 'docs', 'SoT');
const DATA_ROOT = join(process.cwd(), 'data', 'visas');

interface SnapshotMeta {
  visa_type: string;
  country: string;
  next_review: string;
  freshness_tier: string;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fields: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0 && !line.startsWith('  ')) {
      fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return fields;
}

function collectFiles(dir: string, ext: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full, ext));
    } else if (entry.endsWith(ext)) {
      files.push(full);
    }
  }
  return files;
}

const COUNTRIES = ['Korea', 'Japan', 'Taiwan', 'China'];
const COUNTRY_MAP: Record<string, string> = {
  korea: 'Korea', japan: 'Japan', taiwan: 'Taiwan', china: 'China',
};

const now = new Date();
const warnThreshold = new Date(now);
warnThreshold.setDate(warnThreshold.getDate() + 7);

const snapshots = new Map<string, SnapshotMeta>();
let staleCount = 0;
let warnCount = 0;
let okCount = 0;
let missingCount = 0;

// Collect all snapshots
for (const country of COUNTRIES) {
  const extractedDir = join(SOT_ROOT, country, 'extracted');
  const files = collectFiles(extractedDir, '.md');
  for (const f of files) {
    const content = readFileSync(f, 'utf-8');
    const meta = parseFrontmatter(content);
    const key = `${country.toLowerCase()}/${basename(f, '.md')}`;
    snapshots.set(key, {
      visa_type: meta.visa_type || basename(f, '.md'),
      country: country.toLowerCase(),
      next_review: meta.next_review || '',
      freshness_tier: meta.freshness_tier || 'unknown',
    });
  }
}

// Collect EN visa JSONs and check against snapshots
const enVisas: string[] = [];
for (const [countryLower, countryDir] of Object.entries(COUNTRY_MAP)) {
  const enDir = join(DATA_ROOT, countryLower, 'en');
  if (!existsSync(enDir)) continue;
  for (const f of readdirSync(enDir).filter((e: string) => e.endsWith('.json'))) {
    enVisas.push(`${countryLower}/${basename(f, '.json')}`);
  }
}

const results: Array<{ status: string; key: string; detail: string }> = [];

for (const key of enVisas) {
  const snap = snapshots.get(key);

  if (!snap) {
    results.push({ status: 'MISSING', key, detail: 'no snapshot file' });
    missingCount++;
    continue;
  }

  if (!snap.next_review) {
    results.push({ status: 'STALE', key, detail: 'no next_review date in frontmatter' });
    staleCount++;
    continue;
  }

  const reviewDate = new Date(snap.next_review);

  if (reviewDate < now) {
    const daysAgo = Math.floor((now.getTime() - reviewDate.getTime()) / 86400000);
    results.push({ status: 'STALE', key, detail: `next_review ${snap.next_review} (${daysAgo} days ago)` });
    staleCount++;
  } else if (reviewDate < warnThreshold) {
    const daysLeft = Math.floor((reviewDate.getTime() - now.getTime()) / 86400000);
    results.push({ status: 'WARNING', key, detail: `next_review ${snap.next_review} (${daysLeft} days left)` });
    warnCount++;
  } else {
    results.push({ status: 'OK', key, detail: `next_review ${snap.next_review}` });
    okCount++;
  }
}

// Sort: STALE first, then WARNING, then MISSING, then OK
const order: Record<string, number> = { STALE: 0, WARNING: 1, MISSING: 2, OK: 3 };
results.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

const icons: Record<string, string> = {
  STALE: '❌', WARNING: '⚠️', OK: '✅', MISSING: '⏭️',
};

console.log('\n📋 SoT Snapshot Freshness Report\n');

for (const r of results) {
  console.log(`  ${icons[r.status]} ${r.status.padEnd(8)} ${r.key.padEnd(30)} ${r.detail}`);
}

console.log(`\n  Summary: ${okCount} OK, ${warnCount} WARNING, ${staleCount} STALE, ${missingCount} MISSING (${enVisas.length} total)\n`);

if (staleCount > 0) process.exit(1);
