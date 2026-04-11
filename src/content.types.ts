import { literal } from "@huuma/validate/literal";
import { object } from "@huuma/validate/object";
import { string } from "@huuma/validate/string";
import { array } from "@huuma/validate/array";
import { union } from "@huuma/validate/union";

export const BoldSchema = object({
  type: literal("bold"),
});

export const ItalicSchema = object({
  type: literal("italic"),
});

export const LinkSchema = object({
  type: literal("link"),
  attrs: object({
    href: string(),
    target: string().optional(),
    rel: string().optional(),
  }),
});

export const TextSchema = object({
  type: literal("text"),
  text: string(),
  marks: array(union([BoldSchema, ItalicSchema, LinkSchema])).optional(),
});

export const ParagraphSchema = object({
  type: literal("paragraph"),
  content: array(TextSchema).optional(),
});

export const Level2ListItemSchema = object({
  type: literal("listItem"),
  content: array(ParagraphSchema),
});
export type Level2ListItem = typeof Level1ListItemSchema.infer;

export const Level2BulletListSchema = object({
  type: literal("bulletList"),
  content: array(Level2ListItemSchema),
});
export type Level2BulletList = typeof Level2BulletListSchema.infer;

export const Level1ListItemSchema = object({
  type: literal("listItem"),
  content: array(union([ParagraphSchema, Level2BulletListSchema])),
});
export type Level1ListItem = typeof Level1ListItemSchema.infer;

export const Level1BulletListSchema = object({
  type: literal("bulletList"),
  // TODO: Support nested lists
  content: array(Level1ListItemSchema),
});
export type Level1BulletList = typeof Level1BulletListSchema.infer;

export const ListItemSchema = object({
  type: literal("listItem"),
  content: array(union([ParagraphSchema, Level1BulletListSchema])),
});
export type ListItem = typeof ListItemSchema.infer;

export const BulletListSchema = object({
  type: literal("bulletList"),
  // TODO: Support nested lists
  content: array(ListItemSchema),
});
export type BulletList = typeof BulletListSchema.infer;

export const DocumentSchema = object({
  type: literal("doc"),
  content: array(union([ParagraphSchema, BulletListSchema])),
});
export type Document = typeof DocumentSchema.infer;
