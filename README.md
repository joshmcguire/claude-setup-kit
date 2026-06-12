# Claude Code setup kit

A portable, battle-tested structure for running many projects with Claude Code: one generated
project index, a standard per-project file layout (CLAUDE.md, ONBOARDING, CHANGELOG,
PRINCIPLES, ADRs, transcripts), session-start hooks that orient every session automatically,
and a drift checker that keeps every machine in sync with this repo.

Extracted from a machine running 40+ projects with Claude Code daily. The core design rule,
learned from auditing that machine: **anything that depends on remembering eventually
drifts**, so conventions here are scripts, hooks, and generated files instead of prose
checklists.

## Install

```
git clone git@github.com:joshmcguire/claude-setup-kit.git
cd claude-setup-kit
./install.sh
```

| Flag | What it adds |
|------|--------------|
| *(none)* | Core system: scripts, project template, hooks, CLAUDE.md baselines |
| `--with-research` | The `/research` command (Playwright against claude.ai; needs node+npm) |
| `--with-memory <dir>` | Imports a memory directory. Personal machines only; never on a work computer |

Idempotent: re-running never clobbers files you have edited. Works on Linux and macOS;
on Windows run it under Git Bash (see [SETUP.md](SETUP.md) for per-OS notes and the manual
fallback).

## Staying in sync

`install.sh` is for new machines; after that, **`sync-kit`** keeps machine and repo aligned:

```
sync-kit status   # what drifted (project-doctor also runs this)
sync-kit pull     # machine -> repo: you improved something locally, bring it home
sync-kit push     # repo -> machine: the kit moved ahead, update this machine
```

Both CLAUDE.md files contain a `MACHINE-SPECIFIC BELOW` marker line. Above it is the shared
baseline this repo owns; below it is per-machine content (sudo policy, local integrations,
extra skill packs) that sync-kit never compares and never overwrites. That is the whole
reconciliation model: machine-specific tweaks live below the marker and are permanently safe.

## What's in here

| Path | What it is |
|------|-----------|
| `install.sh` | One-command, OS-detecting, idempotent bootstrap |
| `SETUP.md` | Manual install steps, macOS/Windows notes, work-computer adaptations |
| `IMPROVEMENTS.md` | Audit findings the design came from: what's fixed, what's still open |
| `global-claude/CLAUDE.md` | Baseline for `~/.claude/CLAUDE.md`: style, outputs, memory discipline |
| `home/CLAUDE.md` | Baseline for `~/CLAUDE.md`: routing, context discipline, project structure, ADR protocol, git workflow |
| `templates/project/` | Project scaffold: CLAUDE.md, ONBOARDING, CHANGELOG, PRINCIPLES, decisions/, transcripts/ |
| `bin/` | `new-project`, `project-index`, `new-adr`, `adr-index`, `project-doctor`, `mine-transcripts`, `sync-kit`, output pipeline (`mirror-output`, `claude-done-notify`, `log-output`), `claude-notify` (cross-platform notification shim) |
| `hooks/` | SessionStart hooks: toolkit cheat sheet, project list greeting, where-we-left-off status |
| `research/` + `commands/` | Optional `/research` command (installed by `--with-research`) |

## The system in 30 seconds

- **One index**: `~/projects.md` lists every project. Generated from each project's
  ONBOARDING.md frontmatter, never hand-edited. Unregistered folders surface loudly.
- **One structure per project**: thin CLAUDE.md (rules only), ONBOARDING.md (facts + a
  trigger-routed "when to read deeper" list), CHANGELOG.md (dated resume points with a
  `NEXT:` pointer), docs/PRINCIPLES.md (values), decisions/ (numbered, supersedable ADRs),
  transcripts/ (dated raw notes, mined for decisions).
- **One context model**: always-loaded files stay small and route by trigger; deep files load
  on demand; bulk reading is delegated to subagents. Indexes are generated from frontmatter,
  never written by hand inside the files they describe.
- **One workflow everywhere**: hooks orient the session, architecture goes through PRINCIPLES
  then ADRs, every session appends to the CHANGELOG, and `project-doctor` reports drift —
  including drift between this repo and the machine.
