# Claude Code setup kit: project system bootstrap

A portable, battle-tested structure for running many projects with Claude Code: one generated
index, a standard per-project file layout, ADRs for decisions, and hooks that orient every
session automatically. Copy this folder to your machine and follow the steps, or just tell
Claude Code: "read SETUP.md in this folder and install it for me".

## What the system is (30 seconds)

- **One index**: `~/projects.md` lists every project (name, path, one-liner, onboarding link).
  Claude reads it to route any request to the right folder. Registration is mandatory.
- **One structure per project**: thin `CLAUDE.md` (how we work here), `ONBOARDING.md`
  (orientation), `CHANGELOG.md` (dated resume points), `docs/PRINCIPLES.md` (north-star values
  every choice is tested against), `decisions/` (numbered ADRs, the architecture of record),
  `transcripts/` (dated raw notes, mined for decisions).
- **One workflow everywhere**: session start reads CLAUDE.md + CHANGELOG; architecture goes
  through PRINCIPLES then ADRs; work goes branch-per-issue with auto-filed issues and
  `Closes #` PRs once a project is deployed; every session appends to the CHANGELOG; clear
  points come with a pasteable next prompt.

The machine-wide rules live in `home/CLAUDE.md`. Project facts live only in project folders.
That separation is the whole trick: the global file stays small and stable, projects stay
self-describing, and nothing has to be loaded into context until it is needed.

## Design rule (learned the hard way)

Anything that depends on remembering eventually drifts. So in this kit the project index and
ADR index tables are **generated, never hand-edited**, scaffolding and registration are **one
command**, and session orientation is a **hook**, not a "please read X" rule. See
`IMPROVEMENTS.md` for the audit findings this came from.

## Install steps

1. **Global style rules**: copy `global-claude/CLAUDE.md` to `~/.claude/CLAUDE.md`. Adjust the
   style rules to taste; they are examples of the kind of thing that belongs there.
2. **Machine rules**: copy `home/CLAUDE.md` to `~/CLAUDE.md`. Then fill in the
   "Machine-specific notes" section at the bottom (sudo/admin policy, git host and CLI,
   anything that must not leave the machine). This matters most on a work computer.
3. **Templates**: copy `templates/project/` to `~/templates/project/`.
4. **Scripts**: copy `bin/` to `~/bin/` (ensure `~/bin` is on PATH) and `chmod +x ~/bin/*`.
   - `new-project <slug> "Name" "description"`: scaffolds a project from the template,
     git-inits, and registers it in the index. One command = fully in the system.
   - `project-index`: regenerates `~/projects.md` from each project's ONBOARDING.md
     frontmatter. The index is a build artifact; unregistered folders show up loudly.
   - `new-adr <slug>`: creates the next-numbered ADR in the current project.
   - `adr-index`: regenerates the decisions/README.md table from the ADR files.
   - `project-doctor`: drift report (missing files, stale changelogs, draft ADRs, fat
     CLAUDE.md files).
   - `mine-transcripts <project>`: headless `claude -p` pass over transcripts newer than the
     latest ADR; writes a proposals report (conflicts, draft ADRs, changelog lines).
5. **Hooks**: copy `hooks/*.sh` to `~/.claude/hooks/` (`chmod +x`), then merge
   `hooks/settings-hooks-snippet.json` into `~/.claude/settings.json`.
   - `show-projects.sh` (SessionStart): greets every session with the live project list.
   - `project-status.sh` (SessionStart): when a session starts inside a project, prints the
     last 3 CHANGELOG entries, the `NEXT:` step, draft ADRs, branch, and dirty-file count.
6. **Index**: run `project-index` once to create `~/projects.md` (it will be empty until the
   first project exists).
7. **First project**: run `new-project`, then spend ten minutes filling in `docs/PRINCIPLES.md`
   (mission + 3-6 non-negotiable values) and the Hard rules section of its `CLAUDE.md`. The
   system only pays off if PRINCIPLES is real, not boilerplate.

## Windows notes

Everything in this kit is plain bash + awk + git, and Claude Code on Windows already requires
Git for Windows, so the scripts and hooks run unchanged under Git Bash. Specifics:

- **Home directory**: `~` in Git Bash is `C:\Users\<you>`. All paths in the kit (`~/projects/`,
  `~/projects.md`, `~/templates/`, `~/bin/`, `~/.claude/`) land there.
- **PATH**: Git Bash automatically adds `~/bin` to PATH if the folder exists; create it, copy
  the scripts in, and start a new session.
- **chmod**: harmless but not required on Windows; Git Bash runs the scripts via their
  shebang line regardless.
- **Hook commands**: in `settings.json`, use an absolute path with forward slashes so the
  command works no matter which shell invokes it, e.g.
  `bash C:/Users/<you>/.claude/hooks/show-projects.sh`. (On macOS/Linux the
  `bash ~/.claude/hooks/...` form in the snippet is fine as-is.)
- **Line endings**: the scripts must keep LF endings. If you cloned this kit through git with
  `core.autocrlf=true`, run `dos2unix` on `bin/*` and `hooks/*.sh`, or re-copy the files.
- Easiest path: tell Claude Code "read SETUP.md and install this for my machine" and let it
  handle the path substitutions.

## Work-computer adaptations (do these consciously)

- **Git host**: if it is GitHub Enterprise or GitLab, set the host and CLI (`gh`/`glab`) in
  `~/CLAUDE.md` Machine-specific notes; the issue/branch/PR workflow is host-agnostic.
- **Sudo / admin rights**: state the real policy explicitly in Machine-specific notes so
  Claude does not assume autonomy it does not have.
- **Confidentiality**: add a line listing what must never go to external services (client
  names, internal URLs, credentials). Claude treats `~/CLAUDE.md` as binding.
- **Commit policy**: on a repo with reviewers, set "only commit when asked" in that project's
  CLAUDE.md; for solo projects, auto-commit at working checkpoints is a fine default.

## Maintenance habits that keep it healthy

- New project: always via `new-project`, even for experiments (mark them in the description).
- End of session: CHANGELOG entry. Decision made: ADR. New raw notes: dated file in
  `transcripts/`, then mine it.
- ONBOARDING.md is allowed to lag; CLAUDE.md, PRINCIPLES, and ADRs are not.
- See `IMPROVEMENTS.md` for the known weaknesses of the original setup and what this kit
  already fixes vs what is still open.
