import type { VisaType, VisaPathStep } from './types';

// =============================================================================
// Visa Path Data Module
// Defines all known visa transition paths for the Path Simulator
// =============================================================================

/**
 * Extended path step with requirements and tips for the simulator
 */
export interface PathStepDetail extends VisaPathStep {
  requirements: string[];
  tips: string[];
  pitfalls: string[];
}

/**
 * Complete path definition for the simulator
 */
export interface SimulatorPath {
  id: string;
  name: string;
  description: string;
  steps: PathStepDetail[];
  totalDuration: string;
  suitableFor: string[];
  difficulty: 'straightforward' | 'moderate' | 'complex';
}

/**
 * Starting point option for the simulator
 */
export interface StartingPoint {
  id: string;
  label: string;
  description: string;
  visaType: VisaType | 'none';
}

// =============================================================================
// Starting Points
// =============================================================================

export const STARTING_POINTS: StartingPoint[] = [
  {
    id: 'none',
    label: 'No Visa / Tourist',
    description: 'Currently outside Korea or on a tourist visa waiver',
    visaType: 'none',
  },
  {
    id: 'd-2',
    label: 'D-2 (Student)',
    description: 'Currently studying at a Korean university',
    visaType: 'd-2',
  },
  {
    id: 'd-4',
    label: 'D-4 (Language Study)',
    description: 'Currently enrolled in a Korean language program',
    visaType: 'd-4',
  },
  {
    id: 'd-10',
    label: 'D-10 (Job Seeking)',
    description: 'Currently on a job seeking visa',
    visaType: 'd-10',
  },
  {
    id: 'e-7',
    label: 'E-7 (Employment)',
    description: 'Currently employed by a Korean company',
    visaType: 'e-7',
  },
  {
    id: 'h-1',
    label: 'H-1 (Working Holiday)',
    description: 'Currently on a working holiday visa',
    visaType: 'h-1',
  },
  {
    id: 'f-1-d',
    label: 'F-1-D (Digital Nomad)',
    description: 'Currently on the digital nomad visa',
    visaType: 'f-1-d',
  },
  {
    id: 'e-2',
    label: 'E-2 (English Teaching)',
    description: 'Currently teaching English in Korea',
    visaType: 'e-2',
  },
  {
    id: 'd-7',
    label: 'D-7 (Intra-company Transfer)',
    description: 'Transferred to Korea by your company',
    visaType: 'd-7',
  },
  {
    id: 'd-8',
    label: 'D-8 (Business/Startup)',
    description: 'Running a business in Korea',
    visaType: 'd-8',
  },
];

// =============================================================================
// Path Definitions
// =============================================================================

