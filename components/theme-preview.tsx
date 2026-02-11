"use client";

import { useState, useEffect, createContext, useContext } from "react";

export type ThemeKey = "midnight-seoul" | "black-label";

const ThemeContext = createContext<{
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
}>({
  theme: "midnight-seoul",
  setTheme: () => {},
});

export const useThemePreview = () => useContext(ThemeContext);

const themes = {
  "midnight-seoul": {
    name: "Midnight Seoul",
    description: "Navy + Coral · Outfit · Neo-Professional",
    light: {
      "--primary": "#1E3A5F",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#E85A4F",
      "--accent-foreground": "#FFFFFF",
      "--background": "#F8FAFC",
      "--foreground": "#0F172A",
      "--card": "#FFFFFF",
      "--card-foreground": "#0F172A",
      "--secondary": "#F1F5F9",
      "--secondary-foreground": "#0F172A",
      "--muted": "#E2E8F0",
      "--muted-foreground": "#64748B",
      "--border": "#E2E8F0",
      "--input": "#E2E8F0",
      "--ring": "#1E3A5F",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#0F172A",
      "--destructive": "#DC2626",
      "--destructive-foreground": "#FFFFFF",
      "--font-heading": "'Outfit', system-ui, sans-serif",
      "--font-body": "'Inter', system-ui, sans-serif",
    },
    dark: {
      "--primary": "#4B7BB5",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#FF6B5B",
      "--accent-foreground": "#FFFFFF",
      "--background": "#0B1120",
      "--foreground": "#E2E8F0",
      "--card": "#151F32",
      "--card-foreground": "#E2E8F0",
      "--secondary": "#1A2744",
      "--secondary-foreground": "#E2E8F0",
      "--muted": "#1E2D4A",
      "--muted-foreground": "#94A3B8",
      "--border": "#1E3A5F",
      "--input": "#1E3A5F",
      "--ring": "#4B7BB5",
      "--popover": "#151F32",
      "--popover-foreground": "#E2E8F0",
      "--destructive": "#EF4444",
      "--destructive-foreground": "#FFFFFF",
      "--font-heading": "'Outfit', system-ui, sans-serif",
      "--font-body": "'Inter', system-ui, sans-serif",
    },
  },
  "black-label": {
    name: "Black Label",
    description: "Navy + Gold · Cormorant · Editorial Luxury",
    light: {
      "--primary": "#0D1B2A",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#C9A227",
      "--accent-foreground": "#0D1B2A",
      "--background": "#FFFEF9",
      "--foreground": "#0D1B2A",
      "--card": "#FFFFFF",
      "--card-foreground": "#0D1B2A",
      "--secondary": "#F8F6F0",
      "--secondary-foreground": "#0D1B2A",
      "--muted": "#EDE9E0",
      "--muted-foreground": "#5C6670",
      "--border": "#E8E4D9",
      "--input": "#E8E4D9",
      "--ring": "#C9A227",
      "--font-heading": "'Cormorant Garamond', Georgia, serif",
      "--font-body": "'Crimson Pro', Georgia, serif",
    },
    dark: {
      "--primary": "#1B263B",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#D4AF37",
      "--accent-foreground": "#0A0C10",
      "--background": "#0A0C10",
      "--foreground": "#F8F4E8",
      "--card": "#12161C",
      "--card-foreground": "#F8F4E8",
      "--secondary": "#1A1F28",
      "--secondary-foreground": "#F8F4E8",
      "--muted": "#1A1F28",
      "--muted-foreground": "#9CA3AF",
      "--border": "#1F2937",
      "--input": "#1F2937",
      "--ring": "#D4AF37",
      "--font-heading": "'Cormorant Garamond', Georgia, serif",
      "--font-body": "'Crimson Pro', Georgia, serif",
    },
  },
};

export function ThemePreviewProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeKey>("midnight-seoul");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Invisible component that applies theme CSS variables
export function ThemeApplier() {
  const { theme: currentTheme } = useThemePreview();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const theme = themes[currentTheme];
    const vars = isDark ? theme.dark : theme.light;

    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [currentTheme, isDark]);

  return null;
}

