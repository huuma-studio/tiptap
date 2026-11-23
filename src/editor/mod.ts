/**
 * Rich text editor built on top of [Tiptap](https://tiptap.dev/).
 *
 * Exports the {@linkcode Editor} class for programmatic usage and the
 * {@linkcode RichTextEditor} component for declarative rendering.
 *
 * @module
 */

import { $mount } from "@huuma/ui/hooks/lifecycle";
import { $computed, $signal } from "@huuma/ui/hooks/signal";
import { $ref } from "@huuma/ui/hooks/ref";
import type { Ref } from "@huuma/ui/ref";
import type { Props } from "@huuma/ui";

import {
  type Content,
  type DocumentType,
  Editor as Tiptap,
  type EditorOptions,
  type Extension,
  type Extensions,
  type JSONContent,
  type Mark,
  type Node,
} from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";

import { generateJSON } from "@tiptap/html";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";

import { Fragment, type JSX, jsx } from "@huuma/ui/jsx-runtime";
import { ToolBar } from "./toolbar.ts";

/** The Tiptap editor the callbacks get, so apps can type it without depending on `@tiptap/core`. */
export type TiptapEditor = Tiptap;

/**
 * A text format the editor's content can be written in, other than HTML
 * (e.g. Markdown, from `@huuma/tiptap/markdown`). An extension that brings
 * one makes string content mean that format.
 */
export interface ContentFormat {
  /** The format's name, e.g. `"markdown"`. */
  name: string;
  /** Parses a string in this format into Tiptap JSON. */
  parse(content: string, extensions: Extensions): JSONContent;
  /** Serialises Tiptap JSON into this format. */
  serialize(content: JSONContent, extensions: Extensions): string;
}

/** Describes a Tiptap extension together with its optional toolbar UI. */
export interface EditorExtension<T extends Mark | Node | Extension> {
  /** The underlying Tiptap extension, mark, or node. */
  extension: T;
  /** Extra options forwarded to the Tiptap editor on initialisation. */
  initOptions?: Record<string, unknown>;
  /** Returns a toolbar element rendered inside the editor toolbar. */
  toolbarElement?: (editorRef: Ref<Tiptap | null>) => JSX.Element;
  /** The format string content is written in, when this extension sets one. */
  format?: ContentFormat;
}

/** What the hidden `<input>` holds: the content as HTML, as Tiptap JSON, or as Markdown. */
export type InputFormat = "html" | "json" | "markdown";

/**
 * Wrapper around the Tiptap editor that manages extensions, toolbar elements,
 * and HTML serialisation.
 */
export class Editor {
  #extensions: Extensions;
  #initOptions: Record<string, unknown>;
  #toolbarElements: ((editorRef: Ref<Tiptap | null>) => JSX.Element)[] = [];
  #format?: ContentFormat;

