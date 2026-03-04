interface DisclaimerParagraph {
  lang: string;
  text: string;
}

interface DisclaimerConfig {
  paragraphs: DisclaimerParagraph[];
  legalReferences: string[];
}

export const DISCLAIMER_CONFIGS: Record<string, DisclaimerConfig> = {
  korea: {
    paragraphs: [
      {
        lang: 'en',
        text: 'This information is for general guidance only and does not constitute legal advice. For personalized immigration guidance, consult a licensed immigration consultant (행정사) or attorney (변호사). Final decisions on visa issuance rest solely with the Korean Ministry of Justice and immigration authorities.',
      },
    ],
    legalReferences: [
      '행정사법 (Administrative Agent Act)',
      '변호사법 (Attorney Act)',
      '표시광고법 (Fair Labeling and Advertising Act)',
    ],
  },
  taiwan: {
    paragraphs: [
      {
        lang: 'en',
        text: "This information is compiled from publicly available sources for general reference only. It does not constitute immigration consulting (移民諮詢), document preparation services, or legal advice. LocalNomad is not a licensed Immigration Service Organization (移民業務機構) under Taiwan's Immigration Act.",
      },
      {
        lang: 'zh-Hant',
        text: '本資訊僅彙編自公開來源，僅供一般參考。不構成移民諮詢、文件代辦服務或法律建議。LocalNomad 並非依臺灣入出國及移民法設立之移民業務機構。',
      },
    ],
    legalReferences: [
      'Immigration Act §56 (入出國及移民法)',
      'Attorney Act §127 (律師法)',
    ],
  },
  japan: {
    paragraphs: [
      {
        lang: 'en',
        text: 'This information is compiled from publicly available sources for general reference only. It does not constitute immigration consulting (入管業務), document preparation services (行政書士業務), or legal advice. For personalized guidance, consult a licensed immigration lawyer (弁護士) or administrative scrivener (行政書士). Final decisions on visa issuance rest solely with the Immigration Services Agency of Japan.',
      },
    ],
    legalReferences: [
      '行政書士法 (Administrative Scrivener Act)',
      '弁護士法 (Attorney Act)',
      '出入国管理及び難民認定法 (Immigration Control Act)',
    ],
  },
  china: {
    paragraphs: [
      {
        lang: 'en',
        text: "This information is compiled from publicly available sources for general reference only. It does not constitute immigration consulting, document preparation services, or legal advice. For personalized guidance, consult a licensed immigration agency or attorney in China. Final decisions on visa issuance rest solely with the National Immigration Administration (国家移民管理局) of the People's Republic of China.",
      },
    ],
    legalReferences: [
      '出境入境管理法 (Exit-Entry Administration Law)',
      "外国人在中国就业管理规定 (Regulations on Foreigners' Employment in China)",
    ],
  },
  'southeast-asia': {
    paragraphs: [
      {
        lang: 'en',
        text: "This information is compiled from publicly available sources for general reference only. Visa requirements and policies vary by country and change frequently. It does not constitute immigration consulting, document preparation services, or legal advice. Always verify current requirements directly with the relevant country's immigration authority before applying.",
      },
    ],
    legalReferences: [],
  },
};
