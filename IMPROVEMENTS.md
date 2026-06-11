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

## Still open (worth doing once the kit is live)

1. **Changelog freshness nudge as a Stop hook**: if project files changed today and no entry
   is dated today, print a one-line stub to fill in. Nudge, never block. (The doctor catches
   it weekly; a hook catches it in the moment.)
2. **Automatic transcript capture**: a SessionEnd hook that files a session summary into
   `transcripts/` automatically, so mining has raw material without anyone saving notes by
   hand. Today the folder only gets what is manually dropped in.
3. **Scheduled maintenance**: weekly `project-doctor` + `mine-transcripts` run via a scheduled
   agent, filing a short report instead of waiting to be asked.
4. **`/clearpoint` as a skill**: the clear-point ritual (save state, changelog, next-prompt
   block, plain-English checklist) is multi-step prose in two CLAUDE.md files; a skill would
   run it deterministically.
5. **Dotfiles repo for the portable core**: version `~/CLAUDE.md`, `~/.claude/CLAUDE.md`,
   templates, bin, and hooks in a git repo every machine pulls, so improvements flow both
   ways instead of forking. This kit folder is the seed for exactly that; making it a repo is
   step one on a new machine.
6. **ONBOARDING refresh cadence**: ONBOARDING files freeze at scaffold time (the original
   machine's best project still described itself as pre-code while running in production). A
   post-ship docs-sync habit, or running the doctor's staleness check against ONBOARDING too.
