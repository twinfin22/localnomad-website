import { DocumentChecklist } from '../action-zone';
import type { Visa } from '@/lib/types/visa';

interface DocumentsTabProps {
  visa: Visa;
  country: string;
}

export function DocumentsTab({ visa, country }: DocumentsTabProps) {
  // Sort documents: essential first, then remaining in original order
  const sortedDocuments = [
    ...visa.documents.filter((d) => d.priority === 'essential'),
    ...visa.documents.filter((d) => d.priority !== 'essential'),
  ];

  return (
    <DocumentChecklist
      documents={sortedDocuments}
      visaType={visa.type}
      country={country}
    />
  );
}
