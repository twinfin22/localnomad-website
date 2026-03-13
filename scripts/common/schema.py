"""
Unified Pain Record Schema
===========================
Every data source (Reddit, App Store, YouTube, Naver Blog, etc.)
outputs PainRecord objects. This is the single schema for all
downstream analysis.

Design decisions:
- dataclass, not dict — typos become errors, not silent bugs
- platform_sentiment is 0.0~1.0 normalized — star ratings, upvotes, etc.
  mapped to same scale so cross-source comparison works
- segment_hints is best-effort extraction from text — not guaranteed
- wtp_signals stores the actual matched phrases, not just count
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional


@dataclass
class PainRecord:
    # ── Required fields ──
    source: str              # "reddit" | "appstore" | "youtube" | "naver_blog"
    text: str                # Original text (comment body, review, blog excerpt)
    date: str                # ISO date "2025-01-15"

    # ── Classification ──
    categories: list[str] = field(default_factory=list)   # ["visa", "banking"]
    wtp_signals: list[str] = field(default_factory=list)   # ["would pay", "hired a"]

    # ── Platform signals (normalized) ──
    platform_sentiment: float = 0.5    # 0.0 = most negative, 1.0 = most positive
    engagement: int = 0                # Platform-specific, normalized per source

    # ── Segmentation hints (best-effort from text) ──
    segment_hints: dict = field(default_factory=dict)
    # Expected keys (all optional):
    #   visa_type: "E-7", "F-2", "D-8", "gold-card", etc.
    #   nationality: "US", "UK", "VN", etc.
    #   tenure: "short" (<1yr), "mid" (1-3yr), "long" (3+yr)
    #   role: "teacher", "engineer", "student", "nomad", etc.

    # ── Metadata (source-specific) ──
    lang: str = "en"                   # "en" | "ko" | "ja" | "zh" | "vi"
    country: str = "korea"             # "korea" | "japan" | "taiwan" | "general"
    url: str = ""                      # Source URL for manual review
    metadata: dict = field(default_factory=dict)
    # Reddit:     {"subreddit": "korea", "post_id": "abc123", "is_comment": true}
    # App Store:  {"app_name": "카카오뱅크", "app_id": "...", "rating": 1}
    # YouTube:    {"video_id": "...", "video_title": "...", "like_count": 42}
    # Naver Blog: {"blog_id": "...", "expert_type": "법무사", "post_title": "..."}

    def to_dict(self) -> dict:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False)

    @classmethod
    def from_dict(cls, d: dict) -> PainRecord:
        return cls(**{k: v for k, v in d.items() if k in cls.__dataclass_fields__})


@dataclass
class CollectionRun:
    """Metadata about a single collection run."""
    source: str
    started_at: str = field(default_factory=lambda: datetime.now().isoformat())
    finished_at: Optional[str] = None
    total_records: int = 0
    config: dict = field(default_factory=dict)  # Search params used
    errors: list[str] = field(default_factory=list)

    def finish(self, total: int):
        self.finished_at = datetime.now().isoformat()
        self.total_records = total

    def to_dict(self) -> dict:
        return asdict(self)
