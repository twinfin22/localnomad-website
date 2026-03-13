"""
HTTP Fetch Utilities
====================
Shared HTTP fetching with retry logic, rate limiting, and 429 handling.
Used by all scrapers to avoid duplicating this logic.

No external dependencies — uses only urllib (stdlib).
"""

from __future__ import annotations

import json
import time
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus
from typing import Optional


# ── Default config ────────────────────────────────────────────

DEFAULT_USER_AGENT = "LocalNomad-Mining/2.0 (research; github.com/localnomad)"
DEFAULT_TIMEOUT = 15
DEFAULT_DELAY = 2.0        # Seconds between requests
DEFAULT_MAX_RETRIES = 3
DEFAULT_BACKOFF_BASE = 5   # Seconds for first 429 backoff


class RateLimiter:
    """
    Simple rate limiter that tracks last request time
    and sleeps if needed before allowing the next one.
    """
    def __init__(self, min_delay: float = DEFAULT_DELAY):
        self.min_delay = min_delay
        self._last_request_time: float = 0

    def wait(self):
        """Block until enough time has passed since last request."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self.min_delay:
            sleep_time = self.min_delay - elapsed
            time.sleep(sleep_time)
        self._last_request_time = time.time()


class FetchError(Exception):
    """Raised when a fetch fails after all retries."""
    def __init__(self, url: str, status: int, message: str):
        self.url = url
        self.status = status
        super().__init__(f"HTTP {status} for {url}: {message}")


def fetch_json(
    url: str,
    *,
    user_agent: str = DEFAULT_USER_AGENT,
    timeout: int = DEFAULT_TIMEOUT,
    max_retries: int = DEFAULT_MAX_RETRIES,
    rate_limiter: Optional[RateLimiter] = None,
    headers: Optional[dict] = None,
) -> dict:
    """
    Fetch a URL and parse JSON response.

    Handles:
    - 429 Too Many Requests: exponential backoff (5s, 10s, 20s)
    - 5xx Server Errors: retry up to max_retries
    - Network errors: retry with backoff
    - Other errors: raise immediately

    Returns parsed JSON dict.
    Raises FetchError if all retries exhausted.
    """
    if rate_limiter:
        rate_limiter.wait()

    req_headers = {"User-Agent": user_agent}
    if headers:
        req_headers.update(headers)

    req = Request(url, headers=req_headers)
    last_error = None

    for attempt in range(max_retries):
        try:
            with urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode())

        except HTTPError as e:
            last_error = e
            status = e.code

            if status == 429:
                # Rate limited — exponential backoff
                wait_time = DEFAULT_BACKOFF_BASE * (2 ** attempt)
                print(f"  ⏳ Rate limited (429). Waiting {wait_time}s... (attempt {attempt + 1}/{max_retries})",
                      file=sys.stderr)
                time.sleep(wait_time)
                continue

            elif status >= 500:
                # Server error — retry
                wait_time = 2 * (attempt + 1)
                print(f"  ⚠ Server error ({status}). Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})",
                      file=sys.stderr)
                time.sleep(wait_time)
                continue

            elif status == 403:
                # Forbidden — often means we're blocked. Don't retry.
                raise FetchError(url, status, "Forbidden (possibly blocked)")

            elif status == 404:
                # Not found — don't retry
                raise FetchError(url, status, "Not found")

            else:
                raise FetchError(url, status, str(e))

        except (URLError, TimeoutError, ConnectionError) as e:
            last_error = e
            wait_time = 2 * (attempt + 1)
            print(f"  ⚠ Network error: {e}. Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})",
                  file=sys.stderr)
            time.sleep(wait_time)
            continue

    # All retries exhausted
    status = getattr(last_error, 'code', 0) if isinstance(last_error, HTTPError) else 0
    raise FetchError(url, status, f"Failed after {max_retries} attempts: {last_error}")


# ── Reddit-specific helpers ───────────────────────────────────

def reddit_search(
    subreddit: str,
    query: str,
    *,
    limit: int = 25,
    sort: str = "relevance",
    time_filter: str = "all",
    rate_limiter: Optional[RateLimiter] = None,
) -> list[dict]:
    """
    Search a subreddit via Reddit's public JSON API.
    Returns list of post data dicts.
    """
    url = (
        f"https://www.reddit.com/r/{subreddit}/search.json"
        f"?q={quote_plus(query)}&restrict_sr=on&sort={sort}"
        f"&t={time_filter}&limit={limit}"
    )
    try:
        data = fetch_json(url, rate_limiter=rate_limiter)
        posts = data.get("data", {}).get("children", [])
        return [p["data"] for p in posts if p["kind"] == "t3"]
    except FetchError as e:
        print(f"  ⚠ Reddit search failed for r/{subreddit} '{query}': {e}", file=sys.stderr)
        return []


def reddit_comments(
    permalink: str,
    *,
    limit: int = 200,
    sort: str = "top",
    depth: int = 2,
    rate_limiter: Optional[RateLimiter] = None,
) -> list[dict]:
    """
    Fetch comments from a Reddit post.
    Returns list of {body, score, author, depth, parent_id} dicts.
    Now supports depth > 1 for sub-comments.
    """
    safe_permalink = quote_plus(permalink, safe="/")
    url = (
        f"https://www.reddit.com{safe_permalink}.json"
        f"?limit={limit}&sort={sort}&depth={depth}"
    )
    try:
        data = fetch_json(url, rate_limiter=rate_limiter)
        if len(data) < 2:
            return []

        results = []
        _extract_comments(data[1].get("data", {}).get("children", []), results, current_depth=0)
        return results

    except FetchError as e:
        print(f"  ⚠ Comment fetch failed for {permalink}: {e}", file=sys.stderr)
        return []


def _extract_comments(children: list, results: list, current_depth: int):
    """Recursively extract comments including replies."""
    for c in children:
        if c["kind"] != "t1":
            continue
        cdata = c["data"]
        body = cdata.get("body", "")
        author = cdata.get("author", "")

        if not body or author == "AutoModerator" or body == "[deleted]":
            continue

        results.append({
            "body": body[:3000],
            "score": cdata.get("score", 0),
            "author": author,
            "depth": current_depth,
            "parent_id": cdata.get("parent_id", ""),
        })

        # Recurse into replies
        replies = cdata.get("replies")
        if isinstance(replies, dict):
            reply_children = replies.get("data", {}).get("children", [])
            _extract_comments(reply_children, results, current_depth + 1)


def reddit_top_posts(
    subreddit: str,
    *,
    limit: int = 50,
    time_filter: str = "all",
    rate_limiter: Optional[RateLimiter] = None,
) -> list[dict]:
    """Fetch top posts from a subreddit."""
    url = f"https://www.reddit.com/r/{subreddit}/top.json?t={time_filter}&limit={limit}"
    try:
        data = fetch_json(url, rate_limiter=rate_limiter)
        posts = data.get("data", {}).get("children", [])
        return [p["data"] for p in posts if p["kind"] == "t3"]
    except FetchError as e:
        print(f"  ⚠ Top posts fetch failed for r/{subreddit}: {e}", file=sys.stderr)
        return []
