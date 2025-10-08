import React from "react";
import { DonationButton } from "@/components/web3/donation/DonationButton";
import { ScheduledDonationButton } from "@/components/web3/donation/ScheduledDonationButton";
import { formatCurrency } from "@/utils/money";
import { Link } from "react-router-dom";
import { CharityHeroSection } from "@/components/ui/CharityHeroSection";

const ClimateActionNow: React.FC = () => {
  const charity = {
    id: "3",
    name: "Climate Action Now",
    description:
      "Fighting climate change globally through renewable energy initiatives, reforestation projects, and sustainable community development.",
    category: "Environment",
    image:
      "https://images.unsplash.com/photo-1498925008800-019c7d59d903?auto=format&fit=crop&w=800",
    country: "United Kingdom",
    stats: {
      totalDonated: 450000,
      donorCount: 780,
      projectsCompleted: 12,
    },
    mission:
      "Our mission is to combat climate change through direct action, education, and sustainable community development.",
    impact: [
      "Planted 1 million trees worldwide",
      "Installed solar panels in 100 communities",
      "Reduced carbon emissions by 50,000 tons",
      "Educated 25,000 people on climate action",
    ],
  };

  return (
    <>
      <CharityHeroSection
        image={charity.image}
        title={charity.name}
        description={charity.description}
        country={charity.country}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Impact Statistics
          </h2>
            <dl className="grid grid-cols-3 gap-4 text-center">
              <div>
                <dt className="text-sm text-gray-500">Total Donated</dt>
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(charity.stats.totalDonated)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Donors</dt>
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {charity.stats.donorCount}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Projects</dt>
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {charity.stats.projectsCompleted}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Giving Options
            </h2>
            <div className="space-y-4">
              <DonationButton
                charityName={charity.name}
                charityAddress={charity.id}
                buttonText="Give Once"
              />
              <ScheduledDonationButton
                charityName={charity.name}
                charityAddress={charity.id}
                buttonText="Give Monthly"
              />
              <Link
                to="/docs/giving-options"
                className="block text-sm text-indigo-600 hover:text-indigo-800 mt-2 text-center"
              >
                Learn about the difference in giving options →
              </Link>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600">{charity.mission}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Impact Highlights
          </h2>
          <ul className="space-y-2">
            {charity.impact.map((item) => (
              <li key={item} className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        </div>
      </div>
    </>
  );
};

export default ClimateActionNow;
