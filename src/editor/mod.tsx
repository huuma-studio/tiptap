import { $mount } from "@huuma/ui/hooks/lifecycle";
import { $ref } from "@huuma/ui/hooks/ref";
import type { Ref } from "@huuma/ui/ref";
import type { Props } from "@huuma/ui";

import {
  type DocumentType,
  Editor as Tiptap,
  type Mark,
  type Node,
} from "@tiptap/core";

import { generateHTML } from "@tiptap/html";

import type { JSX } from "@huuma/ui/jsx-runtime";
import { ToolBar } from "./toolbar.tsx";

// deno-lint-ignore no-explicit-any
export interface EditorExtension<T extends Mark | Node = any> {
  extension: T;
  toolbarElement?: (editorRef: Ref<Tiptap | null>) => JSX.Element;
}

export class Editor {
  private extensions: EditorExtension[];

  constructor(extensions: EditorExtension[]) {
    this.extensions = extensions;
  }

  toHTML(content: DocumentType): string {
    return generateHTML(content, [
      ...this.extensions.map((extension) => extension.extension),
    ]);
  }

  render(props: EditorRenderProps = {}): JSX.Element {
    const { content = "<p>Hello</p>", "on-change": change } = props;
    const elementRef = $ref<Element | null>(null);
    const editorRef = $ref<Tiptap | null>(null);

    $mount(() => {
      const element = elementRef.get;

      if (element) {
        const tiptap = new Tiptap({
          element,
          extensions: [
            ...this.extensions.map((extension) => extension.extension),
          ],
          content,
        });

        if (typeof change === "function") {
          tiptap.on("update", (event) => {
            console.log(event.editor.getJSON());
            change(event.editor.getJSON());
          });
        }

        editorRef.set = tiptap;
      }
      return () => {
        return editorRef.get?.destroy();
      };
    });

    return (
      <div class="rich-text-editor">
        <ToolBar>
          {this.extensions.map((extension) =>
            extension.toolbarElement?.(editorRef)
          )}
        </ToolBar>
        <div bind={elementRef} />
      </div>
    );
  }
}

export interface EditorRenderProps extends Omit<Props, "children"> {
  content?: string | DocumentType;
  // deno-lint-ignore no-explicit-any
  "on-change"?: (content: DocumentType<any>) => void;
}

export interface RichTextEditorProps {
  editable?: boolean;
  content?: DocumentType;
  extensions: EditorExtension[];
  "on-change"?: (content: DocumentType) => void;
}
export function RichTextEditor(
  { editable = false, content, "on-change": change, extensions }:
    RichTextEditorProps,
): JSX.Element {
  const editor = new Editor(extensions);
  return (editable ? editor.render({ "on-change": change, content }) : (
    <div
      dangerouslySetInnerHTML={{
        __html: content ? editor.toHTML(content) : "Empty",
      }}
    />
  ));
}
