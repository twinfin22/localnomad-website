#!/usr/bin/env node
// Usage: node scripts/seo/pull-ga4.mjs [--days N] [--end-date YYYY-MM-DD] [--compare-prior] [--fixture file]
// Date ranges are inclusive: --days 28 means exactly 28 calendar days.

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync } from 'node:fs';
import { parseAnalyticsArgs, completeness, isBlogDetailPath, languageForPath, normalisePath } from './analytics-common.mjs';
import { enrichBlogPath, readBlogCatalog } from './blog-catalog.mjs';

const propertyId = process.env.GA4_PROPERTY_ID || '525080118';
const num = (row, index) => Number(row?.metricValues?.[index]?.value || 0);

function pageRows(report) {
  return (report.rows || []).map((row) => ({
    path: normalisePath(row.dimensionValues?.[0]?.value || ''),
    pageviews: num(row, 0),
    users: num(row, 1),
    avgSessionDuration: Math.round(num(row, 2)),
    bounceRate: Math.round(num(row, 3) * 10000) / 10000,
  }));
}

function dailyRows(report) {
  return (report.rows || []).map((row) => ({
    date: row.dimensionValues?.[0]?.value,
    sessions: num(row, 0), users: num(row, 1), pageviews: num(row, 2), newUsers: num(row, 3),
    avgSessionDuration: Math.round(num(row, 4)), bounceRate: Math.round(num(row, 5) * 10000) / 10000,
  }));
}

function sourceRows(report) {
  return (report.rows || []).map((row) => ({
    channel: row.dimensionValues?.[0]?.value, source: row.dimensionValues?.[1]?.value,
    sessions: num(row, 0), users: num(row, 1), newUsers: num(row, 2),
  }));
}

async function allRows(client, request) {
  const limit = 100000;
  let offset = 0;
  let rowCount = null;
  const rows = [];
  while (true) {
    const [response] = await client.runReport({ ...request, limit, offset });
    const batch = response.rows || [];
    rows.push(...batch);
    rowCount = response.rowCount === undefined ? rowCount : Number(response.rowCount);
    if (!batch.length || (rowCount !== null && rows.length >= rowCount)) break;
    offset += batch.length;
  }
  return { rows, rowCount };
}

function requests(range) {
  const base = { property: `properties/${propertyId}`, dateRanges: [{ startDate: range.startDate, endDate: range.endDate }] };
  return {
    daily: { ...base, dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }, { name: 'newUsers' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }], orderBys: [{ dimension: { dimensionName: 'date' } }] },
    period: { ...base, metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }, { name: 'newUsers' }] },
    pages: { ...base, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] },
    sources: { ...base, dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionSource' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'newUsers' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] },
  };
}

async function collect(client, range) {
  const req = requests(range);
  const [daily, period, pages, sources] = await Promise.all([
    client.runReport(req.daily), client.runReport(req.period), allRows(client, req.pages), allRows(client, req.sources),
  ]);
  const periodRow = period[0].rows?.[0];
  return {
    daily: dailyRows(daily[0]),
    totals: { sessions: num(periodRow, 0), users: num(periodRow, 1), pageviews: num(periodRow, 2), newUsers: num(periodRow, 3) },
    pages: pageRows(pages), sources: sourceRows(sources),
    completeness: {
      pages: completeness({ source: 'GA4 pagePath', expected: pages.rowCount, returned: pages.rows.length, paginated: true }),
      sources: completeness({ source: 'GA4 session source', expected: sources.rowCount, returned: sources.rows.length, paginated: true }),
    },
  };
}

function fixtureReport(file, range) {
  const fixture = JSON.parse(readFileSync(file, 'utf8'));
  const report = fixture.ranges?.[`${range.startDate}:${range.endDate}`] || fixture.current || fixture;
  if (!report) throw new Error(`Fixture has no range ${range.startDate}:${range.endDate}`);
  return {
    daily: report.daily || [], totals: report.totals || { sessions: 0, users: 0, pageviews: 0, newUsers: 0 },
    pages: report.pages || [], sources: report.sources || [],
    completeness: report.completeness || {
      pages: completeness({ source: 'fixture GA4 pagePath', returned: (report.pages || []).length, paginated: true }),
      sources: completeness({ source: 'fixture GA4 session source', returned: (report.sources || []).length, paginated: true }),
    },
  };
}

function output(report, range, prior = null) {
  const catalog = readBlogCatalog();
  const detailPages = report.pages.filter((page) => isBlogDetailPath(page.path)).map((page) => ({
    ...page, ...enrichBlogPath(page.path, catalog), language: languageForPath(page.path),
  }));
  const languageTotals = Object.entries(Object.groupBy(detailPages, (page) => page.language)).map(([language, pages]) => ({
    language,
    pageviews: pages.reduce((sum, page) => sum + page.pageviews, 0),
    pageUsersNonAdditive: pages.reduce((sum, page) => sum + page.users, 0),
    pageCount: pages.length,
  }));
  return {
    meta: { propertyId, ...range, pulledAt: new Date().toISOString(), comparison: prior ? prior.meta : null },
    // Existing fields stay available. `users` comes from the period-only GA4 query, not daily/page sums.
    totals: report.totals,
    daily: report.daily,
    topPages: report.pages,
    trafficSources: report.sources,
    blog: {
      detailPages,
      languageTotals,
      completeness: { ...report.completeness.pages, matchedBlogDetailPages: detailPages.length },
      definitions: {
        periodUsers: 'GA4 totalUsers queried once for the full inclusive period.',
        pageUsersNonAdditive: 'Per-page users overlap and are not a period unique-user total.',
        publicationDates: 'Content frontmatter dates; translations are separate from English originals.',
      },
    },
    comparison: prior ? { range: prior.meta, totals: prior.totals, blog: prior.blog } : null,
    dataCompleteness: { ga4: report.completeness, status: 'complete' },
  };
}

try {
  const { current, prior, fixture } = parseAnalyticsArgs({ maxDays: 365, defaultLagDays: 1 });
  const client = fixture ? null : (() => {
    const keyFile = process.env.GSC_SA_KEY_PATH || `${process.env.HOME}/.config/gcloud/localnomad-gsc-sa.json`;
    const key = JSON.parse(readFileSync(keyFile, 'utf8'));
    return new BetaAnalyticsDataClient({ credentials: { client_email: key.client_email, private_key: key.private_key } });
  })();
  const currentReport = fixture ? fixtureReport(fixture, current) : await collect(client, current);
  const priorOutput = prior ? output(fixture ? fixtureReport(fixture, prior) : await collect(client, prior), prior) : null;
  console.log(JSON.stringify(output(currentReport, current, priorOutput), null, 2));
} catch (error) {
  console.error(`[pull-ga4] API or input error: ${error.message}`);
  process.exit(1);
}
