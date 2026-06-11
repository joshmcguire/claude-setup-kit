# Architecture Decision Records

Each file records one architectural decision. **Before proposing an architectural change, grep
this folder and only treat files with `status: active` as binding.** Superseded files are kept
for history but do not constrain new work.

## Protocol

- **Filename:** `NNNN-slug.md` (zero-padded, monotonically increasing). Use `~/bin/new-adr <slug>`.
- **Header (frontmatter):**
  ```yaml
  ---
  status: active            # or: superseded by NNNN
  date: YYYY-MM-DD
  ---
  ```
- **Body sections:** `# NNNN — Title`, **Decision**, **Alternatives ruled out**, **Why**.
- **New decision:** create the next `NNNN-slug.md` with `status: active`.
- **Changed decision:** create a *new* file that supersedes the old one, and edit the old
  file's header to `status: superseded by NNNN` (add a one-line pointer at the top of its body).
- Keep the index below current.

## Index

| # | Decision | Status |
|---|---|---|
