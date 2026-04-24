// Mock for @/components/ui/Tabs
// Provides simplified tab components for tests
import React from "react";

const TabsContext = React.createContext(null);

/** @returns {React.ReactElement} Mock Tabs container with context provider */
export const Tabs = ({ defaultValue, value, children, className, onValueChange }) => {
  const [currentValue, setCurrentValue] = React.useState(value || defaultValue);

  const handleChange = React.useCallback(
    (newValue) => {
      setCurrentValue(newValue);
      if (onValueChange) onValueChange(newValue);
    },
    [onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({ value: currentValue, onChange: handleChange }),
    [currentValue, handleChange],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

/** @returns {React.ReactElement} Mock TabsList wrapper */
export const TabsList = ({ children, className }) => (
  <div role="tablist" className={className}>
    {children}
  </div>
);

/** @returns {React.ReactElement} Mock TabsTrigger button */
export const TabsTrigger = ({ value, children }) => {
  const context = React.useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={context?.value === value}
      onClick={() => context?.onChange(value)}
    >
      {children}
    </button>
  );
};

/** @returns {React.ReactElement|null} Mock TabsContent panel, renders only when active */
export const TabsContent = ({ value, children }) => {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return <div role="tabpanel">{children}</div>;
};
