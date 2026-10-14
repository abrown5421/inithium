---
id: "0102"
title: Edit multi-line text with TipTap rich text fields, stored as JSON
status: accepted
date: "2026-10-14"
scope: core
tags: [ui, rich-text, forms, security, profiles]
related: ["0090", "0092", "0093"]
supersedes: []
---

# 0102. Edit multi-line text with TipTap rich text fields, stored as JSON

## Context

The UI library had no multi-line field, and the bio was a single-line Input. Bios, blog post bodies, product descriptions and other longer text all need one, in the CMS and on the site. The user asked for every such field to be a WYSIWYG editor built on TipTap, and asked whether a battle-tested library would take care of sanitising.

TipTap only works in the browser. Whatever it produces reaches the api as data, and anyone can send the api content that never went through the editor. Stored HTML or Markdown would therefore need sanitising on the server, however good the editor is. Page content already avoids this: it stores TipTap's JSON limited by a contract and draws it with the UI library's components, never as HTML ([0093](0093-build-content-pages-from-sections-columns-and-blocks.md)).

## Decision

- **Multi-line text is edited with `RichTextField`**, a UI library composite built on TipTap: an outlined box like Input's, a toolbar for the allowed formatting, and TipTap's character count enforcing `maxLength` as you type.
- **It saves Inithium's rich text document (JSON), never HTML or Markdown**, and `RichTextView` (also a composite) draws it with Text and Container. Page content's `RichText` is now `RichTextView` with the site's page links.
- **Each field chooses its formatting** from bold, italic, underline, link, heading, bulleted and numbered lists, and quote. TipTap's schema then only knows those, so pasted formatting outside them is dropped.
- **The api enforces the same rules** with `restrictedRichTextSchema({ features, maxLength, urlLinksOnly })`. Length counts visible characters, each line break counting as one, matching TipTap's count.
- **Bios** are rich text with bold, italic and web-address links, up to 280 characters (`bioSchema`). Older plain-text bios are read as paragraphs. A bio with no text is removed.
- If a plugin needs HTML or Markdown (e.g. for an email), it converts from the JSON.

## Alternatives considered

- **Storing TipTap's HTML output, sanitised on the server**: rejected; it puts every site's safety on the sanitiser, and the JSON approach was already proven by page content.
- **Storing Markdown**: rejected for the same reason, with no gain over JSON.
- **A plain `<textarea>`**: rejected by the user in favour of WYSIWYG.

## Consequences

- Plugins store rich text as `RichTextDocument` and validate it with `restrictedRichTextSchema`. They never render it as HTML.
- The converters between Inithium's document and TipTap's now live in the UI library, shared by the page editor and the field.
- Search or previews need the text out of the JSON: `richTextLength()` and the document's text runs give it.
