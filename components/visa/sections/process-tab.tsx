import { TimelineFees } from './timeline-fees';
import { ApplicationSteps } from './application-steps';
import type { Visa } from '@/lib/types/visa';

interface ProcessTabProps {
  visa: Visa;
}

export function ProcessTab({ visa }: ProcessTabProps) {
  return (
    <div className="space-y-8">
      <TimelineFees visa={visa} />
      <ApplicationSteps steps={visa.applicationSteps} />
    </div>
  );
}
