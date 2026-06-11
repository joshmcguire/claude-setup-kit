# CLAUDE.md — {{NAME}}

{{DESCRIPTION}}

One paragraph: what this is, the 2-3 load-bearing architectural facts, and what the server or
client never does. If a reader gets only this paragraph, they should not break anything.

## North star

Before any architectural choice, read **`docs/PRINCIPLES.md`**: the mission and non-negotiable
values for this project. A change that violates a principle should not be proposed. Tooling and
platform-plugin suggestions ("use this cloud's managed service") are one option, not the
default; run them through the PRINCIPLES test first.

## Decisions protocol

ADRs live in `decisions/`. **Before proposing or making any architectural change, `grep
decisions/` and read the relevant files; only `status: active` records are binding.** New
decision: `~/bin/new-adr <slug>` then fill in Decision / Alternatives ruled out / Why. Changed
decision: new ADR that supersedes the old one (never rewrite history). Keep the index table in
`decisions/README.md` current.

## Tech stack

- Language/framework:
- Data:
- Deploy:
- Run locally: `<command>`

## Hard rules (active decisions; do not break without superseding the ADR)

- <rule> (ADR NNNN)
- <rule> (ADR NNNN)

## Working style

- Append to `CHANGELOG.md`: `- **YYYY-MM-DD** — what changed and why`.
- Commit policy: <auto-commit at working checkpoints | only when asked>.
- Branching: <main-only pre-deploy | branch-per-issue feat/<#>-slug, PR with Closes #, main
  always deployable>.
- Transcripts go in `transcripts/YYYY-MM-DD-topic.md`; mine them for ADR-worthy decisions.
