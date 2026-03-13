"""
Naver Expert Blog Mining for LocalNomad
=======================================
Searches Naver blogs from 법무사/세무사/노무사/공인중개사 for foreigner FAQ patterns.
These are professionals who deal with foreigner issues daily — their FAQ posts
are essentially validated pain point lists.

Strategy:
  1. Search Naver Blog API with expert-type × topic keyword combinations
  2. Fetch full blog post text from mobile URLs (no iframe, no Playwright needed)
  3. Extract FAQ patterns: "~할 수 있나요?", "~해야 하나요?", "Q:", "A:" etc.
  4. Classify into pain categories

Dependencies:
  pip3 install requests beautifulsoup4

Usage:
  export NAVER_CLIENT_ID="..."
  export NAVER_CLIENT_SECRET="..."
  python3 scripts/naver-blog-mining.py
  python3 scripts/naver-blog-mining.py --output docs/agent/reference --max-per-keyword 50
  python3 scripts/naver-blog-mining.py --experts visa         # Only 법무사/행정사
  python3 scripts/naver-blog-mining.py --experts tax,labor    # 세무사 + 노무사
  python3 scripts/naver-blog-mining.py --dry-run

Output:
  {output_dir}/naver_blog-{timestamp}.json
  {output_dir}/naver_blog-{timestamp}.csv
"""

from __future__ import annotations

import sys
import os
import re
import time
import argparse
from datetime import datetime
from collections import Counter
from typing import Optional
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.schema import PainRecord, CollectionRun
from common.classify import classify_record
from common.io import save_records, save_progress, load_progress

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ Missing dependencies: pip3 install requests beautifulsoup4")
    sys.exit(1)


# ── Search Keyword Configuration ──────────────────────────────
# expert_type × topic combinations
# Each expert type has topics they'd blog about for foreigner clients

EXPERT_CONFIG = {
    "visa": {
        "label": "법무사/행정사 (비자·체류)",
        "keywords": [
            "외국인 비자 상담",
            "외국인 체류자격 변경",
            "E-7 비자 변경 방법",
            "F-2 점수제 비자",
            "D-8 투자 비자",
            "외국인 비자 연장",
            "외국인 영주권 신청",
            "외국인등록증 발급",
            "체류기간 연장 서류",
            "비자 자주 묻는 질문",
            "행정사 외국인 비자",
            "외국인 귀화 절차",
            "결혼비자 F-6 신청",
        ],
    },
    "tax": {
        "label": "세무사 (세금)",
        "keywords": [
            "외국인 종합소득세",
            "외국인 연말정산",
            "외국인 세금 신고 방법",
            "비거주자 세금",
            "이중과세 방지 협약",
            "외국인 사업자등록",
            "외국인 프리랜서 세금",
            "외국인 퇴직소득세",
            "해외 소득 신고 한국",
            "세무사 외국인 상담",
        ],
    },
    "labor": {
        "label": "노무사 (노동·직장)",
        "keywords": [
            "외국인 근로계약",
            "외국인 임금체불",
            "외국인 퇴직금",
            "외국인 산업재해",
            "외국인 직장 내 차별",
            "외국인 근로자 권리",
            "외국인 4대보험",
            "노무사 외국인 상담",
            "외국인 해고 부당",
        ],
    },
    "housing": {
        "label": "공인중개사/법무사 (부동산)",
        "keywords": [
            "외국인 전세 계약",
            "외국인 월세 계약",
            "외국인 보증금 반환",
            "외국인 부동산 계약 주의사항",
            "외국인 임대차 보호법",
            "외국인 집 구하기",
            "외국인 주택 임대",
            "외국인 전입신고",
        ],
    },
    "banking": {
        "label": "금융 (은행·송금·보험)",
        "keywords": [
            "외국인 계좌 개설",
            "외국인 신용카드 발급",
            "외국인 대출",
            "외국인 송금 방법",
            "외국인 공동인증서",
            "외국인 건강보험 가입",
            "외국인 국민연금",
        ],
    },
    "startup": {
        "label": "법무사/세무사 (창업)",
        "keywords": [
            "외국인 사업자등록 방법",
            "외국인 법인설립",
            "외국인 투자 신고",
            "D-8 비자 창업",
            "외국인 개인사업자",
        ],
    },
    "family": {
        "label": "법무사 (가족·결혼)",
        "keywords": [
            "국제결혼 절차 한국",
            "외국인 배우자 비자",
            "외국인 출생신고",
            "외국인 이혼 절차",
            "외국인 자녀 학교",
        ],
    },
    "driving": {
        "label": "행정 (면허·기타)",
        "keywords": [
            "외국인 운전면허 전환",
            "국제운전면허 한국",
            "외국인 면허 시험",
        ],
    },
}