const ALL_PATHS: SimulatorPath[] = [
  // === From No Visa / Tourist ===
  {
    id: 'tourist-to-f1d',
    name: 'Tourist to Digital Nomad',
    description:
      'Apply for the F-1-D digital nomad visa from outside Korea, then work remotely while living in Korea.',
    steps: [
      {
        order: 1,
        visaType: 'f-1-d',
        visaName: 'Digital Nomad Visa',
        duration: '1-2 years',
        description: 'Work remotely for a foreign employer while living in Korea.',
        requirements: [
          'Employment with a company outside Korea',
          'Annual income of $65,000+ USD (or 2x Korean GNI)',
          'Health insurance valid in Korea',
          'No criminal record',
        ],
        tips: [
          'Apply at the Korean embassy/consulate in your home country',
          'Processing typically takes 2-4 weeks',
          'Freelancers with multiple clients may qualify if total income meets threshold',
        ],
        pitfalls: [
          'Cannot work for a Korean company on this visa',
          'Must maintain foreign employment throughout the stay',
          'Income documentation must be thorough — bank statements, contracts, tax returns',
        ],
      },
    ],
    totalDuration: '1-2 years',
    suitableFor: ['Remote workers', 'Freelancers', 'Digital nomads'],
    difficulty: 'straightforward',
  },
  {
    id: 'tourist-to-d2',
    name: 'Tourist to Student',
    description:
      'Enroll in a Korean university and apply for a D-2 student visa.',
    steps: [
      {
        order: 1,
        visaType: 'd-2',
        visaName: 'Student Visa',
        duration: '1-4 years',
        description: 'Study at a Korean university (bachelor\'s, master\'s, or PhD).',
        requirements: [
          'Acceptance letter from a Korean university',
          'Proof of financial ability ($10,000+ in bank)',
          'High school or university transcript',
          'Health insurance',
        ],
        tips: [
          'Apply through your university — they often handle visa paperwork',
          'GKS (Korean Government Scholarship) provides full funding including visa support',
          'Part-time work allowed (up to 20hrs/week during semester)',
        ],
        pitfalls: [
          'Must maintain minimum attendance and GPA requirements',
          'Visa extension requires proof of enrollment each semester',
          'Working more than allowed hours can lead to visa revocation',
        ],
      },
    ],
    totalDuration: '1-4 years',
    suitableFor: ['Students', 'Career changers', 'Researchers'],
    difficulty: 'straightforward',
  },
  {
    id: 'tourist-to-h1',
    name: 'Tourist to Working Holiday',
    description:
      'Apply for a working holiday visa if your country has an agreement with Korea.',
    steps: [
      {
        order: 1,
        visaType: 'h-1',
        visaName: 'Working Holiday',
        duration: '1 year',
        description: 'Travel and work casually in Korea for up to 1 year.',
        requirements: [
          'Age 18-30 (or 18-25 for some countries)',
          'Country with WH agreement (US, UK, AU, CA, FR, DE, JP, etc.)',
          'Sufficient funds (~$3,000 USD)',
          'No dependents',
        ],
        tips: [
          'Apply well in advance — some countries have annual quotas',
          'Can work any job, but most find work in hospitality, teaching, or tourism',
          'Great way to experience Korea before committing to a longer visa',
        ],
        pitfalls: [
          'Cannot be extended — strictly 1 year maximum',
          'Cannot change to another visa status from within Korea (some exceptions)',
          'Age requirement is strict — no exceptions',
        ],
      },
    ],
    totalDuration: '1 year',
    suitableFor: ['Young travelers', 'Gap year', 'Korea-curious'],
    difficulty: 'straightforward',
  },
  {
    id: 'tourist-to-e7',
    name: 'Tourist to Employment',
    description:
      'Get hired by a Korean company and apply for an E-7 professional employment visa.',
    steps: [
      {
        order: 1,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Work for a Korean company in a professional role.',
        requirements: [
          'Job offer from a Korean employer',
          'Bachelor\'s degree (or equivalent experience)',
          'Employer sponsorship and labor market test',
          'Relevant work experience in the field',
        ],
        tips: [
          'Your employer handles most of the paperwork',
          'Tech, engineering, and specialized roles have higher approval rates',
          'Korean language ability helps but is not always required',
        ],
        pitfalls: [
          'Tied to your sponsoring employer — changing jobs requires a new visa application',
          'Processing can take 1-3 months',
          'Employer must prove no qualified Korean candidate was available',
        ],
      },
    ],
    totalDuration: '1-3 years (renewable)',
    suitableFor: ['Professionals', 'Engineers', 'Specialists'],
    difficulty: 'moderate',
  },
  {
    id: 'tourist-to-d10',
    name: 'Tourist to Job Seeker',
    description:
      'Apply for a D-10 job seeking visa to look for employment in Korea.',
    steps: [
      {
        order: 1,
        visaType: 'd-10',
        visaName: 'Job Seeking Visa',
        duration: '6 months - 2 years',
        description: 'Search for employment or prepare to start a business in Korea.',
        requirements: [
          'Bachelor\'s degree or higher from a recognized institution',
          'Proof of financial support',
          'Recommendation letter (from university or employer)',
          'No criminal record',
        ],
        tips: [
          'Available to graduates of Korean or overseas universities',
          'Can do internships and part-time work while searching',
          'Attend job fairs — many companies recruit D-10 holders',
        ],
        pitfalls: [
          'Initial grant is often only 6 months — extension requires evidence of job search activity',
          'Must actively look for work — immigration may check',
          'Cannot do full-time work until you switch to E-7',
        ],
      },
    ],
    totalDuration: '6 months - 2 years',
    suitableFor: ['Recent graduates', 'Job seekers', 'Career changers'],
    difficulty: 'moderate',
  },

  // === From D-2 (Student) ===
  {
    id: 'd2-to-d10-to-e7',
    name: 'Student to Job Seeker to Employment',
    description:
      'Graduate from a Korean university, then use D-10 to find a job and switch to E-7.',
    steps: [
      {
        order: 1,
        visaType: 'd-2',
        visaName: 'Student Visa',
        duration: '1-4 years',
        description: 'Complete your degree program at a Korean university.',
        requirements: [
          'Currently enrolled in a Korean university',
          'Maintain minimum attendance and grades',
        ],
        tips: [
          'Build your network during studies — Korean companies recruit from universities',
          'Internship experience dramatically improves D-10 to E-7 conversion',
        ],
        pitfalls: [
          'Dropping below minimum GPA can jeopardize visa status',
        ],
      },
      {
        order: 2,
        visaType: 'd-10',
        visaName: 'Job Seeking',
        duration: '6 months - 2 years',
        description: 'Search for employment after graduation.',
        requirements: [
          'Completed degree from a Korean university',
          'Application within 6 months of graduation',
          'Recommendation from university',
        ],
        tips: [
          'Apply for D-10 before your D-2 expires',
          'Korean language proficiency (TOPIK 3+) significantly helps job search',
          'Use KOTRA Job Fair and Work in Korea portal for leads',
        ],
        pitfalls: [
          'Must actively demonstrate job search efforts for extensions',
          'Window to apply closes 6 months after graduation',
        ],
      },
      {
        order: 3,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Transition to full-time employment with a Korean employer.',
        requirements: [
          'Job offer from a Korean company',
          'Employer sponsorship',
          'Degree relevant to the job',
        ],
        tips: [
          'Having a Korean degree smooths this transition significantly',
          'E-7 is renewable — you can stay as long as you\'re employed',
        ],
        pitfalls: [
          'Changing employers requires a new visa application',
        ],
      },
    ],
    totalDuration: '3-9 years',
    suitableFor: ['Students in Korea', 'Fresh graduates', 'Career-focused'],
    difficulty: 'moderate',
  },
  {
    id: 'd2-to-e7',
    name: 'Student Directly to Employment',
    description:
      'Skip D-10 and go directly from student visa to employment if you have a job lined up.',
    steps: [
      {
        order: 1,
        visaType: 'd-2',
        visaName: 'Student Visa',
        duration: '1-4 years',
        description: 'Complete your degree and secure a job before graduation.',
        requirements: [
          'Currently enrolled in a Korean university',
          'Secure a job offer before graduation',
        ],
        tips: [
          'Start applying 3-6 months before graduation',
          'Company-sponsored internships often convert to full-time offers',
        ],
        pitfalls: [
          'Timing is crucial — you need the job offer before D-2 expires',
        ],
      },
      {
        order: 2,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Work full-time for a Korean employer.',
        requirements: [
          'Job offer from a Korean company',
          'Employer sponsorship',
          'Degree from a Korean university in a relevant field',
        ],
        tips: [
          'Direct D-2 to E-7 is the fastest path to employment',
          'Your university may help with the visa change paperwork',
        ],
        pitfalls: [
          'Must complete the visa change before D-2 expires',
        ],
      },
    ],
    totalDuration: '2-7 years',
    suitableFor: ['Proactive students', 'In-demand fields (tech, engineering)'],
    difficulty: 'moderate',
  },

  // === From D-4 (Language Study) ===
  {
    id: 'd4-to-d2-to-e7',
    name: 'Language Study to University to Employment',
    description:
      'Complete Korean language studies, enter university, then find employment.',
    steps: [
      {
        order: 1,
        visaType: 'd-4',
        visaName: 'Language Study',
        duration: '6 months - 2 years',
        description: 'Study Korean at a language institute (어학당).',
        requirements: [
          'Enrollment in a registered Korean language program',
          'Proof of funds',
          'High school diploma or equivalent',
        ],
        tips: [
          'Aim for TOPIK Level 3+ which is the minimum for most university programs',
          'Some language programs have direct university pathway agreements',
        ],
        pitfalls: [
          'Must maintain 80% attendance for visa renewal',
          'Limited work hours (part-time only after 6 months)',
        ],
      },
      {
        order: 2,
        visaType: 'd-2',
        visaName: 'Student Visa',
        duration: '2-4 years',
        description: 'Pursue a degree at a Korean university.',
        requirements: [
          'TOPIK Level 3+ (or university-specific requirement)',
          'University acceptance letter',
          'Financial proof',
        ],
        tips: [
          'Many universities offer scholarships for students with high TOPIK scores',
          'A Korean degree qualifies you for D-10 job seeking visa',
        ],
        pitfalls: [
          'Language barrier can be challenging even with TOPIK 3',
        ],
      },
      {
        order: 3,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Work professionally in Korea.',
        requirements: [
          'Job offer from a Korean company',
          'Degree from Korean university',
        ],
        tips: [
          'Korean language fluency from D-4 + degree from D-2 = strong candidate',
        ],
        pitfalls: [
          'This is a long path — 4-9 years total',
        ],
      },
    ],
    totalDuration: '4-9 years',
    suitableFor: ['Committed Korea enthusiasts', 'Those starting from scratch'],
    difficulty: 'complex',
  },

  // === From D-10 (Job Seeking) ===
  {
    id: 'd10-to-e7',
    name: 'Job Seeker to Employment',
    description:
      'Convert your job seeking visa to full employment after finding a position.',
    steps: [
      {
        order: 1,
        visaType: 'd-10',
        visaName: 'Job Seeking Visa',
        duration: '6 months - 2 years',
        description: 'Search for and secure employment in Korea.',
        requirements: [
          'Currently on D-10 visa',
          'Active job search efforts',
        ],
        tips: [
          'Attend recruitment fairs and use KOTRA portal',
          'Network through Korean professional communities',
          'Consider startup ecosystem — many sponsor E-7 visas',
        ],
        pitfalls: [
          'Immigration may ask for proof of job search activity during extension',
        ],
      },
      {
        order: 2,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Full-time employment with a Korean company.',
        requirements: [
          'Job offer and employer sponsorship',
          'Relevant qualifications',
        ],
        tips: [
          'D-10 to E-7 is a well-known path — immigration is familiar with it',
          'Have your employer start the process early',
        ],
        pitfalls: [
          'Ensure the visa change is approved before D-10 expires',
        ],
      },
    ],
    totalDuration: '2-5 years',
    suitableFor: ['Job seekers already in Korea', 'Recent graduates'],
    difficulty: 'straightforward',
  },
  {
    id: 'd10-to-d8',
    name: 'Job Seeker to Startup',
    description:
      'Transition from job seeking to starting your own business in Korea.',
    steps: [
      {
        order: 1,
        visaType: 'd-10',
        visaName: 'Job Seeking Visa',
        duration: '6 months - 1 year',
        description: 'Use the D-10 period to develop your business plan and network.',
        requirements: [
          'Currently on D-10 visa',
          'Business plan development',
        ],
        tips: [
          'D-10 allows startup preparation activities',
          'Connect with Korean startup accelerators (TIPS, K-Startup Grand Challenge)',
          'Join Seoul Global Startup Center for support',
        ],
        pitfalls: [
          'Cannot operate a business on D-10 — only preparation',
        ],
      },
      {
        order: 2,
        visaType: 'd-8',
        visaName: 'Business/Startup Visa',
        duration: '1-2 years',
        description: 'Register and operate your business in Korea.',
        requirements: [
          'Registered business entity in Korea',
          'Minimum investment (~100M KRW, or less through startup programs)',
          'Business plan approval',
        ],
        tips: [
          'Startup visa programs can reduce investment requirements significantly',
          'OASIS visa program specifically supports tech startups',
        ],
        pitfalls: [
          'Must demonstrate business viability for renewal',
          'Investment requirements can be substantial without startup program support',
        ],
      },
    ],
    totalDuration: '2-3 years',
    suitableFor: ['Entrepreneurs', 'Startup founders', 'Tech innovators'],
    difficulty: 'complex',
  },

  // === From E-7 (Employment) ===
  {
    id: 'e7-to-f2',
    name: 'Employment to Long-term Residence',
    description:
      'After years of professional employment, qualify for F-2 points-based residence.',
    steps: [
      {
        order: 1,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '3-5 years',
        description: 'Build a career and accumulate points for F-2 eligibility.',
        requirements: [
          'Currently on E-7 visa',
          'Stable employment record',
          'Build TOPIK score, income, and social integration points',
        ],
        tips: [
          'Study Korean — TOPIK score is a major points factor',
          'Higher salary = more points',
          'Complete the Korea Immigration and Integration Program (KIIP)',
        ],
        pitfalls: [
          'Points requirements change — check current thresholds',
          'Need at least 80 points to qualify',
        ],
      },
      {
        order: 2,
        visaType: 'f-2',
        visaName: 'Long-term Residence',
        duration: '3+ years',
        description: 'Points-based residency with path to permanent residency (F-5).',
        requirements: [
          'Minimum 80 points on the points system',
          'No criminal record',
          'Proof of income (2x GNI per capita)',
          'TOPIK Level 3+ recommended',
        ],
        tips: [
          'F-2 allows you to work for any employer — no sponsorship needed',
          'Can lead to F-5 (permanent residence) after 2+ years',
          'Much more freedom than E-7 — can change jobs freely',
        ],
        pitfalls: [
          'Points calculation is complex — use the official HIKOREA calculator',
          'Must maintain qualifying conditions for renewal',
        ],
      },
    ],
    totalDuration: '5-8+ years',
    suitableFor: ['Long-term Korea residents', 'Career professionals'],
    difficulty: 'moderate',
  },

  // === From F-1-D (Digital Nomad) ===
  {
    id: 'f1d-to-e7',
    name: 'Digital Nomad to Employment',
    description:
      'Transition from remote work to local employment if you find a Korean company.',
    steps: [
      {
        order: 1,
        visaType: 'f-1-d',
        visaName: 'Digital Nomad Visa',
        duration: '1-2 years',
        description: 'Work remotely while exploring the Korean job market.',
        requirements: [
          'Currently on F-1-D visa',
          'Maintain remote employment/income',
        ],
        tips: [
          'Network at Seoul tech meetups and coworking spaces',
          'Many F-1-D holders discover Korean opportunities while here',
        ],
        pitfalls: [
          'Cannot work for a Korean company while on F-1-D',
        ],
      },
      {
        order: 2,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Switch to local employment with a Korean company.',
        requirements: [
          'Job offer from a Korean employer',
          'Employer sponsorship',
          'Relevant qualifications and experience',
        ],
        tips: [
          'Your in-country presence makes interviews easier',
          'Korean companies value candidates already adapted to Korean life',
        ],
        pitfalls: [
          'Must formally change visa status — cannot just start working locally',
        ],
      },
    ],
    totalDuration: '2-5 years',
    suitableFor: ['Digital nomads exploring local opportunities', 'Tech professionals'],
    difficulty: 'moderate',
  },
  {
    id: 'f1d-to-e7-to-f2',
    name: 'Digital Nomad to Employment to Residence',
    description:
      'The full path: remote work, then local employment, then long-term residence.',
    steps: [
      {
        order: 1,
        visaType: 'f-1-d',
        visaName: 'Digital Nomad Visa',
        duration: '1-2 years',
        description: 'Start with remote work to experience Korea.',
        requirements: [
          'Foreign employment with $65,000+ income',
          'Health insurance',
        ],
        tips: [
          'Use this time to learn Korean and build local network',
        ],
        pitfalls: [
          'Cannot work for Korean companies',
        ],
      },
      {
        order: 2,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '3-5 years',
        description: 'Build a career with a Korean employer.',
        requirements: [
          'Job offer and employer sponsorship',
          'Relevant qualifications',
        ],
        tips: [
          'Focus on accumulating F-2 points during this period',
          'KIIP completion + TOPIK study = faster path to F-2',
        ],
        pitfalls: [
          'Changing employers requires new visa process',
        ],
      },
      {
        order: 3,
        visaType: 'f-2',
        visaName: 'Long-term Residence',
        duration: '3+ years',
        description: 'Points-based long-term residence with path to F-5.',
        requirements: [
          '80+ points on the residence points system',
          'Income requirement (2x GNI)',
          'TOPIK Level 3+',
        ],
        tips: [
          'F-2 is the gateway to F-5 permanent residence',
          'Freedom to change employers and start businesses',
        ],
        pitfalls: [
          'Total journey takes 5-10+ years',
        ],
      },
    ],
    totalDuration: '5-10+ years',
    suitableFor: ['Long-term planners', 'Those who want permanent Korea residence'],
    difficulty: 'complex',
  },
  {
    id: 'f1d-to-d8',
    name: 'Digital Nomad to Startup',
    description:
      'Transition from remote work to founding your own company in Korea.',
    steps: [
      {
        order: 1,
        visaType: 'f-1-d',
        visaName: 'Digital Nomad Visa',
        duration: '1-2 years',
        description: 'Work remotely while building your business idea and local network.',
        requirements: [
          'Currently on F-1-D visa',
          'Maintain qualifying remote income',
        ],
        tips: [
          'Use the time to understand the Korean market',
          'Connect with accelerators and VC ecosystem',
        ],
        pitfalls: [
          'Cannot register or operate a Korean business on F-1-D',
        ],
      },
      {
        order: 2,
        visaType: 'd-8',
        visaName: 'Business/Startup Visa',
        duration: '1-2 years',
        description: 'Register and operate your business in Korea.',
        requirements: [
          'Registered Korean business entity',
          'Investment capital (reduced through startup programs)',
          'Business plan',
        ],
        tips: [
          'K-Startup Grand Challenge provides visa + funding + mentorship',
          'TIPS program can reduce investment requirements',
        ],
        pitfalls: [
          'Business registration process can be complex for foreigners',
        ],
      },
    ],
    totalDuration: '2-4 years',
    suitableFor: ['Entrepreneurs', 'Tech founders', 'Business-minded nomads'],
    difficulty: 'complex',
  },

  // === From H-1 (Working Holiday) ===
  {
    id: 'h1-to-d4-to-d2',
    name: 'Working Holiday to Language Study to University',
    description:
      'Use working holiday to explore, then study Korean, then enter university.',
    steps: [
      {
        order: 1,
        visaType: 'h-1',
        visaName: 'Working Holiday',
        duration: '1 year',
        description: 'Experience Korea and decide on your long-term path.',
        requirements: [
          'Currently on H-1 visa',
        ],
        tips: [
          'Start learning Korean during your WH — it will pay off later',
          'Save money for language school tuition',
        ],
        pitfalls: [
          'H-1 cannot be extended — plan your next step before it expires',
        ],
      },
      {
        order: 2,
        visaType: 'd-4',
        visaName: 'Language Study',
        duration: '1-2 years',
        description: 'Intensive Korean language study at a university language center.',
        requirements: [
          'Enrollment in registered language program',
          'Financial proof',
        ],
        tips: [
          'Must leave Korea and re-enter or change status at immigration',
          'Aim for TOPIK 3+ to qualify for university admission',
        ],
        pitfalls: [
          'Status change from H-1 to D-4 can be tricky — consult immigration',
        ],
      },
      {
        order: 3,
        visaType: 'd-2',
        visaName: 'Student Visa',
        duration: '2-4 years',
        description: 'Pursue a degree at a Korean university.',
        requirements: [
          'TOPIK Level 3+',
          'University acceptance',
          'Financial proof',
        ],
        tips: [
          'Your Korean skills from D-4 make university life much easier',
          'Opens the door to D-10 or E-7 after graduation',
        ],
        pitfalls: [
          'Long commitment — total path is 4-7 years',
        ],
      },
    ],
    totalDuration: '4-7 years',
    suitableFor: ['Young people committed to Korea', 'Career changers'],
    difficulty: 'complex',
  },
  {
    id: 'h1-to-e7',
    name: 'Working Holiday to Employment',
    description:
      'Find a Korean employer during your working holiday and transition to E-7.',
    steps: [
      {
        order: 1,
        visaType: 'h-1',
        visaName: 'Working Holiday',
        duration: '1 year',
        description: 'Work and travel in Korea while networking.',
        requirements: [
          'Currently on H-1 visa',
        ],
        tips: [
          'Use the working holiday to build a professional network',
          'Work at companies you might want to join full-time',
        ],
        pitfalls: [
          'Not all jobs done on H-1 qualify as relevant experience for E-7',
        ],
      },
      {
        order: 2,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Full-time professional employment in Korea.',
        requirements: [
          'Job offer from a Korean employer',
          'Bachelor\'s degree or equivalent',
          'Employer sponsorship',
        ],
        tips: [
          'Start the E-7 application process well before H-1 expires',
          'May need to leave Korea briefly and re-enter on E-7',
        ],
        pitfalls: [
          'Direct H-1 to E-7 change is possible but not guaranteed — depends on immigration office',
          'Must have relevant qualifications for the E-7 category',
        ],
      },
    ],
    totalDuration: '2-4 years',
    suitableFor: ['Skilled professionals on WH', 'Those who find unexpected opportunities'],
    difficulty: 'moderate',
  },

  // === From E-2 (English Teaching) ===
  {
    id: 'e2-to-e7',
    name: 'English Teaching to Professional Employment',
    description:
      'Transition from teaching English to a professional role in Korea.',
    steps: [
      {
        order: 1,
        visaType: 'e-2',
        visaName: 'English Teaching',
        duration: '1-3 years',
        description: 'Teach English while building skills and connections.',
        requirements: [
          'Currently on E-2 visa',
          'Bachelor\'s degree from an English-speaking country',
        ],
        tips: [
          'Study Korean and get TOPIK certified during this time',
          'Build professional skills alongside teaching',
          'Network outside the teaching community',
        ],
        pitfalls: [
          'E-2 experience may not count toward E-7 experience requirements in some fields',
        ],
      },
      {
        order: 2,
        visaType: 'e-7',
        visaName: 'Professional Employment',
        duration: '1-3 years',
        description: 'Move to a professional role in your field of expertise.',
        requirements: [
          'Job offer in a professional field',
          'Relevant qualifications beyond teaching',
          'Employer sponsorship',
        ],
        tips: [
          'Having a degree in a STEM or business field helps this transition',
          'Some E-2 holders move into EdTech or curriculum development roles on E-7',
        ],
        pitfalls: [
          'Cannot simply change jobs — must qualify for E-7 independently',
          'Teaching experience alone may not qualify for E-7 in non-education fields',
        ],
      },
    ],
    totalDuration: '2-6 years',
    suitableFor: ['English teachers wanting career change', 'Professionals who taught first'],
    difficulty: 'moderate',
  },

  // === From D-7 (Intra-company Transfer) ===
  {
    id: 'd7-to-f2',
    name: 'Intra-company Transfer to Residence',
    description:
      'Build up residence points during your transfer period and transition to F-2.',
    steps: [
      {
        order: 1,
        visaType: 'd-7',
        visaName: 'Intra-company Transfer',
        duration: '2-5 years',
        description: 'Work at your company\'s Korean branch while accumulating residence points.',
        requirements: [
          'Currently on D-7 visa',
          'Continued employment with the transferring company',
        ],
        tips: [
          'D-7 time counts toward F-2 residence requirements',
          'Study Korean to boost your points',
          'Complete KIIP for additional points',
        ],
        pitfalls: [
          'Tied to your company — leaving means visa changes',
        ],
      },
      {
        order: 2,
        visaType: 'f-2',
        visaName: 'Long-term Residence',
        duration: '3+ years',
        description: 'Independent long-term residence in Korea.',
        requirements: [
          '80+ points on the residence system',
          'Income requirement met',
          'No criminal record',
        ],
        tips: [
          'F-2 gives you freedom to change employers or start a business',
          'Path to F-5 permanent residence after 2+ years on F-2',
        ],
        pitfalls: [
          'Must maintain point requirements for renewal',
        ],
      },
    ],
    totalDuration: '5-8+ years',
    suitableFor: ['Corporate transferees planning to stay', 'Long-term residents'],
    difficulty: 'moderate',
  },

  // === From D-8 (Business/Startup) ===
  {
    id: 'd8-to-f2',
    name: 'Business Owner to Residence',
    description:
      'Build a successful business in Korea and transition to long-term residence.',
    steps: [
      {
        order: 1,
        visaType: 'd-8',
        visaName: 'Business/Startup Visa',
        duration: '2-5 years',
        description: 'Operate and grow your business while building residence points.',
        requirements: [
          'Currently on D-8 visa',
          'Business in good standing',
          'Meet minimum revenue/employment requirements',
        ],
        tips: [
          'Hiring Korean employees earns bonus points for F-2',
          'Tax compliance is critical for visa renewals',
          'Study Korean — the points add up',
        ],
        pitfalls: [
          'Business must remain operational and profitable for renewal',
        ],
      },
      {
        order: 2,
        visaType: 'f-2',
        visaName: 'Long-term Residence',
        duration: '3+ years',
        description: 'Points-based residence with more flexibility.',
        requirements: [
          '80+ points',
          'Income requirement',
          'Business track record helps',
        ],
        tips: [
          'D-8 holders often qualify for F-2 through business achievement points',
          'F-2 lets you continue your business with less visa stress',
        ],
        pitfalls: [
          'Still need to meet all F-2 point requirements independently',
        ],
      },
    ],
    totalDuration: '5-8+ years',
    suitableFor: ['Business owners', 'Startup founders planning long-term'],
    difficulty: 'moderate',
  },
];

