---
id: "0049"
title: Document every UI component, composite and layout on its own reference page, enforced by the docs check
status: accepted
date: "2026-10-08"
scope: core
tags: [docs, ui, components]
related: ["0014", "0030", "0035"]
supersedes: []
---

# 0049. Document every UI component, composite and layout on its own reference page, enforced by the docs check

## Context

Component documentation is the most important part of the docs. The documentation library ([0014](0014-keep-a-documentation-library-in-the-inithium-repo.md)) will become a docs site with sections and subsections covering every part of the repo, and it has to be kept up to date as the code changes. Until now, the UI library was covered by a single reference page that summarised Container and Text.

## Decision

- Every component, composite and layout gets its **own page** at `docs/reference/ui/<layer>s/<kebab-name>.md` (e.g. `reference/ui/components/container.md`), started from `docs/templates/component.md`.
- Each page lists **every prop** the component accepts, including the shared ones, with type, default and accepted values. Shared shapes (colour value, sides, size, radius, variant keys) are defined once on `reference/ui/style-props.md` and linked. Pages also show styling examples and cover accessibility.
- Pages carry a `component` frontmatter block (`name`, `layer`, `import`, optional `element`) so a docs site can index components without parsing prose.
- **The docs check enforces it.** It reads what the UI libs export and fails when:
  - a component has no page;
  - a page sits at the wrong path;
  - a page's metadata doesn't match the export;
  - a page documents something that isn't exported.

  Providers (e.g. `UiProvider`) are app-level setup and are documented on the UI overview instead.
- The UI reference is its own section, `docs/reference/ui/`: overview, theme, style props, animation, `components/`, and later `composites/` and `layouts/`. Other reference pages will be organised into sections in a separate pass.
- A component's page is written or updated in the same commit as the component.

## Alternatives considered

- **Repeating every shared shape in full on every page**: rejected. The same text would be maintained in many places.
- **Documenting only each component's own props and linking to the shared ones**: rejected. Each page should show everything a component accepts.
- **Identifying component pages by folder and tags only**: rejected in favour of structured metadata for the future docs site.
- **Requiring pages by protocol alone, without a check**: rejected. Docs could fall behind silently.
- **Reorganising every reference page into sections now**: deferred to a separate pass.

## Consequences

- A component can't be merged without its page: `npm run check` in `docs/` fails.
- Adding a prop to a component means updating its page, and `style-props.md` if the shape is shared.
- The docs check reads `core/libs/shared/ui-*/src/index.ts`, so it assumes the Inithium repo layout.
