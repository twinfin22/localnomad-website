interface TimelineStep {
  label: string;
  detail?: string;
}

interface TransitionTimelineProps {
  steps: TimelineStep[];
}

export function TransitionTimeline({ steps }: TransitionTimelineProps) {
  return (
    <ol className="flex flex-col gap-0 pt-1" aria-label="Process timeline">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          {/* Left column: dot + line */}
          <div className="flex w-7 shrink-0 flex-col items-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B4965] text-xs font-bold text-white">
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="my-1 w-0.5 flex-1 bg-slate-200" aria-hidden="true" />
            )}
          </div>
          {/* Right column: content */}
          <div className={`pb-4 ${i < steps.length - 1 ? '' : ''}`}>
            <p className="pt-1 text-sm font-semibold text-slate-800">{step.label}</p>
            {step.detail && (
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.detail}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
