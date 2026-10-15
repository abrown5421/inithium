import { useState } from 'react';
import { fontFamilyCssName, fontWeightLabel, MAX_FONT_FAMILIES, type Asset, type FontFamilyRecord } from '@inithium/shared-contracts';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { FontFaces } from '@inithium/shared-ui-theme';
import { AssetGrid } from './asset-grid.component';
import { FontFamilyDialog } from './font-family-dialog.component';
import { FontSample } from './font-sample.component';

export type FontLibraryProps = {
  families: readonly FontFamilyRecord[];
  /** Font files that aren't in any family. */
  looseFonts: Asset[];
  /** Opens a file's details. */
  onSelectFile: (asset: Asset) => void;
};

/** What a family's files cover, e.g. 'Regular 400, Bold 700, Italic'. */
function coverage(family: FontFamilyRecord): string {
  if (!family.files.length) return 'No files: add one';
  return family.files.map((file) => `${fontWeightLabel(file.weight)}${file.style === 'italic' ? ' italic' : ''}`).join(', ');
}

/**
 * The Media screen's font library (decision 0111): each family as a card drawn in its own font, opening its editor; a
 * New font family button while the library holds fewer than six; and the font files that aren't in a family.
 */
export function FontLibrary({ families, looseFonts, onSelectFile }: FontLibraryProps) {
  const [editing, setEditing] = useState<FontFamilyRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const full = families.length >= MAX_FONT_FAMILIES;

  return (
    <Container flex={{ direction: 'column', gap: 24 }}>
      <FontFaces sets={families.map((family) => ({ cssName: fontFamilyCssName(family.id), files: family.files }))} />

      <Container flex={{ direction: { base: 'column', md: 'row' }, align: { base: 'start', md: 'center' }, justify: 'between', gap: 12 }}>
        <Container flex={{ direction: 'column', gap: 4 }}>
          <Text as="h2" fontSize={20} fontWeight={600}>
            Font families
          </Text>
          <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            {families.length} of {MAX_FONT_FAMILIES} used.{' '}
            {full ? 'Remove a family to add another.' : 'Group a font’s files into a family to use it on the site.'}
          </Text>
        </Container>
        <Button leadingIcon="plus" disabled={full} onClick={() => setCreating(true)}>
          New font family
        </Button>
      </Container>

      {families.length ? (
        <Container as="ul" grid={{ columns: { base: 1, md: 2, xl: 3 }, gap: 12 }} aria-label="Font families">
          {families.map((family) => (
            <Container as="li" key={family.id} minWidth={0}>
              {/* A plain <button> around the card: Button is a fixed-height row and can't hold a card (decision 0092). */}
              <button
                type="button"
                aria-label={`${family.name}, ${coverage(family)}`}
                onClick={() => setEditing(family)}
                style={{ display: 'block', width: '100%', padding: 0, border: 0, background: 'none', font: 'inherit', color: 'inherit', textAlign: 'start', cursor: 'pointer', borderRadius: 8 }}
              >
                <Container
                  flex={{ direction: 'column', gap: 8 }}
                  padding={{ all: 16 }}
                  radius={{ all: 8 }}
                  borderWidth={{ all: 2 }}
                  borderColor={{ base: 'transparent', hover: { color: 'primary', intensity: 500, opacity: 50 } }}
                  bgColor={{ base: { color: 'surface', intensity: 50 }, hover: { color: 'surface', intensity: 100 } }}
                >
                  <FontSample cssName={fontFamilyCssName(family.id)} fallback={family.fallback}>
                    <Text as="span" fontSize={32} lineHeight={1.2} truncate={1}>
                      Aa {family.name}
                    </Text>
                  </FontSample>
                  <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 700 }} truncate={2}>
                    {coverage(family)}
                  </Text>
                </Container>
              </button>
            </Container>
          ))}
        </Container>
      ) : (
        <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
          No font families yet.
        </Text>
      )}

      {looseFonts.length > 0 && (
        <Container flex={{ direction: 'column', gap: 12 }}>
          <Container flex={{ direction: 'column', gap: 4 }}>
            <Text as="h2" fontSize={20} fontWeight={600}>
              Fonts not in a family
            </Text>
            <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
              Add these to a family to use them, or delete them.
            </Text>
          </Container>
          <AssetGrid assets={looseFonts} onSelect={onSelectFile} />
        </Container>
      )}

      <FontFamilyDialog open={creating || editing !== null} family={editing} families={families} onClose={() => {
        setCreating(false);
        setEditing(null);
      }} />
    </Container>
  );
}
