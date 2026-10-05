# Manual operations after background-job retirement

The repository's Reddit, SEO Pulse, weekly report, blog-candidate, reflection
(including signal/noise), catch-up, and Telegram sender shell entrypoints are
retired. They return success quietly, even when old schedulers supply arguments.
The three automation workflows are removed. Do not add replacement schedules,
collectors, or scheduled CI. Analytics utilities and existing documents remain
available; `format-tg.py` only formats local stdin and optionally splits output.

## Interactive blog checkpoints

Use `bash scripts/blog-state.sh` with the existing `init`, `advance`, `checkpoint`,
`status`, `reset`, and `list` commands. State defaults to
`$HOME/.local/state/localnomad/blog-pipeline`; an absolute
`LOCALNOMAD_BLOG_STATE_DIR` may explicitly override it. `TMPDIR` is not used.
Initialize active workflows again and repeat both approvals. Legacy temporary
checkpoint records must not be copied or imported.

State directories and stage-report directories must belong to the operator with
mode `0700`; state and report files must be regular operator-owned files with mode
`0600`. Symlinks, malformed records, and unsafe permissions are rejected, including
on force initialization and reset. Create six protected JSON reports beneath
`stage4-reports/<slug>/` before advancing from stage 3 to 4. CP1 and CP2 remain
required for advancement to stages 3 and 5 respectively.

Both hooks reject direct checkpoint writes or edits. Publishing through whole-file
Write or partial Edit requires CP2, including equivalent YAML false syntax and
removing the draft field. Frontmatter checks use the repository's existing Node
and `gray-matter` dependency; missing dependencies or parser timeouts deny access.
Ordinary draft/body edits and updates to already-published translations retain
their existing behavior.

## Local credentials

Create `.env.local` and `.mcp.json` using `umask 077` and preserve mode `0600`.
Check ownership and ACLs after copying or recreating these files; on macOS,
`ls -lde .env.local .mcp.json` displays metadata without displaying values.
Files must have no ACL granting another account access. Keep both files ignored
by Git. Never log values during checks. Rotate provider credentials only when
exposure is established and the provider action has separate approval.

## Offline verification

Run `bash scripts/test-security-regressions.sh` explicitly. It checks retired
entrypoints with mocks, preserved outputs, local-only formatting, protected state
transitions and adversarial inputs, credential metadata, and analytics fixtures.
It makes no live API, Telegram, or model calls. Local credential files must exist
for the metadata test; it does not load their contents.

## Operational rollout

Review the repository patch before approved commit/push or branch deployment.
Keep the three GitHub workflows disabled. Remove their files and retire shell
entrypoints on every operational branch, then recheck workflow state and queued
or running jobs. Check Claude cloud schedules separately and disable relevant
schedules only through approved operational writes. A locally passing suite does
not establish external shutdown.

During rollback, keep automation disabled and preserve retired entrypoints.
Restore documents if needed without restoring vulnerable execution paths.
Website runtime and hosting changes are outside this retirement.
