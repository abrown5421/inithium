import {
  createContentId,
  MAX_CONTENT_DEPTH,
  MAX_CONTENT_ELEMENTS,
  richTextFromPlainText,
  type ContainerElement,
  type ContentDocument,
  type ContentElement,
  type ContentElementType,
  type RichTextDocument,
} from '@inithium/shared-contracts';

/*
 * The page builder's operations on a content page's element tree (decision 0116). Each takes a document and returns
 * a new one (or the same one, when there's nothing to do), so undo and redo can keep every version.
 */

/** Where an element sits: its parent Container (null for the page itself), its place there, and its Containers from the page down. */
export type ElementLocation = { element: ContentElement; parent: ContainerElement | null; index: number; ancestors: ContainerElement[] };

/** A place for an element: inside a Container (null for the page itself), at an index among its children. */
export type InsertTarget = { parentId: string | null; index: number };

/** The elements inside an element: a Container's, or a plugin element's when it holds some. */
export const childrenOf = (element: ContentElement): ContentElement[] => ('children' in element && element.children) || [];

/** Whether elements can be put inside it. Only Containers, until a plugin element's contract says otherwise. */
export const holdsChildren = (element: ContentElement): element is ContainerElement => element.type === 'container';

export function findElement(doc: ContentDocument, id: string): ElementLocation | undefined {
  const search = (elements: ContentElement[], parent: ContainerElement | null, ancestors: ContainerElement[]): ElementLocation | undefined => {
    for (const [index, element] of elements.entries()) {
      if (element.id === id) return { element, parent, index, ancestors };
      const inner = childrenOf(element);
      if (inner.length) {
        const found = search(inner, holdsChildren(element) ? element : parent, holdsChildren(element) ? [...ancestors, element] : ancestors);
        if (found) return found;
      }
    }
    return undefined;
  };
  return search(doc.elements, null, []);
}

/** Every element, depth first, in the order the page shows them. */
export function allElements(elements: ContentElement[]): ContentElement[] {
  return elements.flatMap((element) => [element, ...allElements(childrenOf(element))]);
}

/** How many levels an element takes up: 1, plus the deepest of its children. */
export const levelsOf = (element: ContentElement): number => 1 + Math.max(0, ...childrenOf(element).map(levelsOf));

/** Applies `map` to every element's list of children, and to the page's, keeping untouched lists as they were. */
function mapLists(doc: ContentDocument, map: (elements: ContentElement[], parentId: string | null) => ContentElement[]): ContentDocument {
  const walk = (elements: ContentElement[], parentId: string | null): ContentElement[] => {
    const mapped = map(elements, parentId);
    let changed = mapped !== elements;
    const next = mapped.map((element) => {
      if (!('children' in element) || !element.children) return element;
      const children = walk(element.children, element.id);
      if (children === element.children) return element;
      changed = true;
      return { ...element, children } as ContentElement;
    });
    return changed ? next : elements;
  };
  const elements = walk(doc.elements, null);
  return elements === doc.elements ? doc : { ...doc, elements };
}

/** Replaces an element (found by its id) with an edited copy of itself. */
export function updateElement(doc: ContentDocument, element: ContentElement): ContentDocument {
  return mapLists(doc, (elements) => {
    const index = elements.findIndex((candidate) => candidate.id === element.id);
    if (index < 0) return elements;
    const next = [...elements];
    next[index] = element;
    return next;
  });
}

/** Removes an element and everything inside it. */
export function removeElement(doc: ContentDocument, id: string): ContentDocument {
  return mapLists(doc, (elements) => (elements.some((element) => element.id === id) ? elements.filter((element) => element.id !== id) : elements));
}

/** Puts an element in a place. A place that doesn't exist (or isn't a Container) leaves the document as it was. */
export function insertElement(doc: ContentDocument, element: ContentElement, target: InsertTarget): ContentDocument {
  if (target.parentId !== null) {
    const parent = findElement(doc, target.parentId)?.element;
    if (!parent || !holdsChildren(parent)) return doc;
  }
  return mapLists(doc, (elements, parentId) => {
    if (parentId !== target.parentId) return elements;
    const next = [...elements];
    next.splice(Math.max(0, Math.min(target.index, next.length)), 0, element);
    return next;
  });
}

