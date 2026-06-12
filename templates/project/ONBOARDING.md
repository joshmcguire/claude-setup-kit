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

## When to read deeper (trigger → file)

This file plus CLAUDE.md is the working altitude. Pull a deep file only when its trigger
matches the task; do not read them all "to be safe".

- Any architectural choice → `docs/PRINCIPLES.md`, then grep `decisions/` for relevant ADRs
- Touching <subsystem, e.g. auth> → `decisions/NNNN-<slug>.md`
- Touching <subsystem, e.g. data model> → `decisions/NNNN-<slug>.md`
- <task type, e.g. deploying> → `docs/<deep doc>.md`

## How to run

```
<commands>
```
