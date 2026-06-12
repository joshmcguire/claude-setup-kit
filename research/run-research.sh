#!/usr/bin/env bash
# Wrapper that runs the research script under xvfb (virtual display)
# so no browser window appears on the desktop.
# Falls back to headed mode if xvfb isn't available.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if command -v xvfb-run &>/dev/null; then
  exec xvfb-run --auto-servernum --server-args="-screen 0 1280x900x24" \
    node "$SCRIPT_DIR/research.js" "$@"
else
  echo "Warning: xvfb-run not found, running with visible browser window" >&2
  exec node "$SCRIPT_DIR/research.js" "$@"
fi
