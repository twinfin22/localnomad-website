# Create Component

Create a new React component following the project conventions.

## Arguments
- `$ARGUMENTS` - Component name and optional location (e.g., "FeatureBanner" or "sections/FeatureBanner")

## Instructions

1. Parse the component name from `$ARGUMENTS`
2. Determine the location:
   - If path specified (e.g., "sections/MyComponent"), create in `components/[path]/`
   - If no path, create in `components/`
3. Create the component file following these conventions:
   - Use kebab-case for filename (e.g., `feature-banner.tsx`)
   - Use PascalCase for component name
   - Include proper TypeScript interface for props
   - Add `"use client"` only if component needs interactivity
   - Follow import order from CLAUDE.md
4. If creating in a feature directory, update or create `index.ts` barrel export

## Template

```typescript
// Only add if component needs hooks/browser APIs:
// "use client";

import { cn } from "@/lib/utils";

interface [ComponentName]Props {
  className?: string;
}

export function [ComponentName]({ className }: [ComponentName]Props) {
  return (
    <section className={cn("", className)}>
      {/* Component content */}
    </section>
  );
}
```
