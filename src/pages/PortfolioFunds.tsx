import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  usePortfolioFunds,
  PortfolioFund,
} from "../hooks/web3/usePortfolioFunds";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "../hooks/useTranslation";
import { Heart, Users, TrendingUp, Clock, AlertCircle } from "lucide-react";

interface DonationModalProps {
  fund: PortfolioFund;
  onClose: () => void;
  onSuccess: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({
  fund,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState<"native" | "token">(
    "native",
  );
  const { donateToFund, donateNativeToFund, loading, getPlatformFee } =
    usePortfolioFunds();
  const { showToast } = useToast();
  const [platformFee, setPlatformFee] = useState(100); // 1% default

  useEffect(() => {
    const loadPlatformFee = async () => {
      const fee = await getPlatformFee();
      setPlatformFee(fee);
    };
    loadPlatformFee();
  }, [getPlatformFee]);

  const handleDonation = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast("error", "Please enter a valid amount");
      return;
    }

    try {
      if (donationType === "native") {
        await donateNativeToFund(fund.id, amount);
      } else {
        // For token donations, you would need the token contract address
        // This is a placeholder - replace with actual token address
        const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your MockERC20
        await donateToFund(fund.id, tokenAddress, amount);
      }

      showToast("success", "Donation successful!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Donation failed:", error);
      showToast("error", "Donation failed. Please try again.");
    }
  }, [
    amount,
    donationType,
    fund.id,
    donateToFund,
    donateNativeToFund,
    showToast,
    onSuccess,
    onClose,
  ]);

  const calculateFee = () => {
    if (!amount) return { fee: "0", net: "0" };
    const donationAmount = parseFloat(amount);
    const feeAmount = (donationAmount * platformFee) / 10000;
    const netAmount = donationAmount - feeAmount;
    return {
      fee: feeAmount.toFixed(6),
      net: netAmount.toFixed(6),
    };
  };

  const { fee, net } = calculateFee();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  const handleSetDonationTypeNative = useCallback(() => {
    setDonationType("native");
  }, []);

  const handleSetDonationTypeToken = useCallback(() => {
    setDonationType("token");
  }, []);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [],
  );

  return (
    <>
      <button
        className="fixed inset-0 bg-black bg-opacity-50 z-50 cursor-pointer border-none p-0 m-0"
        onClick={onClose}
        onKeyDown={handleKeyDown}
        aria-label="Close modal overlay"
        type="button"
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl max-w-md w-[95%] z-50 p-6">
        <h2 className="text-2xl font-bold mb-4">Donate to {fund.name}</h2>

        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-4">{fund.description}</p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Equal Distribution:</strong> Your donation will be split
              equally among {fund.charities.length} verified charities.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Donation Type
            </legend>
            <div className="flex gap-2" role="radiogroup">
              <label
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium cursor-pointer text-center ${
                  donationType === "native"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="donationType"
                  value="native"
                  checked={donationType === "native"}
                  onChange={handleSetDonationTypeNative}
                  className="sr-only"
                />
                DEV (Native)
              </label>
              <label
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium cursor-pointer text-center ${
                  donationType === "token"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="donationType"
                  value="token"
                  checked={donationType === "token"}
                  onChange={handleSetDonationTypeToken}
                  className="sr-only"
                />
                TEST Token
              </label>
            </div>
          </fieldset>
        </div>

        <div className="mb-4">
          <label
            htmlFor="donation-amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Amount ({donationType === "native" ? "DEV" : "TEST"})
          </label>
          <input
            id="donation-amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.0"
            step="0.001"
            min="0"
          />
        </div>

        {amount && (
          <div className="mb-4 bg-gray-50 p-3 rounded-md text-sm">
            <div className="flex justify-between">
              <span>Donation Amount:</span>
              <span>
                {amount} {donationType === "native" ? "DEV" : "TEST"}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee ({platformFee / 100}%):</span>
              <span>
                {fee} {donationType === "native" ? "DEV" : "TEST"}
              </span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1">
              <span>To Charities:</span>
              <span>
                {net} {donationType === "native" ? "DEV" : "TEST"}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Each charity receives:{" "}
              {(parseFloat(net) / fund.charities.length).toFixed(6)}{" "}
              {donationType === "native" ? "DEV" : "TEST"}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDonation}
            className="flex-1"
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? "Processing..." : "Donate"}
          </Button>
        </div>
      </div>
    </>
  );
};

const PortfolioFunds: React.FC = () => {
  const [funds, setFunds] = useState<PortfolioFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFund, setSelectedFund] = useState<PortfolioFund | null>(null);
  const { getAllFunds } = usePortfolioFunds();
  const { t } = useTranslation();

  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const allFunds = await getAllFunds();
      setFunds(allFunds);
    } catch (error) {
      console.error("Failed to load funds:", error);
    } finally {
      setLoading(false);
    }
  }, [getAllFunds]);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  const handleDonateClick = useCallback((fund: PortfolioFund) => {
    setSelectedFund(fund);
  }, []);

  const handleDonationSuccess = useCallback(() => {
    loadFunds(); // Refresh funds after successful donation
  }, [loadFunds]);

  const createDonateHandler = useCallback(
    (fund: PortfolioFund) => {
      return () => handleDonateClick(fund);
    },
    [handleDonateClick],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedFund(null);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              key="skeleton-fund-1"
              className="h-64 bg-gray-200 rounded-lg"
            />
            <div
              key="skeleton-fund-2"
              className="h-64 bg-gray-200 rounded-lg"
            />
            <div
              key="skeleton-fund-3"
              className="h-64 bg-gray-200 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t("portfolio.title", "Portfolio Funds")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {t(
              "portfolio.description",
              "Donate to curated groups of verified charities with equal distribution. Each fund focuses on a specific cause area with maximum impact.",
            )}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {funds.map((fund) => (
            <Card
              key={fund.id}
              className="overflow-hidden hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {fund.name}
                </h3>
                <div className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  <Heart className="h-3 w-3 mr-1" />
                  Active
                </div>
              </div>

              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {fund.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {fund.charities.length} Verified Charities
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {fund.totalRaised} Total Raised
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  {fund.totalDistributed} Distributed
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">
                    Equal Distribution
                  </p>
                  <p className="text-blue-700">
                    Each charity receives {100 / fund.charities.length}% of
                    donations
                  </p>
                </div>
              </div>

              <Button
                onClick={createDonateHandler(fund)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Donate to Fund
              </Button>
            </Card>
          ))}
        </div>

        {funds.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No portfolio funds available</p>
            <p className="text-sm">
              Check back later for new funding opportunities
            </p>
          </div>
        )}
      </div>

      {selectedFund && (
        <DonationModal
          fund={selectedFund}
          onClose={handleCloseModal}
          onSuccess={handleDonationSuccess}
        />
      )}
    </div>
  );
};

export default PortfolioFunds;
