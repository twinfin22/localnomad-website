"use client";

import { Button } from "@/components/ui/button";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? "glass-strong shadow-neon"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <a
            href="https://localnomad.club/"
            className="group shrink-0"
          >
            <span className="text-lg sm:text-xl font-bold text-white group-hover:text-gradient transition-all duration-300">
              LocalNomad
            </span>
          </a>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 mx-6 lg:mx-8">
            <a
              href="https://localnomad.club/"
              className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-[#00F5D4] after:transition-all after:duration-300 hover:after:w-full"
            >
              Soft Landing
            </a>
            <a
              href="/business"
              className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-[#00F5D4] after:transition-all after:duration-300 hover:after:w-full"
            >
              Boots on the Ground
            </a>
            <a
              href="https://www.meetup.com/localnomad/events/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-[#00F5D4] after:transition-all after:duration-300 hover:after:w-full"
            >
              Deep Work Sessions
            </a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Button
              size="sm"
              className="text-xs sm:text-sm whitespace-nowrap bg-gradient-to-r from-[#FF006E] to-[#8338EC] hover:from-[#FF006E] hover:to-[#FF006E] text-white border-0 hover:-translate-y-0.5 hover:glow-magenta-sm transition-all duration-300"
              onClick={scrollToEmailCapture}
            >
              <span className="hidden sm:inline">
                Get Curated Local Resources
              </span>
              <span className="sm:hidden">Get Started</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
