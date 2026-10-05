#!/usr/bin/env python3
"""
PreToolUse:Edit hook — blocks setting draft: false in blog .mdx files without CP2 approval.

State file: $HOME/.local/state/localnomad/blog-pipeline/pipeline-state-<slug>.json
Expected shape: { "cp2": true, ... }
"""

from pathlib import Path
import json
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from blog_state import blog_path, protected_state_path, edit_publishes, require_publication_approval


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
    if protected_state_path(file_path):
        deny("Use blog-state.sh, not direct edit of state file")

    # Only intercept blog .mdx files
    is_blog, _ = blog_path(file_path)
    if not is_blog:
        return

    if edit_publishes(tool_input):
        require_publication_approval(Path(file_path).stem)

    # CP2 approved — allow
    return


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        deny("State validation failed; publication requires a valid protected pipeline record.")
