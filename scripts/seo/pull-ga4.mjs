#!/usr/bin/env node
// Pull GA4 analytics data via Google Analytics Data API
// Usage: node scripts/seo/pull-ga4.mjs [--days N]
// Output: JSON to stdout (pipe-friendly)
// Auth: Service account key at GSC_SA_KEY_PATH or ~/.config/gcloud/localnomad-gsc-sa.json

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';

const { values: flags } = parseArgs({
  options: {
    days: { type: 'string', default: '28' },
  },
});

const days = Math.min(Math.max(parseInt(flags.days, 10) || 28, 1), 365);

const keyFile =
  process.env.GSC_SA_KEY_PATH ||
  `${process.env.HOME}/.config/gcloud/localnomad-gsc-sa.json`;

const propertyId = process.env.GA4_PROPERTY_ID || '525080118';

// Read key file to pass credentials directly
const credentials = JSON.parse(readFileSync(keyFile, 'utf-8'));

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
});

const endDate = new Date();
endDate.setDate(endDate.getDate() - 1); // GA4 has ~1-day lag
const startDate = new Date(endDate);
startDate.setDate(startDate.getDate() - days);

const fmt = (d) => d.toISOString().slice(0, 10);

try {
  // Run 3 reports in parallel: overview, top pages, traffic sources
  const [overview, topPages, sources] = await Promise.all([
    // 1. Daily overview: sessions, users, pageviews
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'newUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),

    // 2. Top pages
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 50,
    }),

    // 3. Traffic sources
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' },
        { name: 'sessionSource' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 30,
    }),
  ]);

  // Parse overview
  const daily = (overview[0].rows || []).map((r) => ({
    date: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    users: Number(r.metricValues[1].value),
    pageviews: Number(r.metricValues[2].value),
    newUsers: Number(r.metricValues[3].value),
    avgSessionDuration: Math.round(Number(r.metricValues[4].value)),
    bounceRate: Math.round(Number(r.metricValues[5].value) * 10000) / 10000,
  }));

  const totals = daily.reduce(
    (acc, d) => ({
      sessions: acc.sessions + d.sessions,
      users: acc.users + d.users,
      pageviews: acc.pageviews + d.pageviews,
      newUsers: acc.newUsers + d.newUsers,
    }),
    { sessions: 0, users: 0, pageviews: 0, newUsers: 0 }
  );

  // Parse top pages
  const pages = (topPages[0].rows || []).map((r) => ({
    path: r.dimensionValues[0].value,
    pageviews: Number(r.metricValues[0].value),
    users: Number(r.metricValues[1].value),
    avgSessionDuration: Math.round(Number(r.metricValues[2].value)),
    bounceRate: Math.round(Number(r.metricValues[3].value) * 10000) / 10000,
  }));

  // Parse traffic sources
  const traffic = (sources[0].rows || []).map((r) => ({
    channel: r.dimensionValues[0].value,
    source: r.dimensionValues[1].value,
    sessions: Number(r.metricValues[0].value),
    users: Number(r.metricValues[1].value),
    newUsers: Number(r.metricValues[2].value),
  }));

  const output = {
    meta: {
      propertyId,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      days,
      pulledAt: new Date().toISOString(),
    },
    totals,
    daily,
    topPages: pages,
    trafficSources: traffic,
  };

  console.log(JSON.stringify(output, null, 2));
} catch (err) {
  console.error(`[pull-ga4] API error: ${err.message}`);
  process.exit(1);
}
