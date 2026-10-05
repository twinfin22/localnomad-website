#!/usr/bin/env python3
"""
PreToolUse:Write hook — Blog pipeline write gate.

Guard 1 (R6): Block direct writes to pipeline-state JSON files.
Guard 2 (R2): Block .mdx writes to content/blog/ without active pipeline state.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from blog_state import read_state, blog_path, protected_state_path, publication_status, require_publication_approval, read_blog_document


def deny(reason: str) -> None:
    output = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": f"Blog pipeline: {reason}",
        }
    }
    print(json.dumps(output))


def main() -> None:
    raw = sys.stdin.read()
    data = json.loads(raw)

    if data.get("tool_name") != "Write":
        sys.exit(0)

    file_path = data.get("tool_input", {}).get("file_path", "")
    if not file_path:
        sys.exit(0)

    basename = Path(file_path).name

    # Guard 1 (R6): Block direct writes to pipeline-state JSON files
    if protected_state_path(file_path):
        deny("Use blog-state.sh, not direct write to state file")
        sys.exit(0)

    # Guard 2 (R2): Block .mdx writes to content/blog/ without pipeline state
    # Skip gate for translation subdirectories (ja/, zh-cn/) — source EN post already published
    is_blog, is_translation = blog_path(file_path)
    if is_blog and publication_status(data.get('tool_input', {}).get('content')):
        already_published_translation = False
        if is_translation:
            try:
                already_published_translation = publication_status(read_blog_document(file_path))
            except FileNotFoundError:
                pass
        if not already_published_translation:
            require_publication_approval(Path(file_path).stem)
    if is_blog and not is_translation:
        slug = Path(file_path).stem
        state = read_state(slug)

        stage = state.get("stage", 0)
        if stage < 3:
            deny("Stage 2 (outline) not complete. Finish Stage 2 and get CP1 approval.")
            sys.exit(0)

        cp1 = state.get("cp1", False)
        if cp1 is not True:
            deny("CP1 not approved. Get checkpoint 1 approval first.")
            sys.exit(0)

    sys.exit(0)


try:
    main()
except Exception as e:
    deny("State validation failed; reinitialize through blog-state.sh after correcting storage permissions.")
    sys.exit(0)
