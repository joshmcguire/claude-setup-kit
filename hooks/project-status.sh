#!/usr/bin/env bash
# SessionStart hook: if the session starts inside a project, print where we left off so the
# session begins already oriented, zero tool calls. Install: ~/.claude/hooks/project-status.sh
set -u

ROOT="$HOME/projects"
case "$PWD" in
  "$ROOT"/*) ;;
  *) exit 0 ;;
esac

# project root = first path component under ~/projects
P="$ROOT/$(echo "${PWD#"$ROOT"/}" | cut -d/ -f1)"
[ -d "$P" ] || exit 0

echo "Project status ($(basename "$P")):"

if [ -f "$P/CHANGELOG.md" ]; then
  echo "Last CHANGELOG entries:"
  grep -E '^- \*\*[0-9]{4}' "$P/CHANGELOG.md" | tail -3 | sed 's/^/  /'
  next=$(grep -oE 'NEXT:.*' "$P/CHANGELOG.md" | tail -1 || true)
  [ -n "$next" ] && echo "  $next"
else
  echo "  (no CHANGELOG.md yet)"
fi

if [ -f "$P/LEARNINGS.md" ]; then
  learn=$(grep -E '^- \*\*[0-9]{4}' "$P/LEARNINGS.md" | head -2 | sed 's/^/  /')
  [ -n "$learn" ] && { echo "Recent LEARNINGS:"; echo "$learn"; }
fi

if [ -d "$P/decisions" ]; then
  drafts=$(grep -l '^status: draft' "$P"/decisions/[0-9]*.md 2>/dev/null | sed 's|.*/||' | tr '\n' ' ')
  drafts="${drafts% }"
  [ -n "$drafts" ] && echo "Draft ADRs awaiting decision: $drafts"
fi

if [ -d "$P/.git" ]; then
  br=$(git -C "$P" branch --show-current 2>/dev/null)
  dirty=$(git -C "$P" status --porcelain 2>/dev/null | wc -l)
  echo "Git: branch $br, $dirty uncommitted change(s)"
fi

if [ -d "$P/transcripts" ]; then
  t=$(ls "$P/transcripts" 2>/dev/null | grep -E '^[0-9]{4}-' | sort | tail -1)
  [ -n "$t" ] && echo "Newest transcript: $t (mine it if not yet mined)"
fi
exit 0
