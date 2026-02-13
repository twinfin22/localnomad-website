export interface TaiwanSituation {
  id: string;
  titleKey: string; // i18n key
  descriptionKey: string; // i18n key
  icon: string; // Lucide icon name
  visaTypes: string[]; // Taiwan visa type slugs
  href: string;
}

export const TAIWAN_SITUATIONS: TaiwanSituation[] = [
  {
    id: 'professional',
    titleKey: 'visa.tw.situation.professional.title',
    descriptionKey: 'visa.tw.situation.professional.description',
    icon: 'Award',
    visaTypes: ['gold-card'],
    href: 'gold-card',
  },
  {
    id: 'remote-work',
    titleKey: 'visa.tw.situation.remoteWork.title',
    descriptionKey: 'visa.tw.situation.remoteWork.description',
    icon: 'Laptop',
    visaTypes: ['dnv'],
    href: 'dnv',
  },
  {
    id: 'employment',
    titleKey: 'visa.tw.situation.employment.title',
    descriptionKey: 'visa.tw.situation.employment.description',
    icon: 'Briefcase',
    visaTypes: ['work-arc'],
    href: 'work-arc',
  },
  {
    id: 'visitor',
    titleKey: 'visa.tw.situation.visitor.title',
    descriptionKey: 'visa.tw.situation.visitor.description',
    icon: 'Plane',
    visaTypes: ['visitor'],
    href: 'visitor',
  },
];
