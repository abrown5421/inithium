---
id: "0069"
title: Pick colours from theme and Tailwind swatches and an intensity slider, in a panel under an Input
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, composites, forms, colour, accessibility]
related: ["0055", "0056", "0062", "0067", "0068"]
supersedes: []
---

# 0069. Pick colours from theme and Tailwind swatches and an intensity slider, in a panel under an Input

## Context

The web app needs end users to choose colours (e.g. an avatar background), and the CMS's page editor will need it for page colours ([0067](0067-colour-values-with-the-full-palette-in-cms-controls.md)). A picked colour should be a colour value that any colour prop accepts. Tabs exist ([0068](0068-switch-panels-with-tabs-built-from-data.md)).

## Decision

- **The field is an Input** ([0055](0055-build-input-as-a-native-field-with-a-floating-label.md)), read-only, showing the colour's English name ("Emerald 500") and a 20px swatch as its end adornment (dashed and empty when nothing is chosen). It takes Input's variants, label, placeholder, helper text, error, required, disabled and spacing.
- **The panel** is a `@radix-ui/react-popover` ([0056](0056-use-radix-primitives-for-interactive-widgets.md)) anchored to the field (Radix's trigger isn't used, since it would turn the Input into a button): 4px below, as wide as the field, z-index 50, closing on an outside click or Escape and returning focus to the field. Picking doesn't close it.
- **Swatches:** two tabs (Theme: the six tokens; More colours: Tailwind's 26), or the theme tokens alone with `palette="theme"`. Six to a row, each showing its colour at the current intensity, with a ring in `color` around the chosen one and its name in a tooltip. Each grid is a Radix radio group (arrow keys pick).
- **Intensity:** a Slider over the eleven steps (50 to 950), with a tick at each.
- **Value:** `{ color, intensity }`, a colour value; `value` / `defaultValue` / `onValueChange`. Picking keeps the intensity; the slider keeps the colour. `name` submits `color-intensity` in forms. Theme colours stay references ([0067](0067-colour-values-with-the-full-palette-in-cms-controls.md)).
- **Errors** hide when a colour is picked, since the read-only field is never typed in.
- **Stored props:** the field's style props, `label`, `placeholder`, `helperText`, `required`, `palette` and `animation`.

## Alternatives considered

- **Hex or free-form colours:** not offered; only the palette, so choices follow the theme and stay consistent.
- **Closing on pick:** the panel stays open so the intensity can be adjusted.
- **Opacity and `transparent`:** left for later.

## Consequences

- `PickedColor` values can be passed straight to `bgColor`, `textColor` and the other colour props.
