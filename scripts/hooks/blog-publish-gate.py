#!/usr/bin/env python3
"""
PreToolUse:Edit hook — blocks setting draft: false in blog .mdx files without CP2 approval.

State file: $TMPDIR/blog-pipeline/pipeline-state-<slug>.json
Expected shape: { "cp2": true, ... }
"""

from pathlib import Path
import json
import sys
import os


def deny(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": f"Blog pipeline: {reason}"
        }
    }))
    sys.exit(0)


def main() -> None:
    raw = sys.stdin.read()
    data = json.loads(raw)

    tool_name = data.get("tool_name", "")
    if tool_name != "Edit":
        return

    tool_input = data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    old_string = tool_input.get("old_string", "")
    new_string = tool_input.get("new_string", "")

    # Only intercept blog .mdx files
    if "/content/blog/" not in file_path:
        return
    if not file_path.endswith(".mdx"):
        return

    # Only intercept draft: true -> draft: false transitions
    if "draft: true" not in old_string:
        return
    if "draft: false" not in new_string:
        return

    slug = Path(file_path).stem

    tmpdir = os.environ.get("TMPDIR", "/tmp")
    state_file = Path(tmpdir) / "blog-pipeline" / f"pipeline-state-{slug}.json"

    if not state_file.exists():
        deny(f"No active pipeline for slug '{slug}'. Cannot publish without pipeline.")

    state = json.loads(state_file.read_text())

    if state.get("cp2") is not True:
        deny("CP2 not approved. Complete quality gate and get approval first.")

    # CP2 approved — allow
    return


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"blog-publish-gate error: {e}", file=sys.stderr)
        sys.exit(0)
