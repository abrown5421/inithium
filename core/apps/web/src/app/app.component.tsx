import { ContentElementRenderersProvider } from '@inithium/shared-content';
import { coreTemplates, ProfileSlotsProvider } from '@inithium/web-pages';
import { registerPresenceStatuses } from '@inithium/shared-contracts';
import { SiteShell } from '@inithium/web-shell';
import { registeredContentElementRenderers, registeredPresenceStatuses, registeredProfileSlots, registeredTemplates } from './plugins.registry';

// Core's templates first, so a plugin or client template with the same key replaces core's (decision 0078).
const templates = [...coreTemplates, ...registeredTemplates];
// Installed plugins' presence statuses, so their lights draw (decision 0124).
registerPresenceStatuses(registeredPresenceStatuses);

export function App() {
  return (
    <ProfileSlotsProvider slots={registeredProfileSlots}>
      <ContentElementRenderersProvider renderers={registeredContentElementRenderers}>
        <SiteShell templates={templates} />
      </ContentElementRenderersProvider>
    </ProfileSlotsProvider>
  );
}
