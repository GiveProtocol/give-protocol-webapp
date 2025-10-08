import React from "react";
import { Shield, Users, Vote, Scale, Clock, AlertTriangle } from "lucide-react";

export const Governance: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
        Protocol Governance
      </h1>
      <p className="text-xl text-gray-600 text-center mb-12">
        Empowering our community through transparent and decentralized
        decision-making
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Vote className="h-6 w-6 text-indigo-600 mr-2" />
            Voting Power
          </h3>
          <p className="text-gray-600 mb-4">
            Voting power is earned through active participation:
          </p>
          <p className="flex items-center mb-2 text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            Donations contribute to base voting power
          </p>
          <p className="flex items-center mb-2 text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            Volunteer hours add additional weight
          </p>
          <p className="flex items-center text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            Verified organizations receive multipliers
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="h-6 w-6 text-indigo-600 mr-2" />
            Proposal Thresholds
          </h3>
          <p className="text-gray-600 mb-4">Core protocol changes require:</p>
          <p className="flex items-center mb-2 text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            66% supermajority approval
          </p>
          <p className="flex items-center mb-2 text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            50% minimum participation
          </p>
          <p className="flex items-center text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            48-hour voting period
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="h-6 w-6 text-indigo-600 mr-2" />
            Council Oversight
          </h3>
          <p className="text-gray-600 mb-4">
            A multi-signature council provides:
          </p>
          <p className="flex items-center mb-2 text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            Emergency response capabilities
          </p>
          <p className="flex items-center mb-2 text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            4/7 signatures for critical actions
          </p>
          <p className="flex items-center text-gray-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 flex-shrink-0" />{" "}
            24-hour maximum timelock
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Scale className="h-8 w-8 text-indigo-600 mr-3" />
            Proposal Process
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Creation</h4>
              <p className="text-gray-600">
                Any account with minimum voting power can submit detailed
                proposals with implementation plans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                2. Discussion
              </h4>
              <p className="text-gray-600">
                7-day minimum discussion period for community feedback and
                refinement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Voting</h4>
              <p className="text-gray-600">
                48-hour voting period with weighted voting based on
                participation metrics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Execution</h4>
              <p className="text-gray-600">
                Successful proposals are implemented after meeting all required
                thresholds.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Clock className="h-8 w-8 text-indigo-600 mr-3" />
            Timeframes & Delays
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Standard Changes
              </h4>
              <div className="text-gray-600 mb-2">
                • 7 days discussion period
              </div>
              <div className="text-gray-600 mb-2">• 48 hours voting period</div>
              <div className="text-gray-600">
                • 24 hours timelock before execution
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Emergency Actions
              </h4>
              <div className="text-gray-600 mb-2">
                • No discussion period required
              </div>
              <div className="text-gray-600 mb-2">
                • 4/7 council signatures needed
              </div>
              <div className="text-gray-600">• 24 hours maximum timelock</div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-8 rounded-lg flex items-start">
          <AlertTriangle className="h-6 w-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Important Notice
            </h3>
            <p className="text-indigo-700">
              All governance participants are required to review and understand
              the complete governance documentation before participating in
              proposals or voting. This ensures informed decision-making and
              maintains the integrity of our governance process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;
