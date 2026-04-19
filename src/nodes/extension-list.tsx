/**
 * List node extensions for the rich text editor.
 *
 * Exports {@linkcode BulletListExtension} and {@linkcode ListItemExtension}
 * individually, and a combined array as the default export.
 *
 * @module
 */

import { BulletList, ListItem } from "@tiptap/extension-list";
import ListIcon from "@huuma/icons/lucide/list";

import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";

/** Tiptap bullet list node with a toolbar toggle button. */
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

/** Tiptap list item node (required companion for {@linkcode BulletListExtension}). */
export const ListItemExtension: EditorExtension<typeof ListItem> = {
  extension: ListItem,
};

export default [BulletListExtension, ListItemExtension];
