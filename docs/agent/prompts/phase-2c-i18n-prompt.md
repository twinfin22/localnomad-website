# Phase 2-C: zh-cn Locale + Full Multilingual Translation

> **Goal**: Add zh-cn (Simplified Chinese) locale and complete all translations for 5 locales
> **Checkpoint**: 5개 언어 전부 작동 확인 (en, ja, zh-cn, zh-tw, vi)

---

## Pre-Flight Checks

1. Read `i18n/routing.ts` — current locale list (missing zh-cn)
2. Read `messages/en.json` — full translation key structure
3. Read `messages/ja.json`, `messages/zh-tw.json`, `messages/vi.json` — existing translations
4. Read `i18n/Visa i18n Glossary.txt` — official terminology for each language
5. Read `proxy.ts` — middleware locale handling

---

## Step 1: Add zh-cn to Routing

### File: `i18n/routing.ts`

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ja', 'zh-cn', 'zh-tw', 'vi'] as const,
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

---

## Step 2: Create messages/zh-cn.json

Create a NEW file `messages/zh-cn.json` by translating ALL keys from `messages/en.json` into Simplified Chinese.

**CRITICAL RULES:**
- Use the official glossary (`i18n/Visa i18n Glossary.txt`) for all visa-related terms
- Use 简体中文 (Simplified Chinese), NOT 繁體中文 (Traditional Chinese)
- zh-cn is for Korea target users (Chinese nationals in Korea), so context is Korean immigration
- Do NOT copy from zh-tw.json and convert — write fresh translations using the glossary
- Keep all JSON keys exactly matching en.json (do NOT translate keys)
- Keep interpolation variables intact: `{country}`, `{days}`, `{email}`, `{count}`, `{total}`, `{date}`, `{year}`, `{number}`

**Key differences between zh-cn and zh-tw to watch for:**
| English | zh-cn (简体) | zh-tw (繁體) |
|---------|-------------|-------------|
| Visa | 签证 | 簽證 |
| Information | 信息 | 資訊 |
| Email | 邮箱/邮件 | 電子郵件 |
| Dashboard | 仪表盘/控制台 | 儀表板 |
| Log in | 登录 | 登入 |
| Checklist | 清单 | 清單 |

---

## Step 3: Update Existing Translations

### File: `messages/ja.json`, `messages/zh-tw.json`, `messages/vi.json`

Check that ALL keys present in `en.json` also exist in every other locale file. If any keys are missing (especially new keys added in Phase 2-A/B like updated `Country.subtitle`, `Country.visaCount`), add translations.

Use the glossary for visa-specific terminology.

---

## Step 4: Create Visa JSON Translations

### Korea visas — zh-cn (Simplified Chinese) and vi (Vietnamese)

For each Korean visa (f-1-d, e-7, d-8, f-2, h-1), create translated JSON files:

```
data/visas/zh-cn/f-1-d.json
data/visas/zh-cn/e-7.json
data/visas/zh-cn/d-8.json
data/visas/zh-cn/f-2.json
data/visas/zh-cn/h-1.json

data/visas/vi/f-1-d.json
data/visas/vi/e-7.json
data/visas/vi/d-8.json
data/visas/vi/f-2.json
data/visas/vi/h-1.json
```

### Korea visas — ja (Japanese)

Japanese already has `f-1-d.json`. Create the remaining 4:

```
data/visas/ja/e-7.json
data/visas/ja/d-8.json
data/visas/ja/f-2.json
data/visas/ja/h-1.json
```

### Translation rules for visa JSON:
- Translate ALL user-facing text fields: `name`, `description`, `tagline`, `keyRequirement`, `targetAudience[]`, `eligibility[].label`, `eligibility[].description`, `documents[].name`, `documents[].description`, `documents[].tips[]`, `applicationSteps[].title`, `applicationSteps[].description`, `applicationSteps[].tips[]`, `faqs[].question`, `faqs[].answer`, `tips[]`, `warnings[]`, `communityTips[].tip`, `pathsTo[].name`, `pathsTo[].requirements`, `pathsTo[].notes`, `pathsFrom[].*`, `officialLinks[].label`
- Do NOT translate: `type`, `shortName`, `category`, `id` fields, `source` in communityTips, URLs, Korean document names (`nameKorean`), currency codes, date values
- Use the glossary for document names, visa type names, and official terms
- Keep `nameKorean` field as-is in all languages (it's always Korean)
- `communityTips[].source` stays as "community"/"reddit"/"discord"/"official"

---

## Step 5: Verify Locale Middleware

### File: `proxy.ts`

Check that the middleware correctly handles `zh-cn` locale:
- Locale detection should work
- Protected route redirects should include `zh-cn`
- Session refresh should work regardless of locale

Usually no changes needed if the middleware reads from `routing.locales`, but verify.

---

## Verification Checklist

- [ ] `npm run build` — no build errors (all locales compile)
- [ ] Visit `/zh-cn` — Chinese (Simplified) landing page renders
- [ ] Visit `/zh-cn/korea` — visa listing in Simplified Chinese
- [ ] Visit `/zh-cn/korea/visa/f-1-d` — F-1-D detail in Simplified Chinese
- [ ] Visit `/vi/korea` — Vietnamese visa listing
- [ ] Visit `/ja/korea/visa/e-7` — E-7 detail in Japanese
- [ ] Language switcher (if exists) shows all 5 locales
- [ ] Onboarding flow works in zh-cn
- [ ] Dashboard works in vi
- [ ] All glossary terms match `i18n/Visa i18n Glossary.txt`
- [ ] No mixed zh-cn/zh-tw characters in Simplified Chinese pages
- [ ] `npm run lint` — no errors
