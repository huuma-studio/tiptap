# @huuma/tiptap

A rich text editor built on [Tiptap](https://tiptap.dev/) for
[@huuma/ui](https://jsr.io/@huuma/ui) applications.

## Usage

```tsx
import { registerTiptap } from "@huuma/tiptap";
import { RichTextEditor } from "@huuma/tiptap/editor";
import TextExtensions from "@huuma/tiptap/nodes/text";
import HeadingExtension from "@huuma/tiptap/nodes/heading";
import BoldExtension from "@huuma/tiptap/marks/bold";
import ItalicExtension from "@huuma/tiptap/marks/italic";
import LinkExtension from "@huuma/tiptap/marks/link";

// Register the editor stylesheet with your app
registerTiptap(app);

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

`registerTitap` (the earlier, misspelled name) still works.

The modules are plain TypeScript with `jsx()` calls, so they need no JSX
settings in the app and work from npm (via JSR's npm registry) as well as Deno.

### Props

`RichTextEditor` takes:

| Prop | |
| --- | --- |
| `extensions` | The extensions (required). |
| `editable` | Interactive editor when `true`; otherwise the content is rendered as static HTML. |
| `content` | The initial content: Tiptap JSON, or a string (Markdown with the Markdown extension, HTML otherwise). |
| `inputName`, `inputId` | Render a hidden `<input>` holding the content, to submit with a form. |
| `inputFormat` | What the hidden input holds: `"html"` (default), `"json"` or `"markdown"`. |
| `on-change` | `(json, editor)`: on every change, with the Tiptap JSON and the Tiptap editor. |
| `on-blur`, `on-focus` | `(editor, event)`: when the focus leaves or enters the editor (its text and toolbar; moving between them doesn't count). |
| `on-create` | `(editor)`: once the Tiptap editor exists, in the browser. |
| `placeholder` | Text shown while the editor is empty. |
| `label` | The text area's accessible name (`aria-label`). |
| `class` | Classes added to the wrapper (`.rich-text-editor`, or the read-only `<div>`). |
| `toolbar` | `false` hides the toolbar. |
| `toolbarLabel` | The toolbar's accessible name (default "Formatting"). |

### Markdown

With `@huuma/tiptap/markdown` among the extensions, string content is Markdown:
in the editor, rendered read-only, and in the hidden input's first value.
Read it back with `editor.getMarkdown()`, e.g. when the editor loses focus:

```tsx
<RichTextEditor
  editable
  extensions={[...TextExtensions, BoldExtension, MarkdownExtension]}
  content={description}
  placeholder="Add a description…"
  on-blur={(editor) => save(editor.getMarkdown())}
/>;
```

Without an editor, e.g. on the server, convert with the same extensions:

```ts
import { jsonToMarkdown, markdownToJSON } from "@huuma/tiptap/markdown";

const json = markdownToJSON("Hello **world**", extensions);
const markdown = jsonToMarkdown(json, extensions);
```

The `Editor` class also has `toJSON(content)`, `toMarkdown(content)` and
`serialize(content, "html" | "json" | "markdown")`.

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

To customize the editor in either mode, set CSS variables (here with their
defaults):

```css
:root {
  --rich-text-editor-bg-color: white;
  --rich-text-editor-border: 1px solid var(--color-primary-100);
  --rich-text-editor-radius: 0.25rem;
  --rich-text-editor-padding: 0.5rem;
  --rich-text-editor-placeholder-color: rgb(0 0 0 / 0.4);
}
```

They can also be set on one editor through its `class`, e.g. a borderless one
with `--rich-text-editor-border: none`.

## Extensions

### Nodes

- `@huuma/tiptap/nodes/text` — Document, Paragraph, and Text (required)
- `@huuma/tiptap/nodes/heading` — Headings (levels 1–3 by default, configurable
  via `HeadingExtension.configure([1, 2])`)
- `@huuma/tiptap/nodes/extension-list` — Bullet list and list item (default
  export); also `OrderedListExtension` for numbered lists
- `@huuma/tiptap/nodes/code-block` — Fenced code blocks
- `@huuma/tiptap/nodes/blockquote` — Blockquotes
- `@huuma/tiptap/nodes/table` — Table, table row, table cell, and table header

### Marks

- `@huuma/tiptap/marks/bold` — Bold
- `@huuma/tiptap/marks/italic` — Italic
- `@huuma/tiptap/marks/link` — Link
- `@huuma/tiptap/marks/code` — Inline code
- `@huuma/tiptap/marks/strike` — Strikethrough

### Other

- `@huuma/tiptap/markdown` — Enables Markdown as the content format; also
  `markdownToJSON` and `jsonToMarkdown`
- `@huuma/tiptap/schema` — Validation schema for Tiptap document JSON
  (integrates with `@huuma/validate`)

## Upgrading from 0.4

Nothing has to change. 0.5 only adds props, exports and extensions:

- **Same defaults.** The hidden input still holds HTML by default, string
  content without the Markdown extension is still HTML, and the extensions'
  default exports are unchanged.
- **Labelled toolbar.** Toolbar buttons now carry `aria-label`, `title` and
  `aria-pressed`, and the toolbar is a `role="toolbar"`.
- **Toolbar keeps the editor's focus.** Clicking a toolbar button no longer
  takes the focus from the editor.
- **One fix.** With the Markdown extension, a Markdown string is now rendered
  read-only as formatted HTML instead of as its literal text.

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
