'use client';

import { signOut } from '@/lib/actions/auth';

interface LogoutButtonProps {
  label: string;
}

export function LogoutButton({ label }: LogoutButtonProps) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-muted-foreground hover:underline"
      >
        {label}
      </button>
    </form>
  );
}
