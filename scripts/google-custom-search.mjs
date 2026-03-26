#!/usr/bin/env node
// Google Custom Search API wrapper for visa fact-checking
// Usage: node scripts/google-custom-search.mjs --query "E-7 salary requirement" [--country korea] [--num 5]
// Output: JSON to stdout (pipe-friendly)
// Auth: GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID from .env.local or environment

import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const COUNTRY_SITES = {
  korea: 'site:visa.go.kr OR site:law.go.kr OR site:immigration.go.kr OR site:korea.net',
  japan: 'site:moj.go.jp OR site:isa.go.jp OR site:mofa.go.jp',
  taiwan: 'site:goldcard.nat.gov.tw OR site:law.moj.gov.tw OR site:foreigntalentact.ndc.gov.tw OR site:boca.gov.tw',
  china: 'site:english.www.gov.cn',
};

const { values: flags } = parseArgs({
  options: {
    query:   { type: 'string' },
    country: { type: 'string' },
    num:     { type: 'string', default: '5' },
  },
});

if (!flags.query) {
  console.error('[google-cse] --query is required');
  process.exit(1);
}

// Load .env.local if env vars are missing
function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  try {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env.local not found — rely on environment
  }
}

loadEnvLocal();

const apiKey = process.env.GOOGLE_CSE_API_KEY;
const cseId  = process.env.GOOGLE_CSE_ID;

if (!apiKey || !cseId) {
  console.error('[google-cse] Missing GOOGLE_CSE_API_KEY or GOOGLE_CSE_ID. Set in .env.local or environment.');
  process.exit(1);
}

const num     = Math.min(Math.max(parseInt(flags.num, 10) || 5, 1), 10);
const country = flags.country && flags.country in COUNTRY_SITES ? flags.country : null;
const query   = country ? `${flags.query} ${COUNTRY_SITES[country]}` : flags.query;

const url = new URL('https://customsearch.googleapis.com/customsearch/v1');
url.searchParams.set('key', apiKey);
url.searchParams.set('cx',  cseId);
url.searchParams.set('q',   query);
url.searchParams.set('num', String(num));

const controller = new AbortController();
const timeout    = setTimeout(() => controller.abort(), 30_000);

try {
  const res  = await fetch(url.toString(), { signal: controller.signal });
  clearTimeout(timeout);

  if (!res.ok) {
    const body = await res.text();
    console.error(`[google-cse] API error ${res.status}: ${body}`);
    process.exit(1);
  }

  const data  = await res.json();
  const items = data.items || [];

  if (items.length === 0) {
    console.error('[google-cse] No results found for query.');
  }

  const output = {
    meta: {
      query:        flags.query,
      country:      country ?? null,
      num,
      totalResults: data.searchInformation?.totalResults ?? '0',
      searchedAt:   new Date().toISOString(),
    },
    results: items.map((item) => ({
      title:       item.title,
      link:        item.link,
      snippet:     item.snippet,
      displayLink: item.displayLink,
    })),
  };

  console.log(JSON.stringify(output, null, 2));
} catch (err) {
  clearTimeout(timeout);

  if (err.name === 'AbortError') {
    console.error('[google-cse] Request timed out after 30s');
    process.exit(2);
  }

  console.error(`[google-cse] Fetch error: ${err.message}`);
  process.exit(1);
}
