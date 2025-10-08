import React from "react";
import { cn } from "../../utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * Flexible card container component with consistent styling and hover effects.
 * Provides a clean, elevated surface for content grouping.
 *
 * @function Card
 * @param {CardProps} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hover=true] - Whether to show hover effects
 * @returns {JSX.Element} The rendered card component
 * @example
 * ```typescript
 * // Basic card with content
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * // Card without hover effects
 * <Card hover={false} className="border-2 border-blue-200">
 *   <StaticContent />
 * </Card>
 *
 * // Custom styled card
 * <Card className="bg-gradient-to-r from-purple-400 to-pink-400">
 *   <ColorfulContent />
 * </Card>
 * ```
 */
export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-card border border-gray-100",
        hover &&
          "transition-all duration-200 ease-in-out hover:shadow-card-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}
