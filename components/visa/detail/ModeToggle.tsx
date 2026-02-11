'use client';

import { cn } from '@/lib/utils';
import { Search, Shield } from 'lucide-react';

export type DetailMode = 'exploring' | 'holder';

interface ModeToggleProps {
  mode: DetailMode;
  onModeChange: (mode: DetailMode) => void;
  className?: string;
}

export function ModeToggle({ mode, onModeChange, className }: ModeToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl bg-slate-800/50 p-1 border border-slate-700',
        className
      )}
    >
      <button
        onClick={() => onModeChange('exploring')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          mode === 'exploring'
            ? 'bg-cyan-500 text-slate-900'
            : 'text-slate-400 hover:text-white'
        )}
      >
        <Search className="w-4 h-4" />
        <span>Exploring</span>
      </button>
      <button
        onClick={() => onModeChange('holder')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          mode === 'holder'
            ? 'bg-cyan-500 text-slate-900'
            : 'text-slate-400 hover:text-white'
        )}
      >
        <Shield className="w-4 h-4" />
        <span>I Have This Visa</span>
      </button>
    </div>
  );
}
