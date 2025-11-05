import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DonationLeaderboard } from "@/components/contribution/DonationLeaderboard";
import { VolunteerLeaderboard } from "@/components/contribution/VolunteerLeaderboard";
import { GlobalStats } from "@/components/contribution/GlobalStats";
import { RegionFilter } from "@/components/contribution/RegionFilter";
import { TimeRangeFilter } from "@/components/contribution/TimeRangeFilter";
import { useWalletAlias } from "@/hooks/useWalletAlias";
import { useWeb3 } from "@/contexts/Web3Context";
import { useToast } from "@/contexts/ToastContext";
import { Logger } from "@/utils/logger";
import {
  exportLeaderboardToPDF,
  exportDonationLeaderboardToCSV,
  exportVolunteerLeaderboardToCSV,
  DonationLeaderData,
  VolunteerLeaderData,
} from "@/utils/leaderboardExport";

type TimeRange = "all" | "year" | "month" | "week";
type Region = "all" | "na" | "eu" | "asia" | "africa" | "sa" | "oceania";

export const ContributionTracker: React.FC = () => {
  const location = useLocation();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [region, setRegion] = useState<Region>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOptOut, setShowOptOut] = useState(false);
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const { alias, setWalletAlias } = useWalletAlias();
  const { isConnected, address } = useWeb3();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"donations" | "volunteer">(
    (location.state?.activeTab as "donations" | "volunteer") || "donations",
  );

  // Refs to access leaderboard components for export
  const donationLeaderboardRef = useRef<HTMLDivElement>(null);
  const volunteerLeaderboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleExport = useCallback(
    async (format: "csv" | "pdf") => {
      try {
        Logger.info(`Exporting contributions as ${format}`, { format });

        const exportOptions = {
          timeRange,
          region,
          includeTimestamp: true,
        };

        if (format === "csv") {
          // For CSV, we need to get mock data since the components use mock data
          // In a real implementation, we'd extract data from the components or API
          if (activeTab === "donations") {
            // Mock donation leaderboard data for export
            const donationData: DonationLeaderData[] = [
              {
                rank: 1,
                displayName: "Anonymous Hero",
                totalDonated: 50000,
                alias: "Anonymous Hero",
              },
              {
                rank: 2,
                displayName: "Giving Soul",
                totalDonated: 35000,
                alias: "Giving Soul",
              },
              {
                rank: 3,
                displayName: "Kind Heart",
                totalDonated: 25000,
                alias: "Kind Heart",
              },
              {
                rank: 4,
                displayName: "Hope Giver",
                totalDonated: 15000,
                alias: "Hope Giver",
              },
              {
                rank: 5,
                displayName: "Change Maker",
                totalDonated: 10000,
                alias: "Change Maker",
              },
            ];
            exportDonationLeaderboardToCSV(donationData, exportOptions);
            showToast(
              "success",
              "Export Complete",
              "Donation leaderboard exported as CSV",
            );
          } else {
            // Mock volunteer leaderboard data for export
            const volunteerData: VolunteerLeaderData[] = [
              {
                rank: 1,
                displayName: "Community Builder",
                hours: 120,
                endorsements: 45,
                skills: [
                  "Web Development",
                  "Project Management",
                  "Community Building",
                ],
                alias: "Community Builder",
              },
              {
                rank: 2,
                displayName: "Helping Hand",
                hours: 95,
                endorsements: 38,
                skills: ["Event Planning", "Fundraising", "Social Media"],
                alias: "Helping Hand",
              },
              {
                rank: 3,
                displayName: "Skill Sharer",
                hours: 85,
                endorsements: 32,
                skills: ["Web Development", "Teaching", "Mentoring"],
                alias: "Skill Sharer",
              },
            ];
            exportVolunteerLeaderboardToCSV(volunteerData, exportOptions);
            showToast(
              "success",
              "Export Complete",
              "Volunteer leaderboard exported as CSV",
            );
          }
        } else if (format === "pdf") {
          // For PDF, capture the visible leaderboard elements
          const donationElement =
            activeTab === "donations" ? donationLeaderboardRef.current : null;
          const volunteerElement =
            activeTab === "volunteer" ? volunteerLeaderboardRef.current : null;

          if (donationElement || volunteerElement) {
            await exportLeaderboardToPDF(
              donationElement,
              volunteerElement,
              exportOptions,
            );
            showToast(
              "success",
              "Export Complete",
              "Leaderboard exported as PDF",
            );
          } else {
            showToast("error", "Export Failed", "No data available to export");
          }
        }
      } catch (error) {
        Logger.error("Export failed", { error, format });
        showToast(
          "error",
          "Export Failed",
          "An error occurred while exporting data",
        );
      }
    },
    [timeRange, region, activeTab, showToast],
  );

  const handleExportCsv = useCallback(
    () => handleExport("csv"),
    [handleExport],
  );
  const handleExportPdf = useCallback(
    () => handleExport("pdf"),
    [handleExport],
  );
  const handleShowAliasModal = useCallback(() => setShowAliasModal(true), []);
  const handleHideAliasModal = useCallback(() => setShowAliasModal(false), []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "donations" | "volunteer");
  }, []);
  const handleChangeAlias = useCallback(() => {
    setNewAlias(alias);
    setShowAliasModal(true);
  }, [alias]);

  const handleSetAlias = useCallback(async () => {
    if (!isConnected || !address) {
      showToast(
        "error",
        "Wallet not connected",
        "Please connect your wallet to set an alias",
      );
      return;
    }

    if (!newAlias.trim()) {
      showToast("error", "Invalid alias", "Please enter a valid alias");
      return;
    }

    const success = await setWalletAlias(newAlias);
    if (success) {
      setNewAlias("");
      setShowAliasModal(false);
    }
  }, [isConnected, address, newAlias, showToast, setWalletAlias]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleNewAliasChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewAlias(e.target.value);
    },
    [],
  );

  const handleOptOutChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShowOptOut(e.target.checked);
    },
    [],
  );

  const handleTimeRangeChange = useCallback((value: TimeRange) => {
    setTimeRange(value);
  }, []);

  const handleRegionChange = useCallback((value: Region) => {
    setRegion(value);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Global Impact Rankings
        </h1>
        <p className="mt-2 text-gray-600">
          Track and celebrate the collective impact of our community
        </p>
      </div>

      {/* Global Stats */}
      <GlobalStats />

      {/* Filters */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search contributors..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={handleExportCsv}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportPdf}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center space-x-4">
            <RegionFilter value={region} onChange={handleRegionChange} />

            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showOptOut}
                onChange={handleOptOutChange}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Hide my contributions from rankings</span>
            </label>
          </div>

          {isConnected && alias ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Your alias:{" "}
                <span className="font-medium text-indigo-600">{alias}</span>
              </span>
              <Button variant="secondary" size="sm" onClick={handleChangeAlias}>
                Change
              </Button>
            </div>
          ) : isConnected ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShowAliasModal}
            >
              Set Wallet Alias
            </Button>
          ) : null}
        </div>
      </div>

      {/* Alias Modal */}
      {showAliasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Set Wallet Alias
            </h2>

            <p className="text-gray-600">
              Your alias will be displayed on the contribution tracker instead
              of your wallet address.
            </p>

            <div>
              <label
                htmlFor="alias-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Alias
              </label>
              <input
                id="alias-input"
                type="text"
                value={newAlias}
                onChange={handleNewAliasChange}
                placeholder="Enter your preferred alias"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <footer className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={handleHideAliasModal}>
                Cancel
              </Button>
              <Button onClick={handleSetAlias}>Save Alias</Button>
            </footer>
          </div>
        </div>
      )}

      {/* Rankings Tabs */}
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="donations">Donation Rankings</TabsTrigger>
          <TabsTrigger value="volunteer">Volunteer Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <Card className="p-6">
            <div ref={donationLeaderboardRef}>
              <DonationLeaderboard
                timeRange={timeRange}
                region={region}
                searchTerm={searchTerm}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="volunteer">
          <Card className="p-6">
            <div ref={volunteerLeaderboardRef}>
              <VolunteerLeaderboard
                timeRange={timeRange}
                region={region}
                searchTerm={searchTerm}
                highlightSkill={location.state?.skill}
                section={location.state?.section}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContributionTracker;
