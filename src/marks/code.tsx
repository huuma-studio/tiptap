/**
 * Inline code mark extension for the rich text editor.
 *
 * @module
 */

import Code from "@tiptap/extension-code";
import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";
import CodeIcon from "@huuma/icons/lucide/code";

/** Tiptap inline code mark with a toolbar toggle button. */
const CodeExtension: EditorExtension<typeof Code> = {
  extension: Code,
  toolbarElement: (
    editor,
  ) => {
    return (
      <ToolBarButton
        active={editor.get?.isActive("code")}
        on-click={() => {
          editor.get?.chain().focus().toggleCode().run();
        }}
      >
        <CodeIcon size={18} />
      </ToolBarButton>
    );
  },
};

export default CodeExtension;