import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ja', 'zh-cn', 'zh-tw', 'vi'] as const,
  defaultLocale: 'en',
  localePrefix: 'always',
});
