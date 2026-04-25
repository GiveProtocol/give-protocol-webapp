import React, { useState, useEffect, useCallback, useMemo } from "react";
import { X, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWeb3 } from "@/contexts/Web3Context";
import { Logger } from "@/utils/logger";

interface OnboardingMeta {
  dismissed?: boolean;
  completedItems?: string[];
}

interface ChecklistItemDef {
  id: string;
  label: string;
  description: string;
  actionLabel?: string;
  actionTab?: string;
}

const CHECKLIST_ITEMS: ChecklistItemDef[] = [
  {
    id: "complete_profile",
    label: "Complete organization profile",
    description:
      "Add your organization name, description, address, and contact info.",
    actionLabel: "Go to Organization",
    actionTab: "organization",
  },
  {
    id: "upload_logo",
    label: "Upload logo or banner image",
    description: "Add a logo or banner to help donors recognize your charity.",
    actionLabel: "Go to Organization",
    actionTab: "organization",
  },
  {
    id: "connect_wallet",
    label: "Connect wallet for receiving donations",
    description:
      "Link a crypto wallet so donors can send funds directly to you.",
  },
  {
    id: "bank_details",
    label: "Set up bank details for fiat off-ramp",
    description:
      "Optional: configure banking info if you want to accept card donations.",
  },
  {
    id: "accept_terms",
    label: "Review and accept terms of service",
    description:
      "Read and confirm the Give Protocol charity terms and conditions.",
  },
];

const META_KEY = "onboarding_checklist";

interface CharityOnboardingChecklistProps {
  /** The profile row ID from the `profiles` table */
  profileId: string;
  /** The charity's registered wallet address for address-match validation */
  walletAddress?: string | null;
  /** Called when user clicks an action to navigate to a specific tab */
  onNavigateTab?: (_tab: string) => void;
}

/**
 * Post-approval onboarding checklist banner for newly approved charities.
 * Persists progress in `profiles.meta.onboarding_checklist`.
 *
 * @param props.profileId - The charity profile ID to store checklist state
 * @param props.walletAddress - The charity's registered wallet address
 * @param props.onNavigateTab - Optional callback to navigate to a portal tab
 * @returns The onboarding checklist panel, or null when dismissed/complete
 */
export const CharityOnboardingChecklist: React.FC<
  CharityOnboardingChecklistProps
