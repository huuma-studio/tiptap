/**
 * Code block node extension for the rich text editor.
 *
 * @module
 */

import CodeBlock from "@tiptap/extension-code-block";
import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";
import CodeXmlIcon from "@huuma/icons/lucide/code-xml";

/** Tiptap code block node with a toolbar toggle button. */
const CodeBlockExtension: EditorExtension<typeof CodeBlock> = {
  extension: CodeBlock,
  toolbarElement: (
    editor,
  ) => {
    return (
      <ToolBarButton
        active={editor.get?.isActive("codeBlock")}
        on-click={() => {
          editor.get?.chain().focus().toggleCodeBlock().run();
        }}
      >
        <CodeXmlIcon size={18} />
      </ToolBarButton>
    );
  },
};

export default CodeBlockExtension;