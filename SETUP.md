# Setup: install details and per-OS notes

The fast path is `./install.sh` (see [README.md](README.md)). This file covers what the
installer does, the manual fallback, and per-OS specifics. Easiest of all: open Claude Code
in this folder and say "read SETUP.md and install this for my machine".

## What install.sh does

1. **Dependency check**: `git`, `jq`, `awk` (jq powers the hooks and the settings merge).
   On macOS it prints the exact `brew install` line for anything missing.
2. **Scripts** → `~/.local/bin/` (overwrites; scripts are kit-owned), warns if that dir is
   not on PATH.
3. **Hooks** → `~/.claude/hooks/` (`show-toolkit.sh` is per-machine content: installed once,
   local edits never overwritten).
4. **Project template** → `~/templates/project/` (only if missing; drift is sync-kit's job).
5. **CLAUDE.md baselines** → `~/CLAUDE.md` and `~/.claude/CLAUDE.md` (only if missing; an
   existing file is never clobbered).
6. **settings.json**: backs it up, then additively merges the SessionStart / PostToolUse /
   Stop hook entries with absolute paths (skips any already wired). The reference snippet is
   `hooks/settings-hooks-snippet.json`.
7. Creates `~/projects/`, generates `~/projects.md`, and records the kit location in
   `~/.config/claude-setup-kit/path` so `sync-kit` can find the repo.
8. Optional: `--with-research` (copies `research/` + `commands/`, runs `npm install`; then
   run `node ~/.claude/research/setup-auth.js` once to log in to claude.ai),
   `--with-memory <dir>` (imports memory files; personal machines only).

After installing: fill in the machine-specific section at the bottom of `~/CLAUDE.md`
(OS/shell, sudo or admin policy, git host and CLI, anything confidential to this machine),
edit `~/.claude/hooks/show-toolkit.sh` to list this machine's commands, then create the first
project with `new-project <slug> "Name" "description"` and spend ten minutes making its
`docs/PRINCIPLES.md` real. The system only pays off if PRINCIPLES is not boilerplate.

## The two-layer CLAUDE.md model

Both CLAUDE.md files contain this marker line:

```
<!-- ===== MACHINE-SPECIFIC BELOW: sync-kit compares only above this line ===== -->
```

Above the marker: the shared baseline, owned by this repo, compared by `sync-kit status` and
updated by `sync-kit push`/`pull`. Below the marker: this machine's own rules, never touched
by sync. Improve something generic? It belongs above the marker and gets pulled into the repo
so every machine benefits. Add something local (a tray integration, a compliance rule, a
machine's GPU policy)? Below the marker, permanently safe.

## macOS notes

- Everything is plain bash + awk + git + jq; the scripts avoid GNU-only constructs
  (no `sed -i` without suffix, no `find -newermt`, no `xargs -r`, no `tac`).
- Dependencies: `brew install jq` (git ships with Xcode CLT; node only if using
  `--with-research`).
- Notifications use the `claude-notify` shim: `osascript` on macOS, `notify-send` on Linux,
  silent no-op elsewhere. No setup needed.
- Linux-desktop extras degrade gracefully: the Hyprland attention-queue part of
  `claude-done-notify` switches itself off when `hyprctl` is absent.

## Windows notes

Claude Code on Windows already requires Git for Windows, so everything runs under Git Bash:

- **Home directory**: `~` in Git Bash is `C:\Users\<you>`. All kit paths land there.
- **Run the installer from Git Bash**: `bash install.sh`.
- **Hook commands**: the installer writes absolute paths; if editing by hand use forward
  slashes, e.g. `bash C:/Users/<you>/.claude/hooks/show-projects.sh`.
- **chmod**: harmless but not required; Git Bash runs scripts via their shebang regardless.
- **Line endings**: scripts must keep LF endings. If cloned with `core.autocrlf=true`, run
  `dos2unix` on `bin/*` and `hooks/*.sh`, or re-clone with `core.autocrlf=input`.

## Work-computer adaptations (do these consciously)

- **Git host**: if it is GitHub Enterprise or GitLab, set the host and CLI (`gh`/`glab`) below
  the marker in `~/CLAUDE.md`; the issue/branch/PR workflow is host-agnostic.
- **Sudo / admin rights**: state the real policy explicitly so Claude does not assume autonomy
  it does not have.
- **Confidentiality**: add a line listing what must never go to external services (client
  names, internal URLs, credentials). Claude treats `~/CLAUDE.md` as binding.
- **Memory**: do NOT use `--with-memory` on a work machine; personal memory stays personal.
- **Commit policy**: on a repo with reviewers, set "only commit when asked" in that project's
  CLAUDE.md; for solo projects, auto-commit at working checkpoints is a fine default.

## Manual install (no installer)

Copy `bin/*` → `~/.local/bin/` (+`chmod +x`), `hooks/*.sh` → `~/.claude/hooks/` (+`chmod +x`),
`templates/project/` → `~/templates/project/`, `global-claude/CLAUDE.md` → `~/.claude/CLAUDE.md`,
`home/CLAUDE.md` → `~/CLAUDE.md`. Merge `hooks/settings-hooks-snippet.json` into
`~/.claude/settings.json`. Run `project-index` once. Write the kit's absolute path into
`~/.config/claude-setup-kit/path`.

## Maintenance habits that keep it healthy

- New project: always via `new-project`, even for experiments (mark them in the description).
- End of session: CHANGELOG entry. Decision made: ADR. New raw notes: dated file in
  `transcripts/`, then mine it.
- Weekly (or when asked for a health check): `project-doctor` — it now also reports setup-kit
  drift via `sync-kit status`.
- ONBOARDING.md is allowed to lag; CLAUDE.md, PRINCIPLES, and ADRs are not.

## Fleet doctrine (owned elsewhere — pointer only)

Fleet orchestration doctrine and tooling (ORCA.md protocol, FABLE/NARRATOR seat charters,
fleet-claim/fleet-gate/orca-lane) are OWNED by the private `joshmcguire/orca` repo — not
this kit (owner ruling 2026-08-01, orca#1: doctrine changes daily, rebuilds happen yearly;
one home per file). On a machine rebuild, after the steps above:

```bash
git clone git@github.com:joshmcguire/orca.git ~/projects/orca
bash ~/projects/orca/bin/install-symlinks.sh   # idempotent; refuses to clobber real files
```

This kit never carries copies of those files. Its `home/CLAUDE.md` snapshot references
them by path only; sync-kit handles that file's normal drift.
