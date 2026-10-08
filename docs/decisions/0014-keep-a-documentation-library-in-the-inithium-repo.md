---
id: "0014"
title: Keep a running documentation library in the Inithium repo
status: superseded
date: "2026-10-07"
scope: ecosystem
tags: [documentation, process]
related: ["0001"]
supersedes: []
supersededBy: "0052"
---

# 0014. Keep a running documentation library in the Inithium repo

## Context

Inithium will eventually have a marketing website that includes public documentation for core and plugins, for developers building their own implementations. Until then, the project owner is the main reader. Decisions and usage need to be captured as they happen, in a form a docs UI can render later without rewriting.

## Decision

- Documentation lives in `docs/` at the root of the Inithium repo and never ships to client repos. Plugin documentation is colocated in `plugins/plugin-<name>/docs/` and is never copied into a client on install.
- It has three kinds of document: decision records (`decisions/`), task-oriented guides (`guides/`) and look-up reference pages (`reference/`). Each is Markdown with YAML frontmatter validated by Zod schemas in `docs/tooling/docs.schema.mjs`.
- Decision records are append-only. A changed decision is a new record that supersedes the old one. Open questions are recorded as `proposed` decisions.
- `docs/` is a standalone npm package, like `sandbox/`, so core stays free of docs tooling. `npm run check` is part of verification.
- When and how docs are written is defined in the Documentation protocol section of [CLAUDE.md](../../CLAUDE.md#9-documentation-protocol).

## Alternatives considered

- **An Nx project inside core**: rejected. It would ship to every client and would have to reach outside core into `docs/` and `plugins/`.
- **Choosing a docs site generator now**: deferred until the marketing site is built. Plain Markdown with frontmatter can be read by most generators, so the choice doesn't affect how docs are written today.

## Consequences

- Each task that makes a decision or changes developer-facing behaviour updates the docs in the same commit.
- CLAUDE.md remains the rulebook for working in the repo. The docs hold the reasoning and the developer-facing explanation.
- Client-facing CMS documentation is out of scope and will be written per client.
