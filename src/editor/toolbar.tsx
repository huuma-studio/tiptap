import type { Props } from "@huuma/ui";

export function ToolBar({ children }: Props) {
  return (
    <ul class="flex gap-1 p-1">
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
      class={`btn btn-icon--sm ${
        active ? "bg-primary-100 text-primary-700" : ""
      }`}
      on-click={click}
    >
      {children}
    </button>
  );
}
