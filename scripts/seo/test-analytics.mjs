#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const run = (script, fixture) => JSON.parse(execFileSync(process.execPath, [join(root, script), '--days', '3', '--end-date', '2026-03-31', '--compare-prior', '--fixture', join(root, 'fixtures', fixture)], { encoding: 'utf8' }));

const ga4 = run('pull-ga4.mjs', 'ga4.json');
assert.equal(ga4.meta.startDate, '2026-03-29');
assert.equal(ga4.meta.endDate, '2026-03-31');
assert.equal(ga4.meta.days, 3);
assert.equal(ga4.comparison.range.startDate, '2026-03-26');
assert.equal(ga4.totals.users, 7, 'period users must not be summed from daily rows (4+5+3)');
assert.equal(ga4.blog.detailPages.length, 2);
assert.equal(ga4.blog.languageTotals.find((row) => row.language === 'en').pageviews, 8);

const gsc = run('pull-gsc.mjs', 'gsc.json');
assert.equal(gsc.meta.rowCount, 0, 'successful zero query-detail rows remain valid data');
assert.equal(gsc.dataCompleteness.gsc.status, 'complete');
assert.equal(gsc.blog.detailPages.length, 2);
assert.equal(gsc.blog.languageTotals.find((row) => row.language === 'zh-cn').clicks, 0);

console.log('analytics fixtures: PASS');
