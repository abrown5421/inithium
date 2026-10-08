---
id: "0053"
title: View the manual in a development docs app with live examples
status: accepted
date: "2026-10-08"
scope: core
tags: [docs, ui, local-development]
related: ["0017", "0018", "0052"]
supersedes: ["0051"]
---

# 0053. View the manual in a development docs app with live examples

## Context

The manual ([0052](0052-keep-a-self-documenting-developer-manual.md)) should be readable as a site: a sidebar of sections, pages rendered from the Markdown, and live component examples with the code that produced them, like MUI's documentation. The development UI gallery at `/ui` ([0051](0051-browser-test-ui-in-a-development-gallery.md)) showed live demos but no code, and its demos were a second copy of the documented examples. The manual and the viewer must never reach client repos.

## Decision

- **A docs app, `apps/docs`**, is a third frontend in the core Nx workspace, so it reuses core's UI libs, Tailwind setup, lint and build. It runs locally only, for now.
- **It never reaches clients.** Client clones and upstream merges leave out `apps/docs`; this is a requirement on the clone tooling ([0018](0018-install-eject-tooling-for-client-repos.md)) and the upstream mechanism ([0017](0017-upstream-mechanism.md)). The sandbox keeps it.
- **It reads the manual** from the Inithium repo's `docs/` folder. The sidebar comes from the folders, `title` and `order`.
- **It renders Markdown with the UI library's own components** (Text, Container, Icon), plus a few viewer-only components for tables and code blocks.
- **First-version features:**
  - syntax-highlighted code blocks with a copy button, and long code collapsed behind "Expand code";
  - search across the manual;
  - previous/next links;
  - an edit link on every page, which opens the file in VS Code.
- **Links to decision records** also open the file in VS Code.
- **Live examples are real files:** `core/apps/docs/src/examples/<section>/<name>.example.tsx`. They're linted, type-checked and built with the app. A page embeds one by path; the app renders it live with its exact source code beneath. Per-prop usage snippets stay as ordinary code blocks.
- **The `/ui` gallery is retired** once the docs app exists. Its demos become examples.

## Alternatives considered

- **A standalone app next to the Markdown, outside core**: rejected. It would have to reach into core for the UI libs, React and Tailwind, with separate and fragile tooling.
- **A route in `web`, hidden by an environment variable**: rejected. The route code would ship in every client repo, and the Markdown it reads doesn't exist there.
- **Examples as code blocks compiled in the browser**: rejected. They wouldn't be type-checked by the build, and the viewer would need a runtime compiler.
- **Deploying the docs now**: deferred. It will be deployed with the official Inithium demo site later.

## Consequences

- The clone tooling and the upstream mechanism must exclude `apps/docs` when they're built.
- Writing a component's docs includes writing its example files.
- The app is built in its own branch; until then, the gallery stays at `/ui`.
- 0051 is superseded; its rule that each component adds a gallery page becomes "each component adds its examples".
