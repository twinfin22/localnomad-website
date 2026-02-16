import { Clock, Lightbulb, ExternalLink } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import type { VisaInfo } from "@/lib/visa/types";

interface ProcessTabProps {
  visa: VisaInfo;
}

export function ProcessTab({ visa }: ProcessTabProps) {
  return (
    <AnimatedSection>
      <div>
        <h2 className="text-2xl font-bold  mb-6">
          Application Process
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {visa.applicationSteps.map((step) => (
              <div key={step.id} className="relative flex gap-6">
                {/* Step number */}
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0 z-10">
                  {step.step}
                </div>

                {/* Step content */}
                <div className="flex-1 bg-card border border-border rounded-xl p-6 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {step.title}
                    </h3>
                    {step.duration && (
                      <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  {step.tips && step.tips.length > 0 && (
                    <div className="bg-accent/5 rounded-lg p-3 mb-3">
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {step.tips.map((tip, i) => (
                          <li key={`step-tip-${i}`} className="flex items-start gap-1">
                            <Lightbulb className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {step.links && step.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {step.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
