// Mock for @tiptap/react
// Mapped via moduleNameMapper to intercept tiptap imports in tests.
// useEditor is a jest.fn() so tests can control the returned editor instance.
import { jest } from "@jest/globals";

export const useEditor = jest.fn(() => null);

/** Mock EditorContent that renders a placeholder when an editor is provided */
export const EditorContent = ({ editor, className }) =>
  editor ? (
    <div className={className} data-testid="editor-content">
      Editor Content
    </div>
  ) : null;
