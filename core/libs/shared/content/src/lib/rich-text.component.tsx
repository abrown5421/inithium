import type { ColorValue, ContentAlign, RichTextDocument } from '@inithium/shared-contracts';
import { RichTextView } from '@inithium/shared-ui-composites';
import { useContentLinks } from './content-links.context';

export type RichTextProps = {
  doc: RichTextDocument;
  align?: ContentAlign;
  textColor?: ColorValue;
};

/**
 * Draws a content page's rich text (decision 0093): the UI library's RichTextView, with links to the site's pages
 * resolved and followed through the app's router (and inert in the CMS preview).
 */
export function RichText({ doc, align, textColor }: RichTextProps) {
  const resolve = useContentLinks();
  return <RichTextView doc={doc} align={align} textColor={textColor} resolveLink={resolve} />;
}
