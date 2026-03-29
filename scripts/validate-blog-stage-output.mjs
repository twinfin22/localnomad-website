#!/usr/bin/env node
/**
 * Validates a blog pipeline stage output JSON against its contract schema.
 * Usage: node scripts/validate-blog-stage-output.mjs <stage_number> <file_path>
 * Exit 0 = valid, Exit 1 = invalid (details on stderr)
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const [,, stageArg, filePath] = process.argv;

if (!stageArg || !filePath) {
  console.error('Usage: node validate-blog-stage-output.mjs <stage: 2|3|4> <file_path>');
  process.exit(1);
}

const stage = parseInt(stageArg, 10);
if (![2, 3, 4].includes(stage)) {
  console.error(`Invalid stage: ${stage}. Must be 2, 3, or 4.`);
  process.exit(1);
}

const contractsDir = join(homedir(), '.claude/plugins/localnomad-blog-plugin/contracts');
const schemaFile = join(contractsDir, `stage${stage}-output.schema.json`);

try {
  const schema = JSON.parse(readFileSync(schemaFile, 'utf-8'));
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  // Load referenced schemas if stage4
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  if (stage === 4) {
    const layerSchema = JSON.parse(
      readFileSync(join(contractsDir, 'stage4-layer-report.schema.json'), 'utf-8')
    );
    ajv.addSchema(layerSchema, 'stage4-layer-report.schema.json');
  }

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    console.log(`✓ Stage ${stage} output is valid.`);
    process.exit(0);
  } else {
    console.error(`✗ Stage ${stage} output validation failed:`);
    for (const err of validate.errors) {
      console.error(`  - ${err.instancePath || '/'}: ${err.message}`);
    }
    process.exit(1);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
