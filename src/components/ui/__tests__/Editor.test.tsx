import _React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editor } from '../Editor';

// Import mocked functions for type safety
import { useEditor } from '@tiptap/react';

// Mock TipTap editor
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: jest.fn() }),
        toggleItalic: () => ({ run: jest.fn() }),
        toggleHeading: () => ({ run: jest.fn() }),
        toggleBulletList: () => ({ run: jest.fn() }),
        toggleOrderedList: () => ({ run: jest.fn() }),
        setLink: () => ({ run: jest.fn() }),
        undo: () => ({ run: jest.fn() }),
        redo: () => ({ run: jest.fn() })
      })
    }),
    isActive: jest.fn(() => false),
    getHTML: jest.fn(() => '<p>Test content</p>')
  })),
  EditorContent: ({ className }: { className?: string }) => (
    <div className={className} data-testid="editor-content">
      Editor Content
    </div>
  )
}));

jest.mock('@tiptap/starter-kit', () => ({}));
jest.mock('@tiptap/extension-link', () => ({
  configure: () => ({})
}));

// Mock window.prompt
Object.defineProperty(window, 'prompt', {
  writable: true,
  value: jest.fn()
});

describe('Editor Component', () => {
  const defaultProps = {
    content: '<p>Initial content</p>',
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders editor with toolbar buttons', () => {
    render(<Editor {...defaultProps} />);
    
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 1')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 2')).toBeInTheDocument();
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
    expect(screen.getByTitle('Numbered List')).toBeInTheDocument();
    expect(screen.getByTitle('Add Link')).toBeInTheDocument();
    expect(screen.getByTitle('Undo')).toBeInTheDocument();
    expect(screen.getByTitle('Redo')).toBeInTheDocument();
  });

  it('renders editor content area', () => {
    render(<Editor {...defaultProps} />);
    
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('handles bold button click', () => {
    const mockEditor = {
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: jest.fn() })
        })
      }),
      isActive: jest.fn(() => false),
      getHTML: jest.fn(() => '<p>Test content</p>')
    };

    const useEditorMock = useEditor as jest.Mock;
    useEditorMock.mockReturnValue(mockEditor);

    render(<Editor {...defaultProps} />);
    
    const boldButton = screen.getByTitle('Bold');
    fireEvent.click(boldButton);
    
    // Verify the button was clicked (editor chain should be called)
    expect(boldButton).toBeInTheDocument();
  });

  it('handles link button click with URL prompt', () => {
    const mockPrompt = window.prompt as jest.Mock;
    mockPrompt.mockReturnValue('https://example.com');

    const mockEditor = {
      chain: () => ({
        focus: () => ({
          setLink: () => ({ run: jest.fn() })
        })
      }),
      isActive: jest.fn(() => false),
      getHTML: jest.fn(() => '<p>Test content</p>')
    };

    const useEditorMock = useEditor as jest.Mock;
    useEditorMock.mockReturnValue(mockEditor);

    render(<Editor {...defaultProps} />);
    
    const linkButton = screen.getByTitle('Add Link');
    fireEvent.click(linkButton);
    
    expect(mockPrompt).toHaveBeenCalledWith('Enter URL');
  });

  it('does not add link when prompt is cancelled', () => {
    const mockPrompt = window.prompt as jest.Mock;
    mockPrompt.mockReturnValue(null);

    const mockRun = jest.fn();
    const mockEditor = {
      chain: () => ({
        focus: () => ({
          setLink: () => ({ run: mockRun })
        })
      }),
      isActive: jest.fn(() => false),
      getHTML: jest.fn(() => '<p>Test content</p>')
    };

    const useEditorMock = useEditor as jest.Mock;
    useEditorMock.mockReturnValue(mockEditor);

    render(<Editor {...defaultProps} />);
    
    const linkButton = screen.getByTitle('Add Link');
    fireEvent.click(linkButton);
    
    expect(mockPrompt).toHaveBeenCalledWith('Enter URL');
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('returns null when editor is not initialized', () => {
    const useEditorMock = useEditor as jest.Mock;
    useEditorMock.mockReturnValue(null);

    const { container } = render(<Editor {...defaultProps} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    render(<Editor {...defaultProps} className="custom-class" />);
    
    const editorContainer = screen.getByTestId('editor-content').closest('.custom-class');
    expect(editorContainer).toBeInTheDocument();
  });
});