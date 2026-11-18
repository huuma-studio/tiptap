/**
 * Heading node extension for the rich text editor.
 *
 * Supports heading levels 1–6 with per-level toolbar buttons.
 * The default export can be used as-is (levels 1–3) or configured via
 * `HeadingExtension.configure([1, 2])`.
 *
 * @module
 */

import Heading1Icon from "@huuma/icons/lucide/heading-1";
import Heading2Icon from "@huuma/icons/lucide/heading-2";
import Heading3Icon from "@huuma/icons/lucide/heading-3";
import Heading4Icon from "@huuma/icons/lucide/heading-4";
import Heading5Icon from "@huuma/icons/lucide/heading-5";
import Heading6Icon from "@huuma/icons/lucide/heading-6";
import { Fragment, type JSX, jsx } from "@huuma/ui/jsx-runtime";
import Heading from "@tiptap/extension-heading";
import type { Editor } from "@tiptap/core";
import type { Ref } from "@huuma/ui/ref";

import type { EditorExtension } from "../editor/mod.ts";
import { ToolBarButton } from "../editor/toolbar.ts";

type Levels = (1 | 2 | 3 | 4 | 5 | 6)[];
const defaultLevels: Levels = [1, 2, 3];

const icons = [Heading1Icon, Heading2Icon, Heading3Icon, Heading4Icon, Heading5Icon, Heading6Icon];

const toolbarElement =
  (levels: (1 | 2 | 3 | 4 | 5 | 6)[]) =>
  (editor: Ref<Editor | null>): JSX.Element => {
    return jsx(Fragment, {
      children: levels.map((level) =>
        jsx(
          ToolBarButton,
          {
            active: editor.get?.isActive("heading", { level }),
            label: `Heading ${level}`,
            "on-click": () => {
              editor.get?.chain().focus().toggleHeading({ level }).run();
            },
            children: jsx(icons[level - 1]!, { size: 18 }),
          },
          level,
        ),
      ),
    });
  };

/**
 * Tiptap heading node with toolbar buttons for each enabled level.
 *
 * Use `HeadingExtension.configure([1, 2])` to customise which heading levels
 * are available.
 */
const HeadingExtension: EditorExtension<typeof Heading> & {
  configure: (levels: (1 | 2 | 3 | 4 | 5 | 6)[]) => EditorExtension<typeof Heading>;
} = {
  extension: Heading.configure({ levels: defaultLevels }),
  toolbarElement: toolbarElement(defaultLevels),
  configure: (levels: (1 | 2 | 3 | 4 | 5 | 6)[]) => {
    return {
      extension: Heading.configure({ levels }),
      toolbarElement: toolbarElement(levels),
    };
  },
};

export default HeadingExtension;
