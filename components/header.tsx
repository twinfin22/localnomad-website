"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-lg sm:text-xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            LocalNomad
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("soft-landing")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Soft Landing
            </button>
            <button
              onClick={() => scrollToSection("boots-on-ground")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Boots on the Ground
            </button>
            <button
              onClick={() => scrollToSection("popup-residency")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Popup Residency
            </button>
            <a
              href="https://startofsomethingnew.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Newsletter
            </a>
          </nav>

          <Button className="bg-primary text-primary-foreground text-xs sm:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">Get Curated Local Resources</span>
            <span className="sm:hidden">Get Started</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
