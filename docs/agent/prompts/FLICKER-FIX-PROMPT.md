# Flickering Fix Prompt

> **목적**: TD#1~TD#4 flickering 기술 부채 해소
> **결정 근거**: DECISION-LOG.md 2025-02-17 참조
> **수정 파일**: 4개 파일 수정 + 3개 파일 삭제
> **위험도**: 🟢 낮음 — 전부 개별 컴포넌트, 레이아웃/라우팅 변경 없음

---

## 실행 전 주의사항

- `suppressHydrationWarning`, `eslint-disable`, `@ts-ignore` 사용 금지
- `components/ui/` 폴더는 수정 금지 (shadcn/ui 관리)
- 각 Task 완료 후 `npm run build` 로 빌드 확인
- 모든 Task 완료 후 `npm run build && npm run lint` 최종 확인

---

## Task 1: useIsMobile 제거 (TD#1)

### 배경
`useIsMobile()` hook은 `components/ui/sidebar.tsx`에서만 사용되는데, sidebar.tsx 자체가 프로젝트 어디서도 import되지 않는 dead code임. 따라서 useIsMobile을 CSS로 대체할 필요 없이, 관련 파일을 모두 삭제하면 됨.

### 작업

**삭제할 파일 3개:**
```
hooks/use-mobile.ts
components/ui/use-mobile.tsx
components/ui/sidebar.tsx
```

**확인 사항:**
- 삭제 전 `grep -r "sidebar" app/ components/ --include="*.tsx" --include="*.ts"` 실행하여 sidebar를 import하는 곳이 없는지 재확인
- 삭제 전 `grep -r "use-mobile" app/ components/ lib/ --include="*.tsx" --include="*.ts"` 실행하여 다른 곳에서 사용하지 않는지 재확인
- 만약 사용처가 발견되면 삭제하지 말고 아래 CSS 대체 방안으로 전환:

**사용처가 발견된 경우의 대체 방안 (fallback):**
```tsx
// hooks/use-mobile.ts 를 아래로 교체
// CSS media query로 대체 — useEffect 없이 작동
import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot() {
  return false; // 서버에서는 데스크톱으로 가정
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

> 📘 useSyncExternalStore: React 18에서 추가된 hook. 외부 데이터 소스(여기서는 화면 크기)를 서버/클라이언트 안전하게 구독. useEffect와 달리 hydration 불일치를 일으키지 않음.

---

## Task 2: DDayCounter를 Server Component로 전환 (TD#2)

### 배경
DDayCounter는 `useState(null)` → `useEffect`에서 날짜 계산 → null이 숫자로 바뀌며 flickering 발생. `getDaysUntil()`은 `new Date()`만 사용하고 브라우저 API(window, localStorage 등)가 불필요하므로 Server Component로 전환 가능.

현재 DDayCounter는 `components/visa/index.ts`에서 export되지만 실제 import하는 곳이 없음. 하지만 향후 사용을 위해 Server Component로 리팩토링.

### 작업

**파일**: `components/visa/DDayCounter.tsx`

**변경 내용:**
1. `"use client"` 제거
2. `useState`, `useEffect` 제거
3. 날짜 계산을 함수 본문에서 직접 수행 (렌더링 시 서버에서 계산)
4. 매시간 업데이트 interval → 삭제 (24시간 단위 카운터에서 실시간 업데이트 불필요. 페이지 새로고침 시 자연스럽게 갱신됨)

**변경 후 코드:**
```tsx
import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDaysUntil, formatDaysRemaining, getUrgency } from "@/lib/visa/stateMachine";

interface DDayCounterProps {
  targetDate?: Date;
  label?: string;
  className?: string;
}

