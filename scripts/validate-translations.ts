// Translation Array Structure Validator
// For each EN visa JSON, finds corresponding JA/ZH-CN translations and
// recursively compares array lengths at every JSON path.
// Usage: tsx scripts/validate-translations.ts

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const DATA_ROOT = join(process.cwd(), 'data', 'visas');
const LOCALES = ['ja', 'zh-cn'];

// Fields where array length differences are acceptable
const SKIP_FIELDS = new Set(['tags', 'relatedVisas']);

interface Mismatch {
  file: string;
  jsonPath: string;
  enLength: number;
  translatedLength: number;
}

function collectArrayMismatches(
  enValue: unknown,
  translatedValue: unknown,
  path: string,
  mismatches: Mismatch[],
  file: string
): void {
  const fieldName = path.split('.').pop() ?? '';
  if (SKIP_FIELDS.has(fieldName)) return;

  if (Array.isArray(enValue)) {
    if (!Array.isArray(translatedValue)) {
      // Type mismatch — not the same issue but worth noting as a mismatch
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
    // Recurse into array elements (compare pairwise up to shorter length)
    const len = Math.min(enValue.length, translatedValue.length);
    for (let i = 0; i < len; i++) {
      collectArrayMismatches(enValue[i], translatedValue[i], `${path}[${i}]`, mismatches, file);
    }
  } else if (enValue !== null && typeof enValue === 'object') {
    if (translatedValue === null || typeof translatedValue !== 'object' || Array.isArray(translatedValue)) {
      return;
    }
    const enObj = enValue as Record<string, unknown>;
    const trObj = translatedValue as Record<string, unknown>;
    for (const key of Object.keys(enObj)) {
      if (key in trObj) {
        collectArrayMismatches(enObj[key], trObj[key], path ? `${path}.${key}` : key, mismatches, file);
      }
    }
  }
}

function validateTranslations(): boolean {
  const warnings: string[] = [];
  const mismatches: Mismatch[] = [];

  const countries = readdirSync(DATA_ROOT).filter((entry) => {
    try {
      return readdirSync(join(DATA_ROOT, entry)) && true;
    } catch {
      return false;
    }
  });

  let enFilesChecked = 0;
  let translationFilesChecked = 0;

  for (const country of countries) {
    const enDir = join(DATA_ROOT, country, 'en');
    if (!existsSync(enDir)) continue;

    const enFiles = readdirSync(enDir).filter((f) => f.endsWith('.json'));

    for (const filename of enFiles) {
      const enPath = join(enDir, filename);
      const enRel = relative(process.cwd(), enPath);

      let enData: unknown;
      try {
        enData = JSON.parse(readFileSync(enPath, 'utf-8'));
      } catch (e) {
        warnings.push(`${enRel}: Could not parse EN JSON — ${(e as Error).message}`);
        continue;
      }

      enFilesChecked++;

      for (const locale of LOCALES) {
        const translatedPath = join(DATA_ROOT, country, locale, filename);
        const translatedRel = relative(process.cwd(), translatedPath);

        if (!existsSync(translatedPath)) {
          warnings.push(`MISSING: ${translatedRel} (no translation for ${locale})`);
          continue;
        }

        let translatedData: unknown;
        try {
          translatedData = JSON.parse(readFileSync(translatedPath, 'utf-8'));
        } catch (e) {
          warnings.push(`${translatedRel}: Could not parse JSON — ${(e as Error).message}`);
          continue;
        }

        translationFilesChecked++;
        collectArrayMismatches(enData, translatedData, '', mismatches, translatedRel);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠ Warnings:\n');
    for (const w of warnings) {
      console.warn(`  • ${w}`);
    }
  }

  if (mismatches.length > 0) {
    console.error('\n❌ Translation array structure mismatches:\n');
    for (const m of mismatches) {
      const lengthStr = m.translatedLength === -1
        ? `EN=array(${m.enLength}), translated=non-array`
        : `EN length=${m.enLength}, translated length=${m.translatedLength}`;
      console.error(`  • ${m.file}`);
      console.error(`    path: ${m.jsonPath || '(root)'} — ${lengthStr}`);
    }
    console.error(
      `\n${mismatches.length} mismatch(es) across ${translationFilesChecked} translation file(s) (${enFilesChecked} EN source files).\n`
    );
    return false;
  }

  console.log(
    `✓ All ${translationFilesChecked} translation file(s) match EN array structure (${enFilesChecked} EN source files checked).`
  );
  return true;
}

const ok = validateTranslations();
if (!ok) process.exit(1);
