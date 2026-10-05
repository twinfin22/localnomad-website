#!/usr/bin/env bash
# Explicitly manual: no workflow or scheduler invokes this suite.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
export PYTHONDONTWRITEBYTECODE=1
python3 scripts/tests/test-retired-jobs.py
python3 scripts/tests/test-blog-state.py
python3 scripts/tests/test-credential-permissions.py
node scripts/seo/test-analytics.mjs
