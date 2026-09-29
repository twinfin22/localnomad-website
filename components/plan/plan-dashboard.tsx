'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, MapPin, Plane, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanStorage, getCountryPlan } from '@/hooks/use-plan-storage';
import type { PlanCountry, PlanStage } from '@/lib/plan-storage';

interface Candidate {
  id: string;
  label: string;
  href: string;
}

interface ChecklistItemReference {
  id: string;
  label: string;
  required: boolean;
}

export interface PlanCountryData {
  id: PlanCountry;
  name: string;
  visas: Candidate[];
  neighborhoods: Candidate[];
  checklist: ChecklistItemReference[];
}

interface ChecklistProgress {
  completedIds: Set<string>;
  available: boolean;
}

const STAGE_OPTIONS: Array<{ id: PlanStage; label: string }> = [
  { id: 'visa', label: 'Explore visas' },
  { id: 'living', label: 'Plan daily life' },
  { id: 'arrival', label: 'Prepare for arrival' },
];

function readChecklistProgress(countries: PlanCountryData[]): Record<PlanCountry, ChecklistProgress> {
  const progress = {} as Record<PlanCountry, ChecklistProgress>;

  for (const country of countries) {
    const completedIds = new Set<string>();
    let available = true;

    try {
      for (const tier of ['tourist', 'long-term', 'resident']) {
        const raw = window.localStorage.getItem(`localnomad:checklist:${country.id}:${tier}`);
        if (!raw) continue;
        const value: unknown = JSON.parse(raw);
        if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
        for (const [itemId, checked] of Object.entries(value)) {
          if (checked === true) completedIds.add(itemId);
        }
      }
    } catch {
      available = false;
    }

    progress[country.id] = { completedIds, available };
  }

  return progress;
}

function getNextTask(
  stage: PlanStage | undefined,
  visaCount: number,
  neighborhoodCount: number,
  checklist: ChecklistItemReference[],
  completedIds: Set<string>,
): string {
  if (!stage) return 'Choose the stage you want to start with.';
  if (stage === 'visa' && visaCount === 0) return 'Save a visa option to compare later.';
  if (stage === 'living' && neighborhoodCount === 0) return 'Save a neighborhood that fits your routine.';
  const nextRequired = checklist.find((item) => item.required && !completedIds.has(item.id));
  if (nextRequired) return nextRequired.label;
  if (visaCount === 0) return 'Save a visa option to compare later.';
  if (neighborhoodCount === 0) return 'Save a neighborhood that fits your routine.';
  return 'Review your saved options before you go.';
}

