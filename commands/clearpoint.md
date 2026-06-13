Run the clear-point ritual: confirm we are at a genuine boundary, save all state, then hand off
cleanly so a cold session can resume with zero digging. Do NOT run this mid-task — only when a
task is finished (and committed) or at a design→code mode switch.

Steps:

1. **Verify the boundary.** If work is unfinished or uncommitted in a way that isn't a clean
   stopping point, say so and stop — do not produce a handoff for a half-done task.

2. **Save state, in this order:**
   - Commit if the project's commit policy calls for it and there are working changes.
   - Append a `CHANGELOG.md` entry (`- **YYYY-MM-DD** — what changed and why`); if anything is
     unfinished, end it with `NEXT: <the exact next step>`.
   - If a decision was made or reversed, make sure it's an ADR (`new-adr`), not just prose.
   - If a non-obvious gotcha surfaced, append it to `LEARNINGS.md`.

3. **Emit the handoff**, two parts:
   - A ready-to-paste **next prompt** in its own code block, self-contained for a cold session:
     what we're resuming, where state lives (paths), and the exact next step.
   - A **"Before you clear"** list in plain product-owner English — no jargon, paths, or
     commands: what to check or approve first, and any open decisions framed as product choices
     with a recommendation.

4. Then offer the `/clear`.