# ── FAQ Pattern Detection ─────────────────────────────────────

FAQ_PATTERNS = [
    # Korean question patterns
    re.compile(r"[가-힣]+\s*(?:할\s*수\s*있나요|해야\s*하나요|되나요|인가요|일까요|필요한가요)\s*\??", re.IGNORECASE),
    re.compile(r"Q\s*[.:]\s*.+", re.IGNORECASE),
    re.compile(r"(?:질문|문의|상담)\s*[.:]\s*.+"),
    re.compile(r"(?:자주\s*묻는|FAQ|많이\s*(?:묻는|하는)\s*질문)"),
    # Numbered Q&A
    re.compile(r"^\s*\d+\s*[.)]\s*.+(?:나요|인가요|할까요|됩니까)\s*\??", re.MULTILINE),
    # "~의 경우" pattern (case descriptions)
    re.compile(r"[가-힣]+(?:의\s*경우|인\s*경우|일\s*때)"),
]


def extract_faq_questions(text: str) -> list[str]:
    """Extract FAQ-style questions from blog text."""
    questions = []
    for pattern in FAQ_PATTERNS:
        for match in pattern.finditer(text):
            q = match.group(0).strip()
            if len(q) >= 10 and len(q) <= 200:  # Reasonable question length
                questions.append(q)
    return list(set(questions))  # Deduplicate


# ── Naver API Functions ───────────────────────────────────────

def naver_blog_search(
    query: str,
    client_id: str,
    client_secret: str,
    display: int = 30,
    start: int = 1,
    sort: str = "sim",  # sim=relevance, date=newest
) -> list[dict]:
    """
    Search Naver blogs via official API.
    Returns list of {title, link, description, bloggername, bloggerlink, postdate}.
    """
    url = "https://openapi.naver.com/v1/search/blog"
    headers = {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
    }
    params = {
        "query": query,
        "display": min(display, 100),
        "start": start,
        "sort": sort,
    }

    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get("items", [])
    except requests.RequestException as e:
        print(f"    ⚠ Naver search error: {e}")
        return []


def fetch_blog_content(blog_url: str) -> Optional[str]:
    """
    Fetch full text from a Naver blog post.
    Converts to mobile URL (no iframe) and extracts main content.
    """
    mobile_url = _to_mobile_url(blog_url)
    if not mobile_url:
        return None

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
                          "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        }
        resp = requests.get(mobile_url, headers=headers, timeout=10)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Try multiple content selectors (Naver blog structure varies)
        content = None
        for selector in [
            "div.se-main-container",      # Smart Editor 3 (newest)
            "div.__se_component_area",     # Smart Editor 2
            "div.post-view",              # Old format
            "div#postViewArea",           # Classic
            "div.se_component_wrap",      # Another variant
        ]:
            content = soup.select_one(selector)
            if content:
                break

        if not content:
            # Fallback: get all text from body
            content = soup.find("body")

        if content:
            text = content.get_text(separator="\n", strip=True)
            return text[:10000]  # Cap at 10K chars

        return None

    except requests.RequestException as e:
        print(f"    ⚠ Blog fetch error for {mobile_url}: {e}")
        return None


def _to_mobile_url(url: str) -> Optional[str]:
    """Convert Naver blog URL to mobile format (simpler HTML, no iframe)."""
    # Handle blog.naver.com/PostView.naver?blogId=xxx&logNo=yyy
    # → m.blog.naver.com/xxx/yyy
    parsed = urlparse(url)

    if "blog.naver.com" in parsed.netloc:
        # Already a direct blog URL
        path = parsed.path.strip("/")
        params = parse_qs(parsed.query)

        if "blogId" in params and "logNo" in params:
            blog_id = params["blogId"][0]
            log_no = params["logNo"][0]
            return f"https://m.blog.naver.com/{blog_id}/{log_no}"

        # Format: blog.naver.com/username/post_id
        parts = path.split("/")
        if len(parts) >= 2:
            return f"https://m.blog.naver.com/{parts[0]}/{parts[1]}"
        elif len(parts) == 1:
            return f"https://m.blog.naver.com/{parts[0]}"

    # Non-Naver blog link — return as is
    return url


