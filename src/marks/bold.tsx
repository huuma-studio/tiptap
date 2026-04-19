/**
 * Bold mark extension for the rich text editor.
 *
 * @module
 */

import Bold from "@tiptap/extension-bold";
import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";
import BoldIcon from "@huuma/icons/lucide/bold";

/** Tiptap bold mark with a toolbar toggle button. */
const BoldExtension: EditorExtension<typeof Bold> = {
  extension: Bold,
  toolbarElement: (
    editor,
  ) => {
    return (
      <ToolBarButton
        active={editor.get?.isActive("bold")}
        on-click={() => {
          editor.get?.chain().focus().toggleBold().run();
        }}
      >
        <BoldIcon size={18} />
      </ToolBarButton>
    );
  },
};

export default BoldExtension;
