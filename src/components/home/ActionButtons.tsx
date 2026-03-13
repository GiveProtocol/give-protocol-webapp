import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * ActionButtons component renders call-to-action buttons for the home page.
 *
 * @returns {JSX.Element} A container with a 'Start Donating' button linking to the browse page.
 */
export const ActionButtons: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-12 flex justify-center">
      <Link
        to="/browse"
        className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all duration-200"
      >
        {t("home.startDonating", "Start Donating")}
      </Link>
    </div>
  );
};
