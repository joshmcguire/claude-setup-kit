---
name: {{NAME}}
description: {{DESCRIPTION}}
status: active
---

# {{NAME}} — Onboarding

> Orientation only. If this contradicts CLAUDE.md, PRINCIPLES, or an ADR, trust those; this
> file may lag. The frontmatter above is the source of truth for the project index
> (`project-index` regenerates ~/projects.md from it), so keep name/description/status current.
> When this project is superseded, set `status: superseded by <slug>` here.

## What it is

{{DESCRIPTION}}

Two or three sentences of context: why it exists, who it is for, current phase.

## Tech stack

- <framework / language / hosting>

## Architecture (the load-bearing ideas)

- <idea> (ADR NNNN)
- <idea> (ADR NNNN)

## Key files

- `docs/PRINCIPLES.md` — north star; read before architectural choices.
- `decisions/` — the architecture of record; grep before proposing changes.
- `CLAUDE.md` — working rules + hard rules.
- <project-specific reference docs>

## How to run

```
<commands>
```
