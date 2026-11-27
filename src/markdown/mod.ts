/**
 * Markdown extension for the rich text editor.
 *
 * Enables Markdown as the content format so the editor accepts and produces
 * Markdown instead of HTML: string `content` is read as Markdown (also when
 * rendered read-only), `editor.getMarkdown()` returns it, and the hidden
 * input can hold it (`inputFormat="markdown"`).
 *
 * Named character references (`&copy;`, `&mdash;`, `&nbsp;`, …) show as
 * their characters, outside code, as HTML would show them; Tiptap itself
 * decodes only `&amp;`, `&lt;`, `&gt;`, `&quot;` and numeric ones.
 *
 * Also exports {@linkcode markdownToJSON} and {@linkcode jsonToMarkdown} to
 * convert without an editor, e.g. on the server.
 *
 * @module
 */

import { Markdown, MarkdownManager } from "@tiptap/markdown";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Node as ProseMirrorNode, Slice } from "@tiptap/pm/model";
import {
  type AnyExtension,
  type Editor,
  Extension,
  type JSONContent,
  type Mark,
  type Node,
} from "@tiptap/core";
import type { ContentFormat, EditorExtension } from "../editor/mod.ts";

/**
 * Creates a paste plugin that parses plain-text clipboard content as Markdown
 * when the editor is configured with `contentType: "markdown"`.
 *
 * Without this plugin, pasted Markdown source is inserted as plain text and
 * Tiptap's Markdown input rules do not run for pasted content. The plugin
 * intercepts text-only pastes, converts them to a ProseMirror document via the
 * editor's Markdown manager, and replaces the selection with the result.
 */
function createMarkdownPastePlugin(editor: Editor) {
  return new Plugin({
    key: new PluginKey("markdownPaste"),
    props: {
      handlePaste(view, event) {
        if (editor.options.contentType !== "markdown" || !editor.markdown) {
          return false;
        }

        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        // Only intercept plain-text pastes. If the clipboard contains HTML,
        // leave it to Tiptap's default HTML parser so rendered content is kept.
        if (!text || html) {
          return false;
        }

        let node: ProseMirrorNode;
        try {
          const json = editor.markdown.parse(text);
          node = ProseMirrorNode.fromJSON(view.state.schema, json);
        } catch {
          return false;
        }

        const slice = new Slice(node.content, 0, 0);

        view.dispatch(view.state.tr.replaceSelection(slice));
        return true;
      },
    },
  });
}

/**
 * The named character references decoded besides Tiptap's own: common
 * typography and symbols. Unknown names stay as written.
 */
const NAMED_REFERENCES: Record<string, string> = {
  nbsp: "\u00a0",
  apos: "'",
  copy: "©",
  reg: "®",
  trade: "™",
  sect: "§",
  para: "¶",
  deg: "°",
  plusmn: "±",
  times: "×",
  divide: "÷",
  middot: "·",
  bull: "•",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  sbquo: "‚",
  ldquo: "“",
  rdquo: "”",
  bdquo: "„",
  laquo: "«",
  raquo: "»",
  lsaquo: "‹",
  rsaquo: "›",
  prime: "′",
  Prime: "″",
  dagger: "†",
  Dagger: "‡",
  permil: "‰",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  curren: "¤",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
  sup1: "¹",
  sup2: "²",
  sup3: "³",
  micro: "µ",
  iexcl: "¡",
  iquest: "¿",
  larr: "←",
  rarr: "→",
  uarr: "↑",
  darr: "↓",
  harr: "↔",
  lArr: "⇐",
  rArr: "⇒",
  hArr: "⇔",
  ne: "≠",
  le: "≤",
  ge: "≥",
  asymp: "≈",
  infin: "∞",
  minus: "−",
  check: "✓",
  hearts: "♥",
  shy: "\u00ad",
  zwj: "\u200d",
  zwnj: "\u200c",
  ensp: "\u2002",
  emsp: "\u2003",
  thinsp: "\u2009",
};

/**
 * Decodes the named character references of {@linkcode NAMED_REFERENCES} in
 * Markdown text: an inline token, so code spans and blocks keep them as
 * written, and `&amp;copy;` stays `&copy;`.
 */
const NamedReferences = Extension.create({
  name: "markdownNamedReferences",
  markdownTokenName: "namedReference",
  markdownTokenizer: {
    name: "namedReference",
    level: "inline",
    start: (src: string) => src.indexOf("&"),
    tokenize: (src: string) => {
      const match = /^&([a-zA-Z][a-zA-Z0-9]{1,31});/.exec(src);
      const text =
        match && Object.hasOwn(NAMED_REFERENCES, match[1]!) && NAMED_REFERENCES[match[1]!];
      return text ? { type: "namedReference", raw: match[0], text } : undefined;
    },
  },
  parseMarkdown: (token) => ({ type: "text", text: token.text ?? "" }),
});

/** Markdown extension that also parses pasted plain text as Markdown. */
const MarkdownWithPaste: typeof Markdown = Markdown.extend({
  addExtensions() {
    return [...(this.parent?.() ?? []), NamedReferences];
  },
  addProseMirrorPlugins() {
    return [createMarkdownPastePlugin(this.editor)];
  },
});

/** Tiptap extensions, or the editor's extensions that wrap them. */
type Extensions = readonly (AnyExtension | EditorExtension<Mark | Node | Extension>)[];

const managers = new WeakMap<Extensions, MarkdownManager>();

/** A Markdown manager for these extensions, made once per array. */
function manager(extensions: Extensions): MarkdownManager {
  let manager = managers.get(extensions);
  if (!manager) {
    manager = new MarkdownManager({
      extensions: extensions.map((each) => ("extension" in each ? each.extension : each)),
    });
    managers.set(extensions, manager);
  }
  return manager;
}

/**
 * Parses Markdown into Tiptap JSON with the given extensions: the same
 * document an editor with these extensions and the Markdown extension would
 * hold.
 *
 * @example
 * ```ts
 * import { markdownToJSON } from "@huuma/tiptap/markdown";
 * import TextExtensions from "@huuma/tiptap/nodes/text";
 * import BoldExtension from "@huuma/tiptap/marks/bold";
 *
 * markdownToJSON("Hello **world**", [...TextExtensions, BoldExtension]);
 * ```
 */
export function markdownToJSON(markdown: string, extensions: Extensions): JSONContent {
  return manager(extensions).parse(markdown);
}

/**
 * Serialises Tiptap JSON to Markdown with the given extensions: what
 * `editor.getMarkdown()` returns for that document.
 */
export function jsonToMarkdown(content: JSONContent, extensions: Extensions): string {
  return manager(extensions).serialize(content);
}

/** Markdown as the content format: what string content is and how it's read and written. */
const markdownFormat: ContentFormat = {
  name: "markdown",
  parse: (content, extensions) => markdownToJSON(content, extensions),
  serialize: (content, extensions) => jsonToMarkdown(content, extensions),
};

/** Tiptap Markdown extension that sets `contentType` to `"markdown"`. */
const MarkdownExtension: EditorExtension<typeof MarkdownWithPaste> = {
  extension: MarkdownWithPaste,
  initOptions: {
    contentType: "markdown",
  },
  format: markdownFormat,
};

export default MarkdownExtension;
