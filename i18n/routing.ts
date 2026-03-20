import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ja', 'zh-cn'] as const,
  defaultLocale: 'en',
  localePrefix: 'always',
});
