import type { ReactNode } from 'react';

const URL_REGEX = /\b(https?:\/\/[^\s,)]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s,)]*)?)/g;

/** Known keywords that should auto-link to their canonical URL. */
const KEYWORD_LINKS: Record<string, string> = {
  HiKorea: 'https://www.hikorea.go.kr',
};

const KEYWORD_REGEX = new RegExp(
  `\\b(${Object.keys(KEYWORD_LINKS).join('|')})\\b`,
  'g',
);

/**
 * Converts plain-text URLs and known keywords into clickable links.
 * Returns the original string if no matches are found; otherwise returns a ReactNode.
 */
export function linkifyText(text: string): ReactNode {
  const COMBINED = new RegExp(
    `${URL_REGEX.source}|${KEYWORD_REGEX.source}`,
    'g',
  );

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  COMBINED.lastIndex = 0;
  while ((match = COMBINED.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const urlMatch = match[1]; // URL capture group
    const keywordMatch = match[2]; // keyword capture group

    if (urlMatch) {
      const href = urlMatch.startsWith('http')
        ? urlMatch
        : `https://${urlMatch}`;
      parts.push(
        <a
          key={match.index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {urlMatch}
        </a>,
      );
    } else if (keywordMatch && KEYWORD_LINKS[keywordMatch]) {
      parts.push(
        <a
          key={match.index}
          href={KEYWORD_LINKS[keywordMatch]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {keywordMatch}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (parts.length === 0) return text;
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}
