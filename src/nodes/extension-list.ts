/**
 * List node extensions for the rich text editor.
 *
 * Exports {@linkcode BulletListExtension}, {@linkcode OrderedListExtension}
 * and {@linkcode ListItemExtension} individually. The default export is the
 * bullet list with its list item; add {@linkcode OrderedListExtension} for
 * numbered lists, and {@linkcode TaskListExtensions} for task lists
 * (`- [x] done` in Markdown):
 *
 * ```ts
 * import ListExtensions, {
 *   OrderedListExtension,
 *   TaskListExtensions,
 * } from "@huuma/tiptap/nodes/extension-list";
 *
 * const extensions = [...ListExtensions, OrderedListExtension, ...TaskListExtensions];
 * ```
 *
 * @module
 */

import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from "@tiptap/extension-list";
import { jsx } from "@huuma/ui/jsx-runtime";
import ListIcon from "@huuma/icons/lucide/list";
import ListOrderedIcon from "@huuma/icons/lucide/list-ordered";
import ListTodoIcon from "@huuma/icons/lucide/list-todo";

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

/**
 * Tiptap task list node (items with a checkbox) with a toolbar toggle
 * button. Needs {@linkcode TaskItemExtension}: use
 * {@linkcode TaskListExtensions} for both.
 */
export const TaskListExtension: EditorExtension<typeof TaskList> = {
  extension: TaskList,
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("taskList"),
      label: "Task list",
      "on-click": () => {
        editor.get?.chain().focus().toggleTaskList().run();
      },
      children: jsx(ListTodoIcon, { size: 18 }),
    });
  },
};

/** Tiptap task item node (required companion for {@linkcode TaskListExtension}); items may nest. */
export const TaskItemExtension: EditorExtension<typeof TaskItem> = {
  extension: TaskItem.configure({ nested: true }),
};

/** The task list with its task item. */
export const TaskListExtensions: [typeof TaskListExtension, typeof TaskItemExtension] = [
  TaskListExtension,
  TaskItemExtension,
];

export default [BulletListExtension, ListItemExtension];
