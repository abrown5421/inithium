import { createContext } from 'react';

export type PageReadyContextValue = {
  /** Called by usePageReady: the page reports readiness itself from now on. */
  claim: () => void;
  report: (ready: boolean) => void;
};

export const PageReadyContext = createContext<PageReadyContextValue | null>(null);
