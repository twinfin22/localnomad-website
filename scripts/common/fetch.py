"""
HTTP Fetch Utilities
====================
Shared HTTP fetching with retry logic, rate limiting, and 429 handling.
Used by all scrapers to avoid duplicating this logic.

Reddit helpers use public .json endpoints by default.
If REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are set, auto-upgrades to
OAuth (oauth.reddit.com) for higher rate limits (600 req/10min).

No external dependencies — uses only urllib (stdlib).
"""

from __future__ import annotations

import base64
import json
import os
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus, urlencode
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


# ── Reddit OAuth (optional, auto-detected) ───────────────────
#
# When REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are set (in .env or env),
# all Reddit helpers transparently switch from www.reddit.com/*.json to
# oauth.reddit.com/* with a Bearer token.  This gives 600 req/10min
# instead of the unauthenticated limit.
#
# If credentials are absent, everything works via public .json endpoints.

_reddit_token: Optional[str] = None
_reddit_token_expires: float = 0
_reddit_oauth_checked: bool = False
_reddit_oauth_available: bool = False


def _try_load_reddit_credentials() -> tuple[str, str]:
    """Try to load Reddit OAuth credentials. Returns ('', '') if not found."""
    client_id = os.environ.get('REDDIT_CLIENT_ID', '')
    client_secret = os.environ.get('REDDIT_CLIENT_SECRET', '')

    if client_id and client_secret:
        return client_id, client_secret

    env_candidates = [
        os.path.join(os.getcwd(), '.env'),
        os.path.join(os.path.dirname(__file__), '..', '..', '.env'),
    ]
    for env_path in env_candidates:
        env_path = os.path.abspath(env_path)
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('#') or '=' not in line:
                        continue
                    key, _, val = line.partition('=')
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key == 'REDDIT_CLIENT_ID' and not client_id:
                        client_id = val
                    elif key == 'REDDIT_CLIENT_SECRET' and not client_secret:
                        client_secret = val
            break

    return client_id, client_secret


def _is_oauth_available() -> bool:
    """Check once whether OAuth credentials are configured."""
    global _reddit_oauth_checked, _reddit_oauth_available
    if not _reddit_oauth_checked:
        cid, csec = _try_load_reddit_credentials()
        _reddit_oauth_available = bool(cid and csec)
        if _reddit_oauth_available:
            print("  🔑 Reddit OAuth credentials found — using oauth.reddit.com", file=sys.stderr)
        _reddit_oauth_checked = True
    return _reddit_oauth_available


def _get_reddit_token() -> str:
    """Get a valid OAuth token, refreshing if expired."""
    global _reddit_token, _reddit_token_expires

    if _reddit_token and time.time() < _reddit_token_expires:
        return _reddit_token

    client_id, client_secret = _try_load_reddit_credentials()
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    req = Request(
        "https://www.reddit.com/api/v1/access_token",
        data=urlencode({"grant_type": "client_credentials"}).encode(),
        headers={
            "Authorization": f"Basic {credentials}",
            "User-Agent": DEFAULT_USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )

    with urlopen(req, timeout=DEFAULT_TIMEOUT) as resp:
        data = json.loads(resp.read().decode())

    if "access_token" not in data:
        raise RuntimeError(f"Reddit OAuth response missing access_token: {data}")

    _reddit_token = data["access_token"]
    _reddit_token_expires = time.time() + data.get("expires_in", 3600) - 300
    return _reddit_token


def _reddit_fetch(
    path: str,
    *,
    params: Optional[dict] = None,
    rate_limiter: Optional[RateLimiter] = None,
) -> dict:
    """
    Fetch Reddit data. Auto-selects between:
    - OAuth: oauth.reddit.com + Bearer token (if credentials available)
    - Public: www.reddit.com + .json suffix (fallback)
    """
    if _is_oauth_available():
        token = _get_reddit_token()
        query_string = f"?{urlencode(params)}" if params else ""
        url = f"https://oauth.reddit.com{path}{query_string}"
        return fetch_json(url, headers={"Authorization": f"Bearer {token}"}, rate_limiter=rate_limiter)
    else:
        query_string = f"?{urlencode(params)}" if params else ""
        url = f"https://www.reddit.com{path}.json{query_string}"
        return fetch_json(url, rate_limiter=rate_limiter)


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
    Search a subreddit for posts.
    Returns list of post data dicts.
    """
    try:
        data = _reddit_fetch(
            f"/r/{subreddit}/search",
            params={
                "q": query,
                "restrict_sr": "on",
                "sort": sort,
                "t": time_filter,
                "limit": str(limit),
            },
            rate_limiter=rate_limiter,
        )
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
    """
    # permalink already starts with /r/... — use directly as path
    try:
        data = _reddit_fetch(
            permalink,
            params={
                "limit": str(limit),
                "sort": sort,
                "depth": str(depth),
            },
            rate_limiter=rate_limiter,
        )
        if not isinstance(data, list) or len(data) < 2:
            return []

        results: list[dict] = []
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


def reddit_subreddit_search(
    query: str,
    *,
    limit: int = 10,
    rate_limiter: Optional[RateLimiter] = None,
) -> list[dict]:
    """
    Search for subreddits matching a topic query.
    Returns list of {name, subscribers, public_description, url} dicts.
    """
    try:
        data = _reddit_fetch(
            "/subreddits/search",
            params={
                "q": query,
                "limit": str(limit),
            },
            rate_limiter=rate_limiter,
        )
        children = data.get("data", {}).get("children", [])
        results = []
        for item in children:
            if item.get("kind") != "t5":
                continue
            d = item["data"]
            results.append({
                "name": d.get("display_name", ""),
                "subscribers": d.get("subscribers", 0),
                "public_description": d.get("public_description", "")[:200],
                "url": d.get("url", ""),
            })
        return results
    except FetchError as e:
        print(f"  ⚠ Subreddit search failed for '{query}': {e}", file=sys.stderr)
        return []


def reddit_top_posts(
    subreddit: str,
    *,
    limit: int = 50,
    time_filter: str = "all",
    rate_limiter: Optional[RateLimiter] = None,
) -> list[dict]:
    """Fetch top posts from a subreddit."""
    try:
        data = _reddit_fetch(
            f"/r/{subreddit}/top",
            params={
                "t": time_filter,
                "limit": str(limit),
            },
            rate_limiter=rate_limiter,
        )
        posts = data.get("data", {}).get("children", [])
        return [p["data"] for p in posts if p["kind"] == "t3"]
    except FetchError as e:
        print(f"  ⚠ Top posts fetch failed for r/{subreddit}: {e}", file=sys.stderr)
        return []
