import { matchRoutes } from 'react-router-dom';
import type { PublicPage } from '@inithium/shared-contracts';

export type ResolvedPage = { page: PublicPage; params: Record<string, string> };

/**
 * The published page for a pathname, with its parameters, ranked like React Router (static segments beat
 * parameters). Falls back to the Not Found page, or null if there isn't one.
 */
export function resolvePage(pages: PublicPage[], pathname: string): ResolvedPage | null {
  const routes = pages.map((page) => ({ path: page.path, id: page.id }));
  const match = matchRoutes(routes, pathname)?.at(-1);
  const page = match ? pages.find((candidate) => candidate.id === match.route.id) : undefined;
  if (page && match) return { page, params: { ...(match.params as Record<string, string>) } };
  const notFound = pages.find((candidate) => candidate.template === 'not-found');
  return notFound ? { page: notFound, params: {} } : null;
}

/**
 * Where an audience sends the visitor instead (decision 0079): signed-out visitors on signed-in pages to Login,
 * signed-in users on signed-out pages back where they were going (or Home).
 */
export function audienceRedirect(page: PublicPage, signedIn: boolean): 'login' | 'away' | null {
  if (page.audience === 'signed-in' && !signedIn) return 'login';
  if (page.audience === 'signed-out' && signedIn) return 'away';
  return null;
}
