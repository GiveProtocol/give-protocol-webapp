import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Clock, Search } from "lucide-react";
import { useWalletAlias } from "@/hooks/useWalletAlias";

interface VolunteerLeader {
  id: string;
  alias: string;
  walletAddress: string;
  hours: number;
  endorsements: number;
  rank: number;
  skills: string[];
}

interface VolunteerLeaderboardProps {
  timeRange: string;
  region: string;
  searchTerm: string;
  highlightSkill?: string;
  section?: "hours" | "endorsements";
}

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

const fetchVolunteerLeaders = async (
  sortBy: "hours" | "endorsements",
): Promise<VolunteerLeader[]> => {
  // Simulated API call
  // skipcq: SCT-A000 - These are placeholder test Ethereum addresses for mock data, not real secrets
  const leaders = [
    {
      id: "1",
      alias: "Community Builder",
      walletAddress: "0x1234567890123456789012345678901234567890",
      hours: 120,
      endorsements: 45,
      rank: 1,
      skills: ["Web Development", "Project Management", "Community Building"],
    },
    {
      id: "2",
      alias: "Helping Hand",
      walletAddress: "0x2345678901234567890123456789012345678901",
      hours: 95,
      endorsements: 38,
      rank: 2,
      skills: ["Event Planning", "Fundraising", "Social Media"],
    },
    {
      id: "3",
      alias: "Skill Sharer",
      walletAddress: "0x3456789012345678901234567890123456789012",
      hours: 85,
      endorsements: 32,
      rank: 3,
      skills: ["Web Development", "Teaching", "Mentoring"],
    },
    {
      id: "4",
      alias: "Time Giver",
      walletAddress: "0x4567890123456789012345678901234567890123",
      hours: 75,
      endorsements: 28,
      rank: 4,
      skills: ["Project Management", "Data Analysis", "Research"],
    },
    {
      id: "5",
      alias: "Impact Maker",
      walletAddress: "0x5678901234567890123456789012345678901234",
      hours: 65,
      endorsements: 25,
      rank: 5,
      skills: ["Event Planning", "Marketing", "Design"],
    },
  ];

  // Sort based on selected metric (create copy to avoid mutation)
  const sortedLeaders = leaders.toSorted((a, b) => {
    const valueA = sortBy === "hours" ? a.hours : a.endorsements;
    const valueB = sortBy === "hours" ? b.hours : b.endorsements;
    return valueB - valueA;
  });

  return sortedLeaders.map((leader, index) => ({ ...leader, rank: index + 1 }));
};

export const VolunteerLeaderboard: React.FC<VolunteerLeaderboardProps> = ({
  timeRange: _timeRange,
  region: _region,
  searchTerm,
  highlightSkill,
  section = "hours",
}) => {
  const [activeTab, setActiveTab] = useState<"hours" | "endorsements">(section);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const { getAliasForAddress } = useWalletAlias();
  const [displayLeaders, setDisplayLeaders] = useState<
    (VolunteerLeader & { displayName: string })[]
  >([]);

  const { data: leaders, isLoading } = useQuery({
    queryKey: ["volunteerLeaders", activeTab],
    queryFn: () => fetchVolunteerLeaders(activeTab),
  });

  // Update display names with aliases when available
  useEffect(() => {
    if (!leaders) return;

    const updateAliases = async () => {
      const updatedLeaders = await Promise.all(
        leaders.map(async (leader) => {
          const alias = await getAliasForAddress(leader.walletAddress);
          return {
            ...leader,
            displayName: alias || leader.alias,
          };
        }),
      );
      setDisplayLeaders(updatedLeaders);
    };

    updateAliases();
  }, [leaders, getAliasForAddress]);

  const handleHoursTabClick = useCallback(() => {
    setActiveTab("hours");
  }, []);

  const handleEndorsementsTabClick = useCallback(() => {
    setActiveTab("endorsements");
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearchTerm(e.target.value);
    },
    [],
  );

  // Filter leaders based on search term
  const filteredLeaders = displayLeaders.filter((leader) => {
    const searchTermToUse = localSearchTerm || searchTerm;
    if (!searchTermToUse) return true;

    return (
      leader.displayName
        .toLowerCase()
        .includes(searchTermToUse.toLowerCase()) ||
      leader.skills.some((skill) =>
        skill.toLowerCase().includes(searchTermToUse.toLowerCase()),
      )
    );
  });

  if (isLoading) return <div>Loading leaderboard&hellip;</div>;

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleHoursTabClick}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeTab === "hours"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Clock className="h-4 w-4 mr-2" />
          Hours
        </button>
        <button
          onClick={handleEndorsementsTabClick}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeTab === "endorsements"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Award className="h-4 w-4 mr-2" />
          Endorsements
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={localSearchTerm}
          onChange={handleSearchChange}
          placeholder="Search volunteers or skills..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {filteredLeaders.length > 0 ? (
        <div className="space-y-3">
          {filteredLeaders.map((leader) => {
            const isHighlighted =
              highlightSkill && leader.skills.includes(highlightSkill);

            return (
              <div
                key={leader.id}
                className={`flex items-center justify-between p-4 ${
                  isHighlighted
                    ? "bg-indigo-50 border-l-4 border-indigo-500"
                    : "bg-gray-50"
                } rounded-lg`}
              >
                <div className="flex items-center space-x-4">
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      leader.rank <= 3
                        ? getRankColor(leader.rank)
                        : "bg-gray-200"
                    } text-white font-semibold`}
                  >
                    {leader.rank}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {leader.displayName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activeTab === "hours"
                        ? `${leader.hours} hrs • ${leader.endorsements} endorsements`
                        : `${leader.endorsements} endorsements • ${leader.hours} hrs`}
                    </p>
                    {isHighlighted && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {leader.skills.map((skill) => (
                          <span
                            key={skill}
                            className={`text-xs px-2 py-1 rounded-full ${
                              skill === highlightSkill
                                ? "bg-indigo-100 text-indigo-800 font-medium"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No results found</p>
        </div>
      )}
    </div>
  );
};
