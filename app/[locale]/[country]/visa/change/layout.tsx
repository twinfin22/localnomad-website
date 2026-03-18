import type { ReactNode } from 'react';

interface ChangeLayoutProps {
  children: ReactNode;
}

export default function ChangeLayout({ children }: ChangeLayoutProps) {
  return <>{children}</>;
}
