/**
 * List node extensions for the rich text editor.
 *
 * Exports {@linkcode BulletListExtension}, {@linkcode OrderedListExtension}
 * and {@linkcode ListItemExtension} individually. The default export is the
 * bullet list with its list item; add {@linkcode OrderedListExtension} for
 * numbered lists:
 *
 * ```ts
 * import ListExtensions, { OrderedListExtension } from "@huuma/tiptap/nodes/extension-list";
 *
 * const extensions = [...ListExtensions, OrderedListExtension];
 * ```
 *
 * @module
 */

import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import { jsx } from "@huuma/ui/jsx-runtime";
import ListIcon from "@huuma/icons/lucide/list";
import ListOrderedIcon from "@huuma/icons/lucide/list-ordered";

import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";

/** Tiptap bullet list node with a toolbar toggle button. */
export const BulletListExtension: EditorExtension<typeof BulletList> = {
  extension: BulletList,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("bulletList"),
      label: "Bullet list",
      "on-click": () => {
        editor.get?.chain().focus().toggleBulletList().run();
      },
      children: jsx(ListIcon, { size: 18 }),
    });
  },
};

/**
 * Tiptap ordered (numbered) list node with a toolbar toggle button. Needs
 * {@linkcode ListItemExtension}, which the default export includes.
 */
export const OrderedListExtension: EditorExtension<typeof OrderedList> = {
  extension: OrderedList,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("orderedList"),
      label: "Numbered list",
      "on-click": () => {
        editor.get?.chain().focus().toggleOrderedList().run();
      },
      children: jsx(ListOrderedIcon, { size: 18 }),
    });
  },
};

/** Tiptap list item node (required companion for the list extensions). */
export const ListItemExtension: EditorExtension<typeof ListItem> = {
  extension: ListItem,
};

export default [BulletListExtension, ListItemExtension];
