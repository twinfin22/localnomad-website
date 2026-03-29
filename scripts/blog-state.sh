#!/usr/bin/env bash
set -euo pipefail

STATE_DIR="${TMPDIR:-/tmp}/blog-pipeline"
mkdir -p "$STATE_DIR"

usage() {
  cat <<EOF
Usage: blog-state.sh <command> [args]

Commands:
  init <slug> [--force]       Create state file at stage 1
  advance <stage> <slug>      Advance to given stage (preconditions apply)
  checkpoint <cp1|cp2> <slug> Set checkpoint flag to true
  status [slug]               Print current state JSON
  reset <slug>                Delete state file
  list                        List all active pipeline state files
EOF
  exit 1
}

state_file() {
  local slug="$1"
  echo "$STATE_DIR/pipeline-state-${slug}.json"
}

require_state() {
  local slug="$1"
  local file
  file="$(state_file "$slug")"
  if [[ ! -f "$file" ]]; then
    echo "ERROR: No pipeline state found for slug '${slug}'" >&2
    exit 1
  fi
  echo "$file"
}

cmd_init() {
  local slug=""
  local force=false

  for arg in "$@"; do
    if [[ "$arg" == "--force" ]]; then
      force=true
    else
      slug="$arg"
    fi
  done

  if [[ -z "$slug" ]]; then
    echo "ERROR: init requires a slug argument" >&2
    exit 1
  fi

  local file
  file="$(state_file "$slug")"

  if [[ -f "$file" ]] && [[ "$force" == false ]]; then
    echo "ERROR: State already exists for slug '${slug}'. Use --force to overwrite." >&2
    exit 1
  fi

  local now
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  jq -n \
    --arg slug "$slug" \
    --arg started_at "$now" \
    '{"slug": $slug, "stage": 1, "cp1": false, "cp2": false, "started_at": $started_at}' \
    > "$file"

  echo "OK: Initialized pipeline for slug '${slug}'"
}

cmd_advance() {
  if [[ $# -lt 2 ]]; then
    echo "ERROR: advance requires <stage_number> and <slug>" >&2
    exit 1
  fi

  local target_stage="$1"
  local slug="$2"
  local file
  file="$(require_state "$slug")"

  local current_stage cp1 cp2
  current_stage="$(jq -r '.stage' "$file")"
  cp1="$(jq -r '.cp1' "$file")"
  cp2="$(jq -r '.cp2' "$file")"

  case "$target_stage" in
    2)
      if [[ "$current_stage" -ne 1 ]]; then
        echo "ERROR: Cannot advance to stage 2 — current stage is ${current_stage}, expected 1" >&2
        exit 1
      fi
      ;;
    3)
      if [[ "$current_stage" -ne 2 ]]; then
        echo "ERROR: Cannot advance to stage 3 — current stage is ${current_stage}, expected 2" >&2
        exit 1
      fi
      if [[ "$cp1" != "true" ]]; then
        echo "ERROR: Cannot advance to stage 3 — CP1 not approved" >&2
        exit 1
      fi
      ;;
    4)
      if [[ "$current_stage" -ne 3 ]]; then
        echo "ERROR: Cannot advance to stage 4 — current stage is ${current_stage}, expected 3" >&2
        exit 1
      fi
      local report_dir="$STATE_DIR/stage4-reports/${slug}"
      local report_count=0
      if [[ -d "$report_dir" ]]; then
        report_count="$(find "$report_dir" -maxdepth 1 -name '*.json' | wc -l | tr -d ' ')"
      fi
      if [[ "$report_count" -lt 6 ]]; then
        echo "ERROR: Cannot advance to stage 4 — only ${report_count} report(s) found in ${report_dir}/ (need ≥6)" >&2
        exit 1
      fi
      ;;
    5)
      if [[ "$current_stage" -ne 4 ]]; then
        echo "ERROR: Cannot advance to stage 5 — current stage is ${current_stage}, expected 4" >&2
        exit 1
      fi
      if [[ "$cp2" != "true" ]]; then
        echo "ERROR: Cannot advance to stage 5 — CP2 not approved" >&2
        exit 1
      fi
      ;;
    *)
      echo "ERROR: Unknown target stage '${target_stage}'. Valid stages: 2, 3, 4, 5" >&2
      exit 1
      ;;
  esac

  local tmp
  tmp="$(mktemp)"
  jq --argjson stage "$target_stage" '.stage = $stage' "$file" > "$tmp"
  mv "$tmp" "$file"

  echo "OK: Advanced to stage ${target_stage} for slug '${slug}'"
}

