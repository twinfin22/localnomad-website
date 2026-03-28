#!/usr/bin/env python3
"""Convert Markdown to Telegram HTML format.

Usage: cat file.md | python3 format-tg.py
Output: HTML suitable for Telegram parse_mode=HTML

Design:
- <b> for headings and emphasis (not UPPERCASE)
- <pre> for aligned data (narrow tables, metrics)
- Card layout for wide tables (5+ cols)
- Body paragraphs truncated to avoid text walls
- Mobile-first: targets ~35 char lines in <pre> blocks
"""

import sys
import re


SECTION_EMOJI = {
    'tldr': '📋', 'wins': '🏆', 'metrics': '📊',
    'blockers': '🚧', 'risks': '🚧', 'blockers & risks': '🚧',
    'next week': '🎯', '우선순위': '🎯', 'next week 우선순위': '🎯',
    '기술부채': '🔧', '기술부채 현황': '🔧',
    'device': '📱', 'content': '💡', 'opportunities': '💡',
    'action': '⚡', 'actions': '⚡',
}


def get_emoji(heading: str) -> str:
    hl = heading.lower().strip()
    for key, emoji in SECTION_EMOJI.items():
        if key in hl:
            return emoji
    return '▸'


def escape_html(text: str) -> str:
    """Escape HTML special chars, but preserve our own tags."""
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    return text


def md_bold_to_html(text: str) -> str:
    """Convert **bold** to <b>bold</b>."""
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)


def truncate(text: str, limit: int = 120) -> str:
    """Truncate long lines for mobile readability."""
    if len(text) <= limit:
        return text
    return text[:limit - 1] + '…'


def convert_table_narrow(rows: list, headers: list) -> list[str]:
    """Narrow table (≤4 cols) → compact list with first col as label."""
    cols = len(headers)
    result = []

    # If first row looks like a header with "이번 주 / 지난 주" pattern → metrics style
    if cols >= 3:
        for r in rows:
            first = escape_html(r[0] if r else '')
            rest_parts = []
            for i in range(1, cols):
                h = headers[i] if i < len(headers) else ''
                v = r[i] if i < len(r) else ''
                v = escape_html(v)
                if v:
                    rest_parts.append(f'{v}')
            rest = ' · '.join(rest_parts)
            result.append(f'  <b>{first}</b>  {rest}')
    else:
        # 2 cols → simple "label: value"
        for r in rows:
            label = escape_html(r[0] if r else '')
            value = escape_html(r[1] if len(r) > 1 else '')
            result.append(f'  {label}: {value}')

    return result


def convert_table_wide(rows: list, headers: list) -> list[str]:
    """Wide table (5+ cols) → compact card layout."""
    result = []
    for ri, r in enumerate(rows):
        if ri > 0:
            result.append('')
        first = r[0] if r else ''
        first = re.sub(r'\*\*(.+?)\*\*', r'\1', first)
        first = escape_html(truncate(first, 50))
        result.append(f'  ▪ <b>{first}</b>')
        for i in range(1, len(headers)):
            header = headers[i] if i < len(headers) else ''
            value = r[i] if i < len(r) else ''
            value = re.sub(r'\*\*(.+?)\*\*', r'\1', value)
            value = escape_html(truncate(value, 60))
            if value:
                result.append(f'    {header}: {value}')
    return result


def convert_table(lines: list[str]) -> list[str]:
    """Route table to narrow or wide formatter."""
    rows = []
    for line in lines:
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        rows.append(cells)

    rows = [r for r in rows if not all(re.match(r'^[-:]+$', c) for c in r)]
    if not rows:
        return []

    headers = rows[0]
    data = rows[1:]
    cols = max(len(r) for r in rows)

    if cols >= 5:
        return convert_table_wide(data, headers)
    else:
        return convert_table_narrow(data, headers)