/** Whether `id` is `ancestorId` or inside it. */
export function isWithin(doc: ContentDocument, id: string, ancestorId: string): boolean {
  if (id === ancestorId) return true;
  return Boolean(findElement(doc, id)?.ancestors.some((ancestor) => ancestor.id === ancestorId));
}

/**
 * Moves an element to a place, the index counted as if it were still where it is (as a drop indicator shows it).
 * An element can't move into itself or anything inside it.
 */
export function moveElement(doc: ContentDocument, id: string, target: InsertTarget): ContentDocument {
  const found = findElement(doc, id);
  if (!found) return doc;
  if (target.parentId !== null && isWithin(doc, target.parentId, id)) return doc;
  const sameParent = (found.parent?.id ?? null) === target.parentId;
  const index = sameParent && found.index < target.index ? target.index - 1 : target.index;
  if (sameParent && index === found.index) return doc;
  return insertElement(removeElement(doc, id), found.element, { parentId: target.parentId, index });
}

/** Moves an element one place up (-1) or down (1) among its siblings. */
export function moveElementBy(doc: ContentDocument, id: string, by: -1 | 1): ContentDocument {
  const found = findElement(doc, id);
  if (!found) return doc;
  const siblings = found.parent ? found.parent.children : doc.elements;
  const index = found.index + by;
  if (index < 0 || index >= siblings.length) return doc;
  return moveElement(doc, id, { parentId: found.parent?.id ?? null, index: by === 1 ? index + 1 : index });
}

/**
 * A copy of an element and everything inside it, with new ids. Anchors aren't copied: two elements can't share one.
 */
export function copyElement(element: ContentElement): ContentElement {
  const copy = { ...structuredClone(element), id: createContentId() } as ContentElement;
  if (copy.type === 'container') {
    delete copy.props.anchor;
    return { ...copy, children: copy.children.map(copyElement) };
  }
  if ('children' in copy && copy.children) return { ...copy, children: copy.children.map(copyElement) };
  return copy;
}

/**
 * Where a new or pasted element goes (decision 0116): inside the selected Container, at its end; otherwise just
 * after the selected element; otherwise at the end of the page.
 */
export function insertionTarget(doc: ContentDocument, selectedId: string | null): InsertTarget {
  const found = selectedId ? findElement(doc, selectedId) : undefined;
  if (!found) return { parentId: null, index: doc.elements.length };
  if (holdsChildren(found.element)) return { parentId: found.element.id, index: found.element.children.length };
  return { parentId: found.parent?.id ?? null, index: found.index + 1 };
}

/** Why an element can't go in a place without breaking the page's limits, or undefined when it can. */
export function limitProblem(doc: ContentDocument, element: ContentElement, target: InsertTarget, movingId?: string): string | undefined {
  const added = movingId ? 0 : allElements([element]).length;
  if (allElements(doc.elements).length + added > MAX_CONTENT_ELEMENTS) return `A page holds ${MAX_CONTENT_ELEMENTS} elements at most.`;
  const parentLevel = target.parentId === null ? 0 : (findElement(doc, target.parentId)?.ancestors.length ?? 0) + 1;
  if (parentLevel + levelsOf(element) > MAX_CONTENT_DEPTH) return `Elements nest ${MAX_CONTENT_DEPTH} deep at most.`;
  return undefined;
}

/** A new element of a type, ready to show (an image waits for one to be chosen). */
export function createElement(type: ContentElementType): ContentElement {
  const id = createContentId();
  switch (type) {
    case 'container':
      return { id, type, props: { flex: { direction: 'column', gap: 16 }, padding: { all: 16 } }, children: [] };
    case 'text':
      return { id, type, props: { doc: richTextFromPlainText('Write something here.') } };
    case 'image':
      return { id, type, props: { assetId: '' } };
    case 'icon':
      return { id, type, props: { name: 'star', size: 32 } };
    case 'button':
      return { id, type, props: { label: 'Find out more', link: { type: 'url', href: 'https://example.com' } } };
    case 'divider':
      return { id, type, props: {} };
  }
}

