import React, { useState, useCallback } from "react";
import { CheckCircle, Search } from "lucide-react";
import { CharityGrid } from "../components/charity/CharityGrid";
import { PortfolioGrid } from "../components/charity/PortfolioGrid";
import { CauseGrid } from "../components/charity/CauseGrid";
import { Button } from "../components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { US_STATES } from "@/constants/usStates";

type ViewMode = "charities" | "causes" | "portfolios";

/** Search input with magnifying glass icon. */
function SearchInput({ value, onChange, placeholder, ariaLabel }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={onChange}
      />
      <Search aria-hidden="true" className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );
}

/** Filter bar with search input and state selector. */
function CharityFilterBar({ searchTerm, selectedState, onSearchChange, onStateChange }: {
  searchTerm: string;
  selectedState: string;
  onSearchChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  onStateChange: (_e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-4">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search charities..."
        ariaLabel="Search charities"
      />
      <select
        value={selectedState}
        onChange={onStateChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        aria-label="Select state"
      >
        <option value="">All States</option>
        {US_STATES.map((state) => (
          <option key={state.code} value={state.code}>
            {state.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Page component for browsing and filtering charities, causes, and portfolio funds. */
const CharityBrowser: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("charities");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [onPlatformOnly, setOnPlatformOnly] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedState(e.target.value);
    },
    [],
  );

  const handleCharitiesClick = useCallback(() => {
    setViewMode("charities");
  }, []);

  const handleCausesClick = useCallback(() => {
    setViewMode("causes");
  }, []);

  const handlePortfoliosClick = useCallback(() => {
    setViewMode("portfolios");
  }, []);

  const handleOnPlatformChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setOnPlatformOnly(e.target.checked);
    },
    [],
  );

  /** Renders the appropriate grid component based on the selected view mode. */
  const renderContent = () => {
    switch (viewMode) {
      case "causes":
        return (
          <CauseGrid searchTerm={searchTerm} category="" />
        );
      case "portfolios":
        return (
          <PortfolioGrid searchTerm={searchTerm} category="" />
        );
      case "charities":
      default:
        return (
          <CharityGrid
            searchTerm={searchTerm}
            filterState={selectedState}
            onPlatformOnly={onPlatformOnly}
          />
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">
        Discover Impact Opportunities
      </h1>

      <ScrollReveal direction="up" delay={100}>
        <div className="flex space-x-4 mb-6">
        <Button
          variant={viewMode === "charities" ? "primary" : "secondary"}
          onClick={handleCharitiesClick}
        >
          Charities
        </Button>
        <Button
          variant={viewMode === "causes" ? "primary" : "secondary"}
          onClick={handleCausesClick}
        >
          Causes
        </Button>
        <Button
          variant={viewMode === "portfolios" ? "primary" : "secondary"}
          onClick={handlePortfoliosClick}
        >
          Portfolio Funds
        </Button>
      </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={200}>
        <CharityFilterBar
          searchTerm={searchTerm}
          selectedState={selectedState}
          onSearchChange={handleSearchChange}
          onStateChange={handleStateChange}
        />
      </ScrollReveal>

      {viewMode === "charities" && (
        <ScrollReveal direction="up" delay={300}>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="onPlatform"
            checked={onPlatformOnly}
            onChange={handleOnPlatformChange}
            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
          />
          <label
            htmlFor="onPlatform"
            className="text-sm text-gray-700 flex items-center"
          >
            <CheckCircle aria-hidden="true" className="h-4 w-4 mr-1 text-indigo-600" />
            On Platform Only
          </label>
        </div>
        </ScrollReveal>
      )}

      <ScrollReveal direction="up" delay={400}>
        {renderContent()}
      </ScrollReveal>
    </div>
  );
};

export default CharityBrowser;
