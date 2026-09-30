import { parseArgs } from 'node:util';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseAnalyticsArgs({ maxDays, defaultLagDays }) {
  const { values } = parseArgs({
    options: {
      days: { type: 'string', default: '28' },
      'end-date': { type: 'string' },
      'compare-prior': { type: 'boolean', default: false },
      fixture: { type: 'string' },
    },
  });
  const days = Number.parseInt(values.days, 10);
  if (!Number.isInteger(days) || days < 1 || days > maxDays) {
    throw new Error(`--days must be an integer from 1 to ${maxDays}`);
  }

  const end = values['end-date']
    ? parseIsoDate(values['end-date'], '--end-date')
    : addDays(utcToday(), -defaultLagDays);
  const start = addDays(end, -(days - 1));
  const current = rangeMeta(start, end, days);
  const priorEnd = addDays(start, -1);
  const prior = values['compare-prior']
    ? rangeMeta(addDays(priorEnd, -(days - 1)), priorEnd, days)
    : null;

  return { current, prior, fixture: values.fixture };
}

export function parseIsoDate(value, optionName = 'date') {
  if (!ISO_DATE.test(value)) throw new Error(`${optionName} must use YYYY-MM-DD`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || fmt(date) !== value) {
    throw new Error(`${optionName} is not a calendar date: ${value}`);
  }
  return date;
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function fmt(date) {
  return date.toISOString().slice(0, 10);
}

export function rangeMeta(start, end, days) {
  return { startDate: fmt(start), endDate: fmt(end), days };
}

export function utcToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function languageForPath(pathname) {
  const path = normalisePath(pathname);
  if (path.startsWith('/ja/')) return 'ja';
  if (path.startsWith('/zh-cn/')) return 'zh-cn';
  if (path.startsWith('/en/')) return 'en';
  return 'unknown';
}

export function isBlogDetailPath(pathname) {
  const path = normalisePath(pathname);
  return /^\/(?:en|ja|zh-cn)\/blog\/[^/]+\/[^/?#]+\/?$/.test(path);
}

export function normalisePath(value = '') {
  try {
    const url = value.startsWith('http') ? new URL(value) : new URL(value, 'https://localnomad.invalid');
    return url.pathname.replace(/\/{2,}/g, '/');
  } catch {
    return value.split(/[?#]/, 1)[0].replace(/\/{2,}/g, '/');
  }
}

export function sumMetricRows(rows, metricNames) {
  return rows.reduce((totals, row) => {
    for (const name of metricNames) totals[name] += Number(row[name] || 0);
    return totals;
  }, Object.fromEntries(metricNames.map((name) => [name, 0])));
}

export function completeness({ expected = null, returned, paginated = false, source }) {
  return {
    source,
    status: 'complete',
    expectedRows: expected,
    returnedRows: returned,
    paginated,
    note: expected === null
      ? 'The API does not expose an exact total row count for this query.'
      : returned < expected ? 'The API returned fewer rows than the stated total.' : null,
  };
}
