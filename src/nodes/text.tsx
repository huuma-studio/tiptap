/**
 * Core text nodes for the rich text editor.
 *
 * Bundles the Document, Paragraph, and Text Tiptap extensions which are
 * required for any editor instance.
 *
 * @module
 */

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

import type { EditorExtension } from "../editor/mod.tsx";

const DocumentExtension: EditorExtension<typeof Document> = {
  extension: Document,
};

const ParagraphExtension: EditorExtension<typeof Paragraph> = {
  extension: Paragraph,
};

const TextExtension: EditorExtension<typeof Text> = {
  extension: Text,
};

export default [DocumentExtension, ParagraphExtension, TextExtension];
