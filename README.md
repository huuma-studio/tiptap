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

## Theming

The registered stylesheet is token-driven: toolbar buttons, active states, code,
tables, borders, and the focus outline all read `--color-primary-*` design
tokens (with light-mode fallbacks), so apps that define those tokens re-theme
the editor automatically.

Dark mode is opt-in via the Tailwind class convention: apps that toggle a `dark`
class on `<html>` (or any ancestor of the editor) get a dark editor surface
(`rgb(20 24 29)`) automatically. The dark rule is wrapped in
`:where(.dark, .dark *)`, which contributes no specificity, so app-level
overrides (e.g. `.dark .rich-text-editor { … }`) always win. Apps without a
`dark` class keep the original white surface.

To customize the editor surface in either mode, set a single CSS variable:

```css
:root {
  --rich-text-editor-bg-color: var(--color-gray-50);
}
```

## Extensions

### Nodes

- `@huuma/tiptap/nodes/text` — Document, Paragraph, and Text (required)
- `@huuma/tiptap/nodes/heading` — Headings (levels 1–3 by default, configurable
  via `HeadingExtension.configure([1, 2])`)
- `@huuma/tiptap/nodes/extension-list` — Bullet list and list item
- `@huuma/tiptap/nodes/code-block` — Fenced code blocks
- `@huuma/tiptap/nodes/table` — Table, table row, table cell, and table header

### Marks

- `@huuma/tiptap/marks/bold` — Bold
- `@huuma/tiptap/marks/italic` — Italic
- `@huuma/tiptap/marks/link` — Link
- `@huuma/tiptap/marks/code` — Inline code

### Other

- `@huuma/tiptap/markdown` — Enables Markdown as the content format
- `@huuma/tiptap/schema` — Validation schema for Tiptap document JSON
  (integrates with `@huuma/validate`)

## Development

Install [Vite+](https://viteplus.dev/guide/) and use the pinned Node.js and pnpm versions:

```sh
vp install
vp check
vp test
```

`vp check` checks formatting, lint rules, and TypeScript types; `vp test` runs the tests with Vitest.

## Publishing

The package is published as TypeScript source to [JSR](https://jsr.io/@huuma/tiptap). Package metadata, exports, and the publishing file list are defined in `jsr.json`; `package.json` configures dependencies and development commands. No build step is required.

```sh
vp run publish:check
vp run release
```

`publish:check` validates the package without uploading it. To release a new version, update `version` in `jsr.json`. CI runs checks, tests, and a publishing dry run for pull requests and pushes to `main`, then publishes pushes to `main` using JSR's GitHub OIDC authentication.

## License

MIT
