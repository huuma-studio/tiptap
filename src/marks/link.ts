/**
 * Link mark extension for the rich text editor.
 *
 * Links open in a new tab with `rel="noopener noreferrer"` by default.
 *
 * @module
 */

import Link from "@tiptap/extension-link";
import { jsx } from "@huuma/ui/jsx-runtime";
import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";
import LinkIcon from "@huuma/icons/lucide/link";

/** Tiptap link mark with a toolbar toggle button that prompts for a URL. */
const LinkExtension: EditorExtension<typeof Link> = {
  extension: Link.configure({
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
