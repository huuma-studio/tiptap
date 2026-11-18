import { expect, test } from "vite-plus/test";
import { jsx } from "@huuma/ui/jsx-runtime";
import { renderToStringSync } from "@huuma/ui/server";
import type { JSONContent } from "@tiptap/core";

import { RichTextEditor } from "./mod.ts";
import TextExtensions from "../nodes/text.ts";
import HeadingExtension from "../nodes/heading.ts";
import ListExtensions from "../nodes/extension-list.ts";
import CodeBlockExtension from "../nodes/code-block.ts";
import TableExtensions from "../nodes/table.ts";
import BoldExtension from "../marks/bold.ts";
import ItalicExtension from "../marks/italic.ts";
import CodeExtension from "../marks/code.ts";
import LinkExtension from "../marks/link.ts";

const extensions = [
  ...TextExtensions,
  HeadingExtension,
  ...ListExtensions,
  CodeBlockExtension,
  ...TableExtensions,
  BoldExtension,
  ItalicExtension,
  CodeExtension,
  LinkExtension,
];

const doc: JSONContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Some " },
        { type: "text", text: "bold", marks: [{ type: "bold" }] },
        { type: "text", text: " and a " },
        {
          type: "text",
          text: "link",
          marks: [{ type: "link", attrs: { href: "https://huuma.studio" } }],
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "one" }] }],
        },
      ],
    },
  ],
};

const render = (props: Record<string, unknown>) =>
  renderToStringSync(jsx(RichTextEditor, { extensions, ...props }));

test("read-only renders the content as HTML", () => {
  expect(render({ content: doc })).toMatchSnapshot();
});

test("read-only with an input renders a hidden input holding the HTML", () => {
  expect(render({ content: doc, inputName: "body", inputId: "body" })).toMatchSnapshot();
});

test("editable renders the toolbar, the mount point and the hidden input", () => {
  expect(
    render({ editable: true, content: doc, inputName: "body", inputId: "body" }),
  ).toMatchSnapshot();
});

test("editable without content or input renders the toolbar and the mount point", () => {
  expect(render({ editable: true })).toMatchSnapshot();
});
