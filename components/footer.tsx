import { Newspaper, Instagram } from "lucide-react"

function XLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="py-16 px-6 border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-xl text-muted-foreground font-light italic">
            Where Nomads Become Local, and Locals Become Nomads
          </p>
        </div>

        <div className="flex justify-center gap-8">
          <a
            href="https://x.com/neareastofeden"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="X"
          >
            <XLogo className="w-6 h-6" />
          </a>
          <a
            href="https://startofsomethingnew.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Substack"
          >
            <Newspaper className="w-6 h-6" />
          </a>
          <a
            href="https://www.instagram.com/hansamo486/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  )
}
