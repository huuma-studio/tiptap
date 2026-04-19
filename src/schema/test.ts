import { assertEquals, assertThrows } from "@std/assert";
import type { DocumentType, Extension } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import { TipTapDocumentSchema } from "./mod.ts";

const extensions = [Document, Paragraph, Text] as Extension[];

function validDoc(text = "Hello world"): DocumentType {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  } as DocumentType;
}

Deno.test("validate returns value for a valid document", () => {
  const schema = new TipTapDocumentSchema({
    isRequired: true,
    validators: [],
    extensions,
  });
  const result = schema.validate(validDoc());
  assertEquals(result.errors, undefined);
  assertEquals(result.value?.type, "doc");
});

Deno.test("validate returns errors for an invalid node type", () => {
  const schema = new TipTapDocumentSchema({
    isRequired: true,
    validators: [],
    extensions,
  });
  const result = schema.validate({
    type: "doc",
    content: [{ type: "nonexistent" }],
  } as unknown as DocumentType);
  assertEquals(result.value, undefined);
  assertEquals(typeof result.errors?.[0]?.message, "string");
});

Deno.test("validate returns errors for a mark not in the schema", () => {
  const schema = new TipTapDocumentSchema({
    isRequired: true,
    validators: [],
    extensions,
  });
  const result = schema.validate({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "bold", marks: [{ type: "bold" }] },
        ],
      },
    ],
  } as unknown as DocumentType);
  assertEquals(result.value, undefined);
  assertEquals(typeof result.errors?.[0]?.message, "string");
});

Deno.test("validate accepts a mark when its extension is registered", () => {
  const schema = new TipTapDocumentSchema({
    isRequired: true,
    validators: [],
    extensions: [...extensions, Bold],
  });
  const result = schema.validate({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "bold", marks: [{ type: "bold" }] },
        ],
      },
    ],
  } as unknown as DocumentType);
  assertEquals(result.errors, undefined);
  assertEquals(result.value?.type, "doc");
});

Deno.test("validate returns round-tripped JSON", () => {
  const schema = new TipTapDocumentSchema({
    isRequired: true,
    validators: [],
    extensions,
  });
  const input = validDoc("round trip");
  const result = schema.validate(input);
  assertEquals(result.value, input);
});

Deno.test("validate strips additional properties not in the schema", () => {
  const schema = new TipTapDocumentSchema({
    isRequired: true,
    validators: [],
    extensions,
  });
  const input = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        extraProp: "should be removed",
        content: [{ type: "text", text: "hello", unknown: true }],
      },
    ],
  } as unknown as DocumentType;
  const result = schema.validate(input);
  assertEquals(result.errors, undefined);
  const paragraph = result.value?.content?.[0] as Record<string, unknown>;
  assertEquals(paragraph.extraProp, undefined);
  const textNode = (paragraph.content as Record<string, unknown>[])?.[0];
  assertEquals(textNode.unknown, undefined);
  assertEquals(textNode.text, "hello");
});

Deno.test("defaults: extensions default to empty array", () => {
  const schema = new TipTapDocumentSchema();
  // getSchema throws before nodeFromJSON when no extensions are registered
  assertThrows(() => schema.validate(validDoc()));
});
