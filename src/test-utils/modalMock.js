// Mock for @/components/ui/Modal
// Renders title, children, and footer without Portal or isOpen gating.
export const Modal = ({
  title,
  children,
  footer,
  onClose: _onClose,
  isOpen: _isOpen,
  size: _size,
  closeOnBackdrop: _closeOnBackdrop,
  closeOnEscape: _closeOnEscape,
  showCloseButton: _showCloseButton,
  className: _className,
  ...props
}) => (
  <div data-testid="modal" {...props}>
    {title && <h2>{title}</h2>}
    <div>{children}</div>
    {footer && <div>{footer}</div>}
  </div>
);

export default Modal;
