export const PLAN_STORAGE_KEY = 'localnomad:plan:v1';

export const PLAN_COUNTRIES = ['korea', 'japan', 'taiwan'] as const;
export type PlanCountry = (typeof PLAN_COUNTRIES)[number];

export const PLAN_STAGES = ['visa', 'living', 'arrival'] as const;
export type PlanStage = (typeof PLAN_STAGES)[number];

export interface CountryPlanState {
  stage?: PlanStage;
  visaIds: string[];
  neighborhoodIds: string[];
}

export interface PlanState {
  version: 1;
  countries: Partial<Record<PlanCountry, CountryPlanState>>;
}

export type PlanReadResult =
  | { ok: true; state: PlanState }
  | { ok: false; reason: 'unavailable' | 'corrupted'; state: PlanState };

const EMPTY_PLAN_STATE: PlanState = { version: 1, countries: {} };

function isPlanCountry(value: unknown): value is PlanCountry {
  return typeof value === 'string' && PLAN_COUNTRIES.includes(value as PlanCountry);
}

function isPlanStage(value: unknown): value is PlanStage {
  return typeof value === 'string' && PLAN_STAGES.includes(value as PlanStage);
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parsePlanState(value: unknown): PlanState | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || !record.countries || typeof record.countries !== 'object') {
    return null;
  }

  const countries: PlanState['countries'] = {};
  for (const [country, countryValue] of Object.entries(record.countries as Record<string, unknown>)) {
    if (!isPlanCountry(country) || !countryValue || typeof countryValue !== 'object' || Array.isArray(countryValue)) {
      return null;
    }

    const countryRecord = countryValue as Record<string, unknown>;
    if (
      (countryRecord.stage !== undefined && !isPlanStage(countryRecord.stage)) ||
      !isStringList(countryRecord.visaIds) ||
      !isStringList(countryRecord.neighborhoodIds)
    ) {
      return null;
    }

    countries[country] = {
      ...(countryRecord.stage ? { stage: countryRecord.stage } : {}),
      visaIds: [...new Set(countryRecord.visaIds)],
      neighborhoodIds: [...new Set(countryRecord.neighborhoodIds)],
    };
  }

  return { version: 1, countries };
}

export function emptyPlanState(): PlanState {
  return { version: 1, countries: {} };
}

export function getCountryPlan(state: PlanState, country: PlanCountry): CountryPlanState {
  return state.countries[country] ?? { visaIds: [], neighborhoodIds: [] };
}

export function readPlanState(): PlanReadResult {
  if (typeof window === 'undefined') {
    return { ok: true, state: emptyPlanState() };
  }

  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return { ok: true, state: emptyPlanState() };

    const state = parsePlanState(JSON.parse(raw));
    return state
      ? { ok: true, state }
      : { ok: false, reason: 'corrupted', state: emptyPlanState() };
  } catch {
    return { ok: false, reason: 'unavailable', state: emptyPlanState() };
  }
}

export function writePlanState(state: PlanState): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearPlanState(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.removeItem(PLAN_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function updateCountryPlan(
  state: PlanState,
  country: PlanCountry,
  updater: (current: CountryPlanState) => CountryPlanState,
): PlanState {
  const current = getCountryPlan(state, country);
  return {
    version: 1,
    countries: {
      ...state.countries,
      [country]: updater(current),
    },
  };
}

export function resetCountryPlan(state: PlanState, country: PlanCountry): PlanState {
  const countries = { ...state.countries };
  delete countries[country];
  return { version: 1, countries };
}

export const EMPTY_PLAN = EMPTY_PLAN_STATE;