> = ({ profileId, walletAddress, onNavigateTab }) => {
  const { isConnected, address } = useWeb3();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load persisted state from profiles.meta
  useEffect(() => {
    let isMounted = true;

    /** Fetches onboarding state from profiles.meta in Supabase. */
    const loadState = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("meta")
          .eq("id", profileId)
          .single();

        if (!isMounted) return;

        if (error) {
          Logger.warn("Could not load onboarding state", { error, profileId });
          return;
        }

        const meta = (data?.meta as Record<string, unknown>) || {};
        const checklist = (meta[META_KEY] as OnboardingMeta) || {};

        if (checklist.dismissed) {
          setDismissed(true);
        }
        if (Array.isArray(checklist.completedItems)) {
          setCompletedItems(new Set(checklist.completedItems));
        }
      } catch (err) {
        Logger.warn("Exception loading onboarding state", {
          error: err,
          profileId,
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadState();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  // Auto-mark wallet connected when Web3 connects with the correct address
  useEffect(() => {
    if (!address || !walletAddress) return;
    const addressesMatch =
      address.toLowerCase() === walletAddress.toLowerCase();
    if (
      isConnected &&
      addressesMatch &&
      !completedItems.has("connect_wallet")
    ) {
      setCompletedItems((prev) => new Set([...prev, "connect_wallet"]));
    }
  }, [isConnected, address, walletAddress, completedItems]);

  /** Persists onboarding state to profiles.meta in Supabase. */
  const persistState = useCallback(
    async (newCompleted: Set<string>, newDismissed: boolean) => {
      try {
        const { data: currentData, error: fetchError } = await supabase
          .from("profiles")
          .select("meta")
          .eq("id", profileId)
          .single();

        if (fetchError) {
          Logger.warn("Could not fetch meta for onboarding persist", {
            error: fetchError,
            profileId,
          });
          return;
        }

        const currentMeta =
          (currentData?.meta as Record<string, unknown>) || {};
        const updatedMeta = {
          ...currentMeta,
          [META_KEY]: {
            dismissed: newDismissed,
            completedItems: Array.from(newCompleted),
          },
        };

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ meta: updatedMeta })
          .eq("id", profileId);

        if (updateError) {
          Logger.warn("Could not persist onboarding state", {
            error: updateError,
            profileId,
          });
        }
      } catch (err) {
        Logger.warn("Exception persisting onboarding state", {
          error: err,
          profileId,
        });
      }
    },
    [profileId],
  );

  const toggleItem = useCallback(
    (itemId: string) => {
      setCompletedItems((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        persistState(next, dismissed);
        return next;
      });
    },
    [dismissed, persistState],
  );

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    persistState(completedItems, true);
  }, [completedItems, persistState]);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const completedCount = useMemo(
    () => CHECKLIST_ITEMS.filter((item) => completedItems.has(item.id)).length,
    [completedItems],
  );

  const allComplete = completedCount === CHECKLIST_ITEMS.length;

  if (loading || dismissed) return null;

  return (
    <section
      className="bg-emerald-50 border border-emerald-200 rounded-xl mb-6 overflow-hidden"
      aria-label="Onboarding checklist"
    >
      <ChecklistHeader
        completedCount={completedCount}
        totalCount={CHECKLIST_ITEMS.length}
        allComplete={allComplete}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        onDismiss={handleDismiss}
      />

      {!collapsed && (
        <div className="px-5 pb-5">
          <ul className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                completed={completedItems.has(item.id)}
                onToggle={toggleItem}
                onNavigateTab={onNavigateTab}
              />
            ))}
          </ul>
          {allComplete && (
            <p className="mt-4 text-sm text-emerald-700 font-medium text-center">
              All steps complete! You can dismiss this checklist.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

/** Header row with progress bar, collapse toggle, and dismiss button. */
function ChecklistHeader({
  completedCount,
  totalCount,
  allComplete,
  collapsed,
  onToggleCollapse,
  onDismiss,
}: {
  completedCount: number;
  totalCount: number;
  allComplete: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDismiss: () => void;
}) {
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="px-5 pt-4 pb-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-semibold text-emerald-900">
            Getting Started
          </h2>
          <p className="text-xs text-emerald-700 mt-0.5">
            {completedCount} of {totalCount} steps complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
            aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
          {allComplete && (
            <button
              onClick={onDismiss}
              className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
              aria-label="Dismiss onboarding checklist"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="w-full bg-emerald-200 rounded-full h-1.5">
        <progress className="sr-only" value={progressPercent} max={100} />
        <div
          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/** A single checklist row with checkbox, label, description, and optional action link. */
function ChecklistRow({
  item,
  completed,
  onToggle,
  onNavigateTab,
}: {
  item: ChecklistItemDef;
  completed: boolean;
  onToggle: (_id: string) => void;
  onNavigateTab?: (_tab: string) => void;
}) {
  const handleToggle = useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  const handleAction = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (item.actionTab && onNavigateTab) {
        onNavigateTab(item.actionTab);
      }
    },
    [item.actionTab, onNavigateTab],
  );

  return (
    <li className="flex items-start gap-3">
      <button
        onClick={handleToggle}
        className="mt-0.5 flex-shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors"
        aria-label={completed ? `Uncheck ${item.label}` : `Check ${item.label}`}
        aria-pressed={completed}
      >
        {completed ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${completed ? "line-through text-gray-400" : "text-gray-800"}`}
        >
          {item.label}
        </p>
        {!completed && (
          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
        )}
      </div>
      {item.actionLabel && item.actionTab && onNavigateTab && !completed && (
        <button
          onClick={handleAction}
          className="flex-shrink-0 text-xs text-emerald-600 hover:text-emerald-800 underline transition-colors"
        >
          {item.actionLabel}
        </button>
      )}
    </li>
  );
}
