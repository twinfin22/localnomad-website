"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navLinkClass = isScrolled
    ? "text-sm text-muted-foreground hover:text-foreground transition-colors"
    : "text-sm text-white/80 hover:text-white transition-colors"

  const brandClass = isScrolled
    ? "text-foreground group-hover:text-primary"
    : "text-white group-hover:text-white/80"

  const toggleClass = isScrolled
    ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    : "text-white/80 hover:text-white hover:bg-white/10"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group shrink-0"
          >
            <span className={`text-lg sm:text-xl font-semibold transition-colors ${brandClass}`}>
              LocalNomad
            </span>
          </button>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 mx-6 lg:mx-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={navLinkClass}
            >
              Soft Landing
            </button>
            <button
              onClick={() => scrollToSection("boots-on-ground")}
              className={navLinkClass}
            >
              Boots on the Ground
            </button>
            <button
              onClick={() => scrollToSection("popup-residency")}
              className={navLinkClass}
            >
              Popup Residency
            </button>
            <a
              href="https://startofsomethingnew.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={navLinkClass}
            >
              Newsletter
            </a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {mounted && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 ${toggleClass}`}
                aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}
            <Button variant="default" size="sm" className="text-xs sm:text-sm whitespace-nowrap">
              <span className="hidden sm:inline">Get Curated Local Resources</span>
              <span className="sm:hidden">Get Started</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
