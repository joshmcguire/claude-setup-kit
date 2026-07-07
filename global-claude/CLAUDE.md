# Global Claude Code Instructions (~/.claude/CLAUDE.md)

## Produced content style
- In any PRODUCED content (documents, books, emails, READMEs, UI copy, anything a reader
  other than me sees): avoid em dashes (—) as much as possible. They read as "AI wrote this."
  Replace with a comma (soft pause), colon (introduce/expand), semicolon (linked clauses),
  period (hard break), or reword the sentence. Chat replies to me may still use them.

## Generated documents
- Save generated documents, reports, and non-code deliverables to `./output/` in the current
  project (create the folder if needed).
- Use descriptive kebab-case filenames (e.g. `q3-sales-summary.md`, not `report.md`).
- Files saved via the Write/Edit tools are auto-mirrored to `~/claude-outputs/` by the
  `mirror-output` PostToolUse hook; no action needed.
- That hook cannot see deliverables produced by Bash commands (a PDF assembled by a script, a
  rendered image, a build artifact). Run `log-output <file...>` on those right after creating
  them so they reach `~/claude-outputs/` too.

## Communication
- Voice-to-text prompts: interpret the intent, do not get hung up on typos.
- Be concise. Do not over-explain.
- When drafting any message a human will receive (client email, internal email,
  Slack/Teams, meeting notes), read `~/.claude/messages.md` first and follow it.

## Presenting options and decisions (executive altitude)
- Josh is a senior technical PM: default altitude is C-suite; he goes deep only when he asks.
  This governs decision points, not routine technical progress reporting.
- When presenting options (architecture, tooling, hosting, approaches), write a decision memo:
  each option in 1-3 plain-English sentences of outcomes (cost, speed to ship, risk, lock-in,
  maintenance burden). Decision-relevant trade-offs stay in the summary; minor mechanics go
  behind one line: "technical detail available if you want it."
- First use of a technical term gets a short plain-English gloss in parentheses; after that
  the term is fine. Compress color commentary, never trade-offs that change the decision.
- End with a recommendation and the single strongest reason, tied to the project's principles
  when it has them.
- Litmus: could a sharp CEO decide from the text alone? If not, add the one missing sentence.
- Same plain-English, outcome-first style for AskUserQuestion labels and "Before you clear"
  blocks — but keep those brief; never inflate a simple question into a memo.

## Memory discipline
- Project facts belong in the project's own files (ONBOARDING, CHANGELOG, decisions/), never
  in auto-memory. Auto-memory is for facts about the user and cross-project feedback only. This
  keeps project knowledge portable with the repo instead of trapped on one machine.

<!-- ===== MACHINE-SPECIFIC BELOW: sync-kit compares only above this line ===== -->

## Machine-specific

<!-- Owned by THIS machine; sync-kit never touches it. Local trays, viewers, or integrations
that consume ~/claude-outputs/ or ~/.cache/claude-writes.tsv go here. -->
