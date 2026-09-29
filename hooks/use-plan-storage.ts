'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';
import {
  clearPlanState,
  EMPTY_PLAN,
  getCountryPlan,
  PLAN_STORAGE_KEY,
  readPlanState,
  resetCountryPlan,
  updateCountryPlan,
  writePlanState,
  type PlanCountry,
  type PlanStage,
  type PlanState,
} from '@/lib/plan-storage';

type StorageStatus = 'loading' | 'ready' | 'corrupted' | 'not-saving';

function toggleItem(items: string[], item: string): string[] {
  return items.includes(item) ? items.filter((saved) => saved !== item) : [...items, item];
}

export interface UsePlanStorageResult {
  plan: PlanState;
  status: StorageStatus;
  setStage: (country: PlanCountry, stage: PlanStage) => void;
  toggleVisa: (country: PlanCountry, visaId: string) => void;
  toggleNeighborhood: (country: PlanCountry, neighborhoodId: string) => void;
  resetCountry: (country: PlanCountry) => void;
  recover: () => void;
}

export function usePlanStorage(): UsePlanStorageResult {
  const [plan, setPlan] = useState<PlanState>(EMPTY_PLAN);
  const [status, setStatus] = useState<StorageStatus>('loading');

  useEffect(() => {
    const result = readPlanState();
    startTransition(() => {
      setPlan(result.state);
      setStatus(result.ok ? 'ready' : result.reason === 'corrupted' ? 'corrupted' : 'not-saving');
    });
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PLAN_STORAGE_KEY) return;
      const result = readPlanState();
      startTransition(() => {
        setPlan(result.state);
        setStatus(result.ok ? 'ready' : result.reason === 'corrupted' ? 'corrupted' : 'not-saving');
      });
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const commit = useCallback((updater: (current: PlanState) => PlanState) => {
    const current = readPlanState();
    if (!current.ok) {
      setStatus(current.reason === 'corrupted' ? 'corrupted' : 'not-saving');
      return;
    }
    const next = updater(current.state);
    if (!writePlanState(next)) {
      setStatus('not-saving');
      return;
    }
    setPlan(next);
  }, []);

  const setStage = useCallback((country: PlanCountry, stage: PlanStage) => {
    if (status !== 'ready') return;
    commit((plan) => updateCountryPlan(plan, country, (current) => ({ ...current, stage })));
  }, [commit, status]);

  const toggleVisa = useCallback((country: PlanCountry, visaId: string) => {
    if (status !== 'ready') return;
    commit((plan) => updateCountryPlan(plan, country, (current) => ({
      ...current,
      visaIds: toggleItem(current.visaIds, visaId),
    })));
  }, [commit, status]);

  const toggleNeighborhood = useCallback((country: PlanCountry, neighborhoodId: string) => {
    if (status !== 'ready') return;
    commit((plan) => updateCountryPlan(plan, country, (current) => ({
      ...current,
      neighborhoodIds: toggleItem(current.neighborhoodIds, neighborhoodId),
    })));
  }, [commit, status]);

  const resetCountry = useCallback((country: PlanCountry) => {
    if (status !== 'ready') return;
    commit((plan) => resetCountryPlan(plan, country));
  }, [commit, status]);

  const recover = useCallback(() => {
    if (!clearPlanState()) {
      setStatus('not-saving');
      return;
    }
    setPlan(EMPTY_PLAN);
    setStatus('ready');
  }, []);

  return {
    plan,
    status,
    setStage,
    toggleVisa,
    toggleNeighborhood,
    resetCountry,
    recover,
  };
}

export { getCountryPlan };
