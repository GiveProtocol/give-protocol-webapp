import { useState, useEffect, type ReactNode } from "react";

/**
 * Wrapper that only renders children on the client after hydration.
 * Use this around components that depend on browser APIs (wallet, localStorage, etc.)
 * to prevent SSR hydration mismatches.
 *
 * @param children - Content to render only on the client
 * @param fallback - Optional placeholder to render during SSR and first client render
 * @returns Children after mount, fallback before
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{children}</> : <>{fallback}</>;
}
