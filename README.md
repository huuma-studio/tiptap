# @huuma/tiptap

A rich text editor built on [Tiptap](https://tiptap.dev/) for
[@huuma/ui](https://jsr.io/@huuma/ui) applications.

## Usage

```tsx
import { registerTitap } from "@huuma/tiptap";
import { RichTextEditor } from "@huuma/tiptap/editor";
import TextExtensions from "@huuma/tiptap/nodes/text";
import HeadingExtension from "@huuma/tiptap/nodes/heading";
import BoldExtension from "@huuma/tiptap/marks/bold";
import ItalicExtension from "@huuma/tiptap/marks/italic";
import LinkExtension from "@huuma/tiptap/marks/link";

// Register the editor stylesheet with your app
registerTitap(app);

// Render an editable rich text editor
<RichTextEditor
  editable
  extensions={[
    ...TextExtensions,
    HeadingExtension,
    BoldExtension,
    ItalicExtension,
    LinkExtension,
  ]}
  on-change={(content) => console.log(content)}
/>;
```

## Extensions

### Nodes

- `@huuma/tiptap/nodes/text` — Document, Paragraph, and Text (required)
- `@huuma/tiptap/nodes/heading` — Headings (levels 1–3 by default, configurable
  via `HeadingExtension.configure([1, 2])`)
- `@huuma/tiptap/nodes/extension-list` — Bullet list and list item

### Marks

- `@huuma/tiptap/marks/bold` — Bold
- `@huuma/tiptap/marks/italic` — Italic
- `@huuma/tiptap/marks/link` — Link

### Other

- `@huuma/tiptap/markdown` — Enables Markdown as the content format
- `@huuma/tiptap/schema` — Validation schema for Tiptap document JSON
  (integrates with `@huuma/validate`)

## License

MIT
