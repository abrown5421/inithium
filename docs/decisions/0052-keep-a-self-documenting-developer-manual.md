---
id: "0052"
title: Keep a self-documenting developer manual in docs/, organised by section, with coverage enforced
status: accepted
date: "2026-10-08"
scope: ecosystem
tags: [docs, process, ui]
related: ["0001", "0030", "0035", "0053"]
supersedes: ["0014", "0049"]
---

# 0052. Keep a self-documenting developer manual in docs/, organised by section, with coverage enforced

## Context

Inithium needs a front-to-back manual for using it, written as it is built. [0014](0014-keep-a-documentation-library-in-the-inithium-repo.md) created the documentation library with three kinds of document (decisions, guides, reference), and [0049](0049-document-every-ui-component-on-its-own-page.md) gave every UI component its own page under `reference/ui/`. The goal is now a manual organised the way a reader navigates it (like MUI's documentation), viewed in a docs app ([0053](0053-view-the-manual-in-a-docs-app.md)), and kept complete as part of every change rather than as an afterthought.

## Decision

**Where it lives**

- The manual is Markdown with YAML frontmatter in `docs/` at the root of the Inithium repo, validated by the Zod schemas in `docs/tooling/docs.schema.mjs`. `docs/` stays a standalone npm package; `npm run check` is part of verification.
- It never reaches client repos. Plugin documentation lives in `plugins/plugin-<name>/docs/` with the same layout, and is never copied into a client on install. (Both unchanged from 0014.)

**How it's organised**

- Decision records stay in `docs/decisions/` (flat, append-only, superseded rather than rewritten, open questions as `proposed`; unchanged from 0014). They are read as files, not shown in the docs app.
- Every other folder is a **section** of the manual. Sub-folders are sub-sections. The sections are:

  | Section | Folder |
  | --- | --- |
  | Getting started | `getting-started/` |
  | Architecture | `architecture/` |
  | Backend | `backend/` |
  | UI library: Overview, Style props, then Theme, Animations, Components, Composites, Layouts | `ui-library/` (sub-folders `theme/`, `animations/`, `components/`, `composites/`, `layouts/`) |
  | Plugins | `plugins/` |
  | Reference | `reference/` |

- Every section folder has an `index.md`: its sidebar label and landing page. Every page has a frontmatter `order` that is unique among its siblings. The sidebar is built from folders plus `title` and `order`, so adding a page puts it in the navigation.

**What gets documented**

- **Everything.** Every feature, app, lib, route, env var, command, convention and UI component is documented, in the same commit as the change.
- **UI components, composites and layouts** each get a page at `ui-library/<layer>s/<kebab-name>.md` from `docs/templates/component.md` (carried over from 0049):
  - a Props-at-a-glance table;
  - one subsection per prop with its type, default and a usage snippet;
  - titled examples;
  - accessibility notes.

  Shared shapes are defined once on `ui-library/style-props.md` and linked.
- **The docs check enforces what it can detect:**
  - the section structure (index pages, unique orders, no loose pages);
  - a page for every exported UI component;
  - and, as the enforcement is extended, every lib, every env var in `envSchema`, and every embedded example.
- **Missing pages are backfilled** from what is already decided or built, never invented.

## Alternatives considered

- **Keeping the guides/reference split from 0014**: replaced. Readers navigate by area (backend, UI library), not by document type.
- **An explicit navigation file**: rejected in favour of folders plus frontmatter, so a new page can't be left out of the sidebar.
- **Showing decision records in the docs app**: not chosen; they stay Markdown files.
- **Documenting by protocol only, without extending the check**: rejected in favour of enforcing everything that can be detected.
- **Filling missing sections only when each area is next touched**: rejected in favour of backfilling now.

## Consequences

- A change isn't done until the manual describes it. CLAUDE.md's documentation protocol makes this part of the working protocol.
- CLAUDE.md remains the rulebook for working in the repo; the manual is the developer-facing explanation, and decision records hold the reasoning.
- Client-facing CMS documentation remains out of scope; it is written per client.
