"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToEmailCapture = () => {
    const element = document.getElementById("email-capture");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled
        ? "glass shadow-soft-md"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <a
            href="https://localnomad.club/"
            className="group shrink-0"
          >
            <span className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
              LocalNomad
            </span>
          </a>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 mx-6 lg:mx-8">
            <a
              href="https://localnomad.club/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Soft Landing
            </a>
            <a
              href="/business"
              className="text-sm text-muted-foreground hover:text-primary transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Find Monthly Housing
            </a>
            <a
              href="https://www.meetup.com/localnomad/events/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Deep Work Sessions
            </a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <ThemeToggle />
            <Button
              size="sm"
              className="text-xs sm:text-sm whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground border-0 hover:-translate-y-0.5 shadow-soft hover:shadow-soft-md transition-all duration-300"
              onClick={scrollToEmailCapture}
            >
              <span className="hidden sm:inline">
                Download the Zero-Friction Checklist
              </span>
              <span className="sm:hidden">Get Started</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
