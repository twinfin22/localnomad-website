---
name: blog
description: LocalNomad blog research, writing, update, review, and publication-preparation entrypoint.
---

# /blog [request]

Read and follow the repository source of truth:

`./.agents/skills/localnomad-blog/SKILL.md`

Use only the references it routes to for the requested mode. Keep publication, push, deployment, external messages, purchases, and public-URL changes behind explicit approval.

Interactive checkpoint state is managed only by `scripts/blog-state.sh` and stored at
`$HOME/.local/state/localnomad/blog-pipeline`, independently of `TMPDIR`.
An absolute `LOCALNOMAD_BLOG_STATE_DIR` may override that location. The storage directory
and stage-report directories must belong to the operator with mode `0700`; state and
stage-report JSON files must be regular operator-owned files with mode `0600`.
Do not use symlinks or copy old temporary checkpoint records. Reinitialize active
workflows and repeat both approvals. `init --force` cannot overwrite unsafe or malformed
existing records; resolve the storage problem first. Store the six stage 4 report JSONs
under `stage4-reports/<slug>/` in the protected state directory before advancing to stage 4.
