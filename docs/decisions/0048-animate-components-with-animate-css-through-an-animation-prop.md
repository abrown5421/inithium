---
id: "0048"
title: Animate components with animate.css through a shared animation prop and a show trigger
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, props, animation, accessibility]
related: ["0030", "0035", "0036", "0042", "0047"]
supersedes: []
---

# 0048. Animate components with animate.css through a shared animation prop and a show trigger

## Context

Components need entrance and exit animations, shared across the library like the colour and spacing props. The main use is the page shell, which will cross-animate between pages: when a link is clicked, the current page animates out, and only after that animation finishes does the new page animate in. Composites such as modals and drawers will need the same behaviour. The animation library is [animate.css](https://animate.style/) (v4.1.1): its animations are CSS classes, `animate__animated` plus a name such as `animate__fadeInUp`. Timing comes from the CSS variables `--animate-duration` (default 1s) and `--animate-delay`, and from utility classes:

- speeds: `faster` 500ms, `fast` 800ms, `slow` 2s, `slower` 3s;
- delays: `1s` to `5s`;
- repeats: `1`–`3` or `infinite`.

This decision designs the prop; the page shell itself is built later.

## Decision

**Every UI component accepts:**

```tsx
<Container
  animation={{
    entrance:  { name: 'fadeInUp', speed: 'fast', delay: 150, when: 'mount' },
    exit:      { name: 'fadeOutDown', speed: 'faster' },
    attention: { name: 'shakeX', speed: 'fast', repeat: 1 },
  }}
  show={isOpen}            // runtime trigger; defaults to true
  replay={errorCount}      // runtime; replays the attention animation when it changes
  onEntranceEnd={…}        // runtime callbacks
  onExitEnd={…}
/>

<Container stagger={100}>…</Container>  // parent: cascades its direct children's entrances
```

**The animation object** is serializable and defined in `@inithium/shared-contracts`, like the style props ([0035](0035-define-style-props-as-serializable-zod-schemas.md)). Entrance, exit and attention each have their own name and timing:

| Field | Values |
| --- | --- |
| `name` | An animate.css animation of the matching kind: entrances (`fadeInUp`, `zoomIn`, `jackInTheBox`, `rollIn`, …) for `entrance`; exits (`fadeOutDown`, `hinge`, `rollOut`, …) for `exit`; attention seekers (`bounce`, `pulse`, `shakeX`, `heartBeat`, `flip`, …) for `attention` |
| `speed` | `'faster'`, `'fast'`, `'slow'`, `'slower'`, or a duration in ms. Default: animate.css's 1s |
| `delay` | `'1s'`–`'5s'`, or a delay in ms. Default: none |
| `repeat` | `attention` only: `1`, `2`, `3` or `'infinite'` |
| `when` | `entrance` only: `'mount'` (default), or `'inView'` to enter the first time about 20% of the element scrolls into view |

Millisecond values are accepted because the library's whole-second delays are too coarse for page transitions. Timing is applied by setting `--animate-duration` and `--animate-delay` on the element.

**`show` lifecycle**

- `show` defaults to `true`.
- When it becomes `true`, the element mounts and plays its entrance. This includes the first render: entrances play on mount.
- When it becomes `false`, the element plays its exit, `onExitEnd` fires, and then the element is **unmounted**.
- If `show` changes while an animation is running, the running animation **finishes first**. The element then follows `show`'s current value, doing nothing if it ended where it started.
- With `when: 'inView'`, the entrance plays the first time the element scrolls into view (once only), and only while `show` is true.

**Attention seekers** play after the entrance finishes (or on mount if there's no entrance), for their `repeat` count or forever with `'infinite'`. They play again whenever the `replay` value changes, e.g. a counter bumped on each validation error.

**Stagger** is a parent prop: `stagger={ms}` adds index × ms to each direct child's entrance delay so children cascade in. It applies to entrances only; exits leave together.

**Not a style prop.** `animation` takes no breakpoint or state keys ([0036](0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md) doesn't apply). It isn't resolved by the style-prop engine ([0047](0047-generate-the-style-prop-stylesheet-from-a-property-table.md)); it adds animate.css's own classes and variables.

**`show`, `replay` and the callbacks are runtime props.** They're React state and functions, so they're outside the stored schema.

**Reduced motion:** animate.css's own handling is kept. Under `prefers-reduced-motion`, animations shrink to 1ms and exits end invisible. End events still fire, so sequencing (like the page shell's) keeps working.

## Alternatives considered

- **Shared timing for entrance and exit**: rejected. Page transitions usually want a quick exit and a slower entrance.
- **Only the library's utility values**: rejected. Whole-second delays are too coarse for page transitions.
- **Keeping the element mounted and hidden after exit, or a per-use option**: not chosen. The page shell, modals and drawers need it removed.
- **Not animating on first render, or a per-use `appear` option**: not chosen.
- **Switching animation immediately when `show` flips mid-run**: rejected. animate.css can't reverse mid-way, so the element would jump to the new animation's start frame, and the page shell could see a half-finished exit.
- **Ignoring changes made during an animation**: rejected in favour of finishing, then following the latest value.
- **Breakpoint-specific animations**: not chosen.
- **Attention seekers that play only on replay, or only after the entrance**: rejected in favour of both.
- **Re-entering every time an element scrolls into view, and exiting when it scrolls out**: not chosen.
- **Staggering exits in reverse order**: not chosen.
- **Skipping animations entirely for reduced motion**: not chosen.
- **Naming the trigger `visible` or `present`**: not chosen. `visible` is easily confused with Container's `hidden` prop, which is a CSS `display: none` per breakpoint and doesn't unmount.

## Consequences

- `animate.css` becomes a core dependency, imported once alongside the theme CSS.
- Every component needs the same lifecycle: mounting, the animation phase, `animationend` handling, the in-view observer and the stagger index. It's implemented once and shared, not per component.
- `animationend` bubbles from animated children, so handlers must only react to the element's own animations.
- The page shell (built later) keeps the old page rendered with `show={false}` until `onExitEnd`, then shows the new one. It still has to handle scroll reset, moving focus to the new page for screen readers, and when data loading starts.
- Nothing here is built yet.
