import type { ContentDocument, ContentElement, ContentTypography } from './content.types';
import { contentElementContract, flattenContentElements } from './content-elements.schema';
import { richTextInlineParts, type RichTextDocument } from './rich-text.schema';

/**
 * Everything a content page refers to by id (decision 0116): the assets it shows, the site's pages it links to and
 * the library font families it uses. Usage checks read them, e.g. so deleting a page warns about pages linking to it.
 */
export type ContentReferences = { assetIds: Set<string>; pageIds: Set<string>; fontFamilyIds: Set<string> };

const familyOf = (typography: ContentTypography | undefined) =>
  typeof typography?.fontFamily === 'object' ? typography.fontFamily.familyId : undefined;

/** Links to pages and restyled words' families in rich text. */
function richTextReferences(doc: RichTextDocument, found: ContentReferences): void {
  for (const part of richTextInlineParts(doc)) {
    if (part.type !== 'text') continue;
    for (const mark of part.marks ?? []) {
      if (mark.type === 'link' && mark.attrs.link.type === 'page') found.pageIds.add(mark.attrs.link.pageId);
      if (mark.type === 'textStyle' && typeof mark.attrs.family === 'object') found.fontFamilyIds.add(mark.attrs.family.familyId);
    }
  }
}

/**
 * A plugin's element whose contract declares no references (or whose plugin isn't registered): anything shaped like a
 * reference counts (a page link, an `assetId`, a `familyId`).
 */
function scanUnknown(value: unknown, found: ContentReferences): void {
  if (Array.isArray(value)) return value.forEach((item) => scanUnknown(item, found));
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  if (record['type'] === 'page' && typeof record['pageId'] === 'string') found.pageIds.add(record['pageId']);
  if (typeof record['assetId'] === 'string' && record['assetId']) found.assetIds.add(record['assetId']);
  if (typeof record['familyId'] === 'string') found.fontFamilyIds.add(record['familyId']);
  Object.values(record).forEach((item) => scanUnknown(item, found));
}

/** What one element refers to, by its type's declared references. */
function elementReferences(element: ContentElement, found: ContentReferences): void {
  const add = (set: Set<string>, id: string | undefined) => id && set.add(id);
  switch (element.type) {
    case 'text':
      richTextReferences(element.props.doc, found);
      add(found.fontFamilyIds, familyOf(element.props.typography));
      add(found.fontFamilyIds, familyOf(element.props.headingTypography));
      return;
    case 'image':
      add(found.assetIds, element.props.assetId);
      if (element.props.link?.type === 'page') found.pageIds.add(element.props.link.pageId);
      add(found.fontFamilyIds, familyOf(element.props.captionTypography));
      return;
    case 'button':
      if (element.props.link.type === 'page') found.pageIds.add(element.props.link.pageId);
      return;
    case 'container':
    case 'icon':
    case 'divider':
      return;
    default: {
      const declared = contentElementContract(element.type)?.references;
      if (!declared) return scanUnknown(element.props, found);
      const ids = declared(element.props);
      ids.assetIds?.forEach((id) => found.assetIds.add(id));
      ids.pageIds?.forEach((id) => found.pageIds.add(id));
      ids.fontFamilyIds?.forEach((id) => found.fontFamilyIds.add(id));
    }
  }
}

/** Everything a content document refers to, nested elements included. */
export function contentReferences(doc: ContentDocument | undefined): ContentReferences {
  const found: ContentReferences = { assetIds: new Set(), pageIds: new Set(), fontFamilyIds: new Set() };
  for (const element of flattenContentElements(doc?.elements ?? [])) elementReferences(element, found);
  return found;
}