export function DDayCounter({ targetDate, label = "D-Day", className }: DDayCounterProps) {
  // 서버에서 직접 계산 — useEffect/useState 불필요
  const days = targetDate ? getDaysUntil(targetDate) : null;
  const urgency = getUrgency(days);

  const urgencyStyles = {
    critical: {
      bg: "bg-error/10",
      border: "border-error/30",
      text: "text-error",
      glow: "shadow-[0_0_20px_rgba(248,113,113,0.2)]",
      icon: AlertTriangle,
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
      icon: AlertTriangle,
    },
    normal: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
      glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)]",
      icon: Calendar,
    },
    none: {
      bg: "bg-elevated",
      border: "border-elevated",
      text: "text-muted-foreground",
      glow: "",
      icon: Calendar,
    },
  };

  const style = urgencyStyles[urgency];
  const IconComponent = style.icon;

  return (
    <div className={cn(
      "bg-surface border border-border rounded-xl p-6 transition-all duration-300",
      style.glow,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          style.bg
        )}>
          <IconComponent className={cn("w-5 h-5", style.text)} />
        </div>
      </div>

      {days !== null ? (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={cn(
              "text-5xl font-bold tabular-nums",
              style.text
            )}>
              {Math.abs(days)}
            </span>
            <span className="text-lg text-muted-foreground">
              {days < 0 ? "days overdue" : "days"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDaysRemaining(days)}
          </p>

          {urgency === "critical" && (
            <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20">
              <p className="text-xs text-error flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Urgent action required
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-success" />
          <span className="text-lg text-muted-foreground">No deadline set</span>
        </div>
      )}
    </div>
  );
}
```

---

## Task 3: VisaJourneyPage 배너 flickering 수정 (TD#3)

### 배경
현재: `bannerDismissed` 초기값 `true`(숨김) → useEffect에서 localStorage 확인 → 닫지 않은 유저는 `false`로 변경 → 배너가 갑자기 나타남.

수정: 초기값을 `false`(표시)로 변경. localStorage에 "닫힘"이 있는 유저만 숨김. 방향이 "없다가 나타남" → "있다가 사라짐"으로 바뀌어, 대부분의 신규 유저는 flickering을 안 봄.

### 작업

**파일**: `components/visa/journey/VisaJourneyPage.tsx`

**변경할 줄 (line 72):**
```tsx
// 변경 전:
const [bannerDismissed, setBannerDismissed] = useState(true);

// 변경 후:
const [bannerDismissed, setBannerDismissed] = useState(false);
```

**나머지 useEffect (line 74-79)는 그대로 유지** — localStorage에 "닫힘"이 저장된 유저에게는 useEffect 실행 후 배너가 사라짐. 이건 "있다가 없어지는" 방향이라 "없다가 나타나는" 것보다 시각적으로 덜 눈에 띔.

---

## Task 4: ChecklistStep hash 중복 로직 제거 (TD#4)

### 배경
ChecklistStep 내부에 hash 기반 deep link 로직이 있는데, 부모(VisaJourneyPage)에서 이미 `openStep` state로 제어하고 있음. 중복 로직이며, ChecklistStep의 useEffect가 flickering을 유발.

### 작업

**파일**: `components/visa/journey/ChecklistStep.tsx`

**삭제할 코드 (line 36-51):**
```tsx
  // Handle hash-based deep linking  ← 이 블록 전체 삭제
  useEffect(() => {
    if (id && typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      if (hash === id) {
        setIsOpen(true);
        // Scroll into view after render
        setTimeout(() => {
          contentRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, [id]);
```

**삭제 후 import 정리:**
- `useEffect`가 아직 line 32에서 사용됨 (defaultOpen sync) → import 유지
- `useRef`는 contentRef에서 사용 → import 유지

hash deep link는 이미 VisaJourneyPage.tsx line 48-62에서 처리되고 있으므로 기능 손실 없음.

---

## Task 5: 미사용 percentage 코드 삭제 (TD#5)

### 배경
EligibilityQuiz.tsx는 이미 삭제된 파일이므로 확인만 수행.

### 작업
- `grep -r "percentage\|matchScore\|match_score" components/ --include="*.tsx" --include="*.ts"` 실행
- 잔존 scoring 코드가 있으면 삭제
- 없으면 이 Task는 skip

---

## Task 6: 빌드 검증

```bash
npm run build && npm run lint
```

- 빌드 성공 확인
- lint 에러 없음 확인
- 실패 시: 에러 메시지 확인 후 해당 Task만 수정. 다른 Task에 영향 주지 않도록.

---

## 검증 가이드 (Gen님이 직접 확인)

실행 후 Claude가 아닌 Gen님이 브라우저에서 직접 확인해야 할 항목:

| 확인 항목 | 페이지 | 방법 |
|-----------|--------|------|
| DDayCounter flickering | 비자 상세 페이지 (DDayCounter 사용 시) | 새로고침 시 숫자가 null→값으로 바뀌는지 확인 |
| 배너 flickering | `/korea/visa/d-10` journey 페이지 | 새로고침 시 배너가 갑자기 나타나는지 확인 |
| 아코디언 flickering | `/korea/visa/d-10#after-approval` | hash 링크로 접속 시 깜빡임 없이 해당 스텝이 열리는지 확인 |
| 모바일 레이아웃 | 모든 페이지 (Chrome DevTools 모바일 뷰) | 레이아웃이 깜빡이지 않는지 확인 |
| 기존 기능 정상 | 비자 상세 → 아코디언 클릭 → FAQ → 리소스 | 기존 상호작용이 정상 작동하는지 확인 |

## 롤백 기준
- 빌드 실패
- 기존 페이지에서 새로운 flickering 발생
- 아코디언/배너 기능이 작동하지 않음

위 중 하나라도 해당되면 `git checkout -- .` 로 전체 되돌림.

---

## 문서 업데이트 (실행 후)

1. `docs/governance/TECH-DEBT.md`: TD#1~TD#5 → Resolved로 이동
2. `docs/governance/DECISION-LOG.md`: flickering 수정 결정 기록
3. 현황 요약 업데이트: OPEN 0개
