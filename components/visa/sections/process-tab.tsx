import { ApplicationSteps } from './application-steps';
import type { Visa } from '@/lib/types/visa';

interface ProcessTabProps {
  visa: Visa;
}

export function ProcessTab({ visa }: ProcessTabProps) {
  return (
    <div>
      <ApplicationSteps steps={visa.applicationSteps} />
    </div>
  );
}
