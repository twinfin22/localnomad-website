import { X, Newspaper, Instagram } from "lucide-react"

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
            <X className="w-6 h-6" />
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
