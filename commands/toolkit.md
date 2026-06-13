Show the user a clean, organized list of all available custom skills and slash commands. Print this exactly:

```
CUSTOM COMMANDS
  /research <query>     — Web research via Claude.ai (Opus, up-to-date knowledge)
  /clearpoint           — Run the clear-point ritual (save state + handoff at a boundary)
  /toolkit              — This list

GSTACK SKILLS
  Planning & Strategy
    /office-hours           — Describe what you're building, get structured guidance
    /plan-ceo-review        — CEO-level product review of a feature idea
    /plan-eng-review        — Engineering architecture review
    /plan-design-review     — Design-focused plan review
    /autoplan               — Auto-generate an implementation plan

  Design
    /design-consultation    — Get design feedback and suggestions
    /design-shotgun         — Rapid-fire design critique
    /design-html            — Generate HTML design mockups
    /design-review          — Review visual design quality

  Code Review & QA
    /review                 — Code review on current branch
    /qa                     — Full QA with real browser (Playwright)
    /qa-only                — QA without review
    /benchmark              — Performance benchmarking
    /cso                    — Security audit (OWASP + STRIDE)
    /investigate            — Deep-dive debugging

  Shipping
    /ship                   — Create and manage PRs
    /land-and-deploy        — Merge and deploy
    /canary                 — Canary deployment check
    /document-release       — Generate release notes

  Browser & Setup
    /browse                 — Web browsing (use this for all web access)
    /connect-chrome         — Connect to running Chrome instance
    /setup-browser-cookies  — Save browser auth for QA
    /setup-deploy           — Configure deployment

  Workflow
    /careful                — Extra caution mode
    /freeze                 — Lock changes (prevent edits)
    /unfreeze               — Unlock changes
    /guard                  — Safety guardrails
    /retro                  — Retrospective on recent work
    /learn                  — Teach Claude about your codebase
    /codex                  — Codex-compatible mode
    /gstack-upgrade         — Update gstack
```

Do not add anything else. Just print the list above.