// =============================================================================
// Path Lookup Functions
// =============================================================================

/**
 * Graph of visa transitions: key = starting visa type, value = set of reachable visa types
 */
const TRANSITION_GRAPH: Record<string, VisaType[]> = {
  none: ['f-1-d', 'd-2', 'h-1', 'e-7', 'd-10', 'd-4', 'd-7', 'd-8'],
  'd-2': ['d-10', 'e-7'],
  'd-4': ['d-2'],
  'd-10': ['e-7', 'd-8'],
  'e-7': ['f-2'],
  'h-1': ['d-4', 'd-2', 'e-7'],
  'f-1-d': ['e-7', 'd-8'],
  'e-2': ['e-7'],
  'd-7': ['f-2'],
  'd-8': ['f-2'],
  'f-2': [],
  'f-4': [],
  'f-6': [],
};

/**
 * Get all reachable destination visa types from a starting point.
 * Returns direct destinations (not recursive).
 */
export function getReachableDestinations(
  startingVisaType: VisaType | 'none'
): VisaType[] {
  return TRANSITION_GRAPH[startingVisaType] ?? [];
}

/**
 * Get all paths from a specific starting point
 */
export function getPathsFromStart(
  startingVisaType: VisaType | 'none'
): SimulatorPath[] {
  return ALL_PATHS.filter((path) => {
    const firstStep = path.steps[0];
    if (!firstStep) return false;

    if (startingVisaType === 'none') {
      // Paths that start fresh (no prior visa)
      return (
        path.id.startsWith('tourist-') ||
        (path.steps.length === 1 && !isCurrentVisaPath(path))
      );
    }

    // Paths where the first step matches the current visa
    return firstStep.visaType === startingVisaType;
  });
}

