import { SituationTile } from "./SituationTile";

export interface Situation {
  emoji: string;
  situation: string;
  visa: string;
  href: string;
}

interface SituationGridProps {
  situations: Situation[];
}

export function SituationGrid({ situations }: SituationGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {situations.map((s) => (
        <SituationTile
          key={s.visa}
          emoji={s.emoji}
          situation={s.situation}
          href={s.href}
        />
      ))}
    </div>
  );
}
