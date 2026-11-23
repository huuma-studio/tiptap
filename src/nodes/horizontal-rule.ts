/**
 * Horizontal rule node extension for the rich text editor: a dividing line
 * (`---` in Markdown).
 *
 * @module
 */

import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { jsx } from "@huuma/ui/jsx-runtime";
import SeparatorHorizontalIcon from "@huuma/icons/lucide/separator-horizontal";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";

/** Tiptap horizontal rule node with a toolbar button to insert one. */
const HorizontalRuleExtension: EditorExtension<typeof HorizontalRule> = {
  extension: HorizontalRule,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      label: "Divider",
      toggle: false,
      "on-click": () => {
        editor.get?.chain().focus().setHorizontalRule().run();
      },
      children: jsx(SeparatorHorizontalIcon, { size: 18 }),
    });
  },
};

export default HorizontalRuleExtension;
