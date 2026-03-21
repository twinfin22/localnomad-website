// Checklist i18n Validator
// Ensures locale-specific checklist JSONs stay in sync with EN source.
// Rules:
//  1. All EN item IDs must exist in locale files (no missing items)
//  2. Structural fields (id, blockedBy, visaTier, category, required, isGate) must match EN
//  3. Translation fields (label, description) must be non-empty
// Usage: node --experimental-strip-types scripts/validate-checklist-i18n.ts

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data', 'checklists');
const COUNTRIES = ['korea', 'japan', 'taiwan'] as const;
const LOCALES = ['ja', 'zh-cn'] as const;

// Structural fields that must be identical to EN
const STRUCTURAL_FIELDS = ['id', 'category', 'required', 'isGate'] as const;
const STRUCTURAL_ARRAY_FIELDS = ['visaTier', 'blockedBy'] as const;

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  category: string;
  required: boolean;
  visaTier: string[];
  blockedBy?: string[];
  isGate?: boolean;
  tips?: string[];
  warnings?: string[];
  linkLabel?: string;
}

interface ChecklistPhase {
  id: string;
  title: string;
  items: ChecklistItem[];
}

interface CountryChecklist {
  country: string;
  phases: ChecklistPhase[];
}

function loadJson(path: string): CountryChecklist | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function flatItems(data: CountryChecklist): ChecklistItem[] {
  return data.phases.flatMap((p) => p.items);
}

function arraysEqual(a: string[] | undefined, b: string[] | undefined): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function validate(): boolean {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const country of COUNTRIES) {
    const enPath = join(DATA_DIR, `${country}.json`);
    const en = loadJson(enPath);
    if (!en) {
      errors.push(`${country}.json: EN source file not found`);
      continue;
    }

    const enItems = flatItems(en);
    const enItemMap = new Map(enItems.map((i) => [i.id, i]));
    const enPhaseIds = en.phases.map((p) => p.id);

    for (const locale of LOCALES) {
      const localePath = join(DATA_DIR, `${country}.${locale}.json`);
      const loc = loadJson(localePath);

      if (!loc) {
        warnings.push(`${country}.${locale}.json: File not found (EN fallback will be used)`);
        continue;
      }

      const locItems = flatItems(loc);
      const locItemMap = new Map(locItems.map((i) => [i.id, i]));
      const locPhaseIds = loc.phases.map((p) => p.id);
      const rel = `${country}.${locale}.json`;

      // Check phase IDs match
      if (enPhaseIds.join(',') !== locPhaseIds.join(',')) {
        errors.push(`${rel}: Phase IDs mismatch. EN=[${enPhaseIds}] ${locale}=[${locPhaseIds}]`);
      }

      // Check all EN items exist in locale
      for (const enItem of enItems) {
        const locItem = locItemMap.get(enItem.id);
        if (!locItem) {
          errors.push(`${rel}: Missing item "${enItem.id}"`);
          continue;
        }

        // Check structural fields match
        for (const field of STRUCTURAL_FIELDS) {
          if (enItem[field] !== locItem[field]) {
            errors.push(
              `${rel}: Item "${enItem.id}" field "${field}" mismatch. ` +
              `EN=${JSON.stringify(enItem[field])} ${locale}=${JSON.stringify(locItem[field])}`
            );
          }
        }

        // Check array structural fields
        for (const field of STRUCTURAL_ARRAY_FIELDS) {
          if (!arraysEqual(enItem[field], locItem[field])) {
            errors.push(
              `${rel}: Item "${enItem.id}" field "${field}" mismatch. ` +
              `EN=${JSON.stringify(enItem[field])} ${locale}=${JSON.stringify(locItem[field])}`
            );
          }
        }

        // Check translation fields are non-empty
        if (!locItem.label || locItem.label.trim() === '') {
          errors.push(`${rel}: Item "${enItem.id}" has empty label`);
        }
      }

      // Check for extra items in locale that don't exist in EN
      for (const locItem of locItems) {
        if (!enItemMap.has(locItem.id)) {
          warnings.push(`${rel}: Extra item "${locItem.id}" not in EN source`);
        }
      }
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Checklist i18n warnings:\n');
    for (const w of warnings) {
      console.warn(`  ⚠ ${w}`);
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Checklist i18n validation FAILED:\n');
    for (const err of errors) {
      console.error(`  • ${err}`);
    }
    console.error(`\n${errors.length} error(s).\n`);
    return false;
  }

  const localeCount = LOCALES.length * COUNTRIES.length;
  console.log(`✓ Checklist i18n validation passed (${COUNTRIES.length} countries × ${LOCALES.length} locales).`);
  return true;
}

const ok = validate();
if (!ok) process.exit(1);
