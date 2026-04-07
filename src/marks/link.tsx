import Link from "@tiptap/extension-link";
import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";
import LinkIcon from "@huuma/icons/lucide/link";

const LinkExtension: EditorExtension<typeof Link> = {
  extension: Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: "noopener noreferrer",
      target: "_blank",
    },
  }),
  toolbarElement: (
    editor,
  ) => {
    return (
      <ToolBarButton
        active={editor.get?.isActive("link")}
        on-click={() => {
          if (editor.get?.isActive("link")) {
            editor.get?.chain().focus().unsetLink().run();
            return;
          }

          const url = globalThis.prompt("URL");
          if (url) {
            editor.get?.chain().focus().setLink({ href: url }).run();
          }
        }}
      >
        <LinkIcon size={18} />
      </ToolBarButton>
    );
  },
};

export default LinkExtension;
