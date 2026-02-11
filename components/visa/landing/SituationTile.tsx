import Link from "next/link";

interface SituationTileProps {
  emoji: string;
  situation: string;
  href: string;
}

export function SituationTile({ emoji, situation, href }: SituationTileProps) {
  return (
    <Link href={href}>
      <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="text-3xl mb-3">{emoji}</div>
        <p className="text-white font-medium leading-snug">{situation}</p>
      </div>
    </Link>
  );
}
