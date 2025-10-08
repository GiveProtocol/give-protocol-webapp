import React, { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { cn } from "../../utils/cn";

interface EditorProps {
  id?: string;
  content: string;
  onChange: (_content: string) => void;
  className?: string;
  placeholder?: string;
  variant?: "default" | "enhanced";
}

interface MenuButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  onClick,
  active,
  icon: Icon,
  title,
}) => (
  <Button
    type="button"
    variant="secondary"
    onClick={onClick}
    className={cn("p-2", active && "bg-indigo-100 text-indigo-900")}
    title={title}
  >
    <Icon className="h-4 w-4" />
  </Button>
);

export const Editor: React.FC<EditorProps> = ({
  id,
  content: _content,
  onChange,
  className,
  placeholder = "Start writing...",
  variant = "default",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 hover:text-indigo-800 underline",
        },
      }),
    ],
    content: _content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none",
        placeholder,
      },
    },
  });

  const handleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const handleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const handleHeading1 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  }, [editor]);

  const handleHeading2 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  }, [editor]);

  const handleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const handleLink = useCallback(() => {
    setShowLinkModal(true);
    setLinkUrl("");
  }, []);

  const handleLinkSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (linkUrl.trim()) {
        editor?.chain().focus().setLink({ href: linkUrl.trim() }).run();
      }
      setShowLinkModal(false);
      setLinkUrl("");
    },
    [editor, linkUrl],
  );

  const handleLinkCancel = useCallback(() => {
    setShowLinkModal(false);
    setLinkUrl("");
  }, []);

  const handleLinkUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLinkUrl(e.target.value);
    },
    [],
  );

  const handleUndo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const containerClasses =
    variant === "enhanced"
      ? "border-[1.5px] border-[#e1e4e8] rounded-lg transition-all duration-200 focus-within:border-[#0366d6] focus-within:shadow-[0_0_0_3px_rgba(3,102,214,0.1)]"
      : "border border-gray-200 rounded-lg";

  const editorClasses =
    variant === "enhanced"
      ? "px-4 py-3 min-h-[200px] max-h-[600px] overflow-y-auto bg-[#fafbfc] focus-within:bg-white"
      : "p-4 min-h-[200px] max-h-[600px] overflow-y-auto bg-indigo-50";

  const toolbarClasses =
    variant === "enhanced"
      ? "border-b border-[#e1e4e8] p-2 flex flex-wrap gap-1 bg-[#fafbfc]"
      : "border-b border-gray-200 p-2 flex flex-wrap gap-1";

  return (
    <div id={id} className={cn(containerClasses, className)}>
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-medium">Add Link</h3>
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <Input
                label="URL"
                type="url"
                value={linkUrl}
                onChange={handleLinkUrlChange}
                placeholder="https://example.com"
              />
              <footer className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLinkCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Link</Button>
              </footer>
            </form>
          </div>
        </div>
      )}
      <div className={toolbarClasses}>
        <MenuButton
          onClick={handleBold}
          active={editor.isActive("bold")}
          icon={Bold}
          title="Bold"
        />
        <MenuButton
          onClick={handleItalic}
          active={editor.isActive("italic")}
          icon={Italic}
          title="Italic"
        />
        <MenuButton
          onClick={handleHeading1}
          active={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          title="Heading 1"
        />
        <MenuButton
          onClick={handleHeading2}
          active={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          title="Heading 2"
        />
        <MenuButton
          onClick={handleBulletList}
          active={editor.isActive("bulletList")}
          icon={List}
          title="Bullet List"
        />
        <MenuButton
          onClick={handleOrderedList}
          active={editor.isActive("orderedList")}
          icon={ListOrdered}
          title="Numbered List"
        />
        <MenuButton
          onClick={handleLink}
          active={editor.isActive("link")}
          icon={LinkIcon}
          title="Add Link"
        />
        <div className="ml-auto flex gap-1">
          <MenuButton onClick={handleUndo} icon={Undo} title="Undo" />
          <MenuButton onClick={handleRedo} icon={Redo} title="Redo" />
        </div>
      </div>
      <EditorContent editor={editor} className={editorClasses} />
    </div>
  );
};
