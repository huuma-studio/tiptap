/**
 * Italic mark extension for the rich text editor.
 *
 * @module
 */

import Italic from "@tiptap/extension-italic";
import { jsx } from "@huuma/ui/jsx-runtime";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";
import ItalicIcon from "@huuma/icons/lucide/italic";

/** Tiptap italic mark with a toolbar toggle button. */
const ItalicExtension: EditorExtension<typeof Italic> = {
  extension: Italic,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("italic"),
      label: "Italic",
      "on-click": () => {
        editor.get?.chain().focus().toggleItalic().run();
      },
      children: jsx(ItalicIcon, { size: 18 }),
    });
  },
};

export default ItalicExtension;
