import React, { useState, useCallback } from "react";
import { CheckCircle, Search } from "lucide-react";
import { CharityGrid } from "../components/charity/CharityGrid";
import { PortfolioGrid } from "../components/charity/PortfolioGrid";
import { CauseGrid } from "../components/charity/CauseGrid";
import { Button } from "../components/ui/Button";

type ViewMode = "charities" | "causes" | "portfolios";

const CharityBrowser: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("charities");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCategory(e.target.value);
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

  const handleVerifiedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVerifiedOnly(e.target.checked);
    },
    [],
  );

  const renderContent = () => {
    switch (viewMode) {
      case "causes":
        return (
          <CauseGrid searchTerm={searchTerm} category={selectedCategory} />
        );
      case "portfolios":
        return (
          <PortfolioGrid searchTerm={searchTerm} category={selectedCategory} />
        );
      case "charities":
      default:
        // Both "charities" and default show the CharityGrid
        return (
          <CharityGrid
            searchTerm={searchTerm}
            category={selectedCategory}
            verifiedOnly={verifiedOnly}
          />
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Discover Impact Opportunities
      </h1>

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

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search charities..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="Select category"
        >
          <option value="">All Categories</option>
          <option value="Water & Sanitation">Water & Sanitation</option>
          <option value="Education">Education</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Environment">Environment</option>
          <option value="Poverty Relief">Poverty Relief</option>
          <option value="Animal Welfare">Animal Welfare</option>
        </select>
      </div>

      {viewMode === "charities" && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="verified"
            checked={verifiedOnly}
            onChange={handleVerifiedChange}
            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
          />
          <label
            htmlFor="verified"
            className="text-sm text-gray-700 flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-1 text-indigo-600" />
            Verified Charities Only
          </label>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default CharityBrowser;
