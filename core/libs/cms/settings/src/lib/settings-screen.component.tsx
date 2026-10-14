import { useState, type FormEvent, type ReactNode } from 'react';
import { assetUrl, logoImage, siteSettingsInputSchema, themeColors, type SiteSettings, type SiteSettingsInput, type ThemeColor } from '@inithium/shared-contracts';
import {
  fieldErrorsFrom,
  focusFirstError,
  readApiFailure,
  useAlerts,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  type FieldErrors,
} from '@inithium/shared-data-access';
import { AssetField } from '@inithium/cms-media';
import { Button, Container, Image, Input, Loader, Text } from '@inithium/shared-ui-components';
import { defaultLogo, defaultTheme, themeColorProblem } from '@inithium/shared-ui-theme';
import { normalizeHex, ThemeColorField } from './theme-color-field.component';

type Draft = {
  siteTitle: string;
  logoAssetId: string;
  logoAlt: string;
  faviconAssetId: string;
  copyright: string;
  colors: Record<ThemeColor, string>;
  /** Whether the site has its own theme; false saves no theme, so it follows Inithium's defaults. */
  customTheme: boolean;
};

const FIELDS = ['siteTitle', 'logo.assetId', 'logo.alt', 'favicon.assetId', 'copyright', ...themeColors.map((token) => `theme.colors.${token}` as const)] as const;
type Field = (typeof FIELDS)[number];

const draftOf = (settings: SiteSettings): Draft => ({
  siteTitle: settings.siteTitle,
  logoAssetId: settings.logo?.assetId ?? '',
  logoAlt: settings.logo?.alt ?? '',
  faviconAssetId: settings.favicon?.assetId ?? '',
  copyright: settings.copyright ?? '',
  colors: { ...(settings.theme ?? defaultTheme).colors },
  customTheme: Boolean(settings.theme),
});

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Container
      as="section"
      flex={{ direction: 'column', gap: 20 }}
      padding={{ all: 24 }}
      radius={{ all: 8 }}
      bgColor={{ color: 'surface', intensity: 50 }}
      borderWidth={{ all: 1 }}
      borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}
    >
      <Container flex={{ direction: 'column', gap: 4 }}>
        <Text as="h2" fontSize={18} fontWeight={700}>
          {title}
        </Text>
        <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
          {description}
        </Text>
      </Container>
      {children}
    </Container>
  );
}

/**
 * The CMS's Settings screen (decisions 0082, 0087 and 0101, needs settings.edit): the site's title, logo, favicon and copyright
 * holder, and its theme colours as hex codes, each previewing the scale generated from it. Save reports problems
 * like every CMS form; the CMS takes on a new theme as soon as it's saved.
 */
