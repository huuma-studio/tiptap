import { BulletList, ListItem } from "@tiptap/extension-list";
import ListIcon from "@huuma/icons/lucide/list";

import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";

export const BulletListExtension: EditorExtension<typeof BulletList> = {
  extension: BulletList,
  toolbarElement: (editor) => {
    return (
      <ToolBarButton
        active={editor.get?.isActive("bulletList")}
        on-click={() => {
          editor.get?.chain().focus().toggleBulletList()
            .run();
        }}
      >
        <ListIcon size={18} />
      </ToolBarButton>
    );
  },
};

export const ListItemExtension: EditorExtension<typeof ListItem> = {
  extension: ListItem,
};

export default [BulletListExtension, ListItemExtension];
