// Visa Fact-Check: Diff EN visa JSONs against SoT snapshots
// Compares income, duration, fees, eligibility keywords, processing time
// Usage: node --experimental-strip-types scripts/visa-fact-check.ts [--country korea] [--type e-7]

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';
import { parseArgs } from 'node:util';

const SOT_ROOT = join(process.cwd(), 'docs', 'SoT');
const DATA_ROOT = join(process.cwd(), 'data', 'visas');

const COUNTRY_MAP: Record<string, string> = {
  korea: 'Korea',
  japan: 'Japan',
  taiwan: 'Taiwan',
  china: 'China',
};

// --- Helpers ---
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

/** Parse `## Section` headers and `- key: value` lines from snapshot body. */
function parseSections(content: string): Record<string, Record<string, string>> {
  // Strip frontmatter
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  const sections: Record<string, Record<string, string>> = {};
  let currentSection = '';
  for (const line of body.split('\n')) {
    const sectionMatch = line.match(/^## (.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      sections[currentSection] = {};
      continue;
    }
    if (currentSection) {
      const kvMatch = line.match(/^- ([^:]+):\s*(.*)/);
      if (kvMatch) {
        sections[currentSection][kvMatch[1].trim()] = kvMatch[2].trim().replace(/^"|"$/g, '');
      }
    }
  }
  return sections;
}

/** Normalize a numeric string: strip commas, currency symbols, spaces. */
function normalizeNumeric(val: string): number | null {
  const cleaned = val.replace(/[,\s₩$€£¥]/g, '').replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

const SKIP_PHRASES = ['not specified in source', 'not specified', 'n/a', 'none'];

function shouldSkip(val: string): boolean {
  if (val === '') return true;
  const lower = val.toLowerCase();
  return SKIP_PHRASES.some((p) => lower === p || lower.startsWith(p + ' ') || lower.startsWith(p + '('));
}

/** Case-insensitive substring containment check. Returns true if mismatch. */
function textMismatch(sotVal: string, jsonVal: string): boolean {
  const sot = sotVal.toLowerCase();
  const json = jsonVal.toLowerCase();
  return !sot.includes(json) && !json.includes(sot);
}

// --- Field extractors from JSON ---
function getJsonField(data: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = data;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[p];
  }
  if (cur == null) return '';
  if (typeof cur === 'boolean') return String(cur);
  return String(cur);
}

interface CheckResult {
  field: string;
  sotVal: string;
  jsonVal: string;
  status: 'MATCH' | 'MISMATCH' | 'SKIP';
}

function checkFields(
  sections: Record<string, Record<string, string>>,
  data: Record<string, unknown>
): CheckResult[] {
  const results: CheckResult[] = [];

  function check(
    field: string,
    sotVal: string,
    jsonVal: string,
    numeric: boolean
  ) {
    if (shouldSkip(sotVal) || jsonVal === '') {
      results.push({ field, sotVal, jsonVal, status: 'SKIP' });
      return;
    }
    let mismatch: boolean;
    if (numeric) {
      const sotN = normalizeNumeric(sotVal);
      const jsonN = normalizeNumeric(jsonVal);
      mismatch = sotN !== null && jsonN !== null && sotN !== jsonN;
    } else {
      mismatch = textMismatch(sotVal, jsonVal);
    }
    results.push({ field, sotVal, jsonVal, status: mismatch ? 'MISMATCH' : 'MATCH' });
  }

  // Income > amount
  const incomeAmt = sections['Income Requirement']?.['amount'] ?? '';
  check('income.amount', incomeAmt, getJsonField(data, 'incomeRequirement.amount'), true);

  // Income > currency
  const incomeCur = sections['Income Requirement']?.['currency'] ?? '';
  check('income.currency', incomeCur, getJsonField(data, 'incomeRequirement.currency'), false);

  // Duration > initial
  const durInitial = sections['Duration']?.['initial'] ?? '';
  check('duration.initial', durInitial, getJsonField(data, 'duration.initial'), false);

  // Duration > max_total
  const durMax = sections['Duration']?.['max_total'] ?? '';
  check('duration.max_total', durMax, getJsonField(data, 'duration.maxTotal'), false);

  // Fees > application
  const feeApp = sections['Fees']?.['application'] ?? '';
  check('fees.application', feeApp, getJsonField(data, 'fees.application'), false);

  // Eligibility > employer_sponsorship
  const sotSponsor = sections['Eligibility']?.['employer_sponsorship'] ?? '';
  if (!shouldSkip(sotSponsor)) {
    const eligibility = (data['eligibility'] as Array<{ id: string }> | undefined) ?? [];
    const hasEmployer = eligibility.some(
      (e) => e.id.includes('employer') || e.id.includes('sponsorship')
    );
    const jsonVal = hasEmployer ? 'required' : 'not_required';
    check('eligibility.employer_sponsorship', sotSponsor, jsonVal, false);
  } else {
    results.push({ field: 'eligibility.employer_sponsorship', sotVal: sotSponsor, jsonVal: '', status: 'SKIP' });
  }

  // Eligibility > family_allowed
  const sotFamily = sections['Key Policy Details']?.['family_allowed'] ?? '';
  if (!shouldSkip(sotFamily)) {
    const jsonVal = getJsonField(data, 'familyAllowed');
    check('eligibility.family_allowed', sotFamily, jsonVal, false);
  } else {
    results.push({ field: 'eligibility.family_allowed', sotVal: sotFamily, jsonVal: '', status: 'SKIP' });
  }

  // Key Policy > work_permission
  const sotWork = sections['Key Policy Details']?.['work_permission'] ?? '';
  const jsonWorkPerm = getJsonField(data, 'workPermission.type')
    || getJsonField(data, 'workPermission.allowed')
    || getJsonField(data, 'workPermission.description')
    || '';
  check('key_policy.work_permission', sotWork, jsonWorkPerm, false);

  return results;
}

