import type { SetupChecklist } from '@inithium/shared-contracts';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, type SettingsDocument } from '@inithium/api-settings';
import { SetupChecklistTickModel } from './setup-checklist.model';
import type { SetupChecklistItem } from './setup-checklist.types';

const failure = (status: number, message: string, field?: string) => Object.assign(new Error(message), { status, field });

/** Core's steps (decision 0120), reading the site settings through `settings` (loaded once per checklist). */
function coreSetupChecklistItems(settings: () => Promise<SettingsDocument>): SetupChecklistItem[] {
  const check = (test: (doc: SettingsDocument) => boolean) => async () => test(await settings());
  return [
    {
      id: 'site-title',
      label: 'Name your site',
      description: 'Replace “Inithium” with your site’s title.',
      href: '/settings',
      order: 100,
      isDone: check((doc) => doc.siteTitle !== DEFAULT_SITE_SETTINGS.siteTitle),
    },
    { id: 'logo', label: 'Add your logo', href: '/settings', order: 200, isDone: check((doc) => Boolean(doc.logo?.assetId)) },
    {
      id: 'logo-dark',
      label: 'Add a logo for dark mode',
      description: 'Done too if dark mode is turned off.',
      href: '/settings',
      order: 300,
      isDone: check((doc) => Boolean(doc.logoDark?.assetId) || doc.darkMode === false),
    },
    {
      id: 'favicon',
      label: 'Add your favicon',
      description: 'The icon in the browser’s tab, in place of Inithium’s.',
      href: '/settings',
      order: 400,
      isDone: check((doc) => Boolean(doc.favicon?.assetId)),
    },
    { id: 'theme', label: 'Set your brand colours', href: '/settings', order: 500, isDone: check((doc) => Boolean(doc.theme?.colors)) },
    { id: 'fonts', label: 'Choose your fonts', href: '/settings', order: 600, isDone: check((doc) => Boolean(doc.fonts?.display || doc.fonts?.body)) },
    {
      id: 'copyright',
      label: 'Name the copyright holder',
      description: 'Replace “Inithium” in the footer’s copyright line.',
      href: '/settings',
      order: 700,
      isDone: check((doc) => Boolean(doc.copyright?.trim()) && doc.copyright !== DEFAULT_SITE_SETTINGS.copyright),
    },
    {
      id: 'privacy-policy',
      label: 'Review the privacy policy',
      description: 'Core’s wording is a starting point, not legal advice. Tick it once it’s right for this site.',
      href: '/pages',
      order: 800,
    },
    { id: 'home-page', label: 'Design the Home page', description: 'Tick it once the Home page is ready.', href: '/pages', order: 900 },
  ];
}

/** Every step, core's and the registered ones, in order. Throws if two share an id. */
export function setupChecklistItems(registered: readonly SetupChecklistItem[]): SetupChecklistItem[] {
  const items = [...coreSetupChecklistItems(() => getSiteSettings()), ...registered];
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`Two setup checklist items have the id '${item.id}'`);
    ids.add(item.id);
  }
  return items.sort((a, b) => a.order - b.order);
}

/** The checklist with each step's state: detected ones read now, the rest from their ticks. */
export async function setupChecklist(registered: readonly SetupChecklistItem[]): Promise<SetupChecklist> {
  let loaded: Promise<SettingsDocument> | undefined;
  const settings = () => (loaded ??= getSiteSettings());
  const items = [...coreSetupChecklistItems(settings), ...registered].sort((a, b) => a.order - b.order);
  const ticked = new Set((await SetupChecklistTickModel.find({}, { itemId: 1 }).lean()).map((tick) => tick.itemId));

  return {
    items: await Promise.all(
      items.map(async (item) => {
        // A step whose check fails shows as not done rather than breaking the checklist.
        const done = item.isDone
          ? await item.isDone().catch((error: Error) => {
              console.warn(`[ setup checklist ] '${item.id}' couldn’t be checked: ${error.message}`);
              return false;
            })
          : ticked.has(item.id);
        return {
          id: item.id,
          label: item.label,
          ...(item.description ? { description: item.description } : {}),
          ...(item.href ? { href: item.href } : {}),
          manual: !item.isDone,
          done,
        };
      }),
    ),
  };
}

/** Ticks or unticks a step that's ticked by hand (404 for an unknown step, 400 for one detected from data). */
export async function tickSetupChecklistItem(registered: readonly SetupChecklistItem[], itemId: string, done: boolean, userId: string): Promise<void> {
  const item = setupChecklistItems(registered).find((candidate) => candidate.id === itemId);
  if (!item) throw failure(404, 'That step doesn’t exist');
  if (item.isDone) throw failure(400, 'That step is ticked automatically once it’s done', 'done');
  if (done) await SetupChecklistTickModel.updateOne({ itemId }, { $setOnInsert: { itemId, userId } }, { upsert: true });
  else await SetupChecklistTickModel.deleteOne({ itemId });
}
