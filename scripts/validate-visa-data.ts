// Visa JSON Schema Enforcement
// Validates all EN visa JSONs at build time.
// Rules:
//  - sourceVerified field must exist (boolean)
//  - draft:false && sourceVerified:false = FAIL
//  - sourceVerified:true && !primarySourceUrl = FAIL
// Usage: node --experimental-strip-types scripts/validate-visa-data.ts

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface VisaJson {
  type?: string;
  name?: string;
  draft?: boolean;
  sourceVerified?: boolean;
  primarySourceUrl?: string;
  lastFactChecked?: string;
}

const DATA_ROOT = join(process.cwd(), 'data', 'visas');

function collectVisaFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectVisaFiles(full));
    } else if (entry.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

function validate(): boolean {
  const enPattern = /\/en\//;
  const allFiles = collectVisaFiles(DATA_ROOT).filter((f) => enPattern.test(f));

  if (allFiles.length === 0) {
    console.error('ERROR: No EN visa JSON files found in data/visas/');
    process.exit(1);
  }

  const errors: string[] = [];

  for (const filePath of allFiles) {
    const rel = relative(process.cwd(), filePath);
    let data: VisaJson;

    try {
      data = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (e) {
      errors.push(`${rel}: Invalid JSON — ${(e as Error).message}`);
      continue;
    }

    // Rule 1: sourceVerified must exist
    if (typeof data.sourceVerified !== 'boolean') {
      errors.push(`${rel}: Missing or non-boolean "sourceVerified" field`);
      continue;
    }

    // Rule 2: published (draft !== true) + unverified → block
    if (data.draft !== true && data.sourceVerified === false) {
      errors.push(
        `${rel}: Published visa (draft≠true) has sourceVerified=false. ` +
          `Set draft:true or verify sources first.`
      );
    }

    // Rule 3: verified but no source URL → block
    if (data.sourceVerified === true && !data.primarySourceUrl) {
      errors.push(
        `${rel}: sourceVerified=true but missing "primarySourceUrl". ` +
          `Add the government source URL.`
      );
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Visa data validation FAILED:\n');
    for (const err of errors) {
      console.error(`  • ${err}`);
    }
    console.error(`\n${errors.length} error(s) in ${allFiles.length} files.\n`);
    return false;
  }

  console.log(`✓ All ${allFiles.length} EN visa JSONs passed validation.`);
  return true;
}

const ok = validate();
if (!ok) process.exit(1);
