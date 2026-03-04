# Phase 3-D: VisaDisclaimer Config-Based Expansion

## Objective
Refactor the VisaDisclaimer component from hardcoded if/else per country to a config-driven system that scales to Japan, China, and SEA without adding more if/else branches.

## Current State

File: `components/visa/visa-disclaimer.tsx` (44 lines)

Current structure:
```typescript
if (country === 'korea') → Korea disclaimer (EN only)
if (country === 'taiwan') → Taiwan disclaimer (EN + 繁體中文)
// No japan, china, or southeast-asia handling
```

Problems:
1. Adding each new country = another if/else block with hardcoded strings
2. No consistency in structure (Korea = 1 paragraph, Taiwan = 2 paragraphs + Chinese)
3. Translation keys not used for disclaimer body text (only footer uses `t('disclaimer')`)
4. SEA comparison page needs a disclaimer too but the component only handles visa detail pages

---

## Target State

A config object that defines per-country disclaimer content, so the component just looks up the config and renders it.

---

## Step 1: Create Disclaimer Config

Create `lib/disclaimer-config.ts`:

```typescript
export interface DisclaimerConfig {
  country: string;
  paragraphs: {
    lang: string;       // 'en', 'zh-Hant', 'ja', 'zh-Hans'
    text: string;
  }[];
  legalReferences?: string[];  // Laws cited
}

export const DISCLAIMER_CONFIGS: Record<string, DisclaimerConfig> = {
  korea: {
    country: 'korea',
    paragraphs: [
      {
        lang: 'en',
        text: 'This information is for general guidance only and does not constitute legal advice. For personalized immigration guidance, consult a licensed immigration consultant (행정사) or attorney (변호사). Final decisions on visa issuance rest solely with the Korean Ministry of Justice and immigration authorities.'
      }
    ],
    legalReferences: ['행정사법', '변호사법', '표시광고법']
  },

  taiwan: {
    country: 'taiwan',
    paragraphs: [
      {
        lang: 'en',
        text: 'This information is compiled from publicly available sources for general reference only. It does not constitute immigration consulting (移民諮詢), document preparation services, or legal advice. LocalNomad is not a licensed Immigration Service Organization (移民業務機構) under Taiwan\'s Immigration Act.'
      },
      {
        lang: 'zh-Hant',
        text: '本資訊僅彙編自公開來源，僅供一般參考。不構成移民諮詢、文件代辦服務或法律建議。LocalNomad 並非依臺灣入出國及移民法設立之移民業務機構。'
      }
    ],
    legalReferences: ['Immigration Act §56', 'Attorney Act §127']
  },

  japan: {
    country: 'japan',
    paragraphs: [
      {
        lang: 'en',
        text: 'This information is compiled from publicly available sources for general reference only. It does not constitute immigration consulting or legal advice. For personalized guidance, consult a licensed administrative scrivener (行政書士) or immigration lawyer (弁護士). LocalNomad does not provide personalized immigration recommendations or eligibility assessments.'
      },
      {
        lang: 'ja',
        text: '本情報は公開情報を元に一般的な参考として提供しています。入国管理相談や法的助言には該当しません。個別のご相談は行政書士または弁護士にお問い合わせください。'
      }
    ],
    legalReferences: ['行政書士法', '弁護士法']
  },

  china: {
    country: 'china',
    paragraphs: [
      {
        lang: 'en',
        text: 'This information is compiled from publicly available sources for general reference only. It does not constitute immigration advisory services or legal advice. Visa requirements and policies are subject to change — verify with your local Chinese embassy or consulate and the relevant Entry-Exit Administration Bureau. LocalNomad does not provide personalized eligibility assessments or application assistance.'
      },
      {
        lang: 'zh-Hans',
        text: '本信息仅汇编自公开来源，仅供一般参考。不构成移民咨询服务或法律建议。签证要求和政策可能随时更改，请向当地中国大使馆或领事馆及相关出入境管理局核实。'
      }
    ],
    legalReferences: ['Exit-Entry Administration Law', 'Regulations on Administration of Employment of Foreigners']
  },

  'southeast-asia': {
    country: 'southeast-asia',
    paragraphs: [
      {
        lang: 'en',
        text: 'This comparison is compiled from publicly available sources for general reference only. Visa requirements change frequently — always verify with the relevant country\'s immigration authority before applying. This is not immigration consulting or legal advice. LocalNomad is not affiliated with any government immigration authority.'
      }
    ],
    legalReferences: []
  }
};
```

