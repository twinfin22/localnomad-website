import { Clock, DollarSign, Timer, Briefcase } from 'lucide-react';
import type { VisaInfo } from '@/lib/visa/types';

interface VisaSnapshotProps {
  visa: VisaInfo;
}

export function VisaSnapshot({ visa }: VisaSnapshotProps) {
  // Get work status text
  const getWorkStatus = () => {
    if (!visa.workPermission.allowed) {
      return { label: 'Not Permitted', sublabel: null };
    }
    if (visa.workPermission.restrictions && visa.workPermission.restrictions.length > 0) {
      // Get first restriction as sublabel
      const firstRestriction = visa.workPermission.restrictions[0];
      // Shorten common restriction patterns
      if (firstRestriction.toLowerCase().includes('employer')) {
        return { label: 'Permitted', sublabel: '(employer-tied)' };
      }
      if (firstRestriction.toLowerCase().includes('hours')) {
        return { label: 'Permitted', sublabel: '(limited hours)' };
      }
      return { label: 'Permitted', sublabel: '(with restrictions)' };
    }
    return { label: 'Permitted', sublabel: '(unrestricted)' };
  };

  const workStatus = getWorkStatus();

  const stats = [
    {
      icon: Clock,
      label: 'Duration',
      value: visa.duration.initial,
      sublabel: null,
    },
    {
      icon: DollarSign,
      label: 'Cost',
      value: visa.fees.application,
      sublabel: null,
    },
    {
      icon: Timer,
      label: 'Processing',
      value: visa.processingTime?.typical || '2-4 weeks',
      sublabel: null,
    },
    {
      icon: Briefcase,
      label: 'Work',
      value: workStatus.label,
      sublabel: workStatus.sublabel,
    },
  ];

  return (
    <div id="overview" className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4">At a Glance</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {stats.map(({ icon: Icon, label, value, sublabel }) => (
          <div key={label} className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Icon className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-sm font-medium text-white">{value}</p>
            {sublabel && (
              <p className="text-xs text-slate-500">{sublabel}</p>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 my-4" />

      {/* Key Requirement */}
      <div>
        <span className="text-xs text-slate-500 uppercase tracking-wider">Key requirement</span>
        <p className="text-sm text-slate-300 mt-1">
          {(visa as VisaInfo & { keyRequirement?: string }).keyRequirement ||
            getDefaultKeyRequirement(visa)}
        </p>
      </div>
    </div>
  );
}

// Fallback key requirements if not defined in data
function getDefaultKeyRequirement(visa: VisaInfo): string {
  switch (visa.type) {
    case 'e-7':
      return 'Job offer from a Korean company + bachelor\'s degree (or 5+ years experience)';
    case 'd-2':
      return 'Acceptance letter from a Korean university';
    case 'd-10':
      return 'Bachelor\'s degree or higher from a Korean university';
    case 'h-1':
      return 'Citizenship from an eligible country + age 18-30';
    case 'f-1-d':
      return 'Remote employment with foreign company + income ≥ GNI×2 (~₩88M/year)';
    case 'f-2':
      return 'Points-based assessment (80+) or family ties to Korean citizen';
    default:
      return 'See eligibility requirements below';
  }
}
