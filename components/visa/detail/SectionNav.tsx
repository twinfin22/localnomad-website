'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'documents', label: 'Documents' },
  { id: 'process', label: 'Process' },
  { id: 'faqs', label: 'FAQs' },
];

interface SectionNavProps {
  className?: string;
}

export function SectionNav({ className }: SectionNavProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer to track which section is in view
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -70% 0px', // Trigger when section is near top
        threshold: 0,
      }
    );

    // Observe all sections
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 64; // Main navbar height
      const sectionNavHeight = 56; // This sticky nav height
      const offset = navbarHeight + sectionNavHeight + 16; // Extra padding

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      className={cn(
        'sticky top-16 z-30 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800',
        'overflow-x-auto scrollbar-hide',
        className
      )}
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3 min-w-max">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeSection === id
                  ? 'bg-cyan-500 text-slate-900'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
