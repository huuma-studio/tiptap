/**
 * The editor's toolbar and its buttons.
 *
 * @module
 */

import type { Props } from "@huuma/ui";
import { type JSX, jsx } from "@huuma/ui/jsx-runtime";

/** Props accepted by {@linkcode ToolBar}. */
export interface ToolBarProps extends Props {
  /** The toolbar's accessible name. Defaults to "Formatting". */
  label?: string;
}

/** The row of toolbar buttons above the editor. */
export function ToolBar({ children, label = "Formatting" }: ToolBarProps): JSX.Element {
  return jsx("ul", {
    class: "rich-text-editor__toolbar",
    role: "toolbar",
    "aria-label": label,
    children: Array.isArray(children)
      ? children.map((child, i) => !!child && jsx("li", { role: "none", children: child }, i))
      : children,
  });
}

/** Props accepted by {@linkcode ToolBarButton}. */
export interface ToolBarButtonProps extends Props {
  /** Whether the format is applied at the selection; shown as pressed. */
  active?: boolean;
  /** The button's accessible name and tooltip, e.g. "Bold (Ctrl+B)". */
  label?: string;
  /**
   * Whether the button toggles a format (and so reports `aria-pressed`).
   * Defaults to `true`; `false` for buttons that insert something.
   */
  toggle?: boolean;
  "on-click": () => void;
}

/**
 * A toolbar button. Pressing it doesn't take the focus or the selection from
 * the editor, so the command applies where the cursor is and the editor's
 * `on-blur` doesn't fire.
 */
export function ToolBarButton({
  children,
  active = false,
  label,
  toggle = true,
  "on-click": click,
}: ToolBarButtonProps): JSX.Element {
  return jsx("button", {
    type: "button",
    class: `rich-text-editor__toolbar__button ${
      active ? "rich-text-editor__toolbar__button--active" : ""
    }`,
    "aria-label": label,
    title: label,
    "aria-pressed": toggle ? String(active) : undefined,
    "on-mousedown": (event: MouseEvent) => event.preventDefault(),
    "on-click": click,
    children,
  });
}
