# Transcripts

Dated raw material: voice notes, meeting transcripts, design discussions, brainstorms.

## Rules

- **Filename: `YYYY-MM-DD-topic.md`.** The date prefix is mandatory; decision mining uses it to
  find transcripts newer than the latest ADR.
- Drop content in verbatim. Do not clean it up; cleaning destroys evidence of what was actually
  said and decided.
- **Transcripts are raw material, never authority.** If a transcript contradicts an active ADR,
  the conflict gets surfaced and resolved with a superseding ADR, not silently followed.

## Decision mining

Whenever a transcript is read or added, check it for decisions that should be promoted:

- Architectural choices, ruled-out alternatives, "let's never do X again" → new ADR in
  `../decisions/`.
- Completed work or direction changes → `../CHANGELOG.md` entry.
- New non-negotiable values → propose an edit to `../docs/PRINCIPLES.md` (ask first).

Batch mode: `~/bin/mine-transcripts <project>` scans everything newer than the latest ADR and
proposes promotions.
