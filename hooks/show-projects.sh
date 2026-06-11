#!/usr/bin/env bash
# SessionStart greeting: active project list, sourced live from ~/projects.md so the
# greeting can never drift from the index. Install path: ~/.claude/hooks/show-projects.sh

cat <<'EOF'
Here's the project list (from ~/projects.md) — anything to pick up from?

EOF

awk -F'|' '
  /^## Active/ { in_active=1; next }
  /^## / && in_active { exit }
  in_active && /^\|/ && !/^\|---/ {
    name=$2; gsub(/^ +| +$/, "", name)
    desc=$4; gsub(/^ +| +$/, "", desc)
    if (name != "" && name != "Project") printf "  - %s: %s\n", name, desc
  }
' "$HOME/projects.md"
