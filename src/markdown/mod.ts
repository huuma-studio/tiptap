/**
 * Markdown extension for the rich text editor.
 *
 * Enables Markdown as the content format so the editor accepts and produces
 * Markdown instead of HTML.
 *
 * @module
 */

import { Markdown } from "@tiptap/markdown";
import type { EditorExtension } from "../editor/mod.tsx";

/** Tiptap Markdown extension that sets `contentType` to `"markdown"`. */
const MarkdownExtension: EditorExtension<typeof Markdown> = {
  extension: Markdown,
  initOptions: {
    contentType: "markdown",
  },
};

export default MarkdownExtension;
