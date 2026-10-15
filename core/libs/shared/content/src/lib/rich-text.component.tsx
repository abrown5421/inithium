import type { ColorValue, ContentAlign, ContentTypography, RichTextDocument } from '@inithium/shared-contracts';
import { RichTextView } from '@inithium/shared-ui-composites';
import { useContentLinks } from './content-links.context';

export type RichTextProps = {
  doc: RichTextDocument;
  align?: ContentAlign;
  textColor?: ColorValue;
  /** The running text's font, weight and size (decision 0115). */
  typography?: ContentTypography;
  /** The headings' font, weight and size (decision 0116). */
  headingTypography?: ContentTypography;
};

/**
 * Draws a content page's rich text (decisions 0093, 0116): the UI library's RichTextView, with links to the site's
 * pages resolved and followed through the app's router (and inert in the CMS preview).
 */
export function RichText({ doc, align, textColor, typography, headingTypography }: RichTextProps) {
  const resolve = useContentLinks();
  return (
    <RichTextView doc={doc} align={align} textColor={textColor} typography={typography} headingTypography={headingTypography} resolveLink={resolve} />
  );
}
