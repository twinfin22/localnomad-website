import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { createSlugTracker } from '@/lib/blog/utils';

const BudgetTable = ({
  data,
}: {
  data: { item: string; budget: string; mid: string; comfort: string }[];
}) => {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#1B4965]">
            <th className="py-2 pr-4 text-left">Item</th>
            <th className="px-4 py-2 text-right">Budget</th>
            <th className="px-4 py-2 text-right">Mid-Range</th>
            <th className="px-4 py-2 text-right">Comfort</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-2 pr-4 font-medium">{row.item}</td>
              <td className="px-4 py-2 text-right">{row.budget}</td>
              <td className="px-4 py-2 text-right">{row.mid}</td>
              <td className="px-4 py-2 text-right">{row.comfort}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Callout = ({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'tip';
  children: React.ReactNode;
}) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    tip: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  };
  const icons = { info: '\u2139\ufe0f', warning: '\u26a0\ufe0f', tip: '\ud83d\udca1' };

  return (
    <div className={`my-6 rounded-r-lg border-l-4 p-4 ${styles[type]}`}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
};

const Disclaimer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm italic text-gray-600">
      {children}
    </div>
  );
};

interface HeroBannerItem {
  emoji: string;
  label: string;
  value: string;
}

interface HeroBannerProps {
  title: string;
  data: HeroBannerItem[];
  extras?: string;
}

const HeroBanner = ({ title, data, extras }: HeroBannerProps) => {
  return (
    <div className="not-prose my-8 rounded-xl bg-[#1B4965] px-6 py-6 text-white">
      <h2 className="mb-4 text-lg font-bold tracking-wide text-white/90">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-baseline gap-2 text-sm">
            <span>{item.emoji}</span>
            <span className="text-white/70">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
      {extras && (
        <p className="mt-4 border-t border-white/20 pt-3 text-sm text-white/80">
          {extras}
        </p>
      )}
    </div>
  );
};

interface WeatherMonth {
  month: string;
  temp: number;
  humidity: 'low' | 'moderate' | 'high' | 'very high';
  rain: 'dry' | 'low' | 'moderate' | 'heavy' | 'monsoon';
  note: string;
  ideal?: boolean;
}

interface WeatherChartProps {
  data: WeatherMonth[];
  unit?: 'C' | 'F';
}

