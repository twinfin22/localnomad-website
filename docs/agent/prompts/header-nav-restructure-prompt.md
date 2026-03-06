# Header Navigation Restructure — Implementation Prompt

## Overview

Replace the current flat header (Logo + Blog + Language + Dashboard) with a country-centric navigation. Desktop gets a country dropdown; mobile gets a full-screen hamburger menu with all 4 countries expanded.

## Decisions (Already Made)

- **Desktop layout**: `[Logo] [Korea ▾] [Blog] [🌐 EN ▾] [Dashboard]`
- **Mobile layout**: `[Logo] [🌐] [☰]` — hamburger opens full-screen overlay
- **Mobile menu style**: A-2 (all 4 countries fully expanded, NO accordion)
- **Country dropdown contents**: Visa Info + Neighborhoods + Guide links for selected country, plus 3 other country links at bottom as switchers
- **Default country**: Korea (first in list)
- **No new npm packages** — follow existing `LocaleSwitcher` custom dropdown pattern
- **Brand color**: `#1B4965` (already defined as `--primary` in CSS)

## Design Spec

### Desktop Header

```
┌──────────────────────────────────────────────────────────────────┐
│  [LocalNomad Logo]   Korea ▾   Blog       [🌐 EN ▾]  Dashboard │
└──────────────────────────────────────────────────────────────────┘
```

**Left section** (`flex items-center gap-6`):
- Logo → links to `/`
- Country dropdown trigger → text: "🇰🇷 Korea ▾" (flag emoji + country name + chevron)
- Blog → links to `/blog`

**Right section** (`flex items-center gap-4`):
- `LocaleSwitcher` (existing, no changes)
- `AuthNav` (existing, no changes)

### Country Dropdown (Desktop)

Opens on click (not hover). Closes on click-outside, Escape key, or link click.

```
┌─────────────────────────────────────┐
│  🇰🇷 Korea                          │
│                                     │
│  📋 Visa Info        →  /korea/visa │
│  🏘️ Neighborhoods   →  /neighborhood/korea │
│  📖 Guide           →  /blog/guides/korea-ultimate-... │
│                                     │
│  ─────────────────────────────────  │
│  🇯🇵 Japan   🇹🇼 Taiwan   🇨🇳 China  │
│  (click to switch country)          │
└─────────────────────────────────────┘
```

When a different country is clicked at the bottom, the dropdown content updates to show that country's links. The trigger text also updates (e.g., "🇯🇵 Japan ▾"). Use `useState` for selected country. No URL change — only the dropdown content changes.

**Width**: `min-w-[260px]`, positioned `absolute left-0 top-full mt-1`

### Mobile Header (below `md` breakpoint)

```
┌─────────────────────────────────────┐
│  [Logo]                  [🌐]  [☰] │
└─────────────────────────────────────┘
```

- Logo: same as desktop
- Language switcher: **icon only** (hide the locale code label, keep globe icon)
- Hamburger: 3-line icon, toggles mobile menu

**Hidden on mobile**: Country dropdown trigger, Blog link, Dashboard link (all move into hamburger menu)

### Mobile Menu (Full-Screen Overlay)

Opens from right or top. Covers full viewport. White background, z-50+.

```
┌─────────────────────────────────────┐
│                              [✕]    │
│                                     │
│  🇰🇷 Korea                          │
│     Visa Info                       │
│     Neighborhoods                   │
│     Guide                           │
│                                     │
│  🇯🇵 Japan                          │
│     Visa Info                       │
│     Neighborhoods                   │
│     Guide                           │
│                                     │
│  🇹🇼 Taiwan                         │
│     Visa Info                       │
│     Neighborhoods                   │
│     Guide                           │
│                                     │
│  🇨🇳 China                          │
│     Visa Info                       │
│     Neighborhoods                   │
│     Guide                           │
│                                     │
│  ───────────────────────────────    │
│  📝 Blog                            │
│  📊 Dashboard                       │
│                                     │
└─────────────────────────────────────┘
```

**Key behaviors**:
- All 4 countries are always expanded (A-2 style, no accordion)
- Each country shows 3 links (Visa Info, Neighborhoods, Guide)
- Separator line, then Blog + Dashboard
- Close button (✕) in top-right
- Clicking any link closes the menu
- Pressing Escape closes the menu
- Body scroll is locked while menu is open (`overflow-hidden` on body)

## Country Data

Hardcode this in the component. 4 countries only — no dynamic loading needed.

```typescript
const COUNTRIES = [
  {
    key: 'korea',
    emoji: '🇰🇷',
    visaPath: '/korea/visa',
    neighborhoodPath: '/neighborhood/korea',
    guidePath: '/blog/guides/korea-ultimate-digital-nomad-guide',
  },
  {
    key: 'japan',
    emoji: '🇯🇵',
    visaPath: '/japan/visa',
    neighborhoodPath: '/neighborhood/japan',
    guidePath: '/blog/guides/japan-ultimate-digital-nomad-guide',
  },
  {
    key: 'taiwan',
    emoji: '🇹🇼',
    visaPath: '/taiwan/visa',
    neighborhoodPath: '/neighborhood/taiwan',
    guidePath: '/blog/guides/taiwan-ultimate-digital-nomad-guide',
  },
  {
    key: 'china',
    emoji: '🇨🇳',
    visaPath: '/china/visa',
    neighborhoodPath: '/neighborhood/china',
    guidePath: '/blog/guides/china-ultimate-digital-nomad-guide',
  },
] as const;
```

