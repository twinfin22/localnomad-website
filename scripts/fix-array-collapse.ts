// Hybrid Array Collapse Fixer
// Fixes translated visa JSON files where forward translators joined array elements
// using the delimiter 「,\s*」 (e.g. 「,\n    」, 「, 」).
//
// Usage:
//   tsx scripts/fix-array-collapse.ts [--dry-run]
//   node --experimental-strip-types scripts/fix-array-collapse.ts [--dry-run]

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

const DATA_ROOT = join(process.cwd(), 'data', 'visas');
const LOCALES = ['ja', 'zh-cn'];
const DRY_RUN = process.argv.includes('--dry-run');

// Fields where array length differences are acceptable (matches validate-translations.ts)
const SKIP_FIELDS = new Set(['tags', 'relatedVisas']);

// The collapse delimiter: 「 followed by comma + optional whitespace + 」
// NOTE: bare 「」 (without comma) are content quotation marks — NOT delimiters.
const COLLAPSE_DELIM = /「,\s*」/;

interface Mismatch {
  file: string;
  jsonPath: string;
  enLength: number;
  translatedLength: number;
}

interface SkippedItem {
  file: string;
  jsonPath: string;
  enLength: number;
  splitCount: number;
  reason: string;
}

// Navigate a JSON object by dot/bracket path and return parent + key
function navigatePath(obj: unknown, path: string): { parent: Record<string, unknown>; key: string } | null {
  // Parse path like "subCategories[0].keyRequirements" or "targetAudience"
  const tokens = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);

  let current: unknown = obj;
  for (let i = 0; i < tokens.length - 1; i++) {
    if (current === null || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[tokens[i]];
  }
  if (current === null || typeof current !== 'object') return null;
  return { parent: current as Record<string, unknown>, key: tokens[tokens.length - 1] };
}

// Collect mismatches the same way validate-translations.ts does
function collectMismatches(
  enValue: unknown,
  translatedValue: unknown,
  path: string,
  mismatches: Mismatch[],
  file: string
): void {
  const fieldName = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? '';
  if (SKIP_FIELDS.has(fieldName)) return;

  if (Array.isArray(enValue)) {
    if (!Array.isArray(translatedValue)) {
      mismatches.push({ file, jsonPath: path, enLength: enValue.length, translatedLength: -1 });
      return;
    }
    if (enValue.length !== translatedValue.length) {
      mismatches.push({
        file,
        jsonPath: path,
        enLength: enValue.length,
        translatedLength: translatedValue.length,
      });
    }
    const len = Math.min(enValue.length, translatedValue.length);
    for (let i = 0; i < len; i++) {
      collectMismatches(enValue[i], translatedValue[i], `${path}[${i}]`, mismatches, file);
    }
  } else if (enValue !== null && typeof enValue === 'object') {
    if (translatedValue === null || typeof translatedValue !== 'object' || Array.isArray(translatedValue)) {
      return;
    }
    const enObj = enValue as Record<string, unknown>;
    const trObj = translatedValue as Record<string, unknown>;
    for (const key of Object.keys(enObj)) {
      if (key in trObj) {
        collectMismatches(enObj[key], trObj[key], path ? `${path}.${key}` : key, mismatches, file);
      }
    }
  }
}

// Attempt to fix a single array mismatch by splitting collapsed strings.
// Returns the fixed array on success, null if the split doesn't produce the right count.
function attemptSplit(
  enArray: unknown[],
  trArray: unknown[]
): unknown[] | null {
  // Strategy: split every string item in trArray on COLLAPSE_DELIM, flatten, and check count.
  const expanded: unknown[] = [];
  for (const item of trArray) {
    if (typeof item === 'string') {
      const parts = item.split(COLLAPSE_DELIM);
      expanded.push(...parts);
    } else {
      expanded.push(item);
    }
  }
  if (expanded.length === enArray.length) return expanded;
  return null;
}

// Sanity-check split results: each piece must be non-empty.
// If EN item is > 3 chars, the split piece should also be > 2 chars.
function passesSanityCheck(enArray: unknown[], splitArray: unknown[]): boolean {
  for (let i = 0; i < splitArray.length; i++) {
    const piece = splitArray[i];
    if (typeof piece !== 'string') continue;
    if (piece.trim().length === 0) return false;
    const enItem = enArray[i];
    if (typeof enItem === 'string' && enItem.length > 3 && piece.trim().length < 2) {
      return false;
    }
  }
  return true;
}

