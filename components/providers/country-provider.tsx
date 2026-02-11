"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Country } from "@/lib/i18n/config";

interface CountryContextValue {
  country: Country;
}

const CountryContext = createContext<CountryContextValue | null>(null);

interface CountryProviderProps {
  country: Country;
  children: ReactNode;
}

export function CountryProvider({ country, children }: CountryProviderProps) {
  return (
    <CountryContext.Provider value={{ country }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry(): Country {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context.country;
}

export function useCountryOptional(): Country | null {
  const context = useContext(CountryContext);
  return context?.country ?? null;
}
