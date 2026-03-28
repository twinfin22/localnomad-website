#!/usr/bin/env python3
"""Filter Reddit JSON by keywords and merge into threads file.

Usage:
  reddit-filter.py filter <keywords_regex> <threads_file>  < reddit_json
  reddit-filter.py merge <threads_file>                    < filtered_json
  reddit-filter.py count <threads_file>
  reddit-filter.py best <threads_file>
  reddit-filter.py comments                                < comments_json
"""

import sys
import json
import re


def _safe_json_load() -> dict:
    """Load JSON from stdin, tolerating control chars and encoding issues."""
    raw = sys.stdin.buffer.read().decode('utf-8', errors='replace')
    return json.loads(raw, strict=False)


def filter_threads(keywords_pattern: str) -> str:
    data = _safe_json_load()
    children = data.get('data', {}).get('children', [])
    keywords = re.compile(keywords_pattern, re.IGNORECASE)
    results = []
    for c in children:
        d = c.get('data', {})
        title = d.get('title', '')
        selftext = d.get('selftext', '')
        if keywords.search(title) or keywords.search(selftext):
            results.append({
                'subreddit': d.get('subreddit', ''),
                'title': title,
                'url': 'https://reddit.com' + d.get('permalink', ''),
                'selftext': selftext[:1500],
                'score': d.get('score', 0),
                'num_comments': d.get('num_comments', 0),
                'created_utc': d.get('created_utc', 0),
            })
    return json.dumps(results)


def merge_threads(threads_file: str) -> None:
    existing = json.load(open(threads_file))
    new = json.loads(sys.stdin.read())
    existing.extend(new)
    json.dump(existing, open(threads_file, 'w'))


def count_threads(threads_file: str) -> int:
    return len(json.load(open(threads_file)))


def best_thread_url(threads_file: str) -> str:
    threads = json.load(open(threads_file))
    if not threads:
        return ''
    threads.sort(key=lambda t: t['score'] + t['num_comments'] * 2, reverse=True)
    return threads[0]['url']


def extract_comments() -> str:
    try:
        data = _safe_json_load()
        comments = []
        if isinstance(data, list) and len(data) > 1:
            children = data[1].get('data', {}).get('children', [])
            for c in children[:10]:
                d = c.get('data', {})
                if d.get('body'):
                    comments.append({
                        'author': d.get('author', ''),
                        'body': d['body'][:500],
                        'score': d.get('score', 0),
                    })
        return json.dumps(comments)
    except Exception:
        return '[]'


if __name__ == '__main__':
    cmd = sys.argv[1]

    if cmd == 'filter':
        print(filter_threads(sys.argv[2]))
    elif cmd == 'merge':
        merge_threads(sys.argv[2])
    elif cmd == 'count':
        print(count_threads(sys.argv[2]))
    elif cmd == 'best':
        print(best_thread_url(sys.argv[2]))
    elif cmd == 'comments':
        print(extract_comments())
