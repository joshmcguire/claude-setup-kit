# {{NAME}} — Principles (the north star)

The short statement of what we are building and the values every choice must honor. This is the
"does this even fit?" test: read it before adding a dependency, a service, a connection, or a
deploy assumption. Keep it small; binding *decisions* live in `../decisions/`, this is the *why*
behind them.

## Mission

**One or two sentences.** What this is, who it serves, and the single most important property
it must keep (e.g. "self-hostable", "local-only", "ships weekly", "zero ops").

## Values (non-negotiable tenets)

1. **<Value name>.** What it means in practice. _First instance: <the concrete choice that
   embodies it, with ADR number once one exists>._
2. **<Value name>.** ...
3. **<Value name>.** ...

(3 to 6 values. If everything is a value, nothing is.)

## How to apply this

When a choice introduces **a connection, a service, a dependency, or a deploy assumption**, ask:

- Does it honor each value above, or trade one away for convenience?
- Is it behind a standard interface we could swap without touching app code?
- Is it the legible, lightweight option?

If a choice fails these, flag it and prefer the path that passes. If there is a genuine
trade-off, write it up as an ADR with the cost made explicit.

> **A note on tooling bias:** assistants and platform plugins tend to suggest the
> platform-native happy path by default. That guidance optimizes for the platform, not for this
> project. Treat platform-native suggestions as one option, not the default.