def clean_html_entities(text: str) -> str:
    """Remove HTML entities from Naver API results."""
    text = re.sub(r"</?b>", "", text)
    text = re.sub(r"&[a-z]+;", " ", text)
    text = re.sub(r"&#\d+;", " ", text)
    return text.strip()


# ── Main Mining Function ──────────────────────────────────────

def mine_blogs(
    client_id: str,
    client_secret: str,
    expert_types: list[str] | None = None,
    max_per_keyword: int = 30,
    fetch_content: bool = True,
    output_dir: str = ".",
) -> list[PainRecord]:
    """
    Full pipeline:
    1. Search Naver blogs by expert-type × topic keywords
    2. Optionally fetch full blog content
    3. Extract FAQ patterns
    4. Classify and save
    """
    run = CollectionRun(
        source="naver_blog",
        config={
            "expert_types": expert_types or list(EXPERT_CONFIG.keys()),
            "max_per_keyword": max_per_keyword,
            "fetch_content": fetch_content,
        },
    )

    # Resume
    all_records = load_progress(output_dir, "naver_blog")
    seen_urls = set()
    if all_records:
        seen_urls = {r.url for r in all_records}
        print(f"  Resuming: {len(seen_urls)} posts already processed\n")

    # Build keyword list
    keywords = []
    for expert_type, config in EXPERT_CONFIG.items():
        if expert_types and expert_type not in expert_types:
            continue
        for kw in config["keywords"]:
            keywords.append((expert_type, config["label"], kw))

    total_kw = len(keywords)
    print(f"🔍 Searching {total_kw} keywords across {len(set(e for e, _, _ in keywords))} expert types\n")

    for i, (expert_type, expert_label, kw) in enumerate(keywords):
        print(f"[{i+1}/{total_kw}] [{expert_label}] \"{kw}\"")

        results = naver_blog_search(
            kw, client_id, client_secret,
            display=max_per_keyword, sort="sim",
        )

        if not results:
            print(f"    → 0 results")
            time.sleep(0.5)
            continue

        new_posts = 0
        for item in results:
            link = item.get("link", "")
            if link in seen_urls:
                continue
            seen_urls.add(link)

            # Search API snippet
            title = clean_html_entities(item.get("title", ""))
            description = clean_html_entities(item.get("description", ""))
            blogger = item.get("bloggername", "")
            postdate = item.get("postdate", "")

            # Format date: 20250615 → 2025-06-15
            date_str = f"{postdate[:4]}-{postdate[4:6]}-{postdate[6:8]}" if len(postdate) == 8 else "unknown"

            # Full content (optional, slower)
            full_text = ""
            faq_questions = []
            if fetch_content:
                full_text = fetch_blog_content(link) or ""
                if full_text:
                    faq_questions = extract_faq_questions(full_text)
                time.sleep(1.0)  # Polite crawling

            # Use full text if available, otherwise snippet
            analysis_text = full_text if full_text else f"{title} {description}"

            # Classify
            cl = classify_record(analysis_text)

            record = PainRecord(
                source="naver_blog",
                text=analysis_text[:3000],
                date=date_str,
                categories=cl["categories"],
                wtp_signals=cl["wtp_signals"],
                segment_hints=cl["segment_hints"],
                platform_sentiment=0.5,  # Blogs are informational, not sentiment-bearing
                engagement=0,  # No engagement metric from Naver API
                lang="ko",
                country="korea",
                url=link,
                metadata={
                    "expert_type": expert_type,
                    "expert_label": expert_label,
                    "blog_title": title,
                    "blogger": blogger,
                    "search_keyword": kw,
                    "faq_questions": faq_questions[:20],  # Top 20 FAQ patterns
                    "has_full_text": bool(full_text),
                    "full_text_length": len(full_text),
                },
            )
            all_records.append(record)
            new_posts += 1

        print(f"    → {len(results)} results, {new_posts} new")

        # Progress save every 10 keywords
        if (i + 1) % 10 == 0:
            save_progress(all_records, output_dir, "naver_blog")
            print(f"    💾 Progress saved ({len(all_records)} total)\n")

        time.sleep(0.5)  # API rate limit

    # Final save
    paths = save_records(all_records, output_dir, "naver_blog", run)
    print_summary(all_records)

    return all_records


