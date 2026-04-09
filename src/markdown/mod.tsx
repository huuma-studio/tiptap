import { Markdown } from "@tiptap/markdown";
import type { EditorExtension } from "@huuma/tiptap/editor";

const MarkdownExtension: EditorExtension<typeof Markdown> = {
  extension: Markdown,
  initOptions: {
    contentType: "markdown",
  },
};

export default MarkdownExtension;
