import type { Props } from "@huuma/ui";

export function ToolBar({ children }: Props) {
  return (
    <ul class="rich-text-editor__toolbar">
      {Array.isArray(children)
        ? children.map((child, i) => <li key={i}>{child}</li>)
        : children}
    </ul>
  );
}

interface ToolBarButtonProps extends Props {
  active?: boolean;
  "on-click": () => void;
}
export function ToolBarButton(
  { children, active = false, "on-click": click }: ToolBarButtonProps,
) {
  return (
    <button
      type="button"
      class={`rich-text-editor__toolbar__button ${
        active ? "rich-text-editor__toolbar__button--active" : ""
      }`}
      on-click={click}
    >
      {children}
    </button>
  );
}
