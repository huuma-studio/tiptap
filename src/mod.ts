/**
 * Core module for the `@huuma/tiptap` rich text editor package.
 *
 * Provides {@linkcode registerTitap} to register the editor's global stylesheet
 * with a `@huuma/ui` application.
 *
 * @module
 */

import type { UIApp, UIAppContext } from "@huuma/ui/server";
import { css } from "./util.ts";

const styles = css`
  .rich-text-editor {
    width: 100%;
    background-color: white;
    border: 1px solid var(--color-primary-100, rgb(0 0 0 / 0.1));
    border-radius: 0.25rem;
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

  .tiptap {
    padding: 0.5rem;
    font-size: var(--text-base, 1rem);

    p, ul, h1, h2, h3, h4, h5, h6 {
      &:first-child {
        margin-top: 0;
      }
    }

    h1, h2, h3, h4, h5, h6 {
      font-weight: bold;
    }

    h1, h2, h3 {
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

    p, ul, h4, h5, h6 {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }

    ul {
      list-style-type: disc;
      padding-left: 1.25rem;
    }

    a {
      text-decoration: underline;
    }
  }

  .tiptap:focus {
    outline-style: solid;
    outline-width: 3px;
    outline-color: var(--color-primary-100, rgb(0 0 0 / 0.1));
  }
`;

/** Registers the rich text editor stylesheet with the given `@huuma/ui` application. */
export function registerTitap(app: UIApp<UIAppContext>) {
  app.addStylesheet({
    entrypoint: true,
    name: "rich-text-editor",
    content: styles,
  });
}
