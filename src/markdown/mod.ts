/**
 * Markdown extension for the rich text editor.
 *
 * Enables Markdown as the content format so the editor accepts and produces
 * Markdown instead of HTML.
 *
 * @module
 */

import { Markdown } from "@tiptap/markdown";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Node as ProseMirrorNode, Slice } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/core";
import type { EditorExtension } from "../editor/mod.tsx";

/**
 * Creates a paste plugin that parses plain-text clipboard content as Markdown
 * when the editor is configured with `contentType: "markdown"`.
 *
 * Without this plugin, pasted Markdown source is inserted as plain text and
 * Tiptap's Markdown input rules do not run for pasted content. The plugin
 * intercepts text-only pastes, converts them to a ProseMirror document via the
 * editor's Markdown manager, and replaces the selection with the result.
 */
function createMarkdownPastePlugin(editor: Editor) {
  return new Plugin({
    key: new PluginKey("markdownPaste"),
    props: {
      handlePaste(view, event) {
        if (editor.options.contentType !== "markdown" || !editor.markdown) {
          return false;
        }

        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        // Only intercept plain-text pastes. If the clipboard contains HTML,
        // leave it to Tiptap's default HTML parser so rendered content is kept.
        if (!text || html) {
          return false;
        }

        let node: ProseMirrorNode;
        try {
          const json = editor.markdown.parse(text);
          node = ProseMirrorNode.fromJSON(view.state.schema, json);
        } catch {
          return false;
        }

        const slice = new Slice(node.content, 0, 0);

        view.dispatch(view.state.tr.replaceSelection(slice));
        return true;
      },
    },
  });
}

/** Markdown extension that also parses pasted plain text as Markdown. */
const MarkdownWithPaste: typeof Markdown = Markdown.extend({
  addProseMirrorPlugins() {
    return [createMarkdownPastePlugin(this.editor)];
  },
});

/** Tiptap Markdown extension that sets `contentType` to `"markdown"`. */
const MarkdownExtension: EditorExtension<typeof MarkdownWithPaste> = {
  extension: MarkdownWithPaste,
  initOptions: {
    contentType: "markdown",
  },
};

export default MarkdownExtension;