export function SettingsScreen() {
  const { data: settings, isLoading, isError, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();
  const { show: showAlert } = useAlerts();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loadedFrom, setLoadedFrom] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  // Start (and restart after each save) from the stored settings.
  if (settings && settings.updatedAt !== loadedFrom) {
    setLoadedFrom(settings.updatedAt);
    setDraft(draftOf(settings));
  }

  if (isLoading) {
    return (
      <Container flex={{ justify: 'center' }} padding={{ all: 32 }}>
        <Loader size={32} label="Loading settings" />
      </Container>
    );
  }
  if (isError || !draft) {
    return (
      <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
        <Text as="p">We couldn’t load the settings.</Text>
        <Button variant="outlined" onClick={() => void refetch()}>
          Try again
        </Button>
      </Container>
    );
  }

  const change = (next: Partial<Draft>) => setDraft({ ...draft, ...next });
  const changeColor = (token: ThemeColor, value: string) =>
    change({ colors: { ...draft.colors, [token]: value }, customTheme: true });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fail = (found: FieldErrors<Field>, title: string, message: string) => {
      setErrors(found);
      showAlert({ color: 'red', icon: 'circle-alert', title, message, urgent: true });
      focusFirstError(FIELDS, found, form);
    };

    const input: SiteSettingsInput = {
      siteTitle: draft.siteTitle,
      ...(draft.logoAssetId ? { logo: { assetId: draft.logoAssetId, alt: draft.logoAlt.trim() } } : {}),
      ...(draft.faviconAssetId ? { favicon: { assetId: draft.faviconAssetId } } : {}),
      ...(draft.copyright.trim() ? { copyright: draft.copyright.trim() } : {}),
      ...(draft.customTheme
        ? { theme: { colors: Object.fromEntries(themeColors.map((token) => [token, normalizeHex(draft.colors[token])])) as Draft['colors'] } }
        : {}),
    };
    const parsed = siteSettingsInputSchema.safeParse(input);
    const found: FieldErrors<Field> = parsed.success ? {} : fieldErrorsFrom<Field>(parsed.error.issues);
    // Colours the theme can't be built from, e.g. a surface too dark for readable text.
    for (const token of input.theme ? themeColors : []) {
      const problem = themeColorProblem(token, input.theme?.colors[token] ?? '');
      if (problem && !found[`theme.colors.${token}`]) found[`theme.colors.${token}`] = problem;
    }
    if (!parsed.success || Object.keys(found).length > 0) return fail(found, 'There were problems with the settings', 'Check the highlighted fields.');

    setErrors({});
    try {
      await updateSettings(parsed.data).unwrap();
      showAlert({ color: 'green', icon: 'circle-check', title: 'Settings saved', message: 'The site uses them from its next page load.' });
    } catch (saveError) {
      const failure = readApiFailure(saveError);
      if (failure.issues) return fail(fieldErrorsFrom<Field>(failure.issues), "We couldn't save the settings", 'Check the highlighted fields.');
      fail({}, "We couldn't save the settings", failure.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Container flex={{ direction: 'column', gap: 24 }}>
        <Container flex={{ direction: 'column', gap: 4 }}>
          <Text as="h1" fontFamily="display" fontSize={28}>
            Settings
          </Text>
          <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            Your site’s name, logo and colours.
          </Text>
        </Container>

        <Section title="Site" description="Shown in the navigation bar, the footer and browser tabs.">
          <Input name="siteTitle" label="Site title" required value={draft.siteTitle} onValueChange={(siteTitle) => change({ siteTitle })} error={errors.siteTitle} />
          <Container grid={{ columns: { base: 1, md: 2 }, gap: 16 }}>
            <AssetField
              label="Logo"
              kind="image"
              purpose="logo"
              helperText="Shown in the navigation bar. Remove it to use Inithium’s default logo."
              value={draft.logoAssetId || undefined}
              onChange={(asset) =>
                change(asset ? { logoAssetId: asset.id, logoAlt: draft.logoAlt.trim() || asset.alt || '' } : { logoAssetId: '', logoAlt: '' })
              }
              error={errors['logo.assetId']}
            />
            <Input
              name="logo.alt"
              label="Logo description"
              helperText="Read by screen readers when there’s no title beside it."
              value={draft.logoAlt}
              onValueChange={(logoAlt) => change({ logoAlt })}
              error={errors['logo.alt']}
            />
          </Container>
          <Container flex={{ align: 'center', gap: 12 }}>
            <Image
              {...(draft.logoAssetId ? logoImage({ assetId: draft.logoAssetId, alt: draft.logoAlt }) : defaultLogo)}
              height={40}
              width="auto"
              loading="eager"
            />
            <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
              {draft.logoAssetId ? 'Preview of your logo.' : 'No logo set, so Inithium’s default logo is used.'}
            </Text>
          </Container>
          <Container grid={{ columns: { base: 1, md: 2 }, gap: 16 }}>
            <AssetField
              label="Favicon"
              kind="image"
              purpose="favicon"
              onlyPurpose
              helperText="The icon in browser tabs and bookmarks, for the site and the CMS: an ICO, PNG or SVG, ideally square. Remove it to use Inithium’s default."
              value={draft.faviconAssetId || undefined}
              onChange={(asset) => change({ faviconAssetId: asset?.id ?? '' })}
              error={errors['favicon.assetId']}
            />
            <Container flex={{ align: 'center', gap: 12 }}>
              {/* Tab icons are drawn small: preview the sizes browsers use. */}
              <Image src={draft.faviconAssetId ? assetUrl(draft.faviconAssetId) : '/favicon.ico'} alt="" decorative width={16} height={16} fit="contain" loading="eager" />
              <Image src={draft.faviconAssetId ? assetUrl(draft.faviconAssetId) : '/favicon.ico'} alt="" decorative width={32} height={32} fit="contain" loading="eager" />
              <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
                {draft.faviconAssetId ? 'Preview at 16 and 32 pixels.' : 'No favicon set, so Inithium’s default is used.'}
              </Text>
            </Container>
          </Container>
          <Input
            name="copyright"
            label="Copyright holder"
            helperText="Shown in the footer as “© year holder. All rights reserved.”"
            value={draft.copyright}
            onValueChange={(copyright) => change({ copyright })}
            error={errors.copyright}
          />
        </Section>

        <Section
          title="Theme colours"
          description="Enter your brand colours as hex codes. Every lighter and darker shade is generated from them."
        >
          <Container grid={{ columns: { base: 1, md: 2 }, gap: 24 }}>
            {themeColors.map((token) => (
              <ThemeColorField
                key={token}
                token={token}
                value={draft.colors[token]}
                onValueChange={(value) => changeColor(token, value)}
                error={errors[`theme.colors.${token}`]}
              />
            ))}
          </Container>
          <Container flex={{ align: 'center', gap: 12, wrap: 'wrap' }}>
            <Text as="p" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
              {draft.customTheme ? 'Your own colours.' : 'Inithium’s default colours.'}
            </Text>
            <Button
              variant="ghost"
              leadingIcon="rotate-ccw"
              disabled={!draft.customTheme}
              onClick={() => change({ colors: { ...defaultTheme.colors }, customTheme: false })}
            >
              Reset to defaults
            </Button>
          </Container>
        </Section>

        {/* On the left, under the fields: alerts appear bottom right and would cover it there. */}
        <Container flex={{ justify: 'start' }}>
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </Container>
      </Container>
    </form>
  );
}
