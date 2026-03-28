import en from './messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'en' | 'ja' | 'zh-cn';
    Messages: typeof en;
  }
}