/**
 * Check if a path represents continuing on the same visa
 */
function isCurrentVisaPath(path: SimulatorPath): boolean {
  return path.steps.length === 1 && STARTING_POINTS.some(
    (sp) => sp.visaType !== 'none' && sp.visaType === path.steps[0]?.visaType
  );
}

/**
 * Get paths from a starting point that lead to a specific destination
 */
export function getPathsToDestination(
  startingVisaType: VisaType | 'none',
  destinationVisaType: VisaType
): SimulatorPath[] {
  return getPathsFromStart(startingVisaType).filter((path) => {
    const lastStep = path.steps[path.steps.length - 1];
    return lastStep?.visaType === destinationVisaType;
  });
}

/**
 * Get all unique destination visa types reachable from a starting point
 * (based on actual paths, not just the graph)
 */
export function getDestinationsFromPaths(
  startingVisaType: VisaType | 'none'
): { visaType: VisaType; visaName: string; pathCount: number }[] {
  const paths = getPathsFromStart(startingVisaType);
  const destinationMap = new Map<
    VisaType,
    { visaName: string; pathCount: number }
  >();

  for (const path of paths) {
    const lastStep = path.steps[path.steps.length - 1];
    if (!lastStep) continue;

    const existing = destinationMap.get(lastStep.visaType);
    if (existing) {
      existing.pathCount += 1;
    } else {
      destinationMap.set(lastStep.visaType, {
        visaName: lastStep.visaName,
        pathCount: 1,
      });
    }
  }

  return Array.from(destinationMap.entries()).map(
    ([visaType, { visaName, pathCount }]) => ({
      visaType,
      visaName,
      pathCount,
    })
  );
}

