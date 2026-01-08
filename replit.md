# LocalNomad - My V0 Project

## Overview
A Next.js 16 landing page application for LocalNomad - a soft landing service for Seoul. Built with React 19, Tailwind CSS 4, and shadcn/ui components using the App Router pattern.

## Project Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - React components
  - `ui/` - shadcn/ui component library
  - `SeoulNeighborhoodMap.tsx` - Interactive Mapbox map for Seoul neighborhoods
  - Landing page sections (hero, pricing, FAQ, etc.)
- `hooks/` - Custom React hooks
- `lib/` - Utility functions
- `public/` - Static assets
- `styles/` - Global CSS styles

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Maps**: Mapbox GL JS
- **Styling**: Tailwind CSS with CSS variables
- **Package Manager**: npm

## Environment Variables
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Required for the Seoul neighborhood map. Get a token from mapbox.com and add it in Replit Secrets.

## Development
The dev server runs on port 5000 with `npm run dev -- -p 5000 -H 0.0.0.0`

## Deployment
Uses Next.js production build with `npm run build` and `npm run start`

## User Preferences

### System Integrity Rules
- **Prefer shared components**: Always update or extend existing shared components and design tokens
- **No one-off styles**: Do NOT create one-off styles or components for a single section
- **Document exceptions**: If an exception is unavoidable, document it explicitly

### Design System
- **Button variants**: Use standardized variants from `components/ui/button.tsx` (default, outline, secondary, ghost, inverted, ctaPrimary, ctaSecondary)
- **Theme tokens**: Use semantic color tokens (primary, foreground, muted, etc.) — no hardcoded colors
- **Consistency**: All changes must work across Desktop/Mobile and Light/Dark mode
