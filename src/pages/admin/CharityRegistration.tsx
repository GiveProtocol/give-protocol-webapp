import React from "react";
import { RegisterCharityForm } from "@/components/admin/RegisterCharityForm";
import { AddCharityToDistributionForm } from "@/components/admin/AddCharityToDistributionForm";
import { AddTokenToDistributionForm } from "@/components/admin/AddTokenToDistributionForm";

/**
 * Admin page for registering charities in the donation contract
 * @component CharityRegistration
 */
const CharityRegistration: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Charity & Token Management
        </h1>
        <p className="mt-2 text-gray-600">
          Register charities and configure tokens for the donation contracts
        </p>
      </div>

      <div className="space-y-8">
        <RegisterCharityForm />

        <AddCharityToDistributionForm />

        <AddTokenToDistributionForm />
      </div>

      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          Important Notes
        </h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800">
          <li>
            Only the contract owner can register charities and set token prices
          </li>
          <li>
            For scheduled donations to work, you must: (1) Add charity to
            distribution contract, (2) Set token price in distribution contract
          </li>
          <li>Register in the donation contract for one-time donations</li>
          <li>
            Add to the distribution contract for scheduled monthly donations
          </li>
          <li>
            Set token prices in the distribution contract to enable tokens for
            scheduled donations
          </li>
          <li>Update token prices regularly to reflect market conditions</li>
          <li>
            On mainnet, this will be part of the charity onboarding process
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CharityRegistration;