/** How the editor names each element type, with its icon and a line about it. */
export const ELEMENT_TYPES: Record<ContentElementType, { label: string; icon: string; description: string }> = {
  container: { label: 'Container', icon: 'square-dashed', description: 'Holds other elements in a stack, a row or a grid' },
  text: { label: 'Text', icon: 'type', description: 'Headings, paragraphs, lists and quotes' },
  image: { label: 'Image', icon: 'image', description: 'A picture from the Media library' },
  icon: { label: 'Icon', icon: 'star', description: 'A symbol, e.g. beside a feature' },
  button: { label: 'Button', icon: 'mouse-pointer-click', description: 'A link drawn as a button' },
  divider: { label: 'Divider', icon: 'minus', description: 'A line between things' },
};

/** The type's name and icon, for core elements and plugins' alike. */
export function elementType(element: ContentElement): { label: string; icon: string } {
  if (element.type in ELEMENT_TYPES) return ELEMENT_TYPES[element.type as ContentElementType];
  const [plugin = '', name = ''] = element.type.replace(/^plugin-/, '').split(':');
  return { label: `${name.replace(/-/g, ' ')} (${plugin})`, icon: 'puzzle' };
}

/** A rich text document's first words, for naming a Text. */
function firstWords(doc: RichTextDocument): string {
  for (const node of doc.content) {
    if ((node.type === 'paragraph' || node.type === 'heading') && node.content) {
      const text = node.content.map((part) => (part.type === 'text' ? part.text : ' ')).join('').trim();
      if (text) return text;
    }
  }
  return '';
}

/** What the Layers call an element: its label, or something from its content, or its type. */
export function elementName(element: ContentElement): string {
  if (element.label) return element.label;
  switch (element.type) {
    case 'text':
      return firstWords(element.props.doc) || 'Empty text';
    case 'image':
      return element.props.alt || element.props.caption || (element.props.assetId ? 'Image' : 'No image chosen');
    case 'icon':
      return `Icon: ${element.props.name}`;
    case 'button':
      return element.props.label;
    case 'divider':
      return element.props.label || 'Divider';
    default:
      return elementType(element).label;
  }
}

/** One row of the Layers: an element, how deep it is, and its parent (null for the page itself). */
export type LayerRow = { element: ContentElement; depth: number; parentId: string | null };

/** The Layers' rows, top to bottom, leaving out what's inside collapsed elements. */
export function layerRows(elements: ContentElement[], collapsed: ReadonlySet<string>, depth = 0, parentId: string | null = null): LayerRow[] {
  return elements.flatMap((element) => [
    { element, depth, parentId },
    ...(collapsed.has(element.id) ? [] : layerRows(childrenOf(element), collapsed, depth + 1, element.id)),
  ]);
}

/** The Containers an element could move into (and the page itself, as null), each with its depth, in page order. */
export function moveDestinations(doc: ContentDocument, id: string): { parentId: string | null; label: string; depth: number }[] {
  const destinations: { parentId: string | null; label: string; depth: number }[] = [{ parentId: null, label: 'The page', depth: 0 }];
  const walk = (elements: ContentElement[], depth: number) => {
    for (const element of elements) {
      if (element.id === id || !holdsChildren(element)) continue;
      destinations.push({ parentId: element.id, label: elementName(element), depth });
      walk(element.children, depth + 1);
    }
  };
  walk(doc.elements, 1);
  return destinations;
}

/** JSON with every object's keys sorted, so the same content always gives the same text whatever its key order. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}

/** Whether two content documents say the same thing (e.g. the draft and what's published). */
export const sameContent = (a: unknown, b: unknown) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
