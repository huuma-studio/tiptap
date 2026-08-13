/**
 * Table node extensions for the rich text editor.
 *
 * Exports {@linkcode TableExtension}, {@linkcode TableRowExtension},
 * {@linkcode TableCellExtension}, and {@linkcode TableHeaderExtension}
 * individually, and a combined array as the default export.
 *
 * @module
 */

import { Table } from "@tiptap/extension-table/table";
import { TableRow } from "@tiptap/extension-table/row";
import { TableCell } from "@tiptap/extension-table/cell";
import { TableHeader } from "@tiptap/extension-table/header";
import TableIcon from "@huuma/icons/lucide/table";

import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";

/** Tiptap table node with a toolbar button to insert a table. */
export const TableExtension: EditorExtension<typeof Table> = {
  extension: Table,
  toolbarElement: (editor) => {
    return (
      <ToolBarButton
        active={editor.get?.isActive("table")}
        on-click={() => {
          editor.get?.chain().focus().insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: true,
          }).run();
        }}
      >
        <TableIcon size={18} />
      </ToolBarButton>
    );
  },
};

/** Tiptap table row node (required companion for {@linkcode TableExtension}). */
export const TableRowExtension: EditorExtension<typeof TableRow> = {
  extension: TableRow,
};

/** Tiptap table cell node (required companion for {@linkcode TableExtension}). */
export const TableCellExtension: EditorExtension<typeof TableCell> = {
  extension: TableCell,
};

/** Tiptap table header node (required companion for {@linkcode TableExtension}). */
export const TableHeaderExtension: EditorExtension<typeof TableHeader> = {
  extension: TableHeader,
};

export default [
  TableExtension,
  TableRowExtension,
  TableCellExtension,
  TableHeaderExtension,
];