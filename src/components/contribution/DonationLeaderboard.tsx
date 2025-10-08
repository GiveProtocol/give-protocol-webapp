import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Search } from "lucide-react";
import { formatCurrency } from "@/utils/money";
import { LeaderboardEntry } from "@/types/contribution";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FixedSizeList } from "react-window";
import { useWalletAlias } from "@/hooks/useWalletAlias";

const fetchLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  // Simulated API call
  // skipcq: SCT-A000 - These are placeholder test Ethereum addresses for mock data, not real secrets
  return [
    {
      id: "1",
      alias: "Anonymous Hero",
      walletAddress: "0x1234567890123456789012345678901234567890",
      totalDonated: 50000,
      rank: 1,
    },
    {
      id: "2",
      alias: "Giving Soul",
      walletAddress: "0x2345678901234567890123456789012345678901",
      totalDonated: 35000,
      rank: 2,
    },
    {
      id: "3",
      alias: "Kind Heart",
      walletAddress: "0x3456789012345678901234567890123456789012",
      totalDonated: 25000,
      rank: 3,
    },
    {
      id: "4",
      alias: "Hope Giver",
      walletAddress: "0x4567890123456789012345678901234567890123",
      totalDonated: 15000,
      rank: 4,
    },
    {
      id: "5",
      alias: "Change Maker",
      walletAddress: "0x5678901234567890123456789012345678901234",
      totalDonated: 10000,
      rank: 5,
    },
  ];
};

const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return "bg-yellow-500";
    case 2:
      return "bg-gray-400";
    case 3:
      return "bg-amber-600";
    default:
      return "bg-gray-300";
  }
};

interface LeaderboardRowProps {
  index: number;
  style: React.CSSProperties;
  data: LeaderboardEntry[];
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  index,
  style,
  data,
}) => {
  const entry = data[index];
  if (!entry) return null;

  return (
    <div
      style={style}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2"
    >
      <div className="flex items-center space-x-4">
        {entry.rank <= 3 ? (
          <div className={`p-2 rounded-full ${getRankColor(entry.rank)}`}>
            <Trophy className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
        ) : (
          <div className="w-9 h-9 flex items-center justify-center">
            <span className="text-gray-500 font-medium">{entry.rank}</span>
          </div>
        )}
        <span className="font-medium text-gray-900">{entry.displayName}</span>
      </div>
      <span className="text-gray-900 font-semibold">
        {formatCurrency(entry.totalDonated)}
      </span>
    </div>
  );
};

export const DonationLeaderboard: React.FC = () => {
  const {
    data: leaderboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["donationLeaderboard"],
    queryFn: fetchLeaderboardData,
  });
  const { getAliasForAddress } = useWalletAlias();
  const [searchTerm, setSearchTerm] = useState("");
  const [displayLeaderboard, setDisplayLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);

  // Update display names with aliases when available
  useEffect(() => {
    if (!leaderboard) return;

    const updateAliases = async () => {
      const updatedLeaderboard = await Promise.all(
        leaderboard.map(async (entry) => {
          const alias = await getAliasForAddress(entry.walletAddress);
          return {
            ...entry,
            displayName: alias || entry.alias,
          };
        }),
      );
      setDisplayLeaderboard(updatedLeaderboard);
    };

    updateAliases();
  }, [leaderboard, getAliasForAddress]);

  // Filter leaderboard based on search term
  const filteredLeaderboard = useMemo(() => {
    if (!displayLeaderboard) return [];

    return displayLeaderboard.filter((entry) =>
      entry.displayName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [displayLeaderboard, searchTerm]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Failed to load leaderboard data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search contributors..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <div className="h-[400px]">
        {filteredLeaderboard.length > 0 ? (
          <FixedSizeList
            height={400}
            width="100%"
            itemCount={filteredLeaderboard.length}
            itemSize={70}
            itemData={filteredLeaderboard}
          >
            {LeaderboardRow}
          </FixedSizeList>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p className="text-gray-500">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
};
