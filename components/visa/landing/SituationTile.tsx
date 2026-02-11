import Link from "next/link";

interface SituationTileProps {
  emoji: string;
  situation: string;
  href: string;
}

export function SituationTile({ emoji, situation, href }: SituationTileProps) {
  return (
    <Link href={href}>
      <div className="p-6 rounded-xl border border-border bg-surface hover:border-primary/30 hover:bg-elevated transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="text-3xl mb-3">{emoji}</div>
        <p className="text-foreground font-medium leading-snug">{situation}</p>
      </div>
    </Link>
  );
}
