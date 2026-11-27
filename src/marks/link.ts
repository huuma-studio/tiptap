/**
 * Link mark extension for the rich text editor.
 *
 * Links open in a new tab with `rel="noopener noreferrer"` by default. A
 * link whose `href` isn't allowed (e.g. `javascript:`) renders as its text,
 * not as a link to the page itself.
 *
 * @module
 */

import Link from "@tiptap/extension-link";
import { jsx } from "@huuma/ui/jsx-runtime";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";
import LinkIcon from "@huuma/icons/lucide/link";

/**
 * Tiptap's link mark, rendering a link whose `href` it doesn't allow as a
 * plain `<span>` (Tiptap's own keeps the `<a>`, with an empty `href`).
 */
const SafeLink: typeof Link = Link.extend({
  renderHTML(props) {
    const spec = this.parent?.(props);
    if (Array.isArray(spec) && spec[0] === "a") {
      const attrs = spec[1] as Record<string, unknown> | undefined;
      if (!attrs?.href) return ["span", {}, 0];
    }
    return spec ?? ["span", {}, 0];
  },
});

/** Tiptap link mark with a toolbar toggle button that prompts for a URL. */
const LinkExtension: EditorExtension<typeof Link> = {
  extension: SafeLink.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: "noopener noreferrer",
      target: "_blank",
    },
  }),
  toolbarElement: (editor) => {
    return jsx(ToolBarButton, {
      active: editor.get?.isActive("link"),
      label: editor.get?.isActive("link") ? "Remove link" : "Link",
      "on-click": () => {
        if (editor.get?.isActive("link")) {
          editor.get?.chain().focus().unsetLink().run();
          return;
        }

        const url = globalThis.prompt("URL");
        if (url) {
          editor.get?.chain().focus().setLink({ href: url }).run();
        }
      },
      children: jsx(LinkIcon, { size: 18 }),
    });
  },
};

export default LinkExtension;
