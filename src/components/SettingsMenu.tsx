import React, { useState, useRef, useEffect, useCallback } from "react";
import { Settings, Check, Globe, DollarSign, Moon, Sun } from "lucide-react";
import {
  useSettings,
  Language,
  Currency,
  Theme,
} from "@/contexts/SettingsContext";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { getCurrencyByCode } from "@/config/tokens";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/hooks/useTranslation";

/** Option button within a settings section, with label and optional check icon. */
const SettingsOptionButton: React.FC<{
  dataValue: string;
  onClick: (_e: React.MouseEvent<HTMLButtonElement>) => void;
  isSelected: boolean;
  children: React.ReactNode;
}> = ({ dataValue, onClick, isSelected, children }) => (
  <button
    data-value={dataValue}
    onClick={onClick}
    aria-pressed={isSelected}
    className={cn(
      "flex items-center justify-between px-3 py-2 text-sm rounded-md",
      isSelected
        ? "bg-emerald-50 text-emerald-700"
        : "text-gray-700 hover:bg-gray-50",
    )}
  >
    {children}
    {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
  </button>
);

/** Section within the settings dropdown with icon, title, and a grid of options. */
const SettingsSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  hasBorder?: boolean;
}> = ({ icon, title, children, hasBorder = true }) => (
  <div className={`py-3 px-4 ${hasBorder ? 'border-b border-gray-100' : ''}`}>
    <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700">
      {icon}
      {title}
    </h4>
    <div className="grid grid-cols-2 gap-2 mt-2">
      {children}
    </div>
  </div>
);

/**
 * SettingsMenu component renders a dropdown menu for user settings including language, currency, and theme options.
 * @returns JSX.Element The rendered settings menu component.
 */
export const SettingsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    theme,
    setTheme,
    languageOptions,
    currencyOptions,
  } = useSettings();
  const { setSelectedCurrency } = useCurrencyContext();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus first option when dropdown opens (WCAG 2.4.3)
  useEffect(() => {
    if (!isOpen) return;
    const firstButton = panelRef.current?.querySelector<HTMLButtonElement>("button");
    firstButton?.focus();
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    /**
     * Handler to close the settings menu when clicking outside of it.
     * @param event MouseEvent The mouse event triggered on the document.
     */
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
    /**
     * Handles the Escape key press event to close the settings menu and return focus to the trigger button.
     * @param event KeyboardEvent triggered by the key press.
     */
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerButtonRef.current?.focus();
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
      // Also update the CurrencyContext so the donate card updates
      const fiatCurrency = getCurrencyByCode(newCurrency);
      if (fiatCurrency) {
        setSelectedCurrency(fiatCurrency);
      }
    },
    [setCurrency, setSelectedCurrency],
  );

  const handleThemeChange = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
    },
    [setTheme],
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

  const handleThemeClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const value = e.currentTarget.dataset.value as Theme;
      console.log("Theme button clicked, value:", value);
      if (value) {
        handleThemeChange(value);
      }
    },
    [handleThemeChange],
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerButtonRef}
        onClick={toggleMenu}
        className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2 px-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">
              {t("settings.title")}
            </h3>
          </div>

          {/* Theme Selection */}
          <SettingsSection
            icon={theme === "dark" ? <Moon className="h-4 w-4 text-gray-500 mr-2" /> : <Sun className="h-4 w-4 text-gray-500 mr-2" />}
            title={t("settings.theme", "Theme")}
          >
            <SettingsOptionButton dataValue="light" onClick={handleThemeClick} isSelected={theme === "light"}>
              <span className="flex items-center">
                <Sun className="h-4 w-4 mr-2" />
                {t("settings.light", "Light")}
              </span>
            </SettingsOptionButton>
            <SettingsOptionButton dataValue="dark" onClick={handleThemeClick} isSelected={theme === "dark"}>
              <span className="flex items-center">
                <Moon className="h-4 w-4 mr-2" />
                {t("settings.dark", "Dark")}
              </span>
            </SettingsOptionButton>
          </SettingsSection>

          {/* Language Selection */}
          <SettingsSection icon={<Globe className="h-4 w-4 text-gray-500 mr-2" />} title={t("settings.language")}>
            {languageOptions.map((option) => (
              <SettingsOptionButton key={option.value} dataValue={option.value} onClick={handleLanguageClick} isSelected={language === option.value}>
                <span>{option.label}</span>
              </SettingsOptionButton>
            ))}
          </SettingsSection>

          {/* Currency Selection */}
          <SettingsSection icon={<DollarSign className="h-4 w-4 text-gray-500 mr-2" />} title={t("settings.currency")} hasBorder={false}>
            {currencyOptions.map((option) => (
              <SettingsOptionButton key={option.value} dataValue={option.value} onClick={handleCurrencyClick} isSelected={currency === option.value}>
                <span>{option.symbol} {option.value}</span>
              </SettingsOptionButton>
            ))}
          </SettingsSection>
        </div>
      )}
    </div>
  );
};