Country display names come from i18n keys: `Nav.countryKorea`, `Nav.countryJapan`, etc.

## Files to Create

### 1. `components/nav/country-dropdown.tsx`

**Client component** (`'use client'`).

- Shows country trigger button on desktop (`hidden md:flex`)
- Dropdown panel with 3 links for selected country + country switcher row
- Follow `components/locale-switcher.tsx` pattern exactly:
  - `useState(open)` for toggle
  - `useState(selectedCountry)` for current country (default: `'korea'`)
  - `useRef` for click-outside detection
  - Keyboard: `Escape` closes, `ArrowDown`/`ArrowUp` navigates links
  - `aria-expanded`, `aria-haspopup`, `role="menu"`, `role="menuitem"`
- Use `Link` from `@/i18n/navigation` for all links
- Use `useTranslations('Nav')` for all text
- Use `cn()` from `@/lib/utils` for conditional classes

### 2. `components/nav/mobile-menu.tsx`

**Client component** (`'use client'`).

- Hamburger button: `md:hidden` (visible only on mobile)
- Full-screen overlay panel: fixed position, z-50, white background
- `useState(open)` for toggle
- When open: add `overflow-hidden` to `document.body`; remove on close/unmount
- Close on: ✕ button click, `Escape` key, any link click
- Render all 4 countries expanded with 3 links each
- Below separator: Blog link + Dashboard link
- Use `Link` from `@/i18n/navigation`
- Use `useTranslations('Nav')` for all text
- Focus trap: when menu opens, focus the close button. When closed, return focus to hamburger button.

### 3. `components/nav/index.ts`

Barrel export:
```typescript
export { CountryDropdown } from './country-dropdown';
export { MobileMenu } from './mobile-menu';
```

## Files to Modify

### 4. `app/[locale]/layout.tsx`

Replace lines 107–129 (the current `<header>` block).

**New structure**:
```tsx
import { CountryDropdown, MobileMenu } from '@/components/nav';

// ... inside the layout return:

<header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-lg">
  <nav aria-label={t('mainNavigation')} className="mx-auto flex items-center justify-between gap-4 px-6 py-3 text-sm">
    {/* Left: Logo + Country Dropdown (desktop) + Blog */}
    <div className="flex items-center gap-6">
      <Link href="/" className="transition-opacity hover:opacity-80">
        <Image src="/logo_new_all-blue.png" alt="LocalNomad" width={140} height={20} priority unoptimized />
      </Link>
      <CountryDropdown />
      <Link href="/blog" className="hidden md:inline-flex font-medium text-foreground/80 transition-colors hover:text-foreground">
        {t('blog')}
      </Link>
    </div>

    {/* Right: Language + Auth (desktop) + Hamburger (mobile) */}
    <div className="flex items-center gap-4">
      <LocaleSwitcher />
      <span className="hidden md:inline-flex"><AuthNav /></span>
      <MobileMenu />
    </div>
  </nav>
</header>
```

Key changes:
- `CountryDropdown` handles its own `hidden md:flex` internally
- Blog link gets `hidden md:inline-flex` (hidden on mobile, moves to hamburger)
- `AuthNav` gets `hidden md:inline-flex` wrapper (hidden on mobile, moves to hamburger)
- `MobileMenu` handles its own `md:hidden` internally

### 5. `components/locale-switcher.tsx`

**Small change**: On mobile, hide the locale code text. Show only the globe icon.

Change the button content from:
```tsx
<svg ...>...</svg>
{localeLabels[locale]}
<svg ...>...</svg>  {/* chevron */}
```

To:
```tsx
<svg ...>...</svg>
<span className="hidden md:inline">{localeLabels[locale]}</span>
<svg className="hidden md:inline ..." ...>...</svg>  {/* chevron - also hidden on mobile */}
```

This makes the language switcher show only 🌐 on mobile, full `🌐 EN ▾` on desktop.

### 6. `messages/en.json` — Add Nav keys

Add these keys to the `"Nav"` namespace:

```json
"Nav": {
  "skipToContent": "Skip to content",
  "mainNavigation": "Main navigation",
  "blog": "Blog",
  "countryKorea": "Korea",
  "countryJapan": "Japan",
  "countryTaiwan": "Taiwan",
  "countryChina": "China",
  "visaInfo": "Visa Info",
  "neighborhoods": "Neighborhoods",
  "guide": "Guide",
  "moreCountries": "Switch country",
  "openMenu": "Open menu",
  "closeMenu": "Close menu"
}
```

### 7. `messages/ja.json` — Add Nav keys

