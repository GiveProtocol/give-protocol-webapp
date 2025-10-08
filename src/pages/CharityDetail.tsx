import React from "react";
import { useParams, Link } from "react-router-dom";
import { DonationButton } from "@/components/web3/donation/DonationButton";
import { ScheduledDonationButton } from "@/components/web3/donation/ScheduledDonationButton";
import { formatCurrency } from "@/utils/money";

interface CharityStats {
  totalDonated: number;
  donorCount: number;
  projectsCompleted: number;
}

const CharityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Sample data - replace with actual API call
  const charity = {
    id,
    name: "Ocean Conservation Alliance",
    description:
      "Protecting marine ecosystems and promoting sustainable ocean practices through innovative conservation programs, research initiatives, and community engagement.",
    category: "Environmental",
    image:
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800",
    verified: true,
    country: "United States",
    stats: {
      totalDonated: 750000,
      donorCount: 1250,
      projectsCompleted: 15,
    } as CharityStats,
    mission:
      "Our mission is to protect and restore ocean ecosystems through science-based conservation actions, policy advocacy, and public education.",
    impact: [
      "Protected over 100,000 acres of marine habitat",
      "Rescued and rehabilitated 500+ marine animals",
      "Removed 50 tons of plastic waste from oceans",
      "Educated 10,000 students about marine conservation",
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative h-80 rounded-xl overflow-hidden mb-6">
        <img
          src={charity.image}
          alt={charity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-8 text-white">
          <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full mb-2 inline-block">Verified</span>
          <span className="ml-3 text-sm opacity-90">{charity.country}</span>
          <h1 className="text-4xl font-bold mb-2 mt-2">{charity.name}</h1>
          <p className="text-lg opacity-90">{charity.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Impact Statistics
            </h2>
            <dl className="grid grid-cols-3 gap-4 text-center">
              <dt className="text-sm text-gray-500">Total Donated
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(charity.stats.totalDonated)}
                </dd>
              </dt>
              <dt className="text-sm text-gray-500">Donors
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {charity.stats.donorCount}
                </dd>
              </dt>
              <dt className="text-sm text-gray-500">Projects
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {charity.stats.projectsCompleted}
                </dd>
              </dt>
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
  );
};

export default CharityDetail;
