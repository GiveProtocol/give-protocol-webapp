import React, { useState, useRef, useEffect, useCallback } from "react";
import { Settings, Check, Globe, DollarSign } from "lucide-react";
import { useSettings, Language, Currency } from "@/contexts/SettingsContext";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/hooks/useTranslation";

export const SettingsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    languageOptions,
    currencyOptions,
  } = useSettings();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleLanguageChange = useCallback(
    (newLanguage: Language) => {
      setLanguage(newLanguage);
      // The language change will be handled by the useTranslation hook
    },
    [setLanguage],
  );

  const handleCurrencyChange = useCallback(
    (newCurrency: Currency) => {
      setCurrency(newCurrency);
    },
    [setCurrency],
  );

  const toggleMenu = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleLanguageClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const value = e.currentTarget.dataset.value as Language;
      if (value) {
        handleLanguageChange(value);
      }
    },
    [handleLanguageChange],
  );

  const handleCurrencyClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const value = e.currentTarget.dataset.value as Currency;
      if (value) {
        handleCurrencyChange(value);
      }
    },
    [handleCurrencyChange],
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2 px-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">
              {t("settings.title")}
            </h3>
          </div>

          {/* Language Selection */}
          <div className="py-3 px-4 border-b border-gray-100">
            <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700">
              <Globe className="h-4 w-4 text-gray-500 mr-2" />
              {t("settings.language")}
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  data-value={option.value}
                  onClick={handleLanguageClick}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md",
                    language === option.value
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <span>{option.label}</span>
                  {language === option.value && (
                    <Check className="h-4 w-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div className="py-3 px-4">
            <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
              {t("settings.currency")}
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {currencyOptions.map((option) => (
                <button
                  key={option.value}
                  data-value={option.value}
                  onClick={handleCurrencyClick}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md",
                    currency === option.value
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <span>
                    {option.symbol} {option.value}
                  </span>
                  {currency === option.value && (
                    <Check className="h-4 w-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