const WeatherChart = ({ data, unit = 'C' }: WeatherChartProps) => {
  const getBarColor = (temp: number) => {
    if (temp <= 0) return 'bg-blue-400';
    if (temp <= 10) return 'bg-sky-400';
    if (temp <= 18) return 'bg-emerald-400';
    if (temp <= 25) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const getBarWidth = (temp: number) => {
    // Normalize temp to 0-100% range (-10 to 40)
    const pct = Math.max(0, Math.min(100, ((temp + 10) / 50) * 100));
    return `${pct}%`;
  };

  const humidityDots: Record<string, string> = {
    low: '\uD83D\uDCA7',
    moderate: '\uD83D\uDCA7\uD83D\uDCA7',
    high: '\uD83D\uDCA7\uD83D\uDCA7\uD83D\uDCA7',
    'very high': '\uD83D\uDCA7\uD83D\uDCA7\uD83D\uDCA7\uD83D\uDCA7',
  };

  const rainIcons: Record<string, string> = {
    dry: '\u2600\uFE0F',
    low: '\uD83C\uDF24',
    moderate: '\uD83C\uDF27',
    heavy: '\uD83C\uDF27\uD83C\uDF27',
    monsoon: '\u26C8\uFE0F',
  };

  return (
    <div className="not-prose my-6 overflow-x-auto">
      <div className="min-w-[480px] space-y-1">
        {data.map((m) => (
          <div
            key={m.month}
            className={cn(
              'grid grid-cols-[3rem_1fr_3rem_2.5rem_1fr] items-center gap-2 rounded px-3 py-1.5 text-sm',
              m.ideal ? 'bg-emerald-50' : 'bg-gray-50',
            )}
          >
            <span className="font-medium">{m.month}</span>
            <div className="flex items-center gap-2">
              <div className="h-4 w-full max-w-[200px] rounded-full bg-gray-200">
                <div
                  className={cn('h-4 rounded-full', getBarColor(m.temp))}
                  style={{ width: getBarWidth(m.temp) }}
                />
              </div>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {m.temp}&deg;{unit}
              </span>
            </div>
            <span className="text-xs">{humidityDots[m.humidity]}</span>
            <span className="text-xs">{rainIcons[m.rain]}</span>
            <span
              className={cn(
                'text-xs',
                m.ideal
                  ? 'font-medium text-emerald-700'
                  : 'text-muted-foreground',
              )}
            >
              {m.ideal ? '\u2B50 ' : ''}
              {m.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  NeighborhoodCard — City neighborhood showcase cards               */
/* ------------------------------------------------------------------ */

interface Neighborhood {
  name: string;
  vibe: string;
  rent: string;
  why: string;
}

interface NeighborhoodCardsProps {
  city?: string;
  data: Neighborhood[];
}

const NeighborhoodCards = ({ city, data }: NeighborhoodCardsProps) => (
  <div className="not-prose my-6">
    {city && (
      <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {city}
      </p>
    )}
    <div className="grid gap-3 sm:grid-cols-2">
      {data.map((n) => (
        <div
          key={n.name}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <h4 className="text-base font-bold text-[#1B4965]">{n.name}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">{n.vibe}</p>
          <p className="mt-2 text-sm font-semibold">{n.rent}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{n.why}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  StatusList — Group items by status (blocked / partial / works)    */
/* ------------------------------------------------------------------ */

interface StatusItem {
  name: string;
  note?: string;
}

interface StatusGroup {
  status: 'blocked' | 'partial' | 'works';
  label?: string;
  items: StatusItem[];
}

interface StatusListProps {
  groups: StatusGroup[];
}

const statusStyles: Record<
  string,
  { dot: string; bg: string; border: string; text: string; label: string }
> = {
  blocked: {
    dot: 'bg-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    label: 'Blocked',
  },
  partial: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    label: 'Unreliable',
  },
  works: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    label: 'Works',
  },
};

const StatusList = ({ groups }: StatusListProps) => (
  <div className="not-prose my-6 space-y-4">
    {groups.map((g) => {
      const s = statusStyles[g.status];
      return (
        <div key={g.status} className={cn('rounded-lg border p-4', s.bg, s.border)}>
          <div className={cn('mb-3 flex items-center gap-2 text-sm font-semibold', s.text)}>
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', s.dot)} />
            {g.label ?? s.label}
          </div>
          <ul className="space-y-1.5">
            {g.items.map((item) => (
              <li key={item.name} className={cn('flex items-baseline gap-2 text-sm', s.text)}>
                <span className="font-medium">{item.name}</span>
                {item.note && (
                  <span className="text-xs opacity-70">— {item.note}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/*  ResponsiveTable — sticky first column + horizontal scroll         */
/* ------------------------------------------------------------------ */

interface ResponsiveTableProps {
  headers: string[];
  rows: string[][];
  caption?: string;
}

const ResponsiveTable = ({ headers, rows, caption }: ResponsiveTableProps) => (
  <div className="not-prose my-6">
    {caption && (
      <p className="mb-2 text-sm font-medium text-muted-foreground">{caption}</p>
    )}

    <div className="relative overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#1B4965] bg-gray-50">
            {headers.map((h, i) => (
              <th
                key={i}
                className={cn(
                  'py-2.5 text-left font-semibold',
                  i === 0
                    ? 'sticky left-0 z-10 max-w-[10rem] bg-gray-50 pl-4 pr-3 after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-gray-200'
                    : 'whitespace-nowrap px-4',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={cn(
                'border-b border-gray-100',
                ri % 2 === 1 ? 'bg-gray-50/50' : 'bg-white',
              )}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    'py-2.5',
                    ci === 0
                      ? cn(
                          'sticky left-0 z-10 max-w-[10rem] pl-4 pr-3 font-medium',
                          'after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-gray-200',
                          ri % 2 === 1 ? 'bg-gray-50/50' : 'bg-white',
                        )
                      : 'sm:whitespace-nowrap px-4',
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  DecisionTree — Visual yes/no flowchart for blog comparison posts   */
/* ------------------------------------------------------------------ */

interface DecisionNode {
  question: string;
  yes?: string | DecisionNode;
  no?: string | DecisionNode;
}

interface DecisionTreeProps {
  data: DecisionNode;
}

const AnswerBox = ({ text }: { text: string }) => (
  <div className="rounded-lg border-2 border-[#1B4965] bg-[#1B4965]/5 px-4 py-2.5 text-sm font-semibold text-[#1B4965]">
    {text}
  </div>
);

const TreeNode = ({ node, depth = 0 }: { node: DecisionNode; depth?: number }) => {
  const isYesLeaf = typeof node.yes === 'string';
  const isNoLeaf = typeof node.no === 'string';

  return (
    <div className={cn('flex flex-col items-center', depth > 0 && 'mt-1')}>
      {/* Question */}
      <div className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium shadow-sm">
        {node.question}
      </div>

      {/* Vertical stem from question down to the T-junction */}
      <div className="h-6 w-0.5 bg-gray-300" />

      {/* T-junction: horizontal bar connecting left and right branches */}
      <div className="relative flex w-full items-start justify-center">
        {/* Horizontal connector bar */}
        <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gray-300" />

        {/* Yes branch (left) */}
        <div className="flex flex-1 flex-col items-center">
          <div className="h-5 w-0.5 bg-emerald-400" />
          <span className="mb-1 text-xs font-bold text-emerald-600">Yes</span>
          <div className="h-3 w-0.5 bg-emerald-400" />
          {isYesLeaf ? (
            <AnswerBox text={node.yes as string} />
          ) : (
            <TreeNode node={node.yes as DecisionNode} depth={depth + 1} />
          )}
        </div>

        {/* No branch (right) */}
        <div className="flex flex-1 flex-col items-center">
          <div className="h-5 w-0.5 bg-red-400" />
          <span className="mb-1 text-xs font-bold text-red-500">No</span>
          <div className="h-3 w-0.5 bg-red-400" />
          {isNoLeaf ? (
            <AnswerBox text={node.no as string} />
          ) : (
            <TreeNode node={node.no as DecisionNode} depth={depth + 1} />
          )}
        </div>
      </div>
    </div>
  );
};

const DecisionTree = ({ data }: DecisionTreeProps) => (
  <div className="not-prose my-8 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50/50 p-6">
    <TreeNode node={data} />
  </div>
);

/* ------------------------------------------------------------------ */

const extractText = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return extractText((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
};

export const createMdxComponents = (): MDXComponents => {
  const uniqueSlug = createSlugTracker();
  return {
  h2: (props) => {
    const text = extractText(props.children);
    const id = uniqueSlug(text);
    return <h2 id={id} className="scroll-mt-24" {...props} />;
  },
  h3: (props) => {
    const text = extractText(props.children);
    const id = uniqueSlug(text);
    return <h3 id={id} className="scroll-mt-24" {...props} />;
  },
  img: (props) => {
    const { src, alt, ...rest } = props as Record<string, unknown>;
    if (!src) return null;
    return (
      <Image
        src={src as string}
        alt={(alt as string) || ''}
        width={800}
        height={400}
        className="my-6 rounded-lg"
        {...rest}
      />
    );
  },
  a: (props) => (
    <a
      {...props}
      className="text-[#1B4965] underline hover:text-[#1B4965]/80"
      target={
        (props.href as string)?.startsWith('http') ? '_blank' : undefined
      }
      rel={
        (props.href as string)?.startsWith('http')
          ? 'noopener noreferrer'
          : undefined
      }
    />
  ),
  BudgetTable,
  Callout,
  Disclaimer,
  HeroBanner,
  WeatherChart,
  StatusList,
  ResponsiveTable,
  NeighborhoodCards,
  DecisionTree,
};
};
