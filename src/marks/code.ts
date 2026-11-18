/**
 * Inline code mark extension for the rich text editor.
 *
 * @module
 */

import Code from "@tiptap/extension-code";
import { jsx } from "@huuma/ui/jsx-runtime";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";
import CodeIcon from "@huuma/icons/lucide/code";

/** Tiptap inline code mark with a toolbar toggle button. */
const CodeExtension: EditorExtension<typeof Code> = {
  extension: Code,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("code"),
      label: "Inline code",
      "on-click": () => {
        editor.get?.chain().focus().toggleCode().run();
      },
      children: jsx(CodeIcon, { size: 18 }),
    });
  },
};

export default CodeExtension;
