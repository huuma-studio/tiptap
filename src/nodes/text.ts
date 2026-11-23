/**
 * Core text nodes for the rich text editor.
 *
 * Bundles the Document, Paragraph, and Text Tiptap extensions which are
 * required for any editor instance (the default export). Also exports
 * {@linkcode HardBreakExtension} for line breaks within a paragraph
 * (Shift+Enter; a trailing backslash or two spaces in Markdown).
 *
 * @module
 */

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import HardBreak from "@tiptap/extension-hard-break";

import type { EditorExtension } from "../editor/mod.ts";

const DocumentExtension: EditorExtension<typeof Document> = {
  extension: Document,
};

const ParagraphExtension: EditorExtension<typeof Paragraph> = {
  extension: Paragraph,
};

const TextExtension: EditorExtension<typeof Text> = {
  extension: Text,
};

/** Tiptap hard break node: a line break within a paragraph. */
export const HardBreakExtension: EditorExtension<typeof HardBreak> = {
  extension: HardBreak,
};

export default [DocumentExtension, ParagraphExtension, TextExtension];
