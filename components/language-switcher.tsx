"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  locales,
  localeNames,
  parseLocalePath,
  buildLocalePath,
  type Locale,
} from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale: currentLocale, country, path } = parseLocalePath(pathname);

  const getLocalizedPath = (targetLocale: Locale) => {
    return buildLocalePath(path, targetLocale, country ?? undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} asChild>
            <Link
              href={getLocalizedPath(locale)}
              className={
                locale === currentLocale
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              }
            >
              {localeNames[locale]}
              {locale === currentLocale && " ✓"}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
