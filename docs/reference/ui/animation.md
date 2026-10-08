---
title: Animation
description: The animation prop, the show/replay runtime props, stagger, and every available animation.
scope: core
tags: [ui, animation, props]
order: 4
decisions: ["0048"]
---

# Animation

Every component takes an `animation` object describing its entrance, exit and attention animations, plus runtime props that control when they play ([0048](../../decisions/0048-animate-components-with-animate-css-through-an-animation-prop.md)). Animations come from [animate.css](https://animate.style/) 4.1.1.

```tsx
<Container
  animation={{
    entrance:  { name: 'fadeInUp', speed: 'fast', delay: 150, when: 'mount' },
    exit:      { name: 'fadeOutDown', speed: 'faster' },
    attention: { name: 'shakeX', speed: 'fast', repeat: 1 },
  }}
  show={isOpen}
  replay={errorCount}
  onEntranceEnd={() => …}
  onExitEnd={() => …}
/>
```

## The `animation` object

Serializable and stored with the component. Each slot is optional, and `animation` takes no variant keys.

| Slot | Field | Values | Default |
| --- | --- | --- | --- |
| `entrance` | `name` | An [entrance animation](#entrances) | required |
| | `speed` | `'faster'` (500ms), `'fast'` (800ms), `'slow'` (2s), `'slower'` (3s), or ms | 1s |
| | `delay` | `'1s'`–`'5s'`, or ms | none |
| | `when` | `'mount'`, or `'inView'`: the first time 20% of the element is visible | `'mount'` |
| `exit` | `name` | An [exit animation](#exits) | required |
| | `speed`, `delay` | As above | |
| `attention` | `name` | An [attention seeker](#attention-seekers) | required |
| | `speed`, `delay` | As above | |
| | `repeat` | `1`, `2`, `3` or `'infinite'` | `1` |

## Runtime props

Not stored: these are React state and callbacks.

| Prop | Type | Default | Behaviour |
| --- | --- | --- | --- |
| `show` | `boolean` | `true` | `true` mounts the element and plays its entrance, including on first render. `false` plays the exit, then **unmounts** the element. |
| `replay` | any value | none | Plays the attention animation again whenever the value changes, e.g. a counter. |
| `onEntranceEnd` | `() => void` | none | Called when the entrance finishes. |
| `onExitEnd` | `() => void` | none | Called when the exit finishes, just before unmounting. Also called when there is no exit animation. |

Container also takes **`stagger`** (a number of ms, stored with it). It adds index × ms to each direct child element's entrance delay, so children cascade in; exits aren't staggered.

## Lifecycle

- **Entrance:** plays when the element mounts with `show` true, or when `show` turns true. With `when: 'inView'`, the element waits invisible (still taking its space) until it scrolls into view, once only.
- **Attention:** plays after the entrance, or on mount if there's no entrance. It repeats `repeat` times or forever, and plays again when `replay` changes.
- **Exit:** plays when `show` turns false, then the element unmounts.
- **Changes mid-animation:** if `show` changes while an entrance or exit is running, that animation finishes first, then the element follows `show`'s latest value. A running attention animation, even an infinite one, doesn't delay an exit.
- **Missing end events:** if the browser never reports an animation finishing, e.g. the element is hidden with `display: none`, it's treated as finished shortly after it should have ended. Sequences therefore always complete.
- **Children:** `animationend` events from child elements are ignored.
- **Reduced motion:** with `prefers-reduced-motion`, animate.css shortens animations to 1ms and hides finished exits. Callbacks still fire.

## Recipes

**Toggle with an entrance and an exit:**

```tsx
<Container
  show={open}
  animation={{ entrance: { name: 'fadeInUp', speed: 'fast' }, exit: { name: 'fadeOutDown', speed: 'faster' } }}
/>
```

**Sequence two views** (the page-shell pattern): the current one exits completely, then the next enters.

```tsx
<Container
  key={page}
  show={!leaving}
  animation={{ entrance: { name: 'fadeInRight', speed: 400 }, exit: { name: 'fadeOutLeft', speed: 250 } }}
  onExitEnd={() => { setPage(next); setLeaving(false); }}
/>
```

**Shake on each validation error:**

```tsx
<Container animation={{ attention: { name: 'shakeX', speed: 'fast' } }} replay={errorCount} />
```

**A pulsing badge:**

```tsx
<Container animation={{ attention: { name: 'pulse', repeat: 'infinite', speed: 'slow' } }} />
```

**Cascade a list in:**

```tsx
<Container grid={{ columns: 3, gap: 8 }} stagger={120}>
  {items.map((item) => (
    <Container key={item.id} animation={{ entrance: { name: 'zoomIn', speed: 'fast' } }}>…</Container>
  ))}
</Container>
```

**Reveal on scroll:**

```tsx
<Container animation={{ entrance: { name: 'fadeInUp', when: 'inView' } }} />
```

## Available animations

Each slot only accepts its own kind.

### Entrances

`backInDown`, `backInLeft`, `backInRight`, `backInUp`, `bounceIn`, `bounceInDown`, `bounceInLeft`, `bounceInRight`, `bounceInUp`, `fadeIn`, `fadeInDown`, `fadeInDownBig`, `fadeInLeft`, `fadeInLeftBig`, `fadeInRight`, `fadeInRightBig`, `fadeInUp`, `fadeInUpBig`, `fadeInTopLeft`, `fadeInTopRight`, `fadeInBottomLeft`, `fadeInBottomRight`, `flipInX`, `flipInY`, `lightSpeedInRight`, `lightSpeedInLeft`, `rotateIn`, `rotateInDownLeft`, `rotateInDownRight`, `rotateInUpLeft`, `rotateInUpRight`, `jackInTheBox`, `rollIn`, `zoomIn`, `zoomInDown`, `zoomInLeft`, `zoomInRight`, `zoomInUp`, `slideInDown`, `slideInLeft`, `slideInRight`, `slideInUp`

### Exits

`backOutDown`, `backOutLeft`, `backOutRight`, `backOutUp`, `bounceOut`, `bounceOutDown`, `bounceOutLeft`, `bounceOutRight`, `bounceOutUp`, `fadeOut`, `fadeOutDown`, `fadeOutDownBig`, `fadeOutLeft`, `fadeOutLeftBig`, `fadeOutRight`, `fadeOutRightBig`, `fadeOutUp`, `fadeOutUpBig`, `fadeOutTopLeft`, `fadeOutTopRight`, `fadeOutBottomRight`, `fadeOutBottomLeft`, `flipOutX`, `flipOutY`, `lightSpeedOutRight`, `lightSpeedOutLeft`, `rotateOut`, `rotateOutDownLeft`, `rotateOutDownRight`, `rotateOutUpLeft`, `rotateOutUpRight`, `hinge`, `rollOut`, `zoomOut`, `zoomOutDown`, `zoomOutLeft`, `zoomOutRight`, `zoomOutUp`, `slideOutDown`, `slideOutLeft`, `slideOutRight`, `slideOutUp`

### Attention seekers

`bounce`, `flash`, `pulse`, `rubberBand`, `shakeX`, `shakeY`, `headShake`, `swing`, `tada`, `wobble`, `jello`, `heartBeat`, `flip`

## Schemas and implementation

- **Schemas** in `@inithium/shared-contracts`: `animationSchema` (type `Animation`), `entranceAnimationSchema`, `exitAnimationSchema`, `attentionAnimationSchema`, and the name lists `entranceAnimations`, `exitAnimations`, `attentionAnimations`.
- **Lifecycle:** `useAnimation` in `@inithium/shared-ui-components` (`src/lib/animation/`). Every component uses it; new components must too, rather than reimplementing it.