// Theme picker popup (kept for future use if needed)
export function ThemePreview() {
  const { theme: currentTheme, setTheme: setCurrentTheme } = useThemePreview();

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-2xl max-w-sm">
      <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">
        Choose Your Style
      </p>
      <div className="space-y-3">
        {(Object.keys(themes) as ThemeKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setCurrentTheme(key)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              currentTheme === key
                ? "border-accent bg-accent/10 shadow-lg"
                : "border-border hover:border-accent/50 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div
                  className="w-5 h-5 rounded-full ring-2 ring-white/20 shadow-md"
                  style={{ backgroundColor: themes[key].light["--primary"] }}
                />
                <div
                  className="w-5 h-5 rounded-full ring-2 ring-white/20 shadow-md"
                  style={{ backgroundColor: themes[key].light["--accent"] }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{themes[key].name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {themes[key].description}
                </p>
              </div>
              {currentTheme === key && (
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-4 text-center opacity-60">
        Toggle dark mode to see both variants
      </p>
    </div>
  );
}

// Hero background component that responds to theme
export function HeroBackground() {
  const { theme } = useThemePreview();

  if (theme === "midnight-seoul") {
    return (
      <>
        {/* Cool gradient base with more depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-[#0F1419] dark:via-[#141C24] dark:to-[#0A0E14]" />

        {/* Primary navy orb - top left, larger and more prominent */}
        <div className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full blur-3xl animate-float" style={{
          background: 'radial-gradient(circle, rgba(30, 58, 95, 0.22) 0%, rgba(30, 58, 95, 0.08) 40%, transparent 70%)'
        }} />

        {/* Secondary navy orb - center right */}
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(59, 89, 152, 0.15) 0%, rgba(59, 89, 152, 0.05) 50%, transparent 70%)'
        }} />

        {/* Coral accent orb - bottom right, vibrant */}
        <div className="absolute -bottom-32 -right-20 w-[700px] h-[700px] rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(232, 90, 79, 0.2) 0%, rgba(232, 90, 79, 0.08) 40%, transparent 65%)'
        }} />

        {/* Coral secondary orb - bottom left, subtle */}
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(232, 90, 79, 0.12) 0%, transparent 60%)'
        }} />

        {/* Central glow for focus */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl" style={{
          background: 'radial-gradient(ellipse, rgba(59, 89, 152, 0.08) 0%, transparent 60%)'
        }} />

        {/* Refined dot grid pattern - more subtle */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #1E3A5F 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />

        {/* Horizontal accent lines - tech aesthetic */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(0deg, transparent 49.5%, rgba(30, 58, 95, 0.5) 49.5%, rgba(30, 58, 95, 0.5) 50.5%, transparent 50.5%)",
            backgroundSize: "100% 120px"
          }}
        />

        {/* Noise texture for depth */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Dark mode enhanced orbs */}
        <div className="hidden dark:block">
          <div className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full blur-3xl animate-float" style={{
            background: 'radial-gradient(circle, rgba(59, 89, 152, 0.35) 0%, rgba(59, 89, 152, 0.12) 40%, transparent 70%)'
          }} />
          <div className="absolute -bottom-32 -right-20 w-[700px] h-[700px] rounded-full blur-3xl" style={{
            background: 'radial-gradient(circle, rgba(255, 107, 91, 0.28) 0%, rgba(255, 107, 91, 0.1) 40%, transparent 65%)'
          }} />
        </div>
      </>
    );
  }

  // black-label theme
  return (
    <>
      {/* Warm ivory gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFEF9] via-[#FBF9F3] to-[#F5F2EA] dark:from-[#0A0C10] dark:via-[#0E1218] dark:to-[#080A0E]" />

      {/* Deep navy orb top */}
      <div className="absolute -top-60 left-1/3 w-[900px] h-[900px] bg-gradient-radial from-[#0D1B2A]/12 via-[#0D1B2A]/4 to-transparent rounded-full blur-3xl dark:from-[#1B263B]/35 dark:via-[#1B263B]/12" />

      {/* Gold orb bottom-right */}
      <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-gradient-radial from-[#C9A227]/15 via-[#C9A227]/5 to-transparent rounded-full blur-3xl dark:from-[#D4AF37]/20 dark:via-[#D4AF37]/6" />

      {/* Subtle gold shimmer center */}
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-radial from-[#C9A227]/8 to-transparent rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 dark:from-[#D4AF37]/10" />

      {/* Elegant horizontal lines */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(180deg, #C9A227 1px, transparent 1px)",
          backgroundSize: "100% 100px"
        }}
      />

      {/* Paper texture */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
    </>
  );
}
