import en from './messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'en' | 'ja' | 'zh-cn' | 'zh-tw' | 'vi';
    Messages: typeof en;
  }
}
