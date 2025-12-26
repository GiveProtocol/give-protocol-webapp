import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

export const ActionButtons: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-12 flex justify-center">
      <Link
        to="/browse"
        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {t("home.startDonating", "Start Donating")}
      </Link>
    </div>
  );
};
