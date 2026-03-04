import type { ReactNode } from 'react';

const URL_REGEX = /\b(https?:\/\/[^\s,)]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s,)]*)?)/g;

/**
 * Converts plain-text URLs (e.g. "koreaprcalculator.com") into clickable links.
 * Returns the original string if no URLs are found; otherwise returns a ReactNode.
 */
export function linkifyText(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[1];
    const href = url.startsWith('http') ? url : `https://${url}`;
    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {url}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (parts.length === 0) return text;
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}
