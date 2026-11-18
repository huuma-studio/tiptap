import { expect, test } from "vite-plus/test";
import { jsx } from "@huuma/ui/jsx-runtime";
import { renderToStringSync } from "@huuma/ui/server";
import type { JSONContent } from "@tiptap/core";

import { Editor, RichTextEditor } from "./mod.ts";
import MarkdownExtension from "../markdown/mod.ts";
import TextExtensions from "../nodes/text.ts";
import ListExtensions from "../nodes/extension-list.ts";
import BoldExtension from "../marks/bold.ts";

const html = [...TextExtensions, ...ListExtensions, BoldExtension];
const markdown = [...html, MarkdownExtension];

const doc: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Hello " },
        { type: "text", text: "world", marks: [{ type: "bold" }] },
      ],
    },
  ],
};

const render = (props: Record<string, unknown>) => renderToStringSync(jsx(RichTextEditor, props));

/** The value of the rendered hidden input, unescaped. */
const inputValue = (rendered: string) =>
  rendered
    .match(/<input[^>]* value="([^"]*)"/)?.[1]
    ?.replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&");

test("read-only renders a Markdown string as HTML with the Markdown extension", () => {
  expect(render({ extensions: markdown, content: "Hello **world**" })).toEqual(
    "<div><p>Hello <strong>world</strong></p></div>",
  );
});

test("read-only reads a string as HTML without the Markdown extension, as before", () => {
  expect(render({ extensions: html, content: "<p>Hello <strong>world</strong></p>" })).toEqual(
    "<div><p>Hello <strong>world</strong></p></div>",
  );
});

test("read-only renders JSON content the same with or without the Markdown extension", () => {
  expect(render({ extensions: markdown, content: doc })).toEqual(
    render({ extensions: html, content: doc }),
  );
});

test("read-only takes a class", () => {
  expect(render({ extensions: html, content: doc, class: "prose" })).toMatch(
    /^<div class="prose">/,
  );
});

test("the hidden input holds HTML by default, also for Markdown content", () => {
  for (const editable of [false, true]) {
    const rendered = render({
      editable,
      extensions: markdown,
      content: "Hello **world**",
      inputName: "body",
    });
    expect(inputValue(rendered)).toEqual("<p>Hello <strong>world</strong></p>");
  }
});

test("the hidden input can hold Markdown", () => {
  for (const editable of [false, true]) {
    for (const content of [doc, "Hello **world**"]) {
      const rendered = render({
        editable,
        extensions: markdown,
        content,
        inputName: "body",
        inputFormat: "markdown",
      });
      expect(inputValue(rendered)).toEqual("Hello **world**");
    }
  }
});

test("the hidden input can hold Tiptap JSON", () => {
  const rendered = render({
    extensions: markdown,
    content: "Hello **world**",
    inputName: "body",
    inputFormat: "json",
  });
  expect(JSON.parse(inputValue(rendered)!)).toEqual(doc);
});

test("editable takes a class, hides the toolbar, and names it", () => {
  expect(render({ editable: true, extensions: html, class: "borderless" })).toMatch(
    /^<div class="rich-text-editor borderless">/,
  );
  expect(render({ editable: true, extensions: html, toolbar: false })).toEqual(
    '<div class="rich-text-editor"><div></div></div>',
  );
  expect(render({ editable: true, extensions: html, toolbarLabel: "Format" })).toContain(
    'role="toolbar" aria-label="Format"',
  );
});

test("toJSON reads strings in the content format", () => {
  expect(new Editor(markdown).toJSON("Hello **world**")).toEqual(doc);
  expect(new Editor(html).toJSON("<p>Hello <strong>world</strong></p>")).toEqual(doc);
  expect(new Editor(html).toJSON(doc)).toBe(doc);
});

test("toMarkdown serialises JSON and needs the Markdown extension", () => {
  expect(new Editor(markdown).toMarkdown(doc)).toEqual("Hello **world**");
  expect(() => new Editor(html).toMarkdown(doc)).toThrow(/Markdown extension/);
});

test("serialize gives HTML, JSON or Markdown, and nothing for no content", () => {
  const editor = new Editor(markdown);
  expect(editor.serialize(doc)).toEqual("<p>Hello <strong>world</strong></p>");
  expect(JSON.parse(editor.serialize("Hello **world**", "json"))).toEqual(doc);
  expect(editor.serialize(doc, "markdown")).toEqual("Hello **world**");
  expect(editor.serialize(undefined)).toEqual("");
  expect(editor.serialize("", "markdown")).toEqual("");
});

test("toHTML keeps reading strings as HTML", () => {
  expect(new Editor(markdown).toHTML("<p>Hello <strong>world</strong></p>")).toEqual(
    "<p>Hello <strong>world</strong></p>",
  );
});