cmd_checkpoint() {
  if [[ $# -lt 2 ]]; then
    echo "ERROR: checkpoint requires <cp1|cp2> and <slug>" >&2
    exit 1
  fi

  local cp="$1"
  local slug="$2"
  local file
  file="$(require_state "$slug")"

  local current_stage
  current_stage="$(jq -r '.stage' "$file")"

  case "$cp" in
    cp1)
      if [[ "$current_stage" -lt 2 ]]; then
        echo "ERROR: Cannot set CP1 — current stage is ${current_stage}, requires stage ≥ 2" >&2
        exit 1
      fi
      local tmp
      tmp="$(mktemp)"
      jq '.cp1 = true' "$file" > "$tmp"
      mv "$tmp" "$file"
      echo "OK: CP1 approved for slug '${slug}'"
      ;;
    cp2)
      if [[ "$current_stage" -lt 4 ]]; then
        echo "ERROR: Cannot set CP2 — current stage is ${current_stage}, requires stage ≥ 4" >&2
        exit 1
      fi
      local tmp
      tmp="$(mktemp)"
      jq '.cp2 = true' "$file" > "$tmp"
      mv "$tmp" "$file"
      echo "OK: CP2 approved for slug '${slug}'"
      ;;
    *)
      echo "ERROR: Unknown checkpoint '${cp}'. Valid values: cp1, cp2" >&2
      exit 1
      ;;
  esac
}

cmd_status() {
  if [[ $# -ge 1 ]]; then
    local slug="$1"
    local file
    file="$(require_state "$slug")"
    jq '.' "$file"
  else
    local files=("$STATE_DIR"/pipeline-state-*.json)
    if [[ ${#files[@]} -eq 0 ]] || [[ ! -f "${files[0]}" ]]; then
      echo "No active pipeline states found."
    else
      for f in "${files[@]}"; do
        jq '.' "$f"
      done
    fi
  fi
}

cmd_reset() {
  if [[ $# -lt 1 ]]; then
    echo "ERROR: reset requires a slug argument" >&2
    exit 1
  fi

  local slug="$1"
  local file
  file="$(state_file "$slug")"

  if [[ ! -f "$file" ]]; then
    echo "ERROR: No pipeline state found for slug '${slug}'" >&2
    exit 1
  fi

  rm "$file"
  echo "OK: Reset pipeline state for slug '${slug}'"
}

cmd_list() {
  local found=false
  for f in "$STATE_DIR"/pipeline-state-*.json; do
    if [[ -f "$f" ]]; then
      echo "$f"
      found=true
    fi
  done
  if [[ "$found" == false ]]; then
    echo "No active pipeline states found."
  fi
}

# Main dispatch
if [[ $# -lt 1 ]]; then
  usage
fi

COMMAND="$1"
shift

case "$COMMAND" in
  init)       cmd_init "$@" ;;
  advance)    cmd_advance "$@" ;;
  checkpoint) cmd_checkpoint "$@" ;;
  status)     cmd_status "$@" ;;
  reset)      cmd_reset "$@" ;;
  list)       cmd_list "$@" ;;
  *)
    echo "ERROR: Unknown command '${COMMAND}'" >&2
    usage
    ;;
esac
