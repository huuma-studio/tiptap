// The registered stylesheet's rules that behaviour relies on, not only looks.
import { expect, test } from "vite-plus/test";
import type { UIApp, UIAppContext } from "@huuma/ui/server";

import { registerTiptap } from "./mod.ts";

/** The stylesheet registerTiptap adds. */
function stylesheet(): string {
  let content = "";
  registerTiptap({
    addStylesheet: (sheet: { content: string }) => {
      content = sheet.content;
    },
  } as unknown as UIApp<UIAppContext>);
  return content;
}

test("not focusable read-only content has code blocks that don't scroll", () => {
  // A scrolling code block is a Tab stop: focusable={false} relies on this.
  expect(stylesheet()).toMatch(
    /\.rich-text-content \{[^]*&\.rich-text-content--unfocusable pre \{\s*overflow: hidden;\s*\}/,
  );
});

test("read-only checkboxes keep their look when disabled", () => {
  expect(stylesheet()).toMatch(/input\[type="checkbox"\]:disabled \{\s*opacity: 1;\s*\}/);
});
