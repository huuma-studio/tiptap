import Italic from "@tiptap/extension-italic";
import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";
import ItalicIcon from "@huuma/icons/lucide/italic";

const ItalicExtension: EditorExtension<typeof Italic> = {
  extension: Italic,
  toolbarElement: (
    editor,
  ) => {
    return (
      <ToolBarButton
        active={editor.get?.isActive("italic")}
        on-click={() => {
          editor.get?.chain().focus().toggleItalic().run();
        }}
      >
        <ItalicIcon size={18} />
      </ToolBarButton>
    );
  },
};

export default ItalicExtension;
