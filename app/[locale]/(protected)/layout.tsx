import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ProtectedLayout({ children, params }: Props) {
  const { locale } = await params;
  const user = await getSession();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
