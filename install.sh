#!/usr/bin/env bash
# install.sh — one-command bootstrap of the Claude Code project system.
# Idempotent: safe to re-run; existing user-edited files are never clobbered
# (updates flow through sync-kit instead).
#
#   ./install.sh                          core system (scripts, templates, hooks, CLAUDE.md)
#   ./install.sh --with-research          also install the /research command (needs node+npm)
#   ./install.sh --with-memory <dir>      also import a memory dir (personal machines ONLY)
#
# Works on Linux and macOS. On Windows run it under Git Bash (see SETUP.md).
set -euo pipefail

KIT="$(cd "$(dirname "$0")" && pwd)"
OS="$(uname -s)"
BIN="$HOME/.local/bin"
HOOKS="$HOME/.claude/hooks"
SETTINGS="$HOME/.claude/settings.json"

WITH_RESEARCH=0
MEMORY_SRC=""
while [ $# -gt 0 ]; do
  case "$1" in
    --with-research) WITH_RESEARCH=1 ;;
    --with-memory) shift; MEMORY_SRC="${1:?--with-memory needs a source directory}" ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "unknown flag: $1 (see --help)" >&2; exit 1 ;;
  esac
  shift
done

say()  { printf '%s\n' "$*"; }
need() {
  command -v "$1" >/dev/null 2>&1 && return 0
  if [ "$OS" = "Darwin" ]; then
    say "missing dependency: $1 — install with:  brew install $2"
  else
    say "missing dependency: $1 — install it with your package manager (e.g. pacman -S $2 / apt install $2)"
  fi
  return 1
}

say "== claude-setup-kit install ($OS) =="

# --- 0. dependencies -------------------------------------------------------
MISSING=0
need git git  || MISSING=1
need jq  jq   || MISSING=1
need awk gawk || MISSING=1
[ "$MISSING" -eq 1 ] && { say "install the missing dependencies and re-run."; exit 1; }

