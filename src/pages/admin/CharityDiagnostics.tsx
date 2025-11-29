import React, { useState, useCallback } from "react";
import { useCharityInfo } from "@/hooks/web3/useCharityInfo";
import { useAcceptedTokens } from "@/hooks/web3/useAcceptedTokens";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/Button";
import { ZeroAddress, formatEther } from "ethers";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

/**
 * Diagnostic page for checking charity registration and token acceptance status
 */
const CharityDiagnostics: React.FC = () => {
  const [charityAddress, setCharityAddress] = useState(
    "0x537f232A75F59F3CAbeBf851E0810Fc95F42aa75",
  );
  const [tokenAddress, setTokenAddress] = useState(ZeroAddress);
  const { isConnected, connect } = useWeb3();
  const { charityInfo, isLoading, error } = useCharityInfo(
    charityAddress,
    tokenAddress,
  );
  const {
    isAccepted,
    isLoading: isLoadingToken,
    error: tokenError,
  } = useAcceptedTokens(tokenAddress);

  const handleCharityAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharityAddress(e.target.value);
    },
    [],
  );

  const handleTokenAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTokenAddress(e.target.value);
    },
    [],
  );

  const handleUseNativeToken = useCallback(() => {
    setTokenAddress(ZeroAddress);
  }, []);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Charity Diagnostics
          </h2>
          <p className="mb-4 text-gray-600">
            Connect your wallet to check charity status
          </p>
          <Button onClick={connect}>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Charity Diagnostics
        </h1>
        <p className="mt-2 text-gray-600">
          Check charity registration and balance information
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl space-y-6">
        <div>
          <label
            htmlFor="charity-address"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Charity Address
          </label>
          <input
            id="charity-address"
            type="text"
            value={charityAddress}
            onChange={handleCharityAddressChange}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="token-address"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Token Address (use {ZeroAddress} for native DEV)
          </label>
          <input
            id="token-address"
            type="text"
            value={tokenAddress}
            onChange={handleTokenAddressChange}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200"
          />
          <button
            type="button"
            onClick={handleUseNativeToken}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Use native token (DEV)
          </button>
        </div>

        {(error || tokenError) && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {error?.message || tokenError?.message}
            </p>
          </div>
        )}

        {(isLoading || isLoadingToken) && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
            <p className="text-sm font-medium">Loading information...</p>
          </div>
        )}

        {charityInfo && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Charity Registration
                </span>
                <div className="flex items-center gap-2">
                  {charityInfo.isRegistered ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        Registered
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">
                        Not Registered
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Token Acceptance
                </span>
                <div className="flex items-center gap-2">
                  {isAccepted === null ? (
                    <span className="text-sm text-gray-500">Unknown</span>
                  ) : isAccepted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        Accepted
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">
                        Not Accepted
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Wallet Address
                </span>
                <code className="text-xs bg-white px-2 py-1 rounded border">
                  {charityInfo.walletAddress}
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total Received
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatEther(charityInfo.totalReceived)} DEV
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Available Balance
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatEther(charityInfo.availableBalance)} DEV
                </span>
              </div>
            </div>

            {!charityInfo.isRegistered && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                  Action Required: Register Charity
                </h4>
                <p className="text-sm text-yellow-800">
                  This charity is not registered. Visit the{" "}
                  <a
                    href="/admin/charity-registration"
                    className="font-semibold underline hover:text-yellow-900"
                  >
                    Charity Registration
                  </a>{" "}
                  page to register it.
                </p>
              </div>
            )}

            {isAccepted === false && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="text-sm font-semibold text-red-900 mb-2">
                  ⚠️ Token Not Accepted - This is Why Donations Fail!
                </h4>
                <p className="text-sm text-red-800 mb-2">
                  The token at{" "}
                  <code className="bg-white px-1 rounded">{tokenAddress}</code>{" "}
                  is not in the contract&apos;s accepted tokens list. This is
                  causing the &quot;require(false)&quot; error.
                </p>
                <p className="text-sm text-red-800 font-semibold">
                  Solution: The contract owner needs to call{" "}
                  <code className="bg-white px-1 rounded">
                    addAcceptedToken({tokenAddress})
                  </code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharityDiagnostics;
