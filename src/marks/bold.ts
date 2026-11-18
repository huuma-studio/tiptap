/**
 * Bold mark extension for the rich text editor.
 *
 * @module
 */

import Bold from "@tiptap/extension-bold";
import { jsx } from "@huuma/ui/jsx-runtime";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";
import BoldIcon from "@huuma/icons/lucide/bold";

/** Tiptap bold mark with a toolbar toggle button. */
const BoldExtension: EditorExtension<typeof Bold> = {
  extension: Bold,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("bold"),
      label: "Bold",
      "on-click": () => {
        editor.get?.chain().focus().toggleBold().run();
      },
      children: jsx(BoldIcon, { size: 18 }),
    });
  },
};

export default BoldExtension;
