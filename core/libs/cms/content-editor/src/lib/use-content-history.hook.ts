import { useCallback, useReducer } from 'react';
import type { ContentDocumentV1 } from '@inithium/shared-contracts';

/** How many steps undo can go back. */
const LIMIT = 100;
/** Changes with the same key within this many ms (e.g. typing in one field) become one undo step. */
const MERGE_MS = 1000;

type History = {
  past: ContentDocumentV1[];
  present: ContentDocumentV1;
  future: ContentDocumentV1[];
  lastKey: string | null;
  lastAt: number;
};

type Action =
  | { type: 'change'; doc: ContentDocumentV1; key?: string; at: number }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; doc: ContentDocumentV1 };

function reducer(state: History, action: Action): History {
  switch (action.type) {
    case 'change': {
      if (action.doc === state.present) return state;
      const merge = action.key !== undefined && action.key === state.lastKey && action.at - state.lastAt < MERGE_MS;
      return {
        past: merge ? state.past : [...state.past, state.present].slice(-LIMIT),
        present: action.doc,
        future: [],
        lastKey: action.key ?? null,
        lastAt: action.at,
      };
    }
    case 'undo': {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future], lastKey: null, lastAt: 0 };
    }
    case 'redo': {
      const [next, ...rest] = state.future;
      if (!next) return state;
      return { past: [...state.past, state.present], present: next, future: rest, lastKey: null, lastAt: 0 };
    }
    case 'reset':
      return { past: [], present: action.doc, future: [], lastKey: null, lastAt: 0 };
  }
}

/**
 * The editor's document with undo and redo for this session (decision 0093). `change(doc, key)` records a change;
 * changes sharing a key in quick succession (typing in one field) merge into one step.
 */
export function useContentHistory(initial: ContentDocumentV1) {
  const [state, dispatch] = useReducer(reducer, { past: [], present: initial, future: [], lastKey: null, lastAt: 0 });
  const change = useCallback((doc: ContentDocumentV1, key?: string) => dispatch({ type: 'change', doc, key, at: Date.now() }), []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const reset = useCallback((doc: ContentDocumentV1) => dispatch({ type: 'reset', doc }), []);
  return {
    doc: state.present,
    change,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
