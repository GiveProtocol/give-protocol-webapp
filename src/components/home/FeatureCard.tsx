import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * FeatureCard component used to display an icon, title, and description in a styled card.
 *
 * @param Icon - The icon component to render.
 * @param title - The title text to display.
 * @param description - The description text to display.
 * @returns A styled feature card element.
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  Icon,
  title,
  description,
}) => {
  return (
    <div className="group bg-white/70 dark:bg-white/5 backdrop-blur-lg border border-black/5 dark:border-white/40 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 hover:border-emerald-300/30 dark:hover:border-emerald-500/30 transition-all hover:scale-[1.02]">
      <div className="flex justify-center">
        <Icon
          className="h-12 w-12 text-emerald-600 dark:text-emerald-400"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
};
