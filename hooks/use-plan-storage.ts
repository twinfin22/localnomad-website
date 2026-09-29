'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';
import {
  EMPTY_PLAN,
  getCountryPlan,
  readPlanState,
  resetCountryPlan,
  updateCountryPlan,
  writePlanState,
  type PlanCountry,
  type PlanStage,
  type PlanState,
} from '@/lib/plan-storage';

type StorageStatus = 'loading' | 'ready' | 'not-saving';

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
}

export function usePlanStorage(): UsePlanStorageResult {
  const [plan, setPlan] = useState<PlanState>(EMPTY_PLAN);
  const [status, setStatus] = useState<StorageStatus>('loading');

  useEffect(() => {
    const result = readPlanState();
    startTransition(() => {
      setPlan(result.state);
      setStatus(result.ok ? 'ready' : 'not-saving');
    });
  }, []);

  const commit = useCallback((next: PlanState) => {
    if (!writePlanState(next)) {
      setStatus('not-saving');
      return;
    }
    setPlan(next);
  }, []);

  const setStage = useCallback((country: PlanCountry, stage: PlanStage) => {
    if (status !== 'ready') return;
    commit(updateCountryPlan(plan, country, (current) => ({ ...current, stage })));
  }, [commit, plan, status]);

  const toggleVisa = useCallback((country: PlanCountry, visaId: string) => {
    if (status !== 'ready') return;
    commit(updateCountryPlan(plan, country, (current) => ({
      ...current,
      visaIds: toggleItem(current.visaIds, visaId),
    })));
  }, [commit, plan, status]);

  const toggleNeighborhood = useCallback((country: PlanCountry, neighborhoodId: string) => {
    if (status !== 'ready') return;
    commit(updateCountryPlan(plan, country, (current) => ({
      ...current,
      neighborhoodIds: toggleItem(current.neighborhoodIds, neighborhoodId),
    })));
  }, [commit, plan, status]);

  const resetCountry = useCallback((country: PlanCountry) => {
    if (status !== 'ready') return;
    commit(resetCountryPlan(plan, country));
  }, [commit, plan, status]);

  return {
    plan,
    status,
    setStage,
    toggleVisa,
    toggleNeighborhood,
    resetCountry,
  };
}

export { getCountryPlan };
