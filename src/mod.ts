import type { UIApp } from "@huuma/ui/server";
import { css } from "./util.ts";

const styles = css`
  .rich-text-editor {
    width: 100%;
    background-color: white;
    border: 1px solid var(--color-primary-100, #e5e7eb);
  }

  .rich-text-editor__toolbar {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
  }
  .rich-text-editor__toolbar__button {
    padding: 0.25rem;
    border: none;
    background-color: transparent;
    cursor: pointer;
    border-radius: 0.25rem;
    color: var(--color-primary-700, #1f2937);
    transition: all 0.3s ease-in-out;
  }
  .rich-text-editor__toolbar__button--active {
    background-color: var(--color-primary-100, #e5e7eb);
  }
  .rich-text-editor__toolbar__button--active:active {
    background-color: var(--color-primary-100, #e5e7eb);
    box-shadow: 0 0 0 3px var(--color-primary-200, #1f2937);
  }
  .rich-text-editor__toolbar__button--active:active {}
`;

// deno-lint-ignore no-explicit-any
export function registerTitap(app: UIApp<any>) {
  app.addStylesheet({
    entrypoint: true,
    name: "rich-text-editor",
    content: styles,
  });
}
