#!/usr/bin/env node
// Pull Google Search Console data via Search Analytics API
// Usage: node scripts/seo/pull-gsc.mjs [--days N]
// Output: JSON to stdout (pipe-friendly)
// Auth: Service account key at GSC_SA_KEY_PATH or ~/.config/gcloud/localnomad-gsc-sa.json

import { searchconsole } from '@googleapis/searchconsole';
import { GoogleAuth } from 'google-auth-library';
import { parseArgs } from 'node:util';

const { values: flags } = parseArgs({
  options: {
    days: { type: 'string', default: '28' },
  },
});

const days = Math.min(Math.max(parseInt(flags.days, 10) || 28, 1), 540);

const keyFile =
  process.env.GSC_SA_KEY_PATH ||
  `${process.env.HOME}/.config/gcloud/localnomad-gsc-sa.json`;

const siteUrl = process.env.GSC_SITE_URL || 'https://localnomad.club/';

const auth = new GoogleAuth({
  keyFile,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

const client = searchconsole({ version: 'v1', auth });

const endDate = new Date();
endDate.setDate(endDate.getDate() - 2); // GSC data has ~2-day lag
const startDate = new Date(endDate);
startDate.setDate(startDate.getDate() - days);

const fmt = (d) => d.toISOString().slice(0, 10);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30_000);

try {
  const res = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ['query', 'page', 'device'],
      rowLimit: 1000,
    },
    signal: controller.signal,
  });

  clearTimeout(timeout);

  const rows = res.data.rows || [];

  if (rows.length === 0) {
    console.error(
      `[pull-gsc] No data returned for ${fmt(startDate)} ~ ${fmt(endDate)}. Check GSC property access.`
    );
    process.exit(1);
  }

  const output = {
    meta: {
      siteUrl,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      days,
      rowCount: rows.length,
      pulledAt: new Date().toISOString(),
    },
    rows: rows.map((r) => ({
      query: r.keys[0],
      page: r.keys[1],
      device: r.keys[2],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Math.round(r.ctr * 10000) / 10000,
      position: Math.round(r.position * 10) / 10,
    })),
  };

  console.log(JSON.stringify(output, null, 2));
} catch (err) {
  clearTimeout(timeout);

  if (err.name === 'AbortError') {
    console.error('[pull-gsc] Request timed out after 30s');
    process.exit(2);
  }

  console.error(`[pull-gsc] API error: ${err.message}`);
  process.exit(1);
}
