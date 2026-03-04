import { cn } from '@/lib/utils';
import type { SEAComparisonData } from '@/lib/types/sea';

interface SEAComparisonTableProps {
  data: SEAComparisonData;
}

const FLAG_MAP: Record<string, string> = {
  Thailand: '🇹🇭',
  Indonesia: '🇮🇩',
  Malaysia: '🇲🇾',
  Philippines: '🇵🇭',
};

const isNegative = (value: string) =>
  value.startsWith('No') || value.startsWith('Not ');

export function SEAComparisonTable({ data }: SEAComparisonTableProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lora text-2xl font-bold text-primary">
          {data.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Last updated: {data.lastUpdated}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[160px] border-b border-r bg-[#1B4965] px-4 py-3 text-left text-xs font-semibold text-white">
                Attribute
              </th>
              {data.visas.map((visa) => (
                <th
                  key={visa.country}
                  className="min-w-[200px] border-b bg-[#1B4965] px-4 py-3 text-left text-xs font-semibold text-white"
                >
                  <span className="mr-1.5">{FLAG_MAP[visa.country]}</span>
                  {visa.visaName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.columns.map((column, rowIndex) => (
              <tr
                key={column.id}
                className={cn(rowIndex % 2 === 1 && 'bg-neutral-50')}
              >
                <td className="sticky left-0 z-10 border-r bg-white px-4 py-3 text-xs font-medium text-primary">
                  {column.displayName}
                </td>
                {data.visas.map((visa) => {
                  const value = visa.data[column.id] ?? '';
                  const negative =
                    column.dataType === 'boolean-text' && isNegative(value);
                  return (
                    <td
                      key={`${visa.country}-${column.id}`}
                      className={cn(
                        'px-4 py-3 text-xs text-muted-foreground',
                        negative && 'bg-red-50 text-red-700',
                      )}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground/80">{data.disclaimer}</p>

      {data.sources.length > 0 && (
        <div className="text-xs text-muted-foreground/60">
          <span className="font-medium">Sources: </span>
          {data.sources.map((source, i) => (
            <span key={source.url}>
              {i > 0 && ' · '}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {source.label}
              </a>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