function fixArrayCollapse(): void {
  const skipped: SkippedItem[] = [];
  let totalMismatches = 0;
  let fixedCount = 0;
  let skippedCount = 0;

  const countries = readdirSync(DATA_ROOT).filter((entry) => {
    try {
      readdirSync(join(DATA_ROOT, entry));
      return true;
    } catch {
      return false;
    }
  });

  for (const country of countries) {
    const enDir = join(DATA_ROOT, country, 'en');
    if (!existsSync(enDir)) continue;

    const enFiles = readdirSync(enDir).filter((f) => f.endsWith('.json'));

    for (const filename of enFiles) {
      const enPath = join(enDir, filename);

      let enData: unknown;
      try {
        enData = JSON.parse(readFileSync(enPath, 'utf-8'));
      } catch {
        continue;
      }

      for (const locale of LOCALES) {
        const translatedPath = join(DATA_ROOT, country, locale, filename);
        const translatedRel = relative(process.cwd(), translatedPath);

        if (!existsSync(translatedPath)) continue;

        let translatedData: unknown;
        try {
          translatedData = JSON.parse(readFileSync(translatedPath, 'utf-8'));
        } catch {
          continue;
        }

        // Collect all mismatches for this file pair
        const mismatches: Mismatch[] = [];
        collectMismatches(enData, translatedData, '', mismatches, translatedRel);

        if (mismatches.length === 0) continue;
        totalMismatches += mismatches.length;

        let fileModified = false;

        for (const mismatch of mismatches) {
          if (mismatch.translatedLength === -1) {
            // type mismatch (not array) — skip
            skippedCount++;
            skipped.push({
              file: mismatch.file,
              jsonPath: mismatch.jsonPath,
              enLength: mismatch.enLength,
              splitCount: -1,
              reason: 'translated value is not an array',
            });
            continue;
          }

          // Navigate to the array in translated data
          const nav = navigatePath(translatedData, mismatch.jsonPath);
          const navEn = navigatePath(enData, mismatch.jsonPath);
          if (!nav || !navEn) {
            skippedCount++;
            skipped.push({
              file: mismatch.file,
              jsonPath: mismatch.jsonPath,
              enLength: mismatch.enLength,
              splitCount: -1,
              reason: 'could not navigate to path in JSON',
            });
            continue;
          }

          const trArray = nav.parent[nav.key];
          const enArray = navEn.parent[navEn.key];

          if (!Array.isArray(trArray) || !Array.isArray(enArray)) {
            skippedCount++;
            skipped.push({
              file: mismatch.file,
              jsonPath: mismatch.jsonPath,
              enLength: mismatch.enLength,
              splitCount: -1,
              reason: 'path does not resolve to an array',
            });
            continue;
          }

          // Step 1: try split
          const splitResult = attemptSplit(enArray, trArray);
          if (!splitResult) {
            const flatCount = trArray.flatMap((item) =>
              typeof item === 'string' ? item.split(COLLAPSE_DELIM) : [item]
            ).length;
            skippedCount++;
            skipped.push({
              file: mismatch.file,
              jsonPath: mismatch.jsonPath,
              enLength: mismatch.enLength,
              splitCount: flatCount,
              reason: `split produced ${flatCount} items, expected ${enArray.length}`,
            });
            continue;
          }

          // Step 2: sanity check
          if (!passesSanityCheck(enArray, splitResult)) {
            skippedCount++;
            skipped.push({
              file: mismatch.file,
              jsonPath: mismatch.jsonPath,
              enLength: mismatch.enLength,
              splitCount: splitResult.length,
              reason: 'sanity check failed (empty or suspiciously short pieces)',
            });
            continue;
          }

          // Step 3: apply fix
          if (DRY_RUN) {
            console.log(`[DRY-RUN] Would fix: ${mismatch.file} @ ${mismatch.jsonPath || '(root)'}`);
            console.log(`  Before (${trArray.length} items): ${JSON.stringify(trArray).slice(0, 100)}...`);
            console.log(`  After  (${splitResult.length} items): ${JSON.stringify(splitResult).slice(0, 100)}...`);
          } else {
            nav.parent[nav.key] = splitResult;
            fileModified = true;
          }
          fixedCount++;
        }

        // Write file back if modified
        if (fileModified && !DRY_RUN) {
          writeFileSync(translatedPath, JSON.stringify(translatedData, null, 2) + '\n', 'utf-8');
          console.log(`✓ Fixed: ${translatedRel}`);
        }
      }
    }
  }

  // Step 4: Report
  console.log('\n' + '─'.repeat(60));
  if (DRY_RUN) {
    console.log('DRY-RUN complete — no files were written.');
  }
  console.log(`Total mismatches processed : ${totalMismatches}`);
  console.log(`Fixed by split             : ${fixedCount}`);
  console.log(`Skipped (needs re-translate): ${skippedCount}`);

  if (skipped.length > 0) {
    console.log('\nSkipped items:');
    for (const s of skipped) {
      console.log(`  • ${s.file}`);
      console.log(`    path: ${s.jsonPath || '(root)'} — EN=${s.enLength}, split=${s.splitCount}`);
      console.log(`    reason: ${s.reason}`);
    }
  }

  if (!DRY_RUN && fixedCount > 0) {
    // Re-run validation to confirm fixes
    console.log('\nRe-running validation to confirm fixes...');
    try {
      execSync('node --experimental-strip-types scripts/validate-translations.ts', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch {
      console.error('\nValidation still reports errors — manual review required for skipped items.');
      process.exit(1);
    }
  }
}

fixArrayCollapse();