// --- Main ---
const { values: { country: filterCountry, type: filterType, verbose } } = parseArgs({
  options: {
    country: { type: 'string' },
    type:    { type: 'string' },
    verbose: { type: 'boolean', default: false },
  },
  strict: false,
});

interface RunResult {
  status: 'OK' | 'MISMATCH' | 'STALE' | 'SKIP';
  key: string;
  detail: string;
  checks?: CheckResult[];
}

const results: RunResult[] = [];
let hasMismatch = false;

const countries = typeof filterCountry === 'string'
  ? [filterCountry.toLowerCase()]
  : Object.keys(COUNTRY_MAP);

for (const country of countries) {
  const countryDir = COUNTRY_MAP[country];
  if (!countryDir) {
    console.error(`Unknown country: ${country}`);
    process.exit(1);
  }

  const enDir = join(DATA_ROOT, country, 'en');
  if (!existsSync(enDir)) continue;

  const jsonFiles = readdirSync(enDir)
    .filter((f: string) => f.endsWith('.json'))
    .map((f: string) => basename(f, '.json'));

  const visaTypes = filterType ? [filterType] : jsonFiles;

  for (const visaType of visaTypes) {
    const jsonPath = join(enDir, `${visaType}.json`);
    if (!existsSync(jsonPath)) {
      results.push({ status: 'SKIP', key: `${country}/${visaType}`, detail: 'no JSON file' });
      continue;
    }

    const snapshotPath = join(SOT_ROOT, countryDir, 'extracted', `${visaType}.md`);
    if (!existsSync(snapshotPath)) {
      results.push({ status: 'SKIP', key: `${country}/${visaType}`, detail: 'no snapshot file' });
      continue;
    }

    const snapshotContent = readFileSync(snapshotPath, 'utf-8');
    const frontmatter = parseFrontmatter(snapshotContent);
    const sections = parseSections(snapshotContent);
    const data = JSON.parse(readFileSync(jsonPath, 'utf-8')) as Record<string, unknown>;

    // Staleness check
    const nextReview = frontmatter['next_review'] ?? '';
    if (nextReview) {
      const reviewDate = new Date(nextReview);
      const now = new Date();
      if (reviewDate < now) {
        const daysAgo = Math.floor((now.getTime() - reviewDate.getTime()) / 86400000);
        results.push({
          status: 'STALE',
          key: `${country}/${visaType}`,
          detail: `next_review ${nextReview} (${daysAgo} days ago)`,
        });
        hasMismatch = true;
        continue;
      }
    }

    const checks = checkFields(sections, data);
    const mismatches = checks.filter((c) => c.status === 'MISMATCH');
    const matches = checks.filter((c) => c.status === 'MATCH');

    if (mismatches.length > 0) {
      hasMismatch = true;
      results.push({
        status: 'MISMATCH',
        key: `${country}/${visaType}`,
        detail: mismatches.map((c) => `${c.field} JSON="${c.jsonVal}" SoT="${c.sotVal}"`).join(' | '),
        checks,
      });
    } else {
      results.push({
        status: 'OK',
        key: `${country}/${visaType}`,
        detail: `(${matches.length}/${checks.length} fields match)`,
        checks,
      });
    }
  }
}

// --- Output ---
const icons: Record<string, string> = { OK: '✅', MISMATCH: '❌', STALE: '⚠️', SKIP: '⏭️' };
const labels: Record<string, string> = { OK: 'OK     ', MISMATCH: 'MISMATCH', STALE: 'STALE  ', SKIP: 'SKIP   ' };

for (const r of results) {
  if (r.status === 'MISMATCH') {
    for (const c of r.checks ?? []) {
      if (c.status === 'MISMATCH') {
        console.log(`${icons.MISMATCH} MISMATCH ${r.key}: ${c.field} JSON="${c.jsonVal}" SoT="${c.sotVal}"`);
      }
    }
  } else {
    console.log(`${icons[r.status]} ${labels[r.status]} ${r.key} ${r.detail}`);
  }

  if (verbose && r.checks) {
    for (const c of r.checks) {
      if (c.status === 'MATCH') {
        console.log(`         ✓ ${c.field}: "${c.jsonVal}"`);
      } else if (c.status === 'SKIP') {
        console.log(`         - ${c.field}: skipped (SoT="${c.sotVal}")`);
      }
    }
  }
}

const okCount      = results.filter((r) => r.status === 'OK').length;
const mismatchCount = results.filter((r) => r.status === 'MISMATCH').length;
const staleCount   = results.filter((r) => r.status === 'STALE').length;
const skipCount    = results.filter((r) => r.status === 'SKIP').length;

console.log(`\nSummary: ${okCount} OK, ${mismatchCount} MISMATCH, ${staleCount} STALE, ${skipCount} SKIP (${results.length} total)`);

if (hasMismatch) process.exit(1);
