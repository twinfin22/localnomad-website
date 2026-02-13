"use client";

import { useState, useEffect } from "react";

interface HeaderScrollWrapperProps {
  children: React.ReactNode;
}

export function HeaderScrollWrapper({ children }: HeaderScrollWrapperProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-surface/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
