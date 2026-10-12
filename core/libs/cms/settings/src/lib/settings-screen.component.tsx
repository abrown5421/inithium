import { useState, type FormEvent, type ReactNode } from 'react';
import { siteSettingsInputSchema, themeColors, type SiteSettings, type SiteSettingsInput, type ThemeColor } from '@inithium/shared-contracts';
import {
  fieldErrorsFrom,
  focusFirstError,
  readApiFailure,
  useAlerts,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  type FieldErrors,
} from '@inithium/shared-data-access';
import { Button, Container, Input, Loader, Text } from '@inithium/shared-ui-components';
import { defaultLogo, defaultTheme } from '@inithium/shared-ui-theme';
import { normalizeHex, ThemeColorField } from './theme-color-field.component';

type Draft = {
  siteTitle: string;
  logoSrc: string;
  logoAlt: string;
  copyright: string;
  colors: Record<ThemeColor, string>;
  /** Whether the site has its own theme; false saves no theme, so it follows Inithium's defaults. */
  customTheme: boolean;
};

const FIELDS = ['siteTitle', 'logo.src', 'logo.alt', 'copyright', ...themeColors.map((token) => `theme.colors.${token}` as const)] as const;
type Field = (typeof FIELDS)[number];

const draftOf = (settings: SiteSettings): Draft => ({
  siteTitle: settings.siteTitle,
  logoSrc: settings.logo?.src ?? '',
  logoAlt: settings.logo?.alt ?? '',
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
 * The CMS's Settings screen (decisions 0082 and 0087, needs settings.edit): the site's title, logo and copyright
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
      ...(draft.logoSrc.trim() ? { logo: { src: draft.logoSrc.trim(), alt: draft.logoAlt.trim() } } : {}),
      ...(draft.copyright.trim() ? { copyright: draft.copyright.trim() } : {}),
      ...(draft.customTheme
        ? { theme: { colors: Object.fromEntries(themeColors.map((token) => [token, normalizeHex(draft.colors[token])])) as Draft['colors'] } }
        : {}),
    };
    const parsed = siteSettingsInputSchema.safeParse(input);
    if (!parsed.success) return fail(fieldErrorsFrom<Field>(parsed.error.issues), 'There were problems with the settings', 'Check the highlighted fields.');

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
            <Input
              name="logo.src"
              label="Logo address"
              helperText="A link to the logo image. Uploads come later."
              value={draft.logoSrc}
              onValueChange={(logoSrc) => change({ logoSrc })}
              error={errors['logo.src']}
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
            <img
              src={draft.logoSrc.trim() || defaultLogo.src}
              alt={draft.logoSrc.trim() ? draft.logoAlt : defaultLogo.alt}
              style={{ height: 40, width: 'auto' }}
            />
            <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
              {draft.logoSrc.trim() ? 'Preview of your logo.' : 'No logo set, so Inithium’s default logo is used.'}
            </Text>
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
