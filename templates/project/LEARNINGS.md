# LEARNINGS — {{NAME}}

Operational gotchas that are neither decisions (those are ADRs) nor session history (that is
the CHANGELOG): the non-obvious thing that cost time once and should never cost it again.
Append-only, newest at the top, a few lines each. Read at session start alongside the CHANGELOG.

Format: `- **YYYY-MM-DD** — <the trap, then the fix or the rule that avoids it>`

<!-- Example:
- **2026-06-12** — `gh run watch --exit-status` can print a green tail on a run that actually
  failed. Confirm with `gh run view <id> --json conclusion -q .conclusion` before trusting it.
-->