# --- 1. scripts ------------------------------------------------------------
mkdir -p "$BIN"
for f in "$KIT"/bin/*; do
  cp "$f" "$BIN/$(basename "$f")"
  chmod +x "$BIN/$(basename "$f")"
done
say "scripts -> $BIN ($(ls "$KIT/bin" | tr '\n' ' '))"

case ":$PATH:" in
  *":$BIN:"*) ;;
  *)
    say ""
    say "NOTE: $BIN is not on your PATH. Add it:"
    say "  bash/zsh:  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc   (or ~/.zshrc)"
    say "  fish:      fish_add_path ~/.local/bin"
    say ""
    ;;
esac

# --- 2. session hooks ------------------------------------------------------
mkdir -p "$HOOKS"
for f in "$KIT"/hooks/*.sh; do
  base="$(basename "$f")"
  # show-toolkit.sh is per-machine content: install once, never overwrite local edits
  if [ "$base" = "show-toolkit.sh" ] && [ -f "$HOOKS/$base" ]; then
    continue
  fi
  cp "$f" "$HOOKS/$base"
  chmod +x "$HOOKS/$base"
done
say "hooks -> $HOOKS"

# --- 3. project template ---------------------------------------------------
mkdir -p "$HOME/templates"
if [ ! -d "$HOME/templates/project" ]; then
  cp -r "$KIT/templates/project" "$HOME/templates/project"
  say "template -> ~/templates/project"
else
  say "template exists (~/templates/project) — left untouched; 'sync-kit status' shows drift"
fi

# --- 4. CLAUDE.md baselines (never clobber an existing one) ----------------
install_claude_md() { # <kit file> <live file>
  if [ ! -f "$2" ]; then
    mkdir -p "$(dirname "$2")"
    cp "$1" "$2"
    say "installed $2 — fill in the machine-specific section at the bottom"
  else
    say "$2 exists — left untouched; 'sync-kit status' compares the shared baseline"
  fi
}
install_claude_md "$KIT/home/CLAUDE.md" "$HOME/CLAUDE.md"
install_claude_md "$KIT/global-claude/CLAUDE.md" "$HOME/.claude/CLAUDE.md"

# --- 5. settings.json hook wiring (absolute paths, additive merge) ---------
mkdir -p "$HOME/.claude"
[ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"
cp "$SETTINGS" "$SETTINGS.bak.$(date +%Y%m%d%H%M%S)"

merge() { # <jq filter>
  tmp=$(mktemp)
  jq "$1" "$SETTINGS" > "$tmp" && mv "$tmp" "$SETTINGS"
}

if ! grep -q 'hooks/show-projects.sh' "$SETTINGS"; then
  merge ".hooks.SessionStart = ((.hooks.SessionStart // []) + [{
    \"matcher\": \"startup\",
    \"hooks\": [
      {\"type\": \"command\", \"command\": \"bash $HOOKS/show-toolkit.sh\"},
      {\"type\": \"command\", \"command\": \"bash $HOOKS/show-projects.sh\"},
      {\"type\": \"command\", \"command\": \"bash $HOOKS/project-status.sh\"}
    ]
  }])"
  say "wired SessionStart hooks into settings.json"
fi
if ! grep -q 'bin/mirror-output' "$SETTINGS"; then
  merge ".hooks.PostToolUse = ((.hooks.PostToolUse // []) + [{
    \"matcher\": \"Write|Edit\",
    \"hooks\": [{\"type\": \"command\", \"command\": \"bash $BIN/mirror-output\"}]
  }])"
  say "wired mirror-output (PostToolUse) into settings.json"
fi
if ! grep -q 'bin/claude-done-notify' "$SETTINGS"; then
  merge ".hooks.Stop = ((.hooks.Stop // []) + [{
    \"hooks\": [{\"type\": \"command\", \"command\": \"bash $BIN/claude-done-notify\"}]
  }])"
  say "wired claude-done-notify (Stop) into settings.json"
fi

# --- 6. projects dir + index ------------------------------------------------
mkdir -p "$HOME/projects"
"$BIN/project-index" >/dev/null 2>&1 || true
say "project index -> ~/projects.md"

# --- 7. remember where the kit lives (for sync-kit) -------------------------
mkdir -p "$HOME/.config/claude-setup-kit"
printf '%s\n' "$KIT" > "$HOME/.config/claude-setup-kit/path"

# --- 8. optional: /research command -----------------------------------------
if [ "$WITH_RESEARCH" -eq 1 ]; then
  if command -v npm >/dev/null 2>&1; then
    mkdir -p "$HOME/.claude/research" "$HOME/.claude/commands"
    cp "$KIT"/research/* "$HOME/.claude/research/"
    chmod +x "$HOME/.claude/research/run-research.sh"
    cp "$KIT"/commands/*.md "$HOME/.claude/commands/"
    (cd "$HOME/.claude/research" && npm install --silent)
    say "/research installed — run 'node ~/.claude/research/setup-auth.js' once to log in to claude.ai"
  else
    say "skipped --with-research: node/npm not found (macOS: brew install node)"
  fi
fi

# --- 9. optional: import memory (personal machines only) --------------------
if [ -n "$MEMORY_SRC" ]; then
  if [ -d "$MEMORY_SRC" ]; then
    slug=$(printf '%s' "$HOME" | tr '/' '-')
    dest="$HOME/.claude/projects/$slug/memory"
    mkdir -p "$dest"
    cp "$MEMORY_SRC"/*.md "$dest"/
    say "memory imported -> $dest ($(ls "$dest" | wc -l | tr -d ' ') files)"
  else
    say "skipped --with-memory: $MEMORY_SRC is not a directory"
  fi
fi

say ""
say "== done =="
say "next steps:"
say "  1. fill in the machine-specific section at the bottom of ~/CLAUDE.md"
say "     (OS/shell, sudo policy, git host, anything confidential to this machine)"
say "  2. edit ~/.claude/hooks/show-toolkit.sh to list this machine's commands"
say "  3. create your first project:  new-project <slug> \"Name\" \"description\""
say "  4. anytime later:  sync-kit status   (shows drift between this machine and the kit repo)"