function SavedItems({
  label,
  items,
  onRemove,
}: {
  label: string;
  items: Candidate[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-black/5">
            <a href={item.href} className="min-w-0 truncate text-primary hover:underline">
              {item.label}
            </a>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${item.label}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlanDashboard({ countries }: { countries: PlanCountryData[] }) {
  const { plan, status, setStage, toggleVisa, toggleNeighborhood, resetCountry } = usePlanStorage();
  const [checklistProgress, setChecklistProgress] = useState<Record<PlanCountry, ChecklistProgress>>();

  useEffect(() => {
    setChecklistProgress(readChecklistProgress(countries));
  }, [countries]);

  const sections = useMemo(() => countries.map((country) => {
    const saved = getCountryPlan(plan, country.id);
    const progress = checklistProgress?.[country.id];
    const completedIds = progress?.completedIds ?? new Set<string>();
    const completedCount = country.checklist.filter((item) => completedIds.has(item.id)).length;
    const requiredCount = country.checklist.filter((item) => item.required).length;
    const completedRequired = country.checklist.filter((item) => item.required && completedIds.has(item.id)).length;

    return {
      country,
      saved,
      progress,
      savedVisas: country.visas.filter((visa) => saved.visaIds.includes(visa.id)),
      savedNeighborhoods: country.neighborhoods.filter((neighborhood) => saved.neighborhoodIds.includes(neighborhood.id)),
      completedCount,
      completedRequired,
      requiredCount,
      nextTask: getNextTask(
        saved.stage,
        saved.visaIds.length,
        saved.neighborhoodIds.length,
        country.checklist,
        completedIds,
      ),
    };
  }), [checklistProgress, countries, plan]);

  const isSaving = status === 'ready';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Your plan</p>
        <h1 className="mt-2 font-lora text-4xl font-bold tracking-tight text-primary sm:text-5xl">Prepare at your own pace.</h1>
        <p className="mt-4 text-lg text-muted-foreground">Save visa and neighborhood options in this browser, then pick up where you left off.</p>
      </div>

      {status === 'not-saving' && (
        <div role="status" className="mt-6 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p><strong>Not saving in this browser.</strong> Your saved plan is unavailable or could not be read, so this page is showing an empty plan. You can still browse the tools.</p>
        </div>
      )}

      {status === 'loading' && <p className="mt-8 text-sm text-muted-foreground">Loading your plan…</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {sections.map(({ country, saved, progress, savedVisas, savedNeighborhoods, completedCount, completedRequired, requiredCount, nextTask }) => (
          <section key={country.id} className="rounded-xl border border-border bg-neutral-50 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-lora text-2xl font-bold text-primary">{country.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{nextTask}</p>
              </div>
              <a href={`/en/${country.id}/checklist`} className="rounded-md p-2 text-primary hover:bg-primary/10" aria-label={`Open ${country.name} checklist`}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <label className="mt-5 block text-sm font-medium text-foreground" htmlFor={`stage-${country.id}`}>
              Start with
            </label>
            <select
              id={`stage-${country.id}`}
              value={saved.stage ?? ''}
              disabled={!isSaving}
              onChange={(event) => {
                const stage = event.target.value as PlanStage;
                if (stage) setStage(country.id, stage);
              }}
              className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Choose a stage</option>
              {STAGE_OPTIONS.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
            </select>

            <div className="mt-5 rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Checklist progress</p>
                <span className="text-sm font-medium text-primary">{completedCount}/{country.checklist.length}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${country.checklist.length ? (completedCount / country.checklist.length) * 100 : 0}%` }} />
              </div>
              {progress && !progress.available ? (
                <p className="mt-2 text-xs text-muted-foreground">Checklist progress could not be read in this browser.</p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">{completedRequired}/{requiredCount} required items complete.</p>
              )}
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">Save options</p>
              <div className="mt-2 grid gap-2">
                <label className="sr-only" htmlFor={`visa-${country.id}`}>Save a visa option</label>
                <select
                  id={`visa-${country.id}`}
                  value=""
                  disabled={!isSaving}
                  onChange={(event) => {
                    if (event.target.value) toggleVisa(country.id, event.target.value);
                  }}
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Save a visa option…</option>
                  {country.visas.filter((visa) => !saved.visaIds.includes(visa.id)).map((visa) => <option key={visa.id} value={visa.id}>{visa.label}</option>)}
                </select>
                <label className="sr-only" htmlFor={`neighborhood-${country.id}`}>Save a neighborhood</label>
                <select
                  id={`neighborhood-${country.id}`}
                  value=""
                  disabled={!isSaving}
                  onChange={(event) => {
                    if (event.target.value) toggleNeighborhood(country.id, event.target.value);
                  }}
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Save a neighborhood…</option>
                  {country.neighborhoods.filter((neighborhood) => !saved.neighborhoodIds.includes(neighborhood.id)).map((neighborhood) => <option key={neighborhood.id} value={neighborhood.id}>{neighborhood.label}</option>)}
                </select>
              </div>
            </div>

            <SavedItems label="Saved visas" items={savedVisas} onRemove={(id) => toggleVisa(country.id, id)} />
            <SavedItems label="Saved neighborhoods" items={savedNeighborhoods} onRemove={(id) => toggleNeighborhood(country.id, id)} />

            <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
              <a href={`/en/${country.id}/compare`} className="inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                <Plane className="h-4 w-4" aria-hidden="true" /> Compare visas
              </a>
              <a href={`/en/neighborhood/${country.id}`} className="inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5">
                <MapPin className="h-4 w-4" aria-hidden="true" /> Explore neighborhoods
              </a>
              {(saved.stage || saved.visaIds.length > 0 || saved.neighborhoodIds.length > 0) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!isSaving}
                  onClick={() => {
                    if (window.confirm(`Clear saved options and stage for ${country.name}? Checklist progress will stay.`)) {
                      resetCountry(country.id);
                    }
                  }}
                >
                  Clear country
                </Button>
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
        Your plan stays in this browser. It is not sent to LocalNomad.
      </p>
    </div>
  );
}
