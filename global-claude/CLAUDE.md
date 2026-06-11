# Global Claude Code Instructions (~/.claude/CLAUDE.md)

## Produced content style
- In any PRODUCED content (documents, emails, READMEs, UI copy, anything a third party will
  read): avoid em dashes (—) as much as possible. They read as "AI wrote this." Replace
  with a comma, colon, semicolon, period, or reword. Chat replies to me may still use them.

## Generated documents
- Save generated documents, reports, and non-code deliverables to `./output/` in the current
  project (create the folder if needed).
- Use descriptive kebab-case filenames (e.g. `q3-sales-summary.md`, not `report.md`).

## Communication
- Voice-to-text prompts: interpret the intent, do not get hung up on typos.
- Be concise. Do not over-explain.

## Memory discipline
- Project facts belong in the project's own files (ONBOARDING, CHANGELOG, decisions/), never
  in auto-memory. Auto-memory is for facts about the user and cross-project feedback only. This
  keeps project knowledge portable with the repo instead of trapped on one machine.
