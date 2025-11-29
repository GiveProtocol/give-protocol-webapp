import React, { useState, useCallback } from "react";
import { useContract } from "@/hooks/web3/useContract";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/Button";
import { ZeroAddress, getAddress, isAddress } from "ethers";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

/**
 * Simple diagnostic page to check contract state directly
 */
const SimpleTokenCheck: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState(ZeroAddress);
  const [result, setResult] = useState<{
    isAccepted?: boolean;
    error?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const { contract } = useContract("donation");
  const { isConnected, connect, address } = useWeb3();

  const checkToken = useCallback(async () => {
    if (!contract) {
      setResult({ error: "Contract not connected" });
      return;
    }

    try {
      setLoading(true);
      setResult({});

      if (!isAddress(tokenAddress)) {
        throw new Error("Invalid token address");
      }

      const normalized = getAddress(tokenAddress);

      // Direct call to acceptedTokens mapping
      const acceptedTokensFunction = contract.getFunction("acceptedTokens");
      const isAccepted = await acceptedTokensFunction(normalized);

      setResult({ isAccepted });
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : "Failed to check token",
      });
    } finally {
      setLoading(false);
    }
  }, [contract, tokenAddress]);

  const checkOwner = useCallback(async () => {
    if (!contract) {
      setResult({ error: "Contract not connected" });
      return;
    }

    try {
      setLoading(true);
      setResult({});

      const ownerFunction = contract.getFunction("owner");
      const owner = await ownerFunction();

      setResult({
        error: `Contract owner: ${owner}\nYour address: ${address}\nMatch: ${owner.toLowerCase() === address?.toLowerCase()}`,
      });
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : "Failed to check owner",
      });
    } finally {
      setLoading(false);
    }
  }, [contract, address]);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Simple Contract Check
          </h1>
          <p className="mb-4 text-gray-600">
            Connect your wallet to check contract state
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
          Simple Contract Check
        </h1>
        <p className="mt-2 text-gray-600">Direct contract state inspection</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Address
          </label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => setTokenAddress(ZeroAddress)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Use zero address (native token)
          </button>
        </div>

        <div className="flex gap-3">
          <Button onClick={checkToken} disabled={loading} fullWidth>
            {loading ? "Checking..." : "Check if Token Accepted"}
          </Button>
          <Button
            onClick={checkOwner}
            disabled={loading}
            variant="secondary"
            fullWidth
          >
            Check Owner
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm font-medium">Checking...</p>
          </div>
        )}

        {result.error && (
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <p className="text-sm font-mono whitespace-pre-wrap">
              {result.error}
            </p>
          </div>
        )}

        {result.isAccepted !== undefined && (
          <div
            className={`flex items-center gap-2 p-4 border-2 rounded-xl ${
              result.isAccepted
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {result.isAccepted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-medium">✅ Token IS accepted</p>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">
                    ❌ Token is NOT accepted
                  </p>
                  <p className="text-sm mt-1">
                    You need to call addAcceptedToken({tokenAddress})
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            Contract Address
          </h3>
          <code className="block p-2 bg-white rounded text-xs break-all border">
            {contract?.target || "Not loaded"}
          </code>
        </div>
      </div>
    </div>
  );
};

export default SimpleTokenCheck;
