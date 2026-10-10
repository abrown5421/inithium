import { coreTemplates } from '@inithium/web-pages';
import { SiteShell } from '@inithium/web-shell';
import { registeredTemplates } from './plugins.registry';

// Core's templates first, so a plugin or client template with the same key replaces core's (decision 0078).
const templates = [...coreTemplates, ...registeredTemplates];

export function App() {
  return <SiteShell templates={templates} />;
}
