import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import {
  locales,
  defaultLocale,
  countries,
  isValidLocale,
  isValidCountry,
  isLocaleAvailableForCountry,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

// =============================================================================
// Route Configuration
// =============================================================================

/**
 * Protected routes that require authentication
 * These paths are relative to /{country}/...
 */
const protectedPaths = ["/visa/dashboard"];

/**
 * Auth routes (login, signup)
 * Redirect to dashboard if already authenticated
 */
const authRoutes = ["/auth/login", "/auth/signup"];

/**
 * Global routes that don't have a country prefix
 * These are brand-level pages
 */
const globalRoutes = [
  "/about",
  "/blog",
  "/terms",
  "/privacy",
  "/refund",
  "/business",
];

// =============================================================================
// Middleware
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Parse URL to extract locale and country
  const parsed = parseUrl(pathname);

  // Handle auth routes (global, no locale/country prefix in URL)
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return handleAuthRoute(request, parsed.locale);
  }

  // For non-English URLs that already have locale prefix, pass through
  // For English URLs (no prefix), we need to rewrite internally
  let response: NextResponse;
  let effectiveLocale = parsed.locale;

  if (parsed.needsRewrite) {
    // Rewrite /korea/visa → /en/korea/visa internally
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    response = NextResponse.rewrite(url);
    effectiveLocale = defaultLocale;
  } else {
    response = NextResponse.next();
  }

  // Set locale cookie for next-intl
  response.cookies.set("NEXT_LOCALE", effectiveLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  // Handle protected routes
  if (parsed.country) {
    const isProtectedRoute = protectedPaths.some((path) =>
      parsed.path.startsWith(path)
    );

    if (isProtectedRoute) {
      const authResult = await handleProtectedRoute(
        request,
        effectiveLocale,
        parsed.country
      );
      if (authResult) return authResult;
    }
  }

  // Detect Accept-Language for suggestion banner
  const suggestedLocale = detectPreferredLocale(request);
  if (suggestedLocale && suggestedLocale !== effectiveLocale) {
    response.headers.set("x-suggested-locale", suggestedLocale);
  }

  return response;
}

// =============================================================================
// URL Parsing
// =============================================================================

interface ParsedUrl {
  locale: Locale;
  country: Country | null;
  path: string;
  needsRewrite: boolean;
}

function parseUrl(pathname: string): ParsedUrl {
  const segments = pathname.split("/").filter(Boolean);
  let locale: Locale = defaultLocale;
  let country: Country | null = null;
  let pathStart = 0;
  let needsRewrite = false;

  // Check if first segment is a locale (ja, zh-tw)
  if (segments[0] && isValidLocale(segments[0])) {
    locale = segments[0] as Locale;
    pathStart = 1;

    // Check if next segment is a country
    if (segments[pathStart] && isValidCountry(segments[pathStart])) {
      country = segments[pathStart] as Country;
      pathStart += 1;
    }
  }
  // Check if first segment is a country (without locale = English)
  else if (segments[0] && isValidCountry(segments[0])) {
    country = segments[0] as Country;
    locale = defaultLocale;
    pathStart = 1;
    needsRewrite = true; // /korea/visa needs rewrite to /en/korea/visa
  }
  // Only rewrite root path, not global routes (they're served without locale prefix)
  else if (segments.length === 0) {
    needsRewrite = true; // / needs rewrite to /en
  }

  const path = "/" + segments.slice(pathStart).join("/");

  return { locale, country, path, needsRewrite };
}

// =============================================================================
// Auth Handling
// =============================================================================

async function handleAuthRoute(
  request: NextRequest,
  locale: Locale
): Promise<NextResponse> {
  const { user } = await updateSession(request);

  if (user) {
    // Redirect logged-in users to dashboard
    const dashboardUrl =
      locale === defaultLocale
        ? "/korea/visa/dashboard"
        : `/${locale}/korea/visa/dashboard`;
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return NextResponse.next();
}

async function handleProtectedRoute(
  request: NextRequest,
  locale: Locale,
  country: Country
): Promise<NextResponse | null> {
  const { user } = await updateSession(request);

  if (!user) {
    // Redirect to login with return URL
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return null; // Continue to route
}

// =============================================================================
// Language Detection
// =============================================================================

function detectPreferredLocale(request: NextRequest): Locale | null {
  // Check if user has already dismissed the banner or set preference
  const preferredLang = request.cookies.get("preferred_lang")?.value;
  if (preferredLang && isValidLocale(preferredLang)) {
    return null; // User already made a choice
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return null;

  // Parse Accept-Language header
  const languages = acceptLanguage.split(",").map((lang) => {
    const [code, q] = lang.trim().split(";q=");
    return {
      code: code.split("-")[0].toLowerCase(),
      q: parseFloat(q) || 1,
    };
  });

  // Sort by quality
  languages.sort((a, b) => b.q - a.q);

  // Map to our supported locales
  for (const { code } of languages) {
    if (code === "ja") return "ja";
    if (code === "zh") return "zh-tw";
    if (code === "en") return "en";
  }

  return null;
}

// =============================================================================
// Helpers
// =============================================================================

function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files (favicon.ico, etc.)
  );
}

// =============================================================================
// Matcher Config
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
