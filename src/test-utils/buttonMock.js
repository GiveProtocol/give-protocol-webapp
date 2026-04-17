// Mock for @/components/ui/Button
// Renders a plain <button> forwarding all standard props.
export const Button = ({
  children,
  onClick,
  disabled,
  className,
  type,
  variant: _variant,
  size: _size,
  fullWidth: _fullWidth,
  icon: _icon,
  iconPosition: _iconPosition,
  ...props
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={className}
    type={type}
    {...props}
  >
    {children}
  </button>
);
