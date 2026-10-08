import GithubSlugger from 'github-slugger';
import { parse as parseYaml } from 'yaml';

// Loads the manual (the Inithium repo's docs/ folder, decision 0052) at build time and derives the sidebar,
// reading order, headings, links and search index from it.

const sources = import.meta.glob(
  [
    '../../../../../../docs/**/*.md',
    '!../../../../../../docs/decisions/**',
    '!../../../../../../docs/templates/**',
    '!../../../../../../docs/node_modules/**',
    '!../../../../../../docs/README.md',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

export interface ManualPage {
  /** Route path without a leading slash, e.g. 'ui-library/components/container'. Section index pages use the folder. */
  slug: string;
  /** Path inside docs/, e.g. 'ui-library/components/container.md'. */
  file: string;
  title: string;
  description: string;
  order: number;
  isIndex: boolean;
  body: string;
  /** Heading ids by the heading's line number in body, as GitHub would generate them. */
  headingIds: Map<number, string>;
  headings: { depth: number; text: string; id: string }[];
}

export interface NavNode {
  page: ManualPage;
  children: NavNode[];
}

const PREFIX = '../../../../../../docs/';

/** Plain text of a Markdown heading: drops code ticks, emphasis and link targets. */
export function plainHeading(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .trim();
}

function toPage(path: string, raw: string): ManualPage | null {
  const text = raw.replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return null;
  const data = (parseYaml(match[1]) ?? {}) as { title?: string; description?: string; order?: number };
  const file = path.slice(PREFIX.length);
  const isIndex = file.endsWith('/index.md');
  const slug = isIndex ? file.slice(0, -'/index.md'.length) : file.slice(0, -'.md'.length);
  const body = text.slice(match[0].length);

  const slugger = new GithubSlugger();
  const headingIds = new Map<number, string>();
  const headings: ManualPage['headings'] = [];
  let inFence = false;
  body.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) inFence = !inFence;
    const heading = !inFence && /^(#{1,6})\s+(.*)$/.exec(line);
    if (!heading) return;
    const plain = plainHeading(heading[2]);
    const id = slugger.slug(plain);
    headingIds.set(index + 1, id);
    headings.push({ depth: heading[1].length, text: plain, id });
  });

  return {
    slug,
    file,
    title: data.title ?? slug,
    description: data.description ?? '',
    order: data.order ?? 0,
    isIndex,
    body,
    headingIds,
    headings,
  };
}

export const pages: ManualPage[] = Object.entries(sources)
  .map(([path, raw]) => toPage(path, raw))
  .filter((page): page is ManualPage => page !== null);

const bySlug = new Map(pages.map((page) => [page.slug, page]));
const byFile = new Map(pages.map((page) => [page.file, page]));

export const findPage = (slug: string) => bySlug.get(slug.replace(/^\/+|\/+$/g, ''));

const byOrder = (a: NavNode, b: NavNode) => a.page.order - b.page.order;
const folderOf = (page: ManualPage) => (page.isIndex ? page.slug : page.slug.split('/').slice(0, -1).join('/'));
const parentFolderOf = (page: ManualPage) => page.slug.split('/').slice(0, -1).join('/');

/** Sections (index pages) contain their folder's pages and their sub-sections, in `order`. */
function buildNode(page: ManualPage): NavNode {
  const folder = folderOf(page);
  const children = pages
    .filter((child) => child !== page && parentFolderOf(child) === folder)
    .map((child) => (child.isIndex ? buildNode(child) : { page: child, children: [] }))
    .sort(byOrder);
  return { page, children };
}

/** The sidebar: top-level sections in order. */
export const navigation: NavNode[] = pages
  .filter((page) => page.isIndex && !page.slug.includes('/'))
  .map(buildNode)
  .sort(byOrder);

/** Every page in sidebar order, for previous/next links. */
export const readingOrder: ManualPage[] = (() => {
  const result: ManualPage[] = [];
  const walk = (node: NavNode) => {
    result.push(node.page);
    node.children.forEach(walk);
  };
  navigation.forEach(walk);
  return result;
})();

/** The trail of section titles leading to a page (for breadcrumbs). */
export function sectionTrail(page: ManualPage): ManualPage[] {
  const parts = page.slug.split('/');
  const trail: ManualPage[] = [];
  for (let i = 1; i < parts.length; i++) {
    const section = bySlug.get(parts.slice(0, i).join('/'));
    if (section) trail.push(section);
  }
  return trail;
}

// --- links ---

/** Opens a file in VS Code. The app is local-only, so __MANUAL_DIR__ is the developer's own checkout. */
export const vscodeLink = (pathInDocs: string) => `vscode://file/${__MANUAL_DIR__}/${pathInDocs}`;

function normalise(path: string): string {
  const out: string[] = [];
  for (const part of path.split('/')) {
    if (part === '..') out.pop();
    else if (part && part !== '.') out.push(part);
  }
  return out.join('/');
}

export type ResolvedLink =
  | { kind: 'page'; to: string }
  | { kind: 'anchor'; to: string }
  | { kind: 'external'; to: string }
  | { kind: 'editor'; to: string };

/**
 * Resolves a link written in a page's Markdown: manual pages become routes; decision records and any other file
 * in the repo open in VS Code; absolute URLs stay external.
 */
export function resolveLink(fromFile: string, href: string): ResolvedLink {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return { kind: 'external', to: href };
  if (href.startsWith('#')) return { kind: 'anchor', to: href };

  const [path, anchor] = href.split('#');
  const base = fromFile.split('/').slice(0, -1).join('/');
  const target = normalise(`${base}/${decodeURIComponent(path)}`);
  const hash = anchor ? `#${anchor}` : '';
  const page = byFile.get(target) ?? byFile.get(`${target}/index.md`);
  if (page) return { kind: 'page', to: `/${page.slug}${hash}` };
  return { kind: 'editor', to: vscodeLink(target) };
}

// --- search ---

interface SearchEntry {
  page: ManualPage;
  title: string;
  headings: string;
  text: string;
}

const searchIndex: SearchEntry[] = pages.map((page) => ({
  page,
  title: page.title.toLowerCase(),
  headings: page.headings.map((heading) => heading.text).join(' ').toLowerCase(),
  text: `${page.description}\n${page.body}`
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|[\]()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase(),
}));

export interface SearchResult {
  page: ManualPage;
  /** The best-matching heading's id, to jump straight to it. */
  anchor?: string;
  snippet: string;
}

/** Pages containing every word of the query, best matches first (title, then headings, then text). */
export function searchManual(query: string, limit = 12): SearchResult[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  return searchIndex
    .flatMap((entry) => {
      const haystack = `${entry.title} ${entry.headings} ${entry.text}`;
      if (!words.every((word) => haystack.includes(word))) return [];
      const score = words.reduce(
        (sum, word) =>
          sum + (entry.title.includes(word) ? 10 : 0) + (entry.headings.includes(word) ? 4 : 0) + (entry.text.includes(word) ? 1 : 0),
        0,
      );
      const heading = entry.page.headings.find((h) => words.some((word) => h.text.toLowerCase().includes(word)));
      const at = entry.text.indexOf(words[0]);
      const snippet = at >= 0 ? `…${entry.text.slice(Math.max(0, at - 40), at + 80)}…` : entry.page.description;
      return [{ result: { page: entry.page, anchor: heading?.id, snippet } as SearchResult, score }];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((match) => match.result);
}
