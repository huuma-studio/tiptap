/**
 * Code block node extension for the rich text editor.
 *
 * @module
 */

import CodeBlock from "@tiptap/extension-code-block";
import { jsx } from "@huuma/ui/jsx-runtime";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";
import CodeXmlIcon from "@huuma/icons/lucide/code-xml";

/** Tiptap code block node with a toolbar toggle button. */
const CodeBlockExtension: EditorExtension<typeof CodeBlock> = {
  extension: CodeBlock,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("codeBlock"),
      label: "Code block",
      "on-click": () => {
        editor.get?.chain().focus().toggleCodeBlock().run();
      },
      children: jsx(CodeXmlIcon, { size: 18 }),
    });
  },
};

export default CodeBlockExtension;
