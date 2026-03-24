'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Neighborhood } from '@/lib/types/neighborhood';

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
  priority?: boolean;
}

export function NeighborhoodCard({ neighborhood, priority }: NeighborhoodCardProps) {
  const t = useTranslations('Neighborhood');
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      {/* Top image */}
      {neighborhood.imageUrl && (
        <div className="relative h-40 w-full">
          <Image
            src={neighborhood.imageUrl}
            alt={neighborhood.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 30vw, 380px"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
          />
        </div>
      )}

      <div>
        <div className="p-5">
          <h3 className="font-lora text-lg font-bold text-primary">
            {neighborhood.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {neighborhood.vibe}
          </p>
          <p className="mt-2 text-sm font-semibold">{neighborhood.rent}</p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {neighborhood.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Pros & Cons accordion */}
        <div className="border-t px-5">
          <Accordion type="single" collapsible>
            <AccordionItem value="pros-cons" className="border-b-0">
              <AccordionTrigger className="text-sm">
                {t('prosAndCons')}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {neighborhood.pros.length > 0 && (
                    <div>
                      <ul className="space-y-1">
                        {neighborhood.pros.map((pro) => (
                          <li
                            key={pro}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {neighborhood.cons.length > 0 && (
                    <div>
                      <ul className="space-y-1">
                        {neighborhood.cons.map((con) => (
                          <li
                            key={con}
                            className="flex items-start gap-2 text-sm"
                          >
                            <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
