import { getTranslations } from 'next-intl/server';

interface VisaDisclaimerProps {
  country: string;
}

export async function VisaDisclaimer({ country }: VisaDisclaimerProps) {
  const t = await getTranslations('VisaDetail');

  return (
    <div className="mt-12 border-t pt-6">
      {country === 'korea' && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          This information is for general guidance only and does not constitute
          legal advice. For personalized immigration guidance, consult a licensed
          immigration consultant (행정사) or attorney (변호사). Final
          decisions on visa issuance rest solely with the Korean Ministry of
          Justice and immigration authorities.
        </p>
      )}

      {country === 'taiwan' && (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            This information is compiled from publicly available sources for
            general reference only. It does not constitute immigration consulting
            (移民諮詢), document preparation services, or legal advice.
            LocalNomad is not a licensed Immigration Service Organization
            (移民業務機構) under Taiwan&apos;s Immigration Act.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            本資訊僅彙編自公開來源，僅供一般參考。不構成移民諮詢、文件代辦服務或法律建議。LocalNomad
            並非依臺灣入出國及移民法設立之移民業務機構。
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground/60">
        {t('disclaimer')}
      </p>
    </div>
  );
}
