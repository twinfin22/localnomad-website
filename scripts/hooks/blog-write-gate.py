#!/usr/bin/env python3
"""
PreToolUse:Write hook — Blog pipeline write gate.

Guard 1 (R6): Block direct writes to pipeline-state JSON files.
Guard 2 (R2): Block .mdx writes to content/blog/ without active pipeline state.
"""

import json
import os
import sys
from pathlib import Path


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
    if "pipeline-state" in basename and basename.endswith(".json"):
        deny("Use blog-state.sh, not direct write to state file")
        sys.exit(0)

    # Guard 2 (R2): Block .mdx writes to content/blog/ without pipeline state
    if "/content/blog/" in file_path and file_path.endswith(".mdx"):
        slug = Path(file_path).stem
        tmpdir = os.environ.get("TMPDIR", "/tmp")
        state_path = Path(tmpdir) / "blog-pipeline" / f"pipeline-state-{slug}.json"

        if not state_path.exists():
            deny(f"No active pipeline for slug '{slug}'. Run /blog first.")
            sys.exit(0)

        with open(state_path) as f:
            state = json.load(f)

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
    print(f"blog-write-gate error: {e}", file=sys.stderr)
    sys.exit(0)
