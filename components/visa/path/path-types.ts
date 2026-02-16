import type { useTranslations } from "next-intl";

export type SimulatorStep = "select-start" | "select-destination" | "view-path";

export type TranslationFn = ReturnType<typeof useTranslations>;
