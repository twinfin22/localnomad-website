# Open Questions

## reddit-karma-skill - 2026-03-13 (Revised)
- [x] Should the skill live in `localnomad-blog-plugin/skills/` or `.claude/skills/`? — Resolved: plugin directory, matching convention. Symlinked to `.claude/skills/`.
- [x] redditwarp vs existing utilities? — Resolved: use existing `scripts/common/fetch.py`. No new dependencies.
- [x] Rate limit tolerance: how many Reddit API calls per session is acceptable? — Resolved: ~50 calls per session. Existing 2s RateLimiter stays, but scout script should cap total calls at ~50.
- [x] Should the brief template include a "competitor replies" section showing what others already said in the thread? — Resolved: Yes, include top 3 existing replies in the brief for differentiation.
- [x] Should drafted replies be saved to a file (e.g., `.omc/drafts/reddit/`) for later reference, or is terminal output sufficient? — Resolved: Terminal output only. No file persistence.
- [ ] `subreddits/search.json` endpoint response shape — Need to verify exact structure during implementation. If it differs from post search, parsing logic needs adjustment.