def format_telegram(text: str) -> str:
    lines = text.split('\n')
    output = []
    table_buf = []
    in_table = False
    prev_was_blank = False

    for line in lines:
        stripped = line.strip()

        # Table rows
        if stripped.startswith('|') and stripped.endswith('|'):
            table_buf.append(stripped)
            in_table = True
            continue
        elif in_table:
            output.extend(convert_table(table_buf))
            output.append('')
            table_buf = []
            in_table = False

        # Skip consecutive blank lines
        if not stripped:
            if not prev_was_blank:
                output.append('')
                prev_was_blank = True
            continue
        prev_was_blank = False

        # H1 → bold title with line
        if stripped.startswith('# '):
            heading = stripped[2:].strip()
            heading = escape_html(heading)
            output.append(f'<b>{heading}</b>')
            output.append('')

        # H2 → emoji + bold
        elif stripped.startswith('## '):
            heading = stripped[3:].strip()
            # Strip numbering like "1. " "2. "
            clean = re.sub(r'^\d+\.\s*', '', heading)
            emoji = get_emoji(clean)
            heading = escape_html(heading)
            output.append(f'{emoji} <b>{heading}</b>')

        # H3 → indented
        elif stripped.startswith('### '):
            heading = stripped[4:].strip()
            heading = escape_html(heading)
            output.append(f'  ◦ <b>{heading}</b>')

        # HR
        elif re.match(r'^-{3,}$', stripped) or re.match(r'^\*{3,}$', stripped):
            output.append('━━━━━━━━━━━━━━━')

        # Bold list item
        elif stripped.startswith('- **'):
            m = re.match(r'^- \*\*(.+?)\*\*(.*)$', stripped)
            if m:
                title = escape_html(m.group(1))
                rest = escape_html(truncate(m.group(2), 100))
                output.append(f'  • <b>{title}</b>{rest}')
            else:
                output.append(f'  • {md_bold_to_html(escape_html(stripped[2:]))}')

        # Sub-list
        elif re.match(r'^\s+- ', line):
            inner = escape_html(stripped[2:])
            inner = md_bold_to_html(inner)
            output.append(f'     ◦ {inner}')

        # Regular list
        elif stripped.startswith('- '):
            content = escape_html(stripped[2:])
            content = md_bold_to_html(content)
            output.append(f'  • {content}')

        # Numbered list
        elif re.match(r'^\d+\. ', stripped):
            content = escape_html(stripped)
            content = md_bold_to_html(content)
            output.append(f'  {content}')

        # Body text — truncate walls
        else:
            content = escape_html(stripped)
            content = md_bold_to_html(content)
            # Truncate body paragraphs over 200 chars
            if len(stripped) > 200:
                content = escape_html(truncate(stripped, 200))
                content = md_bold_to_html(content)
            output.append(content)

    # Flush remaining table
    if table_buf:
        output.extend(convert_table(table_buf))

    # Clean up: no more than 2 consecutive empty lines
    result = []
    blank_count = 0
    for line in output:
        if line == '':
            blank_count += 1
            if blank_count <= 1:
                result.append(line)
        else:
            blank_count = 0
            result.append(line)

    return '\n'.join(result)


def split_messages(html: str, limit: int = 4000) -> list[str]:
    """Split HTML into TG-safe chunks on \n\n boundaries.

    Ensures no <b> tag is left unclosed in a chunk.
    """
    if len(html) <= limit:
        return [html]

    chunks = []
    remaining = html

    while remaining:
        if len(remaining) <= limit:
            chunks.append(remaining)
            break

        # Find last \n\n within limit
        cut = remaining.rfind('\n\n', 0, limit)
        if cut == -1:
            # Fallback: find last \n
            cut = remaining.rfind('\n', 0, limit)
        if cut == -1:
            cut = limit

        chunk = remaining[:cut]

        # Close any unclosed <b> tags
        opens = chunk.count('<b>') - chunk.count('</b>')
        if opens > 0:
            chunk += '</b>' * opens

        chunks.append(chunk)
        remaining = remaining[cut:].lstrip('\n')

    return chunks


def send_telegram(title: str, token: str, chat_id: str, html: str):
    """Send formatted HTML to Telegram, splitting if needed."""
    import urllib.request
    import urllib.parse

    chunks = split_messages(html)
    for i, chunk in enumerate(chunks):
        if i == 0:
            chunk = f'{title}\n\n{chunk}'

        data = urllib.parse.urlencode({
            'chat_id': chat_id,
            'parse_mode': 'HTML',
            'text': chunk,
        }).encode()

        req = urllib.request.Request(
            f'https://api.telegram.org/bot{token}/sendMessage',
            data=data,
        )
        try:
            urllib.request.urlopen(req)
        except Exception as e:
            print(f'Chunk {i+1} failed: {e}', file=sys.stderr)


if __name__ == '__main__':
    text = sys.stdin.read()
    html = format_telegram(text)

    if '--send' in sys.argv:
        # --send "title" "token" "chat_id"
        idx = sys.argv.index('--send')
        title = sys.argv[idx + 1]
        token = sys.argv[idx + 2]
        chat_id = sys.argv[idx + 3]
        send_telegram(title, token, chat_id, html)
    elif '--split' in sys.argv:
        chunks = split_messages(html)
        print('\n---TG_SPLIT---\n'.join(chunks))
    else:
        print(html)
