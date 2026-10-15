---
id: "0112"
title: Give Text typography props whose font family can be a theme role or a library family
status: accepted
date: "2026-10-15"
scope: core
tags: [ui, components, props, typography, fonts]
related: ["0030", "0042", "0046", "0111", "0113"]
supersedes: ["0044"]
---

# 0112. Give Text typography props whose font family can be a theme role or a library family

## Context

[0044](0044-text-typography-props.md) gave Text its typography props and limited font family to `display` or `body`, the theme's two families. Clients can now upload more families into a font library ([0111](0111-keep-uploaded-font-families-in-a-library.md)), and the page builder lets them choose any of them ([0113](0113-choose-typography-in-the-page-builder-per-block-and-per-word.md)), so Text must be able to draw them.

## Decision

Text supports:

- **font size**: pixels;
- **font weight**;
- **text alignment**;
- **line height**: a unitless ratio;
- **letter spacing**: pixels;
- **truncation**;
- **font family**: a theme role, `display` or `body`, or a **library family**, written `{ familyId }`.

Units follow [0042](0042-size-and-space-in-pixel-numbers.md).

- The font family value is a serializable schema in `@inithium/shared-contracts`, so the api validates stored choices with it.
- A role resolves to `--font-display` / `--font-body`; a family resolves to its internal name (`Inithium Font <familyId>`) with its fallback type.
- A family that no longer exists draws as `body`.
- Prefer the roles: content set to a role follows a re-brand, while a family reference stays on that family.

## Alternatives considered

None recorded.

## Consequences

- `fontFamilySchema` becomes the roles plus `{ familyId }`, and the style-prop resolver needs the families' names to resolve one, so the apps load the library with settings.
- Everything 0044 settled about the other props is unchanged.
