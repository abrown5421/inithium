import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Shiki with only the languages the manual uses, and the JavaScript regex engine (no WebAssembly).

export const CODE_THEME = 'github-dark-default';

const languageAliases: Record<string, string> = {
  ts: 'typescript',
  js: 'typescript',
  jsx: 'tsx',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
};

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [import('@shikijs/themes/github-dark-default')],
    langs: [
      import('@shikijs/langs/tsx'),
      import('@shikijs/langs/typescript'),
      import('@shikijs/langs/bash'),
      import('@shikijs/langs/css'),
      import('@shikijs/langs/html'),
      import('@shikijs/langs/json'),
      import('@shikijs/langs/yaml'),
      import('@shikijs/langs/markdown'),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Highlighted HTML for a code block; unknown languages are shown as plain text. */
export async function highlight(code: string, language: string | undefined): Promise<string> {
  const instance = await getHighlighter();
  const lang = languageAliases[language ?? ''] ?? language ?? 'text';
  const loaded = instance.getLoadedLanguages().includes(lang);
  return instance.codeToHtml(code, { lang: loaded ? lang : 'text', theme: CODE_THEME });
}
