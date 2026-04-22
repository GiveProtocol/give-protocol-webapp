import React from "react";
import { Quote } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useDailyWisdom } from "@/hooks/useDailyWisdom";

/**
 * Static quote card surfaced on the donor hub. The quote is chosen deterministically per
 * calendar day so it stays stable across reloads.
 */
export const DailyWisdomCard: React.FC = () => {
  const quote = useDailyWisdom();

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <Quote aria-hidden="true" className="h-5 w-5" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">
          Daily Wisdom
        </h2>
      </div>
      <blockquote className="mt-4 text-lg leading-snug text-gray-900 dark:text-gray-100">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        — {quote.attribution}
      </p>
    </Card>
  );
};
