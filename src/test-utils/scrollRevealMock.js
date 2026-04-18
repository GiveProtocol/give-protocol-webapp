// Mock for @/components/ui/ScrollReveal
// Renders children directly without scroll animation.
export const ScrollReveal = ({
  children,
  direction: _direction,
  delay: _delay,
  threshold: _threshold,
  triggerOnce: _triggerOnce,
  className: _className,
}) => <div data-testid="scroll-reveal">{children}</div>;
