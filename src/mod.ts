/**
 * Core module for the `@huuma/tiptap` rich text editor package.
 *
 * Provides {@linkcode registerTiptap} to register the editor's global stylesheet
 * with a `@huuma/ui` application.
 *
 * @module
 */

import type { UIApp, UIAppContext } from "@huuma/ui/server";
import { css } from "./util.ts";

const styles = css`
  .rich-text-editor {
    width: 100%;
    background-color: var(--rich-text-editor-bg-color, white);
    border: var(--rich-text-editor-border, 1px solid var(--color-primary-100, rgb(0 0 0 / 0.1)));
    border-radius: var(--rich-text-editor-radius, 0.25rem);
  }

  /* Opt-in dark mode via the Tailwind class convention: only apps that toggle
     a "dark" class on an ancestor match. :where adds no specificity, so
     app-level overrides always win regardless of stylesheet order. */
  .rich-text-editor:where(.dark, .dark *) {
    background-color: var(--rich-text-editor-bg-color, rgb(20 24 29));
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
    transition-property: background-color, box-shadow;
    transition-duration: var(--default-transition-duration, 0.3s);
  }

  .rich-text-editor__toolbar__button--active {
    background-color: var(--color-primary-100, rgb(0 0 0 / 0.1));
  }

  .rich-text-editor__toolbar__button:active {
    box-shadow: 0 0 0 3px var(--color-primary-200, rgb(0 0 0 / 0.2));
  }

  .rich-text-editor__toolbar__button:focus-visible {
    outline: 2px solid var(--color-primary-400, rgb(0 0 0 / 0.4));
    outline-offset: 1px;
  }

  .tiptap {
    padding: var(--rich-text-editor-padding, 0.5rem);
    font-size: var(--text-base, 1rem);
  }

  /* The text, in the editor and rendered read-only (RichTextEditor without
     editable). The read-only element takes its size from where it's placed. */
  :is(.tiptap, .rich-text-content) {
    p,
    ul,
    ol,
    blockquote,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      &:first-child {
        margin-top: 0;
      }
    }

    > :last-child {
      margin-bottom: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-weight: bold;
    }

    h1,
    h2,
    h3 {
      margin-top: 1rem;
      margin-bottom: 0.75rem;
    }

    h1 {
      font-size: var(--text-2xl, 1.5rem);
      line-height: var(--text-2xl--line-height, calc(1.75 / 1.5));
    }

    h2 {
      font-size: var(--text-xl, 1.25rem);
      line-height: var(--text-xl--line-height, calc(1.75 / 1.25));
    }

    h3 {
      font-size: var(--text-lg, 1.125rem);
      line-height: var(--text-lg--line-height, calc(1.75 / 1.125));
    }

    p,
    ul,
    ol,
    blockquote,
    h4,
    h5,
    h6 {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }

    ul {
      list-style-type: disc;
      padding-left: 1.25rem;
    }

    ol {
      list-style-type: decimal;
      padding-left: 1.5rem;
    }

    blockquote {
      border-left: 3px solid var(--color-primary-200, rgb(0 0 0 / 0.2));
      padding-left: 0.75rem;
      color: var(--color-primary-700, inherit);
    }

    s {
      text-decoration: line-through;
    }

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
      color: var(--rich-text-editor-placeholder-color, rgb(0 0 0 / 0.4));
    }

    a {
      text-decoration: underline;
    }

    code {
      font-family: var(--font-mono, ui-monospace, monospace);
      background-color: var(--color-primary-100, rgb(0 0 0 / 0.07));
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
    }

    pre {
      font-family: var(--font-mono, ui-monospace, monospace);
      background-color: var(--color-primary-200, rgb(0 0 0 / 0.9));
      padding: 0.75rem;
      border-radius: 0.25rem;
      overflow-x: auto;

      code {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
      }
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }

    th,
    td {
      border: 1px solid var(--color-primary-100, rgb(0 0 0 / 0.1));
      padding: 0.375rem 0.5rem;
      vertical-align: top;
    }

    th {
      font-weight: bold;
      background-color: color-mix(
        in srgb,
        var(--color-primary-100, rgb(0 0 0 / 0.1)) 40%,
        transparent
      );
    }

    td {
      font-weight: normal;
    }

    /* Tiptap wraps the text of cells and list items in paragraphs. */
    :is(th, td) > p {
      margin: 0;
    }

    li > p {
      margin-top: 0.125rem;
      margin-bottom: 0.125rem;
    }

    hr {
      border: none;
      border-top: 1px solid var(--color-primary-100, rgb(0 0 0 / 0.1));
      margin: 1rem 0;
    }

    ul[data-type="taskList"] {
      list-style: none;
      padding-left: 0.25rem;

      ul[data-type="taskList"] {
        padding-left: 1.25rem;
      }
    }

    li[data-type="taskItem"] {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;

      > label {
        flex-shrink: 0;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
        min-width: 0;

        > p {
          margin: 0;
        }
      }
    }

    li[data-checked="true"] > div {
      color: var(--color-primary-700, rgb(0 0 0 / 0.6));
    }
  }

  /* Read-only: its checkboxes are disabled (RichTextEditor), but show as
     they are; no layout of its own (e.g. table widths). */
  .rich-text-content {
    overflow-wrap: anywhere;

    input[type="checkbox"]:disabled {
      opacity: 1;
    }

    /* Not focusable (RichTextEditor's focusable={false}): a wide code block
       doesn't scroll, which would make it a stop for the Tab key. */
    &.rich-text-content--unfocusable pre {
      overflow: hidden;
    }

    table {
      table-layout: auto;
    }
  }

  .rich-text-editor:where(.dark, .dark *) .tiptap p.is-editor-empty:first-child::before {
    color: var(--rich-text-editor-placeholder-color, rgb(255 255 255 / 0.4));
  }

  .tiptap:focus {
    outline-style: solid;
    outline-width: 3px;
    outline-color: var(--color-primary-100, rgb(0 0 0 / 0.1));
  }
`;

/** Registers the rich text editor stylesheet with the given `@huuma/ui` application. */
export function registerTiptap(app: UIApp<UIAppContext>) {
  app.addStylesheet({
    entrypoint: true,
    name: "rich-text-editor",
    content: styles,
  });
}

/**
 * Registers the rich text editor stylesheet with the given `@huuma/ui` application.
 *
 * @deprecated Use {@linkcode registerTiptap}; this misspelled name stays for existing apps.
 */
export function registerTitap(app: UIApp<UIAppContext>) {
  registerTiptap(app);
}
