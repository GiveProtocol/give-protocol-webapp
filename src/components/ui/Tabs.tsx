import React, { useCallback, useId, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface TabsContextValue {
  value: string;
  onChange: (_value: string) => void;
  idPrefix: string;
  tabValues: React.MutableRefObject<string[]>;
}

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  const [value, setValue] = React.useState(defaultValue);
  const idPrefix = useId();
  const tabValues = useRef<string[]>([]);

  const contextValue = React.useMemo(
    () => ({ value, onChange: setValue, idPrefix, tabValues }),
    [value, idPrefix]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('space-y-2', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div role="tablist" className={cn('flex space-x-1 rounded-lg bg-gray-100 p-1', className)}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;
  const tabId = `${context.idPrefix}-tab-${value}`;
  const panelId = `${context.idPrefix}-panel-${value}`;

  useEffect(() => {
    const vals = context.tabValues.current;
    if (!vals.includes(value)) {
      vals.push(value);
    }
    return () => {
      const idx = vals.indexOf(value);
      if (idx !== -1) vals.splice(idx, 1);
    };
  }, [value, context.tabValues]);

  const handleClick = useCallback(() => {
    context.onChange(value);
  }, [context, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    const vals = context.tabValues.current;
    const currentIdx = vals.indexOf(value);
    let nextIdx = -1;

    if (e.key === 'ArrowRight') {
      nextIdx = (currentIdx + 1) % vals.length;
    } else if (e.key === 'ArrowLeft') {
      nextIdx = (currentIdx - 1 + vals.length) % vals.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = vals.length - 1;
    }

    if (nextIdx !== -1) {
      e.preventDefault();
      const nextValue = vals[nextIdx];
      context.onChange(nextValue);
      const nextTab = document.getElementById(`${context.idPrefix}-tab-${nextValue}`);
      if (nextTab) nextTab.focus();
    }
  }, [context, value]);

  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus:outline-none',
        isActive
          ? 'bg-white text-gray-900 shadow'
          : 'text-gray-600 hover:text-gray-900',
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ value: _value, children, className }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== _value) return null;

  const tabId = `${context.idPrefix}-tab-${_value}`;
  const panelId = `${context.idPrefix}-panel-${_value}`;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
};