---

## Step 2: Refactor VisaDisclaimer Component

Rewrite `components/visa/visa-disclaimer.tsx` to use the config:

```typescript
import { getTranslations } from 'next-intl/server';
import { DISCLAIMER_CONFIGS } from '@/lib/disclaimer-config';

interface VisaDisclaimerProps {
  country: string;
}

export async function VisaDisclaimer({ country }: VisaDisclaimerProps) {
  const t = await getTranslations('VisaDetail');
  const config = DISCLAIMER_CONFIGS[country];

  if (!config) return null;

  return (
    <div className="mt-12 border-t pt-6">
      <div className="space-y-4">
        {config.paragraphs.map((p, i) => (
          <p key={i} lang={p.lang} className="text-xs leading-relaxed text-muted-foreground">
            {p.text}
          </p>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground/60">
        {t('disclaimer')}
      </p>
    </div>
  );
}
```

### Key changes:
- No more if/else — just config lookup
- `lang` attribute on each paragraph for accessibility/SEO (tells browsers which language the text is in)
- Unknown country returns `null` (graceful fallback)
- Same visual output as before — this is a REFACTOR, not a redesign

---

## Step 3: Verify No Visual Changes

The refactored component must produce **identical HTML output** for Korea and Taiwan pages. This is critical — we are changing the code structure, not the user-visible result.

### Verification approach:
1. Before refactoring, visit `/en/korea/visa/f-2` and `/en/taiwan/visa/gold-card` in browser
2. Note the disclaimer text and structure
3. After refactoring, visit the same pages
4. Confirm identical output

---

## Step 4: Integrate with New Country Pages

After refactoring, the disclaimer automatically works for:
- `/en/japan/visa/{type}` — Shows EN + Japanese disclaimer
- `/en/china/visa/{type}` — Shows EN + Simplified Chinese disclaimer
- `/en/southeast-asia/` — Shows EN-only comparison disclaimer

No additional code needed — just pass the country prop.

---

## Step 5: Update Exports

No changes needed to `components/visa/index.ts` — VisaDisclaimer is already exported.

But DO export the config in case other components need it:
```typescript
// In lib/disclaimer-config.ts — already importable via @/lib/disclaimer-config
```

---

## Verification Commands

```bash
# Check config file exists
ls -la lib/disclaimer-config.ts

# Check component was refactored (should NOT contain 'country === ')
grep -n "country ===" components/visa/visa-disclaimer.tsx
# Expected: no results (all if/else removed)

# Check config has all 5 countries
grep -c "country:" lib/disclaimer-config.ts
# Expected: 5

# Check no legal compliance violations
grep -rn "you qualify\|you are eligible\|recommended visa\|guaranteed" lib/disclaimer-config.ts

# Verify Korea disclaimer text is unchanged
grep -c "행정사" lib/disclaimer-config.ts
# Expected: 1

# Verify Taiwan disclaimer text is unchanged
grep -c "移民業務機構" lib/disclaimer-config.ts
# Expected: 1+ (appears in both EN and Chinese paragraphs)

# Build test
npm run build
```

---

## What NOT To Do

- Do NOT change the visual appearance of Korea/Taiwan disclaimers (refactor only)
- Do NOT move disclaimer text into i18n message files (keep in config for legal auditability — lawyers need to review exact text, not translation keys)
- Do NOT add disclaimer logic to `components/ui/` (shadcn/ui managed)
- Do NOT use `eslint-disable` or `@ts-ignore`
- Do NOT create new page routes (disclaimer is a component used by existing pages)
