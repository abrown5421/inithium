import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type PreviewFrameProps = {
  /** Its width in px, or 'full' for the space it's given. */
  width: number | 'full';
  /** Names the frame for screen readers. */
  title: string;
  children: ReactNode;
};

const isStylesheet = (node: Node): node is HTMLStyleElement | HTMLLinkElement =>
  node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && node.rel === 'stylesheet');

/** The stylesheets in a node and below it. */
function stylesheetsIn(node: Node): (HTMLStyleElement | HTMLLinkElement)[] {
  if (isStylesheet(node)) return [node];
  return node instanceof Element ? Array.from(node.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel="stylesheet"]')) : [];
}

/**
 * The editor's preview (decision 0093): an iframe the content renders into through a portal, so its breakpoints
 * follow the frame's width (phone, tablet, desktop) rather than the window's. Every stylesheet in the CMS's page,
 * in its head or its body (UiProvider's style-prop sheet and the theme render in the body), is mirrored into the
 * frame's head, including ones added, changed or removed later. A plain <iframe>: no component renders one
 * (decision 0092).
 */
export function PreviewFrame({ width, title, children }: PreviewFrameProps) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  // Without a src the frame keeps its first, empty document (same origin), so its body is there as soon as it mounts.
  const body = frame?.contentDocument?.body ?? null;

  useEffect(() => {
    const frameDocument = frame?.contentDocument;
    if (!frame || !frameDocument) return;
    const head = frameDocument.head;
    const copies = new Map<Node, Node>();
    const add = (sheet: HTMLStyleElement | HTMLLinkElement) => {
      if (copies.has(sheet)) return;
      const copy = sheet.cloneNode(true);
      copies.set(sheet, copy);
      head.append(copy);
    };
    stylesheetsIn(document.documentElement).forEach(add);

    // The theme's variables and dark mode can live on the CMS's <html>; carry its attributes across.
    const syncRoot = () => {
      for (const { name, value } of Array.from(document.documentElement.attributes)) frameDocument.documentElement.setAttribute(name, value);
    };
    syncRoot();

    const rootObserver = new MutationObserver(syncRoot);
    rootObserver.observe(document.documentElement, { attributes: true });

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => stylesheetsIn(node).forEach(add));
        record.removedNodes.forEach((node) =>
          stylesheetsIn(node).forEach((sheet) => {
            (copies.get(sheet) as ChildNode | undefined)?.remove();
            copies.delete(sheet);
          }),
        );
        // A <style> whose text changed (e.g. the theme): refresh its copy.
        const changed = record.target instanceof HTMLStyleElement ? record.target : record.target.parentNode;
        if (changed instanceof HTMLStyleElement && copies.has(changed)) {
          (copies.get(changed) as HTMLStyleElement).textContent = changed.textContent;
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

    frameDocument.body.setAttribute('style', 'margin: 0');
    return () => {
      observer.disconnect();
      rootObserver.disconnect();
    };
  }, [frame]);

  return (
    <iframe
      ref={setFrame}
      title={title}
      style={{
        display: 'block',
        width: width === 'full' ? '100%' : `${width}px`,
        maxWidth: '100%',
        height: '100%',
        border: 0,
        background: 'var(--color-surface-50)',
        transition: 'width 200ms',
      }}
    >
      {body && createPortal(children, body)}
    </iframe>
  );
}
