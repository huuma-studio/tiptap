/**
 * Blockquote node extension for the rich text editor.
 *
 * @module
 */

import Blockquote from "@tiptap/extension-blockquote";
import { jsx } from "@huuma/ui/jsx-runtime";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";
import TextQuoteIcon from "@huuma/icons/lucide/text-quote";

/** Tiptap blockquote node with a toolbar toggle button. */
const BlockquoteExtension: EditorExtension<typeof Blockquote> = {
  extension: Blockquote,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("blockquote"),
      label: "Quote",
      "on-click": () => {
        editor.get?.chain().focus().toggleBlockquote().run();
      },
      children: jsx(TextQuoteIcon, { size: 18 }),
    });
  },
};

export default BlockquoteExtension;
