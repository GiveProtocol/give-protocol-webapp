import React, { useCallback } from "react";
import { cn } from "@/utils/cn";

interface CategoryChip {
  id: string;
  label: string;
  state?: string;
}

const CATEGORIES: CategoryChip[] = [
  { id: "all", label: "All" },
  { id: "ca", label: "California", state: "CA" },
  { id: "ny", label: "New York", state: "NY" },
  { id: "tx", label: "Texas", state: "TX" },
  { id: "education", label: "Education" },
  { id: "disaster", label: "Disaster Relief" },
  { id: "climate", label: "Climate" },
  { id: "health", label: "Health" },
  { id: "animals", label: "Animals" },
  { id: "arts", label: "Arts" },
];

interface CategoryChipsProps {
  activeState: string;
  onChange: (_filter: { state?: string }) => void;
}

/**
 * Horizontal pill row of discovery category/region chips. Selecting a state-based chip
 * propagates the state code to the parent; other chips currently only visually highlight.
 */
export const CategoryChips: React.FC<CategoryChipsProps> = ({
  activeState,
  onChange,
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const { state } = e.currentTarget.dataset;
      onChange({ state: state ?? "" });
    },
    [onChange],
  );

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {CATEGORIES.map((chip) => {
        const isActive =
          chip.state === activeState ||
          (chip.id === "all" && !activeState);
        return (
          <button
            key={chip.id}
            type="button"
            data-state={chip.state ?? ""}
            onClick={handleClick}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              isActive
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};
