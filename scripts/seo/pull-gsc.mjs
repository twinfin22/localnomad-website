#!/usr/bin/env node
// Usage: node scripts/seo/pull-gsc.mjs [--days N] [--end-date YYYY-MM-DD] [--compare-prior] [--fixture file]
// A zero-row response is valid data. API failures exit non-zero.

import { searchconsole } from '@googleapis/searchconsole';
import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'node:fs';
import { parseAnalyticsArgs, completeness, isBlogDetailPath, languageForPath, normalisePath } from './analytics-common.mjs';
import { enrichBlogPath, readBlogCatalog } from './blog-catalog.mjs';

const siteUrl = process.env.GSC_SITE_URL || 'https://localnomad.club/';

function normaliseRows(rows, dimensions) {
  return (rows || []).map((row) => {
    const values = Object.fromEntries(dimensions.map((dimension, index) => [dimension, row.keys?.[index] || '']));
    return { ...values, clicks: row.clicks || 0, impressions: row.impressions || 0, ctr: Math.round((row.ctr || 0) * 10000) / 10000, position: Math.round((row.position || 0) * 10) / 10 };
  });
}

async function queryAll(client, range, dimensions) {
  const rowLimit = 25000;
  let startRow = 0;
  const rows = [];
  while (true) {
    const response = await client.searchanalytics.query({
      siteUrl,
      requestBody: { startDate: range.startDate, endDate: range.endDate, dimensions, rowLimit, startRow },
    });
    const batch = response.data.rows || [];
    rows.push(...batch);
    if (batch.length < rowLimit) break;
    startRow += batch.length;
  }
  return rows;
}

async function collect(client, range) {
  const [detail, pages] = await Promise.all([
    queryAll(client, range, ['query', 'page', 'device']),
    queryAll(client, range, ['page']),
  ]);
  return { rows: normaliseRows(detail, ['query', 'page', 'device']), pages: normaliseRows(pages, ['page']) };
}

function fixtureReport(file, range) {
  const fixture = JSON.parse(readFileSync(file, 'utf8'));
  const report = fixture.ranges?.[`${range.startDate}:${range.endDate}`] || fixture.current || fixture;
  if (!report) throw new Error(`Fixture has no range ${range.startDate}:${range.endDate}`);
  return { rows: report.rows || [], pages: report.pages || [] };
}

function output(report, range, prior = null) {
  const catalog = readBlogCatalog();
  const blogPages = report.pages.filter((row) => isBlogDetailPath(row.page)).map((row) => ({
    ...row, page: normalisePath(row.page), ...enrichBlogPath(row.page, catalog), language: languageForPath(row.page),
  }));
  const languages = Object.entries(Object.groupBy(blogPages, (row) => row.language)).map(([language, rows]) => ({
    language,
    clicks: rows.reduce((sum, row) => sum + row.clicks, 0),
    impressions: rows.reduce((sum, row) => sum + row.impressions, 0),
    pageCount: rows.length,
  }));
  return {
    meta: { siteUrl, ...range, rowCount: report.rows.length, pulledAt: new Date().toISOString(), comparison: prior ? prior.meta : null },
    // Keep the historical `rows` field (query/page/device detail) for existing consumers.
    rows: report.rows,
    blog: {
      detailPages: blogPages,
      languageTotals: languages,
      completeness: completeness({ source: 'GSC page dimension', returned: report.pages.length, paginated: true }),
    },
    comparison: prior ? { range: prior.meta, blog: prior.blog } : null,
    // Zero rows means successfully queried but no matching data, not a failed API call.
    dataCompleteness: { gsc: { status: 'complete', detailRows: report.rows.length, pageRows: report.pages.length, paginated: true }, status: 'complete' },
  };
}

try {
  const { current, prior, fixture } = parseAnalyticsArgs({ maxDays: 540, defaultLagDays: 2 });
  const client = fixture ? null : (() => {
    const keyFile = process.env.GSC_SA_KEY_PATH || `${process.env.HOME}/.config/gcloud/localnomad-gsc-sa.json`;
    const auth = new GoogleAuth({ keyFile, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
    return searchconsole({ version: 'v1', auth });
  })();
  const currentReport = fixture ? fixtureReport(fixture, current) : await collect(client, current);
  const priorOutput = prior ? output(fixture ? fixtureReport(fixture, prior) : await collect(client, prior), prior) : null;
  console.log(JSON.stringify(output(currentReport, current, priorOutput), null, 2));
} catch (error) {
  console.error(`[pull-gsc] API or input error: ${error.message}`);
  process.exit(1);
}
