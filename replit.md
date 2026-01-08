# My V0 Project

## Overview
A Next.js 16 landing page application with React 19, Tailwind CSS 4, and shadcn/ui components. Built using the App Router pattern.

## Project Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - React components
  - `ui/` - shadcn/ui component library
  - Landing page sections (hero, pricing, FAQ, etc.)
- `hooks/` - Custom React hooks
- `lib/` - Utility functions
- `public/` - Static assets
- `styles/` - Global CSS styles

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Styling**: Tailwind CSS with CSS variables
- **Package Manager**: npm

## Development
The dev server runs on port 5000 with `npm run dev -- -p 5000 -H 0.0.0.0`

## Deployment
Uses Next.js production build with `npm run build` and `npm run start`
