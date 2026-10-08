import {
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from 'react';
import type { Animation } from '@inithium/shared-contracts';
import { delayMs, durationMs, END_FALLBACK_MS, IN_VIEW_THRESHOLD } from './animation.config';
import { StaggerContext } from './stagger.context';

/** Props that drive an animation at runtime. Not stored: they're state and callbacks (decision 0048). */
export interface AnimationRuntimeProps {
  /** true (default) mounts the element and plays its entrance; false plays its exit, then unmounts it. */
  show?: boolean;
  /** Replays the attention animation whenever this value changes. */
  replay?: unknown;
  onEntranceEnd?: () => void;
  onExitEnd?: () => void;
}

/**
 * - hidden: unmounted
 * - waiting: mounted but invisible until it scrolls into view
 * - entering / attention / exiting: an animation is running
 * - shown: visible and still
 */
type Phase = 'hidden' | 'waiting' | 'entering' | 'shown' | 'attention' | 'exiting';

interface MotionState {
  phase: Phase;
  /** Increments on every phase change, so a finished animation is only handled once. */
  run: number;
  /** Exiting without an animation (no exit defined, or it never became visible). */
  instantExit: boolean;
  /** An in-view entrance has happened; later entrances play on mount. */
  seen: boolean;
  /** The attention animation's class was removed and must be re-added next frame to restart it. */
  restart: boolean;
  /** The last `show` and `replay` values acted on. */
  show: boolean;
  replay: unknown;
  /** Counters that trigger the end callbacks from an effect. */
  entranceEnds: number;
  exitEnds: number;
}

const withPhase = (state: MotionState, phase: Phase, changes: Partial<MotionState> = {}): MotionState => ({
  ...state,
  ...changes,
  phase,
  run: state.run + 1,
});

function enterPhase(animation: Animation | undefined, seen: boolean): Phase {
  if (animation?.entrance) return animation.entrance.when === 'inView' && !seen ? 'waiting' : 'entering';
  return animation?.attention ? 'attention' : 'shown';
}

/** Follows `show` and `replay`. A running entrance or exit finishes first; attention never blocks an exit. */
function reconcile(state: MotionState, show: boolean, replay: unknown, animation: Animation | undefined): MotionState {
  let next = state;

  if (!Object.is(next.replay, replay)) {
    next = { ...next, replay };
    if (animation?.attention && (next.phase === 'shown' || next.phase === 'attention')) {
      next = withPhase(next, 'shown', { restart: true });
    }
  }

  if (next.phase !== 'entering' && next.phase !== 'exiting') {
    if (show && next.phase === 'hidden') next = withPhase(next, enterPhase(animation, next.seen));
    else if (!show && next.phase === 'waiting') next = withPhase(next, 'exiting', { instantExit: true });
    else if (!show && (next.phase === 'shown' || next.phase === 'attention')) {
      next = withPhase(next, 'exiting', { instantExit: !animation?.exit, restart: false });
    }
  }

  return next.show === show ? next : { ...next, show };
}

/** Moves on from a finished animation. `reconcile` then follows `show`'s current value. */
function finished(state: MotionState, run: number, hasAttention: boolean): MotionState {
  if (state.run !== run) return state;
  if (state.phase === 'entering') {
    return withPhase(state, hasAttention ? 'attention' : 'shown', { entranceEnds: state.entranceEnds + 1 });
  }
  if (state.phase === 'attention') return withPhase(state, 'shown');
  if (state.phase === 'exiting') {
    return withPhase(state, 'hidden', { instantExit: false, exitEnds: state.exitEnds + 1 });
  }
  return state;
}

export interface AnimationState {
  mounted: boolean;
  className: string;
  style: CSSProperties;
  /** Pass as the element's ref. */
  attach: (element: HTMLElement | null) => void;
  /** The rendered element (or null). Only call after render, e.g. from useImperativeHandle. */
  getElement: () => HTMLElement | null;
  handleAnimationEnd: (event: AnimationEvent<HTMLElement>) => void;
}

/** The shared animation lifecycle for every UI component (decision 0048). */
export function useAnimation({
  animation,
  show = true,
  replay,
  onEntranceEnd,
  onExitEnd,
}: AnimationRuntimeProps & { animation?: Animation }): AnimationState {
  const staggerOffset = useContext(StaggerContext);
  const element = useRef<HTMLElement | null>(null);

  const [stored, setState] = useState<MotionState>(() => ({
    phase: show ? enterPhase(animation, false) : 'hidden',
    run: 0,
    instantExit: false,
    seen: false,
    restart: false,
    show,
    replay,
    entranceEnds: 0,
    exitEnds: 0,
  }));

  // Adjust state while rendering when show/replay change (React re-renders before committing).
  const state = reconcile(stored, show, replay, animation);
  if (state !== stored) setState(state);

  const { phase, run } = state;
  const { entrance, exit, attention } = animation ?? {};
  const active =
    phase === 'entering' ? entrance
    : phase === 'exiting' && !state.instantExit ? exit
    : phase === 'attention' ? attention
    : undefined;
  const repeat = phase === 'attention' ? (attention?.repeat ?? 1) : 1;
  const duration = durationMs(active?.speed);
  const delay = delayMs(active?.delay) + (phase === 'entering' ? staggerOffset : 0);
  const finite = repeat !== 'infinite';
  const hasAttention = attention !== undefined;

  // End callbacks fire from effects when their counters change.
  const fireEntranceEnd = useEffectEvent(() => onEntranceEnd?.());
  const fireExitEnd = useEffectEvent(() => onExitEnd?.());
  useEffect(() => {
    if (state.entranceEnds > 0) fireEntranceEnd();
  }, [state.entranceEnds]);
  useEffect(() => {
    if (state.exitEnds > 0) fireExitEnd();
  }, [state.exitEnds]);

  // In-view entrances: wait until enough of the element is visible.
  useEffect(() => {
    if (phase !== 'waiting' || !element.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setState((current) => (current.phase === 'waiting' ? withPhase(current, 'entering', { seen: true }) : current));
      },
      { threshold: IN_VIEW_THRESHOLD },
    );
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [phase]);

  // Replay: with the class removed, force a reflow next frame, then add it back so the browser restarts it.
  useEffect(() => {
    if (!state.restart) return;
    const frame = requestAnimationFrame(() => {
      void element.current?.offsetWidth;
      setState((current) =>
        current.restart && current.phase === 'shown' ? withPhase(current, 'attention', { restart: false }) : current,
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [state.restart]);

  // Fallback: treat the animation as ended if animationend never arrives (e.g. the element is display: none).
  // Instant exits have no animation and end on the next tick.
  const hasEnding = (active !== undefined && finite) || (phase === 'exiting' && state.instantExit);
  const timeout = active ? delay + duration * (finite ? repeat : 1) + END_FALLBACK_MS : 0;
  useEffect(() => {
    if (!hasEnding) return;
    const timer = setTimeout(() => setState((current) => finished(current, run, hasAttention)), timeout);
    return () => clearTimeout(timer);
  }, [hasEnding, run, timeout, hasAttention]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    // Ignore animations bubbling up from children, and attention loops that never end.
    if (event.target !== event.currentTarget || !active || !finite) return;
    setState((current) => finished(current, run, hasAttention));
  };

  const attach = useCallback((node: HTMLElement | null) => {
    element.current = node;
  }, []);

  const getElement = useCallback(() => element.current, []);
  const mounted = phase !== 'hidden';

  const className = active
    ? [
        'animate__animated',
        `animate__${active.name}`,
        delay > 0 ? 'animate__delay-1s' : '',
        phase === 'attention' ? (finite ? 'animate__repeat-1' : 'animate__infinite') : '',
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  const style: Record<string, string> = {};
  if (active) {
    style['--animate-duration'] = `${duration}ms`;
    if (delay > 0) style['--animate-delay'] = `${delay}ms`;
    if (phase === 'attention' && finite) style['--animate-repeat'] = String(repeat);
  }
  if (phase === 'waiting') style.visibility = 'hidden';

  return { mounted, className, style: style as CSSProperties, attach, getElement, handleAnimationEnd };
}