/**
 * Get display info for a visa type
 */
export const VISA_DISPLAY_INFO: Record<
  VisaType | 'none',
  { name: string; shortDescription: string; category: string }
> = {
  none: {
    name: 'No Visa / Tourist',
    shortDescription: 'Starting fresh from outside Korea',
    category: 'Starting Point',
  },
  'd-2': {
    name: 'Student Visa',
    shortDescription: 'University degree programs',
    category: 'Study',
  },
  'd-4': {
    name: 'Language Study',
    shortDescription: 'Korean language programs',
    category: 'Study',
  },
  'd-7': {
    name: 'Intra-company Transfer',
    shortDescription: 'Corporate transfers to Korea',
    category: 'Work',
  },
  'd-8': {
    name: 'Business/Startup',
    shortDescription: 'Run a business in Korea',
    category: 'Business',
  },
  'd-10': {
    name: 'Job Seeking',
    shortDescription: 'Search for employment in Korea',
    category: 'Work',
  },
  'e-2': {
    name: 'English Teaching',
    shortDescription: 'Teach English in Korea',
    category: 'Work',
  },
  'e-7': {
    name: 'Professional Employment',
    shortDescription: 'Skilled professional roles',
    category: 'Work',
  },
  'f-1-d': {
    name: 'Digital Nomad',
    shortDescription: 'Remote work from Korea',
    category: 'Work',
  },
  'f-2': {
    name: 'Long-term Residence',
    shortDescription: 'Points-based residency',
    category: 'Residence',
  },
  'f-4': {
    name: 'Overseas Korean',
    shortDescription: 'Korean heritage visa',
    category: 'Residence',
  },
  'f-6': {
    name: 'Marriage Visa',
    shortDescription: 'Spouse of Korean citizen',
    category: 'Family',
  },
  'h-1': {
    name: 'Working Holiday',
    shortDescription: 'Travel and work (age 18-30)',
    category: 'Working Holiday',
  },
};

/**
 * Get difficulty label and color
 */
export function getDifficultyDisplay(difficulty: SimulatorPath['difficulty']): {
  label: string;
  colorClass: string;
} {
  switch (difficulty) {
    case 'straightforward':
      return { label: 'Straightforward', colorClass: 'text-success' };
    case 'moderate':
      return { label: 'Moderate', colorClass: 'text-warning' };
    case 'complex':
      return { label: 'Complex', colorClass: 'text-error' };
  }
}
