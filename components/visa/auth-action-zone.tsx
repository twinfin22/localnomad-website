import { getSession } from '@/lib/actions/auth';
import { getActiveVisa, getChecklist } from '@/lib/actions/dashboard';
import { ActionZone } from './action-zone';
import type { Visa } from '@/lib/types/visa';
import type { ChecklistItem } from '@/lib/types/dashboard';

const COUNTRY_SLUG_TO_CODE: Record<string, string> = {
  korea: 'kr',
  taiwan: 'tw',
};

interface AuthActionZoneProps {
  visa: Visa;
  country: string;
}

export async function AuthActionZone({ visa, country }: AuthActionZoneProps) {
  const user = await getSession();
  let userVisaId: string | undefined;
  let serverChecklist: ChecklistItem[] | undefined;

  if (user) {
    const activeVisa = await getActiveVisa();
    if (
      activeVisa &&
      activeVisa.country === COUNTRY_SLUG_TO_CODE[country] &&
      activeVisa.visa_type === visa.type
    ) {
      userVisaId = activeVisa.id;
      serverChecklist = await getChecklist(activeVisa.id);
    }
  }

  return (
    <ActionZone
      documents={visa.documents}
      applicationSteps={visa.applicationSteps}
      visaType={visa.type}
      country={country}
      isLoggedIn={!!user}
      userVisaId={userVisaId}
      serverChecklist={serverChecklist}
    />
  );
}
