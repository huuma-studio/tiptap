import { Markdown } from "@tiptap/markdown";
import type { EditorExtension } from "../editor/mod.tsx";

const MarkdownExtension: EditorExtension<typeof Markdown> = {
  extension: Markdown,
  initOptions: {
    contentType: "markdown",
  },
};

export default MarkdownExtension;
