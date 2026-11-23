// Read-only rendering without a DOM: @tiptap/html needs one (in a Worker
// it throws, on Node it needs happy-dom), so here it always throws.
import { expect, test, vi } from "vite-plus/test";
import { jsx } from "@huuma/ui/jsx-runtime";
import { renderToStringSync } from "@huuma/ui/server";

import { RichTextEditor } from "./mod.ts";
import MarkdownExtension from "../markdown/mod.ts";
import TextExtensions, { HardBreakExtension } from "../nodes/text.ts";
import HeadingExtension from "../nodes/heading.ts";
import ListExtensions, {
  OrderedListExtension,
  TaskListExtensions,
} from "../nodes/extension-list.ts";
import TableExtensions from "../nodes/table.ts";
import HorizontalRuleExtension from "../nodes/horizontal-rule.ts";
import BlockquoteExtension from "../nodes/blockquote.ts";
import CodeBlockExtension from "../nodes/code-block.ts";
import BoldExtension from "../marks/bold.ts";
import ItalicExtension from "../marks/italic.ts";
import StrikeExtension from "../marks/strike.ts";
import CodeExtension from "../marks/code.ts";
import LinkExtension from "../marks/link.ts";

vi.mock("@tiptap/html", () => {
  const noDOM = () => {
    throw new Error("@tiptap/html needs a DOM");
  };
  return { generateHTML: noDOM, generateJSON: noDOM };
});

const extensions = [
  ...TextExtensions,
  HardBreakExtension,
  HeadingExtension,
  ...ListExtensions,
  OrderedListExtension,
  ...TaskListExtensions,
  ...TableExtensions,
  HorizontalRuleExtension,
  BlockquoteExtension,
  CodeBlockExtension,
  BoldExtension,
  ItalicExtension,
  StrikeExtension,
  CodeExtension,
  LinkExtension,
  MarkdownExtension,
];

const render = (content: string, props: Record<string, unknown> = {}) =>
  renderToStringSync(jsx(RichTextEditor, { extensions, content, ...props }));

test("read-only renders Markdown without a DOM", () => {
  const markdown = [
    "## Done",
    "",
    "Changed **3 files** in `/workspace/app`:\\",
    "and ran the tests.",
    "",
    "- [x] tests pass",
    "- [ ] deploy",
    "",
    "1. first",
    "",
    "---",
    "",
    "| File | Lines |",
    "| --- | ---: |",
    "| a.ts | 12 |",
    "",
    "> ~~old~~ *new*",
    "",
    "```sh",
    'npm test && echo "ok"',
    "```",
  ].join("\n");
  expect(render(markdown, { class: "text-sm" })).toMatchSnapshot();
});

test("read-only escapes text and drops what the schema doesn't know", () => {
  const html = render(
    [
      '<script>alert(1)</script> <img src=x onerror="alert(1)">',
      "",
      '[bad](javascript:alert(1)) & "quotes" ![pic](https://example.com/p.png)',
    ].join("\n"),
  );
  expect(html).not.toContain("<script");
  expect(html).not.toContain("<img");
  expect(html).not.toContain('href="javascript:');
  expect(html).toContain("&lt;script&gt;");
  expect(html).toContain("&amp;");
});

test("read-only task checkboxes are disabled, and the editable editor's aren't", () => {
  const html = render('- [x] done\n- [ ] open\n\n`<input type="checkbox">` as text');
  expect(html.match(/<input /g)).toHaveLength(2);
  expect(html.match(/<input disabled type="checkbox"/g)).toHaveLength(2);
  expect(html).toContain('<code>&lt;input type="checkbox"&gt;</code>');
  expect(
    render("- [ ] open", { editable: true, inputName: "body", inputFormat: "markdown" }),
  ).not.toContain("disabled");
});

test("read-only renders an empty element for no content", () => {
  expect(render("")).toBe('<div class="rich-text-content"></div>');
});
