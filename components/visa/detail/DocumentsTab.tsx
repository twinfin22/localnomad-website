import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/animated-section";
import type { VisaInfo } from "@/lib/visa/types";

interface DocumentsTabProps {
  visa: VisaInfo;
}

export function DocumentsTab({ visa }: DocumentsTabProps) {
  return (
    <AnimatedSection>
      <div>
        <h2 className="text-2xl font-bold  mb-6">
          Required Documents
        </h2>
        <div className="space-y-4">
          {visa.documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    doc.required
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{doc.name}</h3>
                    {doc.required ? (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        Required
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {doc.description}
                  </p>
                  {doc.tips && doc.tips.length > 0 && (
                    <div className="bg-accent/5 rounded-lg p-3">
                      <p className="text-xs font-medium text-accent mb-1">
                        Tips:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {doc.tips.map((tip, i) => (
                          <li key={`doc-tip-${i}`} className="flex items-start gap-1">
                            <span className="text-accent">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {doc.where_to_get && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Where to get:</span>{" "}
                      {doc.where_to_get}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