  /** Creates an editor instance from the given set of extensions. */
  constructor(extensions: EditorExtension<Mark | Extension | Node>[]) {
    this.#extensions = extensions.map((ext) => ext.extension);
    this.#initOptions = extensions.reduce(
      (acc, extension) => ({ ...acc, ...extension.initOptions }),
      {},
    );
    extensions.forEach((extension) => {
      if (extension.toolbarElement) {
        this.#toolbarElements.push(extension.toolbarElement);
      }
    });
    this.#format = extensions.find((extension) => extension.format)?.format;
  }

  /**
   * Generates HTML from JSON content using the provided extensions.
   *
   * This is useful when you need to serialize editor content to HTML
   * without creating an editor instance. Needs no DOM, so it also works on
   * the server and in workers: text and attribute values are escaped, and
   * only what the extensions' schema knows is rendered.
   *
   * @param content - The JSON content to convert to HTML.
   * @param extensions - The Tiptap extensions to use for rendering.
   * @returns An HTML string representation of the content.
   *
   * @example
   * ```ts
   * import { Editor } from "@huuma/tiptap";
   * import StarterKit from "@tiptap/starter-kit";
   *
   * const html = Editor.generateHTML(
   *   { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello World" }] }] },
   *   [StarterKit]
   * );
   * console.log(html); // "<p>Hello World</p>"
   * ```
   */
  static generateHTML(content: JSONContent, extensions: Extensions): string {
    return renderToHTMLString({ content, extensions: [...extensions] });
  }

  /**
   * Parses HTML content into JSON using the provided extensions.
   *
   * This is useful when you need to convert HTML to Tiptap's JSON format
   * without creating an editor instance. Parsing HTML needs a DOM: in the
   * browser, or on Node with `happy-dom` installed.
   *
   * @param content - The HTML string to parse into JSON.
   * @param extensions - The Tiptap extensions to use for parsing.
   * @returns A JSONContent object representing the parsed content.
   *
   * @example
   * ```ts
   * import { Editor } from "@huuma/tiptap";
   * import StarterKit from "@tiptap/starter-kit";
   *
   * const json = Editor.generateJSON("<p>Hello World</p>", [StarterKit]);
   * console.log(json);
   * // { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello World" }] }] }
   * ```
   */
  static generateJSON(content: string, extensions: Extensions): JSONContent {
    return generateJSON(content, [...extensions]);
  }

  /**
   * Converts editor content (JSON or an HTML string) to an HTML string.
   *
   * Strings are always read as HTML here. To render content that may be
   * Markdown (with the Markdown extension), use {@linkcode Editor.toJSON}
   * first: `Editor.generateHTML(editor.toJSON(content), …)`.
   */
  toHTML(content?: Content): string {
    if (!content) {
      return "";
    }

    if (typeof content === "string") {
      content = Editor.generateJSON(content, [...this.#extensions]);
    }

    return Editor.generateHTML(content, [...this.#extensions]);
  }

  /**
   * Converts editor content to Tiptap JSON. A string is read in the content
   * format of the extensions: Markdown with the Markdown extension, HTML
   * otherwise.
   */
  toJSON(content: Content): JSONContent {
    if (typeof content !== "string") {
      return content as JSONContent;
    }
    return this.#format
      ? this.#format.parse(content, this.#extensions)
      : Editor.generateJSON(content, [...this.#extensions]);
  }

  /**
   * Converts editor content (JSON, or a string in the extensions' content
   * format) to Markdown. Needs the Markdown extension among the extensions.
   */
  toMarkdown(content: Content): string {
    if (this.#format?.name !== "markdown") {
      throw new Error("toMarkdown() needs the Markdown extension (@huuma/tiptap/markdown)");
    }
    if (typeof content === "string") {
      return content;
    }
    return this.#format.serialize(content as JSONContent, this.#extensions);
  }

  /**
   * Serialises editor content (JSON, or a string in the extensions' content
   * format) as HTML (the default), as Tiptap JSON (a JSON string) or as
   * Markdown (needs the Markdown extension). Empty content gives `""`.
   */
  serialize(content: Content | undefined, format: InputFormat = "html"): string {
    if (!content) return "";
    if (format === "html") return Editor.generateHTML(this.toJSON(content), [...this.#extensions]);
    if (format === "json") return JSON.stringify(this.toJSON(content));
    return this.toMarkdown(content);
  }

  /** The value of the hidden input for what the editor holds. */
  #editorInputValue(editor: Tiptap, format: InputFormat): string {
    // As before for HTML: re-rendered through the extensions.
    if (format === "html") return this.toHTML(editor.getHTML());
    if (format === "json") return JSON.stringify(editor.getJSON());
    return this.toMarkdown(editor.getJSON());
  }

  /** Renders the editor with its toolbar as a JSX element. */
  render({
    content = "",
    "on-change": change,
    "on-blur": blur,
    "on-focus": focus,
    "on-create": create,
    inputName,
    inputId,
    inputFormat = "html",
    placeholder,
    label,
    class: className,
    toolbar = true,
    toolbarLabel,
  }: EditorRenderProps = {}): JSX.Element {
    const wrapperRef = $ref<HTMLElement | null>(null);
    const elementRef = $ref<Element | null>(null);
    const inputRef = $ref<HTMLInputElement | null>(null);
    const editorRef = $ref<Tiptap | null>(null);
    // The latest callbacks: the editor is created once, the props change.
    const handlersRef = $ref<Handlers>({});
    handlersRef.set = { change, blur, focus };

    const revision$ = $signal<number>(0);

    function updateRevision() {
      revision$.set(revision$.get() + 1);
    }

    const { inputValue } = $computed(() => {
      return {
        changed: revision$.get() !== 0,
        revision: revision$.get(),
        // Only with an input: rendering it needs @tiptap/html (and so a DOM
        // implementation), also on the server.
        inputValue: !inputName
          ? ""
          : inputFormat === "html"
            ? editorRef.get?.getHTML() || this.serialize(content)
            : editorRef.get
              ? this.#editorInputValue(editorRef.get, inputFormat)
              : this.serialize(content, inputFormat),
      };
    }).get();

    $mount(() => {
      const element = elementRef.get;

      if (element) {
        const extensions = [...this.#extensions];
        if (placeholder) {
          extensions.push(Placeholder.configure({ placeholder }));
        }
        const options: Partial<EditorOptions> = {
          element,
          extensions,
          content,
          ...this.#initOptions,
        };
        if (label) {
          options.editorProps = {
            ...options.editorProps,
            attributes: {
              ...(options.editorProps?.attributes as Record<string, string> | undefined),
              role: "textbox",
              "aria-multiline": "true",
              "aria-label": label,
            },
          };
        }
        const tiptap = new Tiptap(options);

        tiptap.on("selectionUpdate", () => updateRevision());
        tiptap.on("transaction", () => updateRevision());
        tiptap.on("update", (event) => {
          updateRevision();

          if (inputRef.get instanceof HTMLInputElement) {
            inputRef.get.value = this.#editorInputValue(event.editor, inputFormat);
          }

          const { change } = handlersRef.get;
          if (typeof change === "function") {
            change(event.editor.getJSON(), event.editor);
          }
        });

        editorRef.set = tiptap;
        create?.(tiptap);
      }
      return () => {
        return editorRef.get?.destroy();
      };
    });

    /** Whether the focus moved within the editor (e.g. to a toolbar button). */
    const staysInside = (event: FocusEvent) =>
      event.relatedTarget instanceof globalThis.Node &&
      !!wrapperRef.get?.contains(event.relatedTarget);

    const toolbarElements = toolbar
      ? this.#toolbarElements.map((toolbarElement) => toolbarElement(editorRef))
      : [];

    return jsx("div", {
      bind: wrapperRef,
      class: className ? `rich-text-editor ${className}` : "rich-text-editor",
      "on-focusin": (event: FocusEvent) => {
        const { focus } = handlersRef.get;
        if (focus && editorRef.get && !staysInside(event)) focus(editorRef.get, event);
      },
      "on-focusout": (event: FocusEvent) => {
        const { blur } = handlersRef.get;
        if (blur && editorRef.get && !staysInside(event)) blur(editorRef.get, event);
      },
      children: [
        !!toolbarElements?.length &&
          jsx(ToolBar, { label: toolbarLabel, children: toolbarElements }),
        jsx("div", { bind: elementRef }),
        inputName &&
          jsx("input", {
            bind: inputRef,
            value: inputValue,
            name: inputName,
            id: inputId,
            hidden: true,
          }),
      ],
    });
  }
}

/** The callbacks of {@linkcode EditorRenderProps}, kept current across renders. */
interface Handlers {
  change?: EditorRenderProps["on-change"];
  blur?: EditorRenderProps["on-blur"];
  focus?: EditorRenderProps["on-focus"];
}

/** Options of the editable editor shared by {@linkcode EditorRenderProps} and {@linkcode RichTextEditorProps}. */
interface EditableOptions {
  /** What the hidden `<input>` holds. Defaults to `"html"`. */
  inputFormat?: InputFormat;
  /**
   * Called once the Tiptap editor exists (in the browser, after mounting),
   * e.g. to keep it for commands: `editor.commands.setContent(…)`.
   */
  "on-create"?: (editor: Tiptap) => void;
  /**
   * Called when the focus leaves the editor: the text and its toolbar. Moving
   * between them doesn't count. `editor.getMarkdown()` (with the Markdown
   * extension), `getHTML()` or `getJSON()` read what it holds.
   */
  "on-blur"?: (editor: Tiptap, event: FocusEvent) => void;
  /** Called when the focus enters the editor (the text or its toolbar) from outside it. */
  "on-focus"?: (editor: Tiptap, event: FocusEvent) => void;
  /** Text shown while the editor is empty. */
  placeholder?: string;
  /** The editable area's accessible name (`aria-label`), when no `<label>` names it. */
  label?: string;
  /** Classes added to the editor's wrapper (`.rich-text-editor`). */
  class?: string;
  /** Whether to show the toolbar. Defaults to `true`. */
  toolbar?: boolean;
  /** The toolbar's accessible name. Defaults to "Formatting". */
  toolbarLabel?: string;
}

/** Props accepted by {@linkcode Editor.render}. */
export interface EditorRenderProps extends Omit<Props, "children">, EditableOptions {
  /** Initial content to populate the editor with. */
  content?: Content;
  /** Name attribute for the hidden `<input>` that holds the serialised content. */
  inputName?: string;
  /** Id attribute for the hidden `<input>` that holds the serialised content. */
  inputId?: string;
  /**
   * Callback fired whenever the editor content changes, with the content as
   * Tiptap JSON and the Tiptap editor.
   */
  // deno-lint-ignore no-explicit-any
  "on-change"?: (content: DocumentType<any>, editor: Tiptap) => void;
}

/** Props accepted by {@linkcode RichTextEditor}. */
export interface RichTextEditorProps extends EditableOptions {
  /**
   * When `true` the editor is interactive; otherwise content is rendered as
   * static HTML in a `.rich-text-content` element, styled like the editor's
   * text. Static HTML needs no DOM, so it renders on the server too.
   */
  editable?: boolean;
  /**
   * Initial content for the editor: Tiptap JSON, or a string. A string is
   * Markdown with the Markdown extension, HTML otherwise.
   */
  content?: Content;
  /** Extensions to enable in the editor. */
  extensions: EditorExtension<Mark | Node | Extension>[];
  /** Name attribute for the hidden `<input>` that holds the serialised content. */
  inputName?: string;
  /** Id attribute for the hidden `<input>`. */
  inputId?: string;
  /**
   * Callback fired whenever the editor content changes, with the content as
   * Tiptap JSON and the Tiptap editor.
   */
  "on-change"?: (content: DocumentType, editor: Tiptap) => void;
}

/**
 * A ready-to-use rich text editor component.
 *
 * Renders an interactive Tiptap editor when `editable` is `true`, or static
 * HTML otherwise. An optional hidden `<input>` is rendered when `inputName` is
 * provided so the serialised content (HTML by default, see `inputFormat`) can
 * be submitted with a form.
 */
export function RichTextEditor({
  editable = false,
  content,
  "on-change": change,
  extensions,
  inputName,
  inputId,
  inputFormat = "html",
  class: className,
  ...options
}: RichTextEditorProps): JSX.Element {
  const editorRef = $ref(new Editor(extensions));

  return jsx(Fragment, {
    children: editable
      ? /* "editor.render()" not called as JSX Component" so signals based reactivity
         * is delegated to this "<RichTextEditor>" component
         */
        editorRef.get.render({
          ...options,
          "on-change": change,
          content,
          inputId,
          inputName,
          inputFormat,
          class: className,
        })
      : jsx(Fragment, {
          children: [
            jsx("div", {
              class: className ? `rich-text-content ${className}` : "rich-text-content",
              dangerouslySetInnerHTML: {
                __html: editorRef.get.serialize(content),
              },
            }),
            (inputName || inputId) &&
              jsx("input", {
                type: "hidden",
                name: inputName,
                id: inputId,
                value: editorRef.get.serialize(content, inputFormat),
              }),
          ],
        }),
  });
}
