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
  type Extension,
  type Extensions,
  type JSONContent,
  type Mark,
  type Node,
} from "@tiptap/core";

import { generateHTML, generateJSON } from "@tiptap/html";

import type { JSX } from "@huuma/ui/jsx-runtime";
import { ToolBar } from "./toolbar.tsx";

/** Describes a Tiptap extension together with its optional toolbar UI. */
export interface EditorExtension<
  T extends Mark | Node | Extension,
> {
  /** The underlying Tiptap extension, mark, or node. */
  extension: T;
  /** Extra options forwarded to the Tiptap editor on initialisation. */
  initOptions?: Record<string, unknown>;
  /** Returns a toolbar element rendered inside the editor toolbar. */
  toolbarElement?: (editorRef: Ref<Tiptap | null>) => JSX.Element;
}

/**
 * Wrapper around the Tiptap editor that manages extensions, toolbar elements,
 * and HTML serialisation.
 */
export class Editor {
  #extensions: Extensions;
  #initOptions: Record<string, unknown>;
  #toolbarElements: ((editorRef: Ref<Tiptap | null>) => JSX.Element)[] = [];

  /** Creates an editor instance from the given set of extensions. */
  constructor(extensions: EditorExtension<Mark | Extension | Node>[]) {
    this.#extensions = [...extensions.map((ext) => ext.extension)];
    this.#initOptions = {
      ...extensions.reduce(
        (acc, extension) => ({ ...acc, ...extension.initOptions }),
        {},
      ),
    };
    extensions.forEach((extension) => {
      if (extension.toolbarElement) {
        this.#toolbarElements.push(extension.toolbarElement);
      }
    });
  }

  /**
   * Generates HTML from JSON content using the provided extensions.
   *
   * This is useful when you need to serialize editor content to HTML
   * without creating an editor instance.
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
    return generateHTML(content, [
      ...extensions,
    ]);
  }

  /**
   * Parses HTML content into JSON using the provided extensions.
   *
   * This is useful when you need to convert HTML to Tiptap's JSON format
   * without creating an editor instance.
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
    return generateJSON(content, [
      ...extensions,
    ]);
  }

  /** Converts editor content (JSON or string) to an HTML string. */
  toHTML(content?: Content): string {
    if (!content) {
      return "";
    }

    if (typeof content === "string") {
      content = Editor.generateJSON(content, [
        ...this.#extensions,
      ]);
    }

    return Editor.generateHTML(content, [
      ...this.#extensions,
    ]);
  }

  /** Renders the editor with its toolbar as a JSX element. */
  render(
    { content = "", "on-change": change, inputName, inputId }:
      EditorRenderProps = {},
  ): JSX.Element {
    const elementRef = $ref<Element | null>(null);
    const inputRef = $ref<HTMLInputElement | null>(null);
    const editorRef = $ref<Tiptap | null>(null);

    const revision$ = $signal<number>(0);

    function updateRevision() {
      revision$.set(revision$.get() + 1);
    }

    const { htmlContent } = $computed(() => {
      return {
        changed: revision$.get() !== 0,
        revision: revision$.get(),
        htmlContent: editorRef.get?.getHTML() || this.toHTML(content),
      };
    }).get();

    $mount(() => {
      const element = elementRef.get;

      if (element) {
        const tiptap = new Tiptap({
          element,
          extensions: [
            ...this.#extensions,
          ],
          content,
          ...this.#initOptions,
        });

        tiptap.on("selectionUpdate", () => updateRevision());
        tiptap.on("transaction", () => updateRevision());
        tiptap.on("update", (event) => {
          updateRevision();

          if (inputRef.get instanceof HTMLInputElement) {
            inputRef.get.value = this.toHTML(event.editor.getHTML());
          }

          if (typeof change === "function") {
            change(event.editor.getJSON());
          }
        });

        editorRef.set = tiptap;
      }
      return () => {
        return editorRef.get?.destroy();
      };
    });

    const toolbarElements = this.#toolbarElements.map((toolbarElement) =>
      toolbarElement(editorRef)
    );

    return (
      <div class="rich-text-editor">
        {!!toolbarElements?.length && <ToolBar>{toolbarElements}</ToolBar>}
        <div bind={elementRef} />
        {inputName && (
          <input
            bind={inputRef}
            value={htmlContent}
            name={inputName}
            id={inputId}
            hidden
          />
        )}
      </div>
    );
  }
}

/** Props accepted by {@linkcode Editor.render}. */
export interface EditorRenderProps extends Omit<Props, "children"> {
  /** Initial content to populate the editor with. */
  content?: Content;
  /** Name attribute for the hidden `<input>` that holds the serialised HTML. */
  inputName?: string;
  /** Id attribute for the hidden `<input>`. that holds the serialised HTML.*/
  inputId?: string;
  /** Callback fired whenever the editor content changes. */
  // deno-lint-ignore no-explicit-any
  "on-change"?: (content: DocumentType<any>) => void;
}

/** Props accepted by {@linkcode RichTextEditor}. */
export interface RichTextEditorProps {
  /** When `true` the editor is interactive; otherwise content is rendered as static HTML. */
  editable?: boolean;
  /** Initial content for the editor. */
  content?: Content;
  /** Extensions to enable in the editor. */
  extensions: EditorExtension<Mark | Node | Extension>[];
  /** Name attribute for the hidden `<input>` that holds the serialised HTML. */
  inputName?: string;
  /** Id attribute for the hidden `<input>`. */
  inputId?: string;
  /** Callback fired whenever the editor content changes. */
  "on-change"?: (content: DocumentType) => void;
}

/**
 * A ready-to-use rich text editor component.
 *
 * Renders an interactive Tiptap editor when `editable` is `true`, or static
 * HTML otherwise. An optional hidden `<input>` is rendered when `inputName` is
 * provided so the serialised HTML can be submitted with a form.
 */
export function RichTextEditor(
  {
    editable = false,
    content,
    "on-change": change,
    extensions,
    inputName,
    inputId,
  }: RichTextEditorProps,
): JSX.Element {
  const editorRef = $ref(new Editor(extensions));

  return (
    <>
      {editable
        /*"editor.render()" not called as JSX Component" so signals based reactivity
         * is delegated to this "<RichTextEditor>" component
         */
        ? editorRef.get.render({
          "on-change": change,
          content,
          inputId,
          inputName,
        })
        : (
          <>
            <div
              dangerouslySetInnerHTML={{
                __html: editorRef.get.toHTML(content),
              }}
            />
            {(inputName || inputId) &&
              (
                <input
                  type="hidden"
                  name={inputName}
                  id={inputId}
                  value={editorRef.get.toHTML(content)}
                />
              )}
          </>
        )}
    </>
  );
}
