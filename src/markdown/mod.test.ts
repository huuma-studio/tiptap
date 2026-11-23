import { expect, test } from "vite-plus/test";

import MarkdownExtension, { jsonToMarkdown, markdownToJSON } from "./mod.ts";
import TextExtensions from "../nodes/text.ts";
import HeadingExtension from "../nodes/heading.ts";
import ListExtensions, { OrderedListExtension } from "../nodes/extension-list.ts";
import CodeBlockExtension from "../nodes/code-block.ts";
import BlockquoteExtension from "../nodes/blockquote.ts";
import BoldExtension from "../marks/bold.ts";
import ItalicExtension from "../marks/italic.ts";
import CodeExtension from "../marks/code.ts";
import LinkExtension from "../marks/link.ts";
import StrikeExtension from "../marks/strike.ts";

const extensions = [
  ...TextExtensions,
  HeadingExtension,
  ...ListExtensions,
  OrderedListExtension,
  CodeBlockExtension,
  BlockquoteExtension,
  BoldExtension,
  ItalicExtension,
  CodeExtension,
  LinkExtension,
  StrikeExtension,
  MarkdownExtension,
];

const markdown = [
  "## Plan",
  "",
  "Some **bold**, *italic*, ~~struck~~ and `code` with a [link](https://huuma.studio).",
  "",
  "- one",
  "- two",
  "",
  "1. first",
  "2. second",
  "",
  "> quoted",
  "",
  "```",
  "const a = 1;",
  "```",
].join("\n");

test("markdownToJSON parses every supported node and mark", () => {
  const json = markdownToJSON(markdown, extensions);
  const types = (json.content ?? []).map((node) => node.type);
  expect(types).toEqual([
    "heading",
    "paragraph",
    "bulletList",
    "orderedList",
    "blockquote",
    "codeBlock",
  ]);
  const marks = (json.content?.[1]?.content ?? []).flatMap((node) =>
    (node.marks ?? []).map((mark) => mark.type),
  );
  expect(marks).toEqual(["bold", "italic", "strike", "code", "link"]);
});

test("jsonToMarkdown gives the Markdown back", () => {
  expect(jsonToMarkdown(markdownToJSON(markdown, extensions), extensions)).toEqual(markdown);
});

test("the helpers take Tiptap extensions as well as the editor's", () => {
  const tiptap = extensions.map((each) => each.extension);
  expect(markdownToJSON(markdown, tiptap)).toEqual(markdownToJSON(markdown, extensions));
});

test("the Markdown extension brings Markdown as its content format", () => {
  expect(MarkdownExtension.format?.name).toEqual("markdown");
  expect(MarkdownExtension.initOptions).toEqual({ contentType: "markdown" });
});

test("task lists, dividers and line breaks round-trip", async () => {
  const { HardBreakExtension } = await import("../nodes/text.ts");
  const { TaskListExtensions } = await import("../nodes/extension-list.ts");
  const { default: HorizontalRuleExtension } = await import("../nodes/horizontal-rule.ts");
  const more = [...extensions, HardBreakExtension, ...TaskListExtensions, HorizontalRuleExtension];
  const source = ["- [x] done", "- [ ] open", "", "---", "", "one\\", "two"].join("\n");
  const json = markdownToJSON(source, more);
  expect(json.content?.map((node) => node.type)).toEqual([
    "taskList",
    "horizontalRule",
    "paragraph",
  ]);
  expect(json.content?.[0]?.content?.map((item) => item.attrs?.checked)).toEqual([true, false]);
  expect(json.content?.[2]?.content?.map((node) => node.type)).toEqual([
    "text",
    "hardBreak",
    "text",
  ]);
  expect(markdownToJSON(jsonToMarkdown(json, more), more)).toEqual(json);
});
