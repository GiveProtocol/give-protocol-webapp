/**
 * Portal component for rendering children outside the DOM hierarchy
 * Useful for modals, dropdowns, and tooltips that need to escape parent overflow constraints
 */

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  /** Container element ID, defaults to creating a new div */
  containerId?: string;
}

/**
 * Portal component that renders its children into a DOM node outside the parent hierarchy
 * @param props - Portal props containing children and optional containerId
 * @param props.children - React nodes to render in the portal
 * @param props.containerId - Optional ID for a specific container element
 * @returns Portal-rendered children or null during SSR
 */
export const Portal: React.FC<PortalProps> = ({ children, containerId }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const container = containerId
    ? document.getElementById(containerId) || document.body
    : document.body;

  return createPortal(children, container);
};

export default Portal;
