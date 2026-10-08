---
id: "0045"
title: Let Container and Text render a fixed set of semantic elements through an as prop
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, components, props, accessibility, seo]
related: ["0030", "0035"]
supersedes: []
---

# 0045. Let Container and Text render a fixed set of semantic elements through an as prop

## Context

Without a way to choose the element, every Text would render the same tag and every Container a `div`. Pages built from these components, including pages assembled in the CMS, would then lose:

- the heading structure (`h1`–`h6`) that screen readers navigate by and search engines read;
- the landmarks (`nav`, `main`, `header`, `footer`) that assistive technology uses;
- real `label` elements for form inputs.

## Decision

- **Text** takes `as`: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `span` or `label`.
- **Container** takes `as`: `div`, `section`, `article`, `header`, `footer`, `nav`, `main`, `aside`, `ul`, `ol` or `li`.
- The lists are fixed and serializable. `as` never accepts an arbitrary element or component.

## Alternatives considered

- **No `as` prop**: rejected for the accessibility and SEO reasons above. This was proposed by Claude and agreed by the user.
- **Accepting any element or component**: not chosen. It wouldn't be serializable, and it would allow elements the styling doesn't account for.

## Consequences

The lists can grow when a real need comes up, e.g. `figure` or `blockquote`.
