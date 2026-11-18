/**
 * Strikethrough mark extension for the rich text editor.
 *
 * @module
 */

import Strike from "@tiptap/extension-strike";
import { jsx } from "@huuma/ui/jsx-runtime";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";
import StrikethroughIcon from "@huuma/icons/lucide/strikethrough";

/** Tiptap strikethrough mark with a toolbar toggle button. */
const StrikeExtension: EditorExtension<typeof Strike> = {
  extension: Strike,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("strike"),
      label: "Strikethrough",
      "on-click": () => {
        editor.get?.chain().focus().toggleStrike().run();
      },
      children: jsx(StrikethroughIcon, { size: 18 }),
    });
  },
};

export default StrikeExtension;
