# Where the original setup was weak, and what this kit does about it

Source: two headless audits of the machine this kit was extracted from, which had grown to
40+ project folders over a year of daily Claude Code use. Most projects had a CLAUDE.md and
kept the CHANGELOG convention, but PRINCIPLES and a real ADR system existed in only a handful.
The core conventions were proven; the failure mode was that every one of them depended on
remembering.

**Design rule for the rebuild: anything that depends on remembering eventually drifts.
Conventions become scripts, hooks, or generated files wherever possible.**

## Fixed in this kit

1. **Unregistered projects** (six folders escaped the hand-maintained index; the
   session-start greeting parses that file, so they were invisible). Fix: the index is now a
   build artifact. `project-index` regenerates `~/projects.md` from each project's
   ONBOARDING.md frontmatter, and unregistered folders surface in a loud "Unregistered"
   section instead of disappearing.
2. **Scaffolding was a prose checklist** that got skipped (nine projects lacked both CLAUDE.md
   and ONBOARDING.md). Fix: `new-project` creates the full structure, stamps the frontmatter,
   git-inits, and regenerates the index in one command. The scaffold rule lives in
   `~/CLAUDE.md`, not in auto-memory.
3. **ADR protocol mutated when copy-pasted** between projects (one project's decisions/ folder
   drifted into un-numbered topic files with no status mechanism), and the index table plus
   supersession required synchronized hand edits. Fix: shared template plus `new-adr`
   (auto-numbering) plus `adr-index` (table regenerated from the files themselves). A `draft`
   status exists for decisions awaiting sign-off, and the session-start hook nags about them.
4. **"Read the CHANGELOG at session start" was unenforced prose.** Fix:
   `hooks/project-status.sh` (SessionStart) prints the last 3 entries, the `NEXT:` step, draft
   ADRs, branch, and dirty-file count whenever a session starts inside a project. Zero tool
   calls to get oriented.
5. **No resume pointer.** Fix: the `NEXT:` convention in CHANGELOG entries, surfaced by the
   hook.
6. **Superseded projects lingered as Active** (one sat in the index directly above its own
   replacement, with a CLAUDE.md referencing a path that had moved; a cold session would have
   chased a dead path). Fix: `status: superseded by <slug>` in frontmatter moves the row to
   the Archived table on regeneration; `~/CLAUDE.md` requires a banner at the top of the old
   project's CLAUDE.md.
7. **CLAUDE.md and ONBOARDING duplicated facts and drifted independently** (even the
   best-kept project repeated its architecture in both). Fix: explicit file-ownership contract
   in `~/CLAUDE.md` (CLAUDE.md = rules, no facts, ~80-line budget; ONBOARDING = facts +
   frontmatter; PRINCIPLES = values) and `project-doctor` flags over-budget CLAUDE.md files.
8. **Nothing was watching for drift.** Fix: `project-doctor` reports missing scaffold files,
   changelog-older-than-last-commit, lingering draft ADRs, and fat CLAUDE.md files.
9. **Project knowledge trapped in one machine's auto-memory** (a dozen project memories had
   accumulated globally, some already stale, and none would exist on a second machine). Fix:
   memory-discipline rule in the global CLAUDE.md; project facts live in the repo.
10. **Transcripts had no system at all** (one project had a transcripts/ folder; no dating
    rule, no mining cadence). Fix: `transcripts/` in every scaffold with a dated-filename
    rule, a "transcripts are raw material, never authority" rule, and `mine-transcripts`
    (headless `claude -p` pass that drafts ADRs and changelog lines from anything newer than
    the latest ADR, proposals only).

11. **No install automation, and no anti-drift mechanism for the kit itself** (the original
    kit was 7 manual copy steps, and within a day the source machine had already diverged:
    hooks in a different folder, local-only improvements to the greeting, three output-pipeline
    scripts that never made it into the repo). Fix: `install.sh` (one command, OS-detecting,
    idempotent, additive settings.json merge) plus `sync-kit` (status/pull/push over a manifest
    of managed files; `project-doctor` runs the status check). The CLAUDE.md files carry a
    `MACHINE-SPECIFIC BELOW` marker: shared baseline above (repo-owned), per-machine rules
    below (never compared, never overwritten). Improvements flow both ways instead of forking.
12. **GNU-only constructs blocked macOS** (`sed -i` without suffix, `find -newermt`,
    `xargs -r`, `tac`). Fix: portable equivalents everywhere, plus a `claude-notify` shim
    (notify-send on Linux, osascript on macOS, no-op elsewhere) and a hyprctl guard around the
    Linux-desktop-only parts of the Stop hook.

## Decisions of record

- **No per-file index headers.** Deep docs (ADRs, PRINCIPLES, reference docs) do not get a
  "how to use this file" meta-header. A file describes itself in one frontmatter/description
  line; the indexes (`projects.md`, `decisions/README.md`) are generated from those lines.
  The reader who has opened the file does not need a summary of it, and a hand-written
  summary is a fact stated twice. Routing happens one level up: ONBOARDING's trigger-routed
  "When to read deeper" list, loaded context staying small, bulk reads delegated to subagents.

## Shipped after launch (2026-06-12, community-audit pass)

Source: a headless audit of this kit against 2025–2026 community practice (Anthropic best-
practices/memory/long-running-agents docs, the HumanLayer CLAUDE.md essay, hook-stack
writeups, the Spec Kit and beads critiques). The audit's finding: the structure is at or ahead
of practice; the real gaps were all "verification and capture," not structure. Three fixes:

- **Verify gate (`bin/claude-verify-gate`, Stop hook, per-project opt-in).** Folds in the old
  open item #1 (changelog-freshness nudge). When tracked source changed since the last green
  checkpoint, the harness runs the project's `typecheck` + `test` itself before the session
  ends — so "tests pass" is confirmed, not asserted — then nudges once for a dated CHANGELOG
  entry and a LEARNINGS capture. Debounced on the source diff; circuit-broken via
  `stop_hook_active`; exits 0 (does nothing) outside a git repo or without those npm scripts.
  Motivated by the one real false-green incident on the live app (a deploy watch looked green
  on a failed run).
- **LEARNINGS.md in the scaffold.** Operational gotchas had no home and were getting stranded
  mid-CHANGELOG or pushed into machine-local memory (wrong layer by the portability rule).
  Now an append-only repo file, surfaced at session start by `project-status.sh`, captured by
  convention + the verify gate's prompt. Decisions compound through ADRs; now mistakes compound
  through LEARNINGS.
- **`/clearpoint` skill** (old open item #4). The clear-point ritual was multi-step prose
  duplicated across CLAUDE.md files; now a command, with a one-line pointer left in `~/CLAUDE.md`.
  Frees always-loaded instruction budget so the rules that must stay (ADR citations, hard rules)
  get more adherence. (Issue-triage and the ADR protocol were deliberately KEPT inline: they
  must fire automatically on every request / architectural choice, and a non-auto skill would
  silently stop firing — the report's own caveat about unreliable skill auto-invocation.)

## Still open (worth doing once the kit is live)

1. **Automatic transcript capture**: a SessionEnd hook that files a session summary into
   `transcripts/` automatically, so mining has raw material without anyone saving notes by
   hand. Today the folder only gets what is manually dropped in.
2. **Scheduled maintenance**: weekly `project-doctor` + `mine-transcripts` run via a scheduled
   agent, filing a short report instead of waiting to be asked.
3. **ONBOARDING refresh cadence**: ONBOARDING files freeze at scaffold time (the original
   machine's best project still described itself as pre-code while running in production). A
   post-ship docs-sync habit, or running the doctor's staleness check against ONBOARDING too.
