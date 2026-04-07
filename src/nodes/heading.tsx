import Heading from "@tiptap/extension-heading";
import HeadingIcon from "@huuma/icons/lucide/heading";

import type { EditorExtension } from "../editor/mod.tsx";
import { ToolBarButton } from "../editor/toolbar.tsx";

const HeadingExtension: EditorExtension<typeof Heading> = {
  extension: Heading.configure({ levels: [1, 2, 3] }),
  toolbarElement: (editor) => {
    return (
      <>
        {([1, 2, 3] as const).map((level) => (
          <ToolBarButton
            active={editor.get?.isActive("heading", { level })}
            on-click={() => {
              editor.get?.chain().focus().toggleHeading({ level }).run();
            }}
          >
            <HeadingIcon size={18} />
            <span>{level}</span>
          </ToolBarButton>
        ))}
      </>
    );
  },
};

export default HeadingExtension;
