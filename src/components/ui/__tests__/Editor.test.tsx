import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editor } from '../Editor';

// Create mock functions at module level
const mockRun = jest.fn();
const mockIsActive = jest.fn(() => false);
const mockGetHTML = jest.fn(() => '<p>Test content</p>');
const mockChain = jest.fn(() => ({
  focus: jest.fn(() => ({
    toggleBold: jest.fn(() => ({ run: mockRun })),
    toggleItalic: jest.fn(() => ({ run: mockRun })),
    toggleHeading: jest.fn(() => ({ run: mockRun })),
    toggleBulletList: jest.fn(() => ({ run: mockRun })),
    toggleOrderedList: jest.fn(() => ({ run: mockRun })),
    setLink: jest.fn(() => ({ run: mockRun })),
    undo: jest.fn(() => ({ run: mockRun })),
    redo: jest.fn(() => ({ run: mockRun }))
  }))
}));

const createMockEditor = () => ({
  chain: mockChain,
  isActive: mockIsActive,
  getHTML: mockGetHTML
});

let mockEditorInstance: ReturnType<typeof createMockEditor> | null = createMockEditor();

// Mock TipTap editor
jest.mock('@tiptap/react', () => ({
  useEditor: () => mockEditorInstance,
  EditorContent: ({ editor, className }: { editor: unknown; className?: string }) => (
    editor ? <div className={className} data-testid="editor-content">Editor Content</div> : null
  )
}));

jest.mock('@tiptap/starter-kit', () => ({
  default: {}
}));

jest.mock('@tiptap/extension-link', () => ({
  default: {
    configure: () => ({})
  }
}));

describe('Editor Component', () => {
  const defaultProps = {
    content: '<p>Initial content</p>',
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEditorInstance = createMockEditor();
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
    render(<Editor {...defaultProps} />);

    const boldButton = screen.getByTitle('Bold');
    fireEvent.click(boldButton);

    expect(boldButton).toBeInTheDocument();
  });

  it('handles link button click and shows modal', () => {
    render(<Editor {...defaultProps} />);

    const linkButton = screen.getByTitle('Add Link');
    fireEvent.click(linkButton);

    // The link modal should appear
    expect(screen.getByText('Add Link')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
  });

  it('closes link modal when cancel is clicked', () => {
    render(<Editor {...defaultProps} />);

    // Open modal
    const linkButton = screen.getByTitle('Add Link');
    fireEvent.click(linkButton);

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    // Modal should be closed (no URL input visible)
    expect(screen.queryByPlaceholderText('https://example.com')).not.toBeInTheDocument();
  });

  it('returns null when editor is not initialized', () => {
    mockEditorInstance = null;

    const { container } = render(<Editor {...defaultProps} />);

    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    render(<Editor {...defaultProps} className="custom-class" />);

    // The container div should have the custom class
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});
