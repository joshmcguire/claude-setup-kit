# Claude Code setup kit

A portable, battle-tested structure for running many projects with Claude Code: one generated
project index, a standard per-project file layout (CLAUDE.md, ONBOARDING, CHANGELOG,
PRINCIPLES, ADRs, transcripts), and session-start hooks that orient every session
automatically.

Extracted from a machine running 40+ projects with Claude Code daily. The core design rule,
learned from auditing that machine: **anything that depends on remembering eventually
drifts**, so conventions here are scripts, hooks, and generated files instead of prose
checklists.

## Install

Clone or download this repo, open Claude Code in the folder, and say:

> read SETUP.md in this folder and install it for my machine

Or follow the steps in [SETUP.md](SETUP.md) by hand. Works on Linux, macOS, and Windows
(everything runs under Git Bash, which Claude Code on Windows already requires; see the
Windows notes in SETUP.md).

## What's in here

| Path | What it is |
|------|-----------|
| `SETUP.md` | Install steps, Windows notes, work-computer adaptations |
| `IMPROVEMENTS.md` | Audit findings the design came from: what's fixed, what's still open |
| `global-claude/CLAUDE.md` | Style rules for `~/.claude/CLAUDE.md` |
| `home/CLAUDE.md` | Machine-wide working rules for `~/CLAUDE.md`: routing, project structure, ADR protocol, git workflow |
| `templates/project/` | Project scaffold: CLAUDE.md, ONBOARDING, CHANGELOG, PRINCIPLES, decisions/, transcripts/ |
| `bin/` | `new-project`, `project-index`, `new-adr`, `adr-index`, `project-doctor`, `mine-transcripts` |
| `hooks/` | SessionStart hooks: project list greeting + where-we-left-off status |

## The system in 30 seconds

- **One index**: `~/projects.md` lists every project. Generated from each project's
  ONBOARDING.md frontmatter, never hand-edited. Unregistered folders surface loudly.
- **One structure per project**: thin CLAUDE.md (rules only), ONBOARDING.md (facts),
  CHANGELOG.md (dated resume points with a `NEXT:` pointer), docs/PRINCIPLES.md (values),
  decisions/ (numbered, supersedable ADRs), transcripts/ (dated raw notes, mined for
  decisions).
- **One workflow everywhere**: hooks orient the session, architecture goes through PRINCIPLES
  then ADRs, every session appends to the CHANGELOG, and `project-doctor` reports drift.