```json
"Nav": {
  "skipToContent": "コンテンツへスキップ",
  "mainNavigation": "メインナビゲーション",
  "blog": "ブログ",
  "countryKorea": "韓国",
  "countryJapan": "日本",
  "countryTaiwan": "台湾",
  "countryChina": "中国",
  "visaInfo": "ビザ情報",
  "neighborhoods": "エリアガイド",
  "guide": "ガイド",
  "moreCountries": "国を切り替え",
  "openMenu": "メニューを開く",
  "closeMenu": "メニューを閉じる"
}
```

### 8. `messages/zh-cn.json` — Add Nav keys

```json
"Nav": {
  "skipToContent": "跳转到内容",
  "mainNavigation": "主导航",
  "blog": "博客",
  "countryKorea": "韩国",
  "countryJapan": "日本",
  "countryTaiwan": "台湾",
  "countryChina": "中国",
  "visaInfo": "签证信息",
  "neighborhoods": "社区指南",
  "guide": "指南",
  "moreCountries": "切换国家",
  "openMenu": "打开菜单",
  "closeMenu": "关闭菜单"
}
```

### 9. `messages/zh-tw.json` — Add Nav keys

```json
"Nav": {
  "skipToContent": "跳轉至內容",
  "mainNavigation": "主導覽",
  "blog": "部落格",
  "countryKorea": "韓國",
  "countryJapan": "日本",
  "countryTaiwan": "台灣",
  "countryChina": "中國",
  "visaInfo": "簽證資訊",
  "neighborhoods": "社區指南",
  "guide": "指南",
  "moreCountries": "切換國家",
  "openMenu": "開啟選單",
  "closeMenu": "關閉選單"
}
```

### 10. `messages/vi.json` — Add Nav keys

```json
"Nav": {
  "skipToContent": "Chuyển đến nội dung",
  "mainNavigation": "Điều hướng chính",
  "blog": "Blog",
  "countryKorea": "Hàn Quốc",
  "countryJapan": "Nhật Bản",
  "countryTaiwan": "Đài Loan",
  "countryChina": "Trung Quốc",
  "visaInfo": "Thông tin visa",
  "neighborhoods": "Khu vực",
  "guide": "Hướng dẫn",
  "moreCountries": "Đổi quốc gia",
  "openMenu": "Mở menu",
  "closeMenu": "Đóng menu"
}
```

## Styling Guidelines

- Follow existing Tailwind patterns from `locale-switcher.tsx`
- Dropdown panel: `rounded-md border bg-white shadow-md` (matches locale switcher)
- Hover states: `hover:bg-muted hover:text-foreground` (matches existing)
- Active/selected: `bg-primary/5 font-medium text-primary` (matches locale switcher)
- Country name in trigger: `font-medium text-foreground/80`
- Mobile menu overlay: `fixed inset-0 z-50 bg-white`
- Mobile menu links: `text-base` (slightly larger than desktop `text-sm`)
- Sub-links (Visa, Neighborhoods, Guide): `text-muted-foreground text-sm pl-6` indented under country name
- Country names in mobile: `text-base font-medium text-foreground`
- Separator: `border-t border-border/60 my-4`

## Accessibility Requirements

- Dropdown trigger: `aria-expanded`, `aria-haspopup="true"`
- Dropdown panel: `role="menu"`
- Each link in dropdown: `role="menuitem"`
- Keyboard: `Escape` closes dropdown/menu, `ArrowDown`/`ArrowUp` moves focus between items
- Mobile hamburger: `aria-label={t('openMenu')}` / close button: `aria-label={t('closeMenu')}`
- Mobile menu: focus trap (tab should cycle within menu while open)
- When menu closes, return focus to the element that opened it

## Constraints

- **DO NOT** install new npm packages
- **DO NOT** modify anything in `components/ui/` (shadcn-managed)
- **DO NOT** change `AuthNav` or `LogoutButton` components — only wrap them
- **DO NOT** change LocaleSwitcher behavior, only adjust which parts are visible on mobile via Tailwind responsive classes
- Use `Link` from `@/i18n/navigation` for ALL internal links (not `next/link`)
- Use `useTranslations('Nav')` for ALL visible text
- Use `cn()` from `@/lib/utils` for conditional classes

## Verification

After implementation, verify:

1. **Desktop dropdown**: Click "Korea ▾" → shows 3 links (Visa, Neighborhoods, Guide) + 3 other country pills. Click Japan → content switches to Japan links. Click a link → navigates correctly.
2. **Desktop keyboard**: Focus on trigger → ArrowDown opens dropdown → ArrowDown/Up moves between links → Enter follows link → Escape closes.
3. **Mobile menu**: Resize to < 768px → only Logo + 🌐 + ☰ visible. Click ☰ → full-screen menu with all 4 countries expanded. Click a link → navigates and menu closes. Click ✕ → menu closes.
4. **Mobile scroll lock**: While menu is open, background should not scroll.
5. **Language switch**: Change to Japanese → all Nav labels update (韓国, ビザ情報, etc.)
6. **Click-outside**: Click anywhere outside dropdown → closes. Click anywhere outside mobile menu overlay → does NOT close (must use ✕ or Escape).
7. **Build check**: `npm run build` passes with no errors.