def print_summary(records: list[PainRecord]):
    """Print summary."""
    print(f"\n{'='*60}")
    print(f"📊 NAVER EXPERT BLOG MINING SUMMARY")
    print(f"{'='*60}")
    print(f"Total records: {len(records)}")

    # By expert type
    expert_counts = Counter(r.metadata.get("expert_type", "?") for r in records)
    expert_labels = {}
    for r in records:
        etype = r.metadata.get("expert_type", "?")
        if etype not in expert_labels:
            expert_labels[etype] = r.metadata.get("expert_label", etype)
    print(f"\nBy expert type:")
    for expert, count in expert_counts.most_common():
        label = expert_labels.get(expert, expert)
        print(f"  {label} ({expert}): {count}")

    # By category
    cat_counts = Counter()
    for r in records:
        for c in r.categories:
            cat_counts[c] += 1
    print(f"\nBy pain category:")
    for cat, count in cat_counts.most_common():
        print(f"  {cat}: {count}")

    # Full text fetch rate
    with_text = sum(1 for r in records if r.metadata.get("has_full_text"))
    print(f"\nFull text fetched: {with_text}/{len(records)} ({with_text/len(records)*100:.0f}%)" if records else "")

    # FAQ patterns found
    all_faqs = []
    for r in records:
        all_faqs.extend(r.metadata.get("faq_questions", []))
    print(f"\nFAQ patterns extracted: {len(all_faqs)}")
    if all_faqs:
        print(f"Sample FAQs:")
        for q in all_faqs[:15]:
            print(f"  • {q[:80]}")

    # Top bloggers (who writes the most about foreigner issues?)
    blogger_counts = Counter(r.metadata.get("blogger", "?") for r in records)
    print(f"\nTop bloggers (foreigner expert content):")
    for blogger, count in blogger_counts.most_common(10):
        print(f"  {blogger}: {count} posts")


# ── CLI ───────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Naver Expert Blog Mining for LocalNomad")
    parser.add_argument("--output", type=str, default=".", help="Output directory")
    parser.add_argument("--max-per-keyword", type=int, default=30, help="Max results per keyword (default: 30)")
    parser.add_argument("--experts", type=str, default=None,
                        help="Expert types: visa,tax,labor,housing,banking,startup,family,driving (default: all)")
    parser.add_argument("--no-content", action="store_true",
                        help="Skip fetching full blog content (faster, uses only search snippets)")
    parser.add_argument("--dry-run", action="store_true", help="Show config without fetching")
    args = parser.parse_args()

    client_id = os.environ.get("NAVER_CLIENT_ID")
    client_secret = os.environ.get("NAVER_CLIENT_SECRET")

    expert_types = args.experts.split(",") if args.experts else None

    if args.dry_run:
        print("🔍 DRY RUN — Config:\n")
        total_kw = 0
        for expert_type, config in EXPERT_CONFIG.items():
            if expert_types and expert_type not in expert_types:
                continue
            kws = config["keywords"]
            print(f"  [{config['label']}] ({len(kws)} keywords)")
            for kw in kws:
                print(f"    \"{kw}\"")
            total_kw += len(kws)

        print(f"\n  Total: {total_kw} keywords × {args.max_per_keyword} results = max {total_kw * args.max_per_keyword} posts")
        fetch_time = total_kw * args.max_per_keyword * 1.5 if not args.no_content else total_kw * 0.5
        print(f"  Fetch content: {'No (snippets only)' if args.no_content else 'Yes (full text)'}")
        print(f"  Estimated time: ~{fetch_time / 60:.0f} min")
        sys.exit(0)

    if not client_id or not client_secret:
        print("❌ Set Naver API credentials:")
        print("   export NAVER_CLIENT_ID=\"...\"")
        print("   export NAVER_CLIENT_SECRET=\"...\"")
        print("\n   Get them at: https://developers.naver.com (애플리케이션 등록 → 검색 API)")
        sys.exit(1)

    print("📝 Naver Expert Blog Mining for LocalNomad")
    print(f"   Max {args.max_per_keyword} results per keyword")
    print(f"   Content fetch: {'disabled' if args.no_content else 'enabled'}")
    print(f"   Output: {args.output}\n")

    records = mine_blogs(
        client_id=client_id,
        client_secret=client_secret,
        expert_types=expert_types,
        max_per_keyword=args.max_per_keyword,
        fetch_content=not args.no_content,
        output_dir=args.output,
    )

    print(f"\n✅ Done! {len(records)} records collected.")
    print(f"💡 FAQ patterns are the gold — check metadata.faq_questions in the JSON.")
