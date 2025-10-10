import React from "react";
import { DonationButton } from "@/components/web3/donation/DonationButton";
import { formatCurrency } from "@/utils/money";
import { HeroSection } from "@/components/ui/HeroSection";

const CleanWaterInitiative: React.FC = () => {
  const cause = {
    id: "1",
    name: "Clean Water Initiative",
    description:
      "Providing clean water access to rural communities through sustainable infrastructure and community engagement.",
    targetAmount: 50000,
    raisedAmount: 25000,
    charityId: "1",
    category: "Water & Sanitation",
    image:
      "https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=800",
    impact: [
      "Provided clean water to 10,000+ people",
      "Built 50 sustainable water wells",
      "Trained 100 local water technicians",
      "Reduced waterborne diseases by 60%",
    ],
    timeline: "2024-2025",
    location: "East Africa",
    partners: [
      "Global Water Foundation",
      "Local Community Leaders",
      "Engineering Volunteers",
    ],
  };

  return (
    <>
      <HeroSection
        image={cause.image}
        title={cause.name}
        description={cause.description}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Funding Progress
            </h2>
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Progress</span>
              <span>
                {formatCurrency(cause.raisedAmount)} of{" "}
                {formatCurrency(cause.targetAmount)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{
                  width: `${(cause.raisedAmount / cause.targetAmount) * 100}%`,
                }}
              />
            </div>
            <DonationButton
              charityName={cause.name}
              charityAddress={cause.charityId}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Project Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Timeline</dt>
                <dd className="font-medium mb-3">{cause.timeline}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Location</dt>
                <dd className="font-medium mb-3">{cause.location}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">Key Partners</dt>
                <dd>
                  <ul className="list-disc list-inside space-y-1">
                    {cause.partners.map((partner) => (
                      <li key={partner} className="text-gray-700">
                        {partner}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Impact Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cause.impact.map((item) => (
              <p key={item} className="flex items-start text-gray-700">
                <span className="w-2 h-2 mt-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CleanWaterInitiative;
