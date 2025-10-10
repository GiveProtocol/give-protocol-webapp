import React from "react";
import { DonationButton } from "@/components/web3/donation/DonationButton";
import { ScheduledDonationButton } from "@/components/web3/donation/ScheduledDonationButton";
import { formatCurrency } from "@/utils/money";
import { Link } from "react-router-dom";
import { CharityHeroSection } from "@/components/ui/CharityHeroSection";

const GlobalWaterFoundation: React.FC = () => {
  const charity = {
    id: "1",
    name: "Global Water Foundation",
    description:
      "Providing clean water solutions worldwide through innovative technology, community engagement, and sustainable infrastructure development.",
    category: "Water & Sanitation",
    image:
      "https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=800",
    verified: true,
    country: "United States",
    stats: {
      totalDonated: 750000,
      donorCount: 1250,
      projectsCompleted: 15,
    },
    mission:
      "Our mission is to ensure universal access to clean water through sustainable solutions and community empowerment.",
    impact: [
      "Provided clean water access to 500,000+ people",
      "Built 1,000+ sustainable water systems",
      "Trained 2,000+ local water technicians",
      "Reduced waterborne diseases by 60% in target areas",
    ],
  };

  return (
    <>
      <CharityHeroSection
        image={charity.image}
        title={charity.name}
        description={charity.description}
        country={charity.country}
        verified={charity.verified}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default GlobalWaterFoundation;
